import {
  app,
  BrowserWindow,
  Menu,
  Tray,
  clipboard,
  dialog,
  globalShortcut,
  ipcMain,
  nativeImage,
  screen,
  shell,
} from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { Store } from './store';
import { decodeShareCode } from '../shared/codes';
import { normalizeSpec } from '../shared/spec';
import { PRESETS } from '../shared/presets';
import type { CrosshairSpec, DisplayInfo, Settings } from '../shared/types';

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);

if (process.platform === 'win32') {
  app.setAppUserModelId('com.crossforge.app');
}

let store: Store;
let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
/** True only while the app is really exiting — closing the window otherwise hides to tray. */
let quitting = false;
let trayHintShown = false;

function appRoot(): string {
  return path.join(__dirname, '..', '..');
}

function preloadPath(): string {
  return path.join(__dirname, 'preload.js');
}

function loadPage(win: BrowserWindow, page: 'index' | 'overlay'): void {
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    void win.loadURL(`${devUrl}${page}.html`);
  } else {
    void win.loadFile(path.join(appRoot(), 'dist', `${page}.html`));
  }
}

/* ------------------------------------------------------------------ windows */

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1340,
    height: 880,
    minWidth: 1080,
    minHeight: 680,
    show: false,
    frame: false,
    backgroundColor: '#08080a',
    title: 'CrossForge',
    icon: path.join(appRoot(), 'build', 'icon.png'),
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  void mainWindow.webContents.setVisualZoomLevelLimits(1, 1);
  loadPage(mainWindow, 'index');

  mainWindow.once('ready-to-show', () => {
    if (!store.data.settings.startMinimized) mainWindow?.show();
  });
  mainWindow.on('maximize', () => mainWindow?.webContents.send('win:maximized', true));
  mainWindow.on('unmaximize', () => mainWindow?.webContents.send('win:maximized', false));
  mainWindow.on('close', (event) => {
    if (quitting) return;
    event.preventDefault();
    mainWindow?.hide();
    notifyHiddenToTray();
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (isDev && process.env.CF_DEVTOOLS) mainWindow.webContents.openDevTools({ mode: 'detach' });
}

function createOverlayWindow(): void {
  overlayWindow = new BrowserWindow({
    width: 640,
    height: 480,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    focusable: false,
    hasShadow: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false,
    },
  });

  // No `forward: true`: forwarding mouse moves makes Chromium re-set the cursor on every
  // frame while the transparent window covers the desktop, which flickers the system cursor.
  overlayWindow.setIgnoreMouseEvents(true);
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlayWindow.setSkipTaskbar(true);
  overlayWindow.setContentProtection(store.data.settings.hideFromCapture);
  loadPage(overlayWindow, 'overlay');

  overlayWindow.once('ready-to-show', () => {
    applyOverlayBounds();
    pushOverlay();
    if (store.data.settings.overlayVisible) overlayWindow?.showInactive();
  });
  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });
}

function activeDisplay() {
  const wanted = store.data.settings.monitor;
  if (!wanted || wanted === 'primary') return screen.getPrimaryDisplay();
  return screen.getAllDisplays().find((d) => String(d.id) === wanted) ?? screen.getPrimaryDisplay();
}

function applyOverlayBounds(): void {
  if (!overlayWindow || overlayWindow.isDestroyed()) return;
  const { bounds } = activeDisplay();
  overlayWindow.setBounds({ x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height });
}

function pushOverlay(): void {
  if (!overlayWindow || overlayWindow.isDestroyed()) return;
  overlayWindow.webContents.send('overlay:data', {
    spec: store.data.current,
    reduceMotion: store.data.settings.reduceMotion,
  });
}

function broadcast(): void {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('state:changed', store.data);
  pushOverlay();
  refreshTrayMenu();
}

function flashMain(): void {
  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()) {
    mainWindow.webContents.send('app:flash');
  }
}

/* ------------------------------------------------------------------ overlay */

function setOverlayVisible(visible: boolean): void {
  store.data.settings.overlayVisible = visible;
  store.write();
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    if (visible) {
      applyOverlayBounds();
      overlayWindow.setAlwaysOnTop(true, 'screen-saver');
      overlayWindow.showInactive();
    } else {
      overlayWindow.hide();
    }
  }
  broadcast();
}

function showMain(page?: string): void {
  if (!mainWindow) {
    createMainWindow();
    return;
  }
  if (!mainWindow.isVisible()) mainWindow.show();
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.focus();
  if (page) mainWindow.webContents.send('nav:goto', page);
}

function cycleCrosshair(): void {
  const index = PRESETS.findIndex((p) => p.id === store.data.current.id);
  const next = PRESETS[(index + 1 + PRESETS.length) % PRESETS.length] ?? PRESETS[0];
  store.setCurrent(next);
  pushOverlay();
  broadcast();
  flashMain();
  showMain('editor');
}

/* ------------------------------------------------------------------ hotkeys */

function nudge(dx: number, dy: number): void {
  const spec = store.data.current;
  store.setCurrent({ ...spec, offsetX: spec.offsetX + dx, offsetY: spec.offsetY + dy });
  pushOverlay();
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('state:changed', store.data);
}

function registerHotkeys(): void {
  globalShortcut.unregisterAll();
  const registered: Record<string, boolean> = {};
  const actions: Record<string, () => void> = {
    toggle: () => setOverlayVisible(!store.data.settings.overlayVisible),
    cycle: () => cycleCrosshair(),
    editor: () => showMain('editor'),
  };
  for (const key of Object.keys(actions)) {
    const accelerator = store.data.settings.hotkeys[key as keyof Settings['hotkeys']];
    try {
      registered[key] = accelerator ? globalShortcut.register(accelerator, actions[key]) : false;
    } catch {
      registered[key] = false;
    }
  }

  const nudgeMode = store.data.settings.nudge;
  if (nudgeMode !== 'off') {
    const prefix = 'CommandOrControl+Alt+';
    const keys =
      nudgeMode === 'numpad'
        ? { up: 'num8', down: 'num2', left: 'num4', right: 'num6' }
        : { up: 'Up', down: 'Down', left: 'Left', right: 'Right' };
    const moves: Array<[string, number, number]> = [
      [keys.up, 0, -1],
      [keys.down, 0, 1],
      [keys.left, -1, 0],
      [keys.right, 1, 0],
    ];
    for (const [key, dx, dy] of moves) {
      try {
        globalShortcut.register(prefix + key, () => nudge(dx, dy));
      } catch {
        /* ignore unavailable accelerators */
      }
    }
  }

  store.data.settings.registered = registered;
  store.write();
}

/* --------------------------------------------------------------------- tray */

function isRussianUi(): boolean {
  const setting = store.data.settings.language;
  if (setting === 'ru') return true;
  if (setting === 'en') return false;
  return app.getLocale().toLowerCase().startsWith('ru');
}

function trayText() {
  const ru = isRussianUi();
  return {
    open: ru ? 'Открыть CrossForge' : 'Open CrossForge',
    overlay: ru ? 'Оверлей прицела' : 'Crosshair overlay',
    next: ru ? 'Следующий дизайн' : 'Next crosshair',
    designer: ru ? 'Дизайнер' : 'Designer',
    quit: ru ? 'Выйти из CrossForge' : 'Quit CrossForge',
    overlayOn: ru ? 'CrossForge — оверлей включён' : 'CrossForge — overlay on',
    ballloonTitle: 'CrossForge',
    balloonBody: ru
      ? 'CrossForge свёрнут в трей и продолжает работать. Выход — через меню у иконки.'
      : 'CrossForge is still running in the tray. Quit from the tray menu.',
  };
}

function notifyHiddenToTray(): void {
  if (trayHintShown) return;
  trayHintShown = true;
  if (tray && !tray.isDestroyed() && process.platform === 'win32') {
    const iconPath = path.join(appRoot(), 'build', 'icon.png');
    tray.displayBalloon({
      icon: iconPath,
      title: 'CrossForge',
      content: trayText().balloonBody,
    });
  }
}

function buildTrayMenu(): Menu {
  const text = trayText();
  return Menu.buildFromTemplate([
    { label: text.open, click: () => showMain() },
    {
      label: text.overlay,
      type: 'checkbox',
      checked: store.data.settings.overlayVisible,
      click: (item) => setOverlayVisible(item.checked),
    },
    { label: `${text.next}  (${store.data.settings.hotkeys.cycle})`, click: () => cycleCrosshair() },
    { label: text.designer, click: () => showMain('editor') },
    { type: 'separator' },
    {
      label: text.quit,
      click: () => {
        quitting = true;
        app.quit();
      },
    },
  ]);
}

function refreshTrayMenu(): void {
  if (!tray || tray.isDestroyed()) return;
  tray.setContextMenu(buildTrayMenu());
  tray.setToolTip(store.data.settings.overlayVisible ? trayText().overlayOn : 'CrossForge');
}

function createTray(): void {
  const iconPath = path.join(appRoot(), 'build', 'icon.png');
  const image = nativeImage.createFromPath(iconPath);
  if (image.isEmpty()) {
    console.warn('[tray] icon not found at', iconPath);
    return;
  }
  tray = new Tray(image.resize({ width: 16, height: 16 }));
  tray.setToolTip('CrossForge');
  tray.setContextMenu(buildTrayMenu());
  tray.on('click', () => showMain());
}

/* ---------------------------------------------------------------------- ipc */

function displayList(): DisplayInfo[] {
  return screen.getAllDisplays().map((display, index) => ({
    id: String(display.id),
    label: `Display ${index + 1} · ${display.size.width}×${display.size.height}${display.id === screen.getPrimaryDisplay().id ? ' · Primary' : ''}`,
    primary: display.id === screen.getPrimaryDisplay().id,
    width: display.size.width,
    height: display.size.height,
    scaleFactor: display.scaleFactor,
  }));
}

function registerIpc(): void {
  ipcMain.handle('state:get', () => store.data);

  ipcMain.on('spec:set', (_event, spec: CrosshairSpec) => {
    store.setCurrent(spec);
    pushOverlay();
  });

  ipcMain.handle('spec:save', (_event, spec: CrosshairSpec) => {
    const state = store.saveSpec(spec);
    broadcast();
    return state;
  });

  ipcMain.handle('spec:delete', (_event, id: string) => {
    const state = store.deleteSpec(id);
    broadcast();
    return state;
  });

  ipcMain.handle('settings:set', (_event, patch: Partial<Settings>) => {
    const previousHotkeys = JSON.stringify(store.data.settings.hotkeys);
    const previousMonitor = store.data.settings.monitor;
    const state = store.updateSettings(patch);
    if (patch.launchAtLogin !== undefined) {
      app.setLoginItemSettings({ openAtLogin: patch.launchAtLogin, args: [] });
    }
    if (JSON.stringify(state.settings.hotkeys) !== previousHotkeys || patch.nudge !== undefined) {
      registerHotkeys();
    }
    if (patch.hideFromCapture !== undefined && overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.setContentProtection(state.settings.hideFromCapture);
    }
    if (state.settings.monitor !== previousMonitor) applyOverlayBounds();
    broadcast();
    return state;
  });

  ipcMain.handle('overlay:set', (_event, visible: boolean) => {
    setOverlayVisible(visible);
    return store.data;
  });

  ipcMain.handle('file:export', async (_event, spec: CrosshairSpec) => {
    const safeName = (spec.name || 'crosshair').replace(/[\\/:*?"<>|]/g, '-').slice(0, 48);
    const options = {
      title: 'Export crosshair',
      defaultPath: path.join(app.getPath('documents'), `${safeName}.crossforge.json`),
      filters: [{ name: 'CrossForge crosshair', extensions: ['json'] }],
    };
    const result = mainWindow ? await dialog.showSaveDialog(mainWindow, options) : await dialog.showSaveDialog(options);
    if (result.canceled || !result.filePath) return null;
    fs.writeFileSync(result.filePath, JSON.stringify(spec, null, 2), 'utf8');
    return result.filePath;
  });

  ipcMain.handle('file:import', async () => {
    const options = {
      title: 'Import crosshair',
      properties: ['openFile' as const],
      filters: [
        { name: 'CrossForge crosshair', extensions: ['json', 'crossforge', 'txt'] },
        { name: 'All files', extensions: ['*'] },
      ],
    };
    const result = mainWindow ? await dialog.showOpenDialog(mainWindow, options) : await dialog.showOpenDialog(options);
    if (result.canceled || !result.filePaths.length) return null;
    const raw = fs.readFileSync(result.filePaths[0], 'utf8');
    try {
      return normalizeSpec(JSON.parse(raw));
    } catch {
      return decodeShareCode(raw);
    }
  });

  ipcMain.handle('app:displays', () => displayList());

  ipcMain.handle('app:copy', (_event, text: string) => {
    clipboard.writeText(typeof text === 'string' ? text : '');
    return true;
  });

  ipcMain.handle('app:open', async (_event, url: string) => {
    if (typeof url === 'string' && /^https?:\/\//i.test(url)) await shell.openExternal(url);
  });

  ipcMain.on('win:minimize', () => mainWindow?.minimize());
  ipcMain.on('win:toggle-maximize', () => {
    if (!mainWindow) return;
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  });
  ipcMain.on('win:close', () => mainWindow?.close());
  ipcMain.handle('win:is-maximized', () => mainWindow?.isMaximized() ?? false);
}

/* ------------------------------------------------------------------- boot */

function bootstrap(): void {
  app.whenReady().then(() => {
    store = new Store();
    registerIpc();
    createMainWindow();
    createOverlayWindow();
    createTray();
    registerHotkeys();
    if (store.data.settings.launchAtLogin) {
      app.setLoginItemSettings({ openAtLogin: true, args: [] });
    }

    screen.on('display-added', applyOverlayBounds);
    screen.on('display-removed', applyOverlayBounds);
    screen.on('display-metrics-changed', () => {
      applyOverlayBounds();
      if (mainWindow) mainWindow.webContents.send('state:changed', store.data);
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
      else showMain();
    });
  });

  app.on('second-instance', () => showMain());

  app.on('before-quit', () => {
    quitting = true;
    globalShortcut.unregisterAll();
    store?.flush();
  });

  app.on('window-all-closed', () => {
    // Hiding to the tray keeps the app alive; only an explicit quit closes everything.
    if (quitting) app.quit();
  });
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  bootstrap();
}

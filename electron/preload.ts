import { contextBridge, ipcRenderer } from 'electron';
import type { CrossForgeApi, OverlayPayload } from '../shared/api';
import type { AppState, CrosshairSpec, DisplayInfo, Settings } from '../shared/types';

function subscribe<T>(channel: string, cb: (payload: T) => void): () => void {
  const listener = (_event: unknown, payload: T) => cb(payload);
  ipcRenderer.on(channel, listener);
  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
}

const api: CrossForgeApi = {
  getState: () => ipcRenderer.invoke('state:get') as Promise<AppState>,
  getDisplays: () => ipcRenderer.invoke('app:displays') as Promise<DisplayInfo[]>,
  setCurrent: (spec: CrosshairSpec) => ipcRenderer.send('spec:set', spec),
  saveSpec: (spec: CrosshairSpec) => ipcRenderer.invoke('spec:save', spec) as Promise<AppState>,
  deleteSpec: (id: string) => ipcRenderer.invoke('spec:delete', id) as Promise<AppState>,
  updateSettings: (patch: Partial<Settings>) => ipcRenderer.invoke('settings:set', patch) as Promise<AppState>,
  setOverlay: (visible: boolean) => ipcRenderer.invoke('overlay:set', visible) as Promise<AppState>,
  exportSpec: (spec: CrosshairSpec) => ipcRenderer.invoke('file:export', spec) as Promise<string | null>,
  importSpec: () => ipcRenderer.invoke('file:import') as Promise<CrosshairSpec | null>,
  copyText: (text: string) => ipcRenderer.invoke('app:copy', text) as Promise<boolean>,
  openExternal: (url: string) => ipcRenderer.invoke('app:open', url) as Promise<void>,
  window: {
    minimize: () => ipcRenderer.send('win:minimize'),
    toggleMaximize: () => ipcRenderer.send('win:toggle-maximize'),
    close: () => ipcRenderer.send('win:close'),
    isMaximized: () => ipcRenderer.invoke('win:is-maximized') as Promise<boolean>,
  },
  onState: (cb) => subscribe<AppState>('state:changed', cb),
  onNavigate: (cb) => subscribe<string>('nav:goto', cb),
  onSpec: (cb) => subscribe<CrosshairSpec>('spec:changed', cb),
  onMaximized: (cb) => subscribe<boolean>('win:maximized', cb),
  onFlash: (cb) => subscribe<null>('app:flash', () => cb()),
  onOverlayData: (cb) => subscribe<OverlayPayload>('overlay:data', cb),
};

contextBridge.exposeInMainWorld('crossforge', api);

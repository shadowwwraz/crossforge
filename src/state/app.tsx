import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppState, CrosshairSpec, Hotkeys, Layer, LayerKind, PageId, Settings } from '../../shared/types';
import { cloneSpec, defaultLayer, uid } from '../../shared/spec';
import { resolveLanguage, resolveTheme, translate, type Lang, type MessageKey, type Theme, type TranslateParams } from '../i18n';

type Tone = 'default' | 'green';

export interface ToastItem {
  id: number;
  msg: string;
  tone: Tone;
}

interface AppContextValue {
  state: AppState;
  spec: CrosshairSpec;
  page: PageId;
  go: (page: PageId) => void;
  t: (key: MessageKey, params?: TranslateParams) => string;
  lang: Lang;
  theme: Theme;
  patchSpec: (patch: Partial<CrosshairSpec>) => void;
  applySpec: (spec: CrosshairSpec, openEditor?: boolean) => void;
  patchLayer: (id: string, patch: Partial<Layer>) => void;
  addLayer: (kind: LayerKind) => void;
  removeLayer: (id: string) => void;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  setHotkey: (action: keyof Hotkeys, accelerator: string) => Promise<void>;
  resetHotkeys: () => Promise<void>;
  toggleOverlay: (value?: boolean) => Promise<void>;
  saveCurrent: () => Promise<void>;
  saveAs: (spec: CrosshairSpec, silent?: boolean) => Promise<CrosshairSpec | null>;
  removeSaved: (id: string) => Promise<void>;
  toast: (msg: string, tone?: Tone) => void;
  toasts: ToastItem[];
  shareOpen: boolean;
  setShareOpen: (value: boolean) => void;
  importOpen: boolean;
  setImportOpen: (value: boolean) => void;
  editorTab: 'general' | 'recording';
  setEditorTab: (tab: 'general' | 'recording') => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}

const COPY_SUFFIX = ' Copy';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [page, setPage] = useState<PageId>('discover');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editorTab, setEditorTab] = useState<'general' | 'recording'>('general');
  const toastSeq = useRef(0);
  const toastRef = useRef<(msg: string, tone?: Tone) => void>(() => {});

  const toast = useCallback((msg: string, tone: Tone = 'default') => {
    toastSeq.current += 1;
    const id = toastSeq.current;
    setToasts((current) => [...current.slice(-3), { id, msg, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3400);
  }, []);
  toastRef.current = toast;

  useEffect(() => {
    let alive = true;
    window.crossforge.getState().then((next) => {
      if (alive) setState(next);
    });
    const offState = window.crossforge.onState((next) => setState(next));
    const offNavigate = window.crossforge.onNavigate((target) => setPage(target as PageId));
    const offFlash = window.crossforge.onFlash(() => toastRef.current(translate(resolveLanguage('system'), 'toasts.switched'), 'green'));
    return () => {
      alive = false;
      offState();
      offNavigate();
      offFlash();
    };
  }, []);

  const lang: Lang = resolveLanguage(state?.settings.language ?? 'system');
  const theme: Theme = resolveTheme(state?.settings.theme ?? 'system');
  const langRef = useRef(lang);
  langRef.current = lang;

  const t = useCallback(
    (key: MessageKey, params?: TranslateParams) => translate(langRef.current, key, params),
    [],
  );

  const current = state?.current;

  useEffect(() => {
    if (current) window.crossforge.setCurrent(current);
  }, [current]);

  const reduceMotion = state?.settings.reduceMotion;
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.reduceMotion = reduceMotion ? 'true' : 'false';
    root.lang = lang;
  }, [theme, reduceMotion, lang]);

  const go = useCallback((next: PageId) => {
    setPage(next);
    document.getElementById('cf-content')?.scrollTo({ top: 0 });
  }, []);

  const updateCurrent = useCallback((updater: (spec: CrosshairSpec) => CrosshairSpec) => {
    setState((prev) => (prev ? { ...prev, current: updater(prev.current) } : prev));
  }, []);

  const patchSpec = useCallback(
    (patch: Partial<CrosshairSpec>) => updateCurrent((spec) => ({ ...spec, ...patch })),
    [updateCurrent],
  );

  const applySpec = useCallback(
    (spec: CrosshairSpec, openEditor = true) => {
      const snapshot: CrosshairSpec = {
        ...spec,
        layers: spec.layers.map((layer) => ({ ...layer })),
        positions: spec.positions?.map((position) => ({ ...position })),
      };
      updateCurrent(() => snapshot);
      if (openEditor) go('editor');
    },
    [go, updateCurrent],
  );

  const patchLayer = useCallback(
    (id: string, patch: Partial<Layer>) =>
      updateCurrent((spec) => ({
        ...spec,
        layers: spec.layers.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer)),
      })),
    [updateCurrent],
  );

  const addLayer = useCallback(
    (kind: LayerKind) =>
      updateCurrent((spec) => {
        const shape =
          kind === 'dot'
            ? { radius: 2.2, thickness: 2 }
            : kind === 'ring'
              ? { radius: 8, thickness: 1.4 }
              : kind === 'triangle'
                ? { radius: 7, thickness: 1.6 }
                : kind === 'square'
                  ? { radius: 6, thickness: 1.4 }
                  : { length: 7, thickness: 2, gap: 5 };
        return { ...spec, layers: [...spec.layers, defaultLayer(kind, shape)] };
      }),
    [updateCurrent],
  );

  const removeLayer = useCallback(
    (id: string) => updateCurrent((spec) => ({ ...spec, layers: spec.layers.filter((layer) => layer.id !== id) })),
    [updateCurrent],
  );

  const setSetting = useCallback(async <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const next = await window.crossforge.updateSettings({ [key]: value } as Partial<Settings>);
    setState(next);
  }, []);

  const setHotkey = useCallback(
    async (action: keyof Hotkeys, accelerator: string) => {
      if (!state) return;
      const next = await window.crossforge.updateSettings({
        hotkeys: { ...state.settings.hotkeys, [action]: accelerator },
      });
      setState(next);
      const ok = next.settings.registered[action];
      toast(ok ? t('toasts.hotkeyBound', { key: accelerator }) : t('toasts.hotkeyTaken', { key: accelerator }), ok ? 'green' : 'default');
    },
    [state, t, toast],
  );

  const resetHotkeys = useCallback(async () => {
    const next = await window.crossforge.updateSettings({
      hotkeys: { toggle: 'F8', cycle: 'F9', editor: 'F10' },
    });
    setState(next);
    toast(t('toasts.hotkeysReset'), 'green');
  }, [t, toast]);

  const toggleOverlay = useCallback(
    async (value?: boolean) => {
      const visible = value ?? !(state?.settings.overlayVisible ?? false);
      const next = await window.crossforge.setOverlay(visible);
      setState(next);
      toast(
        visible ? t('toasts.overlayOn', { key: next.settings.hotkeys.toggle }) : t('toasts.overlayOff'),
        visible ? 'green' : 'default',
      );
    },
    [state, t, toast],
  );

  const saveAs = useCallback(
    async (spec: CrosshairSpec, silent = false) => {
      const copy = cloneSpec(spec, { name: spec.name.replace(/ Copy$/, '') + COPY_SUFFIX });
      const next = await window.crossforge.saveSpec(copy);
      setState(next);
      if (!silent) toast(t('toasts.saved', { name: copy.name }), 'green');
      return copy;
    },
    [t, toast],
  );

  const saveCurrent = useCallback(async () => {
    if (!state) return;
    const base = state.current;
    const isPreset = base.id.startsWith('preset-');
    const target: CrosshairSpec = isPreset
      ? { ...cloneSpec(base, { name: base.name, author: 'you' }) }
      : { ...base, layers: base.layers.map((layer) => ({ ...layer })) };
    const next = await window.crossforge.saveSpec(target);
    setState({ ...next, current: target });
    toast(
      isPreset ? t('toasts.savedCopy', { name: target.name }) : t('toasts.updated'),
      'green',
    );
  }, [state, t, toast]);

  const removeSaved = useCallback(
    async (id: string) => {
      const next = await window.crossforge.deleteSpec(id);
      setState(next);
      toast(t('toasts.removed'));
    },
    [t, toast],
  );

  if (!state) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--bg)',
          color: 'var(--text)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              border: '1px solid var(--accent-line)',
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            ✛
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '.22em', color: 'var(--text-mute)' }}>
            CROSSFORGE
          </div>
        </div>
      </div>
    );
  }

  const value: AppContextValue = {
    state,
    spec: state.current,
    page,
    go,
    t,
    lang,
    theme,
    patchSpec,
    applySpec,
    patchLayer,
    addLayer,
    removeLayer,
    setSetting,
    setHotkey,
    resetHotkeys,
    toggleOverlay,
    saveCurrent,
    saveAs,
    removeSaved,
    toast,
    toasts,
    shareOpen,
    setShareOpen,
    importOpen,
    setImportOpen,
    editorTab,
    setEditorTab,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function newSavedId(): string {
  return uid();
}

import type { AppState, CrosshairSpec, DisplayInfo, Settings } from './types';

export interface OverlayPayload {
  spec: CrosshairSpec;
  reduceMotion: boolean;
}

export interface CrossForgeApi {
  getState(): Promise<AppState>;
  getDisplays(): Promise<DisplayInfo[]>;
  setCurrent(spec: CrosshairSpec): void;
  saveSpec(spec: CrosshairSpec): Promise<AppState>;
  deleteSpec(id: string): Promise<AppState>;
  updateSettings(patch: Partial<Settings>): Promise<AppState>;
  setOverlay(visible: boolean): Promise<AppState>;
  exportSpec(spec: CrosshairSpec): Promise<string | null>;
  importSpec(): Promise<CrosshairSpec | null>;
  copyText(text: string): Promise<boolean>;
  openExternal(url: string): Promise<void>;
  window: {
    minimize(): void;
    toggleMaximize(): void;
    close(): void;
    isMaximized(): Promise<boolean>;
  };
  onState(cb: (state: AppState) => void): () => void;
  onNavigate(cb: (page: string) => void): () => void;
  onSpec(cb: (spec: CrosshairSpec) => void): () => void;
  onMaximized(cb: (value: boolean) => void): () => void;
  onFlash(cb: () => void): () => void;
  onOverlayData(cb: (payload: OverlayPayload) => void): () => void;
}

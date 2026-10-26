import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { defaultState, normalizeSpec } from '../shared/spec';
import { PRESETS } from '../shared/presets';
import type { AppState, CrosshairSpec, Settings } from '../shared/types';

export class Store {
  data: AppState;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.data = this.load();
  }

  private file(): string {
    return path.join(app.getPath('userData'), 'crossforge-state.json');
  }

  private load(): AppState {
    const fallback = defaultState(PRESETS[2], [PRESETS[0], PRESETS[9], PRESETS[14]]);
    try {
      const raw = fs.readFileSync(this.file(), 'utf8');
      const parsed = JSON.parse(raw) as Partial<AppState>;
      const current = normalizeSpec(parsed.current) ?? fallback.current;
      const savedRaw = Array.isArray(parsed.saved) ? parsed.saved : [];
      const saved = savedRaw.map(normalizeSpec).filter((s): s is CrosshairSpec => Boolean(s));
      const settings = { ...fallback.settings, ...(parsed.settings ?? {}), registered: {} } as Settings;
      return {
        version: 1,
        settings,
        current,
        saved: saved.length ? saved : fallback.saved,
      };
    } catch {
      return fallback;
    }
  }

  write(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 200);
  }

  flush(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    try {
      const file = this.file();
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (error) {
      console.error('[store] failed to persist state', error);
    }
  }

  setCurrent(spec: CrosshairSpec): void {
    const normalized = normalizeSpec(spec);
    if (!normalized) return;
    this.data.current = normalized;
    this.write();
  }

  saveSpec(spec: CrosshairSpec): AppState {
    const normalized = normalizeSpec(spec);
    if (!normalized) return this.data;
    const exists = this.data.saved.findIndex((s) => s.id === normalized.id);
    if (exists >= 0) this.data.saved[exists] = normalized;
    else this.data.saved = [normalized, ...this.data.saved];
    this.write();
    return this.data;
  }

  deleteSpec(id: string): AppState {
    this.data.saved = this.data.saved.filter((s) => s.id !== id);
    this.write();
    return this.data;
  }

  updateSettings(patch: Partial<Settings>): AppState {
    this.data.settings = {
      ...this.data.settings,
      ...patch,
      hotkeys: { ...this.data.settings.hotkeys, ...(patch.hotkeys ?? {}) },
    };
    this.write();
    return this.data;
  }
}

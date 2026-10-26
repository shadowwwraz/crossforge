import type { AppState, CrosshairSpec, Layer, LayerKind, SavedPosition, Settings } from './types';
import { CATEGORIES } from './types';

export const APP_VERSION = '0.1.0';
export const ACCENTS = ['#f7a325', '#22d3ee', '#9dff6b', '#ff5c7a', '#b388ff'] as const;

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : min));

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const safeColor = (v: unknown, fallback: string) => (typeof v === 'string' && HEX.test(v.trim()) ? v.trim() : fallback);

export function defaultLayer(kind: LayerKind, patch: Partial<Layer> = {}): Layer {
  const base: Layer = {
    id: uid(),
    kind,
    enabled: true,
    length: 8,
    thickness: 2,
    gap: 5,
    radius: 8,
    rotation: 0,
  };
  return { ...base, ...patch, id: patch.id ?? base.id, kind };
}

export function normalizeLayer(raw: unknown): Layer | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const kinds: LayerKind[] = ['cross', 'dot', 'ring', 'brackets', 'triangle', 'square'];
  if (!kinds.includes(r.kind as LayerKind)) return null;
  return {
    id: typeof r.id === 'string' && r.id ? r.id : uid(),
    kind: r.kind as LayerKind,
    enabled: r.enabled !== false,
    length: clamp(Number(r.length), 0, 200),
    thickness: clamp(Number(r.thickness), 0.2, 40),
    gap: clamp(Number(r.gap), 0, 200),
    radius: clamp(Number(r.radius), 0.5, 200),
    rotation: clamp(Number(r.rotation), -180, 180),
  };
}

export function normalizeSpec(raw: unknown): CrosshairSpec | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const layers = Array.isArray(r.layers) ? (r.layers.map(normalizeLayer).filter(Boolean) as Layer[]).slice(0, 12) : [];
  const positions = Array.isArray(r.positions)
    ? (r.positions
        .filter((p): p is Record<string, unknown> => Boolean(p) && typeof p === 'object')
        .map((p) => ({
          id: typeof p.id === 'string' && p.id ? p.id : uid(),
          name: (typeof p.name === 'string' ? p.name : 'Position').slice(0, 32),
          x: clamp(Number(p.x), -4000, 4000),
          y: clamp(Number(p.y), -4000, 4000),
        }))
        .slice(0, 12) as SavedPosition[])
    : undefined;
  return {
    id: typeof r.id === 'string' && r.id ? r.id : uid(),
    name: (typeof r.name === 'string' ? r.name : 'Untitled').slice(0, 48),
    author: (typeof r.author === 'string' ? r.author : 'you').slice(0, 32),
    category: CATEGORIES.includes(r.category as never) ? (r.category as CrosshairSpec['category']) : 'Minimal',
    color: safeColor(r.color, '#ffffff'),
    outlineColor: safeColor(r.outlineColor, '#000000'),
    outlineWidth: clamp(Number(r.outlineWidth), 0, 10),
    opacity: clamp(Number(r.opacity ?? 1), 0.05, 1),
    size: clamp(Number(r.size ?? 1), 0.25, 4),
    rotation: clamp(Number(r.rotation), -180, 180),
    glow: clamp(Number(r.glow), 0, 40),
    offsetX: clamp(Number(r.offsetX), -4000, 4000),
    offsetY: clamp(Number(r.offsetY), -4000, 4000),
    layers,
    positions,
    createdAt: typeof r.createdAt === 'number' ? r.createdAt : Date.now(),
    downloads: typeof r.downloads === 'number' ? r.downloads : undefined,
    likes: typeof r.likes === 'number' ? r.likes : undefined,
    tags: Array.isArray(r.tags) ? r.tags.filter((t): t is string => typeof t === 'string').slice(0, 6) : undefined,
    favorite: r.favorite === true,
  };
}

export function cloneSpec(spec: CrosshairSpec, patch: Partial<CrosshairSpec> = {}): CrosshairSpec {
  const copy = normalizeSpec(JSON.parse(JSON.stringify(spec)))!;
  return { ...copy, id: uid(), createdAt: Date.now(), author: 'you', ...patch };
}

export const DEFAULT_SETTINGS: Settings = {
  overlayVisible: false,
  monitor: 'primary',
  hotkeys: { toggle: 'F8', cycle: 'F9', editor: 'F10' },
  nudge: 'arrows',
  launchAtLogin: false,
  startMinimized: false,
  reduceMotion: false,
  accent: '#f7a325',
  fpsCap: 60,
  hideFromCapture: false,
  language: 'system',
  theme: 'system',
  registered: {},
};

export function defaultState(base: CrosshairSpec, saved: CrosshairSpec[] = []): AppState {
  return {
    version: 1,
    settings: { ...DEFAULT_SETTINGS },
    current: base,
    saved,
  };
}

import { defaultLayer, uid } from '../../shared/spec';
import type { Category, CrosshairSpec, Layer, LayerKind } from '../../shared/types';

const ADJECTIVES = [
  'Cobalt',
  'Onyx',
  'Ember',
  'Frost',
  'Vortex',
  'Static',
  'Halo',
  'Wraith',
  'Nova',
  'Rift',
  'Pulse',
  'Vector',
  'Solar',
  'Phantom',
  'Quartz',
  'Cinder',
];

const NOUN_BY_KIND: Record<LayerKind, string> = {
  cross: 'Cross',
  dot: 'Dot',
  ring: 'Ring',
  brackets: 'Brackets',
  triangle: 'Triad',
  square: 'Square',
};

const PALETTE = [
  { color: '#ffffff', outline: '#000000' },
  { color: '#7fe7ff', outline: '#04252b' },
  { color: '#9dff6b', outline: '#0a1a05' },
  { color: '#ff5c7a', outline: '#20030a' },
  { color: '#ffb347', outline: '#1c0f00' },
  { color: '#b388ff', outline: '#120627' },
  { color: '#22d3ee', outline: '#00191d' },
  { color: '#ffe066', outline: '#1a1400' },
];

const CATEGORIES_BY_STYLE: Record<string, Category> = {
  soft: 'Minimal',
  sharp: 'Competitive',
  hud: 'Sci-Fi',
  glow: 'Neon',
};

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
const between = (min: number, max: number) => min + Math.random() * (max - min);

export interface RandomOptions {
  chaos?: number;
  paletteLock?: string | null;
}

export function randomSpec(options: RandomOptions = {}): CrosshairSpec {
  const chaos = Math.min(1, Math.max(0, options.chaos ?? 0.5));
  const palette = options.paletteLock
    ? PALETTE.find((p) => p.color === options.paletteLock) ?? pick(PALETTE)
    : pick(PALETTE);

  const layerCount = 1 + Math.round(chaos * 2 * Math.random());
  const kinds: LayerKind[] = ['cross', 'dot', 'ring', 'brackets', 'triangle', 'square'];
  const used = new Set<LayerKind>();
  const layers: Layer[] = [];

  for (let i = 0; i < layerCount; i += 1) {
    let kind = pick(kinds);
    let guard = 0;
    while (used.has(kind) && guard < 12) {
      kind = pick(kinds);
      guard += 1;
    }
    used.add(kind);

    const base = defaultLayer(kind, { id: uid() });
    if (kind === 'cross' || kind === 'brackets') {
      base.gap = between(2, 9);
      base.length = between(3, 14) * (kind === 'brackets' ? 1.2 : 1);
      base.thickness = between(1, 2.6);
      if (kind === 'cross' && Math.random() < 0.25 * chaos) base.rotation = 45;
    } else if (kind === 'dot') {
      base.radius = between(1.2, 3);
    } else if (kind === 'ring') {
      base.radius = between(4, 13);
      base.thickness = between(0.8, 2);
    } else if (kind === 'triangle') {
      base.radius = between(5, 10);
      base.thickness = between(1, 2);
    } else if (kind === 'square') {
      base.radius = between(4, 9);
      base.thickness = between(1, 2);
      if (Math.random() < 0.5) base.rotation = 45;
    }
    layers.push(base);
  }

  const glowChance = Math.random();
  const name = `${pick(ADJECTIVES)} ${NOUN_BY_KIND[layers[0]?.kind ?? 'dot']}`;
  const category: Category =
    glowChance > 0.75 ? 'Neon' : layers.length === 1 ? 'Minimal' : pick(['Competitive', 'Tactical', 'Sci-Fi', 'Classic']);

  return {
    id: uid(),
    name,
    author: 'randomizer',
    category,
    color: palette.color,
    outlineColor: palette.outline,
    outlineWidth: Math.random() < 0.7 ? 1 : 0,
    opacity: 1,
    size: between(0.85, 1.25),
    rotation: 0,
    glow: glowChance > 0.75 ? between(6, 20) : 0,
    offsetX: 0,
    offsetY: 0,
    layers,
    createdAt: Date.now(),
    downloads: 0,
    likes: 0,
    tags: ['random'],
  };
}

export const RANDOM_STYLE_LABELS = CATEGORIES_BY_STYLE;

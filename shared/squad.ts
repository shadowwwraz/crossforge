import type { CrosshairSpec, SquadMember } from './types';

export function generateLobbyCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random = '';
  for (let i = 0; i < 4; i += 1) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }
  return `CF-${random}`;
}

export function isValidLobbyCode(code: string): boolean {
  if (!code) return false;
  const clean = code.trim().toUpperCase();
  return /^CF-[A-Z0-9]{4}$/.test(clean);
}

export function formatLobbyShareText(code: string): string {
  return `Join my CrossForge squad: ${code}`;
}

function makeSpec(
  id: string,
  name: string,
  color: string,
  layers: CrosshairSpec['layers'],
): CrosshairSpec {
  return {
    id,
    name,
    color,
    author: 'Squad',
    category: 'Competitive',
    outlineColor: '#000000',
    outlineWidth: 1,
    opacity: 1,
    size: 1,
    rotation: 0,
    glow: 0,
    offsetX: 0,
    offsetY: 0,
    layers,
  };
}

export const DEMO_SQUAD_MEMBERS: SquadMember[] = [
  {
    id: 'demo-shadowbyte',
    nickname: 'ShadowByte',
    avatarColor: '#2DD4BF', // Teal
    status: 'online',
    spec: makeSpec('demo-spec-1', 'Hyper Teal', '#2DD4BF', [
      {
        id: 'l1',
        kind: 'cross',
        enabled: true,
        length: 7,
        thickness: 2,
        gap: 4,
        radius: 0,
        rotation: 0,
      },
    ]),
  },
  {
    id: 'demo-vortexsurge',
    nickname: 'VortexSurge',
    avatarColor: '#8B5CF6', // Purple
    status: 'online',
    spec: makeSpec('demo-spec-2', 'Neon Surge', '#C6FF3D', [
      {
        id: 'l2',
        kind: 'cross',
        enabled: true,
        length: 6,
        thickness: 3.5,
        gap: 3,
        radius: 0,
        rotation: 0,
      },
      {
        id: 'l3',
        kind: 'dot',
        enabled: true,
        length: 0,
        thickness: 0,
        gap: 0,
        radius: 2,
        rotation: 0,
      },
    ]),
  },
  {
    id: 'demo-voltbyte',
    nickname: 'VoltByte',
    avatarColor: '#FBBF24', // Yellow
    status: 'online',
    spec: makeSpec('demo-spec-3', 'Cobalt Solar', '#FACC15', [
      {
        id: 'l4',
        kind: 'cross',
        enabled: true,
        length: 8,
        thickness: 2,
        gap: 5,
        radius: 0,
        rotation: 0,
      },
      {
        id: 'l5',
        kind: 'ring',
        enabled: true,
        length: 0,
        thickness: 1.5,
        gap: 0,
        radius: 9,
        rotation: 0,
      },
    ]),
  },
  {
    id: 'demo-crimsonred',
    nickname: 'CrimsonRed',
    avatarColor: '#EF4444', // Red
    status: 'online',
    spec: makeSpec('demo-spec-4', 'Solar Red', '#F87171', [
      {
        id: 'l6',
        kind: 'cross',
        enabled: true,
        length: 9,
        thickness: 2,
        gap: 6,
        radius: 0,
        rotation: 0,
      },
      {
        id: 'l7',
        kind: 'brackets',
        enabled: true,
        length: 4,
        thickness: 1.5,
        gap: 12,
        radius: 0,
        rotation: 0,
      },
    ]),
  },
  {
    id: 'demo-novablade',
    nickname: 'NovaBlade',
    avatarColor: '#10B981', // Emerald
    status: 'online',
    spec: makeSpec('demo-spec-5', 'Hyper Blade', '#34D399', [
      {
        id: 'l8',
        kind: 'cross',
        enabled: true,
        length: 5,
        thickness: 1.5,
        gap: 3,
        radius: 0,
        rotation: 0,
      },
    ]),
  },
];

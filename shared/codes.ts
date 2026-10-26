import { normalizeSpec } from './spec';
import type { CrosshairSpec } from './types';

const PREFIX = 'CF1';

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromBase64(b64: string): string {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function urlSafe(b64: string): string {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromUrlSafe(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  return b64 + '='.repeat((4 - (b64.length % 4)) % 4);
}

export function encodeShareCode(spec: CrosshairSpec): string {
  const payload = {
    v: 1,
    name: spec.name,
    author: spec.author,
    color: spec.color,
    outlineColor: spec.outlineColor,
    outlineWidth: spec.outlineWidth,
    opacity: spec.opacity,
    size: spec.size,
    rotation: spec.rotation,
    glow: spec.glow,
    layers: spec.layers,
  };
  return `${PREFIX}-${urlSafe(toBase64(JSON.stringify(payload)))}`;
}

export function decodeShareCode(raw: string): CrosshairSpec | null {
  const code = raw.trim();
  if (!code.toUpperCase().startsWith(`${PREFIX}-`)) return null;
  try {
    const json = fromBase64(fromUrlSafe(code.slice(PREFIX.length + 1)));
    const parsed = JSON.parse(json) as Record<string, unknown>;
    return normalizeSpec({ ...parsed, id: undefined, createdAt: Date.now(), author: `${parsed.author ?? 'shared'}` });
  } catch {
    return null;
  }
}

export function shareCodeIsValid(raw: string): boolean {
  return decodeShareCode(raw) !== null;
}

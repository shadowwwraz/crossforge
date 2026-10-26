export type LayerKind = 'cross' | 'dot' | 'ring' | 'brackets' | 'triangle' | 'square';

export interface Layer {
  id: string;
  kind: LayerKind;
  enabled: boolean;
  /** arm length (px) for cross / brackets */
  length: number;
  /** stroke width (px) */
  thickness: number;
  /** distance from the centre (px) where the shape starts */
  gap: number;
  /** dot / ring / square / triangle radius (px) */
  radius: number;
  /** local rotation in degrees */
  rotation: number;
}

export type Category =
  | 'Minimal'
  | 'Competitive'
  | 'Tactical'
  | 'Sci-Fi'
  | 'Neon'
  | 'Classic';

export interface SavedPosition {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface CrosshairSpec {
  id: string;
  name: string;
  author: string;
  category: Category;
  color: string;
  outlineColor: string;
  outlineWidth: number;
  /** 0..1 */
  opacity: number;
  /** global scale multiplier */
  size: number;
  /** global rotation in degrees */
  rotation: number;
  /** glow strength in px (0 = off) */
  glow: number;
  offsetX: number;
  offsetY: number;
  layers: Layer[];
  positions?: SavedPosition[];
  createdAt?: number;
  downloads?: number;
  likes?: number;
  tags?: string[];
  favorite?: boolean;
}

export interface Hotkeys {
  toggle: string;
  cycle: string;
  editor: string;
}

export interface Settings {
  overlayVisible: boolean;
  monitor: string;
  hotkeys: Hotkeys;
  nudge: 'arrows' | 'numpad' | 'off';
  launchAtLogin: boolean;
  startMinimized: boolean;
  reduceMotion: boolean;
  accent: string;
  fpsCap: number;
  hideFromCapture: boolean;
  language: 'en' | 'ru' | 'system';
  theme: 'dark' | 'light' | 'system';
  registered: Record<string, boolean>;
}

export interface AppState {
  version: number;
  settings: Settings;
  current: CrosshairSpec;
  saved: CrosshairSpec[];
}

export interface DisplayInfo {
  id: string;
  label: string;
  primary: boolean;
  width: number;
  height: number;
  scaleFactor: number;
}

export type PageId =
  | 'discover'
  | 'browse'
  | 'saved'
  | 'workshop'
  | 'editor'
  | 'keybinds'
  | 'cursor'
  | 'randomizer'
  | 'settings';

export const LAYER_LABEL: Record<LayerKind, string> = {
  cross: 'Cross',
  dot: 'Dot',
  ring: 'Ring',
  brackets: 'Brackets',
  triangle: 'Triangle',
  square: 'Square',
};

export const CATEGORIES: Category[] = [
  'Minimal',
  'Competitive',
  'Tactical',
  'Sci-Fi',
  'Neon',
  'Classic',
];

export interface SquadMember {
  id: string;
  nickname: string;
  avatarColor: string;
  spec: CrosshairSpec;
  isHost?: boolean;
  status: 'online' | 'away' | 'offline';
  isLocal?: boolean;
}

export type SquadMessageType =
  | 'SYNC_STATE'
  | 'OFFER_CROSSHAIR'
  | 'OFFER_ACCEPT'
  | 'OFFER_DECLINE'
  | 'PEER_LEAVE';

export interface SquadMessage {
  type: SquadMessageType;
  senderId: string;
  senderName: string;
  targetId?: string;
  spec?: CrosshairSpec;
  avatarColor?: string;
  timestamp?: number;
}

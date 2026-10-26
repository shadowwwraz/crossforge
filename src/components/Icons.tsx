import type { CSSProperties, ReactNode } from 'react';

export interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}

function Svg({ size = 17, className, strokeWidth = 1.7, style, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const Logo = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" opacity="0.85" />
    <circle cx="12" cy="12" r="2.4" fill="currentColor" />
    <path d="M12 1.6v3.2M12 19.2v3.2M1.6 12h3.2M19.2 12h3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

export const Compass = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z" />
  </Svg>
);

export const Grid = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.6" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" />
  </Svg>
);

export const Bookmark = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-3.8-6.5 3.8v-16a1 1 0 0 1 1-1z" />
  </Svg>
);

export const Wrench = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.2 6.2a4.2 4.2 0 0 0 5.4 5.4l-9.8 9.8a2.5 2.5 0 0 1-3.5-3.5z" />
    <path d="M14.2 6.2 17 3.4a4.2 4.2 0 0 1 3.4 7.6" />
  </Svg>
);

export const Target = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" />
  </Svg>
);

export const Pen = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20h9" />
    <path d="M16.6 3.6a2.1 2.1 0 0 1 3 3L7 19.2 3 20.2l1-4z" />
  </Svg>
);

export const Keyboard = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2" y="5.5" width="20" height="13" rx="2.2" />
    <path d="M6 9.5h.01M9.5 9.5h.01M13 9.5h.01M16.5 9.5h.01M6 12.8h.01M9.5 12.8h.01M13 12.8h.01M16.5 12.8h.01M8 15.8h8" />
  </Svg>
);

export const MousePointer = (p: IconProps) => (
  <Svg {...p}>
    <path d="m4.6 3 15.2 8.4-6.6 1.5-3.1 6.1z" />
  </Svg>
);

export const Shuffle = (p: IconProps) => (
  <Svg {...p}>
    <path d="M16.5 3.5h4v4M20.5 3.5 4 20M20.5 16.5v4h-4M14.5 14.5l6 6M4 4l4.5 4.5" />
  </Svg>
);

export const Settings = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.83l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.83-.34 1.7 1.7 0 0 0-1 1.52V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.83.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.52-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.83l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6h.09A1.7 1.7 0 0 0 10.6 3.08V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 16.12 4.6a1.7 1.7 0 0 0 1.83-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 20.4 9v.09a1.7 1.7 0 0 0 1.52 1.51H22a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z" />
  </Svg>
);

export const Help = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.2 9.2A2.9 2.9 0 0 1 12 6.6c1.7 0 3 1.2 3 2.8 0 1.9-2.9 2.4-2.9 4" />
    <path d="M12 17h.01" />
  </Svg>
);

export const News = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 21.5h15a2.5 2.5 0 0 0 2.5-2.5V4a1.5 1.5 0 0 0-1.5-1.5H8A1.5 1.5 0 0 0 6.5 4v15.5a2 2 0 1 1-4 0V8.5" />
    <path d="M10 7h7M10 10.5h7M10 14h5" />
  </Svg>
);

export const Discord = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8.6 6.2A13 13 0 0 1 12 5.7c1.2 0 2.4.2 3.4.5l1.4.5c1.6 2 2.4 4.9 2.2 8.4-1.4 1.1-2.9 1.7-4.3 2l-1-1.6" />
    <path d="M8.6 6.2 7.2 6.7C5.6 8.7 4.8 11.6 5 15.1c1.4 1.1 2.9 1.7 4.3 2l1-1.6" />
    <path d="M9.6 13.6c-.6 0-1-.6-1-1.2s.4-1.2 1-1.2 1 .6 1 1.2-.4 1.2-1 1.2zM14.4 13.6c-.6 0-1-.6-1-1.2s.4-1.2 1-1.2 1 .6 1 1.2-.4 1.2-1 1.2z" />
  </Svg>
);

export const Search = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10.8" cy="10.8" r="7" />
    <path d="m21 21-4.7-4.7" />
  </Svg>
);

export const Share = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="18" cy="5" r="2.8" />
    <circle cx="6" cy="12" r="2.8" />
    <circle cx="18" cy="19" r="2.8" />
    <path d="m8.5 10.7 7-4.2M8.5 13.3l7 4.2" />
  </Svg>
);

export const Download = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v12" />
    <path d="m7 10.5 5 5 5-5" />
    <path d="M4 21h16" />
  </Svg>
);

export const Upload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 16V4" />
    <path d="m7 8.5 5-5 5 5" />
    <path d="M4 21h16" />
  </Svg>
);

export const Plus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const Minus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
);

export const ArrowLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19 12H5" />
    <path d="m11 6-6 6 6 6" />
  </Svg>
);

export const ArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </Svg>
);

export const ArrowUp = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 19V5" />
    <path d="m6 11 6-6 6 6" />
  </Svg>
);

export const ArrowDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14" />
    <path d="m6 13 6 6 6-6" />
  </Svg>
);

export const ArrowUpRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </Svg>
);

export const Check = (p: IconProps) => (
  <Svg {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Svg>
);

export const X = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const ChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const ChevronRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
);

export const Star = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9z" />
  </Svg>
);

export const Heart = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20.3 5.7a5 5 0 0 0-7.1 0L12 6.9l-1.2-1.2a5 5 0 1 0-7.1 7.1L12 21l8.3-8.2a5 5 0 0 0 0-7.1z" />
  </Svg>
);

export const Users = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.4" />
    <path d="M2.8 20a6.2 6.2 0 0 1 12.4 0" />
    <path d="M16.2 5.1a3.4 3.4 0 0 1 0 6.5M17.6 14.4a6.2 6.2 0 0 1 3.6 5.6" />
  </Svg>
);

export const Trash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 6.5h17M9 6.5V4.2h6v2.3M6 6.5l1 14.3h10l1-14.3M10 10.5v6.5M14 10.5v6.5" />
  </Svg>
);

export const Copy = (p: IconProps) => (
  <Svg {...p}>
    <rect x="9" y="9" width="12.5" height="12.5" rx="2" />
    <path d="M15 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v9.5A1.5 1.5 0 0 0 4 15h1.5" />
  </Svg>
);

export const Monitor = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.5" y="3.5" width="19" height="13" rx="2.2" />
    <path d="M8.5 20.5h7M12 16.5v4" />
  </Svg>
);

export const Sparkles = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 3 1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" />
    <path d="M18.5 15.5 19.4 18l2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9z" />
  </Svg>
);

export const Sliders = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </Svg>
);

export const Play = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 4.8 19.5 12 7 19.2z" />
  </Svg>
);

export const RotateCcw = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.2 12a8.8 8.8 0 1 0 2.9-6.5L3 8.6" />
    <path d="M3 3.6v5h5" />
  </Svg>
);

export const Zap = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13 2 4 13.5h7L10 22l9-11.5h-7z" />
  </Svg>
);

export const Lock = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="10.5" width="16" height="10.5" rx="2.2" />
    <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
  </Svg>
);

export const Flame = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 22c4 0 6.5-2.6 6.5-6 0-4.4-3.5-6.3-3.5-10 0 0-2.4 1.2-3.6 4.2C10.2 7.6 9 6 9 6c0 3.6-3.5 5.6-3.5 10 0 3.4 2.5 6 6.5 6z" />
  </Svg>
);

export const Info = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.8h.01" />
  </Svg>
);

export const Palette = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3a9 9 0 0 0 0 18c1.4 0 2.2-.9 2.2-2 0-.7-.4-1.2-.4-1.9 0-1 .8-1.8 1.9-1.8H18a3.6 3.6 0 0 0 3.5-3.6C21.5 6.7 17.3 3 12 3z" />
    <path d="M7.5 8.5h.01M10 6.2h.01M6.4 12.6h.01M8.3 16.2h.01" />
  </Svg>
);

export const Eye = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const MinimizeIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth={1.5}>
    <path d="M5 12h14" />
  </Svg>
);

export const MaximizeIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth={1.4}>
    <rect x="5.5" y="5.5" width="13" height="13" rx="1.4" />
  </Svg>
);

export const RestoreIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth={1.4}>
    <rect x="4.5" y="8" width="11" height="11" rx="1.4" />
    <path d="M8 8V5.5a1 1 0 0 1 1-1h9.5a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1H15" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth={1.5}>
    <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
  </Svg>
);

export const Code = (p: IconProps) => (
  <Svg {...p}>
    <path d="m9 8-4.5 4L9 16M15 8l4.5 4L15 16" />
  </Svg>
);

export const Layers = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 2.8 9 5-9 5-9-5z" />
    <path d="m3 12.6 9 5 9-5" />
    <path d="m3 17.1 9 5 9-5" />
  </Svg>
);

export const EyeOff = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.2A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3 4.1M6.4 7.1A17 17 0 0 0 2 12s3.6 7 10 7c1.4 0 2.7-.3 3.9-.9" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </Svg>
);

export const Sun = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </Svg>
);

export const Moon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20.5 14.2A8.6 8.6 0 0 1 9.8 3.5 8.7 8.7 0 1 0 20.5 14.2z" />
  </Svg>
);

export const Globe = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3.5 9.5h17M3.5 14.5h17" />
    <path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" />
  </Svg>
);

/* layer shapes */
export const ShapeCross = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v5M12 16v5M3 12h5M16 12h5" />
  </Svg>
);

export const ShapeDot = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="7.5" opacity="0.25" />
  </Svg>
);

export const ShapeRing = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="7.5" />
  </Svg>
);

export const ShapeBrackets = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4" />
  </Svg>
);

export const ShapeTriangle = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 4 8 14H4z" />
  </Svg>
);

export const ShapeSquare = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4.5" y="4.5" width="15" height="15" rx="1" />
  </Svg>
);

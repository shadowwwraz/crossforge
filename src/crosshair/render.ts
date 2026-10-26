import type { CrosshairSpec, Layer } from '../../shared/types';

const TAU = Math.PI * 2;
const rad = (deg: number) => (deg * Math.PI) / 180;

export function paintCrosshair(
  ctx: CanvasRenderingContext2D,
  spec: CrosshairSpec,
  cx: number,
  cy: number,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(spec.size, spec.size);
  ctx.rotate(rad(spec.rotation));
  ctx.globalAlpha = Math.min(1, Math.max(0, spec.opacity));
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (spec.glow > 0) {
    ctx.shadowColor = spec.color;
    ctx.shadowBlur = spec.glow;
  }

  for (const layer of spec.layers) {
    if (!layer.enabled) continue;
    ctx.save();
    ctx.rotate(rad(layer.rotation));
    drawLayer(ctx, spec, layer);
    ctx.restore();
  }

  ctx.restore();
}

function strokeShape(
  ctx: CanvasRenderingContext2D,
  spec: CrosshairSpec,
  path: Path2D,
  thickness: number,
): void {
  if (spec.outlineWidth > 0) {
    ctx.lineWidth = thickness + spec.outlineWidth * 2;
    ctx.strokeStyle = spec.outlineColor;
    ctx.stroke(path);
  }
  ctx.lineWidth = Math.max(0.2, thickness);
  ctx.strokeStyle = spec.color;
  ctx.stroke(path);
}

function drawLayer(ctx: CanvasRenderingContext2D, spec: CrosshairSpec, layer: Layer): void {
  if (layer.kind === 'dot') {
    if (spec.outlineWidth > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, layer.radius + spec.outlineWidth, 0, TAU);
      ctx.fillStyle = spec.outlineColor;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(0.2, layer.radius), 0, TAU);
    ctx.fillStyle = spec.color;
    ctx.fill();
    return;
  }

  const path = new Path2D();

  switch (layer.kind) {
    case 'cross': {
      for (let i = 0; i < 4; i += 1) {
        const angle = (i * Math.PI) / 2;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        path.moveTo(dx * layer.gap, dy * layer.gap);
        path.lineTo(dx * (layer.gap + layer.length), dy * (layer.gap + layer.length));
      }
      break;
    }
    case 'brackets': {
      const g = layer.gap;
      const l = layer.length;
      const corners: Array<[number, number]> = [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ];
      for (const [sx, sy] of corners) {
        path.moveTo(sx * g, sy * (g + l));
        path.lineTo(sx * g, sy * g);
        path.lineTo(sx * (g + l), sy * g);
      }
      break;
    }
    case 'ring': {
      path.arc(0, 0, layer.radius, 0, TAU);
      break;
    }
    case 'triangle': {
      const r = layer.radius;
      for (let i = 0; i < 3; i += 1) {
        const angle = rad(-90 + i * 120);
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      }
      path.closePath();
      break;
    }
    case 'square': {
      const r = layer.radius;
      path.rect(-r, -r, r * 2, r * 2);
      break;
    }
  }

  strokeShape(ctx, spec, path, layer.thickness);
}

/** Paints a full-frame overlay: transparent canvas, crosshair at screen centre + offsets. */
export function paintOverlay(
  ctx: CanvasRenderingContext2D,
  spec: CrosshairSpec,
  cssWidth: number,
  cssHeight: number,
): void {
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  paintCrosshair(ctx, spec, cssWidth / 2 + spec.offsetX, cssHeight / 2 + spec.offsetY);
}

export function syncCanvasSize(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number,
): CanvasRenderingContext2D | null {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const width = Math.max(1, Math.round(cssWidth * dpr));
  const height = Math.max(1, Math.round(cssHeight * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

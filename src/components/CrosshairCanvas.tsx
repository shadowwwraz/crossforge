import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { CrosshairSpec } from '../../shared/types';
import { paintCrosshair, syncCanvasSize } from '../crosshair/render';

interface Props {
  spec: CrosshairSpec;
  /** CSS size when not filling the parent */
  width?: number;
  height?: number;
  /** fill parent and track its size */
  fill?: boolean;
  zoom?: number;
  draggable?: boolean;
  onOffset?: (x: number, y: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function CrosshairCanvas({
  spec,
  width = 180,
  height = 180,
  fill = false,
  zoom = 1,
  draggable = false,
  onOffset,
  className,
  style,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState({ w: width, h: height });
  const dragRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

  useLayoutEffect(() => {
    if (!fill || !wrapRef.current) return;
    const element = wrapRef.current;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      setSize({ w: Math.max(1, rect.width), h: Math.max(1, rect.height) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [fill]);

  useEffect(() => {
    if (!fill) setSize({ w: width, h: height });
  }, [fill, width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = syncCanvasSize(canvas, size.w, size.h);
    if (!ctx) return;
    ctx.clearRect(0, 0, size.w, size.h);
    paintCrosshair(ctx, spec, size.w / 2 + spec.offsetX * zoom, size.h / 2 + spec.offsetY * zoom);
  }, [spec, size, zoom]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!draggable || !onOffset) return;
    event.preventDefault();
    (event.target as HTMLCanvasElement).setPointerCapture(event.pointerId);
    dragRef.current = { px: event.clientX, py: event.clientY, ox: spec.offsetX, oy: spec.offsetY };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag || !onOffset) return;
    const dx = (event.clientX - drag.px) / zoom;
    const dy = (event.clientY - drag.py) / zoom;
    onOffset(Math.round(drag.ox + dx), Math.round(drag.oy + dy));
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const canvas = (
    <canvas
      ref={canvasRef}
      className={className}
      style={fill ? { width: '100%', height: '100%', display: 'block', ...style } : { width, height, display: 'block', ...style }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );

  if (!fill) return canvas;

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {canvas}
    </div>
  );
}

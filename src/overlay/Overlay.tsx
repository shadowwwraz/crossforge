import { useEffect, useRef, useState } from 'react';
import type { CrosshairSpec } from '../../shared/types';
import { paintOverlay, syncCanvasSize } from '../crosshair/render';

export function Overlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [spec, setSpec] = useState<CrosshairSpec | null>(null);
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    window.crossforge.getState().then((state) => setSpec(state.current));
    const off = window.crossforge.onOverlayData(({ spec: next }) => setSpec(next));
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => {
      off();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !spec) return;
    const ctx = syncCanvasSize(canvas, size.w, size.h);
    if (!ctx) return;
    paintOverlay(ctx, spec, size.w, size.h);
  }, [spec, size]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}

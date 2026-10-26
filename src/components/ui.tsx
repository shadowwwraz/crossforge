import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ChevronRight } from './Icons';

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size,
  fill,
}: {
  value: T;
  options: Array<{ value: T; label: ReactNode }>;
  onChange: (value: T) => void;
  size?: 'sm';
  fill?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [thumb, setThumb] = useState({ left: 3, width: 0 });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => {
      const active = container.querySelector<HTMLButtonElement>('button.active');
      if (!active) return;
      setThumb({ left: active.offsetLeft, width: active.offsetWidth });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [value, options.length]);

  return (
    <div
      ref={containerRef}
      className={`segmented${size === 'sm' ? ' sm' : ''}`}
      style={{ width: fill ? '100%' : undefined } as CSSProperties}
      role="tablist"
    >
      <span className="segmented-thumb" aria-hidden="true" style={{ left: thumb.left, width: thumb.width }} />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          className={option.value === value ? 'active' : ''}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`switch${checked ? ' on' : ''}`}
      onClick={() => onChange(!checked)}
    />
  );
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  return (
    <div className="slider-row">
      <input
        type="range"
        className="slider"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ '--pct': `${pct}%` } as CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="slider-val">{format ? format(value) : value}</span>
    </div>
  );
}

export function Stepper({
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  left = <ArrowLeft size={12} />,
  right = <ArrowRight size={12} />,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  left?: ReactNode;
  right?: ReactNode;
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, Number(next.toFixed(3))));
  return (
    <div className="stepper">
      <button type="button" className="step-btn" onClick={() => onChange(clamp(value - step))} aria-label="Decrease">
        {left}
      </button>
      <div className="step-value">{format ? format(value) : value}</div>
      <button type="button" className="step-btn" onClick={() => onChange(clamp(value + step))} aria-label="Increase">
        {right}
      </button>
    </div>
  );
}

export function Row({
  icon,
  title,
  desc,
  children,
}: {
  icon: ReactNode;
  title: string;
  desc?: string;
  children?: ReactNode;
}) {
  return (
    <div className="row">
      <span className="row-ico">{icon}</span>
      <div className="row-info">
        <div className="row-title">{title}</div>
        {desc ? <div className="row-desc">{desc}</div> : null}
      </div>
      <div className="row-control">{children}</div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  sub,
  action,
}: {
  icon: ReactNode;
  title: string;
  sub: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty-ico">{icon}</div>
      <div className="empty-title">{title}</div>
      <div className="empty-sub">{sub}</div>
      {action ? <div className="mt-12">{action}</div> : null}
    </div>
  );
}

export function SettingRow({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
}) {
  return (
    <div className="setting-row">
      <div className="setting-info">
        <div className="setting-name">{title}</div>
        {desc ? <div className="setting-desc">{desc}</div> : null}
      </div>
      <div className="flex" style={{ flexShrink: 0 }}>
        {children}
      </div>
    </div>
  );
}

export function ChevronLink({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        background: 'transparent',
        border: 0,
        color: 'var(--text-dim)',
        fontSize: 11,
        cursor: 'pointer',
        padding: 0,
      }}
    >
      {label}
      <ChevronRight size={12} />
    </button>
  );
}

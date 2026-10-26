import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import type { DisplayInfo, Layer, LayerKind } from '../../shared/types';
import { uid } from '../../shared/spec';
import { useApp } from '../state/app';
import { categoryKey, editorKey, layerKey } from '../i18n';
import { CrosshairCanvas } from '../components/CrosshairCanvas';
import { Row, Segmented, Slider, Stepper, Switch } from '../components/ui';
import { KeyCapture, prettyAccelerator } from '../components/KeyCapture';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bookmark,
  Check,
  Copy,
  Download,
  Eye,
  Info,
  Keyboard,
  Layers,
  MaximizeIcon,
  Minus,
  Monitor,
  Palette,
  Pen,
  Play,
  Plus,
  RotateCcw,
  Share,
  ShapeBrackets,
  ShapeCross,
  ShapeDot,
  ShapeRing,
  ShapeSquare,
  ShapeTriangle,
  Sliders,
  Sparkles,
  Target,
  Trash,
  Users,
  Wrench,
  Zap,
  type IconProps,
} from '../components/Icons';

type CatId = 'all' | 'interface' | 'display' | 'position' | 'startup' | 'performance' | 'input' | 'integrations' | 'actions';

const CATS: Array<{ id: CatId; icon: ComponentType<IconProps> }> = [
  { id: 'all', icon: Layers },
  { id: 'interface', icon: Palette },
  { id: 'display', icon: Monitor },
  { id: 'position', icon: Target },
  { id: 'startup', icon: Zap },
  { id: 'performance', icon: Sliders },
  { id: 'input', icon: Keyboard },
  { id: 'integrations', icon: Wrench },
  { id: 'actions', icon: Sparkles },
];

const SWATCHES = ['#ffffff', '#7fe7ff', '#9dff6b', '#ff5c7a', '#ffb347', '#b388ff', '#22d3ee', '#ffe066'];

const LAYER_ICON: Record<LayerKind, ComponentType<IconProps>> = {
  cross: ShapeCross,
  dot: ShapeDot,
  ring: ShapeRing,
  brackets: ShapeBrackets,
  triangle: ShapeTriangle,
  square: ShapeSquare,
};

const round = (value: number) => Math.round(value * 100) / 100;

export function Editor() {
  const { t, spec, editorTab, setEditorTab, saveCurrent, setShareOpen } = useApp();
  const [cat, setCat] = useState<CatId>('position');
  const [displays, setDisplays] = useState<DisplayInfo[]>([]);

  useEffect(() => {
    let alive = true;
    window.crossforge.getDisplays().then((list) => {
      if (alive) setDisplays(list);
    });
    return () => {
      alive = false;
    };
  }, []);

  const activeCat = CATS.find((item) => item.id === cat)!;
  const ActiveCatIcon = activeCat.icon;

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <span className="eyebrow">
            {t('nav.designer')} / {t(editorKey(editorTab === 'recording' ? 'recording' : cat))}
          </span>
          <h1 className="page-title" style={{ fontSize: 30 }}>
            {spec.name}
          </h1>
          <p className="page-lede">
            {t(categoryKey(spec.category))} · {t('editor.layersCount', { count: spec.layers.length })} ·{' '}
            <span className="mono">{spec.color.toUpperCase()}</span>
          </p>
        </div>
        <div className="page-head-actions">
          <Segmented
            value={editorTab}
            options={[
              { value: 'general', label: t('editor.general') },
              { value: 'recording', label: t('editor.recording') },
            ]}
            onChange={setEditorTab}
          />
          <button type="button" className="btn" onClick={() => saveCurrent()}>
            <Bookmark size={13} />
            {t('common.save')}
          </button>
          <button type="button" className="btn btn-accent" onClick={() => setShareOpen(true)}>
            <Share size={13} />
            {t('common.share')}
          </button>
        </div>
      </div>

      <div className={`editor${editorTab === 'recording' ? ' recording' : ''}`}>
        {editorTab === 'general' ? (
          <nav className="panel cat-list">
            <div className="eyebrow plain">{t('editor.categories')}</div>
            {CATS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`cat-row${cat === item.id ? ' active' : ''}`}
                onClick={() => setCat(item.id)}
              >
                <span className="cat-num">{String(index + 1).padStart(2, '0')}</span>
                {t(editorKey(item.id))}
              </button>
            ))}
          </nav>
        ) : null}

        <div className="editor-main">
          <div className="editor-panel-head">
            <span className="eyebrow">{editorTab === 'recording' ? t('editor.recordingTitle') : t(editorKey(cat))}</span>
            <span className="rule" />
          </div>
          {editorTab === 'recording' ? <RecordingPanel /> : <CategoryContent cat={cat} onNavigate={setCat} displays={displays} />}
        </div>

        <Inspector displays={displays} />
      </div>

      <div className="flex" style={{ marginTop: 14, gap: 6, color: 'var(--text-mute)', fontSize: 10.5 }}>
        <ActiveCatIcon size={12} />
        {t('hints.editor')}
      </div>
    </div>
  );
}

function CategoryContent({ cat, onNavigate, displays }: { cat: CatId; onNavigate: (cat: CatId) => void; displays: DisplayInfo[] }) {
  const { spec, patchSpec, state, t, setSetting, setHotkey, toggleOverlay, toast, setShareOpen, saveCurrent, saveAs, removeSaved } =
    useApp();

  if (cat === 'all') {
    return (
      <div className="rows">
        <Row icon={<Pen size={13} />} title={t('editor.designName')} desc={t('editor.designNameDesc')}>
          <input
            className="field"
            style={{ width: 210 }}
            maxLength={40}
            value={spec.name}
            onChange={(event) => patchSpec({ name: event.target.value })}
          />
        </Row>
        <Row icon={<MaximizeIcon size={13} />} title={t('editor.size')} desc={t('editor.sizeDesc')}>
          <Stepper value={spec.size} min={0.25} max={4} step={0.05} format={(value) => value.toFixed(2)} onChange={(value) => patchSpec({ size: value })} left={<Minus size={12} />} right={<Plus size={12} />} />
        </Row>
        <Row icon={<ArrowRight size={13} />} title={t('editor.position')} desc={t('editor.posXDesc')}>
          <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>
            X {spec.offsetX} · Y {spec.offsetY}
          </span>
          <ResetButton onClick={() => patchSpec({ offsetX: 0, offsetY: 0 })} />
        </Row>
        <Row icon={<Palette size={13} />} title={t('editor.colour')}>
          <Swatches color={spec.color} onChange={(color) => patchSpec({ color })} />
        </Row>
        <Row icon={<Layers size={13} />} title={t('editor.shapeLayers')} desc={t('editor.layersCount', { count: spec.layers.length })}>
          <button type="button" className="btn btn-sm" onClick={() => onNavigate('interface')}>
            {t('editor.interface')}
          </button>
        </Row>
        <Row icon={<Monitor size={13} />} title={t('editor.overlay')} desc={t('editor.overlayDesc')}>
          <span className={`dot${state.settings.overlayVisible ? ' on' : ''}`} />
          <Switch checked={state.settings.overlayVisible} onChange={(value) => toggleOverlay(value)} label={t('editor.overlay')} />
        </Row>
      </div>
    );
  }

  if (cat === 'interface') {
    return (
      <>
        <div className="rows">
          <Row icon={<Palette size={13} />} title={t('editor.colour')} desc={t('editor.colourDesc')}>
            <Swatches color={spec.color} onChange={(color) => patchSpec({ color })} />
          </Row>
          <Row icon={<Layers size={13} />} title={t('editor.outline')} desc={t('editor.outlineDesc')}>
            <input
              type="color"
              className="color-input"
              value={spec.outlineColor}
              onChange={(event) => patchSpec({ outlineColor: event.target.value })}
              aria-label={t('editor.outline')}
            />
            <Slider value={spec.outlineWidth} min={0} max={4} step={0.2} onChange={(value) => patchSpec({ outlineWidth: value })} format={(value) => value.toFixed(1)} />
          </Row>
          <Row icon={<Eye size={13} />} title={t('editor.opacity')} desc={t('editor.opacityDesc')}>
            <Slider value={spec.opacity} min={0.15} max={1} step={0.05} onChange={(value) => patchSpec({ opacity: value })} format={(value) => `${Math.round(value * 100)}%`} />
          </Row>
          <Row icon={<Sparkles size={13} />} title={t('editor.glow')} desc={t('editor.glowDesc')}>
            <Slider value={spec.glow} min={0} max={40} step={1} onChange={(value) => patchSpec({ glow: value })} format={(value) => (value ? `${value} px` : t('editor.offValue'))} />
          </Row>
        </div>
        <div className="section-head">
          <span className="eyebrow">{t('editor.shapeLayers')}</span>
          <span className="mute" style={{ fontSize: 10.5 }}>
            {t('editor.layersCount', { count: spec.layers.length })}
          </span>
          <span className="rule" />
        </div>
        <LayerEditor />
      </>
    );
  }

  if (cat === 'display') {
    return (
      <div className="rows">
        <Row icon={<Monitor size={13} />} title={t('editor.monitor')} desc={t('editor.monitorDesc')}>
          <select className="field" style={{ width: 210 }} value={state.settings.monitor} onChange={(event) => setSetting('monitor', event.target.value)}>
            <option value="primary">{t('settings.primary')}</option>
            {displays.map((display) => (
              <option key={display.id} value={display.id}>
                {display.label}
              </option>
            ))}
          </select>
        </Row>
        <Row icon={<Eye size={13} />} title={t('editor.overlay')} desc={t('editor.overlayDesc')}>
          <Switch checked={state.settings.overlayVisible} onChange={(value) => toggleOverlay(value)} label={t('editor.overlay')} />
        </Row>
        <Row icon={<RotateCcw size={13} />} title={t('editor.rotation')}>
          <Slider value={spec.rotation} min={-180} max={180} step={1} onChange={(value) => patchSpec({ rotation: value })} format={(value) => `${Math.round(value)}°`} />
        </Row>
        <Row icon={<Zap size={13} />} title={t('editor.testOverlay')} desc={t('editor.testOverlayDesc')}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              toggleOverlay(true);
              window.setTimeout(() => toggleOverlay(false), 4000);
              toast(t('toasts.testShown'));
            }}
          >
            <Play size={11} />
            {t('editor.test')}
          </button>
        </Row>
        <Row icon={<Info size={13} />} title={t('editor.fullscreen')} desc={t('editor.fullscreenDesc')}>
          <span className="chip-static">{t('editor.tip')}</span>
        </Row>
      </div>
    );
  }

  if (cat === 'position') {
    return (
      <>
        <div className="rows">
          <Row icon={<MaximizeIcon size={13} />} title={t('editor.size')} desc={t('editor.sizeDesc')}>
            <Stepper value={spec.size} min={0.25} max={4} step={0.05} format={(value) => value.toFixed(2)} onChange={(value) => patchSpec({ size: value })} left={<Minus size={12} />} right={<Plus size={12} />} />
            <ResetButton onClick={() => patchSpec({ size: 1 })} />
          </Row>
          <Row icon={<ArrowRight size={13} />} title={t('editor.posX')} desc={t('editor.posXDesc')}>
            <Stepper value={spec.offsetX} min={-400} max={400} step={1} onChange={(value) => patchSpec({ offsetX: value })} left={<ArrowLeft size={12} />} right={<ArrowRight size={12} />} />
            <ResetButton onClick={() => patchSpec({ offsetX: 0 })} />
          </Row>
          <Row icon={<ArrowDown size={13} />} title={t('editor.posY')} desc={t('editor.posYDesc')}>
            <Stepper value={spec.offsetY} min={-400} max={400} step={1} onChange={(value) => patchSpec({ offsetY: value })} left={<ArrowUp size={12} />} right={<ArrowDown size={12} />} />
            <ResetButton onClick={() => patchSpec({ offsetY: 0 })} />
          </Row>
          <PositionKeybinds />
          <SavedPositions />
        </div>
      </>
    );
  }

  if (cat === 'startup') {
    return (
      <div className="rows">
        <Row icon={<Zap size={13} />} title={t('editor.launchAtLogin')} desc={t('editor.launchAtLoginDesc')}>
          <Switch checked={state.settings.launchAtLogin} onChange={(value) => setSetting('launchAtLogin', value)} label={t('editor.launchAtLogin')} />
        </Row>
        <Row icon={<Eye size={13} />} title={t('editor.startMinimized')} desc={t('editor.startMinimizedDesc')}>
          <Switch checked={state.settings.startMinimized} onChange={(value) => setSetting('startMinimized', value)} label={t('editor.startMinimized')} />
        </Row>
        <Row icon={<Info size={13} />} title={t('editor.restoreLast')} desc={t('editor.restoreLastDesc')}>
          <span className="chip-static" style={{ color: 'var(--green)', borderColor: 'color-mix(in srgb, var(--green) 35%, transparent)' }}>
            {t('editor.alwaysOn')}
          </span>
        </Row>
      </div>
    );
  }

  if (cat === 'performance') {
    return (
      <div className="rows">
        <Row icon={<Sparkles size={13} />} title={t('editor.reduceMotion')} desc={t('editor.reduceMotionDesc')}>
          <Switch checked={state.settings.reduceMotion} onChange={(value) => setSetting('reduceMotion', value)} label={t('editor.reduceMotion')} />
        </Row>
        <Row icon={<Sliders size={13} />} title={t('editor.rendering')} desc={t('editor.renderingDesc')}>
          <span className="chip-static">{t('editor.gpu')}</span>
        </Row>
        <Row icon={<Monitor size={13} />} title={t('editor.footprint')} desc={t('editor.footprintDesc')}>
          <span className="chip-static">{t('editor.noHooks')}</span>
        </Row>
        <Row icon={<Info size={13} />} title={t('editor.antiCheat')} desc={t('editor.antiCheatDesc')}>
          <span className="chip-static" style={{ color: 'var(--green)', borderColor: 'color-mix(in srgb, var(--green) 35%, transparent)' }}>
            {t('editor.safe')}
          </span>
        </Row>
      </div>
    );
  }

  if (cat === 'input') {
    const items: Array<{ key: 'toggle' | 'cycle' | 'editor'; title: string; desc: string }> = [
      { key: 'toggle', title: t('editor.toggleOverlay'), desc: t('editor.toggleOverlayDesc') },
      { key: 'cycle', title: t('editor.nextDesign'), desc: t('editor.nextDesignDesc') },
      { key: 'editor', title: t('editor.openDesigner'), desc: t('editor.openDesignerDesc') },
    ];
    return (
      <>
        <div className="rows">
          {items.map((item) => (
            <Row key={item.key} icon={<Keyboard size={13} />} title={item.title} desc={item.desc}>
              <span className={`dot${state.settings.registered[item.key] ? ' on' : ''}`} title={state.settings.registered[item.key] ? t('editor.registered') : t('editor.notRegistered')} />
              <KeyCapture value={state.settings.hotkeys[item.key]} onChange={(accelerator) => setHotkey(item.key, accelerator)} />
            </Row>
          ))}
          <PositionKeybinds />
          <Row icon={<RotateCcw size={13} />} title={t('editor.resetHotkeys')} desc={t('editor.resetHotkeysDesc')}>
            <ResetHotkeysButton />
          </Row>
        </div>
      </>
    );
  }

  if (cat === 'integrations') {
    return (
      <div className="rows">
        <Row icon={<Wrench size={13} />} title={t('editor.steam')} desc={t('editor.steamDesc')}>
          <span className="chip-static">{t('workshop.notConnected')}</span>
        </Row>
        <Row icon={<Users size={13} />} title={t('editor.community')} desc={t('editor.communityDesc')}>
          <span className="chip-static">{t('workshop.notConnected')}</span>
        </Row>
        <Row icon={<Share size={13} />} title={t('editor.shareCodes')} desc={t('editor.shareCodesDesc')}>
          <button type="button" className="btn btn-sm" onClick={() => setShareOpen(true)}>
            {t('editor.openShare')}
          </button>
        </Row>
        <Row icon={<Info size={13} />} title={t('editor.localLibrary')} desc={t('editor.localLibraryDesc')}>
          <span className="chip-static" style={{ color: 'var(--green)', borderColor: 'color-mix(in srgb, var(--green) 35%, transparent)' }}>
            {t('editor.active')}
          </span>
        </Row>
      </div>
    );
  }

  const isSaved = state.saved.some((item) => item.id === spec.id);

  return (
    <>
      <div className="panel group">
        <div className="group-title">{t('editor.designActions')}</div>
        <div className="grid-2">
          <button type="button" className="btn" onClick={() => patchSpec({ offsetX: 0, offsetY: 0, size: 1, rotation: 0 })}>
            <RotateCcw size={13} />
            {t('editor.resetPosition')}
          </button>
          <button type="button" className="btn" onClick={() => saveAs(spec)}>
            <Copy size={13} />
            {t('editor.duplicate')}
          </button>
          <button type="button" className="btn" onClick={() => saveCurrent()}>
            <Bookmark size={13} />
            {t('editor.saveToLibrary')}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => window.crossforge.exportSpec(spec).then((path) => path && toast(t('toasts.exported'), 'green'))}
          >
            <Download size={13} />
            {t('editor.exportFile')}
          </button>
        </div>
        <div className="mt-12">
          <button
            type="button"
            className="btn btn-danger w-full"
            disabled={!isSaved}
            onClick={async () => {
              await removeSaved(spec.id);
              toast(t('toasts.deleted'));
            }}
          >
            <Trash size={13} />
            {isSaved ? t('editor.deleteFromLibrary') : t('editor.onlySaved')}
          </button>
        </div>
      </div>

      <div className="panel group" style={{ marginTop: 14 }}>
        <div className="group-title">{t('editor.summary')}</div>
        <div className="kv">
          <span>{t('editor.layers')}</span>
          <b>{spec.layers.length}</b>
        </div>
        <div className="kv">
          <span>{t('editor.colour')}</span>
          <b>{spec.color.toUpperCase()}</b>
        </div>
        <div className="kv">
          <span>{t('editor.position')}</span>
          <b>
            {spec.offsetX} / {spec.offsetY}
          </b>
        </div>
        <div className="kv">
          <span>{t('editor.designId')}</span>
          <b>{spec.id.slice(0, 12)}</b>
        </div>
      </div>
    </>
  );
}

function ResetButton({ onClick }: { onClick: () => void }) {
  const { t } = useApp();
  return (
    <button type="button" className="step-btn" onClick={onClick} title={t('common.reset')}>
      <RotateCcw size={11} />
    </button>
  );
}

function ResetHotkeysButton() {
  const { t, resetHotkeys } = useApp();
  return (
    <button type="button" className="btn btn-sm" onClick={() => resetHotkeys()}>
      <RotateCcw size={11} />
      {t('common.reset')}
    </button>
  );
}

function PositionKeybinds() {
  const { state, t, setSetting } = useApp();
  const mode = state.settings.nudge;
  const keys = mode === 'numpad' ? ['8', '4', '2', '6'] : mode === 'arrows' ? ['↑', '←', '↓', '→'] : [];

  return (
    <Row icon={<Keyboard size={13} />} title={t('editor.keybinds')} desc={t('editor.keybindsDesc')}>
      <div className="key-chip">
        <span className="kbd">Ctrl</span>
        <span className="mute" style={{ fontSize: 9 }}>
          +
        </span>
        <span className="kbd">Alt</span>
        {keys.map((key) => (
          <span className="kbd" key={key}>
            {key}
          </span>
        ))}
      </div>
      <select className="field" style={{ width: 136 }} value={mode} onChange={(event) => setSetting('nudge', event.target.value as 'arrows' | 'numpad' | 'off')}>
        <option value="arrows">{t('nudge.arrows')}</option>
        <option value="numpad">{t('nudge.numpad')}</option>
        <option value="off">{t('common.off')}</option>
      </select>
    </Row>
  );
}

function SavedPositions() {
  const { spec, patchSpec, t, toast } = useApp();
  const [name, setName] = useState('');
  const positions = spec.positions ?? [];

  const addPosition = () => {
    if (positions.length >= 12) {
      toast(t('toasts.maxPositions'));
      return;
    }
    const label = name.trim() || `${t('editor.savedPositions')} ${positions.length + 1}`;
    patchSpec({
      positions: [...positions, { id: uid(), name: label.slice(0, 24), x: spec.offsetX, y: spec.offsetY }],
    });
    setName('');
    toast(t('toasts.positionSaved', { name: label }), 'green');
  };

  return (
    <>
      <Row
        icon={<Bookmark size={13} />}
        title={t('editor.savedPositions')}
        desc={positions.length ? t('editor.savedPositionsDesc', { count: positions.length }) : t('editor.noPositions')}
      >
        <input
          className="field sm"
          style={{ width: 140 }}
          placeholder={t('editor.positionName')}
          value={name}
          maxLength={24}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && addPosition()}
        />
        <button type="button" className="btn btn-sm" onClick={addPosition}>
          <Bookmark size={11} />
          {t('editor.savePosition')}
        </button>
      </Row>
      {positions.map((position) => (
        <div className="row" key={position.id}>
          <span className="row-ico">
            <Check size={12} />
          </span>
          <div className="row-info">
            <div className="row-title">{position.name}</div>
            <div className="row-desc mono">
              X {position.x} · Y {position.y}
            </div>
          </div>
          <div className="row-control">
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => {
                patchSpec({ offsetX: position.x, offsetY: position.y });
                toast(t('toasts.positionApplied', { name: position.name }), 'green');
              }}
            >
              {t('editor.applyPosition')}
            </button>
            <button
              type="button"
              className="tiny-btn danger"
              aria-label={t('common.delete')}
              onClick={() => patchSpec({ positions: positions.filter((item) => item.id !== position.id) })}
            >
              <Trash size={12} />
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

function Swatches({ color, onChange }: { color: string; onChange: (color: string) => void }) {
  const { t } = useApp();
  return (
    <div className="swatches">
      {SWATCHES.map((item) => (
        <button
          key={item}
          type="button"
          className={`swatch${color.toLowerCase() === item ? ' active' : ''}`}
          style={{ background: item }}
          aria-label={item}
          onClick={() => onChange(item)}
        />
      ))}
      <label className="swatch" title={t('editor.colour')} style={{ background: 'conic-gradient(from 0deg,#ff5c7a,#ffb347,#ffe066,#9dff6b,#7fe7ff,#b388ff,#ff5c7a)' }}>
        <input
          type="color"
          value={color}
          onChange={(event) => onChange(event.target.value)}
          style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
        />
      </label>
    </div>
  );
}

function describeLayer(layer: Layer): string {
  if (layer.kind === 'cross' || layer.kind === 'brackets') {
    return `len ${round(layer.length)} · th ${round(layer.thickness)} · gap ${round(layer.gap)}`;
  }
  if (layer.kind === 'dot') return `r ${round(layer.radius)}`;
  return `r ${round(layer.radius)} · th ${round(layer.thickness)}`;
}

function LayerEditor() {
  const { spec, patchLayer, removeLayer, addLayer, t } = useApp();
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div>
      <div className="layer-list">
        {spec.layers.map((layer) => {
          const Icon = LAYER_ICON[layer.kind];
          return (
            <div key={layer.id}>
              <div
                className={`layer-item${activeId === layer.id ? ' active' : ''}${layer.enabled ? '' : ' disabled'}`}
                onClick={() => setActiveId(activeId === layer.id ? null : layer.id)}
              >
                <span className="layer-ico">
                  <Icon size={13} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="layer-name">{t(layerKey(layer.kind))}</div>
                  <div className="layer-sub">{describeLayer(layer)}</div>
                </div>
                <div className="layer-tools" onClick={(event) => event.stopPropagation()}>
                  <button type="button" className="tiny-btn" aria-label={t('editor.overlay')} onClick={() => patchLayer(layer.id, { enabled: !layer.enabled })}>
                    <Eye size={12} style={{ opacity: layer.enabled ? 1 : 0.4 }} />
                  </button>
                  <button type="button" className="tiny-btn danger" aria-label={t('common.delete')} onClick={() => removeLayer(layer.id)}>
                    <Trash size={12} />
                  </button>
                </div>
              </div>
              {activeId === layer.id ? (
                <div className="layer-editor">
                  {layer.kind === 'cross' || layer.kind === 'brackets' ? (
                    <>
                      <NumberField label={t('editor.length')} value={layer.length} min={0} max={200} step={0.5} onChange={(value) => patchLayer(layer.id, { length: value })} />
                      <NumberField label={t('editor.thickness')} value={layer.thickness} min={0.2} max={20} step={0.2} onChange={(value) => patchLayer(layer.id, { thickness: value })} />
                      <NumberField label={t('editor.gap')} value={layer.gap} min={0} max={200} step={0.5} onChange={(value) => patchLayer(layer.id, { gap: value })} />
                    </>
                  ) : (
                    <NumberField label={t('editor.radius')} value={layer.radius} min={0.5} max={120} step={0.5} onChange={(value) => patchLayer(layer.id, { radius: value })} />
                  )}
                  {layer.kind !== 'dot' && layer.kind !== 'cross' && layer.kind !== 'brackets' ? (
                    <NumberField label={t('editor.thickness')} value={layer.thickness} min={0.2} max={20} step={0.2} onChange={(value) => patchLayer(layer.id, { thickness: value })} />
                  ) : null}
                  <NumberField label={t('editor.rotation')} value={layer.rotation} min={-180} max={180} step={1} onChange={(value) => patchLayer(layer.id, { rotation: value })} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="add-layer">
        {(Object.keys(LAYER_ICON) as LayerKind[]).map((kind) => {
          const Icon = LAYER_ICON[kind];
          return (
            <button type="button" key={kind} className="btn" onClick={() => addLayer(kind)}>
              <Icon size={11} />
              {t(layerKey(kind))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="mini-field">
      <span className="mini-label">{label}</span>
      <input
        className="field"
        type="number"
        min={min}
        max={max}
        step={step}
        value={round(value)}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) onChange(Math.min(max, Math.max(min, next)));
        }}
      />
    </label>
  );
}

function Inspector({ displays }: { displays: DisplayInfo[] }) {
  const { spec, patchSpec, state, t, setSetting, toggleOverlay } = useApp();
  const overlayOn = state.settings.overlayVisible;

  return (
    <aside className="panel inspector">
      <div className="stage ticks" style={{ cursor: 'crosshair', touchAction: 'none' }}>
        <i />
        <i />
        <i />
        <i />
        <CrosshairCanvas spec={spec} fill draggable onOffset={(x, y) => patchSpec({ offsetX: x, offsetY: y })} />
        <span className="stage-meta">
          X {spec.offsetX} · Y {spec.offsetY}
        </span>
        <span className="stage-hint">{t('editor.dragHint')}</span>
      </div>

      <div className="inspector-block">
        <div className="mini-label">{t('editor.size')}</div>
        <Slider value={spec.size} min={0.4} max={2.5} step={0.05} onChange={(value) => patchSpec({ size: value })} format={(value) => `${value.toFixed(2)}×`} />
      </div>

      <div className="inspector-block">
        <div className="mini-label">{t('editor.colour')}</div>
        <Swatches color={spec.color} onChange={(color) => patchSpec({ color })} />
      </div>

      <div className="inspector-block">
        <div className="mini-label">{t('editor.monitor')}</div>
        <select className="field" value={state.settings.monitor} onChange={(event) => setSetting('monitor', event.target.value)}>
          <option value="primary">{t('settings.primary')}</option>
          {displays.map((display) => (
            <option key={display.id} value={display.id}>
              {display.label}
            </option>
          ))}
        </select>
      </div>

      <div className="inspector-row">
        <span className={`dot${overlayOn ? ' on' : ''}`} />
        <span>{overlayOn ? t('header.overlayLive') : t('header.overlayOff')}</span>
        <span className="spacer" />
        <Switch checked={overlayOn} onChange={(value) => toggleOverlay(value)} label={t('editor.overlay')} />
      </div>

      <div className="flex" style={{ gap: 6 }}>
        <button type="button" className="btn btn-sm" style={{ flex: 1 }} onClick={() => toggleOverlay(true)}>
          <Eye size={12} />
          {t('common.on')}
        </button>
        <button type="button" className="btn btn-sm" style={{ flex: 1 }} onClick={() => toggleOverlay(false)}>
          {t('common.off')}
        </button>
      </div>

      <div className="mono" style={{ fontSize: 9, color: 'var(--text-mute)', letterSpacing: '.04em' }}>
        {prettyAccelerator(state.settings.hotkeys.toggle)} · {prettyAccelerator(state.settings.hotkeys.cycle)}
      </div>
    </aside>
  );
}

function RecordingPanel() {
  const { state, t, setSetting, toggleOverlay } = useApp();
  return (
    <div className="rows">
      <Row icon={<Eye size={13} />} title={t('editor.showInCaptures')} desc={t('editor.showInCapturesDesc')}>
        <Switch checked={!state.settings.hideFromCapture} onChange={(value) => setSetting('hideFromCapture', !value)} label={t('editor.showInCaptures')} />
      </Row>
      <Row icon={<Monitor size={13} />} title={t('editor.captureMethod')} desc={t('editor.captureMethodDesc')}>
        <span className="chip-static">{t('editor.windows')}</span>
      </Row>
      <Row icon={<Eye size={13} />} title={t('editor.overlayVisibility')} desc={t('editor.overlayVisibilityDesc')}>
        <Switch checked={state.settings.overlayVisible} onChange={(value) => toggleOverlay(value)} label={t('editor.overlayVisibility')} />
      </Row>
      <div className="row" style={{ display: 'flex', background: 'var(--bg-2)' }}>
        <Info size={14} style={{ color: 'var(--text-mute)', marginTop: 2 }} />
        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-mute)', lineHeight: 1.65 }}>{t('editor.captureNote')}</p>
      </div>
    </div>
  );
}

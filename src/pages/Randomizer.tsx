import { useState } from 'react';
import { useApp } from '../state/app';
import { CrosshairCanvas } from '../components/CrosshairCanvas';
import { randomSpec } from '../crosshair/random';
import { Slider } from '../components/ui';
import { categoryKey } from '../i18n';
import { Bookmark, Pen, Shuffle, Sparkles } from '../components/Icons';
import type { CrosshairSpec } from '../../shared/types';

export function Randomizer() {
  const { t, applySpec, saveAs, toast } = useApp();
  const [chaos, setChaos] = useState(0.55);
  const [draft, setDraft] = useState<CrosshairSpec>(() => randomSpec({ chaos: 0.55 }));
  const [rolling, setRolling] = useState(false);

  const roll = () => {
    setRolling(true);
    setDraft(randomSpec({ chaos }));
    window.setTimeout(() => setRolling(false), 220);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <span className="eyebrow">{t('nav.randomizer')}</span>
          <h1 className="page-title">{t('randomizer.title')}</h1>
          <p className="page-lede">{t('randomizer.subtitle')}</p>
        </div>
        <div className="page-head-actions">
          <button type="button" className="btn" onClick={() => saveAs(draft)}>
            <Bookmark size={13} />
            {t('randomizer.saveRoll')}
          </button>
          <button type="button" className="btn btn-accent" onClick={() => applySpec(draft)}>
            <Pen size={13} />
            {t('randomizer.open')}
          </button>
        </div>
      </div>

      <div className="random-stage">
        <div className="random-canvas">
          <div className="random-name">
            {draft.name} · {t(categoryKey(draft.category))}
          </div>
          <div style={{ opacity: rolling ? 0.2 : 1, transform: rolling ? 'scale(.94)' : 'none', transition: 'all .2s ease' }}>
            <CrosshairCanvas spec={{ ...draft, offsetX: 0, offsetY: 0, size: draft.size * 2.3 }} width={260} height={260} />
          </div>
          <button
            type="button"
            className="btn btn-accent"
            style={{ position: 'absolute', bottom: 20 }}
            onClick={() => {
              roll();
              toast(t('toasts.rolled', { name: draft.name }));
            }}
          >
            <Shuffle size={13} />
            {t('randomizer.rollAgain')}
          </button>
        </div>

        <div className="stack">
          <section className="panel group">
            <div className="group-title">{t('randomizer.settings')}</div>
            <div style={{ padding: '4px 0 12px' }}>
              <div className="setting-name">{t('randomizer.chaos')}</div>
              <div className="setting-desc" style={{ margin: '3px 0 9px' }}>
                {t('randomizer.chaosDesc')}
              </div>
              <Slider value={chaos} min={0} max={1} step={0.05} onChange={setChaos} format={(value) => `${Math.round(value * 100)}%`} />
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-name">{t('randomizer.preview')}</div>
                <div className="setting-desc">{t('randomizer.previewDesc')}</div>
              </div>
              <span className="chip-static">2.3×</span>
            </div>
            <button type="button" className="btn w-full mt-12" onClick={roll}>
              <Sparkles size={13} />
              {t('randomizer.generate')}
            </button>
          </section>

          <section className="panel group">
            <div className="group-title">{t('randomizer.roll')}</div>
            <div className="kv">
              <span>{t('randomizer.layers')}</span>
              <b>{draft.layers.length}</b>
            </div>
            <div className="kv">
              <span>{t('randomizer.colour')}</span>
              <b>{draft.color.toUpperCase()}</b>
            </div>
            <div className="kv">
              <span>{t('randomizer.glow')}</span>
              <b>{draft.glow ? `${draft.glow} px` : t('editor.offValue')}</b>
            </div>
            <div className="kv">
              <span>{t('randomizer.size')}</span>
              <b>{draft.size.toFixed(2)}×</b>
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text-mute)', marginTop: 10, lineHeight: 1.6 }}>{t('randomizer.note')}</div>
          </section>
        </div>
      </div>
    </div>
  );
}

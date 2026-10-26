import { useApp } from '../state/app';
import { PRESETS, TODAYS_PICK_ID } from '../../shared/presets';
import type { CrosshairSpec } from '../../shared/types';
import { CrosshairCanvas } from '../components/CrosshairCanvas';
import { categoryKey } from '../i18n';
import { compactNumber } from '../lib/format';
import { Bookmark, Compass, Pen, Play, Shuffle } from '../components/Icons';

export function Discover() {
  const { state, t, spec, go, applySpec, saveAs, toast } = useApp();
  const pick = PRESETS.find((preset) => preset.id === TODAYS_PICK_ID) ?? PRESETS[0];
  const recent = state.saved.slice(0, 3);
  const overlayOn = state.settings.overlayVisible;

  const surprise = () => {
    const random = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    applySpec(random);
    toast(t('toasts.rolled', { name: random.name }), 'green');
  };

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <span className="eyebrow">{t('discover.eyebrow')}</span>
          <h1 className="page-title">{t('discover.title')}</h1>
          <p className="page-lede">{t('discover.subtitle')}</p>
        </div>
        <div className="page-head-actions">
          <button type="button" className="btn" onClick={surprise}>
            <Shuffle size={14} />
            {t('discover.randomAction')}
          </button>
          <button type="button" className="btn btn-accent" onClick={() => go('editor')}>
            <Pen size={14} />
            {t('discover.openDesigner')}
          </button>
        </div>
      </div>

      <div className="hero-grid">
        <section className="panel featured">
          <div className="featured-top">
            <span className="eyebrow plain">{t('discover.featured')}</span>
            <span className="chip-static">{t(categoryKey(pick.category))}</span>
          </div>
          <div className="stage ticks">
            <i />
            <i />
            <i />
            <i />
            <CrosshairCanvas spec={{ ...pick, offsetX: 0, offsetY: 0, size: pick.size * 1.9 }} width={300} height={280} />
            <span className="stage-meta">01 / 1:1 / 1920 x 1080</span>
          </div>
          <div className="featured-foot">
            <div style={{ minWidth: 0 }}>
              <h2 className="featured-name">{pick.name}</h2>
              <div className="featured-meta">
                <span>{t('discover.byAuthor', { author: pick.author })}</span>
                <span>/</span>
                <span>{t('editor.layersCount', { count: pick.layers.length })}</span>
                <span>/</span>
                <span>{pick.color.toUpperCase()}</span>
              </div>
            </div>
            <span className="spacer" />
            <button type="button" className="btn" onClick={() => saveAs(pick)}>
              <Bookmark size={14} />
              {t('discover.saveCopy')}
            </button>
            <button type="button" className="btn btn-accent" onClick={() => applySpec(pick)}>
              <Play size={13} />
              {t('common.use')}
            </button>
          </div>
        </section>

        <aside className="side-stack">
          <div className="panel metrics">
            <div className="metric">
              <span className="metric-label">{t('discover.stats.designs')}</span>
              <span className="metric-value">{compactNumber(PRESETS.length)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">{t('discover.stats.saved')}</span>
              <span className="metric-value">{compactNumber(state.saved.length)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">{t('discover.stats.overlay')}</span>
              <span className="metric-value" style={{ fontSize: 13, letterSpacing: 0 }}>
                <span className={`dot${overlayOn ? ' on' : ''}`} style={{ display: 'inline-block', marginRight: 6 }} />
                {overlayOn ? t('common.on') : t('common.off')}
              </span>
            </div>
          </div>

          <div className="panel recent">
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              {t('discover.recent')}
            </div>
            {recent.length === 0 ? (
              <div className="recent-empty">{t('discover.recentEmpty')}</div>
            ) : (
              recent.map((item: CrosshairSpec) => (
                <button
                  key={item.id}
                  type="button"
                  className="recent-row"
                  style={{ width: '100%', background: 'transparent', borderLeft: 0, borderRight: 0, borderTop: 0, cursor: 'pointer', textAlign: 'left' }}
                  onClick={() => applySpec(item)}
                >
                  <span className="recent-thumb">
                    <CrosshairCanvas spec={{ ...item, offsetX: 0, offsetY: 0, size: item.size * 1.2 }} width={30} height={30} />
                  </span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span className="recent-name" style={{ display: 'block' }}>
                      {item.name}
                    </span>
                    <span className="recent-meta" style={{ display: 'block' }}>
                      {t(categoryKey(item.category))}
                    </span>
                  </span>
                  <Play size={12} style={{ color: 'var(--text-mute)' }} />
                </button>
              ))
            )}
          </div>
        </aside>
      </div>

      <div className="section-head">
        <span className="eyebrow">{t('discover.picks')}</span>
        <span className="mute" style={{ fontSize: 11 }}>
          {t('discover.picksSub')}
        </span>
        <span className="rule" />
      </div>

      <div className="shelf">
        {PRESETS.slice(0, 6).map((preset) => (
          <button type="button" className="shelf-card" key={preset.id} onClick={() => applySpec(preset)}>
            <span className="shelf-thumb">
              <CrosshairCanvas spec={{ ...preset, offsetX: 0, offsetY: 0, size: preset.size * 1.65 }} width={86} height={78} />
            </span>
            <span className="shelf-name" style={{ display: 'block' }}>
              {preset.name}
            </span>
            <span className="shelf-meta" style={{ display: 'block' }}>
              {t(categoryKey(preset.category))}
            </span>
          </button>
        ))}
      </div>

      <div className="panel notes">
        <span className="eyebrow" style={{ flex: 0 }}>
          {t('discover.labNotes')}
        </span>
        <ul>
          <li>{t('discover.labNote1')}</li>
          <li>{t('discover.labNote2')}</li>
          <li>{t('discover.labNote3')}</li>
        </ul>
      </div>

      <div className="flex" style={{ marginTop: 18, gap: 10 }}>
        <span className="chip-static">
          <Compass size={11} style={{ marginRight: 4 }} />
          {spec.name}
        </span>
        <span className="mute" style={{ fontSize: 10.5 }}>
          {t('hints.discover')}
        </span>
      </div>
    </div>
  );
}

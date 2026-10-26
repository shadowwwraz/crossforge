import { useApp } from '../state/app';
import { CrosshairCanvas } from '../components/CrosshairCanvas';
import { PRESETS } from '../../shared/presets';
import { Lock, MousePointer, Palette, Sparkles, Target } from '../components/Icons';

export function Cursor() {
  const { t, spec } = useApp();
  const preview = { ...PRESETS[8], offsetX: 0, offsetY: 0 };

  const roadmap = [
    { icon: <MousePointer size={15} />, title: t('cursor.scaling'), text: t('cursor.scalingText'), status: t('cursor.inDesign') },
    { icon: <Palette size={15} />, title: t('cursor.themes'), text: t('cursor.themesText'), status: t('cursor.next') },
    { icon: <Target size={15} />, title: t('cursor.profiles'), text: t('cursor.profilesText'), status: t('cursor.exploring') },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <span className="eyebrow">{t('nav.cursor')}</span>
          <h1 className="page-title">{t('cursor.title')}</h1>
          <p className="page-lede">{t('cursor.subtitle')}</p>
        </div>
        <div className="page-head-actions">
          <span className="chip-static">
            <Lock size={10} style={{ marginRight: 4 }} />
            {t('cursor.preview')}
          </span>
        </div>
      </div>

      <div className="roadmap">
        {roadmap.map((item) => (
          <article className="panel feature-card" key={item.title}>
            <div className="flex" style={{ justifyContent: 'space-between' }}>
              <span className="feature-ico">{item.icon}</span>
              <span className="chip-static">{item.status}</span>
            </div>
            <div className="feature-title">{item.title}</div>
            <div className="feature-text">{item.text}</div>
          </article>
        ))}
      </div>

      <div className="panel mt-16" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 18 }}>
        <div className="stage" style={{ width: 132, height: 132, flex: '0 0 132px' }}>
          <CrosshairCanvas spec={preview} width={104} height={104} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span className="eyebrow">{t('cursor.meanwhile')}</span>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>{t('cursor.meanwhileTitle')}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-dim)', lineHeight: 1.65, marginTop: 4 }}>{t('cursor.meanwhileText')}</div>
          <div className="flex mt-12" style={{ gap: 8 }}>
            <span className="chip-static">
              <Sparkles size={10} style={{ marginRight: 4 }} />
              {spec.name}
            </span>
            <span className="chip-static">{t('cursor.engine')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

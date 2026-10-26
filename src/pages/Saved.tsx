import { useApp } from '../state/app';
import { categoryKey } from '../i18n';
import { DesignCard } from '../components/DesignCard';
import { Bookmark, Compass, Trash } from '../components/Icons';
import { EmptyState } from '../components/ui';

export function Saved() {
  const { state, t, applySpec, removeSaved, go, saveCurrent, toast } = useApp();

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <span className="eyebrow">{t('nav.saved')}</span>
          <h1 className="page-title">{t('saved.title')}</h1>
          <p className="page-lede">{t('saved.subtitle', { count: state.saved.length })}</p>
        </div>
        <div className="page-head-actions">
          <button type="button" className="btn" onClick={() => go('browse')}>
            <Compass size={13} />
            {t('saved.browse')}
          </button>
          <button type="button" className="btn btn-accent" onClick={() => saveCurrent()}>
            <Bookmark size={13} />
            {t('saved.saveCurrent')}
          </button>
        </div>
      </div>

      {state.saved.length === 0 ? (
        <EmptyState
          icon={<Bookmark size={20} />}
          title={t('saved.emptyTitle')}
          sub={t('saved.emptyText')}
          action={
            <button type="button" className="btn btn-accent" onClick={() => go('browse')}>
              <Compass size={13} />
              {t('saved.browse')}
            </button>
          }
        />
      ) : (
        <div className="grid">
          {state.saved.map((spec) => (
            <DesignCard
              key={spec.id}
              spec={spec}
              badge={t(categoryKey(spec.category))}
              selected={state.current.id === spec.id}
              onUse={() => {
                applySpec(spec);
                toast(t('toasts.switched'), 'green');
              }}
              onSave={() => {
                applySpec(spec);
                toast(t('toasts.switched'), 'green');
              }}
              onRemove={() => removeSaved(spec.id)}
            />
          ))}
        </div>
      )}

      <div className="panel" style={{ marginTop: 18, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="empty-ico" style={{ width: 34, height: 34, borderRadius: 6 }}>
          <Trash size={14} />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 550 }}>{t('saved.localTitle')}</div>
          <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>{t('saved.localText')}</div>
        </div>
      </div>
    </div>
  );
}

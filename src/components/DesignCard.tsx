import type { MouseEvent } from 'react';
import type { CrosshairSpec } from '../../shared/types';
import { Bookmark, Download, Heart, Play, Trash } from './Icons';
import { formatCount } from '../lib/format';
import { CrosshairCanvas } from './CrosshairCanvas';
import { useApp } from '../state/app';

interface Props {
  spec: CrosshairSpec;
  badge?: string;
  selected?: boolean;
  onUse: () => void;
  onSave?: () => void;
  onRemove?: () => void;
}

export function DesignCard({ spec, badge, selected, onUse, onSave, onRemove }: Props) {
  const { t } = useApp();
  const preview: CrosshairSpec = { ...spec, offsetX: 0, offsetY: 0, size: spec.size * 1.55 };
  const stop = (event: MouseEvent) => event.stopPropagation();

  return (
    <article className={`design-card${selected ? ' selected' : ''}`} onClick={onUse}>
      <div className="design-thumb">
        {badge ? <span className="design-badge">{badge}</span> : null}
        <CrosshairCanvas spec={preview} width={124} height={124} />
        <div className="design-hover" onClick={stop}>
          <button
            type="button"
            className="btn btn-accent design-btn-use"
            onClick={onUse}
            title={t('common.use')}
          >
            <Play size={11} />
            <span>{t('common.use')}</span>
          </button>
          {onSave ? (
            <button
              type="button"
              className="btn design-btn-icon"
              onClick={onSave}
              title={onRemove ? t('common.duplicate') : t('common.save')}
              aria-label={onRemove ? t('common.duplicate') : t('common.save')}
            >
              <Bookmark size={12} />
            </button>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              className="btn btn-danger design-btn-icon"
              onClick={onRemove}
              title={t('common.delete')}
              aria-label={t('common.delete')}
            >
              <Trash size={12} />
            </button>
          ) : null}
        </div>
      </div>
      <div className="design-body">
        <div className="design-name">{spec.name}</div>
        <div className="design-meta">
          <span className="mute">{spec.author}</span>
          <span>
            <Download size={10} />
            {formatCount(spec.downloads)}
          </span>
          <span>
            <Heart size={10} />
            {formatCount(spec.likes)}
          </span>
        </div>
      </div>
    </article>
  );
}

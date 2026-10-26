import type { ComponentType } from 'react';
import { Bookmark, Compass, Grid, Help, Keyboard, MousePointer, Pen, Settings, Shuffle, Wrench, type IconProps } from './Icons';
import { useApp } from '../state/app';
import { navKey } from '../i18n';
import type { PageId } from '../../shared/types';

interface Entry {
  id: PageId;
  icon: ComponentType<IconProps>;
}

const LIBRARY: Entry[] = [
  { id: 'discover', icon: Compass },
  { id: 'browse', icon: Grid },
  { id: 'saved', icon: Bookmark },
  { id: 'workshop', icon: Wrench },
];

const TOOLS: Entry[] = [
  { id: 'editor', icon: Pen },
  { id: 'keybinds', icon: Keyboard },
  { id: 'cursor', icon: MousePointer },
  { id: 'randomizer', icon: Shuffle },
];

export function Rail() {
  const { page, go, state, t, toast } = useApp();

  const render = (entry: Entry) => {
    const Icon = entry.icon;
    const active = page === entry.id;
    return (
      <button
        key={entry.id}
        type="button"
        className={`rail-btn${active ? ' active' : ''}`}
        title={t(navKey(entry.id))}
        aria-label={t(navKey(entry.id))}
        onClick={() => go(entry.id)}
      >
        <Icon size={17} />
        {entry.id === 'saved' && state.saved.length > 0 ? <span className="rail-badge">{state.saved.length}</span> : null}
        {entry.id === 'editor' && state.settings.overlayVisible ? (
          <span className="rail-badge" style={{ color: 'var(--green)' }}>
            ●
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <nav className="rail" aria-label="Primary">
      <div className="rail-group">{LIBRARY.map(render)}</div>
      <div className="rail-div" />
      <div className="rail-group">{TOOLS.map(render)}</div>
      <div className="rail-spacer" />
      <button
        type="button"
        className={`rail-btn${page === 'settings' ? ' active' : ''}`}
        title={t('nav.settings')}
        aria-label={t('nav.settings')}
        onClick={() => go('settings')}
      >
        <Settings size={17} />
      </button>
      <button type="button" className="rail-btn" title={t('nav.help')} aria-label={t('nav.help')} onClick={() => toast(t('toasts.help'))}>
        <Help size={16} />
      </button>
    </nav>
  );
}

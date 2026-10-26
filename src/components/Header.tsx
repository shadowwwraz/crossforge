import { useApp } from '../state/app';
import { useSquad } from '../state/squad';
import { navKey } from '../i18n';
import { Moon, Share, Sun, Users } from './Icons';
import type { PageId } from '../../shared/types';

const ORDER: PageId[] = ['discover', 'browse', 'saved', 'workshop', 'editor', 'keybinds', 'cursor', 'randomizer', 'settings'];

export function Header() {
  const { page, t, state, toggleOverlay, setShareOpen, setSetting, lang, theme } = useApp();
  const { toggleSquad, isOpen: squadOpen, members } = useSquad();
  const overlayOn = state.settings.overlayVisible;
  const index = String(ORDER.indexOf(page) + 1).padStart(2, '0');

  return (
    <header className="header">
      <div className="header-title">
        <span>
          {t('titlebar.workbench')} / {index}
        </span>
        <strong>{t(navKey(page))}</strong>
      </div>

      <div className="header-actions">
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => toggleOverlay()}
          title={`${t('editor.toggleOverlay')} (${state.settings.hotkeys.toggle})`}
        >
          <span className={`dot${overlayOn ? ' on' : ''}`} />
          {overlayOn ? t('header.overlayLive') : t('header.overlayOff')}
        </button>
        <span className="header-div" />
        <button
          type="button"
          className="language-quick"
          title={t('header.theme')}
          aria-label={t('header.theme')}
          onClick={() => setSetting('theme', theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>
        <button
          type="button"
          className="language-quick"
          title={t('header.language')}
          aria-label={t('header.language')}
          onClick={() => setSetting('language', lang === 'ru' ? 'en' : 'ru')}
        >
          {lang.toUpperCase()}
        </button>
        <button type="button" className="btn btn-sm" onClick={() => setShareOpen(true)}>
          <Share size={13} />
          {t('common.share')}
        </button>
        <button
          type="button"
          className={`btn btn-sm squad-toggle-btn${squadOpen ? ' active' : ''}`}
          onClick={toggleSquad}
          title={t('squad.title')}
        >
          <Users size={13} />
          {t('squad.button')}
          <span className="squad-header-pill">{members.length}</span>
        </button>
        <button
          type="button"
          className="avatar"
          style={{ background: 'var(--accent)', color: 'var(--on-accent)', cursor: 'pointer', border: 'none' }}
          onClick={toggleSquad}
          title={t('squad.title')}
        >
          Y
        </button>
      </div>
    </header>
  );
}

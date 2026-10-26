import { useEffect, useState } from 'react';
import { CloseIcon, MaximizeIcon, MinimizeIcon, RestoreIcon } from './Icons';
import { useApp } from '../state/app';
import { navKey } from '../i18n';

export function TitleBar() {
  const { page, t } = useApp();
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    window.crossforge.window.isMaximized().then(setMaximized);
    return window.crossforge.onMaximized(setMaximized);
  }, []);

  return (
    <header className="titlebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 3v5M12 16v5M3 12h5M16 12h5" strokeLinecap="round" />
            <rect x="9.4" y="9.4" width="5.2" height="5.2" />
          </svg>
        </span>
        <span className="brand-word">
          CrossForge<em>studio</em>
        </span>
      </div>
      <div className="titlebar-path">
        <b>crossforge</b>
        <span>/</span>
        <span>{t(navKey(page))}</span>
        <span>·</span>
        <span>{t('titlebar.subtitle')}</span>
      </div>
      <div className="win-controls">
        <button type="button" className="win-btn" aria-label="Minimize" onClick={() => window.crossforge.window.minimize()}>
          <MinimizeIcon size={13} />
        </button>
        <button
          type="button"
          className="win-btn"
          aria-label={maximized ? 'Restore' : 'Maximize'}
          onClick={() => window.crossforge.window.toggleMaximize()}
        >
          {maximized ? <RestoreIcon size={12} /> : <MaximizeIcon size={12} />}
        </button>
        <button type="button" className="win-btn close" aria-label="Close" onClick={() => window.crossforge.window.close()}>
          <CloseIcon size={13} />
        </button>
      </div>
    </header>
  );
}

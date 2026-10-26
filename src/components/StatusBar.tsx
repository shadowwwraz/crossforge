import { useApp } from '../state/app';
import { hintKey } from '../i18n';
import { PRESETS } from '../../shared/presets';

export function StatusBar() {
  const { t, state, page } = useApp();
  const overlayOn = state.settings.overlayVisible;

  return (
    <footer className="statusbar">
      <span className={`dot${overlayOn ? ' on' : ''}`} />
      <span>{overlayOn ? t('status.overlayLive') : t('status.overlayHidden')}</span>
      <span className="sep" />
      <span>{t('status.designs', { count: PRESETS.length })}</span>
      <span className="sep" />
      <span>{t('status.local')}</span>
      <span className="status-hint">
        <b>{t(hintKey(page))}</b>
      </span>
      <span className="sep" />
      <span>
        {state.settings.hotkeys.toggle} · {state.settings.hotkeys.cycle} · {state.settings.hotkeys.editor}
      </span>
    </footer>
  );
}

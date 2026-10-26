import { useApp } from '../state/app';
import { KeyCapture, prettyAccelerator } from '../components/KeyCapture';
import { Keyboard, RotateCcw, Zap } from '../components/Icons';
import type { Settings as SettingsType } from '../../shared/types';

export function Keybinds() {
  const { state, t, setHotkey, resetHotkeys, setSetting } = useApp();

  const rows: Array<{ key: keyof SettingsType['hotkeys']; title: string; desc: string }> = [
    { key: 'toggle', title: t('keybinds.toggle'), desc: t('editor.toggleOverlayDesc') },
    { key: 'cycle', title: t('keybinds.cycle'), desc: t('editor.nextDesignDesc') },
    { key: 'editor', title: t('keybinds.editor'), desc: t('editor.openDesignerDesc') },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <span className="eyebrow">{t('nav.keybinds')}</span>
          <h1 className="page-title">{t('keybinds.title')}</h1>
          <p className="page-lede">{t('keybinds.subtitle')}</p>
        </div>
        <div className="page-head-actions">
          <button type="button" className="btn" onClick={() => resetHotkeys()}>
            <RotateCcw size={13} />
            {t('keybinds.reset')}
          </button>
        </div>
      </div>

      <div className="settings-grid">
        <div className="stack">
          <section className="panel group">
            <div className="group-title">{t('keybinds.global')}</div>
            <div className="bind-table" style={{ marginTop: 8 }}>
              {rows.map((row) => (
                <div className="bind-row" key={row.key}>
                  <span className="row-ico">
                    <Keyboard size={13} />
                  </span>
                  <div className="setting-info">
                    <div className="setting-name">{row.title}</div>
                    <div className="setting-desc">{row.desc}</div>
                  </div>
                  <div className="flex">
                    <span
                      className={`dot${state.settings.registered[row.key] ? ' on' : ''}`}
                      title={state.settings.registered[row.key] ? t('editor.registered') : t('editor.notRegistered')}
                    />
                    <KeyCapture value={state.settings.hotkeys[row.key]} onChange={(accelerator) => setHotkey(row.key, accelerator)} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel group">
            <div className="group-title">{t('keybinds.nudge')}</div>
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-name">{t('keybinds.nudgeKeys')}</div>
                <div className="setting-desc">{t('keybinds.nudgeKeysDesc')}</div>
              </div>
              <select
                className="field"
                style={{ width: 150 }}
                value={state.settings.nudge}
                onChange={(event) => setSetting('nudge', event.target.value as SettingsType['nudge'])}
              >
                <option value="arrows">{t('nudge.arrows')}</option>
                <option value="numpad">{t('nudge.numpad')}</option>
                <option value="off">{t('common.off')}</option>
              </select>
            </div>
            <div className="flex" style={{ gap: 4, paddingTop: 12, flexWrap: 'wrap' }}>
              <span className="kbd">Ctrl</span>
              <span className="mute" style={{ fontSize: 9 }}>
                +
              </span>
              <span className="kbd">Alt</span>
              {(state.settings.nudge === 'numpad' ? ['8', '4', '2', '6'] : state.settings.nudge === 'arrows' ? ['↑', '←', '↓', '→'] : []).map((key) => (
                <span className="kbd" key={key}>
                  {key}
                </span>
              ))}
              <span className="mute" style={{ fontSize: 10.5, marginLeft: 6 }}>
                {t('keybinds.nudgeHint')}
              </span>
            </div>
          </section>

          <section className="panel group">
            <div className="group-title">{t('keybinds.current')}</div>
            <div className="kv">
              <span>{t('keybinds.toggle')}</span>
              <b>{prettyAccelerator(state.settings.hotkeys.toggle)}</b>
            </div>
            <div className="kv">
              <span>{t('keybinds.cycle')}</span>
              <b>{prettyAccelerator(state.settings.hotkeys.cycle)}</b>
            </div>
            <div className="kv">
              <span>{t('keybinds.editor')}</span>
              <b>{prettyAccelerator(state.settings.hotkeys.editor)}</b>
            </div>
          </section>
        </div>

        <div className="stack">
          <section className="panel group">
            <div className="group-title">{t('keybinds.tips')}</div>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.7, margin: '0 0 10px' }}>{t('keybinds.tip1')}</p>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.7, margin: '0 0 10px' }}>{t('keybinds.tip2')}</p>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.7, margin: 0 }}>{t('keybinds.tip3')}</p>
          </section>

          <section className="panel group">
            <div className="group-title">{t('keybinds.quick')}</div>
            <div className="flex" style={{ gap: 8 }}>
              <span className={`dot${state.settings.overlayVisible ? ' on' : ''}`} />
              <span style={{ fontSize: 12 }}>{state.settings.overlayVisible ? t('keybinds.live') : t('keybinds.hidden')}</span>
            </div>
            <div className="flex" style={{ gap: 7, marginTop: 12 }}>
              <Zap size={12} style={{ color: 'var(--text-mute)' }} />
              <span style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>{t('keybinds.keep')}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

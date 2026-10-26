import { useEffect, useState } from 'react';
import { useApp } from '../state/app';
import { Segmented, SettingRow } from '../components/ui';
import { APP_VERSION, DEFAULT_SETTINGS } from '../../shared/spec';
import { Check, Eye, Logo, Monitor, RotateCcw, Settings as SettingsIcon, Zap } from '../components/Icons';
import type { DisplayInfo, Settings as SettingsType } from '../../shared/types';

export function Settings() {
  const { state, t, setSetting, toast, setShareOpen, go } = useApp();
  const settings = state.settings;
  const [displays, setDisplays] = useState<DisplayInfo[]>([]);

  useEffect(() => {
    let alive = true;
    window.crossforge.getDisplays().then((list) => {
      if (alive) setDisplays(list);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <span className="eyebrow">{t('nav.settings')}</span>
          <h1 className="page-title">{t('settings.title')}</h1>
          <p className="page-lede">{t('settings.subtitle')}</p>
        </div>
        <div className="page-head-actions">
          <button
            type="button"
            className="btn"
            onClick={async () => {
              await window.crossforge.updateSettings(DEFAULT_SETTINGS);
              toast(t('toasts.settingsReset'), 'green');
            }}
          >
            <RotateCcw size={13} />
            {t('settings.resetAll')}
          </button>
        </div>
      </div>

      <div className="settings-grid">
        <div className="stack">
          <section className="panel group">
            <div className="group-title">{t('settings.appearance')}</div>

            <SettingRow title={t('settings.theme')} desc={t('settings.themeDesc')}>
              <Segmented
                value={settings.theme}
                onChange={(value) => setSetting('theme', value)}
                options={[
                  { value: 'dark', label: t('theme.dark') },
                  { value: 'light', label: t('theme.light') },
                  { value: 'system', label: t('theme.system') },
                ]}
              />
            </SettingRow>

            <SettingRow title={t('settings.language')} desc={t('settings.languageDesc')}>
              <Segmented
                value={settings.language}
                onChange={(value) => setSetting('language', value)}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'ru', label: 'Русский' },
                  { value: 'system', label: t('settings.languageSystem') },
                ]}
              />
            </SettingRow>

            <SettingRow title={t('settings.reduceMotion')} desc={t('settings.motionDesc')}>
              <button
                type="button"
                className={`switch${settings.reduceMotion ? ' on' : ''}`}
                role="switch"
                aria-checked={settings.reduceMotion}
                aria-label={t('settings.reduceMotion')}
                onClick={() => setSetting('reduceMotion', !settings.reduceMotion)}
              />
            </SettingRow>
          </section>

          <section className="panel group">
            <div className="group-title">{t('settings.overlayTitle')}</div>
            <SettingRow title={t('settings.overlayTitle')} desc={t('settings.overlayDesc')}>
              <span className={`dot${settings.overlayVisible ? ' on' : ''}`} />
              <button
                type="button"
                className={`switch${settings.overlayVisible ? ' on' : ''}`}
                role="switch"
                aria-checked={settings.overlayVisible}
                aria-label={t('settings.overlayTitle')}
                onClick={() => window.crossforge.setOverlay(!settings.overlayVisible)}
              />
            </SettingRow>
            <SettingRow title={t('settings.display')} desc={t('settings.displayDesc')}>
              <select className="field" style={{ width: 190 }} value={settings.monitor} onChange={(event) => setSetting('monitor', event.target.value)}>
                <option value="primary">{t('settings.primary')}</option>
                {displays.map((display) => (
                  <option key={display.id} value={display.id}>
                    {display.label}
                  </option>
                ))}
              </select>
            </SettingRow>
            <SettingRow title={t('settings.position')} desc={t('settings.positionDesc')}>
              <button type="button" className="btn btn-sm" onClick={() => go('editor')}>
                <Monitor size={12} />
                {t('settings.openDesigner')}
              </button>
            </SettingRow>
          </section>

          <section className="panel group">
            <div className="group-title">{t('settings.startup')}</div>
            <SettingRow title={t('settings.launch')} desc={t('settings.launchDesc')}>
              <button
                type="button"
                className={`switch${settings.launchAtLogin ? ' on' : ''}`}
                role="switch"
                aria-checked={settings.launchAtLogin}
                aria-label={t('settings.launch')}
                onClick={() => setSetting('launchAtLogin', !settings.launchAtLogin)}
              />
            </SettingRow>
            <SettingRow title={t('settings.minimized')} desc={t('settings.minimizedDesc')}>
              <button
                type="button"
                className={`switch${settings.startMinimized ? ' on' : ''}`}
                role="switch"
                aria-checked={settings.startMinimized}
                aria-label={t('settings.minimized')}
                onClick={() => setSetting('startMinimized', !settings.startMinimized)}
              />
            </SettingRow>
          </section>

          <section className="panel group">
            <div className="group-title">{t('settings.sharing')}</div>
            <SettingRow title={t('settings.codes')} desc={t('settings.codesDesc')}>
              <button type="button" className="btn btn-sm" onClick={() => setShareOpen(true)}>
                {t('settings.openShare')}
              </button>
            </SettingRow>
            <SettingRow title={t('settings.format')} desc={t('settings.formatDesc')}>
              <span className="chip-static">JSON</span>
            </SettingRow>
          </section>
        </div>

        <div className="stack">
          <section className="panel about-card">
            <div className="flex" style={{ gap: 12 }}>
              <span className="about-logo">
                <Logo size={20} />
              </span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 650 }}>{t('common.appName')}</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-mute)', marginTop: 2 }}>
                  {t('settings.version', { version: APP_VERSION })}
                </div>
              </div>
            </div>
            <div style={{ height: 1, background: 'var(--line)' }} />
            <div className="kv">
              <span>{t('settings.renderer')}</span>
              <b>Vector canvas</b>
            </div>
            <div className="kv">
              <span>{t('settings.runtime')}</span>
              <b>Electron · React</b>
            </div>
            <div className="kv">
              <span>{t('settings.overlayRow')}</span>
              <b>Click-through</b>
            </div>
            <div className="kv">
              <span>{t('settings.data')}</span>
              <b>%APPDATA%/CrossForge</b>
            </div>
            <div className="flex" style={{ gap: 6, color: 'var(--text-mute)', fontSize: 10 }}>
              <Check size={11} style={{ color: 'var(--green)' }} />
              {t('settings.noTelemetry')}
            </div>
          </section>

          <section className="panel group">
            <div className="group-title">{t('settings.safety')}</div>
            <div className="flex" style={{ gap: 9, alignItems: 'flex-start' }}>
              <Zap size={13} style={{ color: 'var(--accent)', marginTop: 1 }} />
              <div style={{ fontSize: 10.5, color: 'var(--text-dim)', lineHeight: 1.65 }}>{t('settings.safetyText')}</div>
            </div>
            <div style={{ height: 1, background: 'var(--line)', margin: '12px 0' }} />
            <div className="flex" style={{ gap: 9, alignItems: 'flex-start' }}>
              <Eye size={13} style={{ color: 'var(--text-mute)', marginTop: 1 }} />
              <div style={{ fontSize: 10.5, color: 'var(--text-dim)', lineHeight: 1.65 }}>{t('settings.fairnessText')}</div>
            </div>
          </section>

          <section className="panel group">
            <div className="group-title">{t('settings.shortcuts')}</div>
            <div className="kv">
              <span>{t('keybinds.toggle')}</span>
              <b>{settings.hotkeys.toggle}</b>
            </div>
            <div className="kv">
              <span>{t('keybinds.cycle')}</span>
              <b>{settings.hotkeys.cycle}</b>
            </div>
            <div className="kv">
              <span>{t('keybinds.editor')}</span>
              <b>{settings.hotkeys.editor}</b>
            </div>
            <button type="button" className="btn btn-sm mt-12" onClick={() => go('keybinds')}>
              <SettingsIcon size={12} />
              {t('settings.change')}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

export type { SettingsType };

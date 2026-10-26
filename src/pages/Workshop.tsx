import { useState } from 'react';
import { useApp } from '../state/app';
import { CrosshairCanvas } from '../components/CrosshairCanvas';
import { encodeShareCode } from '../../shared/codes';
import { categoryKey } from '../i18n';
import { Check, Copy, Download, Info, Share, Upload, Users, Wrench } from '../components/Icons';

export function Workshop() {
  const { spec, state, t, toast, setImportOpen, setShareOpen, go } = useApp();
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  const exportFile = async () => {
    const path = await window.crossforge.exportSpec(spec);
    if (path) toast(t('toasts.exportedTo', { file: path.split('\\').pop() ?? path }), 'green');
  };

  const copyCode = async () => {
    await window.crossforge.copyText(code);
    setCopied(true);
    toast(t('toasts.codeCopied'), 'green');
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <span className="eyebrow">{t('nav.workshop')}</span>
          <h1 className="page-title">{t('workshop.title')}</h1>
          <p className="page-lede">{t('workshop.subtitle')}</p>
        </div>
        <div className="page-head-actions">
          <button type="button" className="btn" onClick={() => setImportOpen(true)}>
            <Upload size={13} />
            {t('common.import')}
          </button>
          <button type="button" className="btn btn-accent" onClick={() => setShareOpen(true)}>
            <Share size={13} />
            {t('common.share')}
          </button>
        </div>
      </div>

      <div className="hero-grid">
        <section className="panel" style={{ padding: 16 }}>
          <div className="featured-top" style={{ marginBottom: 12 }}>
            <span className="eyebrow plain">{t('workshop.current')}</span>
            <span className="chip-static">{t(categoryKey(spec.category))}</span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div className="stage ticks" style={{ width: 200, height: 176, flex: '0 0 200px' }}>
              <i />
              <i />
              <i />
              <i />
              <CrosshairCanvas spec={{ ...spec, offsetX: 0, offsetY: 0, size: spec.size * 1.8 }} width={170} height={150} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 620, letterSpacing: '-0.6px' }}>{spec.name}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', marginTop: 4, letterSpacing: '.05em' }}>
                {t('editor.layersCount', { count: spec.layers.length })} · {spec.color.toUpperCase()}
              </div>
              <div className="grid-2" style={{ marginTop: 14 }}>
                <button type="button" className="btn" onClick={exportFile}>
                  <Download size={13} />
                  {t('workshop.exportFile')}
                </button>
                <button type="button" className="btn" onClick={() => setCode(encodeShareCode(spec))}>
                  <Share size={13} />
                  {t('workshop.createCode')}
                </button>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm mt-12"
                onClick={() => {
                  go('editor');
                  toast(t('hints.editor'));
                }}
              >
                {t('workshop.openDesigner')}
              </button>
            </div>
          </div>

          <div className="divider" style={{ height: 1, background: 'var(--line)', margin: '16px 0' }} />

          <div className="eyebrow plain" style={{ marginBottom: 10 }}>
            {t('workshop.shareCode')}
          </div>
          {code ? (
            <div className="code-box">
              <input value={code} readOnly onFocus={(event) => event.target.select()} />
              <button type="button" className="btn btn-sm" onClick={copyCode}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? t('common.copied') : t('common.copy')}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 11.5, color: 'var(--text-mute)', flex: 1 }}>{t('workshop.codeHint')}</span>
              <button type="button" className="btn btn-sm" onClick={() => setCode(encodeShareCode(spec))}>
                {t('workshop.generate')}
              </button>
            </div>
          )}
        </section>

        <div className="side-stack">
          <section className="panel group">
            <div className="group-title">{t('workshop.publish')}</div>
            <div className="setting-row">
              <span className="row-ico">
                <Wrench size={13} />
              </span>
              <div className="setting-info">
                <div className="setting-name">{t('workshop.steam')}</div>
                <div className="setting-desc">{t('workshop.steamNote')}</div>
              </div>
              <span className="chip-static">{t('workshop.notConnected')}</span>
            </div>
            <div className="setting-row">
              <span className="row-ico">
                <Users size={13} />
              </span>
              <div className="setting-info">
                <div className="setting-name">{t('workshop.community')}</div>
                <div className="setting-desc">{t('workshop.communityNote')}</div>
              </div>
              <span className="chip-static">{t('workshop.notConnected')}</span>
            </div>
            <p style={{ fontSize: 10.5, color: 'var(--text-mute)', lineHeight: 1.6, margin: '10px 0 0' }}>{t('workshop.offline')}</p>
          </section>

          <section className="panel group">
            <div className="group-title">{t('workshop.install')}</div>
            <div className="kv">
              <span>{t('workshop.bundled')}</span>
              <b>18</b>
            </div>
            <div className="kv">
              <span>{t('workshop.savedCount')}</span>
              <b>{state.saved.length}</b>
            </div>
            <div className="kv">
              <span>{t('workshop.format')}</span>
              <b>CrossForge v1</b>
            </div>
            <div className="kv">
              <span>{t('workshop.storage')}</span>
              <b>{t('workshop.localProfile')}</b>
            </div>
          </section>

          <div className="panel" style={{ padding: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Info size={14} style={{ color: 'var(--text-mute)', marginTop: 1 }} />
            <div style={{ fontSize: 10.5, color: 'var(--text-mute)', lineHeight: 1.6 }}>{t('workshop.codeWarning')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

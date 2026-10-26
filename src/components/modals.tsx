import { useEffect, useMemo, useState } from 'react';
import { Check, Code, Copy, Download, Info, Upload, Users, Wrench, X } from './Icons';
import { useApp } from '../state/app';
import { decodeShareCode, encodeShareCode } from '../../shared/codes';
import { normalizeSpec } from '../../shared/spec';
import type { MessageKey } from '../i18n';

type MethodId = 'steam' | 'community' | 'code' | 'export';

const METHODS: Array<{ id: MethodId; label: MessageKey; blurb: MessageKey; icon: typeof Wrench; soon?: boolean }> = [
  { id: 'steam', label: 'share.steam', blurb: 'share.steamBlurb', icon: Wrench, soon: true },
  { id: 'community', label: 'share.community', blurb: 'share.communityBlurb', icon: Users, soon: true },
  { id: 'code', label: 'share.code', blurb: 'share.codeBlurb', icon: Code },
  { id: 'export', label: 'share.export', blurb: 'share.exportBlurb', icon: Download },
];

export function ShareModal() {
  const { shareOpen, setShareOpen, spec, toast, t } = useApp();
  const [method, setMethod] = useState<MethodId>('code');
  const [hovered, setHovered] = useState<MethodId | null>(null);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (shareOpen) {
      setMethod('code');
      setCode('');
      setCopied(false);
      setHovered(null);
    }
  }, [shareOpen]);

  useEffect(() => {
    if (!shareOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShareOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shareOpen, setShareOpen]);

  const detail = useMemo(() => METHODS.find((item) => item.id === method)!, [method]);
  if (!shareOpen) return null;

  const copy = async () => {
    await window.crossforge.copyText(code);
    setCopied(true);
    toast(t('toasts.codeCopied'), 'green');
    window.setTimeout(() => setCopied(false), 1800);
  };

  const exportFile = async () => {
    const path = await window.crossforge.exportSpec(spec);
    if (path) {
      toast(t('toasts.exportedTo', { file: path.split('\\').pop() ?? path }), 'green');
      setShareOpen(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShareOpen(false)}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={t('share.title')}>
        <div className="modal-head">
          <div className="modal-title">{t('share.title')}</div>
          <span className="spacer" />
          <button type="button" className="win-btn" aria-label={t('common.close')} onClick={() => setShareOpen(false)}>
            <X size={14} />
          </button>
        </div>
        <div className="modal-sub">
          {t('share.subtitle', { name: spec.name, count: spec.layers.length, colour: spec.color.toUpperCase() })}
        </div>

        <div className="methods">
          {METHODS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={`method${method === item.id ? ' active' : ''}`}
                onClick={() => setMethod(item.id)}
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {item.soon ? <span className="method-soon">{t('share.soon')}</span> : null}
                <span className="method-ico">
                  <Icon size={22} />
                </span>
                <span className="method-label">{t(item.label)}</span>
              </button>
            );
          })}
        </div>

        <div className="modal-sub" style={{ margin: '12px 2px 0', minHeight: 32 }}>
          {hovered ? t(METHODS.find((item) => item.id === hovered)!.blurb) : t('share.hover')}
        </div>

        <div className="method-detail">
          {method === 'code' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Info size={13} style={{ color: 'var(--text-mute)' }} />
                <span style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>{t(detail.blurb)}</span>
              </div>
              {code ? (
                <div className="code-box">
                  <input value={code} readOnly onFocus={(event) => event.target.select()} />
                  <button type="button" className="btn btn-sm" onClick={copy}>
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? t('common.copied') : t('common.copy')}
                  </button>
                </div>
              ) : (
                <button type="button" className="btn btn-accent" onClick={() => setCode(encodeShareCode(spec))}>
                  {t('share.createCode')}
                </button>
              )}
            </>
          ) : method === 'export' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 550 }}>{t('share.fileName')}</div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>{t('share.fileHint')}</div>
              </div>
              <button type="button" className="btn btn-accent" onClick={exportFile}>
                <Download size={13} />
                {t('share.saveFile')}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="chip-static">{t('share.notConnected')}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-mute)', flex: 1 }}>{t(detail.blurb)}</span>
              <button type="button" className="btn btn-sm" onClick={() => toast(t('toasts.offline'))}>
                {t('share.notify')}
              </button>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <span style={{ fontSize: 10.5, color: 'var(--text-mute)', marginRight: 'auto' }}>{t('share.footer')}</span>
          <button type="button" className="btn" onClick={() => setShareOpen(false)}>
            {t('common.back')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ImportModal() {
  const { importOpen, setImportOpen, applySpec, toast, t } = useApp();
  const [text, setText] = useState('');

  useEffect(() => {
    if (importOpen) setText('');
  }, [importOpen]);

  useEffect(() => {
    if (!importOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setImportOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [importOpen, setImportOpen]);

  if (!importOpen) return null;

  const apply = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      toast(t('importModal.pasteFirst'));
      return;
    }
    let spec = decodeShareCode(trimmed);
    if (!spec) {
      try {
        spec = normalizeSpec(JSON.parse(trimmed));
      } catch {
        spec = null;
      }
    }
    if (!spec) {
      toast(t('importModal.invalid'));
      return;
    }
    applySpec(spec);
    setImportOpen(false);
    toast(t('importModal.done', { name: spec.name }), 'green');
  };

  const fromFile = async () => {
    const spec = await window.crossforge.importSpec();
    if (!spec) return;
    applySpec(spec);
    setImportOpen(false);
    toast(t('importModal.done', { name: spec.name }), 'green');
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setImportOpen(false)}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={t('importModal.title')} style={{ width: 'min(540px, calc(100vw - 60px))' }}>
        <div className="modal-head">
          <div className="modal-title">{t('importModal.title')}</div>
          <span className="spacer" />
          <button type="button" className="win-btn" aria-label={t('common.close')} onClick={() => setImportOpen(false)}>
            <X size={14} />
          </button>
        </div>
        <div className="modal-sub">{t('importModal.subtitle')}</div>
        <textarea
          className="field"
          style={{ height: 96, fontFamily: 'var(--mono)', fontSize: 10.5 }}
          placeholder={t('importModal.placeholder')}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <div className="modal-actions">
          <button type="button" className="btn" onClick={fromFile}>
            <Upload size={13} />
            {t('importModal.openFile')}
          </button>
          <span className="spacer" />
          <button type="button" className="btn" onClick={() => setImportOpen(false)}>
            {t('importModal.cancel')}
          </button>
          <button type="button" className="btn btn-accent" onClick={apply}>
            {t('importModal.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}

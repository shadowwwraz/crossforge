import { useState, type FormEvent } from 'react';
import { useSquad } from '../state/squad';
import { useApp } from '../state/app';
import { Users, X } from './Icons';

export function JoinSquadModal() {
  const { joinModalOpen, closeJoinModal, joinLobby } = useSquad();
  const { t } = useApp();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  if (!joinModalOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      await joinLobby(code.trim().toUpperCase());
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeJoinModal}>
      <div
        className="modal-card"
        style={{ maxWidth: 380 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="flex" style={{ gap: 8, alignItems: 'center' }}>
            <Users size={16} />
            <h2 className="modal-title">{t('squad.joinTitle')}</h2>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={closeJoinModal}
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <p className="modal-desc">{t('squad.joinDesc')}</p>

        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <input
            type="text"
            className="input"
            style={{
              width: '100%',
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textAlign: 'center',
              textTransform: 'uppercase',
              padding: '10px 12px',
            }}
            placeholder={t('squad.joinPlaceholder')}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={10}
            autoFocus
          />

          <div className="modal-actions" style={{ marginTop: 20 }}>
            <button
              type="button"
              className="btn"
              onClick={closeJoinModal}
              disabled={loading}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!code.trim() || loading}
            >
              {loading ? t('common.loading') : t('squad.joinButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

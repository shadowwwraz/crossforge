import { useEffect, useRef } from 'react';
import { useSquad } from '../state/squad';
import { useApp } from '../state/app';
import { CrosshairCanvas } from './CrosshairCanvas';
import { Copy, Plus, Send, Users, Wand, X } from './Icons';

export function SquadDrawer() {
  const {
    isOpen,
    closeSquad,
    members,
    lobbyCode,
    isHost,
    createLobby,
    copyLobbyCode,
    openJoinModal,
    leaveLobby,
    equipMemberCrosshair,
    sendMyCrosshair,
    incomingOffer,
    acceptIncomingOffer,
    declineIncomingOffer,
  } = useSquad();
  const { t } = useApp();
  const drawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeSquad();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeSquad]);

  if (!isOpen) return null;

  return (
    <>
      <div className="squad-backdrop" onClick={closeSquad} />
      <aside className="squad-drawer" ref={drawerRef} aria-label={t('squad.title')}>
        {/* Header */}
        <div className="squad-header">
          <div className="flex" style={{ gap: 8, alignItems: 'center' }}>
            <span className="squad-header-icon">
              <Users size={16} />
            </span>
            <div>
              <div className="squad-title">{t('squad.title')}</div>
              <div className="squad-count">
                {t('squad.membersCount', { count: members.length })}
              </div>
            </div>
          </div>
          <div className="flex" style={{ gap: 6, alignItems: 'center' }}>
            {lobbyCode ? (
              <button
                type="button"
                className="squad-code-pill"
                onClick={copyLobbyCode}
                title={t('squad.codeCopied', { code: lobbyCode })}
              >
                <span>{lobbyCode}</span>
                <Copy size={11} />
              </button>
            ) : null}
            <button
              type="button"
              className="squad-close-btn"
              onClick={closeSquad}
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Incoming Offer Banner */}
        {incomingOffer ? (
          <div className="squad-offer-banner">
            <div className="squad-offer-text">
              {t('squad.offerReceived', {
                user: incomingOffer.senderName,
                name: incomingOffer.spec.name,
              })}
            </div>
            <div className="flex" style={{ gap: 8, marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={acceptIncomingOffer}
              >
                {t('squad.accept')}
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={declineIncomingOffer}
              >
                {t('squad.decline')}
              </button>
            </div>
          </div>
        ) : null}

        {/* Members Roster */}
        <div className="squad-roster">
          {members.map((member) => {
            const isLocal = Boolean(member.isLocal);
            const initial = member.nickname.charAt(0).toUpperCase() || 'P';

            return (
              <div
                key={member.id}
                className={`squad-member-row${isLocal ? ' squad-member-self' : ''}`}
              >
                {/* Crosshair Preview Canvas */}
                <div className="squad-preview-box">
                  <CrosshairCanvas
                    spec={member.spec}
                    width={40}
                    height={40}
                  />
                </div>

                {/* Avatar with Status Dot */}
                <div className="squad-avatar-wrapper">
                  <div
                    className="squad-avatar"
                    style={{ backgroundColor: member.avatarColor }}
                  >
                    {initial}
                  </div>
                  <span
                    className={`squad-status-dot ${member.status}`}
                    title={t('squad.online')}
                  />
                </div>

                {/* Player Info */}
                <div className="squad-player-info">
                  <div className="squad-player-name">
                    {isLocal ? t('squad.you') : member.nickname}
                  </div>
                  <div className="squad-player-crosshair" title={member.spec.name}>
                    {isLocal
                      ? t('squad.usingCustom')
                      : t('squad.usingPreset', { name: member.spec.name })}
                  </div>
                </div>

                {/* Action Buttons */}
                {!isLocal ? (
                  <div className="squad-actions">
                    <button
                      type="button"
                      className="squad-action-btn"
                      onClick={() => equipMemberCrosshair(member.id)}
                      title={t('squad.equip')}
                      aria-label={t('squad.equip')}
                    >
                      <Wand size={14} />
                    </button>
                    <button
                      type="button"
                      className="squad-action-btn"
                      onClick={() => sendMyCrosshair(member.id)}
                      title={t('squad.send', { user: member.nickname })}
                      aria-label={t('squad.send', { user: member.nickname })}
                    >
                      <Send size={13} />
                    </button>
                  </div>
                ) : (
                  <span className="squad-self-badge">
                    {isHost ? 'HOST' : 'YOU'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Demo Notice */}
        {!lobbyCode ? (
          <div className="squad-demo-notice">
            <span className="squad-badge-pill">PC Gamers</span>
            <p>{t('squad.demoNotice')}</p>
          </div>
        ) : null}

        {/* Footer Actions */}
        <div className="squad-footer">
          <button
            type="button"
            className="btn btn-primary squad-invite-btn"
            onClick={lobbyCode ? copyLobbyCode : createLobby}
          >
            <Users size={14} />
            {t('squad.invite')}
          </button>

          <div className="flex" style={{ gap: 8, width: '100%' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={openJoinModal}
            >
              <Plus size={13} />
              {t('squad.join')}
            </button>
            {lobbyCode ? (
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={leaveLobby}
              >
                {t('squad.leave')}
              </button>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
}

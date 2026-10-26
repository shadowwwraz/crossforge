import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { CrosshairSpec, SquadMember } from '../../shared/types';
import { SquadService } from '../lib/squadService';
import { useApp } from './app';
import { formatLobbyShareText } from '../../shared/squad';

interface SquadContextValue {
  isOpen: boolean;
  members: SquadMember[];
  lobbyCode: string | null;
  isHost: boolean;
  joinModalOpen: boolean;
  incomingOffer: { senderName: string; spec: CrosshairSpec } | null;
  openSquad: () => void;
  closeSquad: () => void;
  toggleSquad: () => void;
  openJoinModal: () => void;
  closeJoinModal: () => void;
  createLobby: () => Promise<string>;
  joinLobby: (code: string) => Promise<void>;
  leaveLobby: () => void;
  copyLobbyCode: () => void;
  equipMemberCrosshair: (memberId: string) => void;
  sendMyCrosshair: (memberId: string) => void;
  acceptIncomingOffer: () => void;
  declineIncomingOffer: () => void;
}

const SquadContext = createContext<SquadContextValue | null>(null);

export function SquadProvider({ children }: { children: ReactNode }) {
  const { state, applySpec, toast, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [lobbyCode, setLobbyCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState<{
    senderName: string;
    spec: CrosshairSpec;
  } | null>(null);

  const serviceRef = useRef<SquadService | null>(null);
  if (!serviceRef.current) {
    serviceRef.current = new SquadService('You', '#8B5CF6');
  }
  const service = serviceRef.current;

  const [members, setMembers] = useState<SquadMember[]>(() => service.getMembers());

  useEffect(() => {
    service.setCallbacks({
      onMembersChange: (updated) => setMembers(updated),
      onConnected: (code) => {
        setLobbyCode(code);
        setIsHost(service.getIsHost());
        toast(t('squad.connected', { code }), 'green');
      },
      onDisconnected: () => {
        setLobbyCode(null);
        setIsHost(false);
      },
      onOfferReceived: (offer) => {
        setIncomingOffer({ senderName: offer.senderName, spec: offer.spec });
      },
      onError: (err) => {
        toast(err, 'default');
      },
    });
  }, [service, toast, t]);

  // Keep squad service updated when local crosshair changes in the app
  useEffect(() => {
    if (state.current) {
      service.updateLocalSpec(state.current);
    }
  }, [service, state.current]);

  const openSquad = useCallback(() => setIsOpen(true), []);
  const closeSquad = useCallback(() => setIsOpen(false), []);
  const toggleSquad = useCallback(() => setIsOpen((prev) => !prev), []);
  const openJoinModal = useCallback(() => setJoinModalOpen(true), []);
  const closeJoinModal = useCallback(() => setJoinModalOpen(false), []);

  const createLobby = useCallback(async () => {
    const code = await service.createLobby();
    setLobbyCode(code);
    setIsHost(true);
    await navigator.clipboard.writeText(formatLobbyShareText(code));
    toast(t('squad.codeCopied', { code }), 'green');
    return code;
  }, [service, toast, t]);

  const joinLobby = useCallback(
    async (code: string) => {
      try {
        await service.joinLobby(code);
        setJoinModalOpen(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast(msg, 'default');
      }
    },
    [service, toast],
  );

  const leaveLobby = useCallback(() => {
    service.leaveLobby();
    setLobbyCode(null);
    setIsHost(false);
    toast(t('squad.leave'), 'default');
  }, [service, toast, t]);

  const copyLobbyCode = useCallback(async () => {
    if (!lobbyCode) {
      await createLobby();
      return;
    }
    await navigator.clipboard.writeText(formatLobbyShareText(lobbyCode));
    toast(t('squad.codeCopied', { code: lobbyCode }), 'green');
  }, [lobbyCode, createLobby, toast, t]);

  const equipMemberCrosshair = useCallback(
    async (memberId: string) => {
      const target = members.find((m) => m.id === memberId);
      if (!target) return;
      applySpec(target.spec);
      toast(t('squad.equipped', { name: target.spec.name, user: target.nickname }), 'green');
    },
    [members, applySpec, toast, t],
  );

  const sendMyCrosshair = useCallback(
    (memberId: string) => {
      const target = members.find((m) => m.id === memberId);
      if (!target) return;
      service.sendOffer(memberId);
      toast(t('squad.sent', { user: target.nickname }), 'green');
    },
    [members, service, toast, t],
  );

  const acceptIncomingOffer = useCallback(async () => {
    if (!incomingOffer) return;
    applySpec(incomingOffer.spec);
    toast(t('squad.equipped', { name: incomingOffer.spec.name, user: incomingOffer.senderName }), 'green');
    setIncomingOffer(null);
  }, [incomingOffer, applySpec, toast, t]);

  const declineIncomingOffer = useCallback(() => {
    setIncomingOffer(null);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      members,
      lobbyCode,
      isHost,
      joinModalOpen,
      incomingOffer,
      openSquad,
      closeSquad,
      toggleSquad,
      openJoinModal,
      closeJoinModal,
      createLobby,
      joinLobby,
      leaveLobby,
      copyLobbyCode,
      equipMemberCrosshair,
      sendMyCrosshair,
      acceptIncomingOffer,
      declineIncomingOffer,
    }),
    [
      isOpen,
      members,
      lobbyCode,
      isHost,
      joinModalOpen,
      incomingOffer,
      openSquad,
      closeSquad,
      toggleSquad,
      openJoinModal,
      closeJoinModal,
      createLobby,
      joinLobby,
      leaveLobby,
      copyLobbyCode,
      equipMemberCrosshair,
      sendMyCrosshair,
      acceptIncomingOffer,
      declineIncomingOffer,
    ],
  );

  return <SquadContext.Provider value={value}>{children}</SquadContext.Provider>;
}

export function useSquad(): SquadContextValue {
  const ctx = useContext(SquadContext);
  if (!ctx) {
    throw new Error('useSquad must be used within SquadProvider');
  }
  return ctx;
}

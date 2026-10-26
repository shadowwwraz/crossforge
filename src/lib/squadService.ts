import { Peer, type DataConnection } from 'peerjs';
import type { CrosshairSpec, SquadMember, SquadMessage } from '../../shared/types';
import { DEMO_SQUAD_MEMBERS, generateLobbyCode, isValidLobbyCode } from '../../shared/squad';
import { normalizeSpec } from '../../shared/spec';

export interface SquadServiceCallbacks {
  onMembersChange?: (members: SquadMember[]) => void;
  onOfferReceived?: (offer: { senderId: string; senderName: string; spec: CrosshairSpec }) => void;
  onConnected?: (lobbyCode: string) => void;
  onDisconnected?: () => void;
  onError?: (error: string) => void;
}

export class SquadService {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private callbacks: SquadServiceCallbacks = {};

  private lobbyCode: string | null = null;
  private isHost: boolean = false;
  private localMember: SquadMember;
  private remoteMembers: Map<string, SquadMember> = new Map();

  constructor(localNickname: string = 'You', localColor: string = '#8B5CF6') {
    this.localMember = {
      id: 'local-user',
      nickname: localNickname,
      avatarColor: localColor,
      status: 'online',
      isLocal: true,
      spec: {
        id: 'local-default',
        name: 'Custom',
        author: 'You',
        category: 'Competitive',
        color: '#38BDF8',
        outlineColor: '#000000',
        outlineWidth: 1,
        opacity: 1,
        size: 1,
        rotation: 0,
        glow: 0,
        offsetX: 0,
        offsetY: 0,
        layers: [
          {
            id: 'local-l1',
            kind: 'cross',
            enabled: true,
            length: 8,
            thickness: 2,
            gap: 4,
            radius: 0,
            rotation: 0,
          },
        ],
      },
    };
  }

  public setCallbacks(callbacks: SquadServiceCallbacks): void {
    this.callbacks = callbacks;
  }

  public updateLocalSpec(spec: CrosshairSpec): void {
    this.localMember.spec = spec;
    this.broadcastMessage({
      type: 'SYNC_STATE',
      senderId: this.localMember.id,
      senderName: this.localMember.nickname,
      avatarColor: this.localMember.avatarColor,
      spec: this.localMember.spec,
    });
    this.emitMembers();
  }

  public updateLocalProfile(nickname: string, color: string): void {
    this.localMember.nickname = nickname;
    this.localMember.avatarColor = color;
    this.broadcastMessage({
      type: 'SYNC_STATE',
      senderId: this.localMember.id,
      senderName: this.localMember.nickname,
      avatarColor: this.localMember.avatarColor,
      spec: this.localMember.spec,
    });
    this.emitMembers();
  }

  public getMembers(): SquadMember[] {
    if (!this.lobbyCode) {
      // In standalone / demo mode, return local user + 5 authentic demo squad members
      return [this.localMember, ...DEMO_SQUAD_MEMBERS];
    }
    return [this.localMember, ...Array.from(this.remoteMembers.values())];
  }

  public getLobbyCode(): string | null {
    return this.lobbyCode;
  }

  public getIsHost(): boolean {
    return this.isHost;
  }

  public async createLobby(): Promise<string> {
    this.leaveLobby();
    const code = generateLobbyCode();
    this.lobbyCode = code;
    this.isHost = true;
    this.localMember.isHost = true;

    const peerId = this.codeToPeerId(code);
    await this.initPeer(peerId);
    this.callbacks.onConnected?.(code);
    this.emitMembers();
    return code;
  }

  public async joinLobby(code: string): Promise<void> {
    if (!isValidLobbyCode(code)) {
      throw new Error('Invalid lobby code format');
    }
    this.leaveLobby();
    const cleanCode = code.trim().toUpperCase();
    this.lobbyCode = cleanCode;
    this.isHost = false;
    this.localMember.isHost = false;

    await this.initPeer(); // Random client peer ID
    const hostPeerId = this.codeToPeerId(cleanCode);
    const conn = this.peer!.connect(hostPeerId, {
      reliable: true,
      metadata: {
        nickname: this.localMember.nickname,
        avatarColor: this.localMember.avatarColor,
      },
    });

    this.setupConnection(conn);
    this.callbacks.onConnected?.(cleanCode);
    this.emitMembers();
  }

  public leaveLobby(): void {
    if (this.peer) {
      try {
        this.broadcastMessage({
          type: 'PEER_LEAVE',
          senderId: this.localMember.id,
          senderName: this.localMember.nickname,
        });
        this.peer.destroy();
      } catch {
        // Ignored
      }
      this.peer = null;
    }
    this.connections.clear();
    this.remoteMembers.clear();
    this.lobbyCode = null;
    this.isHost = false;
    this.localMember.isHost = false;
    this.callbacks.onDisconnected?.();
    this.emitMembers();
  }

  public sendOffer(targetMemberId: string): void {
    if (!this.lobbyCode) {
      // Simulated demo squad send
      return;
    }

    const targetConn = this.connections.get(targetMemberId);
    if (targetConn && targetConn.open) {
      targetConn.send({
        type: 'OFFER_CROSSHAIR',
        senderId: this.localMember.id,
        senderName: this.localMember.nickname,
        targetId: targetMemberId,
        spec: this.localMember.spec,
      } as SquadMessage);
    }
  }

  private codeToPeerId(code: string): string {
    const sanitized = code.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `crossforge-squad-${sanitized}`;
  }

  private initPeer(id?: string): Promise<void> {
    return new Promise((resolve) => {
      this.peer = id ? new Peer(id) : new Peer();

      this.peer.on('open', (assignedId) => {
        this.localMember.id = assignedId;
        resolve();
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        this.callbacks.onError?.(err.message || 'Connection error');
      });
    });
  }

  private setupConnection(conn: DataConnection): void {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      // Greet peer with current state
      conn.send({
        type: 'SYNC_STATE',
        senderId: this.localMember.id,
        senderName: this.localMember.nickname,
        avatarColor: this.localMember.avatarColor,
        spec: this.localMember.spec,
      } as SquadMessage);
    });

    conn.on('data', (data) => {
      this.handleIncomingMessage(conn.peer, data as SquadMessage);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      this.remoteMembers.delete(conn.peer);
      this.emitMembers();
    });

    conn.on('error', () => {
      this.connections.delete(conn.peer);
      this.remoteMembers.delete(conn.peer);
      this.emitMembers();
    });
  }

  private handleIncomingMessage(peerId: string, msg: SquadMessage): void {
    if (!msg || typeof msg !== 'object') return;

    switch (msg.type) {
      case 'SYNC_STATE': {
        if (msg.spec) {
          const safeSpec = normalizeSpec(msg.spec);
          if (safeSpec) {
            this.remoteMembers.set(peerId, {
              id: peerId,
              nickname: msg.senderName || 'Player',
              avatarColor: msg.avatarColor || '#38BDF8',
              status: 'online',
              spec: safeSpec,
            });
            this.emitMembers();
          }
        }
        break;
      }
      case 'OFFER_CROSSHAIR': {
        if (msg.spec) {
          const safeSpec = normalizeSpec(msg.spec);
          if (safeSpec) {
            this.callbacks.onOfferReceived?.({
              senderId: msg.senderId || peerId,
              senderName: msg.senderName || 'Teammate',
              spec: safeSpec,
            });
          }
        }
        break;
      }
      case 'PEER_LEAVE': {
        this.connections.delete(peerId);
        this.remoteMembers.delete(peerId);
        this.emitMembers();
        break;
      }
    }
  }

  private broadcastMessage(msg: SquadMessage): void {
    for (const conn of this.connections.values()) {
      if (conn.open) {
        conn.send(msg);
      }
    }
  }

  private emitMembers(): void {
    this.callbacks.onMembersChange?.(this.getMembers());
  }
}

import type { CrosshairSpec, SquadMember, SquadMessage } from '../../shared/types';
import { generateLobbyCode, isValidLobbyCode } from '../../shared/squad';
import { normalizeSpec } from '../../shared/spec';

export interface SquadServiceCallbacks {
  onMembersChange?: (members: SquadMember[]) => void;
  onOfferReceived?: (offer: { senderId: string; senderName: string; spec: CrosshairSpec }) => void;
  onConnected?: (lobbyCode: string) => void;
  onDisconnected?: () => void;
  onError?: (error: string) => void;
}

export class SquadService {
  private ws: WebSocket | null = null;
  private lobbyCode: string | null = null;
  private isHost: boolean = false;
  private localMember: SquadMember;
  private remoteMembers: Map<string, SquadMember> = new Map();
  private lastSeen: Map<string, number> = new Map();
  private callbacks: SquadServiceCallbacks = {};
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  constructor(localNickname: string = 'You', localColor: string = '#8B5CF6') {
    const randomId = 'usr_' + Math.random().toString(36).substring(2, 9);
    this.localMember = {
      id: randomId,
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
    if (this.lobbyCode) {
      this.publish({
        type: 'SYNC_STATE',
        senderId: this.localMember.id,
        senderName: this.localMember.nickname,
        avatarColor: this.localMember.avatarColor,
        spec: this.localMember.spec,
      });
    }
    this.emitMembers();
  }

  public updateLocalProfile(nickname: string, color: string): void {
    this.localMember.nickname = nickname;
    this.localMember.avatarColor = color;
    if (this.lobbyCode) {
      this.publish({
        type: 'SYNC_STATE',
        senderId: this.localMember.id,
        senderName: this.localMember.nickname,
        avatarColor: this.localMember.avatarColor,
        spec: this.localMember.spec,
      });
    }
    this.emitMembers();
  }

  public getMembers(): SquadMember[] {
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
    this.isHost = true;
    this.localMember.isHost = true;
    await this.connectToRoom(code);
    return code;
  }

  public async joinLobby(code: string): Promise<void> {
    if (!isValidLobbyCode(code)) {
      throw new Error('Неверный формат кода сквада (ожидается CF-XXXX)');
    }
    this.leaveLobby();
    const cleanCode = code.trim().toUpperCase();
    this.isHost = false;
    this.localMember.isHost = false;
    await this.connectToRoom(cleanCode);
  }

  public leaveLobby(): void {
    if (this.lobbyCode) {
      this.publish({
        type: 'PEER_LEAVE',
        senderId: this.localMember.id,
        senderName: this.localMember.nickname,
      });
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // Ignored
      }
      this.ws = null;
    }

    this.remoteMembers.clear();
    this.lastSeen.clear();
    this.lobbyCode = null;
    this.isHost = false;
    this.localMember.isHost = false;
    this.callbacks.onDisconnected?.();
    this.emitMembers();
  }

  public sendOffer(targetMemberId: string): void {
    if (!this.lobbyCode) return;
    this.publish({
      type: 'OFFER_CROSSHAIR',
      senderId: this.localMember.id,
      senderName: this.localMember.nickname,
      targetId: targetMemberId,
      spec: this.localMember.spec,
    });
  }

  private codeToTopic(code: string): string {
    const sanitized = code.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `crossforge_squad_${sanitized}`;
  }

  private async connectToRoom(code: string): Promise<void> {
    this.lobbyCode = code;
    const topic = this.codeToTopic(code);
    const wsUrl = `wss://ntfy.sh/${topic}/ws`;

    return new Promise((resolve, reject) => {
      let isResolved = false;
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          if (!isResolved) {
            isResolved = true;
            this.callbacks.onConnected?.(code);
            resolve();
          }

          // Greet lobby with my presence
          this.publish({
            type: 'SYNC_STATE',
            senderId: this.localMember.id,
            senderName: this.localMember.nickname,
            avatarColor: this.localMember.avatarColor,
            spec: this.localMember.spec,
          });

          // Start heartbeat every 6 seconds
          this.heartbeatTimer = setInterval(() => {
            this.publish({
              type: 'SYNC_STATE',
              senderId: this.localMember.id,
              senderName: this.localMember.nickname,
              avatarColor: this.localMember.avatarColor,
              spec: this.localMember.spec,
            });
          }, 6000);

          // Check for stale peers every 4 seconds
          this.checkInterval = setInterval(() => {
            const now = Date.now();
            let changed = false;
            for (const [id, seen] of this.lastSeen.entries()) {
              if (now - seen > 16000) {
                this.remoteMembers.delete(id);
                this.lastSeen.delete(id);
                changed = true;
              }
            }
            if (changed) this.emitMembers();
          }, 4000);
        };

        this.ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.event === 'message' && payload.message) {
              const msg: SquadMessage = JSON.parse(payload.message);
              this.handleMessage(msg);
            }
          } catch {
            // Ignore non-json system ping
          }
        };

        this.ws.onerror = (err) => {
          if (!isResolved) {
            isResolved = true;
            reject(new Error('Не удалось подключиться к серверу лобби'));
          } else {
            this.callbacks.onError?.('Сбой соединения со сквадом');
          }
        };

        this.ws.onclose = () => {
          if (this.lobbyCode) {
            this.callbacks.onDisconnected?.();
          }
        };
      } catch (err: unknown) {
        if (!isResolved) {
          isResolved = true;
          reject(err);
        }
      }
    });
  }

  private publish(msg: SquadMessage): void {
    if (!this.lobbyCode) return;
    const topic = this.codeToTopic(this.lobbyCode);
    const postUrl = `https://ntfy.sh/${topic}`;

    fetch(postUrl, {
      method: 'POST',
      body: JSON.stringify(msg),
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(() => {
      // Network retry ignored
    });
  }

  private handleMessage(msg: SquadMessage): void {
    if (!msg || typeof msg !== 'object') return;
    // Don't process our own broadcast
    if (msg.senderId === this.localMember.id) return;

    this.lastSeen.set(msg.senderId, Date.now());

    switch (msg.type) {
      case 'SYNC_STATE': {
        if (msg.spec) {
          const safeSpec = normalizeSpec(msg.spec);
          if (safeSpec) {
            this.remoteMembers.set(msg.senderId, {
              id: msg.senderId,
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
        if (msg.targetId === this.localMember.id && msg.spec) {
          const safeSpec = normalizeSpec(msg.spec);
          if (safeSpec) {
            this.callbacks.onOfferReceived?.({
              senderId: msg.senderId,
              senderName: msg.senderName || 'Тиммейт',
              spec: safeSpec,
            });
          }
        }
        break;
      }
      case 'PEER_LEAVE': {
        this.remoteMembers.delete(msg.senderId);
        this.lastSeen.delete(msg.senderId);
        this.emitMembers();
        break;
      }
    }
  }

  private emitMembers(): void {
    this.callbacks.onMembersChange?.(this.getMembers());
  }
}

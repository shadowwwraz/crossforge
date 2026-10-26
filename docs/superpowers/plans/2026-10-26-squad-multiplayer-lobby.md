# Squad Multiplayer Lobby & Crosshair Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the "YOUR SQUAD" live multiplayer sidebar panel with real-time crosshair synchronization, 1-click crosshair copying/sending, P2P room code connectivity (PeerJS/WebRTC), and interactive demo teammates.

**Architecture:** A lightweight WebRTC DataChannel (PeerJS) service paired with a React context (`SquadProvider`) and an animated slide-over drawer (`SquadDrawer`). Peer connection requires zero signup/passwords, using short room codes (`CF-XXXX`). When solo or offline, realistic demo teammates populate the roster so all actions (`🪄` clone and `✈️` send) are testable immediately.

**Tech Stack:** Electron 33, React 18, TypeScript 5.7, Canvas 2D Vector Renderer, PeerJS (WebRTC), Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-26-squad-multiplayer-lobby-design.md`

## Global Constraints

- All development is strictly in `E:\crossforge` on branch `dev`. The original copy on `C:\` must remain untouched.
- Preserve zero-regression code quality: `npm run typecheck` and `npm run test` must pass after every task.
- Dual theme support: styling must integrate seamlessly with Forge Lab (Dark) and Studio (Light) palettes.
- Full localization: every new string must be defined and balanced in both `src/i18n/en.ts` and `src/i18n/ru.ts`.

## Review Focus

1. **Missing network connection / offline state:** User can still use the full squad panel with demo teammates without crashes or hanging loaders.
2. **Malformed room code input:** Validation cleans whitespace and prevents connecting to empty/invalid peer IDs.
3. **Crosshair spec integrity over P2P:** Incoming specs from peers are validated and normalized using `normalizeSpec()` before applying to prevent corrupted canvas state.
4. **Copy / Equip race conditions:** Clicking `🪄` updates local `state.current`, saves to store, and broadcasts new status without infinite sync loops.
5. **Drawer responsive behavior:** Drawer opens smoothly from the right, traps ESC key to close, and supports click-outside closing without interfering with background clicks.

---

### Task 1: Data Contracts, Types & Demo Squad Presets

**Files:**
- Modify: `shared/types.ts`
- Create: `shared/squad.ts`
- Create: `tests/squad.test.ts`

- [ ] **Step 1:** Define `SquadMember`, `SquadState`, and `SquadMessage` types in `shared/types.ts`.
- [ ] **Step 2:** Write `tests/squad.test.ts` testing squad helper functions (code generator, room code validator, demo members loader).
- [ ] **Step 3:** Implement `shared/squad.ts` with `DEMO_SQUAD_MEMBERS` (using authentic presets: ShadowByte, VortexSurge, VoltByte, CrimsonRed, NovaBlade), `generateLobbyCode()`, and `isValidLobbyCode()`.
- [ ] **Step 4:** Run `node --test tests/squad.test.ts` and verify test passes.
- [ ] **Step 5:** Run `npm run typecheck`.
- [ ] **Step 6:** Commit: `feat(squad): define squad data types, demo members and unit tests`.

---

### Task 2: Localization Strings (EN & RU)

**Files:**
- Modify: `src/i18n/en.ts`
- Modify: `src/i18n/ru.ts`

- [ ] **Step 1:** Add all squad-related keys to `src/i18n/en.ts` (`squad.title`, `squad.subtitle`, `squad.invite`, `squad.join`, `squad.joinTitle`, `squad.joinPlaceholder`, `squad.codeCopied`, `squad.equipSuccess`, `squad.offerSent`, `squad.offerReceived`, `squad.accept`, `squad.decline`, `squad.leave`, `squad.demoBadge`).
- [ ] **Step 2:** Add matching Russian translations to `src/i18n/ru.ts`.
- [ ] **Step 3:** Run `npm run test` to verify zero missing keys, no empty strings, and placeholder matching.
- [ ] **Step 4:** Run `npm run typecheck`.
- [ ] **Step 5:** Commit: `feat(i18n): add squad localization keys for English and Russian`.

---

### Task 3: PeerJS Dependency & Squad P2P Service

**Files:**
- Modify: `package.json`
- Create: `src/lib/squadService.ts`

- [ ] **Step 1:** Install `peerjs` in `E:\crossforge`.
- [ ] **Step 2:** Implement `src/lib/squadService.ts`:
  - WebRTC Peer initialization with public STUN/signaling.
  - Room hosting (`hostLobby(code)`) and joining (`joinLobby(code)`).
  - Message broadcasting (`broadcastSpec(spec)`).
  - Target messaging for crosshair proposals (`sendOffer(targetId, spec)`).
  - Fallback to simulated demo squad when not connected to a remote room.
- [ ] **Step 3:** Run `npm run typecheck`.
- [ ] **Step 4:** Commit: `feat(squad): implement P2P networking service with PeerJS`.

---

### Task 4: Squad React State & Context

**Files:**
- Create: `src/state/squad.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1:** Create `SquadProvider` and `useSquad()` in `src/state/squad.tsx`:
  - Tracks `members: SquadMember[]`, `lobbyCode: string | null`, `isHost: boolean`, `isOpen: boolean`.
  - Actions: `openSquad()`, `closeSquad()`, `toggleSquad()`, `createLobby()`, `joinLobby(code)`, `leaveLobby()`, `equipMemberCrosshair(memberId)`, `sendMyCrosshair(memberId)`.
  - Connects to `useApp()` to update current crosshair when `equipMemberCrosshair` is called.
- [ ] **Step 2:** Wrap `Shell` in `SquadProvider` inside `src/App.tsx`.
- [ ] **Step 3:** Run `npm run typecheck`.
- [ ] **Step 4:** Commit: `feat(squad): create SquadProvider state and integration hooks`.

---

### Task 5: Squad UI Components (Drawer, Member Card & Modals)

**Files:**
- Create: `src/components/SquadDrawer.tsx`
- Create: `src/components/JoinSquadModal.tsx`
- Modify: `src/components/Header.tsx`
- Modify: `src/styles/global.css`

- [ ] **Step 1:** Create `SquadDrawer.tsx`:
  - Slide-over container with slide-in animation.
  - Header: `👥 YOUR SQUAD` + Lobby Code pill + Close button (`✕`).
  - Members list:
    - Square 42×42 px preview canvas with the member's crosshair.
    - Avatar circle with initial letter + online green status indicator.
    - Nickname & "Using <CrosshairName>".
    - Action buttons: `🪄` (Equip / Clone) and `✈️` (Send).
  - Footer: `Invite friends` (copies code/link) and `Join Squad` button.
- [ ] **Step 2:** Create `JoinSquadModal.tsx` for entering 6-char lobby codes.
- [ ] **Step 3:** Add Squad toggle button in `src/components/Header.tsx` with member count badge.
- [ ] **Step 4:** Add CSS styles in `src/styles/global.css` for `.squad-drawer`, `.squad-row`, `.squad-canvas`, `.squad-actions`.
- [ ] **Step 5:** Run `npm run typecheck` and `npm run test`.
- [ ] **Step 6:** Commit: `feat(squad): build SquadDrawer UI and JoinSquadModal`.

---

### Task 6: End-to-End Verification & Interactive Testing

**Files:**
- Modify: `tests/squad.test.ts` (if additional unit tests needed)

- [ ] **Step 1:** Run `npm run test` (all i18n & squad tests pass).
- [ ] **Step 2:** Run `npm run typecheck` (0 errors).
- [ ] **Step 3:** Build renderer & main via `npm run build` to verify production bundling.
- [ ] **Step 4:** Launch app with remote debugging and test with CDP:
  - Verify Squad drawer opens on header button click.
  - Verify all 5 squad members render with custom mini-crosshairs.
  - Click `🪄` on *VoltByte* and verify crosshair changes to VoltByte's design.
  - Take a UI screenshot of the open Squad drawer.
- [ ] **Step 5:** Commit: `test(squad): verify end-to-end squad functionality and bundle`.

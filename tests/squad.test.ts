import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateLobbyCode,
  isValidLobbyCode,
  DEMO_SQUAD_MEMBERS,
  formatLobbyShareText,
} from '../shared/squad.ts';

test('generateLobbyCode generates format CF-XXXX with 4 uppercase alphanumeric chars', () => {
  const code = generateLobbyCode();
  assert.match(code, /^CF-[A-Z0-9]{4}$/);
});

test('isValidLobbyCode validates valid and rejects invalid codes', () => {
  assert.equal(isValidLobbyCode('CF-ABCD'), true);
  assert.equal(isValidLobbyCode('cf-1234'), true);
  assert.equal(isValidLobbyCode('  CF-9Z8Y  '), true);
  assert.equal(isValidLobbyCode('INVALID'), false);
  assert.equal(isValidLobbyCode('CF-12'), false);
  assert.equal(isValidLobbyCode(''), false);
});

test('DEMO_SQUAD_MEMBERS contains 5 authentic members matching reference design', () => {
  assert.equal(DEMO_SQUAD_MEMBERS.length, 5);
  const names = DEMO_SQUAD_MEMBERS.map((m) => m.nickname);
  assert.ok(names.includes('ShadowByte'));
  assert.ok(names.includes('VortexSurge'));
  assert.ok(names.includes('VoltByte'));
  assert.ok(names.includes('CrimsonRed'));
  assert.ok(names.includes('NovaBlade'));

  for (const member of DEMO_SQUAD_MEMBERS) {
    assert.ok(member.spec, `${member.nickname} must have a valid CrosshairSpec`);
    assert.ok(member.spec.layers.length > 0);
    assert.equal(member.status, 'online');
  }
});

test('formatLobbyShareText generates copyable invite text', () => {
  const text = formatLobbyShareText('CF-9922');
  assert.ok(text.includes('CF-9922'));
  assert.ok(text.includes('CrossForge'));
});

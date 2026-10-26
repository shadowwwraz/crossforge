import test from 'node:test';
import assert from 'node:assert/strict';
import { en } from '../src/i18n/en.ts';
import { ru } from '../src/i18n/ru.ts';

const enKeys = Object.keys(en).sort();
const ruKeys = Object.keys(ru).sort();

test('RU covers every EN key', () => {
  const missing = enKeys.filter((key) => !(key in ru));
  assert.deepEqual(missing, [], `missing keys: ${missing.join(', ')}`);
});

test('no empty translations', () => {
  const empty = Object.entries({ ...en, ...ru }).filter(([, value]) => !String(value).trim());
  assert.deepEqual(empty, []);
});

test('placeholders match between locales', () => {
  const tokens = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
  const mismatched = enKeys.filter((key) => {
    const a = tokens(en[key as keyof typeof en]);
    const b = tokens(ru[key as keyof typeof ru]);
    return JSON.stringify(a) !== JSON.stringify(b);
  });
  assert.deepEqual(mismatched, [], `placeholder mismatch: ${mismatched.join(', ')}`);
});

test('no duplicate keys between locales drift', () => {
  assert.deepEqual(ruKeys, enKeys);
});

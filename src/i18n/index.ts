import { en, type MessageKey } from './en';
import { ru } from './ru';
import type { Category, LayerKind, PageId } from '../../shared/types';

export type Lang = 'en' | 'ru';
export type { MessageKey };

export const DICTS: Record<Lang, Record<MessageKey, string>> = { en, ru };

export type TranslateParams = Record<string, string | number>;

export function translate(lang: Lang, key: MessageKey, params?: TranslateParams): string {
  const template = DICTS[lang][key] ?? en[key] ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

export function resolveLanguage(setting: 'en' | 'ru' | 'system'): Lang {
  if (setting === 'en' || setting === 'ru') return setting;
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'en';
  return nav.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

export type ThemeSetting = 'dark' | 'light' | 'system';
export type Theme = 'dark' | 'light';

export const navKey = (page: PageId): MessageKey => (page === 'editor' ? 'nav.designer' : `nav.${page}`);
export const hintKey = (page: PageId): MessageKey => `hints.${page}`;
export const categoryKey = (category: Category): MessageKey => `categories.${category}`;
export const layerKey = (kind: LayerKind): MessageKey => `layer.${kind}`;
export const editorKey = (id: string): MessageKey => `editor.${id}` as MessageKey;

export function resolveTheme(setting: ThemeSetting): Theme {
  if (setting === 'dark' || setting === 'light') return setting;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return 'dark';
}

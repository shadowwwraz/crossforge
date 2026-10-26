import { useEffect, useMemo, useRef, useState } from 'react';
import { PRESETS } from '../../shared/presets';
import { CATEGORIES } from '../../shared/types';
import type { Category } from '../../shared/types';
import { useApp } from '../state/app';
import { categoryKey } from '../i18n';
import { DesignCard } from '../components/DesignCard';
import { Grid, Search } from '../components/Icons';
import { EmptyState } from '../components/ui';

type SortId = 'popular' | 'liked' | 'az';

export function Browse() {
  const { t, applySpec, saveAs } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [sort, setSort] = useState<SortId>('popular');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = PRESETS.filter((preset) => {
      if (category !== 'All' && preset.category !== category) return false;
      if (!needle) return true;
      const haystack = [preset.name, preset.author, preset.category, ...(preset.tags ?? [])].join(' ').toLowerCase();
      return haystack.includes(needle);
    });
    const sorted = [...filtered];
    if (sort === 'popular') sorted.sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0));
    else if (sort === 'liked') sorted.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    else sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [query, category, sort]);

  const sortLabels: Record<SortId, string> = {
    popular: t('browse.sortPopular'),
    liked: t('browse.sortLiked'),
    az: t('browse.sortAz'),
  };

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <span className="eyebrow">{t('nav.browse')}</span>
          <h1 className="page-title">{t('browse.title')}</h1>
          <p className="page-lede">{t('browse.subtitle', { count: PRESETS.length })}</p>
        </div>
        <div className="page-head-actions">
          <select className="field" style={{ width: 176, height: 34 }} value={sort} onChange={(event) => setSort(event.target.value as SortId)}>
            {(Object.keys(sortLabels) as SortId[]).map((id) => (
              <option key={id} value={id}>
                {sortLabels[id]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="toolbar">
        <label className="search">
          <Search size={14} style={{ color: 'var(--text-mute)' }} />
          <input
            ref={inputRef}
            placeholder={t('browse.searchPlaceholder')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <kbd>{query ? `${results.length}` : 'Ctrl K'}</kbd>
        </label>
      </div>

      <div className="filters">
        <button type="button" className={`chip${category === 'All' ? ' active' : ''}`} onClick={() => setCategory('All')}>
          {t('browse.all')}
          <span className="chip-count">{PRESETS.length}</span>
        </button>
        {CATEGORIES.map((item) => {
          const count = PRESETS.filter((preset) => preset.category === item).length;
          return (
            <button
              type="button"
              key={item}
              className={`chip${category === item ? ' active' : ''}`}
              onClick={() => setCategory(item)}
            >
              {t(categoryKey(item))}
              <span className="chip-count">{count}</span>
            </button>
          );
        })}
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={<Grid size={20} />}
          title={t('browse.emptyTitle')}
          sub={t('browse.emptyText')}
          action={
            <button
              type="button"
              className="btn"
              onClick={() => {
                setQuery('');
                setCategory('All');
              }}
            >
              {t('browse.clear')}
            </button>
          }
        />
      ) : (
        <div className="grid">
          {results.map((preset) => (
            <DesignCard
              key={preset.id}
              spec={preset}
              badge={t(categoryKey(preset.category))}
              onUse={() => applySpec(preset)}
              onSave={() => saveAs(preset)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

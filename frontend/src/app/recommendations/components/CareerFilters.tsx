import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface CareerFiltersProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalResults: number;
  isSearching?: boolean;
}

const SORT_OPTIONS = [
  { value: 'match_score', label: 'Best Match' },
  { value: 'skills_score', label: 'Skill Match' },
  { value: 'interests_score', label: 'Interest Match' },
  { value: 'lowest_gap', label: 'Lowest Gap' },
];

export function CareerFilters({
  categories,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalResults,
  isSearching = false,
}: CareerFiltersProps) {
  const allCategories = ['ALL', ...categories.filter((c) => c !== 'ALL')];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
      {/* Top row: search + sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search careers…"
            aria-label="Search careers"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <label htmlFor="sort-select" className="sr-only">Sort by</label>
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-8 text-sm text-slate-700 font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <span className="flex items-center gap-1 text-xs font-bold text-slate-400 shrink-0">
          <SlidersHorizontal className="h-3 w-3" />
          Filter:
        </span>
        {allCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            aria-pressed={activeCategory === cat}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all min-h-[34px] ${
              activeCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      {totalResults > 0 && (
        <p className="text-xs text-slate-400 font-medium">
          Showing <span className="text-slate-700 font-bold">{totalResults}</span> career{totalResults !== 1 ? 's' : ''}
          {activeCategory !== 'ALL' && (
            <> in <span className="text-slate-700 font-bold">{activeCategory}</span></>
          )}
          {searchQuery && (
            <> matching "<span className="text-slate-700 font-bold">{searchQuery}</span>"</>
          )}
        </p>
      )}
    </div>
  );
}

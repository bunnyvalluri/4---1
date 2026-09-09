'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, Check } from 'lucide-react';
import { ResponsiveModal } from './ResponsiveModal';

interface FilterOption {
  label: string;
  value: string;
}

export interface FilterGroup {
  id: string;
  title: string;
  options: FilterOption[];
  selectedValue: string;
}

interface ResponsiveFilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (val: string) => void;
  filterGroups?: FilterGroup[];
  onFilterChange?: (groupId: string, value: string) => void;
  onClearFilters?: () => void;
  extraActions?: React.ReactNode;
}

export function ResponsiveFilterBar({
  searchPlaceholder = 'Search records...',
  searchValue,
  onSearchChange,
  filterGroups = [],
  onFilterChange,
  onClearFilters,
  extraActions,
}: ResponsiveFilterBarProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Count active non-default filters (assuming 'ALL' or '' is default)
  const activeFiltersCount = filterGroups.filter(
    (g) => g.selectedValue && g.selectedValue !== 'ALL' && g.selectedValue !== ''
  ).length;

  return (
    <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Search Input & Mobile Filter Trigger */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Filter Sheet Button (< sm: screens) */}
        {filterGroups.length > 0 && (
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="sm:hidden touch-target flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs relative shrink-0"
            aria-label="Open filter options"
          >
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex items-center justify-center h-4 w-4 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Desktop / Tablet Filters Inline (>= sm: screens) */}
      <div className="hidden sm:flex items-center gap-2 flex-wrap">
        {filterGroups.map((group) => (
          <select
            key={group.id}
            value={group.selectedValue}
            onChange={(e) => onFilterChange?.(group.id, e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:border-slate-300 focus:border-blue-500 transition-colors"
          >
            {group.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {group.title}: {opt.label}
              </option>
            ))}
          </select>
        ))}

        {activeFiltersCount > 0 && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 transition-colors"
          >
            Reset
          </button>
        )}

        {extraActions}
      </div>

      {/* Mobile Filter Bottom Sheet Dialog */}
      {filterGroups.length > 0 && (
        <ResponsiveModal
          isOpen={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          title="Filter Results"
          description="Refine displayed records by attributes"
          footer={
            <div className="w-full flex items-center justify-between gap-2">
              {onClearFilters && (
                <button
                  type="button"
                  onClick={() => {
                    onClearFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  Reset All
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            {filterGroups.map((group) => (
              <div key={group.id} className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {group.title}
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {group.options.map((opt) => {
                    const isSelected = group.selectedValue === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onFilterChange?.(group.id, opt.value)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ResponsiveModal>
      )}
    </div>
  );
}

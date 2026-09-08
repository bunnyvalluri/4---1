'use client';

import React, { useMemo } from 'react';
import { WifiOff } from 'lucide-react';

import { Sidebar } from '@/components/layout/Sidebar';
import { useRecommendations } from '@/lib/hooks/useRecommendations';

import { RecommendationsHeader } from './components/RecommendationsHeader';
import { ProfileStaleBanner } from './components/RecommendationStatus';
import { TopCareerMatch } from './components/TopCareerMatch';
import { CareerMatchCard } from './components/CareerMatchCard';
import { CareerFilters } from './components/CareerFilters';
import { SkillGapTable } from './components/SkillGapTable';
import { CareerComparison } from './components/CareerComparison';
import { NextBestAction } from './components/NextBestAction';
import { AIQuickAsk } from './components/AIQuickAsk';
import { RecommendationSkeleton } from './components/RecommendationSkeleton';
import { RecommendationEmptyState } from './components/RecommendationEmptyState';
import { RecommendationErrorState } from './components/RecommendationErrorState';

export default function RecommendationsPage() {
  const {
    items,
    topMatch,
    status,
    categories,
    skillGaps,
    comparison,
    loading,
    error,
    recalculating,
    jobStatus,
    isOnline,
    searchQuery,
    activeCategory,
    sortBy,
    setSearchQuery,
    setActiveCategory,
    setSortBy,
    comparisonCareerIds,
    setComparisonCareerIds,
    recalculate,
    refresh,
  } = useRecommendations();

  // ── Top skill gap (highest priority) ─────────────────────────────────────
  const topGap = useMemo(() => {
    if (!skillGaps.length) return null;
    const highPrio = skillGaps.find((g) => g.priority === 'HIGH PRIORITY');
    return highPrio ?? skillGaps[0];
  }, [skillGaps]);

  // ── Comparison handlers ───────────────────────────────────────────────────
  const handleToggleCompare = (careerId: string) => {
    setComparisonCareerIds((prev: string[]) => {
      if (prev.includes(careerId)) {
        return prev.filter((id) => id !== careerId);
      }
      if (prev.length >= 3) return prev; // cap at 3
      return [...prev, careerId];
    });
  };

  const handleRemoveFromCompare = (careerId: string) => {
    setComparisonCareerIds((prev: string[]) => prev.filter((id) => id !== careerId));
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const hasData = items.length > 0 || topMatch !== null;
  const isNoData = !loading && !hasData && !recalculating;
  const isSearchActive = searchQuery.length > 0 || activeCategory !== 'ALL';

  // ── Profile info for sidebar ──────────────────────────────────────────────
  // We don't pass profile to sidebar here — let Sidebar handle its own data
  const userName = 'Candidate';
  const userEmail = '';

  return (
    <div className="min-h-screen bg-slate-50/40 flex flex-col lg:flex-row">
      <Sidebar userName={userName} userEmail={userEmail} />

      <main
        id="main-content"
        className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-y-auto"
        role="main"
        aria-label="Career recommendations"
      >
        <div className="max-w-6xl mx-auto space-y-6">

          {/* ── Offline banner ─────────────────────────────────────────── */}
          {!isOnline && (
            <div
              role="alert"
              className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-700"
            >
              <WifiOff className="h-4 w-4 text-slate-500 shrink-0" />
              <span>
                <span className="font-bold">You're offline.</span> Showing cached recommendations.
              </span>
            </div>
          )}

          {/* ── Header ─────────────────────────────────────────────────── */}
          <RecommendationsHeader
            status={status}
            jobStatus={jobStatus}
            recalculating={recalculating}
            isOnline={isOnline}
            onRecalculate={recalculate}
          />

          {/* ── Stale profile banner ────────────────────────────────────── */}
          {status?.is_stale && !recalculating && (
            <ProfileStaleBanner status={status} onRecalculate={recalculate} />
          )}

          {/* ── Error banner (non-blocking) ─────────────────────────────── */}
          {error && hasData && (
            <RecommendationErrorState
              message={error}
              onRetry={refresh}
              isOffline={!isOnline}
              hasCachedData={true}
            />
          )}

          {/* ── Loading skeleton ────────────────────────────────────────── */}
          {loading && <RecommendationSkeleton />}

          {/* ── Fatal error (no data available) ────────────────────────── */}
          {!loading && error && !hasData && (
            <RecommendationErrorState
              message={error}
              onRetry={refresh}
              isOffline={!isOnline}
              hasCachedData={false}
            />
          )}

          {/* ── Empty state ─────────────────────────────────────────────── */}
          {isNoData && !error && (
            <RecommendationEmptyState
              profileCompletionPct={status?.profile_completion_pct ?? 0}
              missingItems={status?.missing_profile_items ?? []}
            />
          )}

          {/* ── Main recommendation content ─────────────────────────────── */}
          {!loading && hasData && (
            <>
              {/* Top Career Match — full-width featured card */}
              {topMatch && (
                <TopCareerMatch match={topMatch} />
              )}

              {/* Filters + Search + Sort */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2 px-1">
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Your Career Matches
                  </h2>
                  <span className="text-sm text-slate-500">
                    Ranked using your profile, skills, assessments, and preferences
                  </span>
                </div>

                <CareerFilters
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  totalResults={items.length}
                />
              </div>

              {/* Career match cards grid */}
              {items.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {items.map((rec) => (
                    <CareerMatchCard
                      key={rec.id}
                      rec={rec}
                      isSelected={comparisonCareerIds.includes(rec.career_id)}
                      onToggleCompare={handleToggleCompare}
                      canAddMore={comparisonCareerIds.length < 3}
                    />
                  ))}
                </div>
              ) : isSearchActive ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-2">
                  <p className="font-semibold text-slate-700">No careers match your search.</p>
                  <p className="text-sm text-slate-500">
                    Try clearing the search or changing the category filter.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('ALL');
                    }}
                    className="mt-2 inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : null}

              {/* Skill Gap Analysis */}
              {skillGaps.length > 0 && (
                <section aria-label="Skill gap analysis">
                  <div className="flex items-baseline gap-2 px-1 mb-3">
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      Skill Gap Analysis
                    </h2>
                    <span className="text-sm text-slate-500">
                      What's limiting your match scores
                    </span>
                  </div>
                  <SkillGapTable gaps={skillGaps} />
                </section>
              )}

              {/* Career Comparison */}
              <section aria-label="Career comparison">
                <div className="flex items-baseline gap-2 px-1 mb-3">
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Compare Careers
                  </h2>
                  <span className="text-sm text-slate-500">
                    Select up to 3 careers to compare side-by-side
                  </span>
                </div>
                <CareerComparison
                  comparison={comparison}
                  selectedIds={comparisonCareerIds}
                  allItems={items}
                  onRemove={handleRemoveFromCompare}
                />
              </section>

              {/* Next Best Action */}
              <NextBestAction topMatch={topMatch} topGap={topGap} />

              {/* AI Quick Ask */}
              <AIQuickAsk topMatch={topMatch} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

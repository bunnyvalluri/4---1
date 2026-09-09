'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useSkillIntelligence } from '@/lib/hooks/useSkillIntelligence';
import { SkillsHeader } from '@/components/skills/SkillsHeader';
import { SkillOverviewMetricsGrid } from '@/components/skills/SkillOverviewMetrics';
import { CareerTargetBar } from '@/components/skills/CareerTargetBar';
import { SkillProfileSection } from '@/components/skills/SkillProfileSection';
import { CareerSkillMatrix } from '@/components/skills/CareerSkillMatrix';
import { CriticalSkillGaps } from '@/components/skills/CriticalSkillGaps';
import { NextSkillActionCard } from '@/components/skills/NextSkillAction';
import { LearningProgress } from '@/components/skills/LearningProgress';
import { SkillEvidenceSection } from '@/components/skills/SkillEvidenceSection';
import { SkillTrendSection } from '@/components/skills/SkillTrend';
import { AISkillInsightsCard } from '@/components/skills/AISkillInsights';
import { SkillDetailsModal } from '@/components/skills/SkillDetailsModal';
import { AddEditSkillModal } from '@/components/skills/AddEditSkillModal';
import { SkillsSkeleton } from '@/components/skills/SkillsSkeleton';
import { SkillsEmptyState } from '@/components/skills/SkillsEmptyState';
import { SkillsErrorState } from '@/components/skills/SkillsErrorState';
import { OfflineIndicator } from '@/components/skills/OfflineIndicator';

export default function SkillIntelligenceCenterPage() {
  const {
    data,
    canonicalSkills,
    loading,
    refreshing,
    isAnalyzing,
    isOnline,
    error,
    relativeUpdated,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    changeTargetCareer,
    filteredSkills,
    // Mutations
    addSkill,
    patchSkill,
    deleteSkill,
    recalculateAll,
    refresh,
    // Modals
    isAddEditModalOpen,
    editingSkill,
    openAddModal,
    openEditModal,
    closeAddEditModal,
    isDetailModalOpen,
    selectedSkillDetail,
    openSkillDetail,
    closeSkillDetail,
  } = useSkillIntelligence();

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col lg:flex-row text-slate-900">
      {/* Primary Global Navigation */}
      <Sidebar
        userName={data?.candidate?.name || 'Candidate'}
        userEmail={data?.candidate?.email || ''}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 py-6 sm:py-8 px-3.5 sm:px-6 lg:px-10 pb-32 lg:pb-10 overflow-y-auto overflow-x-hidden min-w-0 max-w-7xl mx-auto w-full">
        <div className="space-y-6">
          {/* Offline Banner */}
          {!isOnline && <OfflineIndicator lastSyncText={relativeUpdated} />}

          {/* 1. Header */}
          <SkillsHeader
            onAddSkill={openAddModal}
            onRecalculate={recalculateAll}
            isSyncing={refreshing}
            isAnalyzing={isAnalyzing}
            lastUpdatedText={relativeUpdated}
          />

          {/* Error Banner if error occurred */}
          {error && !data && (
            <SkillsErrorState error={error} onRetry={refresh} />
          )}

          {/* Loading Skeleton */}
          {loading && !data && <SkillsSkeleton />}

          {/* If Data Loaded */}
          {data && (
            <>
              {/* 2. Top Metric Cards */}
              <SkillOverviewMetricsGrid
                metrics={data.metrics}
                targetCareerTitle={data.target_career?.title}
              />

              {/* 3. Target Career Benchmark Bar */}
              <CareerTargetBar
                targetCareer={data.target_career}
                availableCareers={data.available_careers}
                onChangeCareer={changeTargetCareer}
              />

              {/* If User has no skills whatsoever */}
              {data.metrics?.total_skills === 0 ? (
                <SkillsEmptyState onAddSkill={openAddModal} skillCount={0} />
              ) : (
                <>
                  {/* Partial Profile Helper if under 5 skills */}
                  {data.metrics?.total_skills < 5 && (
                    <SkillsEmptyState
                      onAddSkill={openAddModal}
                      skillCount={data.metrics.total_skills}
                    />
                  )}

                  {/* 4. Current Skill Profile */}
                  <SkillProfileSection
                    skills={filteredSkills}
                    allCategories={data.categories}
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    onSelectSkill={openSkillDetail}
                    onEditSkill={openEditModal}
                    onDeleteSkill={deleteSkill}
                    onAddSkillClick={openAddModal}
                  />

                  {/* 5. Critical Skill Gaps ("Skills to Focus On") */}
                  <CriticalSkillGaps gaps={data.critical_gaps} />

                  {/* 6. Career Target Skill Matrix */}
                  <CareerSkillMatrix
                    matrix={data.matrix}
                    targetCareerTitle={data.target_career?.title}
                  />

                  {/* 7. Skills in Progress (Learning) */}
                  <LearningProgress items={data.learning_progress} />

                  {/* 8. Skill Evidence Matrix */}
                  <SkillEvidenceSection evidence={data.evidence} />

                  {/* 9. Skill Trend Over Time */}
                  <SkillTrendSection trend={data.trend} />

                  {/* 10. AI Skill Insights */}
                  <AISkillInsightsCard insights={data.ai_insights} />

                  {/* 11. Next Best Skill Action */}
                  <NextSkillActionCard action={data.next_action} />
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Slide-over / Modal: Skill Details Panel */}
      <SkillDetailsModal
        isOpen={isDetailModalOpen}
        onClose={closeSkillDetail}
        skill={selectedSkillDetail}
        onEdit={(sk) => {
          closeSkillDetail();
          openEditModal(sk);
        }}
      />

      {/* Modal: Add / Edit Skill */}
      <AddEditSkillModal
        isOpen={isAddEditModalOpen}
        onClose={closeAddEditModal}
        editingSkill={editingSkill}
        canonicalSkills={canonicalSkills}
        onAddSkill={addSkill}
        onPatchSkill={patchSkill}
      />
    </div>
  );
}

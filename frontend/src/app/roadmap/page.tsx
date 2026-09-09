'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useRoadmap } from '@/lib/hooks/useRoadmap';
import { RoadmapHeader } from '@/components/roadmap/RoadmapHeader';
import { CareerReadinessCard } from '@/components/roadmap/CareerReadinessCard';
import { RoadmapIntelligenceCard } from '@/components/roadmap/RoadmapIntelligenceCard';
import { CurrentProgress } from '@/components/roadmap/CurrentProgress';
import { SmartNextAction } from '@/components/roadmap/SmartNextAction';
import { TodaysFocus } from '@/components/roadmap/TodaysFocus';
import { RoadmapTimeline } from '@/components/roadmap/RoadmapTimeline';
import { RoadmapPhase } from '@/components/roadmap/RoadmapPhase';
import { SkillProgressCard } from '@/components/roadmap/SkillProgressCard';
import { ProjectMilestonesCard } from '@/components/roadmap/ProjectMilestonesCard';
import { RoadmapActivityTimeline } from '@/components/roadmap/RoadmapActivityTimeline';
import { RoadmapCustomizationDialog } from '@/components/roadmap/RoadmapCustomizationDialog';
import { RegenerateRoadmapModal } from '@/components/roadmap/RegenerateRoadmapModal';
import { RoadmapSkeleton } from '@/components/roadmap/RoadmapSkeleton';
import { RoadmapEmptyState } from '@/components/roadmap/RoadmapEmptyState';
import { RoadmapErrorState } from '@/components/roadmap/RoadmapErrorState';
import { OfflineBanner } from '@/components/roadmap/OfflineBanner';

export default function RoadmapPage() {
  const {
    roadmap,
    loading,
    error,
    activePhaseId,
    setActivePhaseId,
    telemetryStatus,
    isOffline,
    userProfile,
    availableCareers,
    activities,
    isCustomizing,
    setIsCustomizing,
    isRegenerating,
    setIsRegenerating,
    startItem,
    completeItem,
    skipItem,
    completeResource,
    toggleTask,
    saveNotes,
    updateSettings,
    regenerateRoadmap,
    buildRoadmap,
    refreshRoadmap,
  } = useRoadmap();

  if (loading && !roadmap) {
    return (
      <div className="min-h-screen bg-slate-50/40 flex flex-col lg:flex-row">
        <Sidebar userName={userProfile?.name} userEmail={userProfile?.email} />
        <div className="flex-1">
          <RoadmapSkeleton />
        </div>
      </div>
    );
  }

  if (error && !roadmap) {
    return (
      <div className="min-h-screen bg-slate-50/40 flex flex-col lg:flex-row">
        <Sidebar userName={userProfile?.name} userEmail={userProfile?.email} />
        <div className="flex-1">
          <RoadmapErrorState onRetry={refreshRoadmap} />
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-slate-50/40 flex flex-col lg:flex-row">
        <Sidebar userName={userProfile?.name} userEmail={userProfile?.email} />
        <div className="flex-1">
          <RoadmapEmptyState
            careers={availableCareers}
            onBuild={buildRoadmap}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  // Find active phase object and items
  const phases = roadmap.phases || [];
  const currentPhase = phases.find((p) => p.id === activePhaseId) || phases[0];
  const items = roadmap.items || [];
  const activePhaseItems = items.filter((i) => i.phase_id === currentPhase?.id);

  const handleContinueTask = (itemId?: string | null) => {
    if (itemId) {
      const el = document.getElementById(`item-${itemId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else if (items.length > 0) {
      const firstIncomplete = items.find((i) => !i.is_completed && i.status !== 'LOCKED');
      if (firstIncomplete) {
        setActivePhaseId(firstIncomplete.phase_id);
        setTimeout(() => {
          const el = document.getElementById(`item-${firstIncomplete.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col lg:flex-row">
      <Sidebar userName={userProfile?.name} userEmail={userProfile?.email} />

      <div className="flex-1 min-w-0 flex flex-col">
        <OfflineBanner isOffline={isOffline} />

        <main className="flex-1 min-w-0 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 pb-32 lg:pb-12 max-w-7xl mx-auto w-full space-y-6 overflow-x-hidden">
          {/* Header */}
          <RoadmapHeader
            roadmap={roadmap}
            onContinue={() => handleContinueTask(roadmap.next_best_action?.item_id)}
            onCustomize={() => setIsCustomizing(true)}
            onRegenerate={() => setIsRegenerating(true)}
          />

          {/* Desktop & Mobile Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left/Main Column: Learning Execution Workspace */}
            <div className="lg:col-span-2 space-y-6">
              {/* Smart Next Best Action */}
              <SmartNextAction
                action={roadmap.next_best_action}
                onExecute={(itemId) => handleContinueTask(itemId)}
              />

              {/* Today's Focus Action Cards */}
              <TodaysFocus
                items={items}
                onSelectTask={(itemId) => handleContinueTask(itemId)}
              />

              {/* Phase Timeline Pills */}
              <RoadmapTimeline
                phases={phases}
                activePhaseId={activePhaseId}
                onSelectPhase={(pId) => setActivePhaseId(pId)}
              />

              {/* Active Phase Deep Dive & Items */}
              {currentPhase && (
                <RoadmapPhase
                  phase={currentPhase}
                  items={activePhaseItems}
                  allItems={items}
                  onStart={startItem}
                  onComplete={completeItem}
                  onSkip={skipItem}
                  onToggleTask={toggleTask}
                  onSaveNotes={saveNotes}
                  onCompleteResource={completeResource}
                />
              )}

              {/* On Mobile: Render Right-column Telemetry below */}
              <div className="block lg:hidden space-y-6">
                <CareerReadinessCard
                  careerTitle={roadmap.career_title || roadmap.title}
                  readinessScore={roadmap.career_readiness_score}
                  breakdown={roadmap.readiness_breakdown}
                />

                <CurrentProgress roadmap={roadmap} />

                <RoadmapIntelligenceCard intelligence={roadmap.roadmap_intelligence} />

                <SkillProgressCard roadmap={roadmap} />

                <ProjectMilestonesCard
                  careerTitle={roadmap.career_title || roadmap.title}
                  items={items}
                />

                <RoadmapActivityTimeline activities={activities} />
              </div>
            </div>

            {/* Right Column (Desktop Sticky Telemetry Summary) */}
            <div className="hidden lg:flex flex-col gap-6 sticky top-6">
              <CareerReadinessCard
                careerTitle={roadmap.career_title || roadmap.title}
                readinessScore={roadmap.career_readiness_score}
                breakdown={roadmap.readiness_breakdown}
              />

              <CurrentProgress roadmap={roadmap} />

              <RoadmapIntelligenceCard intelligence={roadmap.roadmap_intelligence} />

              <SkillProgressCard roadmap={roadmap} />

              <ProjectMilestonesCard
                careerTitle={roadmap.career_title || roadmap.title}
                items={items}
              />

              <RoadmapActivityTimeline activities={activities} />
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <RoadmapCustomizationDialog
        isOpen={isCustomizing}
        onClose={() => setIsCustomizing(false)}
        currentHours={roadmap.hours_per_week || 10}
        currentPace={roadmap.learning_pace || 'balanced'}
        onSave={(hrs, pace) => updateSettings(hrs, pace)}
      />

      <RegenerateRoadmapModal
        isOpen={isRegenerating}
        onClose={() => setIsRegenerating(false)}
        currentVersion={roadmap.version || 1}
        careers={availableCareers}
        currentCareerId={roadmap.career_id}
        onConfirm={(reason, careerId) => regenerateRoadmap(reason, undefined, undefined, careerId)}
      />
    </div>
  );
}

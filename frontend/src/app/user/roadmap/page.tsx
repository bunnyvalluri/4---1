'use client';

import React from 'react';
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

export default function UserRoadmapPage() {
  const {
    roadmap,
    loading,
    error,
    activePhaseId,
    setActivePhaseId,
    isOffline,
    availableCareers,
    activities,
    isCustomizing,
    setIsCustomizing,
    isRegenerating,
    setIsRegenerating,
    startItem,
    completeItem,
    skipItem,
    startResource,
    completeResource,
    toggleTask,
    saveNotes,
    updateSettings,
    regenerateRoadmap,
    buildRoadmap,
    refreshRoadmap,
  } = useRoadmap();

  if (loading && !roadmap) {
    return <RoadmapSkeleton />;
  }

  if (error && !roadmap) {
    return <RoadmapErrorState onRetry={refreshRoadmap} />;
  }

  if (!roadmap) {
    return (
      <RoadmapEmptyState
        careers={availableCareers}
        onBuild={buildRoadmap}
        loading={loading}
      />
    );
  }

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
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      <OfflineBanner isOffline={isOffline} />

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
              onStartResource={startResource}
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
        <div className="hidden lg:flex flex-col gap-6 sticky top-20">
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

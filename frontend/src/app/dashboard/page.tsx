'use client';

import React from 'react';
import {
  Sparkles,
  Award,
  BrainCircuit,
  FileCheck,
  Map,
  UserCheck,
} from 'lucide-react';
import { useDashboardRealtime } from '@/lib/hooks/useDashboardRealtime';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { CareerMatchCard } from '@/components/dashboard/CareerMatchCard';
import { CareerPathList } from '@/components/dashboard/CareerPathList';
import { NextBestAction } from '@/components/dashboard/NextBestAction';
import { SkillProfile } from '@/components/dashboard/SkillProfile';
import { SkillGapCard } from '@/components/dashboard/SkillGapCard';
import { RoadmapProgress } from '@/components/dashboard/RoadmapProgress';
import { ResumeIntelligence } from '@/components/dashboard/ResumeIntelligence';
import { AssessmentOverview } from '@/components/dashboard/AssessmentOverview';
import { AIQuickAsk } from '@/components/dashboard/AIQuickAsk';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

export default function DashboardPage() {
  const {
    loading,
    error,
    telemetryStatus,
    lastUpdated,
    relativeTime,
    candidate,
    metrics,
    nextAction,
    careerMatch,
    skills,
    skillGaps,
    roadmap,
    resume,
    assessments,
    activities,
    notifications,
    toggleRoadmapTask,
    markNotificationRead,
    refresh,
  } = useDashboardRealtime();

  if (loading) {
    return (
      <DashboardShell
        userName="Candidate"
        userEmail=""
        telemetryStatus="Syncing..."
        lastUpdatedText="just now"
        notifications={[]}
        onRefresh={() => {}}
        onMarkNotificationRead={() => {}}
      >
        <DashboardSkeleton />
      </DashboardShell>
    );
  }

  const userName = candidate?.name || 'Candidate';
  const userEmail = candidate?.email || '';
  const targetCareer = candidate?.target_career || metrics?.career_match?.title || 'Target Career Not Selected';
  const careerMatchScore = metrics?.career_match?.score ?? 0;
  const profileCompletion = candidate?.profile_completion ?? metrics?.profile_completion?.score ?? 0;

  return (
    <DashboardShell
      userName={userName}
      userEmail={userEmail}
      telemetryStatus={telemetryStatus}
      lastUpdatedText={relativeTime}
      notifications={notifications}
      onRefresh={refresh}
      onMarkNotificationRead={markNotificationRead}
    >
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full min-w-0">
        {/* ======================================================== */}
        {/* 1. GREETING & COMMAND CENTER HERO */}
        {/* ======================================================== */}
        <DashboardHero
          userName={userName}
          branch={candidate?.branch}
          profileCompletion={profileCompletion}
          targetCareer={targetCareer}
          careerMatchScore={careerMatchScore}
          nextAction={nextAction}
          relativeTime={relativeTime}
        />

        {/* ======================================================== */}
        {/* 2. NEXT BEST ACTION (Prominent, uncompressed) */}
        {/* ======================================================== */}
        <NextBestAction action={nextAction} targetCareer={targetCareer} />

        {/* ======================================================== */}
        {/* 3. PRIMARY KPI METRIC GRID (2-Col Mobile, 3-Col Tablet, 6-Col Desktop) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3.5 lg:gap-4 w-full min-w-0">
          {/* Metric 1: Career Match */}
          <MetricCard
            label="Career Match"
            value={`${careerMatchScore}%`}
            subtext={targetCareer}
            badge={metrics?.career_match.badge || 'Top Match'}
            badgeVariant="blue"
            icon={Sparkles}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            progressPercent={careerMatchScore}
            progressColor="bg-blue-600"
            actionHref="/recommendations"
            actionText="Inspect Match"
          />

          {/* Metric 2: Skill Readiness */}
          <MetricCard
            label="Skill Readiness"
            value={`${metrics?.skill_readiness.score || 74}%`}
            subtext={`${metrics?.skill_readiness.verified_skills || 18} / ${metrics?.skill_readiness.total_skills || 24} verified`}
            badge={metrics?.skill_readiness.badge || 'Telemetry'}
            badgeVariant="emerald"
            icon={Award}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            progressPercent={metrics?.skill_readiness.score || 74}
            progressColor="bg-emerald-500"
            actionHref="/skills"
            actionText="Verify Skills"
          />

          {/* Metric 3: Assessment Index */}
          <MetricCard
            label="Assessment Index"
            value={`${metrics?.assessment_index.score || 82}%`}
            subtext={`Across ${metrics?.assessment_index.dimensions || 6} dimensions`}
            badge={metrics?.assessment_index.badge || 'Baseline'}
            badgeVariant="indigo"
            icon={BrainCircuit}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            progressPercent={metrics?.assessment_index.score || 82}
            progressColor="bg-indigo-600"
            actionHref="/assessment"
            actionText="View Diagnostic"
          />

          {/* Metric 4: Resume ATS */}
          <MetricCard
            label="Resume ATS"
            value={`${metrics?.resume_ats.score || 88}/100`}
            subtext={`${metrics?.resume_ats.skills_detected || 18} skills detected`}
            badge={metrics?.resume_ats.rating || 'Strong'}
            badgeVariant="violet"
            icon={FileCheck}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            progressPercent={metrics?.resume_ats.score || 88}
            progressColor="bg-violet-600"
            actionHref="/resume"
            actionText="ATS Audit"
          />

          {/* Metric 5: Roadmap Progress */}
          <MetricCard
            label="Roadmap Progress"
            value={`${metrics?.roadmap_progress.score || 42}%`}
            subtext={`Month ${metrics?.roadmap_progress.current_month || 3} of ${metrics?.roadmap_progress.total_months || 6}`}
            badge={metrics?.roadmap_progress.badge || 'Month 3 of 6'}
            badgeVariant="amber"
            icon={Map}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            progressPercent={metrics?.roadmap_progress.score || 42}
            progressColor="bg-amber-500"
            actionHref="/roadmap"
            actionText="Full Roadmap"
          />

          {/* Metric 6: Profile Completion */}
          <MetricCard
            label="Profile Completion"
            value={`${profileCompletion}%`}
            subtext={profileCompletion >= 80 ? 'Optimized profile' : 'Pending prerequisites'}
            badge={metrics?.profile_completion.badge || 'Complete Profile'}
            badgeVariant="slate"
            icon={UserCheck}
            iconBg="bg-slate-100"
            iconColor="text-slate-700"
            progressPercent={profileCompletion}
            progressColor="bg-slate-700"
            actionHref="/profile"
            actionText="Update Profile"
          />
        </div>

        {/* ======================================================== */}
        {/* 4. MAJOR SECTION A: CAREER MATCH & TOP CAREER PATHS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-6 items-start w-full min-w-0">
          {/* Deep Career Match Widget */}
          <div className="lg:col-span-3 min-w-0">
            <CareerMatchCard
              careerTitle={targetCareer}
              matchScore={careerMatchScore}
              breakdown={careerMatch?.breakdown}
              whyFits={careerMatch?.why_fits}
            />
          </div>

          {/* Top Ranked Career Paths List */}
          <div className="lg:col-span-2 min-w-0">
            <CareerPathList paths={careerMatch?.top_paths} />
          </div>
        </div>

        {/* ======================================================== */}
        {/* 5. MAJOR SECTION B: SKILLS & GAPS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-start w-full min-w-0">
          {/* Candidate Skill Profile */}
          <div className="min-w-0">
            <SkillProfile categories={skills?.categories} />
          </div>

          {/* Career Skill Gaps */}
          <div className="min-w-0">
            <SkillGapCard gaps={skillGaps} />
          </div>
        </div>

        {/* ======================================================== */}
        {/* 6. MAJOR SECTION C: ROADMAP & RESUME INTELLIGENCE */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-6 items-start w-full min-w-0">
          {/* Active Learning Curriculum & Milestone Toggles */}
          <div className="lg:col-span-3 min-w-0">
            <RoadmapProgress
              roadmap={roadmap}
              onToggleTask={toggleRoadmapTask}
            />
          </div>

          {/* Resume ATS Intelligence */}
          <div className="lg:col-span-2 min-w-0">
            <ResumeIntelligence resume={resume} />
          </div>
        </div>

        {/* ======================================================== */}
        {/* 7. MAJOR SECTION D: ASSESSMENTS, AI COPILOT & RECENT ACTIVITY */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-6 items-start w-full min-w-0">
          {/* Assessment Performance Radar */}
          <div className="lg:col-span-3 min-w-0">
            <AssessmentOverview assessment={assessments} />
          </div>

          {/* Copilot Ask & Live Activity Stream */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6 min-w-0">
            <AIQuickAsk />
            <RecentActivity activities={activities} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

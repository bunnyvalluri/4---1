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

export default function UserDashboardPage() {
  const {
    loading,
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
    toggleRoadmapTask,
  } = useDashboardRealtime();

  if (loading) {
    return <DashboardSkeleton />;
  }

  const userName = candidate?.name || 'Candidate';
  const targetCareer = candidate?.target_career || metrics?.career_match?.title || 'Target Career Not Selected';
  const careerMatchScore = metrics?.career_match?.score ?? 0;
  const profileCompletion = candidate?.profile_completion ?? metrics?.profile_completion?.score ?? 0;

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
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
      {/* 2. NEXT BEST ACTION */}
      {/* ======================================================== */}
      <NextBestAction action={nextAction} targetCareer={targetCareer} />

      {/* ======================================================== */}
      {/* 3. PRIMARY KPI METRIC GRID */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3.5 lg:gap-4 w-full min-w-0">
        {/* Metric 1: Career Match */}
        <MetricCard
          label="Career Match"
          value={`${careerMatchScore}%`}
          subtext={targetCareer}
          badge={metrics?.career_match?.badge || (careerMatchScore > 0 ? 'Top Match' : 'Not Selected')}
          badgeVariant="blue"
          icon={Sparkles}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          progressPercent={careerMatchScore}
          progressColor="bg-blue-600"
          actionHref="/user/recommendations"
          actionText="Inspect Match"
        />

        {/* Metric 2: Skill Readiness */}
        <MetricCard
          label="Skill Readiness"
          value={`${metrics?.skill_readiness?.score ?? 0}%`}
          subtext={
            metrics?.skill_readiness?.total_skills
              ? `${metrics.skill_readiness.verified_skills ?? 0} / ${metrics.skill_readiness.total_skills} verified`
              : 'No skills verified'
          }
          badge={metrics?.skill_readiness?.badge || (metrics?.skill_readiness?.verified_skills ? 'Verified' : 'Pending')}
          badgeVariant="emerald"
          icon={Award}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          progressPercent={metrics?.skill_readiness?.score ?? 0}
          progressColor="bg-emerald-500"
          actionHref="/user/skills"
          actionText="Verify Skills"
        />

        {/* Metric 3: Assessment Index */}
        <MetricCard
          label="Assessment Index"
          value={`${metrics?.assessment_index?.score ?? 0}%`}
          subtext={
            metrics?.assessment_index?.dimensions
              ? `Across ${metrics.assessment_index.dimensions} dimensions`
              : 'Diagnostic pending'
          }
          badge={metrics?.assessment_index?.badge || (metrics?.assessment_index?.score ? 'Completed' : 'Not Taken')}
          badgeVariant="indigo"
          icon={BrainCircuit}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          progressPercent={metrics?.assessment_index?.score ?? 0}
          progressColor="bg-indigo-600"
          actionHref="/user/assessment"
          actionText="View Diagnostic"
        />

        {/* Metric 4: Resume ATS */}
        <MetricCard
          label="Resume ATS"
          value={metrics?.resume_ats?.score ? `${metrics.resume_ats.score}/100` : '0/100'}
          subtext={
            metrics?.resume_ats?.skills_detected
              ? `${metrics.resume_ats.skills_detected} skills detected`
              : 'No resume uploaded'
          }
          badge={metrics?.resume_ats?.rating || (metrics?.resume_ats?.score ? 'Analyzed' : 'Pending')}
          badgeVariant="violet"
          icon={FileCheck}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          progressPercent={metrics?.resume_ats?.score ?? 0}
          progressColor="bg-violet-600"
          actionHref="/user/resume"
          actionText="ATS Audit"
        />

        {/* Metric 5: Roadmap Progress */}
        <MetricCard
          label="Roadmap Progress"
          value={`${metrics?.roadmap_progress?.score ?? 0}%`}
          subtext={
            metrics?.roadmap_progress?.total_months
              ? `Month ${metrics.roadmap_progress.current_month || 1} of ${metrics.roadmap_progress.total_months}`
              : 'No active roadmap'
          }
          badge={metrics?.roadmap_progress?.badge || (metrics?.roadmap_progress?.score ? 'In Progress' : 'Not Started')}
          badgeVariant="amber"
          icon={Map}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          progressPercent={metrics?.roadmap_progress?.score ?? 0}
          progressColor="bg-amber-500"
          actionHref="/user/roadmap"
          actionText="Full Roadmap"
        />

        {/* Metric 6: Profile Completion */}
        <MetricCard
          label="Profile Completion"
          value={`${profileCompletion}%`}
          subtext={profileCompletion >= 80 ? 'Optimized profile' : 'Pending prerequisites'}
          badge={metrics?.profile_completion?.badge || (profileCompletion >= 80 ? 'Complete' : 'Incomplete')}
          badgeVariant="slate"
          icon={UserCheck}
          iconBg="bg-slate-100"
          iconColor="text-slate-700"
          progressPercent={profileCompletion}
          progressColor="bg-slate-700"
          actionHref="/user/settings"
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
        <div className="min-w-0">
          <SkillProfile categories={skills?.categories} />
        </div>

        <div className="min-w-0">
          <SkillGapCard gaps={skillGaps} />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. MAJOR SECTION C: ROADMAP & RESUME INTELLIGENCE */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-6 items-start w-full min-w-0">
        <div className="lg:col-span-3 min-w-0">
          <RoadmapProgress
            roadmap={roadmap}
            onToggleTask={toggleRoadmapTask}
          />
        </div>

        <div className="lg:col-span-2 min-w-0">
          <ResumeIntelligence resume={resume} />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 7. MAJOR SECTION D: ASSESSMENTS, AI COPILOT & RECENT ACTIVITY */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-6 items-start w-full min-w-0">
        <div className="lg:col-span-3 min-w-0">
          <AssessmentOverview assessment={assessments} />
        </div>

        <div className="lg:col-span-2 space-y-5 sm:space-y-6 min-w-0">
          <AIQuickAsk />
          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  );
}

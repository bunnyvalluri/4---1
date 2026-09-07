'use client';

import React from 'react';
import { Hero } from '@/components/landing/Hero';
import { TrustStrip } from '@/components/landing/TrustStrip';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { RecommendationShowcase } from '@/components/landing/RecommendationShowcase';
import { SkillGapShowcase } from '@/components/landing/SkillGapShowcase';
import { RoadmapShowcase } from '@/components/landing/RoadmapShowcase';
import { ResumeShowcase } from '@/components/landing/ResumeShowcase';
import { AssistantShowcase } from '@/components/landing/AssistantShowcase';
import { CareerPaths } from '@/components/landing/CareerPaths';
import { CapabilityMetrics } from '@/components/landing/CapabilityMetrics';
import { SampleExperiences } from '@/components/landing/SampleExperiences';
import { FaqSection } from '@/components/landing/FaqSection';
import { FinalCta } from '@/components/landing/FinalCta';

export default function HomePage() {
  return (
    <div className="bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Hero Section with Interactive Product Visual */}
      <Hero />

      {/* 2. Compact Value & Trust Strip */}
      <TrustStrip />

      {/* 3. Features Bento Grid */}
      <FeatureGrid />

      {/* 4. 4-Stage Progressive Timeline: How It Works */}
      <HowItWorks />

      {/* 5. AI Career Recommendation Showcase */}
      <RecommendationShowcase />

      {/* 6. Precision Skill-Gap Telemetry */}
      <SkillGapShowcase />

      {/* 7. 6-Month Personalized Learning Roadmap */}
      <RoadmapShowcase />

      {/* 8. ATS Resume Intelligence & Bullet Optimization */}
      <ResumeShowcase />

      {/* 9. Contextual AI Career Assistant Showcase */}
      <AssistantShowcase />

      {/* 10. Tech Career Disciplines Explorer */}
      <CareerPaths />

      {/* 11. Real Platform Capabilities (No Fake Statistics) */}
      <CapabilityMetrics />

      {/* 12. Transparent Case Studies (Sample Experiences) */}
      <SampleExperiences />

      {/* 13. Accessible FAQ Accordion */}
      <FaqSection />

      {/* 14. High-Impact Light-Theme Final CTA */}
      <FinalCta />
    </div>
  );
}

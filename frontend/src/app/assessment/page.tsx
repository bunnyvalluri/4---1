'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAssessment } from '@/lib/hooks/useAssessment';
import { AssessmentHeader } from '@/components/assessment/AssessmentHeader';
import { AssessmentOverview } from '@/components/assessment/AssessmentOverview';
import { AssessmentProgress } from '@/components/assessment/AssessmentProgress';
import { AssessmentSectionProgress } from '@/components/assessment/AssessmentSectionProgress';
import { QuestionCard } from '@/components/assessment/QuestionCard';
import { QuestionNavigator } from '@/components/assessment/QuestionNavigator';
import { AssessmentReview } from '@/components/assessment/AssessmentReview';
import { AssessmentProcessing } from '@/components/assessment/AssessmentProcessing';
import { AssessmentResults } from '@/components/assessment/AssessmentResults';
import { AssessmentSkeleton } from '@/components/assessment/AssessmentSkeleton';
import { AssessmentErrorState } from '@/components/assessment/AssessmentErrorState';
import { OfflineAssessmentBanner } from '@/components/assessment/OfflineAssessmentBanner';

export default function AssessmentPage() {
  const [userProfile, setUserProfile] = useState<any>(null);

  const {
    stage,
    setStage,
    questions,
    currentIndex,
    currentQuestion,
    totalQuestions,
    answers,
    flagged,
    loading,
    submitting,
    saveStatus,
    lastSaved,
    result,
    error,
    isOnline,
    processingStep,
    answeredCount,
    isCurrentFlagged,
    categorySummary,
    startAssessment,
    selectOption,
    toggleFlag,
    setCurrentIndex,
    nextQuestion,
    prevQuestion,
    goToReview,
    submitAssessment,
    retakeAssessment,
  } = useAssessment();

  // Load user profile for Sidebar
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data?.user) setUserProfile(data.user);
        }
      } catch {}
    }
    loadProfile();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/40 flex flex-col lg:flex-row">
      <Sidebar userName={userProfile?.name} userEmail={userProfile?.email} />

      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-10 overflow-y-auto max-w-6xl mx-auto w-full">
        <div className="space-y-6">
          {/* Top Offline Connectivity Notice */}
          <OfflineAssessmentBanner isOnline={isOnline} />

          {/* Assessment Global Header */}
          <AssessmentHeader
            stage={stage}
            answeredCount={answeredCount}
            totalQuestions={totalQuestions}
            onStartOrResume={() => startAssessment(false)}
            onRetake={retakeAssessment}
          />

          {/* Loading State */}
          {loading && <AssessmentSkeleton />}

          {/* Error State */}
          {!loading && error && questions.length === 0 && (
            <AssessmentErrorState
              message={error}
              onRetry={() => startAssessment(false)}
            />
          )}

          {/* 1. OVERVIEW STAGE */}
          {!loading && stage === 'overview' && (
            <AssessmentOverview
              onStart={() => startAssessment(false)}
              hasInProgress={answeredCount > 0}
              answeredCount={answeredCount}
              totalQuestions={totalQuestions}
            />
          )}

          {/* 2. IN-PROGRESS STAGE */}
          {!loading && stage === 'in_progress' && currentQuestion && (
            <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
              {/* Live Progress Banner */}
              <AssessmentProgress
                currentIndex={currentIndex}
                totalQuestions={totalQuestions}
                answeredCount={answeredCount}
                flaggedCount={flagged.size}
              />

              {/* Section Progress Bar */}
              <AssessmentSectionProgress
                currentCategory={currentQuestion.category}
                categorySummary={categorySummary}
                onSelectCategory={(cat) => {
                  const firstInCat = questions.findIndex(
                    (q) => q.category.toUpperCase() === cat.toUpperCase()
                  );
                  if (firstInCat !== -1) setCurrentIndex(firstInCat);
                }}
              />

              {/* Main Workspace (Question Card + Question Navigator) */}
              <div className="flex flex-col lg:flex-row items-start gap-6">
                <div className="flex-1 w-full min-w-0">
                  <QuestionCard
                    question={currentQuestion}
                    currentIndex={currentIndex}
                    totalQuestions={totalQuestions}
                    selectedOption={answers[currentQuestion.id]}
                    isFlagged={isCurrentFlagged}
                    saveStatus={saveStatus}
                    lastSaved={lastSaved}
                    onSelectOption={(optIdx) => selectOption(currentQuestion.id, optIdx)}
                    onToggleFlag={() => toggleFlag(currentQuestion.id)}
                    onPrev={prevQuestion}
                    onNext={nextQuestion}
                    onReview={goToReview}
                  />
                </div>

                {/* Question Navigator (Sidebar on desktop, drawer trigger on mobile) */}
                <QuestionNavigator
                  questions={questions}
                  currentIndex={currentIndex}
                  answers={answers}
                  flagged={flagged}
                  onSelectQuestion={(idx) => setCurrentIndex(idx)}
                  onReview={goToReview}
                />
              </div>
            </div>
          )}

          {/* 3. REVIEW STAGE */}
          {!loading && stage === 'review' && (
            <AssessmentReview
              questions={questions}
              answers={answers}
              flagged={flagged}
              categorySummary={categorySummary}
              onSelectQuestion={(idx) => {
                setCurrentIndex(idx);
                setStage('in_progress');
              }}
              onSubmit={submitAssessment}
              onBackToTest={() => setStage('in_progress')}
              submitting={submitting}
            />
          )}

          {/* 4. PROCESSING STAGE */}
          {stage === 'processing' && (
            <AssessmentProcessing step={processingStep} />
          )}

          {/* 5. RESULTS STAGE */}
          {!loading && stage === 'results' && result && (
            <AssessmentResults
              result={result}
              onRetake={retakeAssessment}
            />
          )}
        </div>
      </main>
    </div>
  );
}

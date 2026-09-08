import React from 'react';
import { AlertTriangle, RotateCw, WifiOff } from 'lucide-react';

interface RecommendationErrorStateProps {
  message?: string;
  onRetry: () => void;
  isOffline?: boolean;
  hasCachedData?: boolean;
}

export function RecommendationErrorState({
  message,
  onRetry,
  isOffline = false,
  hasCachedData = false,
}: RecommendationErrorStateProps) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/40 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100">
          {isOffline ? (
            <WifiOff className="h-6 w-6 text-red-500" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-red-500" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-base font-bold text-red-900">
              {isOffline
                ? 'You are offline'
                : "We couldn't refresh your career recommendations."}
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {isOffline
                ? 'Reconnect to the internet to load the latest career data.'
                : message ||
                  'There was a problem reaching the recommendation engine.'}
            </p>
          </div>

          {hasCachedData && !isOffline && (
            <div className="rounded-xl border border-red-200/60 bg-white px-3 py-2 text-xs text-slate-600">
              Your previous recommendations are still displayed below.
            </div>
          )}

          {!isOffline && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition-all"
            >
              <RotateCw className="h-4 w-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

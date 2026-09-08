'use client';

import React from 'react';
import { WifiOff } from 'lucide-react';

interface OfflineBannerProps {
  isOffline: boolean;
}

export function OfflineBanner({ isOffline }: OfflineBannerProps) {
  if (!isOffline) return null;

  return (
    <div className="bg-amber-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all">
      <WifiOff className="h-4 w-4" />
      <span>
        You are currently working offline. Your milestone actions are preserved locally and will synchronize automatically once reconnected.
      </span>
    </div>
  );
}

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className = '' }: ResponsiveTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = containerRef.current;
    if (el) {
      const hasOverflow = el.scrollWidth > el.clientWidth + 5;
      const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;
      setCanScrollRight(hasOverflow && !isAtEnd);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  return (
    <div className={`relative w-full rounded-2xl border border-slate-200/90 bg-white overflow-hidden ${className}`}>
      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="w-full overflow-x-auto touch-scroll [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]"
      >
        {children}
      </div>

      {/* Visual Scroll Hint on Mobile */}
      {canScrollRight && (
        <div className="sm:hidden absolute right-0 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-white/90 to-transparent flex items-center justify-end pr-1 text-slate-400">
          <ChevronRight className="h-4 w-4 animate-pulse" />
        </div>
      )}
    </div>
  );
}

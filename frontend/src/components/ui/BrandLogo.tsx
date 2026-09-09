'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'emblem' | 'full';
  showText?: boolean;
  subtext?: string;
  badge?: string;
  href?: string;
  className?: string;
}

export function BrandLogo({
  size = 'md',
  variant = 'full',
  showText = true,
  subtext,
  badge,
  href,
  className = '',
}: BrandLogoProps) {
  const sizeMap = {
    xs: { px: 28, class: 'h-7 w-7' },
    sm: { px: 36, class: 'h-9 w-9' },
    md: { px: 40, class: 'h-10 w-10' },
    lg: { px: 48, class: 'h-12 w-12' },
    xl: { px: 64, class: 'h-16 w-16' },
  };

  const imageSrc = variant === 'emblem' ? '/logo-emblem.webp' : '/logo.webp';
  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon Image */}
      <div
        className={`relative ${currentSize.class} shrink-0 rounded-xl overflow-hidden shadow-xs border border-slate-200/60 bg-white transition-transform duration-200 hover:scale-[1.03]`}
      >
        <Image
          src={imageSrc}
          alt="CareerAI Icon"
          width={currentSize.px * 2}
          height={currentSize.px * 2}
          className="h-full w-full object-contain p-0.5"
          priority
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-slate-900 text-base lg:text-lg leading-none">
              Career<span className="text-blue-600">AI</span>
            </span>
            {badge && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200 rounded">
                {badge}
              </span>
            )}
          </div>
          {subtext && (
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-1 truncate">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-flex items-center focus:outline-hidden">
        {content}
      </Link>
    );
  }

  return content;
}

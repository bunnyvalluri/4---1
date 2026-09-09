import React from 'react';

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  withBottomDockPadding?: boolean;
}

export function ResponsiveContainer({
  children,
  size = 'lg',
  className = '',
  withBottomDockPadding = true,
  ...props
}: ResponsiveContainerProps) {
  const maxWClass = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-[1600px]',
    full: 'max-w-full',
  }[size];

  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${maxWClass} ${
        withBottomDockPadding ? 'safe-bottom-dock' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export default function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div
        className={`
          ${sizes[size]}
          border-green-200
          border-t-accent-primary
          rounded-full
          animate-spin
        `}
      />
      {message && (
        <p className="text-text-muted text-sm animate-pulse">{message}</p>
      )}
    </div>
  );
}

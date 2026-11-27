import React from 'react';

export default function LoadingIndicator({
  label = 'Loading...',
  size = 'md',
  className = ''
}) {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';

  return (
    <div
      className={`flex items-center justify-center gap-3 text-sm text-slate-300 ${className}`}
      role="status"
      aria-live="polite"
    >
      <span
        className={`${sizeClass} animate-spin rounded-full border-2 border-studio-purple/30 border-t-studio-purple-light`}
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}

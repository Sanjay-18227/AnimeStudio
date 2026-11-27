import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const toastStyles = {
  success: {
    icon: CheckCircle2,
    classes: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    role: 'status'
  },
  error: {
    icon: AlertCircle,
    classes: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
    role: 'alert'
  },
  info: {
    icon: Info,
    classes: 'border-studio-cyan/40 bg-studio-cyan/10 text-cyan-100',
    role: 'status'
  }
};

export default function Toast({ toast, onDismiss, duration = 4500 }) {
  useEffect(() => {
    if (!toast || !duration) return undefined;
    const timeout = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timeout);
  }, [toast, onDismiss, duration]);

  if (!toast) return null;

  const style = toastStyles[toast.type] || toastStyles.info;
  const Icon = style.icon;

  return (
    <div
      className={`flex w-full items-start gap-3 rounded-xl border p-3 shadow-xl backdrop-blur-md ${style.classes}`}
      role={style.role}
      aria-live={style.role === 'alert' ? 'assertive' : 'polite'}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1 whitespace-pre-line text-sm">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-md p-1 text-current/70 hover:bg-white/10 hover:text-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

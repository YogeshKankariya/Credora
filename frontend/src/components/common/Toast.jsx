import React from 'react';
import { useKYC } from '../../context/KYCContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useKYC();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        let borderClass = 'border-cyan-500/40 bg-slate-900/95 text-cyan-200';
        let Icon = Info;
        let iconColor = 'text-cyan-400';

        if (isSuccess) {
          borderClass = 'border-emerald-500/40 bg-slate-900/95 text-emerald-200';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (isWarning) {
          borderClass = 'border-amber-500/40 bg-slate-900/95 text-amber-200';
          Icon = AlertTriangle;
          iconColor = 'text-amber-400';
        } else if (isError) {
          borderClass = 'border-rose-500/40 bg-slate-900/95 text-rose-200';
          Icon = AlertCircle;
          iconColor = 'text-rose-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 ${borderClass}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <p className="text-sm font-medium text-white flex-1 leading-snug">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

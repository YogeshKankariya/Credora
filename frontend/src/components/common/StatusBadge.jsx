import React from 'react';

export const StatusBadge = ({ status, size = 'sm', className = '' }) => {
  const norm = (status || '').toUpperCase();

  let styles = 'bg-slate-800 text-slate-300 border-slate-700';
  let dotColor = 'bg-slate-400';

  if (norm === 'ACTIVE' || norm === 'VERIFIED' || norm === 'PASS' || norm === 'CONFIRMED' || norm === 'VALID') {
    styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    dotColor = 'bg-emerald-400 animate-pulse';
  } else if (norm === 'REVOKED' || norm === 'FAIL' || norm === 'REJECTED' || norm === 'INVALID') {
    styles = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    dotColor = 'bg-rose-400';
  } else if (norm === 'PENDING' || norm === 'REGISTERED' || norm === 'CHECKING') {
    styles = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    dotColor = 'bg-amber-400 animate-pulse';
  } else if (norm === 'ISSUED') {
    styles = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    dotColor = 'bg-cyan-400';
  }

  const sizeClasses = size === 'lg' 
    ? 'px-3.5 py-1.5 text-sm font-semibold' 
    : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${styles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{norm}</span>
    </span>
  );
};

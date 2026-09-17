import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'cyan' }) => {
  const iconColorStyles = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  }[color] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <div className="glass-card rounded-xl p-5 relative overflow-hidden transition-all duration-200 hover:border-slate-700">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg border ${iconColorStyles}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          {trend && (
            <span className="text-emerald-400 font-medium">
              {trend}
            </span>
          )}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};

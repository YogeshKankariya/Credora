import React from 'react';
import { TamperingDemoPanel } from '../../components/tampering/TamperingDemoPanel';

export const TamperingDemo = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold">
          SECURITY SIMULATION LAB
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
          Credential Tampering Demo
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Interactive evaluation proving why any modification to customer payload data invalidates digital signatures and hash integrity checks.
        </p>
      </div>

      <TamperingDemoPanel />
    </div>
  );
};

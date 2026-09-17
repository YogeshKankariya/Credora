import React from 'react';
import { useKYC } from '../../context/KYCContext';
import { ShieldCheck, RotateCcw, User, Building2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoBanner = () => {
  const { currentRole, setCurrentRole, resetDemoData } = useKYC();
  const navigate = useNavigate();

  const handleRoleChange = (role, path) => {
    setCurrentRole(role);
    navigate(path);
  };

  return (
    <aside aria-label="Demo environment status" className="bg-gradient-to-r from-slate-900 via-navy-850 to-slate-900 border-b border-slate-800 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 backdrop-blur-md">
      <div className="flex items-center gap-2 text-slate-300">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
  

        <button
          onClick={resetDemoData}
          title="Reset all demo data to initial state"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          <span className="hidden md:inline">Reset Demo</span>
        </button>
      </div>
    </aside>
  );
};

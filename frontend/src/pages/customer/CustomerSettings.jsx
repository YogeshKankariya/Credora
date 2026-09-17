import React from 'react';
import { useKYC } from '../../context/KYCContext';
import { Settings, RotateCcw, User, ShieldCheck, HardDrive, Key } from 'lucide-react';

export const CustomerSettings = () => {
  const { users, activeCustomerId, setActiveCustomerId, resetDemoData, currentCustomer } = useKYC();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
          PREFERENCES & DEMO ENVIRONMENT
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Wallet Settings</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your simulated identity wallet profile and local environment preferences.
        </p>
      </div>

      {/* Switch Demo Customer Persona */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <User className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">Active Customer Persona</h3>
        </div>
        <p className="text-xs text-slate-400">
          Switch the active customer to test different verification and KYC states (e.g., test a customer whose KYC is still pending or already active).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {users.map((u) => {
            const isSelected = u.id === activeCustomerId;
            return (
              <div
                key={u.id}
                onClick={() => setActiveCustomerId(u.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-cyan-950/30 border-cyan-500/50 shadow-md shadow-cyan-950'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="text-sm font-bold text-white block">{u.name}</span>
                  <span className="text-xs text-slate-400">{u.id} • {u.kycStatus}</span>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset State */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-white">Reset Demo Environment</h4>
          <p className="text-xs text-slate-400 mt-1">
            Re-initialize all simulated customer, bank, credential, and verification datasets back to original state.
          </p>
        </div>
        <button
          onClick={resetDemoData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:border-rose-500/40 text-slate-200 hover:text-rose-200 text-xs font-semibold border border-slate-700 transition-all shrink-0"
        >
          <RotateCcw className="w-4 h-4 text-rose-400" />
          <span>Reset All Demo Data</span>
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { useKYC } from '../../context/KYCContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Activity, Award, ShieldAlert, CheckCircle2, Building2 } from 'lucide-react';

export const IssuerActivity = () => {
  const { verificationHistory, currentBank } = useKYC();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
          COMPLIANCE LOGS
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
          Issuer Activity & Audit Trail
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Complete regulatory activity register for {currentBank.name}.
        </p>
      </div>

      <div className="space-y-3">
        {verificationHistory.map((item, idx) => {
          const isIssued = item.result === 'ISSUED';
          const isRevoked = item.result === 'REVOKED';

          return (
            <div
              key={item.id || idx}
              className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isIssued
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : isRevoked
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {isIssued ? (
                    <Award className="w-4 h-4" />
                  ) : isRevoked ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{item.subject}</span>
                    <StatusBadge status={item.result} size="sm" />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{item.purpose}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-mono text-slate-400 block">{item.timestamp}</span>
                <span className="text-[10px] text-slate-500 font-mono block">{item.credentialId}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

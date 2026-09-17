import React from 'react';
import { useKYC } from '../../context/KYCContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { History, CheckCircle2, XCircle, Search } from 'lucide-react';

export const VerifierHistory = () => {
  const { verificationHistory } = useKYC();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          COMPLIANCE LOGS
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
          Verification History
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Institutional audit log of all customer credentials verified by Demo Cooperative Bank.
        </p>
      </div>

      <div className="space-y-3">
        {verificationHistory.map((item, idx) => {
          const isPass = item.status === 'PASS';

          return (
            <div
              key={item.id || idx}
              className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isPass
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {isPass ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
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
                <span className="text-xs font-mono text-slate-300 block">{item.timestamp}</span>
                <span className="text-[11px] font-mono text-cyan-400 block">{item.credentialId}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

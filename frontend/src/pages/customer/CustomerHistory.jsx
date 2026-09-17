import React from 'react';
import { useKYC } from '../../context/KYCContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  History,
  CheckCircle2,
  XCircle,
  Award,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const CustomerHistory = () => {
  const { verificationHistory, currentCustomer } = useKYC();

  // Filter history for current customer or generic credentials
  const customerHistory = verificationHistory.filter(
    (h) => h.subject === currentCustomer.name || h.credentialId === currentCustomer.currentCredentialId
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
          ACCESS AUDIT TRAIL
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
          Verification History
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Complete transparent ledger of financial institutions that have verified or interacted with your KYC credential.
        </p>
      </div>

      {customerHistory.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-slate-400">
          <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium">No verification events logged yet.</p>
          <p className="text-xs text-slate-500 mt-1">
            Share your credential with a partner bank to begin populating this log.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {customerHistory.map((item, idx) => {
            const isPass = item.status === 'PASS';
            const isIssued = item.result === 'ISSUED';
            const isRevoked = item.result === 'REVOKED';

            return (
              <div
                key={item.id || idx}
                className="glass-card rounded-2xl p-5 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-700"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isIssued
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : isRevoked
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : isPass
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {isIssued ? (
                      <Award className="w-5 h-5" />
                    ) : isRevoked ? (
                      <XCircle className="w-5 h-5" />
                    ) : isPass ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-white">
                        {item.institution}
                      </span>
                      <StatusBadge
                        status={isIssued ? 'ISSUED' : item.result}
                        size="sm"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{item.purpose}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2 font-mono">
                      <span>ID: {item.credentialId}</span>
                      <span>•</span>
                      <span>DID: {item.verifierDid.slice(0, 18)}...</span>
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <span className="text-xs font-semibold text-slate-300 block">
                    {item.timestamp}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Cryptographic Proof Verified
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { useKYC } from '../../context/KYCContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Building2, Key, ShieldCheck, ExternalLink } from 'lucide-react';

export const TrustedIssuers = () => {
  const { banks } = useKYC();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          FEDERATED REPUTATION REGISTRY
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
          Trusted Institutional Issuers
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Accredited banking authorities whose cryptographic signatures are recognized by the verification network.
        </p>
      </div>

      <div className="space-y-4">
        {banks.map((b) => (
          <div
            key={b.id}
            className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{b.name}</h3>
                  <span className="text-xs text-slate-400">{b.rating}</span>
                </div>
              </div>

              <StatusBadge status="ACTIVE" size="sm" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-slate-400">Institutional DID:</span>
                <span className="font-mono text-cyan-300 font-medium">{b.did}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-slate-400">Public Verification Key:</span>
                <span className="font-mono text-slate-300 text-[11px] break-all">{b.publicKey}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Accredited since: {b.accreditedDate}</span>
                <span>Active Credentials Issued: {b.activeCredentialsCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { useKYC } from '../../context/KYCContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ShieldAlert, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const RevocationsList = () => {
  const { credentials, currentBank } = useKYC();
  const navigate = useNavigate();

  const revokedCredentials = credentials.filter((c) => c.status === 'REVOKED');

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold">
          ON-CHAIN REVOCATION LEDGER
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
          Revocation Registry
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Cryptographic revocation registry maintained by {currentBank.name}. All participating verifiers query this list during authentication.
        </p>
      </div>

      {revokedCredentials.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-400 max-w-md mx-auto space-y-3">
          <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="text-base font-bold text-white">No Active Revocations</h4>
          <p className="text-xs text-slate-500">
            All issued credentials are currently in good standing. You can test revocation from the Issued Credentials page.
          </p>
          <div className="pt-2">
            <Link
              to="/bank/issuer/credentials"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-block"
            >
              Go to Issued Credentials
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {revokedCredentials.map((cred) => (
            <div
              key={cred.id}
              className="glass-card rounded-2xl p-5 border border-rose-500/30 bg-rose-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{cred.subject}</span>
                    <StatusBadge status="REVOKED" size="sm" />
                  </div>
                  <p className="text-xs font-mono text-cyan-400 mt-0.5">ID: {cred.id}</p>
                  <p className="text-xs text-rose-300/90 mt-1">
                    <strong>Reason:</strong> {cred.revocationReason || 'Customer requested / policy compliance'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Revoked at: {cred.revokedAt || 'Recent'} • Tx: {cred.blockchainTxHash.slice(0, 20)}...
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => navigate(`/bank/verifier/verify?credId=${cred.id}`)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Test Failure in Verifier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

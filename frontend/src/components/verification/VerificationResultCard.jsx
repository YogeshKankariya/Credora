import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { CheckCircle2, XCircle, ShieldCheck, ShieldAlert, ArrowRight, RefreshCw, Key, Hash, Database, Clock, User, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const VerificationResultCard = ({ result, credential, onReset, onViewDetails }) => {
  const isSuccess = result?.overall === 'PASS' || result?.success === true;
  const isRevoked = credential?.status === 'REVOKED';
  const isTampered = result?.failedStep === 'signature' || result?.failedStep === 'hashIntegrity';

  return (
    <div
      className={`rounded-2xl border p-6 md:p-8 backdrop-blur-md shadow-2xl transition-all animate-in fade-in duration-300 ${
        isSuccess
          ? 'bg-emerald-950/20 border-emerald-500/40 shadow-emerald-950/30'
          : 'bg-rose-950/20 border-rose-500/40 shadow-rose-950/30'
      }`}
    >
      {/* Banner / Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              isSuccess
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-emerald-500/10'
                : 'bg-rose-500/20 border border-rose-500/30 text-rose-400 shadow-rose-500/10'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-8 h-8" />
            ) : (
              <XCircle className="w-8 h-8" />
            )}
          </div>
          <div>
            <h2
              className={`text-2xl md:text-3xl font-extrabold tracking-tight ${
                isSuccess ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isSuccess ? '✓ KYC VERIFIED' : '✕ KYC VERIFICATION FAILED'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>Verified just now</span>
              <span>•</span>
              <span>Decentralized Proof Protocol</span>
            </p>
          </div>
        </div>

        <div>
          <StatusBadge
            status={isSuccess ? 'ACTIVE' : isRevoked ? 'REVOKED' : 'TAMPERED / INVALID'}
            size="lg"
          />
        </div>
      </div>

      {/* Explanatory Alert (especially for failure) */}
      {!isSuccess && (
        <div className="mt-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-rose-300">
                {isRevoked
                  ? 'This credential cannot be accepted because it has been revoked by the issuing institution.'
                  : isTampered
                  ? 'Cryptographic integrity failure: Credential payload content was modified after signing.'
                  : 'Credential verification checks did not satisfy required criteria.'}
              </p>
              <p className="text-xs text-rose-200/80 mt-1">
                Notice: Even if a credential contains a historically valid digital signature, the live network status takes precedence. Revoked or modified credentials are instantly rejected.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Structured Credential Metadata Grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Credential
          </span>
          <span className="text-sm font-mono font-bold text-white mt-1 block">
            {credential?.id || 'N/A'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Subject
          </span>
          <span className="text-sm font-bold text-white mt-1 block">
            {credential?.subject || 'N/A'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Issued By
          </span>
          <span className="text-sm font-bold text-white mt-1 block">
            {credential?.issuer || 'Demo National Bank'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Credential Status
          </span>
          <span className="mt-1 block">
            <StatusBadge status={credential?.status || 'UNKNOWN'} />
          </span>
        </div>
      </div>

      {/* Cryptographic Breakdown Table */}
      <div className="mt-6 rounded-xl border border-slate-800/80 overflow-hidden bg-slate-900/40">
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
          Cryptographic Verification Audit Summary
        </div>
        <div className="divide-y divide-slate-800/60 text-xs">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>Digital Signature</span>
            </div>
            <span
              className={`font-mono font-bold ${
                isTampered ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {isTampered ? '✕ INVALID' : '✓ VALID (secp256k1)'}
            </span>
          </div>

          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <Hash className="w-4 h-4 text-cyan-400" />
              <span>Payload Integrity</span>
            </div>
            <span
              className={`font-mono font-bold ${
                isTampered ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {isTampered ? '✕ HASH MISMATCH' : '✓ VERIFIED (SHA-256)'}
            </span>
          </div>

          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Blockchain Registration</span>
            </div>
            <span className="font-mono font-bold text-emerald-400">
              ✓ CONFIRMED (Block #{credential?.blockNumber || '4829104'})
            </span>
          </div>

          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Live Status Check</span>
            </div>
            <span
              className={`font-mono font-bold ${
                isRevoked ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {isRevoked ? '✕ REVOKED' : '✓ ACTIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Verify Another Credential</span>
        </button>

        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-all"
          >
            <span>View Credential Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useKYC } from '../../context/KYCContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Fingerprint,
  Key,
  Shield,
  Lock,
  Smartphone,
  Copy,
  Check,
  Cpu,
  Info,
  ShieldCheck,
  HardDrive
} from 'lucide-react';

export const DigitalIdentity = () => {
  const { currentCustomer } = useKYC();
  const [copiedDid, setCopiedDid] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopyDid = () => {
    navigator.clipboard.writeText(currentCustomer.did);
    setCopiedDid(true);
    setTimeout(() => setCopiedDid(false), 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(currentCustomer.publicKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page Header */}
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
          SELF-SOVEREIGN IDENTITY (SSI)
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">My Digital Identity</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Your decentralized identifier (DID) and cryptographic keys anchor your banking credentials without relying on any centralized identity provider.
        </p>
      </div>

      {/* Main DID Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Decentralized Identifier
              </span>
              <h3 className="text-lg font-bold text-white">Your DID</h3>
            </div>
          </div>
          <StatusBadge status={currentCustomer.identityStatus} size="lg" />
        </div>

        {/* DID Display & Copy */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="overflow-hidden">
            <span className="text-[10px] font-semibold uppercase text-slate-500 block">W3C DID URI</span>
            <span className="text-sm font-mono text-cyan-300 font-semibold break-all">
              {currentCustomer.did}
            </span>
          </div>
          <button
            onClick={handleCopyDid}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shrink-0"
          >
            {copiedDid ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy DID</span>
              </>
            )}
          </button>
        </div>

        {/* Identity Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <span className="text-xs text-slate-400 block">Identity Created</span>
            <span className="text-sm font-bold text-white mt-1 block">
              {currentCustomer.identityCreated}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <span className="text-xs text-slate-400 block">Key Status</span>
            <span className="text-sm font-bold text-cyan-400 mt-1 block">
              {currentCustomer.keyStatus}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <span className="text-xs text-slate-400 block">Identity Status</span>
            <span className="text-sm font-bold text-emerald-400 mt-1 block">
              {currentCustomer.identityStatus}
            </span>
          </div>
        </div>

        {/* Public Identity & Key */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white">Public Identity Key</h4>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="overflow-hidden">
              <span className="text-[10px] font-semibold uppercase text-slate-500 block">
                secp256k1 Public Key (Hex)
              </span>
              <span className="text-xs font-mono text-slate-300 break-all">
                {currentCustomer.publicKey}
              </span>
            </div>
            <button
              onClick={handleCopyKey}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shrink-0"
            >
              {copiedKey ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Key</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

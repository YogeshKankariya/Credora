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

      {/* Security Info Card & Visual Device Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security Notice */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Cryptographic Isolation</h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your private key never needs to be displayed in the interface.
            </p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              All signature computations and zero-knowledge proofs happen directly inside your secure hardware enclave. The platform only ever exposes your public DID and signed assertions.
            </p>
          </div>

          <div className="mt-6 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Hardware Enclave / Secure Element Active</span>
          </div>
        </div>

        {/* Visual Device Architecture */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">Device Key Hierarchy</h4>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
              LOCAL ISOLATION
            </span>
          </div>

          {/* Device Visual Diagram */}
          <div className="my-4 p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <Smartphone className="w-4 h-4" />
              <span>Your Device (Secure Wallet)</span>
            </div>
            <div className="pl-4 border-l-2 border-slate-800 space-y-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-slate-600">├──</span>
                <span className="text-slate-400 font-sans">DID:</span>
                <span className="text-cyan-400 truncate">{currentCustomer.did.slice(0, 16)}...</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">├──</span>
                <span className="text-slate-400 font-sans">Public Key:</span>
                <span className="text-emerald-400 truncate">{currentCustomer.publicKey.slice(0, 14)}...</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">└──</span>
                <span className="text-slate-400 font-sans">Private Key:</span>
                <span className="text-rose-400 flex items-center gap-1 font-bold">
                  <Lock className="w-3 h-3 text-amber-400 inline" />
                  <span>[ISOLATED ENCLAVE]</span>
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center">
            Zero-leakage identity design: Only public assertions leave your device.
          </p>
        </div>
      </div>
    </div>
  );
};

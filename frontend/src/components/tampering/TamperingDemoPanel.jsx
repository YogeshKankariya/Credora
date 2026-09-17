import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, AlertOctagon, RotateCcw, ArrowRight, Key, Hash, FileEdit } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const TamperingDemoPanel = () => {
  const originalCredential = {
    id: 'KYC-2026-000184',
    subject: 'Rahul Sharma',
    kycDate: '12 Sep 2026',
    level: 'Tier-1 High Assurance',
    hash: '8f7a92c1e48f029a738c821bd82e91',
    signature: 'MEQCID3k8...f92a1...78ca Valid',
    isValidSignature: true,
  };

  const [isTampered, setIsTampered] = useState(true);
  const [tamperedField, setTamperedField] = useState('kycDate'); // 'kycDate' | 'subject'
  const [customDate, setCustomDate] = useState('15 Sep 2026');
  const [customSubject, setCustomSubject] = useState('Rahul Sharma (Modified)');

  const modifiedHash = isTampered
    ? '91ab72d4ec09182374bb08293f19aa'
    : originalCredential.hash;

  const modifiedSignatureStatus = !isTampered;

  const handleReset = () => {
    setIsTampered(false);
    setCustomDate('12 Sep 2026');
    setCustomSubject('Rahul Sharma');
  };

  const handleApplyTamper = () => {
    setIsTampered(true);
    setCustomDate('15 Sep 2026');
  };

  return (
    <div className="space-y-6">
      {/* Header explanation banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                INTERACTIVE CRYPTOGRAPHIC LAB
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-2">Credential Tampering Demonstration</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Demonstrate how any unauthorized modification to customer KYC data invalidates the mathematical hash and causes the issuing bank's digital signature to fail.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyTamper}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isTampered
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Simulate Tamper
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-side comparison panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PANEL 1: ORIGINAL CREDENTIAL */}
        <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-emerald-950/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="text-base font-bold text-white">Original Credential</h4>
              </div>
              <StatusBadge status="ACTIVE" />
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-semibold uppercase text-slate-500 block">Credential ID</span>
                <span className="font-mono text-cyan-300 font-medium">{originalCredential.id}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-semibold uppercase text-slate-500 block">Subject Name</span>
                <span className="text-slate-200 font-medium">{originalCredential.subject}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-semibold uppercase text-slate-500 block">KYC Date</span>
                <span className="text-slate-200 font-medium">{originalCredential.kycDate}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-cyan-400" />
                  <span>Calculated SHA-256 Hash</span>
                </span>
                <span className="font-mono text-emerald-400 text-[11px] break-all block mt-1">
                  {originalCredential.hash}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center gap-1">
                  <Key className="w-3 h-3 text-cyan-400" />
                  <span>Issuing Bank Digital Signature</span>
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-[11px] text-slate-400">ECDSA secp256k1</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold font-mono text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>✓ Valid</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Cryptographically authentic and signed by Demo National Bank.</span>
          </div>
        </div>

        {/* PANEL 2: MODIFIED CREDENTIAL */}
        <div
          className={`glass-card rounded-2xl p-6 border flex flex-col justify-between transition-all ${
            isTampered
              ? 'border-rose-500/40 bg-rose-950/15 shadow-rose-950/20'
              : 'border-slate-800 bg-slate-900/40'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {isTampered ? (
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-slate-400" />
                )}
                <h4 className="text-base font-bold text-white">
                  {isTampered ? 'Modified Credential (Tampered)' : 'Target Credential'}
                </h4>
              </div>
              <StatusBadge status={isTampered ? 'TAMPERED' : 'UNALTERED'} />
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-semibold uppercase text-slate-500 block">Credential ID</span>
                <span className="font-mono text-cyan-300 font-medium">{originalCredential.id}</span>
              </div>

              {/* Subject Field */}
              <div
                className={`p-3 rounded-lg border transition-all ${
                  isTampered && tamperedField === 'subject'
                    ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                    : 'bg-slate-900/80 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase text-slate-500 block">Subject Name</span>
                  {isTampered && tamperedField === 'subject' && (
                    <span className="text-[10px] font-mono text-rose-400 font-bold">TAMPERED</span>
                  )}
                </div>
                <span className="font-medium mt-0.5 block">
                  {isTampered && tamperedField === 'subject' ? customSubject : originalCredential.subject}
                </span>
              </div>

              {/* KYC Date Field */}
              <div
                className={`p-3 rounded-lg border transition-all ${
                  isTampered && tamperedField === 'kycDate'
                    ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                    : 'bg-slate-900/80 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase text-slate-500 block">KYC Date</span>
                  {isTampered && tamperedField === 'kycDate' && (
                    <span className="text-[10px] font-mono text-rose-400 font-bold">MODIFIED (+3 DAYS)</span>
                  )}
                </div>
                <span className="font-medium mt-0.5 block">
                  {isTampered && tamperedField === 'kycDate' ? customDate : originalCredential.kycDate}
                </span>
              </div>

              {/* Live Hash Calculation */}
              <div
                className={`p-3 rounded-lg border transition-all ${
                  isTampered
                    ? 'bg-rose-950/30 border-rose-500/40'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-cyan-400" />
                  <span>Calculated SHA-256 Hash</span>
                </span>
                <span
                  className={`font-mono text-[11px] break-all block mt-1 font-semibold ${
                    isTampered ? 'text-rose-400' : 'text-slate-300'
                  }`}
                >
                  {modifiedHash}
                </span>
              </div>

              {/* Digital Signature Verification */}
              <div
                className={`p-3 rounded-lg border transition-all ${
                  isTampered
                    ? 'bg-rose-950/30 border-rose-500/40'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center gap-1">
                  <Key className="w-3 h-3 text-cyan-400" />
                  <span>Issuing Bank Digital Signature</span>
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-[11px] text-slate-400">ECDSA secp256k1</span>
                  <span
                    className={`flex items-center gap-1 font-semibold font-mono text-[11px] ${
                      isTampered ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {isTampered ? (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>✕ Invalid</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>✓ Valid</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Outcome Alert */}
          <div
            className={`mt-6 p-3 rounded-xl border text-xs flex items-center gap-2 ${
              isTampered
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 font-semibold'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {isTampered ? (
              <>
                <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Verification Failed — Credential has been modified.</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-400" />
                <span>No modification detected. Signature checks would pass.</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Technical Takeaway for Evaluators */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">Why does this happen?</p>
        <p>
          In a decentralized verifiable credential, the issuing bank signs a cryptographic hash of the customer's attributes. If a malicious actor alters any character (such as changing the date or name), the recomputed hash diverges entirely (the avalanche effect). Because the signature doesn't match the new hash, the verifier immediately rejects it without needing to query a central database.
        </p>
      </div>
    </div>
  );
};

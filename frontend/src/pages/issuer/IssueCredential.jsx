import React, { useState } from 'react';
import { useKYC } from '../../context/KYCContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Key,
  Database,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  Check
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

const ISSUANCE_STEPS = [
  { id: 'kyc', label: 'KYC Verified' },
  { id: 'create', label: 'Create Credential Payload' },
  { id: 'sign', label: 'Digital Signature (ECDSA secp256k1)' },
  { id: 'anchor', label: 'Blockchain Registration & Anchor' },
  { id: 'issued', label: 'Credential Issued' },
];

export const IssueCredential = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { users, issueCredential, currentBank } = useKYC();

  // Find customer or fallback
  const targetId = customerId || 'CUST-003';
  const customer = users.find((u) => u.id === targetId) || users[0];

  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [issuedCred, setIssuedCred] = useState(null);

  const handleStartIssuance = () => {
    setIsProcessing(true);
    setActiveStepIndex(0);

    // Sequence through steps
    setTimeout(() => setActiveStepIndex(1), 700);
    setTimeout(() => setActiveStepIndex(2), 1400);
    setTimeout(() => setActiveStepIndex(3), 2100);
    setTimeout(() => {
      setActiveStepIndex(4);
      const newCred = issueCredential(customer.id, currentBank.name);
      setIssuedCred(newCred);
      setIsProcessing(false);
    }, 2800);
  };

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
          CRYPTOGRAPHIC MINTING ENGINE
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
          Issue KYC Credential
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Generate an immutable, digitally signed credential anchored onto the decentralized trust registry.
        </p>
      </div>

      {/* Main Issuance Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
        {/* Credential Spec Overview */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">
                Candidate Profile
              </span>
              <h3 className="text-lg font-bold text-white">{customer.name}</h3>
            </div>
          </div>

          <StatusBadge status={customer.kycStatus} size="sm" />
        </div>

        {/* Form Fields Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 font-medium block">Subject</span>
            <span className="text-sm font-bold text-white mt-1 block">{customer.name}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 font-medium block">Issuer</span>
            <span className="text-sm font-bold text-white mt-1 block">{currentBank.name}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 font-medium block">Credential Type</span>
            <span className="text-sm font-bold text-white mt-1 block">KYC Verification</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 font-medium block">Issue Date</span>
            <span className="text-sm font-bold text-white mt-1 block">{currentDate}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 sm:col-span-2">
            <span className="text-slate-500 font-medium block">Validity Period</span>
            <span className="text-sm font-bold text-cyan-400 mt-1 block">1 Year (365 Days)</span>
          </div>
        </div>

        {/* Process Indicator Flow */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Cryptographic Issuance Pipeline
          </span>

          <div className="space-y-2">
            {ISSUANCE_STEPS.map((step, idx) => {
              const isDone = activeStepIndex > idx || (!isProcessing && issuedCred);
              const isCurrent = activeStepIndex === idx && isProcessing;

              let icon = <span className="w-5 h-5 rounded-full border border-slate-700 bg-slate-800 text-slate-500 flex items-center justify-center text-xs">{idx + 1}</span>;
              let barBg = 'bg-slate-900/40 border-slate-800 text-slate-500';

              if (isDone) {
                icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
                barBg = 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 font-semibold';
              } else if (isCurrent) {
                icon = <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />;
                barBg = 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200 shadow-md shadow-cyan-950 font-semibold';
              }

              return (
                <div
                  key={step.id}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${barBg}`}
                >
                  <div className="flex items-center gap-3">
                    {icon}
                    <span>{step.label}</span>
                  </div>

                  <span className="font-mono text-[11px]">
                    {isDone ? '✓ Completed' : isCurrent ? 'Processing...' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Success Output After Completion */}
        {issuedCred && (
          <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
              <CheckCircle2 className="w-5 h-5" />
              <span>Verifiable Credential Successfully Minted</span>
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <p className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Credential Created</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Digitally Signed with Bank Private Key</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Blockchain Reference Registered (Tx Hash: {issuedCred.blockchainTxHash.slice(0, 18)}...)</span>
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Credential ID</span>
                <span className="text-sm font-mono text-cyan-300 font-bold">{issuedCred.id}</span>
              </div>
              <StatusBadge status="ACTIVE" />
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                to="/bank/issuer/credentials"
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold text-center shadow-lg shadow-cyan-900/30 transition-all"
              >
                View Credential in Registry
              </Link>
              <button
                onClick={() => navigate('/bank/verifier/verify?credId=' + issuedCred.id)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Verify Now
              </button>
            </div>
          </div>
        )}

        {/* Action Button */}
        {!issuedCred && (
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleStartIssuance}
              disabled={isProcessing}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white text-xs font-semibold transition-all ${
                isProcessing
                  ? 'bg-slate-800 cursor-not-allowed text-slate-500'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-xl shadow-cyan-900/30'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing Cryptographic Pipeline...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Issue Credential</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

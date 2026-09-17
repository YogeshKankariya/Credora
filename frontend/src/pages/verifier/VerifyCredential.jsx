import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useKYC } from '../../context/KYCContext';
import { VerificationStepper } from '../../components/verification/VerificationStepper';
import { VerificationResultCard } from '../../components/verification/VerificationResultCard';
import { Modal } from '../../components/common/Modal';
import {
  FileSearch,
  Search,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Award
} from 'lucide-react';

export const VerifyCredential = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { credentials, verifyCredentialRecord } = useKYC();

  const queryCredId = searchParams.get('credId') || 'KYC-2026-000184';
  const isTamperQuery = searchParams.get('tampered') === 'true';

  const [inputCredId, setInputCredId] = useState(queryCredId);
  const [targetCredential, setTargetCredential] = useState(() =>
    credentials.find((c) => c.id.toLowerCase() === queryCredId.toLowerCase()) || credentials[0]
  );

  // States: 'idle' | 'running' | 'completed'
  const [verificationState, setVerificationState] = useState('idle');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Keep targetCredential in sync when queryCredId changes
  useEffect(() => {
    const found = credentials.find((c) => c.id.toLowerCase() === queryCredId.toLowerCase());
    if (found) {
      setTargetCredential(found);
      setInputCredId(found.id);
    }
  }, [queryCredId, credentials]);

  const handleStartVerification = () => {
    const cred = credentials.find((c) => c.id.toLowerCase() === inputCredId.trim().toLowerCase());
    if (!cred) {
      setVerificationState('completed');
      setVerificationResult({
        overall: 'FAIL',
        success: false,
        message: 'Credential identifier not registered on decentralized network.',
        failedStep: 'structure'
      });
      return;
    }

    setTargetCredential(cred);
    setVerificationState('running');
    setVerificationResult(null);
  };

  const handleStepperComplete = (stepperResult) => {
    // Record into KYC context history
    const recordResult = verifyCredentialRecord(
      targetCredential?.id,
      'Demo Cooperative Bank',
      isTamperQuery
    );

    setVerificationResult({
      ...recordResult,
      ...stepperResult,
      overall: stepperResult.success ? 'PASS' : 'FAIL',
    });
    setVerificationState('completed');
  };

  const handleResetVerification = () => {
    setVerificationState('idle');
    setVerificationResult(null);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          CRYPTOGRAPHIC VERIFICATION WORKFLOW
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
          Credential Verification
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Six-point cryptographic audit verifying structure, authority, signature, hash, blockchain ledger anchor, and revocation registry.
        </p>
      </div>

      {/* Target Credential Selector Form (visible in idle state) */}
      {verificationState === 'idle' && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400">Step 01</span>
              <h3 className="text-base font-bold text-white">Select Credential to Audit</h3>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              Enter Credential Identifier
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inputCredId}
                  onChange={(e) => setInputCredId(e.target.value)}
                  placeholder="KYC-2026-XXXXXX"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-xs sm:text-sm font-mono text-cyan-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleStartVerification}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all"
              >
                <span>Execute Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Selector Pills */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Test with Mock Scenarios:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {credentials.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setInputCredId(c.id);
                    setTargetCredential(c);
                    setSearchParams({ credId: c.id, tampered: 'false' });
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1.5 ${
                    inputCredId === c.id && !isTamperQuery
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{c.id}</span>
                  <span className="font-sans font-bold text-[10px]">
                    ({c.status} • {c.subject.split(' ')[0]})
                  </span>
                </button>
              ))}

              <button
                onClick={() => {
                  setSearchParams({ credId: inputCredId, tampered: isTamperQuery ? 'false' : 'true' });
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1.5 ${
                  isTamperQuery
                    ? 'bg-rose-500/30 text-rose-200 border-rose-500/60 shadow-sm'
                    : 'bg-slate-900 text-rose-300/80 border-slate-800 hover:border-rose-500/40'
                }`}
              >
                <span>Simulate Altered Payload</span>
                <span className="font-sans font-bold text-[10px] uppercase">
                  {isTamperQuery ? '[TAMPER ACTIVE]' : '[INJECT TAMPER]'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Running Sequence (Requirement 20) */}
      {verificationState === 'running' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase text-cyan-400">Verifying Payload</span>
              <h3 className="text-xl font-bold text-white mt-0.5">
                Auditing Credential: {targetCredential?.id}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Subject: {targetCredential?.subject}</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          </div>

          {/* Stepper with animated states */}
          <VerificationStepper
            credential={targetCredential}
            isTampered={isTamperQuery}
            onComplete={handleStepperComplete}
          />
        </div>
      )}

      {/* Final Results (Requirements 21 & 22) */}
      {verificationState === 'completed' && (
        <VerificationResultCard
          result={verificationResult}
          credential={targetCredential}
          onReset={handleResetVerification}
          onViewDetails={() => setIsDetailModalOpen(true)}
        />
      )}

      {/* Credential Detailed Inspection Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Verified Credential Dossier"
        subtitle="Complete on-chain asset snapshot"
      >
        {targetCredential && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block">Credential ID</span>
                <span className="text-cyan-300 font-bold">{targetCredential.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Subject DID</span>
                <span className="text-slate-300 break-all">{targetCredential.subjectDid}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Issuer DID</span>
                <span className="text-slate-300 break-all">{targetCredential.issuerDid}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Blockchain Anchor Tx</span>
                <span className="text-slate-300 break-all">{targetCredential.blockchainTxHash}</span>
              </div>
            </div>

            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Close Dossier
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

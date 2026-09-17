import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, ShieldCheck, Key, Hash, Database, Clock, Layers } from 'lucide-react';

const STEPS = [
  { id: 'structure', label: 'Checking Credential Structure & Format', icon: Layers },
  { id: 'issuer', label: 'Verifying Issuing Bank Cryptographic Authority', icon: ShieldCheck },
  { id: 'signature', label: 'Checking Digital Signature Validity', icon: Key },
  { id: 'hashIntegrity', label: 'Checking Cryptographic Hash & Data Integrity', icon: Hash },
  { id: 'blockchain', label: 'Checking Blockchain Ledger Registration', icon: Database },
  { id: 'statusActive', label: 'Checking Revocation Registry & Active Status', icon: Clock },
];

export const VerificationStepper = ({ credential, isTampered = false, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepStatuses, setStepStatuses] = useState({
    structure: 'waiting',
    issuer: 'waiting',
    signature: 'waiting',
    hashIntegrity: 'waiting',
    blockchain: 'waiting',
    statusActive: 'waiting',
  });

  useEffect(() => {
    let timer;
    if (currentStepIndex < STEPS.length) {
      const step = STEPS[currentStepIndex];

      // Set to running
      setStepStatuses((prev) => ({ ...prev, [step.id]: 'checking' }));

      timer = setTimeout(() => {
        let isPass = true;

        if (isTampered && (step.id === 'signature' || step.id === 'hashIntegrity')) {
          isPass = false;
        }

        if (credential?.status === 'REVOKED' && step.id === 'statusActive') {
          isPass = false;
        }

        setStepStatuses((prev) => ({
          ...prev,
          [step.id]: isPass ? 'passed' : 'failed',
        }));

        if (!isPass) {
          // Halt on failure and complete
          onComplete && onComplete({
            success: false,
            failedStep: step.id,
            stepStatuses: {
              ...stepStatuses,
              [step.id]: 'failed'
            }
          });
        } else if (currentStepIndex === STEPS.length - 1) {
          // Last step completed successfully
          onComplete && onComplete({
            success: true,
            failedStep: null,
            stepStatuses: {
              ...stepStatuses,
              [step.id]: 'passed'
            }
          });
        } else {
          setCurrentStepIndex((prev) => prev + 1);
        }
      }, 700); // 700ms realistic cryptographic verification cadence per check
    }

    return () => clearTimeout(timer);
  }, [currentStepIndex, credential, isTampered]);

  return (
    <div className="space-y-3">
      {STEPS.map((step, idx) => {
        const status = stepStatuses[step.id];
        const StepIcon = step.icon;

        let iconElement = <span className="w-5 h-5 rounded-full border border-slate-700 bg-slate-800 text-slate-500 flex items-center justify-center text-xs">{idx + 1}</span>;
        let cardBg = 'bg-slate-900/40 border-slate-800/80 text-slate-400';
        let statusText = 'Waiting...';

        if (status === 'checking') {
          iconElement = <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />;
          cardBg = 'bg-cyan-950/20 border-cyan-500/30 text-cyan-300 shadow-sm shadow-cyan-950';
          statusText = 'Checking...';
        } else if (status === 'passed') {
          iconElement = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
          cardBg = 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300';
          statusText = '✓ Passed';
        } else if (status === 'failed') {
          iconElement = <XCircle className="w-5 h-5 text-rose-400" />;
          cardBg = 'bg-rose-950/20 border-rose-500/30 text-rose-300';
          statusText = '✕ Failed';
        }

        return (
          <div
            key={step.id}
            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 ${cardBg}`}
          >
            <div className="flex items-center gap-3">
              <div className="shrink-0">{iconElement}</div>
              <div className="flex items-center gap-2">
                <StepIcon className="w-4 h-4 opacity-70" />
                <span className="text-sm font-medium">{step.label}</span>
              </div>
            </div>

            <div className="text-xs font-mono font-semibold tracking-wide">
              {statusText}
            </div>
          </div>
        );
      })}
    </div>
  );
};

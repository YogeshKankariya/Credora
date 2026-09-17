import React, { useState } from 'react';
import { Modal } from './Modal';
import { Copy, Check, QrCode, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKYC } from '../../context/KYCContext';

export const QRCodeModal = ({ isOpen, onClose, credential }) => {
  const [copied, setCopied] = useState(false);
  const { setCurrentRole } = useKYC();
  const navigate = useNavigate();

  if (!credential) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(credential.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScan = () => {
    setCurrentRole('verifier');
    onClose();
    navigate(`/bank/verifier/verify?credId=${encodeURIComponent(credential.id)}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Verifiable Credential"
      subtitle="Encrypted peer-to-peer sharing token"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* QR Code Graphic */}
        <div className="relative p-5 bg-white rounded-2xl shadow-xl border-4 border-cyan-500/30">
          {/* Simulated Authentic SVG QR */}
          <svg
            className="w-52 h-52 text-slate-900"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            {/* Corner Squares */}
            <rect x="5" y="5" width="26" height="26" rx="4" />
            <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
            <rect x="13" y="13" width="10" height="10" rx="1" />

            <rect x="69" y="5" width="26" height="26" rx="4" />
            <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
            <rect x="77" y="13" width="10" height="10" rx="1" />

            <rect x="5" y="69" width="26" height="26" rx="4" />
            <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
            <rect x="13" y="77" width="10" height="10" rx="1" />

            {/* Pattern Dots */}
            <rect x="36" y="8" width="5" height="5" />
            <rect x="46" y="8" width="5" height="5" />
            <rect x="56" y="8" width="5" height="5" />
            <rect x="36" y="18" width="5" height="5" />
            <rect x="48" y="18" width="5" height="5" />
            <rect x="58" y="18" width="5" height="5" />

            <rect x="8" y="36" width="5" height="5" />
            <rect x="18" y="36" width="5" height="5" />
            <rect x="28" y="36" width="5" height="5" />
            <rect x="38" y="36" width="5" height="5" />
            <rect x="48" y="36" width="5" height="5" />
            <rect x="58" y="36" width="5" height="5" />
            <rect x="68" y="36" width="5" height="5" />
            <rect x="78" y="36" width="5" height="5" />
            <rect x="88" y="36" width="5" height="5" />

            <rect x="8" y="46" width="5" height="5" />
            <rect x="22" y="46" width="5" height="5" />
            <rect x="34" y="46" width="5" height="5" />
            <rect x="46" y="46" width="8" height="8" />
            <rect x="62" y="46" width="5" height="5" />
            <rect x="76" y="46" width="5" height="5" />
            <rect x="86" y="46" width="5" height="5" />

            <rect x="8" y="58" width="5" height="5" />
            <rect x="18" y="58" width="5" height="5" />
            <rect x="38" y="58" width="5" height="5" />
            <rect x="50" y="58" width="5" height="5" />
            <rect x="66" y="58" width="5" height="5" />
            <rect x="82" y="58" width="5" height="5" />

            <rect x="36" y="70" width="5" height="5" />
            <rect x="48" y="70" width="5" height="5" />
            <rect x="58" y="70" width="5" height="5" />
            <rect x="70" y="70" width="5" height="5" />
            <rect x="84" y="70" width="5" height="5" />

            <rect x="36" y="82" width="5" height="5" />
            <rect x="46" y="82" width="5" height="5" />
            <rect x="60" y="82" width="5" height="5" />
            <rect x="76" y="82" width="5" height="5" />
            <rect x="88" y="82" width="5" height="5" />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-11 h-11 bg-slate-950 border-2 border-cyan-400 rounded-lg flex items-center justify-center shadow-lg">
              <QrCode className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-base font-semibold text-white">Credential Ready to Share</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Bank Verifier can scan this code to retrieve your credential.
          </p>
        </div>

        {/* Credential ID copy bar */}
        <div className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-left">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
              Credential ID
            </span>
            <span className="text-xs font-mono text-cyan-300 font-semibold">{credential.id}</span>
          </div>
          <button
            onClick={handleCopyId}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy ID</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Simulator Link for judges/demo */}
        <button
          onClick={handleSimulateScan}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-all"
        >
          <span>Simulate Scan in Bank Verifier</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Privacy Warning */}
        <div className="w-full flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-left">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200/90 leading-relaxed">
            <strong className="font-semibold text-amber-300">Privacy Notice:</strong> Only share your credential with institutions you trust. Raw biometric and identity documents remain securely on your device.
          </p>
        </div>
      </div>
    </Modal>
  );
};

import React, { useState } from 'react';
import { useKYC } from '../../context/KYCContext';
import { QRCodeModal } from '../../components/common/QRCodeModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Share2,
  QrCode,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Send,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ShareCredential = () => {
  const { currentCustomer, customerCredential, addToast, setCurrentRole } = useKYC();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [credentialIdInput, setCredentialIdInput] = useState(
    customerCredential ? customerCredential.id : ''
  );
  const [copied, setCopied] = useState(false);
  const [selectedTargetBank, setSelectedTargetBank] = useState('BANK-002'); // Demo Cooperative Bank
  const navigate = useNavigate();

  const handleCopy = () => {
    if (!customerCredential) return;
    navigator.clipboard.writeText(customerCredential.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWithBank = (e) => {
    e.preventDefault();
    if (!customerCredential) {
      addToast('No active credential found to share.', 'error');
      return;
    }
    addToast(`Credential ${customerCredential.id} token shared with target bank!`, 'success');
  };

  const handleSimulateInVerifier = () => {
    if (!customerCredential) return;
    setCurrentRole('verifier');
    navigate(`/bank/verifier/verify?credId=${encodeURIComponent(customerCredential.id)}`);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="text-center sm:text-left">
        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
          PEER-TO-PEER IDENTITY PRESENTATION
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
          Share Your Verified KYC
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
          Present your verified credential to a participating bank without resubmitting your original KYC documents.
        </p>
      </div>

      {/* Two Sharing Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option 1: Share with Credential ID */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Method A</span>
                <h3 className="text-base font-bold text-white">Share with Credential ID</h3>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              Provide your unique credential token to a bank officer or paste it into a partner financial application.
            </p>

            <form onSubmit={handleShareWithBank} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Your Credential ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={credentialIdInput}
                    onChange={(e) => setCredentialIdInput(e.target.value)}
                    placeholder="KYC-2026-XXXXXX"
                    readOnly
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 pr-20"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Select Recipient Bank
                </label>
                <select
                  value={selectedTargetBank}
                  onChange={(e) => setSelectedTargetBank(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="BANK-002">Demo Cooperative Bank (Verifier)</option>
                  <option value="BANK-003">Demo Finance Bank (Verifier & Issuer)</option>
                  <option value="BANK-001">Demo National Bank (Issuer)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Share Credential</span>
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <button
              onClick={handleSimulateInVerifier}
              className="w-full text-center text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Test Verify as Demo Cooperative Bank</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Option 2: Share via QR */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Method B</span>
                <h3 className="text-base font-bold text-white">Share via QR Code</h3>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              Generate an on-demand encrypted QR code for instant camera or terminal scanning by participating branch officers.
            </p>

            {/* QR Placeholder Card */}
            <div
              onClick={() => setIsQRModalOpen(true)}
              className="mt-5 p-6 rounded-2xl bg-slate-950 border border-dashed border-slate-800 hover:border-cyan-500/50 cursor-pointer flex flex-col items-center justify-center text-center transition-all group"
            >
              <div className="w-24 h-24 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-all">
                <QrCode className="w-14 h-14" />
              </div>
              <span className="text-xs font-semibold text-slate-300 mt-3 group-hover:text-white">
                Click to Open Fullscreen QR
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                Encrypted payload ready for scanning
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>Generate QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Warning */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <strong className="font-semibold text-amber-300">Privacy Notice:</strong> Only share your credential with institutions you trust.
          The recipient bank will only verify cryptographic proofs and hash assertions. Your private key and biometric data remain strictly stored inside your personal device.
        </div>
      </div>

      {/* QR Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        credential={customerCredential}
      />
    </div>
  );
};

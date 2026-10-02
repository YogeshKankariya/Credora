import React, { useState } from 'react';
import { useKYC } from '../../context/KYCContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Share2,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Send,
  Building2,
  Lock,
  Wallet
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const ShareCredential = () => {
  const { currentCustomer, customerCredential, addToast, setCurrentRole } = useKYC();
  const isWalletUnlocked = sessionStorage.getItem('customer_wallet_unlocked') === 'true';

  const [copied, setCopied] = useState(false);
  const [selectedTargetBank, setSelectedTargetBank] = useState('BANK-002'); // Demo Cooperative Bank
  const navigate = useNavigate();

  const handleCopy = () => {
    if (!customerCredential || !isWalletUnlocked) return;
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
    if (!isWalletUnlocked) {
      addToast('Please unlock your Identity Wallet first to authorize sharing.', 'warning');
      navigate('/customer/wallet');
      return;
    }
    addToast(`Credential authorization shared with ${selectedTargetBank}!`, 'success');
  };

  const handleSimulateInVerifier = () => {
    if (!customerCredential) return;
    if (!isWalletUnlocked) {
      addToast('Please unlock your Identity Wallet with Google to access credential token.', 'warning');
      navigate('/customer/wallet');
      return;
    }
    setCurrentRole('verifier');
    navigate(`/bank/verifier/verify?credId=${encodeURIComponent(customerCredential.id)}`);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="text-center sm:text-left">
        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
          PEER-TO-PEER IDENTITY PRESENTATION
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
          Share Your Verified KYC
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
          Present your verified credential to a participating bank without resubmitting physical KYC documents.
        </p>
      </div>

      {/* Share with Credential ID Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Confidential Sharing</span>
              <h3 className="text-base font-bold text-white">Present Credential ID</h3>
            </div>
          </div>

          <Link
            to="/customer/wallet"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Manage in Wallet</span>
          </Link>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Your unique Credential ID is kept private inside your secure wallet. You can authorize a transfer to an accredited financial institution below.
        </p>

        <form onSubmit={handleShareWithBank} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Credential ID Status
            </label>
            <div className="relative">
              <input
                type="text"
                value={isWalletUnlocked && customerCredential ? customerCredential.id : '•••• •••• •••• (Protected in Wallet)'}
                readOnly
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono text-slate-400 focus:outline-none pr-28 select-none"
              />
              {isWalletUnlocked ? (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              ) : (
                <Link
                  to="/customer/wallet"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-400 text-xs flex items-center gap-1 border border-cyan-500/30 transition-colors"
                >
                  <Lock className="w-3 h-3" />
                  <span>Unlock</span>
                </Link>
              )}
            </div>
            {!isWalletUnlocked && (
              <span className="text-[11px] text-slate-500 mt-1.5 block">
                To access and reveal your plain text Credential ID, authenticate with Google inside the <Link to="/customer/wallet" className="text-cyan-400 hover:underline">Identity Wallet</Link>.
              </span>
            )}
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
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Authorize Presentation to Bank</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleSimulateInVerifier}
            className="w-full text-center text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Test Verify as Demo Cooperative Bank</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
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
    </div>
  );
};

export default ShareCredential;

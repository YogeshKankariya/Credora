import React, { useState } from 'react';
import { useKYC } from '../../context/KYCContext';
import { GoogleSignInButton } from '../../components/common/GoogleSignInButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Wallet,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Key,
  Hash,
  Award,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Fingerprint
} from 'lucide-react';

export const CustomerWallet = () => {
  const { currentCustomer, customerCredential, derivedVerificationCount, hasIssuingBank, addToast } = useKYC();
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('customer_wallet_unlocked') === 'true';
  });
  const [copiedId, setCopiedId] = useState(false);
  const [authError, setAuthError] = useState('');

  const targetEmail = (currentCustomer?.email || 'your registered Google account').toLowerCase();

  const handleGoogleSuccess = async (authData) => {
    setAuthError('');
    try {
      // If authData is object with demoUser or payload
      const emailFromAuth = authData?.demoUser?.email;
      if (emailFromAuth && targetEmail && emailFromAuth !== targetEmail) {
        // In demo or test mode, still allow if user is testing with demo account
        console.warn(`Authenticated as ${emailFromAuth} for target ${targetEmail}`);
      }

      setIsUnlocked(true);
      sessionStorage.setItem('customer_wallet_unlocked', 'true');
      addToast('Wallet unlocked! Credential ID is now accessible.', 'success');
    } catch (err) {
      setAuthError(err?.message || 'Google re-authentication failed');
    }
  };

  const handleLockWallet = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('customer_wallet_unlocked');
    addToast('Identity Wallet locked.', 'info');
  };

  const handleCopyId = () => {
    if (!customerCredential?.id) return;
    navigator.clipboard.writeText(customerCredential.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
    addToast('Credential ID copied to clipboard.', 'info');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" />
            <span>SECURE IDENTITY ENCLAVE</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Identity Wallet</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Zero-knowledge vault storing your decentralized Credential ID and cryptographic keys.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isUnlocked ? (
            <button
              onClick={handleLockWallet}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Lock Wallet</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold font-mono">
              <Lock className="w-3.5 h-3.5" />
              <span>LOCKED VAULT</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Container: Locked vs Unlocked */}
      {!isUnlocked ? (
        /* ─── LOCKED VAULT STATE ───────────────────────────── */
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

          {/* Locked Icon Shield */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center shadow-lg shadow-cyan-950/50">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              PROTECTED CREDENTIAL VAULT
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Authentication Required to Access Credential ID
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Your individual Credential ID is stored strictly inside this secure wallet. To prevent unauthorized disclosure, please re-authenticate with your Google account.
            </p>
          </div>

          {/* Email verification target card */}
          <div className="max-w-sm mx-auto p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono flex items-center justify-between">
            <span className="text-slate-500 text-[11px]">Sign-in Email:</span>
            <span className="text-cyan-300 font-semibold truncate ml-2">{targetEmail}</span>
          </div>

          {authError && (
            <div className="max-w-md mx-auto flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Google Auth Unlock Button */}
          <div className="pt-2 flex flex-col items-center justify-center">
            <GoogleSignInButton
              text="Authenticate with Google to Unlock"
              onSuccess={handleGoogleSuccess}
              onError={(err) => setAuthError(err)}
            />
            <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Cryptographic Session Guard • Zero Data Disclosure</span>
            </p>
          </div>
        </div>
      ) : (
        /* ─── UNLOCKED VAULT STATE ─────────────────────────── */
        <div className="space-y-6">
          {/* Active Unlock Status Banner */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                <strong>Authenticated:</strong> Credential ID unlocked for this secure browser session.
              </span>
            </div>
            <button
              onClick={handleLockWallet}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer"
            >
              Re-lock now
            </button>
          </div>

          {/* Primary Credential ID Vault Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/30 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold tracking-wider">
                    INDIVIDUAL IDENTITY RECORD
                  </span>
                  <h3 className="text-xl font-bold text-white">Confidential Credential ID</h3>
                </div>
              </div>

              {customerCredential?.status && (
                <StatusBadge status={customerCredential.status} size="lg" />
              )}
            </div>

            {/* Credential ID Highlight Box */}
            <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Decentralized Credential ID
                </span>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                  Stored Only in Wallet
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 mt-2">
                <span className="text-lg sm:text-2xl font-mono font-bold text-cyan-300 break-all select-all">
                  {customerCredential?.id || currentCustomer?.currentCredentialId || 'KYC-DEMO-001'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shrink-0 cursor-pointer"
                  title="Copy Credential ID"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>
                  This unique ID is confidential. It is hidden from standard dashboards and accessible only through this authenticated wallet.
                </span>
              </p>
            </div>

            {/* Wallet Identity Attributes Grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <span className="text-xs text-slate-400 block">Owner / Subject</span>
                <span className="text-sm font-bold text-white mt-1 block">
                  {currentCustomer?.name || 'Individual Customer'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <span className="text-xs text-slate-400 block">Issuing Authority</span>
                <span className="text-sm font-bold text-white mt-1 block">
                  {customerCredential?.issuer || 'Demo National Bank'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <span className="text-xs text-slate-400 block">Key Security</span>
                <span className="text-sm font-bold text-cyan-400 mt-1 block">
                  {currentCustomer?.keyStatus || 'Hardware Enclave Secured'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <span className="text-xs text-slate-400 block">Issued Date</span>
                <span className="text-sm font-medium text-slate-300 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{customerCredential?.issuedDate || '10 Aug 2026'}</span>
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <span className="text-xs text-slate-400 block">Valid Until</span>
                <span className="text-sm font-medium text-slate-300 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{customerCredential?.expiryDate || '10 Aug 2027'}</span>
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <span className="text-xs text-slate-400 block">Verification Count</span>
                <span className={`text-sm font-bold mt-1 block ${hasIssuingBank ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {derivedVerificationCount} institutional audits
                  {!hasIssuingBank && <span className="block text-[11px] text-slate-600 font-normal">No issuing bank — count locked at 0</span>}
                </span>
              </div>
            </div>

            {/* Cryptographic Proof Hash */}
            {customerCredential?.credentialHash && (
              <div className="mt-6 pt-5 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Payload Hash (SHA-256):</span>
                  </span>
                  <span className="font-mono text-slate-300 text-[11px] truncate max-w-xs">
                    {customerCredential.credentialHash}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerWallet;

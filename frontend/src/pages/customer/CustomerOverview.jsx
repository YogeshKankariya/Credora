import React from 'react';
import { useKYC } from '../../context/KYCContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Link, useNavigate } from 'react-router-dom';
import {
  Fingerprint,
  FileCheck,
  ShieldCheck,
  Building2,
  Share2,
  Eye,
  Award,
  Calendar,
  Layers,
  Key,
  AlertCircle,
  Lock,
  Wallet
} from 'lucide-react';

export const CustomerOverview = () => {
  const { currentCustomer, customerCredential, derivedKycStatus, derivedVerificationCount, derivedVerifiedTimesLabel, hasIssuingBank, sendKYCRequestToBank } = useKYC();
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Top Welcome & DID Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card rounded-2xl p-6 border border-slate-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
            CUSTOMER PORTAL
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">
            Welcome back, {currentCustomer?.name || 'Customer'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={derivedKycStatus} size="lg" />
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Identity Status"
          value={currentCustomer?.identityStatus || 'Verified'}
          icon={Fingerprint}
          color="cyan"
        />
        <StatCard
          title="KYC Status"
          value={currentCustomer?.kycStatus || 'Verified'}
          subtitle=""
          icon={FileCheck}
          color={hasIssuingBank ? 'emerald' : 'rose'}
          valueColor={hasIssuingBank ? 'emerald' : 'rose'}
        />
        <StatCard
          title="Credential Status"
          value={customerCredential ? customerCredential.status : 'No Credential'}
          subtitle={customerCredential ? `Tier-1 Verifiable` : 'Requires Bank Audit'}
          icon={ShieldCheck}
          color={customerCredential?.status === 'ACTIVE' ? 'emerald' : customerCredential?.status === 'REVOKED' ? 'rose' : 'amber'}
        />
        <StatCard
          title="Issuing Bank"
          value={hasIssuingBank ? customerCredential.issuer.split(' ')[1] || customerCredential.issuer : 'None'}
          subtitle={hasIssuingBank ? customerCredential.issuer : 'Pending — No credential issued'}
          icon={Building2}
          color={hasIssuingBank ? 'blue' : 'amber'}
        />
      </div>

      {/* Large "My KYC Credential" Card */}
      {customerCredential ? (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-800 relative overflow-hidden shadow-2xl">
          {/* Subtle background glow */}
          <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
            customerCredential.status === 'ACTIVE' ? 'bg-cyan-500/10' : 'bg-rose-500/10'
          }`} />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase text-cyan-400 tracking-wider font-semibold">
                  W3C VERIFIABLE CREDENTIAL
                </span>
                <h3 className="text-xl font-bold text-white">My KYC Credential</h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={customerCredential.status} size="lg" />
            </div>
          </div>

          {/* Credential Attributes Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400 block">Credential ID</span>
                <span className="text-sm font-mono font-bold text-slate-500 mt-1 block tracking-widest">
                  •••• •••• ••••
                </span>
              </div>
              <div className="mt-2 pt-1">
                <Link
                  to="/customer/wallet"
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Lock className="w-3 h-3" />
                  <span>Stored in Wallet &rarr;</span>
                </Link>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs font-medium text-slate-400 block">Issued By</span>
              <span className="text-base font-bold text-white mt-1 block">
                {customerCredential.issuer}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs font-medium text-slate-400 block">Verification Count</span>
              <span className={`text-base font-bold mt-1 block ${ hasIssuingBank ? 'text-emerald-400' : 'text-slate-500'}`}>
                {derivedVerificationCount}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">{derivedVerifiedTimesLabel}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs font-medium text-slate-400 block">Issued Date</span>
              <span className="text-sm font-semibold text-slate-200 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{customerCredential.issuedDate}</span>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs font-medium text-slate-400 block">Expiry Date</span>
              <span className="text-sm font-semibold text-slate-200 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{customerCredential.expiryDate}</span>
              </span>
            </div>
          </div>

          {/* Revocation Warning if revoked */}
          {customerCredential.status === 'REVOKED' && (
            <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-semibold text-rose-300">This credential has been marked as REVOKED.</p>
                <p className="text-rose-200/80 mt-0.5">
                  Reason: {customerCredential.revocationReason || 'Institutional policy refresh'}. Verifier banks will reject presentations.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
            <Link
              to="/customer/credential"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Eye className="w-4 h-4 text-slate-400" />
              <span>View Credential</span>
            </Link>

            <Link
              to="/customer/share"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Share2 className="w-4 h-4 text-slate-400" />
              <span>Share Credential</span>
            </Link>

            <Link
              to="/customer/wallet"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-all ml-auto"
            >
              <Wallet className="w-4 h-4" />
              <span>Identity Wallet</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-8 border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">
            {currentCustomer.kycStatus === 'Not Submitted'
              ? 'KYC Verification Not Requested'
              : 'KYC Verification Pending with Bank A'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {currentCustomer.kycStatus === 'Not Submitted'
              ? 'Your identity profile is registered. Click below to submit your verification request to Bank A (Demo National Bank) for regulatory audit and cryptographic credential signing.'
              : `${currentCustomer.name}'s identity documents are currently queued for regulatory audit by Bank A (Demo National Bank). Switch to Bank A's portal to review and issue the credential.`}
          </p>
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            {currentCustomer.kycStatus === 'Not Submitted' ? (
              <button
                type="button"
                onClick={() => sendKYCRequestToBank(currentCustomer.id)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-950/50 cursor-pointer transition-all"
              >
                Send KYC Request to Bank A (Issuer)
              </button>
            ) : (
              <Link
                to="/bank/issuer"
                className="px-5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors"
              >
                Switch to Bank A (Issuer Portal) →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

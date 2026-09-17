import React, { useState } from 'react';
import { useKYC } from '../../context/KYCContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { QRCodeModal } from '../../components/common/QRCodeModal';
import { Link, useNavigate } from 'react-router-dom';
import {
  Fingerprint,
  FileCheck,
  ShieldCheck,
  Building2,
  QrCode,
  Share2,
  Eye,
  Award,
  Calendar,
  Layers,
  Key,
  Hash,
  AlertCircle
} from 'lucide-react';

export const CustomerOverview = () => {
  const { currentCustomer, customerCredential } = useKYC();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Top Welcome & DID Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card rounded-2xl p-6 border border-slate-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
            CUSTOMER IDENTITY WALLET
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">
            Welcome back, {currentCustomer?.name || 'Customer'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>DID:</span>
            <span className="font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {currentCustomer?.did || 'did:customer:demo'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={currentCustomer?.kycStatus || 'Verified'} size="lg" />
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Identity Status"
          value={currentCustomer?.identityStatus || 'Verified'}
          subtitle={`DID: ${currentCustomer?.did ? currentCustomer.did.slice(0, 16) : 'did:customer'}...`}
          icon={Fingerprint}
          color="cyan"
        />
        <StatCard
          title="KYC Status"
          value={currentCustomer?.kycStatus || 'Verified'}
          subtitle="Regulatory compliance met"
          icon={FileCheck}
          color="emerald"
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
          value={customerCredential ? customerCredential.issuer.split(' ')[1] : 'None'}
          subtitle={customerCredential ? customerCredential.issuer : 'Pending'}
          icon={Building2}
          color="blue"
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
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs font-medium text-slate-400 block">Credential ID</span>
              <span className="text-base font-mono font-bold text-cyan-300 mt-1 block">
                {customerCredential.id}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs font-medium text-slate-400 block">Issued By</span>
              <span className="text-base font-bold text-white mt-1 block">
                {customerCredential.issuer}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs font-medium text-slate-400 block">Verification Count</span>
              <span className="text-base font-bold text-emerald-400 mt-1 block">
                {customerCredential.verificationCount} times verified
              </span>
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

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs font-medium text-slate-400 block">Payload Hash</span>
              <span className="text-sm font-mono text-slate-400 mt-1 flex items-center gap-2">
                <Hash className="w-4 h-4 text-cyan-400" />
                <span>{customerCredential.shortHash}</span>
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

            <button
              onClick={() => setIsQRModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-all ml-auto"
            >
              <QrCode className="w-4 h-4" />
              <span>Generate QR</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-8 border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No KYC Credential Issued Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {currentCustomer.name} has completed registration. Switch to the Bank Issuer portal to review documents and issue the cryptographic credential.
          </p>
          <div className="pt-2">
          </div>
        </div>
      )}

      {/* QR Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        credential={customerCredential}
      />
    </div>
  );
};

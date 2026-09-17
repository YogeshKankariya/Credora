import React, { useState } from 'react';
import { useKYC } from '../../context/KYCContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { QRCodeModal } from '../../components/common/QRCodeModal';
import {
  Award,
  ShieldCheck,
  Key,
  Hash,
  Database,
  Clock,
  QrCode,
  Share2,
  Calendar,
  Building2,
  User,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const KYCCredential = () => {
  const { currentCustomer, customerCredential } = useKYC();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  if (!customerCredential) {
    return (
      <div className="glass-card rounded-3xl p-12 text-center space-y-4 max-w-2xl mx-auto">
        <Award className="w-12 h-12 text-amber-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">No Verifiable Credential Available</h3>
        <p className="text-sm text-slate-400">
          This profile has not yet been issued a cryptographic KYC credential.
        </p>
        <Link
          to="/bank/issuer/customers"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
        >
          <span>Issue Credential via Bank Issuer</span>
        </Link>
      </div>
    );
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(customerCredential.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const isRevoked = customerCredential.status === 'REVOKED';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
            OFFICIAL BANKING CREDENTIAL
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Verifiable KYC Credential
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Digitally certified compliance token issued under W3C Verifiable Credentials standard.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={customerCredential.status} size="lg" />
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Share QR</span>
          </button>
        </div>
      </div>

      {/* Main Certificate / Credential Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative security watermark */}
        <div className="absolute -bottom-10 -right-10 w-72 h-72 opacity-5 pointer-events-none text-white">
          <Award className="w-full h-full" />
        </div>

        {/* Certificate Title Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                Financial Trust Network
              </span>
              <h3 className="text-xl font-bold text-white">Verifiable KYC Credential</h3>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
              Tier Level
            </span>
            <span className="text-xs font-bold text-cyan-300">{customerCredential.level}</span>
          </div>
        </div>

        {/* Credential Data Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 block">Credential ID</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-base font-mono font-bold text-cyan-300">
                {customerCredential.id}
              </span>
              <button
                onClick={handleCopyId}
                className="text-slate-400 hover:text-white transition-colors"
                title="Copy Credential ID"
              >
                {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 block">Subject</span>
            <span className="text-base font-bold text-white mt-1 block">
              {customerCredential.subject}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 block">Issuer</span>
            <span className="text-base font-bold text-white mt-1 block">
              {customerCredential.issuer}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 block">Credential Type</span>
            <span className="text-base font-bold text-white mt-1 block">
              {customerCredential.credentialType}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 block">Issued</span>
            <span className="text-sm font-semibold text-slate-200 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{customerCredential.issuedDate}</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 block">Valid Until</span>
            <span className="text-sm font-semibold text-slate-200 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{customerCredential.expiryDate}</span>
            </span>
          </div>
        </div>

        {/* Cryptographic Proof Section */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>Cryptographic Proof</span>
            </h4>
            <span className="text-xs font-mono text-slate-400">
              Payload Hash: <span className="text-cyan-300 font-semibold">{customerCredential.shortHash}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Issuer Signature</span>
              <span className="text-emerald-400 font-bold font-mono">✓ Valid</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Credential Integrity</span>
              <span className="text-emerald-400 font-bold font-mono">✓ Verified</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Blockchain Registration</span>
              <span className="text-emerald-400 font-bold font-mono">✓ Confirmed</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Credential Status</span>
              <span
                className={`font-bold font-mono ${
                  isRevoked ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {isRevoked ? '✕ REVOKED' : '✓ ACTIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Revocation Warning if revoked */}
        {isRevoked && (
          <div className="mt-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-semibold text-rose-300">Status Notice: This credential has been Revoked.</p>
              <p className="text-rose-200/80 mt-0.5">
                Revocation reason: {customerCredential.revocationReason || 'Institutional policy refresh'}. Verifier banks will not accept this credential.
              </p>
            </div>
          </div>
        )}
      </div>

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        credential={customerCredential}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useKYC } from '../../context/KYCContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  User,
  Calendar,
  MapPin,
  FileText,
  AlertTriangle,
  Award,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const KYCVerification = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { users, approveCustomerKYC, rejectCustomerKYC, credentials } = useKYC();

  // Find customer or fallback to first
  const targetId = customerId || 'CUST-003';
  const customer = users.find((u) => u.id === targetId) || users[0];
  const existingCred = credentials.find((c) => c.customerId === customer.id);

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Identity document image clarity issue');

  const handleApprove = () => {
    approveCustomerKYC(customer.id);
    setIsApproveModalOpen(true);
  };

  const handleReject = () => {
    rejectCustomerKYC(customer.id, rejectReason);
    setIsRejectModalOpen(false);
  };

  const handleProceedToIssue = () => {
    setIsApproveModalOpen(false);
    navigate(`/bank/issuer/issue/${customer.id}`);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
            REGULATORY COMPLIANCE AUDIT
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            KYC Verification
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review synthetic customer identification documents and approve cryptographic verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={customer.kycStatus} size="lg" />
        </div>
      </div>

      {/* Synthetic Demo Data Notice */}
      <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between gap-3 text-xs text-cyan-300">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong className="font-semibold text-white">Synthetic Demo Data:</strong> All names, addresses, and document IDs presented here are generated for demonstration purposes only.
          </span>
        </div>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-900/40 text-cyan-300 border border-cyan-700/50 shrink-0">
          DEMO MODE
        </span>
      </div>

      {/* Main Verification Dossier */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-800">
          <img
            src={customer.avatar}
            alt={customer.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
          />
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-white">{customer.name}</h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                {customer.id}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono break-all">{customer.did}</p>
            <p className="text-xs text-slate-500">{customer.email}</p>
          </div>
        </div>

        {/* Customer Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold block">
              Full Legal Name
            </span>
            <span className="text-sm font-bold text-white mt-1 block">{customer.name}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold block">
              Customer Identification
            </span>
            <span className="text-sm font-mono font-bold text-cyan-300 mt-1 block">
              {customer.id}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold block">
              Date of Birth
            </span>
            <span className="text-sm font-bold text-slate-200 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{customer.dob}</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold block">
              Residential Address
            </span>
            <span className="text-sm font-bold text-slate-200 mt-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{customer.address}</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 sm:col-span-2">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold block">
              Identity Document Submitted
            </span>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>{customer.documentType} ({customer.documentNumber})</span>
              </div>
              <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-800/40">
                OCR Checked
              </span>
            </div>
          </div>
        </div>

        {/* Existing Credential Banner if already has one */}
        {existingCred && (
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="font-bold text-white block">
                  Credential Already Issued: {existingCred.id}
                </span>
                <span className="text-slate-400 text-[11px]">
                  Status: {existingCred.status} • Issued: {existingCred.issuedDate}
                </span>
              </div>
            </div>
            <Link
              to="/bank/issuer/credentials"
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
            >
              View in Registry
            </Link>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setIsRejectModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-950 hover:border-rose-500/40 text-slate-300 hover:text-rose-200 text-xs font-semibold border border-slate-800 transition-colors"
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>Reject KYC</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleApprove}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve KYC</span>
            </button>

            {customer.kycStatus === 'Verified' && !existingCred && (
              <button
                onClick={handleProceedToIssue}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-all"
              >
                <Award className="w-4 h-4" />
                <span>Issue Verifiable Credential</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="KYC Verification Successful"
        subtitle="Customer compliance approved"
      >
        <div className="space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-base font-bold text-white">KYC Verification Successful</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {customer.name} has met all compliance standards. You can now mint a cryptographically signed Verifiable Credential anchored on the decentralized ledger.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setIsApproveModalOpen(false)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleProceedToIssue}
              className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Issue Verifiable Credential</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Customer KYC"
        subtitle="Specify justification for audit rejection"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Rejection Justification
            </label>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="Identity document image clarity issue">Document image blurry or illegible</option>
              <option value="Proof of address discrepancy">Proof of address discrepancy</option>
              <option value="Name mismatch against registry">Name mismatch against government registry</option>
              <option value="Expired synthetic document">Document past expiration date</option>
            </select>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={() => setIsRejectModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

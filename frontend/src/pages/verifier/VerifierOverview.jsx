import React, { useState } from 'react';
import { useKYC } from '../../context/KYCContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { QRCodeModal } from '../../components/common/QRCodeModal';
import {
  FileSearch,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Search,
  Key
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const VerifierOverview = () => {
  const { credentials } = useKYC();
  const [credentialIdInput, setCredentialIdInput] = useState('');
  const [isSimulatedScanOpen, setIsSimulatedScanOpen] = useState(false);
  const navigate = useNavigate();

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (!credentialIdInput.trim()) return;
    navigate(`/bank/verifier/verify?credId=${encodeURIComponent(credentialIdInput.trim())}`);
  };

  const activeCred = credentials.find((c) => c.status === 'ACTIVE');
  const revokedCred = credentials.find((c) => c.status === 'REVOKED');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card rounded-2xl p-6 border border-slate-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            CROSS-INSTITUTIONAL TRUST NETWORK
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">Demo Cooperative Bank</h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Verifier DID:</span>
            <span className="font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              did:bank:coop-002-vfy
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/bank/verifier/tampering"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Key className="w-4 h-4 text-cyan-400" />
            <span>Tampering Demo Lab</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Verifications Today"
          value="87"
          subtitle="Cross-bank requests"
          icon={FileSearch}
          color="blue"
          trend="+18% vs yesterday"
        />
        <StatCard
          title="Successful"
          value="81"
          subtitle="93.1% pass rate"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Failed"
          value="6"
          subtitle="Revoked or invalid"
          icon={XCircle}
          color="rose"
        />
        <StatCard
          title="Active Credentials Checked"
          value="79"
          subtitle="Real-time ledger validated"
          icon={ShieldCheck}
          color="cyan"
        />
      </div>

      {/* Main Verification Input Section */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-6">
        <div className="max-w-xl">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            INSTANT ONBOARDING ENGINE
          </span>
          <h3 className="text-2xl font-bold text-white mt-1">
            Verify a Customer Credential
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Enter a customer's Verifiable Credential ID or simulate a QR code scan. Our node will verify cryptographic signature, hash integrity, and live ledger revocation status.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleVerifySubmit} className="max-w-2xl space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={credentialIdInput}
                onChange={(e) => setCredentialIdInput(e.target.value)}
                placeholder="Enter Credential ID (e.g. KYC-2026-000184)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs sm:text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={!credentialIdInput.trim()}
              className={`px-6 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                credentialIdInput.trim()
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <span>Verify Credential</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (activeCred) {
                  navigate(`/bank/verifier/verify?credId=${activeCred.id}`);
                }
              }}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>Scan QR</span>
            </button>
          </div>
        </form>

        {/* Quick Demo Pre-fill Pills */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            Quick Demo Presets for Testing:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {activeCred && (
              <button
                type="button"
                onClick={() => setCredentialIdInput(activeCred.id)}
                className="px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <span>{activeCred.id}</span>
                <span className="text-[10px] uppercase font-bold text-emerald-400 font-sans">
                  (ACTIVE • PASS)
                </span>
              </button>
            )}

            {revokedCred && (
              <button
                type="button"
                onClick={() => setCredentialIdInput(revokedCred.id)}
                className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 border border-rose-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <span>{revokedCred.id}</span>
                <span className="text-[10px] uppercase font-bold text-rose-400 font-sans">
                  (REVOKED • FAIL)
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/bank/verifier/tampering')}
              className="px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <span>TAMPER-TEST</span>
              <span className="text-[10px] uppercase font-bold text-cyan-400 font-sans">
                (DATA ALTERATION • FAIL)
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

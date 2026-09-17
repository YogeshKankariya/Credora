import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Layers,
  CheckCircle2,
  ChevronRight,
  Database,
  Building2,
  Wallet,
  RefreshCw,
  QrCode,
  Fingerprint
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="space-y-24 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center pt-8 md:pt-16 max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>NEXT-GENERATION BANKING COMPLIANCE</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          CR<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">EDORA</span>
        </h1>

        <h2 className="text-2xl sm:text-3xl font-bold text-slate-300">
          Verify once. Trust many times.
        </h2>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Carry a reusable, cryptographically verifiable KYC credential and share it securely with participating financial institutions.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/login-page"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-xl shadow-cyan-900/30 transition-all hover:scale-105"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Visual Architectural Flow */}
      <section className="glass-card rounded-3xl p-8 sm:p-12 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-2xl mx-auto mb-10">
          <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400">Zero Document Duplication</h3>
          <h4 className="text-2xl font-bold text-white mt-1">Verifiable Banking Credential Lifecycle</h4>
        </div>

        {/* Steps diagram */}
        <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-3">
          {/* 1 */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2">
              <Fingerprint className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Customer</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Generates DID</span>
          </div>

          <div className="hidden md:flex justify-center text-slate-600">
            <ArrowRight className="w-5 h-5 text-cyan-500/60" />
          </div>

          {/* 2 */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Issuing Bank</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Audits KYC</span>
          </div>

          <div className="hidden md:flex justify-center text-slate-600">
            <ArrowRight className="w-5 h-5 text-cyan-500/60" />
          </div>

          {/* 3 */}
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-center flex flex-col items-center shadow-lg shadow-cyan-950/50">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-cyan-300">Verifiable Credential</span>
            <span className="text-[10px] text-cyan-400/80 mt-0.5">Signed & Anchored</span>
          </div>

          <div className="hidden md:flex justify-center text-slate-600">
            <ArrowRight className="w-5 h-5 text-cyan-500/60" />
          </div>

          {/* 4 */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Another Bank</span>
            <span className="text-[10px] text-emerald-400 mt-0.5">Instant Verification</span>
          </div>
        </div>
      </section>

      {/* 3 Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card rounded-2xl p-7 border border-slate-800 relative hover:border-cyan-500/40 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Reusable KYC</h3>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Complete verification once and reuse your verified credential across all participating institutions without re-submitting original documents.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-7 border border-slate-800 relative hover:border-cyan-500/40 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Cryptographically Verifiable</h3>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Credentials are digitally signed by the issuing bank using industry-standard elliptic curve keys (secp256k1) for mathematically proven authenticity.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-7 border border-slate-800 relative hover:border-cyan-500/40 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Privacy First</h3>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Sensitive KYC information remains off-chain in the customer's secure wallet. Only cryptographic hashes and revocation statuses exist on the ledger.
          </p>
        </div>
      </section>

      {/* 5-Step "How It Works" Section */}
      <section className="space-y-10">
        <div className="text-center max-w-xl mx-auto">
          <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400">Step-by-Step Architecture</h3>
          <h4 className="text-2xl sm:text-3xl font-bold text-white mt-1">How the Protocol Operates</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              step: '01',
              title: 'Create Identity',
              desc: 'Customer generates a cryptographic DID and key pair stored locally on device.',
            },
            {
              step: '02',
              title: 'Complete KYC',
              desc: 'First bank performs standard regulatory document verification and audit.',
            },
            {
              step: '03',
              title: 'Receive Credential',
              desc: 'Bank issues a signed W3C-compliant Verifiable Credential to the customer wallet.',
            },
            {
              step: '04',
              title: 'Share Credential',
              desc: 'Customer presents credential token or QR code to any second bank.',
            },
            {
              step: '05',
              title: 'Verify Credential',
              desc: 'Receiving bank validates signature, cryptographic hash, and live status in seconds.',
            },
          ].map((item) => (
            <div key={item.step} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-2xl font-mono font-extrabold text-cyan-500/50 block">{item.step}</span>
                <h5 className="text-sm font-bold text-white mt-2">{item.title}</h5>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

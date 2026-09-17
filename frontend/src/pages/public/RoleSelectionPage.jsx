import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useKYC } from '../../context/KYCContext';
import { User, Building2, CheckCircle2, ShieldAlert, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const { setCurrentRole } = useKYC();

  const handleSelectRole = (role, targetPath) => {
    setCurrentRole(role);
    navigate(targetPath);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Top Banner Notice */}
      <div className="mb-8 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="font-semibold text-slate-300">Demo Environment</span>
        <span>—</span>
        <span>No real KYC data is used. Fully simulated cryptographic workflows.</span>
      </div>

      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ROLE SELECTION</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Enter Demo
        </h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Select a persona to explore the decentralized KYC verification workflow from their perspective.
        </p>
      </div>

      {/* 3 Selectable Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Role 1: Individual / Customer */}
        <div className="glass-card rounded-2xl p-7 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all flex flex-col justify-between group shadow-lg">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <User className="w-7 h-7" />
            </div>
            <span className="text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider">
              Persona 01
            </span>
            <h3 className="text-xl font-bold text-white mt-1">Individual</h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Access your decentralized identity wallet, view your cryptographically signed KYC credential, and share tokens with banks.
            </p>
          </div>

          <div className="mt-8">
            <button
              onClick={() => handleSelectRole('customer', '/customer')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 hover:border-cyan-500 transition-all group-hover:bg-cyan-600 group-hover:text-white"
            >
              <span>Continue as Individual</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Role 2: Bank Issuer */}
        <div className="glass-card rounded-2xl p-7 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/90 transition-all flex flex-col justify-between group shadow-lg">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Building2 className="w-7 h-7" />
            </div>
            <span className="text-xs font-mono uppercase text-blue-400 font-semibold tracking-wider">
              Persona 02
            </span>
            <h3 className="text-xl font-bold text-white mt-1">Bank Issuer</h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Audit customer documents, approve or reject KYC, digitally sign credentials, anchor hashes on-chain, and manage revocations.
            </p>
          </div>

          <div className="mt-8">
            <button
              onClick={() => handleSelectRole('issuer', '/bank/issuer')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 hover:border-blue-500 transition-all group-hover:bg-blue-600 group-hover:text-white"
            >
              <span>Continue as Bank Issuer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Role 3: Bank Verifier */}
        <div className="glass-card rounded-2xl p-7 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all flex flex-col justify-between group shadow-lg">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <span className="text-xs font-mono uppercase text-emerald-400 font-semibold tracking-wider">
              Persona 03
            </span>
            <h3 className="text-xl font-bold text-white mt-1">Bank Verifier</h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Verify customer credentials via ID or QR scan, run the 6-stage cryptographic verification pipeline, and test tampering detection.
            </p>
          </div>

          <div className="mt-8">
            <button
              onClick={() => handleSelectRole('verifier', '/bank/verifier')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 hover:border-emerald-500 transition-all group-hover:bg-emerald-600 group-hover:text-white"
            >
              <span>Continue as Bank Verifier</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Disclaimer */}
      <div className="mt-12 text-center text-xs text-slate-500">
        <p>You can switch roles at any time using the switcher in the header banner.</p>
      </div>
    </div>
  );
};

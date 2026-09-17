import React from 'react';
import { useKYC } from '../../context/KYCContext';
import { StatusBadge } from './StatusBadge';
import { ShieldCheck, Bell, User, Building2, Menu, LogOut, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Topbar = ({ onToggleSidebar }) => {
  const { currentRole, currentCustomer, currentBank, users, banks, activeCustomerId, setActiveCustomerId, activeBankId, setActiveBankId } = useKYC();
  const navigate = useNavigate();

  const isCustomer = currentRole === 'customer';
  const isIssuer = currentRole === 'issuer';
  const isVerifier = currentRole === 'verifier';

  return (
    <header className="h-16 bg-slate-900/80 border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between sticky top-9 z-30 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {isCustomer && (
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <span>Welcome back, {currentCustomer.name.split(' ')[0]}</span>
              <StatusBadge status={currentCustomer.kycStatus} size="sm" />
            </h1>
            <p className="text-xs text-slate-400 font-mono hidden sm:block">
              {currentCustomer.did.slice(0, 22)}...
            </p>
          </div>
        )}

        {isIssuer && (
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <span>Bank Issuer Portal</span>
              <span className="text-xs font-normal text-slate-400 hidden sm:inline">|</span>
              <span className="text-xs font-semibold text-blue-400 hidden sm:inline">{currentBank.name}</span>
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-[11px] text-slate-400">{currentBank.did}</span>
            </div>
          </div>
        )}

        {isVerifier && (
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <span>Bank Verification Portal</span>
              <span className="text-xs font-normal text-slate-400 hidden sm:inline">|</span>
              <span className="text-xs font-semibold text-emerald-400 hidden sm:inline">Demo Cooperative Bank</span>
            </h1>
            <p className="text-xs text-slate-400">Institutional Credential Verification & Blockchain Auditing</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/login-page"
          title="Switch Role"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-400 hover:text-cyan-300 font-semibold hover:underline cursor-pointer transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </Link>
      </div>
    </header>
  );
};

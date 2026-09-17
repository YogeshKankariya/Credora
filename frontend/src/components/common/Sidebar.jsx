import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useKYC } from '../../context/KYCContext';
import {
  LayoutDashboard,
  Fingerprint,
  FileCheck,
  Share2,
  History,
  Settings,
  Users,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Activity,
  Award,
  FileSearch,
  KeyRound,
  Layers,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

export const Sidebar = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { currentRole } = useKYC();

  let navItems = [];

  if (currentRole === 'customer') {
    navItems = [
      {
        name: 'Overview',
        path: '/customer',
        icon: LayoutDashboard,
      },
      {
        name: 'My Identity',
        path: '/customer/identity',
        icon: Fingerprint,
      },
      {
        name: 'KYC Credential',
        path: '/customer/credential',
        icon: Award,
      },
      {
        name: 'Verification History',
        path: '/customer/history',
        icon: History,
      },
      {
        name: 'Settings',
        path: '/customer/settings',
        icon: Settings,
      },
    ];
  } else if (currentRole === 'issuer') {
    navItems = [
      {
        name: 'Dashboard',
        path: '/bank/issuer',
        icon: LayoutDashboard,
      },
      {
        name: 'Customers',
        path: '/bank/issuer/customers',
        icon: Users,
      },
      {
        name: 'KYC Verification',
        path: '/bank/issuer/kyc/CUST-003',
        icon: FileCheck,
      },
      {
        name: 'Issued Credentials',
        path: '/bank/issuer/credentials',
        icon: Award,
      },
      {
        name: 'Revocations',
        path: '/bank/issuer/revocations',
        icon: ShieldAlert,
      },
      {
        name: 'Activity',
        path: '/bank/issuer/activity',
        icon: Activity,
      },
    ];
  } else {
    // Verifier
    navItems = [
      {
        name: 'Dashboard',
        path: '/bank/verifier',
        icon: LayoutDashboard,
      },
      {
        name: 'Verify Credential',
        path: '/bank/verifier/verify',
        icon: FileSearch,
      },
      {
        name: 'Verification History',
        path: '/bank/verifier/history',
        icon: History,
      },
      {
        name: 'Tampering Demo',
        path: '/bank/verifier/tampering',
        icon: Layers,
      },
      {
        name: 'Trusted Issuers',
        path: '/bank/verifier/issuers',
        icon: Building2,
      },
    ];
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0
          bg-slate-900 border-r border-slate-800
          z-50 flex flex-col
          transition-all duration-300 ease-in-out

          w-64

          ${isOpen ? 'translate-x-0' : '-translate-x-full'}

          md:translate-x-0
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        {/* Brand Header */}
<div
  className={`
    h-16 px-5 border-b border-slate-800
    flex items-center
    ${isCollapsed ? 'md:justify-center' : 'justify-between'}
  `}
>
  {/* Expanded: Logo + Brand */}
  {!isCollapsed && (
    <Link
      to=""
      className="flex items-center gap-2.5 min-w-0"
    >
      {/* Logo */}
      <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
        <ShieldCheck className="w-5 h-5 text-white" />
      </div>

      {/* Brand Text */}
      <div className="hidden md:block">
        <span className="font-bold text-sm text-white tracking-tight block whitespace-nowrap">
          CREDORA
        </span>
      </div>
    </Link>
  )}

  {/* Desktop Collapse / Expand Button */}
  <button
    onClick={onToggleCollapse}
    className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
  >
    {isCollapsed ? (
      <PanelLeftOpen className="w-5 h-5" />
    ) : (
      <PanelLeftClose className="w-5 h-5" />
    )}
  </button>

  {/* Mobile: Logo + Brand + Close */}
  <div className="flex items-center justify-between w-full md:hidden">
    <Link
      to=""
      className="flex items-center gap-2.5"
    >
      <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
        <ShieldCheck className="w-5 h-5 text-white" />
      </div>

      <span className="font-bold text-sm text-white tracking-tight">
        CREDORA
      </span>
    </Link>

    <button
      onClick={onClose}
      className="p-1 rounded-lg text-slate-400 hover:text-white"
    >
      <X className="w-5 h-5" />
    </button>
  </div>
</div>

        {/* Current Portal Badge */}
        <div className="px-4 pt-4 pb-2">
          <div
            className={`
              px-3 py-2 rounded-xl
              bg-slate-950/70 border border-slate-800
              flex items-center
              transition-all
              ${isCollapsed ? 'md:justify-center' : 'justify-between'}
            `}
            title={
              isCollapsed
                ? currentRole === 'customer'
                  ? 'Identity Wallet'
                  : currentRole === 'issuer'
                  ? 'Issuer Console'
                  : 'Verifier Console'
                : undefined
            }
          >
            {/* Portal Name */}
            {!isCollapsed && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden md:block whitespace-nowrap">
                {currentRole === 'customer'
                  ? 'Identity Wallet'
                  : currentRole === 'issuer'
                  ? 'Issuer Console'
                  : 'Verifier Console'}
              </span>
            )}

            {/* Mobile Portal Name */}
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 md:hidden">
              {currentRole === 'customer'
                ? 'Identity Wallet'
                : currentRole === 'issuer'
                ? 'Issuer Console'
                : 'Verifier Console'}
            </span>

            {/* Status */}
            <span className="w-2 h-2 shrink-0 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={
                  item.path === '/customer' ||
                  item.path === '/bank/issuer' ||
                  item.path === '/bank/verifier'
                }
                onClick={() => {
                  if (window.innerWidth < 768) {
                    onClose();
                  }
                }}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `
                  flex items-center
                  rounded-xl
                  text-sm font-medium
                  transition-all duration-200

                  ${isCollapsed ? 'md:justify-center' : 'gap-3'}

                  gap-3
                  px-3.5 py-2.5

                  ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm shadow-cyan-950'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }
                `
                }
              >
                <Icon className="w-4 h-4 shrink-0" />

                {/* Navigation Text */}
                <span
                  className={`
                    whitespace-nowrap
                    ${isCollapsed ? 'md:hidden' : ''}
                  `}
                >
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        </div>
      </aside>
    </>
  );
};


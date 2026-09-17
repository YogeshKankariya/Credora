import React from 'react';
import { useKYC } from '../../context/KYCContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Users, FileCheck, Award, ShieldAlert, Activity, ArrowRight, CheckCircle2, PlusCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const IssuerOverview = () => {
  const { currentBank, users, credentials } = useKYC();

  // Compute live counts or mix with realistic enterprise bank numbers
  const verifiedCount = users.filter((u) => u.kycStatus === 'Verified').length;
  const activeCreds = credentials.filter((c) => c.status === 'ACTIVE').length;
  const revokedCreds = credentials.filter((c) => c.status === 'REVOKED').length;

  const activities = [
    { type: 'VERIFIED', subject: 'Rahul Sharma', time: '2 min ago', desc: 'Biometric document verification passed' },
    { type: 'ISSUED', subject: 'Priya Mehta', time: '8 min ago', desc: 'W3C Tier-1 Verifiable Credential minted' },
    { type: 'REVOKED', subject: 'Amit Shah', time: '32 min ago', desc: 'Revocation broadcast to blockchain registry' },
    { type: 'VERIFIED', subject: 'Sneha Patil', time: '1 hour ago', desc: 'Government photo ID authenticity confirmed' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card rounded-2xl p-6 border border-slate-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
            INSTITUTIONAL ISSUING AUTHORITY
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">{currentBank.name}</h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Issuer DID:</span>
            <span className="font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {currentBank.did}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/bank/issuer/customers"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-900/30 transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Manage Customers</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Customers"
          value="1,284"
          subtitle="Registered accounts"
          icon={Users}
          color="blue"
          trend="+12 this week"
        />
        <StatCard
          title="KYC Verified"
          value="1,102"
          subtitle="85.8% verification rate"
          icon={FileCheck}
          color="emerald"
        />
        <StatCard
          title="Active Credentials"
          value={(1047 + (activeCreds - 3)).toLocaleString()}
          subtitle="On-chain anchored"
          icon={Award}
          color="cyan"
        />
        <StatCard
          title="Revoked"
          value={(55 + revokedCreds).toLocaleString()}
          subtitle="Registry flagged"
          icon={ShieldAlert}
          color="rose"
        />
      </div>

      {/* Main Sections: Recent Activity & Quick KYC Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity Feed */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <h3 className="text-base font-bold text-white">Recent Activity</h3>
            </div>
            <Link
              to="/bank/issuer/activity"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <span>View Audit Trail</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {activities.map((act, index) => {
              const isIssued = act.type === 'ISSUED';
              const isRevoked = act.type === 'REVOKED';

              return (
                <div key={index} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIssued
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : isRevoked
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {isIssued ? (
                        <Award className="w-4 h-4" />
                      ) : isRevoked ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{act.subject}</span>
                        <StatusBadge status={act.type} size="sm" />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{act.desc}</p>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-500 shrink-0">{act.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Quick Pending Review Box */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Pending KYC Audits</h3>
              <StatusBadge status="PENDING" />
            </div>

            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Customers waiting for institutional document audit and cryptographic credential issuance.
            </p>

            <div className="mt-4 space-y-2.5">
              {users
                .filter((u) => u.kycStatus === 'Pending')
                .map((u) => (
                  <div
                    key={u.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{u.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{u.id}</span>
                    </div>
                    <Link
                      to={`/bank/issuer/kyc/${u.id}`}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold"
                    >
                      Audit
                    </Link>
                  </div>
                ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <Link
              to="/bank/issuer/customers"
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span>View All 1,284 Customers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

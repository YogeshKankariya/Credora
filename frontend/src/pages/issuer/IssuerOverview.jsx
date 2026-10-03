import React from 'react';
import { useKYC } from '../../context/KYCContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Users, FileCheck, Award, ShieldAlert, Activity, ArrowRight, CheckCircle2, PlusCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
export const IssuerOverview = () => {
  const { currentBank, users, credentials, verificationHistory } = useKYC();

  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  const totalCustomers = users.length;
  const verifiedCount = users.filter((u) => u.kycStatus === 'Verified').length;
  const pendingUsers = users.filter((u) => u.kycStatus === 'Pending');

  const bankCreds = credentials.filter(
    (c) => !c.issuerDid || c.issuerDid === currentBank.did
  );
  const activeCreds = bankCreds.filter((c) => c.status === 'ACTIVE').length;
  const revokedCreds = bankCreds.filter((c) => c.status === 'REVOKED').length;

  const newThisWeek = users.filter(
    (u) => u.createdAt && Date.now() - new Date(u.createdAt).getTime() < WEEK_MS
  ).length;

  const verificationRate = totalCustomers
    ? ((verifiedCount / totalCustomers) * 100).toFixed(1)
    : '0.0';

  const activities = verificationHistory.slice(0, 5).map((h) => ({
    type: h.result,
    subject: h.subject,
    desc: h.purpose,
    time: h.timestamp,
  }));


  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card rounded-2xl p-6 border border-slate-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
            INSTITUTIONAL ISSUING AUTHORITY
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">{currentBank.name}</h2>
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
          value={totalCustomers.toLocaleString()}
          subtitle="Registered accounts"
          icon={Users}
          color="blue"
          trend={newThisWeek > 0 ? `+${newThisWeek} this week` : undefined}
        />
        <StatCard
          title="KYC Verified"
          value={verifiedCount.toLocaleString()}
          subtitle={`${verificationRate}% verification rate`}
          icon={FileCheck}
          color="emerald"
        />
        <StatCard
          title="Active Credentials"
          value={activeCreds.toLocaleString()}
          subtitle="On-chain anchored"
          icon={Award}
          color="cyan"
        />
        <StatCard
          title="Revoked"
          value={revokedCreds.toLocaleString()}
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
                      {activities.length === 0 && (
              <p className="py-6 text-xs text-slate-500 text-center">No activity yet.</p>
            )}
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
              {pendingUsers.length === 0 && (
                <p className="text-xs text-slate-500">No customers awaiting review.</p>
              )}
              {pendingUsers.map((u) => (
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
              <span>View All {totalCustomers.toLocaleString()} Customers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useKYC } from '../../context/KYCContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Search, Filter, Eye, FileCheck, Award, UserPlus, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const CustomerList = () => {
  const { users, credentials } = useKYC();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const navigate = useNavigate();

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.did.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'ALL') return matchesSearch;
    if (filterStatus === 'VERIFIED') return matchesSearch && u.kycStatus === 'Verified';
    if (filterStatus === 'PENDING') return matchesSearch && u.kycStatus === 'Pending';
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
            CUSTOMER DIRECTORY & REGISTRY
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Customers</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search, review, verify KYC compliance, and issue tamper-proof credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/bank/issuer/credentials"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            View Issued Credentials
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, ID, or DID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">KYC Verified</option>
            <option value="PENDING">Pending Audit</option>
          </select>
        </div>
      </div>

      {/* Customers Data Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-semibold tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Customer ID</th>
                <th className="py-3.5 px-4">KYC Status</th>
                <th className="py-3.5 px-4">Credential</th>
                <th className="py-3.5 px-4">Issued Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No customers found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const cred = credentials.find((c) => c.customerId === u.id);
                  const isVerified = u.kycStatus === 'Verified';
                  const hasCred = !!cred;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <span className="font-bold text-white block">{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {u.did.slice(0, 18)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300 font-medium">
                        {u.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={u.kycStatus} />
                      </td>

                      <td className="py-3.5 px-4 font-mono text-cyan-300">
                        {hasCred ? cred.id : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {hasCred ? cred.issuedDate : '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        {hasCred ? (
                          <StatusBadge status={cred.status} />
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/bank/issuer/kyc/${u.id}`}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                          >
                            View
                          </Link>

                          {!isVerified ? (
                            <Link
                              to={`/bank/issuer/kyc/${u.id}`}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                            >
                              Verify KYC
                            </Link>
                          ) : !hasCred ? (
                            <Link
                              to={`/bank/issuer/kyc/${u.id}`}
                              className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors"
                            >
                              Issue Credential
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

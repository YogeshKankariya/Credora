import React, { useState } from 'react';
import { useKYC } from '../../context/KYCContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  Award,
  ShieldAlert,
  Search,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const IssuedCredentials = () => {
  const { credentials, revokeCredential } = useKYC();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCredForRevoke, setSelectedCredForRevoke] = useState(null);
  const [revokeReason, setRevokeReason] = useState('Customer account closure / compliance refresh');
  const [viewingCred, setViewingCred] = useState(null);
  const navigate = useNavigate();

  const filteredCredentials = credentials.filter(
    (c) =>
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirmRevocation = () => {
    if (!selectedCredForRevoke) return;
    revokeCredential(selectedCredForRevoke.id, revokeReason);
    setSelectedCredForRevoke(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
            DECENTRALIZED CREDENTIAL REGISTRY
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Issued Credentials
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor, inspect cryptographic proofs, and manage active or revoked credentials.
          </p>
        </div>

        <Link
          to="/bank/issuer/revocations"
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
        >
          View Revocation Registry
        </Link>
      </div>

      {/* Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search credentials by ID, customer name, or status..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Credentials Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-semibold tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Credential ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4">Expiry</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Verifications</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCredentials.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No credentials found.
                  </td>
                </tr>
              ) : (
                filteredCredentials.map((cred) => {
                  const isRevoked = cred.status === 'REVOKED';

                  return (
                    <tr key={cred.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                        {cred.id}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white">
                        {cred.subject}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {cred.issuedDate}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {cred.expiryDate}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={cred.status} />
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-emerald-400">
                        {cred.verificationCount} checks
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingCred(cred)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                          >
                            View
                          </button>

                          {!isRevoked ? (
                            <button
                              onClick={() => setSelectedCredForRevoke(cred)}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors"
                            >
                              Revoke
                            </button>
                          ) : (
                            <span className="text-[11px] text-rose-400/70 italic px-2">
                              Revoked
                            </span>
                          )}
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

      {/* Revocation Modal (Req 17) */}
      <Modal
        isOpen={!!selectedCredForRevoke}
        onClose={() => setSelectedCredForRevoke(null)}
        title="Revoke Credential"
        subtitle="Cryptographic on-chain revocation broadcast"
      >
        {selectedCredForRevoke && (
          <div className="space-y-4 text-xs">
            {/* Warning Callout */}
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-rose-300 block">Critical Warning:</span>
                <p className="leading-relaxed">
                  Revoking this credential will cause future verification attempts to fail.
                </p>
              </div>
            </div>

            {/* Credential Details */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Credential:</span>
                <span className="font-mono text-cyan-300 font-bold">{selectedCredForRevoke.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="text-white font-semibold">{selectedCredForRevoke.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <StatusBadge status={selectedCredForRevoke.status} size="sm" />
              </div>
            </div>

            {/* Reason selector */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Reason for Revocation
              </label>
              <select
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="Customer account closure / compliance refresh">Customer account closure / compliance refresh</option>
                <option value="Compromised device keypair reported">Compromised device keypair reported</option>
                <option value="Identity information superseded">Identity information superseded</option>
                <option value="Regulatory audit revocation directive">Regulatory audit revocation directive</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setSelectedCredForRevoke(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevocation}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-900/30 transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Revoke Credential</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Credential Details View Modal */}
      <Modal
        isOpen={!!viewingCred}
        onClose={() => setViewingCred(null)}
        title="Credential Dossier"
        subtitle="Cryptographic signature and metadata audit"
      >
        {viewingCred && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Subject</span>
                <span className="font-bold text-white text-sm mt-0.5 block">{viewingCred.subject}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Status</span>
                <div className="mt-1">
                  <StatusBadge status={viewingCred.status} />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] space-y-2">
              <div>
                <span className="text-slate-500 block">Blockchain Tx Hash</span>
                <span className="text-slate-300 break-all">{viewingCred.blockchainTxHash}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Signature</span>
                <span className="text-cyan-400 break-all">{viewingCred.signature}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Payload Hash</span>
                <span className="text-emerald-400 break-all">{viewingCred.credentialHash}</span>
              </div>
            </div>

            <button
              onClick={() => {
                const credId = viewingCred.id;
                setViewingCred(null);
                navigate(`/bank/verifier/verify?credId=${credId}`);
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2"
            >
              <span>Test Verify in Bank Verifier Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

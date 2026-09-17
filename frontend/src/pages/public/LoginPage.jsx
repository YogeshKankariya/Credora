import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  User,
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  KeyRound
} from 'lucide-react';

export const LoginPage = () => {
  const [role, setRole] = useState('individual'); // 'individual' | 'bank'
  const [showPassword, setShowPassword] = useState(false);

  // Form states (purely visual)
  const [email, setEmail] = useState('');
  const [bankId, setBankId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Visual UI only - no authentication logic or API calls
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setPassword('');
  };

  const isIndividual = role === 'individual';

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 max-w-md mx-auto w-full relative">
      {/* Background Decorative Glow */}
      <div
        className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
          isIndividual ? 'bg-cyan-500/10' : 'bg-blue-600/10'
        }`}
      />

      {/* Main Login Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 relative z-10 shadow-2xl backdrop-blur-xl">
        {/* Top Header Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SECURE ACCESS</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
            Sign in to your Digital Identity account
          </p>
        </div>

        {/* Role Toggle: [ Individual ] [ Bank ] */}
        <div className="mb-6">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-2 text-center">
            Select Account Type
          </label>
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => handleRoleChange('individual')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isIndividual
                  ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-md shadow-cyan-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Individual</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('bank')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                !isIndividual
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Bank</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isIndividual ? (
            /* Individual: Email Field */
            <div>
              <label
                htmlFor="individual-email"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="individual-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-all"
                  autoComplete="email"
                />
              </div>
            </div>
          ) : (
            /* Bank: Bank ID Field */
            <div>
              <label
                htmlFor="bank-id"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Bank ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  id="bank-id"
                  type="text"
                  value={bankId}
                  onChange={(e) => setBankId(e.target.value)}
                  placeholder="Enter your Bank ID"
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-all"
                  autoComplete="username"
                />
              </div>
            </div>
          )}

          {/* Password Field (Common to both roles) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-300"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={`w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-11 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
                  isIndividual
                    ? 'focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40'
                    : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40'
                }`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-lg transition-all duration-200 cursor-pointer ${
                isIndividual
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-950/50 hover:shadow-cyan-500/20'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-950/50 hover:shadow-blue-500/20'
              }`}
            >
              <span>Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Individual: Register prompt */}
        {isIndividual && (
          <div className="mt-6 text-center text-xs text-slate-400">
            <span>Don't have an account? </span>
            <Link
            to="/signin-page"
            className="text-cyan-400 hover:text-cyan-300 font-semibold hover:underline cursor-pointer transition-colors">
              Register
              </Link>
          </div>
        )}

        {/* Security Footer Note */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <KeyRound className="w-3.5 h-3.5 text-slate-400" />
          <span>Cryptographically Secured • Digital Identity Protocol</span>
        </div>
      </div>
    </div>
  );
};


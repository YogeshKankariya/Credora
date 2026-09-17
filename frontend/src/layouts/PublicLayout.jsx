import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { DemoBanner } from '../components/common/DemoBanner';
import { ToastContainer } from '../components/common/Toast';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <DemoBanner />
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-400">
        <p>Decentralized Banking Identity & KYC Verification Platform • Prototype Demo</p>
        <p className="text-[11px] text-slate-400 mt-1">Verify Once, Trust Many Times • Synthetic Data Only</p>
      </footer>
      <ToastContainer />
    </div>
  );
};

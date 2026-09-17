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
        <p>CREDORA • Prototype Demo</p>
      </footer>
      <ToastContainer />
    </div>
  );
};

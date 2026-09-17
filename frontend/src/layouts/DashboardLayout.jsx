import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Topbar } from '../components/common/Topbar';
import { DemoBanner } from '../components/common/DemoBanner';
import { ToastContainer } from '../components/common/Toast';

export const DashboardLayout = () => {
  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Desktop sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">

      {/* Demo Banner */}
      <DemoBanner />

      <div className="flex flex-1 relative">

        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() =>
            setSidebarCollapsed((prev) => !prev)
          }
        />

        {/* Main Area */}
        <div
          className={`
            flex-1
            flex flex-col
            min-w-0
            transition-all
            duration-300
            ease-in-out

            ${
              sidebarCollapsed
                ? 'md:pl-20'
                : 'md:pl-64'
            }
          `}
        >
          {/* Topbar */}
          <Topbar
            onToggleSidebar={() =>
              setSidebarOpen((prev) => !prev)
            }
          />

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-8 bg-grid-pattern overflow-y-auto">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};


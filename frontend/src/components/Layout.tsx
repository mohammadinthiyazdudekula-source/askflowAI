import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, Sparkles } from 'lucide-react';

export const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#090d16] flex text-slate-100 antialiased overflow-hidden">
      {/* Responsive Left Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 h-screen overflow-hidden">
        {/* Mobile Top Header */}
        <header className="lg:hidden h-14 bg-[#0d1322]/80 backdrop-blur-md border-b border-slate-800/80 px-4 flex items-center justify-between flex-shrink-0 z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-sm text-white">AskFlow AI</span>
            </div>
          </div>
        </header>

        {/* Page Body View */}
        <main className="flex-1 overflow-y-auto relative flex flex-col bg-gradient-to-b from-[#090d16] via-[#0b101c] to-[#090d16]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

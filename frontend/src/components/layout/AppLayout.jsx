import { useState } from 'react';
import Sidebar from './Sidebar';

export default function AppLayout({ children, title, subtitle }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-[#080808] border-b border-[#161616] px-6 py-3 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h1 className="text-white font-semibold text-sm">{title}</h1>
            {subtitle && <p className="text-[#444] text-xs mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              LIVE
            </div>
            <input placeholder="Search users, sessions, events..." className="bg-[#111] border border-[#1a1a1a] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#333] w-64 focus:outline-none focus:border-indigo-500/50" />
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const nav = [
  { section: 'DASHBOARD', items: [
    { label: 'Security Overview', icon: '⬡', path: '/dashboard' },
    { label: 'Analytics', icon: '◈', path: '/analytics' },
    { label: 'Live Monitoring', icon: '◉', path: '/monitoring' },
  ]},
  { section: 'IDENTITY & ACCESS', items: [
    { label: 'Users', icon: '◻', path: '/users' },
    { label: 'Roles & Permissions', icon: '◈', path: '/roles' },
    { label: 'MFA Policies', icon: '◉', path: '/mfa-policies' },
  ]},
  { section: 'SESSIONS', items: [
    { label: 'Active Sessions', icon: '◉', path: '/sessions' },
    { label: 'Device Trust', icon: '◻', path: '/devices' },
    { label: 'Session Timeline', icon: '◈', path: '/timeline' },
  ]},
  { section: 'THREAT CENTER', items: [
    { label: 'Threat Feed', icon: '⬡', path: '/threats' },
    { label: 'Risk Engine', icon: '◈', path: '/risk' },
    { label: 'Incident Explorer', icon: '◉', path: '/incidents' },
  ]},
  { section: 'AUDIT & COMPLIANCE', items: [
    { label: 'Audit Logs', icon: '◻', path: '/audit' },
    { label: 'Access History', icon: '◈', path: '/history' },
  ]},
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();

  return (
    <aside className={`flex flex-col bg-[#080808] border-r border-[#161616] transition-all duration-200 ${collapsed ? 'w-14' : 'w-56'} min-h-screen sticky top-0`}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 py-4 border-b border-[#161616]">
        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs flex-shrink-0">🔐</div>
        {!collapsed && <span className="font-bold text-white text-sm truncate">Zero Trust AM</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-[#444] hover:text-white transition text-xs flex-shrink-0">
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* User badge */}
      {!collapsed && (
        <div className="mx-3 my-3 p-2.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600/30 rounded-full flex items-center justify-center text-xs text-indigo-400">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.username}</p>
              <p className="text-[#444] text-[10px] truncate">{user?.role?.replace('_',' ')}</p>
            </div>
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full ml-auto flex-shrink-0 animate-pulse" />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-4">
        {nav.map(({ section, items }) => (
          <div key={section}>
            {!collapsed && <p className="text-[#333] text-[9px] font-semibold tracking-widest px-2 mb-1">{section}</p>}
            {items.map(({ label, icon, path }) => {
              const active = location.pathname === path;
              return (
                <button key={path} onClick={() => navigate(path)}
                  className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs transition mb-0.5 ${active ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' : 'text-[#555] hover:text-white hover:bg-white/5'}`}>
                  <span className="text-sm flex-shrink-0">{icon}</span>
                  {!collapsed && <span className="truncate">{label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-[#161616]">
        <button onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-[#555] hover:text-red-400 hover:bg-red-400/10 transition">
          <span className="flex-shrink-0">⊗</span>
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}

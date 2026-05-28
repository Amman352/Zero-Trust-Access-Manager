import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { sessionsAPI } from '../services/api';

const riskBadge = s => s<20?'text-green-400 bg-green-400/10 border-green-400/20':s<50?'text-yellow-400 bg-yellow-400/10 border-yellow-400/20':s<80?'text-orange-400 bg-orange-400/10 border-orange-400/20':'text-red-400 bg-red-400/10 border-red-400/20';
const riskLabel = s => s<20?'LOW':s<50?'MEDIUM':s<80?'HIGH':'CRITICAL';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => sessionsAPI.list().then(r=>setSessions(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  useEffect(()=>{load();},[]);

  return (
    <AppLayout title="Active Sessions" subtitle={`${sessions.length} live connections`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>
          <span className="text-xs text-[#444]">Auto-refreshing</span>
        </div>
        <button onClick={load} className="text-xs text-indigo-400 border border-indigo-400/20 px-3 py-1.5 rounded-lg hover:bg-indigo-400/10 transition">Refresh</button>
      </div>

      {loading ? (
        <div className="text-center text-[#444] py-20 text-sm">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="bg-[#0a0a0a] border border-[#161616] rounded-xl p-12 text-center text-[#444] text-sm">No active sessions found</div>
      ) : (
        <div className="bg-[#0a0a0a] border border-[#161616] rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#161616]">
                {['Session ID','IP Address','Device','Risk','Trust','MFA','Created','Action'].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-[#444] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map(s=>(
                <tr key={s.id} className="border-b border-[#0f0f0f] hover:bg-white/[0.02] transition">
                  <td className="px-4 py-3 font-mono text-[#555]">{s.id.slice(0,10)}…</td>
                  <td className="px-4 py-3 text-slate-300">{s.ip_address||'—'}</td>
                  <td className="px-4 py-3 text-[#555] max-w-[160px] truncate">{s.user_agent?.split(' ')[0]||'Unknown'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${riskBadge(s.risk_score)}`}>{s.risk_score} {riskLabel(s.risk_score)}</span></td>
                  <td className="px-4 py-3 text-blue-400">{s.trust_score}</td>
                  <td className="px-4 py-3">{s.mfa_verified?<span className="text-green-400">✓ YES</span>:<span className="text-[#444]">— NO</span>}</td>
                  <td className="px-4 py-3 text-[#444]">{new Date(s.created_at).toLocaleTimeString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={async()=>{await sessionsAPI.revoke(s.id);load();}} className="text-red-400 hover:text-red-300 border border-red-400/20 hover:bg-red-400/10 px-2 py-1 rounded text-[10px] transition">Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}

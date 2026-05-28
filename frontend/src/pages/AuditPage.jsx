import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';

const events = [
  {id:1,action:'LOGIN_SUCCESS',user:'amman',ip:'127.0.0.1',risk:10,time:'2026-05-28 12:01:33',sev:'LOW'},
  {id:2,action:'MFA_CHALLENGE_SUCCESS',user:'amman',ip:'127.0.0.1',risk:5,time:'2026-05-28 12:01:35',sev:'LOW'},
  {id:3,action:'TOKEN_REFRESHED',user:'amman',ip:'127.0.0.1',risk:8,time:'2026-05-28 11:44:12',sev:'LOW'},
  {id:4,action:'LOGIN_FAILED',user:'unknown',ip:'192.168.1.1',risk:65,time:'2026-05-28 10:22:01',sev:'HIGH'},
  {id:5,action:'LOGIN_FAILED',user:'unknown',ip:'192.168.1.1',risk:65,time:'2026-05-28 10:21:58',sev:'HIGH'},
  {id:6,action:'SESSION_REVOKED',user:'amman',ip:'127.0.0.1',risk:0,time:'2026-05-28 09:10:00',sev:'LOW'},
  {id:7,action:'USER_CREATED',user:'amman',ip:'127.0.0.1',risk:0,time:'2026-05-28 08:00:00',sev:'LOW'},
  {id:8,action:'SUSPICIOUS_ACTIVITY',user:'unknown',ip:'45.33.x.x',risk:85,time:'2026-05-27 23:44:01',sev:'CRITICAL'},
];

const sevCls = {LOW:'text-green-400 bg-green-400/10 border-green-400/20',MEDIUM:'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',HIGH:'text-orange-400 bg-orange-400/10 border-orange-400/20',CRITICAL:'text-red-400 bg-red-400/10 border-red-400/20'};

export default function AuditPage() {
  const [filter, setFilter] = useState('ALL');
  const filters = ['ALL','LOW','MEDIUM','HIGH','CRITICAL'];
  const filtered = filter==='ALL'?events:events.filter(e=>e.sev===filter);

  return (
    <AppLayout title="Audit Log Explorer" subtitle="All security events · Filterable by severity">
      <div className="flex items-center gap-2 mb-4">
        {filters.map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition ${filter===f?'bg-indigo-600 text-white border-indigo-600':'text-[#444] border-[#161616] hover:text-white hover:border-[#333]'}`}>
            {f}
          </button>
        ))}
        <span className="ml-auto text-xs text-[#444]">{filtered.length} events</span>
      </div>

      <div className="bg-[#0a0a0a] border border-[#161616] rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#161616]">
              {['Severity','Event','User','IP Address','Risk Score','Timestamp'].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-[#444] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(e=>(
              <tr key={e.id} className="border-b border-[#0f0f0f] hover:bg-white/[0.02] transition">
                <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${sevCls[e.sev]}`}>{e.sev}</span></td>
                <td className="px-4 py-3 font-mono text-slate-300">{e.action}</td>
                <td className="px-4 py-3 text-[#555]">{e.user}</td>
                <td className="px-4 py-3 text-[#555]">{e.ip}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-[#161616] rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{width:`${e.risk}%`,background:e.risk<20?'#22c55e':e.risk<50?'#f59e0b':e.risk<80?'#f97316':'#ef4444'}}/>
                    </div>
                    <span className="text-[#555]">{e.risk}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#444] font-mono">{e.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}

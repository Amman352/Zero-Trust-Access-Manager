import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';

const initialThreats = [
  {id:1,sev:'HIGH',title:'Impossible Travel Detected',desc:'Login from Mumbai (IN) and Frankfurt (DE) within 10 minutes — physically impossible.',time:'2m ago',ip:'185.42.x.x',status:'ACTIVE'},
  {id:2,sev:'HIGH',title:'Brute Force Pattern',desc:'12 failed login attempts from single IP in 3 minutes. Automatic block triggered.',time:'18m ago',ip:'45.33.x.x',status:'BLOCKED'},
  {id:3,sev:'MEDIUM',title:'New Device Fingerprint',desc:'Unrecognized browser fingerprint on verified account. MFA challenge issued.',time:'34m ago',ip:'192.168.1.5',status:'MONITORING'},
  {id:4,sev:'MEDIUM',title:'Unusual Login Hour',desc:'Login at 03:14 AM — outside normal behavior window for this user.',time:'2h ago',ip:'127.0.0.1',status:'RESOLVED'},
  {id:5,sev:'LOW',title:'Session Near Expiry',desc:'Token expires in 5 minutes. User notified for re-authentication.',time:'3h ago',ip:'127.0.0.1',status:'RESOLVED'},
];

const sevCls = {HIGH:'text-red-400 border-red-400/30 bg-red-400/5',MEDIUM:'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',LOW:'text-green-400 border-green-400/30 bg-green-400/5'};
const statusCls = {ACTIVE:'text-red-400 bg-red-400/10',BLOCKED:'text-orange-400 bg-orange-400/10',MONITORING:'text-yellow-400 bg-yellow-400/10',RESOLVED:'text-green-400 bg-green-400/10'};

export default function ThreatPage() {
  const [threats, setThreats] = useState(initialThreats);
  const [tick, setTick] = useState(0);
  useEffect(()=>{ const t = setInterval(()=>setTick(x=>x+1),5000); return ()=>clearInterval(t); },[]);

  return (
    <AppLayout title="Threat Feed" subtitle="Real-time security threat intelligence">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-xs">
          {['ALL','HIGH','MEDIUM','LOW'].map(s=>(
            <button key={s} className="text-[#555] hover:text-white transition">{s}</button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-red-400">
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"/>
          LIVE · Updated {tick * 5}s ago
        </div>
      </div>

      <div className="space-y-3">
        {threats.map(({id,sev,title,desc,time,ip,status})=>(
          <div key={id} className={`border rounded-xl p-5 ${sevCls[sev]}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sevCls[sev]}`}>{sev}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusCls[status]}`}>{status}</span>
                  <span className="text-[#444] text-xs">{time}</span>
                </div>
                <h3 className="text-white text-sm font-semibold mb-1">{title}</h3>
                <p className="text-[#666] text-xs leading-relaxed">{desc}</p>
                <p className="text-[#444] text-xs mt-2 font-mono">Source IP: {ip}</p>
              </div>
              {status === 'ACTIVE' && (
                <button onClick={()=>setThreats(ts=>ts.map(t=>t.id===id?{...t,status:'BLOCKED'}:t))}
                  className="text-xs text-red-400 border border-red-400/30 px-3 py-1.5 rounded-lg hover:bg-red-400/10 transition flex-shrink-0">
                  Block
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}

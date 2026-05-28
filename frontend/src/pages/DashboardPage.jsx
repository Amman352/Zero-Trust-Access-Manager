import { useEffect, useState } from 'react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AppLayout from '../components/layout/AppLayout';
import useAuthStore from '../store/authStore';
import { sessionsAPI } from '../services/api';

const riskData = [
  {t:'00:00',v:12},{t:'03:00',v:8},{t:'06:00',v:15},{t:'09:00',v:62},
  {t:'11:00',v:35},{t:'13:00',v:28},{t:'15:00',v:45},{t:'17:00',v:32},
  {t:'19:00',v:18},{t:'21:00',v:22},{t:'23:00',v:14},
];
const loginData = [
  {d:'Mon',ok:12,fail:2},{d:'Tue',ok:18,fail:5},{d:'Wed',ok:9,fail:1},
  {d:'Thu',ok:24,fail:8},{d:'Fri',ok:20,fail:3},{d:'Sat',ok:5,fail:1},{d:'Sun',ok:8,fail:0},
];
const threatFeed = [
  {id:1,sev:'HIGH',msg:'Impossible travel detected — login from 2 countries in 10min',time:'2m ago',ip:'185.42.x.x'},
  {id:2,sev:'MEDIUM',msg:'New browser fingerprint on existing account',time:'14m ago',ip:'127.0.0.1'},
  {id:3,sev:'LOW',msg:'Failed MFA attempt — 1 of 3 allowed',time:'31m ago',ip:'192.168.1.5'},
  {id:4,sev:'HIGH',msg:'Brute force pattern detected — 12 failed attempts',time:'1h ago',ip:'45.33.x.x'},
  {id:5,sev:'LOW',msg:'Session approaching expiry threshold',time:'2h ago',ip:'127.0.0.1'},
];
const sevCls = {HIGH:'text-red-400 bg-red-400/10 border-red-400/30',MEDIUM:'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',LOW:'text-green-400 bg-green-400/10 border-green-400/30'};
const pieData = [{name:'Low',value:58,color:'#22c55e'},{name:'Medium',value:27,color:'#f59e0b'},{name:'High',value:12,color:'#f97316'},{name:'Critical',value:3,color:'#ef4444'}];

export default function DashboardPage() {
  const { user, fetchMe, riskScore, riskLevel } = useAuthStore();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (!user) fetchMe();
    sessionsAPI.list().then(r => setSessions(r.data)).catch(() => {});
  }, []);

  const riskCls = riskScore < 20 ? 'text-green-400' : riskScore < 50 ? 'text-yellow-400' : riskScore < 80 ? 'text-orange-400' : 'text-red-400';

  return (
    <AppLayout title="Security Overview" subtitle={`Welcome back, ${user?.full_name || user?.username} · ${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}`}>
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          {label:'Current Risk Score',value:`${riskScore||0}/100`,sub:riskLevel?.toUpperCase()||'LOW',cls:riskCls,icon:'⬡'},
          {label:'Active Sessions',value:sessions.length||'0',sub:'Live connections',cls:'text-blue-400',icon:'◉'},
          {label:'MFA Status',value:user?.mfa_enabled?'ENABLED':'DISABLED',sub:user?.mfa_enabled?'Protected':'Action required',cls:user?.mfa_enabled?'text-green-400':'text-yellow-400',icon:'◈'},
          {label:'Account Role',value:user?.role?.replace('_',' ').toUpperCase()||'USER',sub:'Access level',cls:'text-indigo-400',icon:'◻'},
        ].map(({label,value,sub,cls,icon})=>(
          <div key={label} className="bg-[#0a0a0a] border border-[#161616] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#444] text-xs">{label}</span>
              <span className="text-[#333] text-base">{icon}</span>
            </div>
            <p className={`text-2xl font-bold ${cls}`}>{value}</p>
            <p className="text-[#444] text-xs mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Risk trend */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#161616] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white text-sm font-semibold">Risk Score Trend</h3>
              <p className="text-[#444] text-xs mt-0.5">Last 24 hours</p>
            </div>
            <span className="text-xs text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 px-2 py-1 rounded-full">Today</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={riskData}>
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#161616"/>
              <XAxis dataKey="t" stroke="#333" tick={{fontSize:10,fill:'#444'}}/>
              <YAxis stroke="#333" tick={{fontSize:10,fill:'#444'}} domain={[0,100]}/>
              <Tooltip contentStyle={{background:'#111',border:'1px solid #222',borderRadius:8,fontSize:11}}/>
              <Area type="monotone" dataKey="v" stroke="#6366f1" fill="url(#rg)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk distribution */}
        <div className="bg-[#0a0a0a] border border-[#161616] rounded-xl p-5">
          <h3 className="text-white text-sm font-semibold mb-1">Risk Distribution</h3>
          <p className="text-[#444] text-xs mb-4">All sessions</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" strokeWidth={0}>
                {pieData.map((entry,i)=><Cell key={i} fill={entry.color}/>)}
              </Pie>
              <Tooltip contentStyle={{background:'#111',border:'1px solid #222',borderRadius:8,fontSize:11}}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {pieData.map(({name,value,color})=>(
              <div key={name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:color}}/>
                <span className="text-[#555] text-xs">{name}</span>
                <span className="text-white text-xs ml-auto">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Login activity + threat feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Login activity */}
        <div className="bg-[#0a0a0a] border border-[#161616] rounded-xl p-5">
          <h3 className="text-white text-sm font-semibold mb-1">Login Activity</h3>
          <p className="text-[#444] text-xs mb-4">Success vs Failed · This week</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={loginData} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#161616"/>
              <XAxis dataKey="d" stroke="#333" tick={{fontSize:10,fill:'#444'}}/>
              <YAxis stroke="#333" tick={{fontSize:10,fill:'#444'}}/>
              <Tooltip contentStyle={{background:'#111',border:'1px solid #222',borderRadius:8,fontSize:11}}/>
              <Bar dataKey="ok" fill="#6366f1" radius={[2,2,0,0]}/>
              <Bar dataKey="fail" fill="#ef4444" radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-indigo-500 rounded-full"/><span className="text-xs text-[#555]">Success</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-red-500 rounded-full"/><span className="text-xs text-[#555]">Failed</span></div>
          </div>
        </div>

        {/* Threat feed */}
        <div className="bg-[#0a0a0a] border border-[#161616] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white text-sm font-semibold">Live Threat Feed</h3>
              <p className="text-[#444] text-xs mt-0.5">Real-time security events</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-red-400">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"/>LIVE
            </div>
          </div>
          <div className="space-y-2 overflow-y-auto max-h-[170px]">
            {threatFeed.map(({id,sev,msg,time,ip})=>(
              <div key={id} className="flex items-start gap-2.5 p-2.5 bg-[#0f0f0f] border border-[#161616] rounded-lg">
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold flex-shrink-0 mt-0.5 ${sevCls[sev]}`}>{sev}</span>
                <div className="min-w-0">
                  <p className="text-xs text-slate-300 leading-snug">{msg}</p>
                  <p className="text-[10px] text-[#444] mt-1">{ip} · {time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profile + recent events row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#0a0a0a] border border-[#161616] rounded-xl p-5">
          <h3 className="text-white text-sm font-semibold mb-4">Identity</h3>
          {[
            {label:'Full Name',value:user?.full_name||'—'},
            {label:'Username',value:`@${user?.username}`},
            {label:'Email',value:user?.email},
            {label:'Member Since',value:user?.created_at?new Date(user.created_at).toLocaleDateString():'—'},
            {label:'Status',value:user?.status?.toUpperCase()||'ACTIVE'},
          ].map(({label,value})=>(
            <div key={label} className="flex items-center justify-between py-2 border-b border-[#111] last:border-0">
              <span className="text-[#444] text-xs">{label}</span>
              <span className="text-white text-xs font-medium">{value}</span>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#161616] rounded-xl p-5">
          <h3 className="text-white text-sm font-semibold mb-4">Security Signals</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              {label:'Threats Blocked',value:'3',sub:'Last 24h',color:'text-red-400'},
              {label:'MFA Challenges',value:'12',sub:'This week',color:'text-yellow-400'},
              {label:'Avg Session Duration',value:'47m',sub:'Last 30 days',color:'text-blue-400'},
              {label:'Trust Score',value:`${100-(riskScore||0)}%`,sub:'Current session',color:'text-green-400'},
              {label:'Failed Logins',value:user?.failed_login_attempts||'0',sub:'Consecutive',color:'text-orange-400'},
              {label:'Active Sessions',value:sessions.length||'0',sub:'Right now',color:'text-indigo-400'},
            ].map(({label,value,sub,color})=>(
              <div key={label} className="p-3 bg-[#0f0f0f] border border-[#161616] rounded-lg">
                <p className="text-[#444] text-xs mb-1">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-[#333] text-[10px] mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

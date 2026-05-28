import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import AppLayout from '../components/layout/AppLayout';

const mfaData = [{m:'Jan',rate:45},{m:'Feb',rate:52},{m:'Mar',rate:61},{m:'Apr',rate:58},{m:'May',rate:73}];
const sessionDur = [{h:'00',avg:12},{h:'04',avg:8},{h:'08',avg:35},{h:'12',avg:48},{h:'16',avg:52},{h:'20',avg:28},{h:'23',avg:15}];
const riskTrend = [
  {d:'Mon',low:12,med:4,high:2},{d:'Tue',low:18,med:6,high:1},
  {d:'Wed',low:9,med:2,high:3},{d:'Thu',low:24,med:8,high:5},
  {d:'Fri',low:20,med:5,high:2},{d:'Sat',low:5,med:1,high:0},{d:'Sun',low:8,med:2,high:1},
];

export default function AnalyticsPage() {
  return (
    <AppLayout title="Security Analytics" subtitle="Trends, patterns and behavioral analysis">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          {label:'MFA Adoption Rate',value:'73%',delta:'+12% this month',color:'text-green-400'},
          {label:'Avg Risk Score',value:'24.3',delta:'-8.1 vs last week',color:'text-green-400'},
          {label:'Suspicious Logins',value:'3',delta:'Last 24 hours',color:'text-yellow-400'},
          {label:'Session Success Rate',value:'96.4%',delta:'+2.1% vs last week',color:'text-blue-400'},
        ].map(({label,value,delta,color})=>(
          <div key={label} className="bg-[#0a0a0a] border border-[#161616] rounded-xl p-4">
            <p className="text-[#444] text-xs mb-2">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-[#333] text-xs mt-1">{delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-[#0a0a0a] border border-[#161616] rounded-xl p-5">
          <h3 className="text-white text-sm font-semibold mb-1">MFA Adoption Trend</h3>
          <p className="text-[#444] text-xs mb-4">Monthly adoption rate</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={mfaData}>
              <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#161616"/>
              <XAxis dataKey="m" stroke="#333" tick={{fontSize:10,fill:'#444'}}/>
              <YAxis stroke="#333" tick={{fontSize:10,fill:'#444'}} domain={[0,100]}/>
              <Tooltip contentStyle={{background:'#111',border:'1px solid #222',borderRadius:8,fontSize:11}}/>
              <Area type="monotone" dataKey="rate" stroke="#22c55e" fill="url(#mg)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0a0a0a] border border-[#161616] rounded-xl p-5">
          <h3 className="text-white text-sm font-semibold mb-1">Risk by Severity</h3>
          <p className="text-[#444] text-xs mb-4">Daily breakdown this week</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={riskTrend} barSize={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#161616"/>
              <XAxis dataKey="d" stroke="#333" tick={{fontSize:10,fill:'#444'}}/>
              <YAxis stroke="#333" tick={{fontSize:10,fill:'#444'}}/>
              <Tooltip contentStyle={{background:'#111',border:'1px solid #222',borderRadius:8,fontSize:11}}/>
              <Bar dataKey="low" fill="#22c55e" radius={[2,2,0,0]}/>
              <Bar dataKey="med" fill="#f59e0b" radius={[2,2,0,0]}/>
              <Bar dataKey="high" fill="#ef4444" radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-[#161616] rounded-xl p-5">
        <h3 className="text-white text-sm font-semibold mb-1">Session Activity by Hour</h3>
        <p className="text-[#444] text-xs mb-4">Average session duration (minutes)</p>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={sessionDur}>
            <CartesianGrid strokeDasharray="3 3" stroke="#161616"/>
            <XAxis dataKey="h" stroke="#333" tick={{fontSize:10,fill:'#444'}}/>
            <YAxis stroke="#333" tick={{fontSize:10,fill:'#444'}}/>
            <Tooltip contentStyle={{background:'#111',border:'1px solid #222',borderRadius:8,fontSize:11}}/>
            <Line type="monotone" dataKey="avg" stroke="#6366f1" strokeWidth={2} dot={{fill:'#6366f1',r:3}}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </AppLayout>
  );
}

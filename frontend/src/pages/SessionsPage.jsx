import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sessionsAPI } from "../services/api";

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSessions = async () => {
    try {
      const res = await sessionsAPI.list();
      setSessions(res.data);
    } catch {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const revoke = async (id) => {
    await sessionsAPI.revoke(id);
    fetchSessions();
  };

  const riskBadge = (score) => {
    if (score < 20) return "bg-green-500/20 text-green-400";
    if (score < 50) return "bg-yellow-500/20 text-yellow-400";
    if (score < 80) return "bg-orange-500/20 text-orange-400";
    return "bg-red-500/20 text-red-400";
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-slate-400 hover:text-white flex items-center gap-2 text-sm"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-white font-bold">Active Sessions</h1>
        <div />
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center text-slate-400 py-20">
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-slate-400 py-20">
            No active sessions found.
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="bg-slate-800 rounded-xl p-5 border border-slate-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-white font-mono text-sm">
                        {s.id.slice(0, 8)}...
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${riskBadge(s.risk_score)}`}
                      >
                        Risk: {s.risk_score}
                      </span>
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs">
                        Trust: {s.trust_score}
                      </span>
                      {s.mfa_verified && (
                        <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-xs">
                          MFA ✓
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm">
                      📍 {s.ip_address || "Unknown IP"}
                    </p>
                    <p className="text-slate-500 text-xs mt-1 truncate max-w-lg">
                      {s.user_agent || "Unknown device"}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      Created: {new Date(s.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => revoke(s.id)}
                    className="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-sm transition ml-4"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

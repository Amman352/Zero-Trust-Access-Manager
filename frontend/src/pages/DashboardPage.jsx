import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function DashboardPage() {
  const { user, logout, fetchMe, riskScore, riskLevel } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) fetchMe();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const riskColor = {
    low: "bg-green-500/20 text-green-400 border-green-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const roleColor = {
    super_admin: "bg-purple-500/20 text-purple-400",
    admin: "bg-red-500/20 text-red-400",
    manager: "bg-blue-500/20 text-blue-400",
    user: "bg-slate-500/20 text-slate-400",
    viewer: "bg-gray-500/20 text-gray-400",
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navbar */}
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔐</span>
          <span className="text-white font-bold text-lg">
            Zero Trust Access Manager
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/sessions")}
            className="text-slate-400 hover:text-white text-sm transition"
          >
            Sessions
          </button>
          {user?.role === "admin" || user?.role === "super_admin" ? (
            <button
              onClick={() => navigate("/users")}
              className="text-slate-400 hover:text-white text-sm transition"
            >
              Users
            </button>
          ) : null}
          <button
            onClick={handleLogout}
            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-sm transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.full_name || user?.username} 👋
          </h1>
          <p className="text-slate-400 mt-1">Here's your security overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <p className="text-slate-400 text-sm">Role</p>
            <div
              className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${roleColor[user?.role] || "bg-slate-500/20 text-slate-400"}`}
            >
              {user?.role?.replace("_", " ").toUpperCase() || "—"}
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <p className="text-slate-400 text-sm">Status</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">
                {user?.status?.toUpperCase() || "ACTIVE"}
              </span>
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <p className="text-slate-400 text-sm">MFA Status</p>
            <p
              className={`mt-2 font-medium ${user?.mfa_enabled ? "text-green-400" : "text-yellow-400"}`}
            >
              {user?.mfa_enabled ? "✅ Enabled" : "⚠️ Disabled"}
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <p className="text-slate-400 text-sm">Session Risk</p>
            <div
              className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium border ${riskColor[riskLevel] || "bg-slate-500/20 text-slate-400 border-slate-500/30"}`}
            >
              {riskScore !== null
                ? `${riskScore} — ${riskLevel?.toUpperCase()}`
                : "N/A"}
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">
            Profile Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Full Name", value: user?.full_name || "—" },
              { label: "Username", value: user?.username },
              { label: "Email", value: user?.email },
              {
                label: "Member Since",
                value: user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "—",
              },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">{label}</p>
                <p className="text-white font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

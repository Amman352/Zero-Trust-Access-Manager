import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    full_name: "",
  });
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form);
    if (result.success) navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Zero Trust</h1>
          <p className="text-slate-400 mt-1">Create your account</p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4 text-sm">
              {typeof error === "string" ? error : JSON.stringify(error)}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              {
                key: "full_name",
                label: "Full Name",
                type: "text",
                placeholder: "John Doe",
              },
              {
                key: "username",
                label: "Username",
                type: "text",
                placeholder: "johndoe",
              },
              {
                key: "email",
                label: "Email",
                type: "email",
                placeholder: "you@example.com",
              },
              {
                key: "password",
                label: "Password",
                type: "password",
                placeholder: "••••••••",
              },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm text-slate-400 mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  placeholder={placeholder}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  required={key !== "full_name"}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

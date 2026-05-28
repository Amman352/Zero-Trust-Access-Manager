import { create } from "zustand";
import { authAPI } from "../services/api";

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("access_token"),
  isLoading: false,
  error: null,
  riskScore: null,
  riskLevel: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authAPI.login({
        email: email,
        password: password,
        device_fingerprint: null,
        totp_code: null,
      });
      const { access_token, refresh_token, risk_score, risk_level } = res.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      const meRes = await authAPI.me();
      set({
        token: access_token,
        user: meRes.data,
        riskScore: risk_score,
        riskLevel: risk_level,
        isLoading: false,
      });
      return { success: true };
    } catch (err) {
      set({
        error: err.response?.data?.detail || "Login failed",
        isLoading: false,
      });
      return { success: false };
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await authAPI.register(data);
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      set({
        error: err.response?.data?.detail || "Registration failed",
        isLoading: false,
      });
      return { success: false };
    }
  },

  fetchMe: async () => {
    try {
      const res = await authAPI.me();
      set({ user: res.data });
    } catch {
      set({ user: null, token: null });
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ user: null, token: null, riskScore: null, riskLevel: null });
  },
}));

export default useAuthStore;

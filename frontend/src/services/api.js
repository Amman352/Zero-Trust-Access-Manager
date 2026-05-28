import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export const authAPI = {
  register: (data) => api.post("/api/v1/auth/register", data),
  login: (data) => api.post("/api/v1/auth/login", data),
  me: () => api.get("/api/v1/auth/me"),
};

export const usersAPI = {
  list: () => api.get("/api/v1/users/"),
  getMe: () => api.get("/api/v1/users/me"),
  updateMe: (data) => api.patch("/api/v1/users/me", data),
};

export const sessionsAPI = {
  list: () => api.get("/api/v1/sessions/"),
  revoke: (id) => api.delete(`/api/v1/sessions/${id}`),
  revokeAll: () => api.delete("/api/v1/sessions/"),
};

export const mfaAPI = {
  setup: () => api.post("/api/v1/auth/mfa/setup"),
  verify: (totp_code) => api.post("/api/v1/auth/mfa/verify", { totp_code }),
  disable: (totp_code) => api.post("/api/v1/auth/mfa/disable", { totp_code }),
};

export default api;

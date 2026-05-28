import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SessionsPage from './pages/SessionsPage';
import AuditPage from './pages/AuditPage';
import ThreatPage from './pages/ThreatPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MonitoringPage from './pages/MonitoringPage';
import UsersPage from './pages/UsersPage';
import RolesPage from './pages/RolesPage';
import MFAPoliciesPage from './pages/MFAPoliciesPage';
import DevicesPage from './pages/DevicesPage';
import TimelinePage from './pages/TimelinePage';
import IncidentsPage from './pages/IncidentsPage';
import RiskPage from './pages/RiskPage';
import HistoryPage from './pages/HistoryPage';

function Private({ children }) {
  return localStorage.getItem('access_token') ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Private><DashboardPage /></Private>} />
        <Route path="/sessions" element={<Private><SessionsPage /></Private>} />
        <Route path="/audit" element={<Private><AuditPage /></Private>} />
        <Route path="/threats" element={<Private><ThreatPage /></Private>} />
        <Route path="/analytics" element={<Private><AnalyticsPage /></Private>} />
        <Route path="/monitoring" element={<Private><MonitoringPage /></Private>} />
        <Route path="/users" element={<Private><UsersPage /></Private>} />
        <Route path="/roles" element={<Private><RolesPage /></Private>} />
        <Route path="/mfa-policies" element={<Private><MFAPoliciesPage /></Private>} />
        <Route path="/devices" element={<Private><DevicesPage /></Private>} />
        <Route path="/timeline" element={<Private><TimelinePage /></Private>} />
        <Route path="/incidents" element={<Private><IncidentsPage /></Private>} />
        <Route path="/risk" element={<Private><RiskPage /></Private>} />
        <Route path="/history" element={<Private><HistoryPage /></Private>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

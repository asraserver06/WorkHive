import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, PublicOnlyRoute, RoleRoute } from './components/PrivateRoute';
import Navbar from './components/Navbar';
import './index.css';
import './App.css';

// Pages
import LandingPage         from './pages/LandingPage';
import AuthPage            from './pages/AuthPage';
import JobsPage            from './pages/JobsPage';
import JobDetailPage       from './pages/JobDetailPage';
import DashboardPage       from './pages/DashboardPage';
import ResumeAnalyzerPage  from './pages/ResumeAnalyzerPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ChatPage            from './pages/ChatPage';

// Simple 404
function NotFound() {
  return (
    <div className="loading-screen">
      <div style={{ fontSize: '64px' }}>404</div>
      <p style={{ color: 'var(--text-secondary)' }}>Page not found.</p>
      <a href="/" className="btn btn-primary" style={{ marginTop: '12px' }}>Go Home</a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/"     element={<LandingPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />

          {/* Auth (redirect to dashboard if already logged in) */}
          <Route path="/login"    element={<PublicOnlyRoute><AuthPage /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><AuthPage /></PublicOnlyRoute>} />

          {/* Private (any authenticated user) */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/chat"      element={<PrivateRoute><ChatPage /></PrivateRoute>} />

          {/* Private (student only) */}
          <Route path="/resume"          element={<RoleRoute roles={['student']}><ResumeAnalyzerPage /></RoleRoute>} />
          <Route path="/recommendations" element={<RoleRoute roles={['student']}><RecommendationsPage /></RoleRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>

        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'toast-custom',
            duration: 3500,
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

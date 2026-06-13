import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Briefcase, Eye, EyeOff, Loader } from 'lucide-react';

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [showPw, setShowPw] = useState(false);
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    let res;
    if (tab === 'login') {
      res = await login(form.email, form.password);
    } else {
      if (!form.name.trim()) return toast.error('Name is required');
      res = await register(form.name, form.email, form.password, form.role);
    }
    if (res.success) {
      toast.success(tab === 'login' ? 'Welcome back!' : 'Account created!');
      navigate('/dashboard');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
            <Briefcase size={24} style={{ color: 'var(--brand-400)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '22px' }}>WorkHive</span>
          </div>
          <p>{tab === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => setTab('login')}>Log In</button>
          <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => setTab('register')}>Sign Up</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Jane Doe" value={form.name} onChange={set('name')} required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="jane@example.com" value={form.email} onChange={set('email')} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                required
                minLength={6}
                style={{ paddingRight: '42px' }}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">I am a…</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['student', 'recruiter'].map(r => (
                  <label key={r} style={{ flex: 1, cursor: 'pointer' }}>
                    <input type="radio" name="role" value={r} checked={form.role === r} onChange={set('role')} style={{ display: 'none' }} />
                    <div className="card" style={{
                      textAlign: 'center', padding: '12px', cursor: 'pointer', transition: 'var(--transition)',
                      borderColor: form.role === r ? 'var(--brand-500)' : undefined,
                      background: form.role === r ? 'rgba(99,102,241,0.08)' : undefined,
                    }}>
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{r === 'student' ? '🎓' : '💼'}</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', textTransform: 'capitalize' }}>{r}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: '4px', padding: '13px' }}>
            {loading ? <Loader size={16} className="animate-spin" style={{ animation: 'spin 0.7s linear infinite' }} /> : null}
            {tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '20px' }}>
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
            style={{ background: 'none', border: 'none', color: 'var(--brand-400)', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
            {tab === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}

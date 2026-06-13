import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import { Briefcase, LogOut, User, ChevronDown, MessageSquare, LayoutDashboard, Star, FileText } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch global unread count
  useEffect(() => {
    if (user) {
      api.get('/chat/conversations')
        .then(r => setUnread(r.data.reduce((acc, c) => acc + (c.unreadCount || 0), 0)))
        .catch(console.error);
    }
  }, [user, location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        <Briefcase size={20} />
        WorkHive
        <span className="logo-dot" />
      </NavLink>

      <div className="navbar-links">
        <NavLink to="/jobs" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <Briefcase size={15} /> Jobs
        </NavLink>
        {user && (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <LayoutDashboard size={15} /> Dashboard
            </NavLink>
            {user.role === 'student' && (
              <>
                <NavLink to="/resume" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  <FileText size={15} /> Resume
                </NavLink>
                <NavLink to="/recommendations" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  <Star size={15} /> Matches
                </NavLink>
              </>
            )}
            <NavLink to="/chat" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} style={{ position: 'relative' }}>
              <MessageSquare size={15} /> Chat
              {unread > 0 && (
                <span className="badge badge-brand" style={{ position: 'absolute', top: '10px', right: '4px', fontSize: '9px', padding: '1px 4px', minWidth: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unread}
                </span>
              )}
            </NavLink>
          </>
        )}
      </div>

      <div className="navbar-right">
        {user ? (
          <div className="dropdown" ref={ref}>
            <button className="user-chip btn-ghost" onClick={() => setOpen(v => !v)}>
              <div className="user-avatar">{initials}</div>
              <span className="hide-mobile">{user.name.split(' ')[0]}</span>
              <span className="badge badge-brand hide-mobile" style={{ fontSize: '10px', padding: '2px 8px' }}>{user.role}</span>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
            {open && (
              <div className="dropdown-menu">
                <div style={{ padding: '8px 12px 6px', fontSize: '13px', color: 'var(--text-muted)' }}>{user.email}</div>
                <div className="dropdown-sep" />
                <button className="dropdown-item" onClick={() => { navigate('/dashboard'); setOpen(false); }}>
                  <LayoutDashboard size={15} /> Dashboard
                </button>
                <div className="dropdown-sep" />
                <button className="dropdown-item danger" onClick={handleLogout}>
                  <LogOut size={15} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Log in</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Sign up</button>
          </div>
        )}
      </div>
    </nav>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Briefcase, FileText, Users, Plus, ChevronRight,
  Clock, CheckCircle, XCircle, TrendingUp, Star, Edit3, Trash2
} from 'lucide-react';

// ─── Status helpers ────────────────────────────────────────────
const STATUS_COLORS = {
  Applied:        'badge-brand',
  'Under Review': 'badge-warning',
  Interview:      'badge-success',
  Rejected:       'badge-error',
  Offered:        'badge-success',
};
const KANBAN_COLS = ['Applied', 'Under Review', 'Interview', 'Offered', 'Rejected'];

function timeAgo(date) {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (d === 0) return 'Today'; if (d === 1) return 'Yesterday'; return `${d}d ago`;
}

// ── Student Dashboard ──────────────────────────────────────────
function StudentDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/applications/my-applications').then(r => setApplications(r.data)).finally(() => setLoading(false));
  }, []);

  const byStatus = (s) => applications.filter(a => a.status === s);
  const stats = [
    { label: 'Total Applied', value: applications.length, icon: '📝', color: '#6366f1' },
    { label: 'In Review', value: byStatus('Under Review').length, icon: '🔍', color: '#f59e0b' },
    { label: 'Interviews', value: byStatus('Interview').length, icon: '🎤', color: '#10b981' },
    { label: 'Offers', value: byStatus('Offered').length, icon: '🎉', color: '#8b5cf6' },
  ];

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading…</p></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Stats */}
      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: `${s.color}20`, fontSize: '22px' }}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div>
        <div className="section-title"><TrendingUp size={18} /> Application Tracker</div>
        {applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No applications yet</h3>
            <p>Start applying to jobs to track them here.</p>
            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/jobs')}>Browse Jobs</button>
          </div>
        ) : (
          <div className="kanban-board">
            {KANBAN_COLS.map(col => {
              const items = byStatus(col);
              return (
                <div className="kanban-col" key={col}>
                  <div className="kanban-col-header">
                    <span className="kanban-col-title" style={{ color: col === 'Offered' ? 'var(--success)' : col === 'Rejected' ? 'var(--error)' : col === 'Interview' ? 'var(--warning)' : 'var(--text-secondary)' }}>
                      {col}
                    </span>
                    <span className="kanban-count">{items.length}</span>
                  </div>
                  {items.map(app => (
                    <div className="kanban-card" key={app._id} onClick={() => navigate(`/jobs/${app.job?._id}`)}>
                      <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>{app.job?.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{app.job?.company}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className={`badge ${STATUS_COLORS[app.status]}`}>{app.status}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{timeAgo(app.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', padding: '16px 0' }}>Empty</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Recruiter Dashboard ────────────────────────────────────────
function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', company: '', location: '', skillsRequired: '', salary: '', jobType: 'Full-time' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/jobs').then(r => setJobs(r.data)).finally(() => setLoading(false));
  }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, skillsRequired: form.skillsRequired.split(',').map(s => s.trim()).filter(Boolean) };
      const { data } = await api.post('/jobs', payload);
      setJobs(prev => [data, ...prev]);
      setShowForm(false);
      setForm({ title: '', description: '', company: '', location: '', skillsRequired: '', salary: '', jobType: 'Full-time' });
      toast.success('Job posted! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Delete this job?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(prev => prev.filter(j => j._id !== jobId));
      toast.success('Job deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const myJobs = jobs; // already filtered by backend since recruiter only created theirs

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="section-title" style={{ margin: 0 }}><Briefcase size={18} /> My Job Listings</div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(v => !v)}>
          <Plus size={16} /> Post a Job
        </button>
      </div>

      {/* Post Job Form */}
      {showForm && (
        <div className="card animate-fade-in-up">
          <h3 style={{ fontWeight: '700', marginBottom: '20px' }}>New Job Posting</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input className="form-input" placeholder="e.g. Frontend Developer" value={form.title} onChange={set('title')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Company *</label>
              <input className="form-input" placeholder="Company name" value={form.company} onChange={set('company')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Location *</label>
              <input className="form-input" placeholder="e.g. Remote, New York" value={form.location} onChange={set('location')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Salary</label>
              <input className="form-input" placeholder="e.g. $60K-$80K" value={form.salary} onChange={set('salary')} />
            </div>
            <div className="form-group">
              <label className="form-label">Job Type</label>
              <select className="form-input form-select" value={form.jobType} onChange={set('jobType')}>
                {['Full-time','Part-time','Contract','Internship'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Skills Required *</label>
              <input className="form-input" placeholder="React, Node.js, MongoDB (comma-separated)" value={form.skillsRequired} onChange={set('skillsRequired')} required />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Description *</label>
              <textarea className="form-input form-textarea" placeholder="Describe the role, responsibilities, and requirements…" value={form.description} onChange={set('description')} required style={{ minHeight: '120px' }} />
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Posting…' : 'Post Job'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[
          { label: 'Total Posted', value: myJobs.length, icon: '📋', color: '#6366f1' },
          { label: 'Open Positions', value: myJobs.filter(j => j.status === 'Open').length, icon: '🟢', color: '#10b981' },
          { label: 'Closed', value: myJobs.filter(j => j.status === 'Closed').length, icon: '🔒', color: '#6b7280' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: `${s.color}20`, fontSize: '22px' }}>{s.icon}</div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Job list */}
      {myJobs.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📭</div><h3>No jobs posted yet</h3><p>Click "Post a Job" to get started.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {myJobs.map(job => (
            <div className="card" key={job._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '700', marginBottom: '4px' }}>{job.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', gap: '12px' }}>
                  <span>🏢 {job.company}</span>
                  <span>📍 {job.location}</span>
                  <span>⏰ {timeAgo(job.createdAt)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {job.status === 'Open' ? <span className="badge badge-success">Open</span> : <span className="badge badge-neutral">Closed</span>}
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(job._id)} title="Delete"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard Page ────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: '32px' }}>
      <div className="page-header">
        <h1>Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {user?.role === 'student' ? "Track your applications and discover new opportunities." : "Manage your job listings and review applicants."}
        </p>
      </div>

      {user?.role === 'student' ? <StudentDashboard /> : <RecruiterDashboard />}
    </div>
  );
}

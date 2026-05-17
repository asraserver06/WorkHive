import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Briefcase, ChevronRight, Zap, Edit3, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [recs, setRecs] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState((user?.skills || []).join(', '));
  const [editSkills, setEditSkills] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const fetch = () => {
    setLoading(true);
    api.get('/recommendations')
      .then(r => { setRecs(r.data.recommendations); setMessage(r.data.message); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetch, []);

  const saveSkills = async () => {
    setSaving(true);
    try {
      const arr = skills.split(',').map(s => s.trim()).filter(Boolean);
      await api.put('/recommendations/skills', { skills: arr });
      toast.success('Skills updated!');
      setEditSkills(false);
      fetch();
    } catch {
      toast.error('Failed to update skills');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={28} style={{ color: 'var(--brand-400)' }} />
              Job Matches
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>{message}</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setEditSkills(v => !v)}>
            {editSkills ? <><X size={14} /> Cancel</> : <><Edit3 size={14} /> Edit Skills</>}
          </button>
        </div>
      </div>

      {/* Skills editor */}
      {editSkills && (
        <div className="card animate-fade-in-up" style={{ marginBottom: '24px' }}>
          <div className="form-group">
            <label className="form-label">Your Skills (comma-separated)</label>
            <input className="form-input" placeholder="React, Node.js, Python, SQL…" value={skills} onChange={e => setSkills(e.target.value)} />
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Better skills → better matches.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button className="btn btn-primary btn-sm" onClick={saveSkills} disabled={saving}>{saving ? 'Saving…' : 'Save Skills'}</button>
          </div>
        </div>
      )}

      {/* Current skills */}
      {user?.skills?.length > 0 && !editSkills && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', alignSelf: 'center' }}>Your skills:</span>
          {user.skills.map(s => <span className="skill-chip" key={s}>{s}</span>)}
        </div>
      )}

      {loading ? (
        <div className="loading-screen"><div className="spinner" /><p>Finding matches…</p></div>
      ) : recs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⭐</div>
          <h3>No matches yet</h3>
          <p>Add skills to your profile to get personalized recommendations.</p>
          <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setEditSkills(true)}>Add Skills</button>
        </div>
      ) : (
        <div className="jobs-grid">
          {recs.map((job, i) => (
            <div className="job-card animate-fade-in-up" key={job._id} style={{ animationDelay: `${i * 0.04}s` }}
              onClick={() => navigate(`/jobs/${job._id}`)}>
              {/* Match score badge */}
              {job.matchScore > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <span className="badge badge-brand">
                    <Star size={10} /> {job.matchScore} match{job.matchScore > 1 ? 'es' : ''}
                  </span>
                </div>
              )}
              <div className="job-card-header" style={{ marginTop: job.matchScore > 0 ? '-8px' : '0' }}>
                <div>
                  <div className="job-title">{job.title}</div>
                  <div className="job-company">🏢 {job.company}</div>
                </div>
                {job.status === 'Open' ? <span className="badge badge-success">Open</span> : <span className="badge badge-neutral">Closed</span>}
              </div>
              <div className="job-meta">
                <span className="job-meta-item"><MapPin size={12} /> {job.location}</span>
                <span className="job-meta-item"><Briefcase size={12} /> {job.jobType}</span>
              </div>
              {/* Matched skills highlighted */}
              {job.matchedSkills?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {job.matchedSkills.map(s => <span className="skill-chip" key={s} style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)', color: 'var(--success)' }}>✓ {s}</span>)}
                  {job.skillsRequired?.filter(s => !job.matchedSkills.includes(s.toLowerCase())).slice(0, 2).map(s => <span className="skill-chip skill-chip-muted" key={s}>{s}</span>)}
                </div>
              )}
              <div className="job-card-footer">
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{job.recruiter?.name}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--brand-400)', fontWeight: '600' }}>
                  Apply <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

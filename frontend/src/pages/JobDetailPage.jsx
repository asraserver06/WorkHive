import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, Briefcase, Clock, ArrowLeft, CheckCircle, Building2, DollarSign, Users } from 'lucide-react';

function timeAgo(date) {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d} days ago`;
  return `${Math.floor(d / 7)} weeks ago`;
}

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then(r => setJob(r.data))
      .catch(() => toast.error('Job not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!user) { navigate('/login'); return; }
    setApplying(true);
    try {
      await api.post('/applications', { jobId: id });
      setApplied(true);
      toast.success('Application submitted! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading…</p></div>;
  if (!job) return <div className="loading-screen"><p>Job not found.</p></div>;

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px', maxWidth: '900px' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Jobs
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card animate-fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px' }}>{job.title}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  <Building2 size={15} /> {job.company}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <MapPin size={14} /> {job.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <Briefcase size={14} /> {job.jobType}
                  </span>
                  {job.salary && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <DollarSign size={14} /> {job.salary}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <Clock size={14} /> {timeAgo(job.createdAt)}
                  </span>
                </div>
              </div>
              {job.status === 'Open'
                ? <span className="badge badge-success">Open</span>
                : <span className="badge badge-neutral">Closed</span>}
            </div>
          </div>

          <div className="card animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px' }}>Job Description</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '14px' }}>{job.description}</p>
          </div>

          <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px' }}>Required Skills</h2>
            <div className="job-skills">
              {job.skillsRequired?.map(s => <span className="skill-chip" key={s}>{s}</span>)}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '88px' }}>
          {/* Apply card */}
          {user?.role === 'student' && (
            <div className="card animate-fade-in-up">
              {applied ? (
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <CheckCircle size={32} style={{ color: 'var(--success)', margin: '0 auto 10px' }} />
                  <p style={{ fontWeight: '700', fontSize: '15px' }}>Application Sent!</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>You'll be notified of updates.</p>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                    Ready to apply for <strong style={{ color: 'var(--text-primary)' }}>{job.title}</strong>?
                  </p>
                  <button className="btn btn-primary btn-full" onClick={handleApply} disabled={applying || job.status === 'Closed'}>
                    {applying ? 'Submitting…' : job.status === 'Closed' ? 'Position Closed' : 'Apply Now 🚀'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Recruiter info */}
          <div className="card animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Posted by</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="user-avatar" style={{ width: '40px', height: '40px', fontSize: '16px' }}>
                {job.recruiter?.name?.[0] || 'R'}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{job.recruiter?.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{job.recruiter?.email}</div>
              </div>
            </div>
            {user && user.role === 'student' && (
              <button className="btn btn-secondary btn-full btn-sm" style={{ marginTop: '12px' }}
                onClick={() => navigate('/chat')}>
                <Users size={14} /> Message Recruiter
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

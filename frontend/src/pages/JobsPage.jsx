import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { MapPin, Clock, Briefcase, Search, SlidersHorizontal, ChevronRight } from 'lucide-react';

const JOB_TYPES = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship'];

function statusBadge(status) {
  return status === 'Open'
    ? <span className="badge badge-success">Open</span>
    : <span className="badge badge-neutral">Closed</span>;
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/jobs').then(r => setJobs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    const matchSearch = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.location.toLowerCase().includes(q) || j.skillsRequired?.some(s => s.toLowerCase().includes(q));
    const matchType = typeFilter === 'All' || j.jobType === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
      <div className="page-header">
        <h1>Browse Jobs <span className="gradient-text">& Internships</span></h1>
        <p>{filtered.length} opportunities available</p>
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input className="search-input" placeholder="Search by title, company, skill, or location…" value={search} onChange={e => setSearch(e.target.value)} />
        <SlidersHorizontal size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      </div>

      {/* Type filters */}
      <div className="search-filters">
        {JOB_TYPES.map(t => (
          <button key={t} className={`filter-chip${typeFilter === t ? ' active' : ''}`} onClick={() => setTypeFilter(t)}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /><p>Loading jobs…</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No jobs found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {filtered.map((job, i) => (
            <div className="job-card animate-fade-in-up" key={job._id} style={{ animationDelay: `${i * 0.04}s` }}
              onClick={() => navigate(`/jobs/${job._id}`)}>
              <div className="job-card-header">
                <div>
                  <div className="job-title">{job.title}</div>
                  <div className="job-company">🏢 {job.company}</div>
                </div>
                {statusBadge(job.status)}
              </div>

              <div className="job-meta">
                <span className="job-meta-item"><MapPin size={12} /> {job.location}</span>
                <span className="job-meta-item"><Briefcase size={12} /> {job.jobType}</span>
                {job.salary && <span className="job-meta-item">💰 {job.salary}</span>}
                <span className="job-meta-item"><Clock size={12} /> {timeAgo(job.createdAt)}</span>
              </div>

              <div className="job-skills">
                {job.skillsRequired?.slice(0, 4).map(s => <span className="skill-chip" key={s}>{s}</span>)}
                {job.skillsRequired?.length > 4 && <span className="skill-chip skill-chip-muted">+{job.skillsRequired.length - 4}</span>}
              </div>

              <div className="job-card-footer">
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Posted by {job.recruiter?.name || 'Recruiter'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--brand-400)', fontWeight: '600' }}>
                  View <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

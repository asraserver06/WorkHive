import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, Star, MessageSquare, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  { icon: <Briefcase size={22} />, title: 'Smart Job Search', desc: 'Filter by skills, location, and job type. Find the perfect role.' },
  { icon: <Star size={22} />, title: 'AI Recommendations', desc: 'Personalized job matches based on your skills and history.' },
  { icon: <CheckCircle size={22} />, title: 'Application Tracker', desc: 'Kanban board to track every application from Applied to Offer.' },
  { icon: <MessageSquare size={22} />, title: 'Real-time Chat', desc: 'Connect directly with recruiters via built-in messaging.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* Hero */}
      <section className="landing-hero">
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="hero-eyebrow animate-fade-in">
            ✨ Smart Career & Internship Portal
          </div>
          <h1 className="hero-title animate-fade-in-up">
            Land your dream <span className="gradient-text">career</span><br />with AI-powered tools
          </h1>
          <p className="hero-sub animate-fade-in-up">
            Search thousands of jobs, get AI resume feedback, track applications, and chat with recruiters — all in one place.
          </p>
          <div className="hero-ctas animate-fade-in-up">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Get Started Free <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/jobs')}>
              Browse Jobs
            </button>
          </div>

          <div className="hero-stats animate-fade-in">
            {[
              { value: '10K+', label: 'Jobs Listed' },
              { value: '5K+', label: 'Students Hired' },
              { value: '500+', label: 'Companies' },
              { value: '98%', label: 'Satisfaction' },
            ].map((s) => (
              <div className="hero-stat" key={s.label}>
                <div className="hero-stat-value gradient-text">{s.value}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px' }}>
              Everything you need to <span className="gradient-text">succeed</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
              A complete platform for students and recruiters to connect and grow.
            </p>
          </div>
          <div className="grid-2" style={{ maxWidth: '900px', margin: '0 auto' }}>
            {features.map((f) => (
              <div className="card" key={f.title} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--brand-400)' }}>
                  {f.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>{f.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px' }}>
            Ready to find your <span className="gradient-text">next opportunity?</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>
            Join thousands of students and recruiters already using CareerPortal.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Create Free Account <ArrowRight size={18} />
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/login')}>Log In</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
        © {new Date().getFullYear()} CareerPortal. Built with ❤️ using MERN Stack + AI.
      </footer>
    </>
  );
}

import { useNavigate } from 'react-router-dom';
import { Briefcase, Star, MessageSquare, ArrowRight, Zap, Shield, Search } from 'lucide-react';

const features = [
  { icon: <Search size={28} />, title: 'Smart Job Search', desc: 'Filter by skills, location, and job type. Find the perfect role instantly.' },
  { icon: <Star size={28} />, title: 'AI Matchmaking', desc: 'Personalized job matches based on your unique skills and history.' },
  { icon: <Shield size={28} />, title: 'Blind Recruitment', desc: 'Fair, bias-free hiring based entirely on your technical skills.' },
  { icon: <MessageSquare size={28} />, title: 'Real-time Chat', desc: 'Connect directly with recruiters via built-in instant messaging.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--bg-base)' }}>
      {/* 3D Background */}
      <div className="landing-3d-bg"></div>
      
      {/* 3D Floating Shapes */}
      <div className="floating-shape shape-1"></div>
      <div className="floating-shape shape-2"></div>
      <div className="floating-shape shape-3"></div>

      {/* Hero */}
      <section style={{ padding: '140px 24px 80px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          <h1 className="hero-title-3d animate-fade-in-up">
            Land your dream <span style={{ color: 'var(--brand-400)' }}>career</span><br />with AI tools.
          </h1>
          <p className="hero-sub-3d animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Experience the next generation of recruitment. Blind matchmaking, instant AI feedback, and real-time networking.
          </p>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s', display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-3d" onClick={() => navigate('/register')}>
              Get Started <ArrowRight size={20} strokeWidth={3} />
            </button>
            <button className="btn-3d btn-3d-secondary" onClick={() => navigate('/jobs')}>
              Explore Jobs
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '100px 24px', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div className="grid-2" style={{ maxWidth: '1000px', margin: '0 auto', gap: '40px' }}>
            {features.map((f, i) => (
              <div className="card-3d animate-fade-in-up" key={f.title} style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', marginBottom: '24px', boxShadow: '0 10px 20px -5px rgba(99,102,241,0.4), inset 0 2px 2px rgba(255,255,255,0.2)' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-primary)' }}>{f.title}</h3>
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.7', fontWeight: '500' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '120px 24px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div className="container card-3d" style={{ maxWidth: '800px', padding: '80px 40px', background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-base) 100%)' }}>
          <h2 className="cta-title-3d">
            Ready to jump in?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '48px', fontSize: '20px', fontWeight: '500' }}>
            Join the future of hiring today.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-3d" onClick={() => navigate('/register')}>
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '15px', position: 'relative', zIndex: 10, background: 'var(--bg-base)', fontWeight: '500' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
          <Briefcase size={20} style={{ color: 'var(--brand-400)' }} />
          <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '18px' }}>WorkHive</span>
        </div>
        © {new Date().getFullYear()} WorkHive. All rights reserved.
      </footer>
    </div>
  );
}

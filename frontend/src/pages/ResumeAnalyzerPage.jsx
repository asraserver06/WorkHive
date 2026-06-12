import { useState, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Upload, FileText, Loader, Sparkles, X } from 'lucide-react';

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') { toast.error('Only PDF files are allowed'); return; }
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) { toast.error('Please select a PDF resume'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (jobDescription.trim()) formData.append('jobDescription', jobDescription.trim());
      const { data } = await api.post('/resume/analyze', formData);
      setResult(data);
      toast.success('Analysis complete! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px', maxWidth: '800px' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="stat-icon" style={{ background: 'rgba(168,85,247,0.15)', color: 'var(--accent-400)', width: '44px', height: '44px' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800' }}>AI Resume Analyzer</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Upload your PDF resume for instant AI-powered feedback</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Drop Zone */}
        <div
          className={`drop-zone${dragOver ? ' drag-over' : ''}`}
          onClick={() => fileRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
        >
          <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
          {file ? (
            <div>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📄</div>
              <div style={{ fontWeight: '700', marginBottom: '4px' }}>{file.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {(file.size / 1024).toFixed(1)} KB
              </div>
              <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}>
                <X size={14} /> Remove
              </button>
            </div>
          ) : (
            <div>
              <div className="drop-icon">☁️</div>
              <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '6px' }}>Drop your resume here</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>or click to browse — PDF only</div>
              <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>
                <Upload size={14} /> Choose File
              </button>
            </div>
          )}
        </div>

        {/* Optional job description */}
        <div className="card">
          <div className="form-group">
            <label className="form-label">Job Description (optional)</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Paste a job description to get a match percentage and missing skills analysis…"
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              style={{ minHeight: '100px' }}
            />
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Adding a job description enables skill-gap analysis and a match score.
            </p>
          </div>
        </div>

        <button className="btn btn-primary btn-lg" onClick={handleAnalyze} disabled={loading || !file}>
          {loading ? (
            <><Loader size={18} style={{ animation: 'spin 0.7s linear infinite' }} /> Analyzing with AI…</>
          ) : (
            <><Sparkles size={18} /> Analyze My Resume</>
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="ai-feedback-card animate-fade-in-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Sparkles size={18} style={{ color: 'var(--accent-400)' }} />
              <h2 style={{ fontSize: '16px', fontWeight: '700' }}>AI Feedback</h2>
            </div>

            {result.extractedTextPreview && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '16px' }}>
                <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  Extracted Text Preview
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace', lineHeight: '1.6' }}>
                  {result.extractedTextPreview}
                </p>
              </div>
            )}

            <div className="feedback-prose">{result.aiFeedback}</div>
          </div>
        )}
      </div>
    </div>
  );
}

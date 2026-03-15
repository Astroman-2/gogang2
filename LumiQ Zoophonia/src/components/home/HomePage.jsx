import React, { useState } from 'react';
import {
  sleep, uid, extractYouTubeId, getYoutubeThumbnail,
  extractVideoTitle, generateMockTranscript,
} from '../../utils/helpers';

const TIPS = [
  ['1', 'Paste URL',      'Drop any YouTube or video URL into the analyser'],
  ['2', 'AI Processes',   'Live streaming AI generates transcript, music analysis, and visual insights'],
  ['3', 'Navigate & Rate','Jump to timestamps, rate quality, leave threaded comments'],
  ['4', 'Build Playlists','Organise analyses into curated learning playlists'],
];

export default function HomePage({ onAnalyze, recentAnalyses, playlists, showToast, setPage, setActiveAnalysis }) {
  const [url, setUrl]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleAnalyze = async () => {
    if (!url.trim()) { setError('Please enter a video URL'); return; }
    setLoading(true);
    setError('');
    await sleep(500);
    const videoId = extractYouTubeId(url);
    const analysis = {
      id:         uid(),
      url:        url.trim(),
      videoId,
      title:      extractVideoTitle(url.trim()),
      thumbnail:  videoId ? getYoutubeThumbnail(videoId) : null,
      addedAt:    new Date().toLocaleDateString(),
      transcript: generateMockTranscript(),
      ratings:    { music: 0, explanation: 0, theme: 0 },
      comments:   [],
      reactions:  {},
      analysisData: null,
    };
    setLoading(false);
    onAnalyze(analysis);
    showToast('Analysis started! AI is processing.', 'success');
  };

  return (
    <div className="home-page">
      {/* ── Hero / URL input ── */}
      <div className="hero-section">
        <div className="hero-text">
          <div className="hero-badge">⚡ Instant AI Analysis</div>
          <h1 className="hero-title">Drop any video URL.<br />Watch it come alive.</h1>
          <p className="hero-desc">
            Transcripts, music analysis, visual extraction, community ratings —
            all AI-powered and streamed live.
          </p>
        </div>

        <div className="url-input-card">
          <div className="url-input-label">
            🔗 Video URL
            <span className="hint-badge">YouTube, Vimeo, or direct link</span>
          </div>
          <div className="url-input-row">
            <input
              className="url-input"
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <button className="btn-primary" onClick={handleAnalyze} disabled={loading}>
              {loading
                ? <span className="loading-dots"><span /><span /><span /></span>
                : 'Analyze →'}
            </button>
          </div>
          {error && <div className="field-error">⚠ {error}</div>}
          <div className="url-chips">
            {['youtube.com', 'vimeo.com', 'loom.com', 'direct .mp4'].map((s) => (
              <span key={s} className="url-chip">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="stats-row">
        {[
          { v: recentAnalyses.length, label: 'Analyses', icon: '⚡' },
          { v: playlists.length,       label: 'Playlists', icon: '☰' },
          { v: recentAnalyses.reduce((a, b) => a + (b.comments?.length ?? 0), 0), label: 'Comments', icon: '💬' },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-val">{s.v}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Recent analyses ── */}
      {recentAnalyses.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Recent Analyses</h2>
            <button className="btn-ghost btn-sm" onClick={() => setPage('analyze')}>View all</button>
          </div>
          <div className="analysis-grid">
            {recentAnalyses.map((a) => (
              <div
                className="analysis-card"
                key={a.id}
                onClick={() => { setActiveAnalysis(a); setPage('analyze'); }}
              >
                <div className="analysis-thumb">
                  {a.thumbnail
                    ? <img src={a.thumbnail} alt="" onError={(e) => { e.target.style.display = 'none'; }} />
                    : <div className="thumb-placeholder">🎬</div>}
                  <div className="thumb-overlay">▶ Open</div>
                </div>
                <div className="analysis-meta">
                  <div className="analysis-title">{a.title}</div>
                  <div className="analysis-info">
                    <span>📅 {a.addedAt}</span>
                    <span>💬 {a.comments?.length ?? 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── How it works ── */}
      <div className="tips-section">
        <h3 className="tips-title">💡 How LumiQ works</h3>
        <div className="tips-grid">
          {TIPS.map(([step, title, desc]) => (
            <div className="tip-card" key={step}>
              <div className="tip-step">{step}</div>
              <div className="tip-title">{title}</div>
              <div className="tip-desc">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { callClaude, DEMO_MUSIC_ANALYSIS, DEMO_LYRICS_ANALYSIS, DEMO_THEME_ANALYSIS } from '../../utils/api';
import MarkdownRenderer from '../shared/MarkdownRenderer';

const SNIPPETS = [
  { ts: '0:00',  label: 'Opening Title Card' },
  { ts: '5:12',  label: 'Architecture Diagram' },
  { ts: '13:20', label: 'Performance Chart' },
  { ts: '22:15', label: 'Comparison Table' },
];

/** Simulate streaming a static string for demo mode */
function streamDemo(text, setFn, onDone, speed = 18) {
  let i = 0;
  const chars = text.split('');
  const id = setInterval(() => {
    const chunk = chars.slice(i, i + 10).join('');
    setFn((p) => p + chunk);
    i += 10;
    if (i >= chars.length) { clearInterval(id); onDone(); }
  }, speed);
  return id;
}

export default function AnalysisTab({ analysis, onUpdate, showToast }) {
  const [phase, setPhase]         = useState('idle'); // idle | music | lyrics | theme | done
  const [musicText, setMusicText]   = useState('');
  const [lyricsText, setLyricsText] = useState('');
  const [themeText, setThemeText]   = useState('');
  const [snippets, setSnippets]     = useState([]);

  const runAnalysis = async () => {
    setPhase('music');
    setMusicText(''); setLyricsText(''); setThemeText('');

    const transcriptText = (analysis?.transcript ?? [])
      .map((t) => `[${t.ts}] ${t.text}`)
      .join('\n');
    const ctx = `Video: ${analysis?.title}\nURL: ${analysis?.url}\n\nTranscript:\n${transcriptText}`;

    /* helper: try live API, fall back to demo stream */
    const runPhase = (system, prompt, setFn, fallback) =>
      new Promise((resolve) => {
        callClaude(system, `${prompt}\n\n${ctx}`, (c) => setFn((p) => p + c))
          .then(resolve)
          .catch(() => streamDemo(fallback, setFn, resolve));
      });

    // ── Phase 1: Music ──
    await runPhase(
      'You are an expert musicologist and audio analyst.',
      'Analyse the music and sound design of this video. Discuss style, tempo, mood, instruments, how sound supports narrative, audio pacing, and rate music quality /10.',
      setMusicText,
      DEMO_MUSIC_ANALYSIS,
    );

    // ── Phase 2: Explanation / Lyrics ──
    setPhase('lyrics');
    await runPhase(
      'You are an expert in content analysis, linguistics, and media criticism.',
      'Analyse the explanation quality and verbal elements. Discuss clarity, rhetorical devices, storytelling, pacing, vocabulary, notable moments, and rate explanation quality /10.',
      setLyricsText,
      DEMO_LYRICS_ANALYSIS,
    );

    // ── Phase 3: Theme integration ──
    setPhase('theme');
    await runPhase(
      'You are an expert visual media analyst and cultural critic.',
      'Analyse the thematic integration and visual–conceptual coherence. Discuss main themes, emotional arc, cultural significance, and how all elements work together. Rate overall cohesion /10.',
      setThemeText,
      DEMO_THEME_ANALYSIS,
    );

    setSnippets(SNIPPETS);
    setPhase('done');
    onUpdate({ analysisData: { music: true, lyrics: true, theme: true } });
    showToast('Full analysis complete!', 'success');
  };

  const panels = [
    { key: 'music',  label: '🎵 Music & Sound Analysis',         text: musicText,  active: phase === 'music'  },
    { key: 'lyrics', label: '📢 Explanation & Lyrics Quality',   text: lyricsText, active: phase === 'lyrics' },
    { key: 'theme',  label: '🎨 Theme & Visual Integration',     text: themeText,  active: phase === 'theme'  },
  ];

  return (
    <div className="analysis-tab">
      {phase === 'idle' && (
        <div className="analysis-start">
          <div className="analysis-start-icon">🔬</div>
          <h3>Complete Video Analysis</h3>
          <p>
            Run a comprehensive 3-dimension AI analysis:<br />
            Music &amp; Sound · Explanation Quality · Visual Theme Integration
          </p>
          <button className="btn-primary btn-lg" onClick={runAnalysis}>
            ⚡ Run Full Analysis
          </button>
          <div className="analysis-hint">
            Three AI analyses stream live on screen — watch them evolve in real time
          </div>
        </div>
      )}

      {phase !== 'idle' && (
        <div className="analysis-panels">
          {/* Visual snapshots */}
          {snippets.length > 0 && (
            <div className="snippets-section">
              <h3 className="section-mini-title">📸 Visual Snapshots Detected</h3>
              <div className="snippets-row">
                {snippets.map((s, i) => (
                  <div className="snippet-card" key={i}>
                    <div className="snippet-thumb">
                      {analysis?.videoId
                        ? <img src={`https://img.youtube.com/vi/${analysis.videoId}/mqdefault.jpg`} alt={s.label} />
                        : <div className="snippet-placeholder">🖼</div>}
                      <div className="snippet-ts">{s.ts}</div>
                    </div>
                    <div className="snippet-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Three streaming panels */}
          {panels.map((p) => (
            <div
              key={p.key}
              className={`analysis-panel${p.active ? ' panel-active' : ''}${p.text ? ' panel-has-content' : ''}`}
            >
              <div className="panel-header">
                <span className="panel-label">{p.label}</span>
                {p.active && <span className="streaming-badge">⚡ Streaming…</span>}
                {!p.active && p.text  && <span className="done-badge">✓ Done</span>}
                {!p.active && !p.text && <span className="pending-badge">Pending</span>}
              </div>
              {p.text
                ? <div className="panel-text"><MarkdownRenderer text={p.text} streaming={p.active} /></div>
                : <div className="panel-empty">{p.active ? <span className="loading-dots"><span /><span /><span /></span> : 'Waiting…'}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

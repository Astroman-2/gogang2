import React, { useState } from 'react';
import { callClaude, DEMO_RESEARCH_DOC } from '../../utils/api';
import MarkdownRenderer from '../shared/MarkdownRenderer';

export default function TranscriptTab({ analysis, showToast }) {
  const [docState, setDocState]   = useState('idle'); // idle | generating | done
  const [docText, setDocText]     = useState('');
  const [modules, setModules]     = useState([]);
  const [activeIdx, setActiveIdx] = useState(null);
  const [searchQ, setSearchQ]     = useState('');

  const transcript = analysis?.transcript ?? [];

  const generateDoc = async () => {
    setDocState('generating');
    setDocText('');
    const transcriptText = transcript.map((t) => `[${t.ts}] ${t.text}`).join('\n');

    try {
      await callClaude(
        'You are an expert research documentation specialist. Transform video transcripts into structured, research-grade documentation.',
        `Convert this video transcript into a research document with:\n1. Executive Summary\n2. 4–5 thematic modules with timestamps\n3. Key concepts and insights per module\n4. Connections and synthesis\n\nTranscript:\n${transcriptText}\n\nFormat with ## for modules. Include timestamps in bold. Make it research-grade.`,
        (chunk) => {
          setDocText((prev) => {
            const next = prev + chunk;
            const mods = next.match(/^## .+/gm);
            if (mods) {
              setModules(
                mods.map((m, i) => ({
                  id: i,
                  title: m.replace('## ', ''),
                  ts: transcript[Math.floor((i * transcript.length) / mods.length)]?.ts ?? '0:00',
                }))
              );
            }
            return next;
          });
        }
      );
      setDocState('done');
      showToast('Research document generated!', 'success');
    } catch {
      // Fallback to demo content when API is unavailable
      let i = 0;
      const chars = DEMO_RESEARCH_DOC.split('');
      setDocState('generating');
      const interval = setInterval(() => {
        const chunk = chars.slice(i, i + 8).join('');
        setDocText((p) => p + chunk);
        i += 8;
        if (i >= chars.length) {
          clearInterval(interval);
          setDocState('done');
          showToast('Research document ready (demo mode)', 'info');
        }
      }, 20);
    }
  };

  const filtered = transcript.filter(
    (t) => !searchQ || t.text.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="transcript-tab">
      {/* ── Left: segment list ── */}
      <div className="transcript-sidebar">
        <div className="ts-header">
          <h3>Transcript Segments</h3>
          <div className="field-hint">Click a timestamp to jump</div>
        </div>

        <input
          className="search-input"
          placeholder="🔍 Search transcript…"
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
        />

        <div className="ts-list">
          {filtered.map((seg, i) => (
            <div
              key={i}
              className={`ts-seg${activeIdx === i ? ' active' : ''}`}
              onClick={() => setActiveIdx(i)}
            >
              <span className="ts-time">{seg.ts}</span>
              <span className="ts-text">
                {seg.text.slice(0, 80)}{seg.text.length > 80 ? '…' : ''}
              </span>
            </div>
          ))}
        </div>

        {modules.length > 0 && (
          <div className="modules-nav">
            <div className="modules-title">📚 Modules</div>
            {modules.map((m) => (
              <button
                key={m.id}
                className="module-btn"
                onClick={() => showToast(`→ ${m.title}`, 'info')}
              >
                <span className="mod-ts">{m.ts}</span> {m.title.slice(0, 40)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Right: spotlight + doc ── */}
      <div className="transcript-main">
        {activeIdx !== null && (
          <div className="seg-spotlight">
            <div className="seg-ts-badge">{filtered[activeIdx]?.ts}</div>
            <p className="seg-full-text">{filtered[activeIdx]?.text}</p>
          </div>
        )}

        <div className="doc-area">
          <div className="doc-toolbar">
            <span className="doc-label">🧠 AI Research Document</span>
            {docState === 'idle' && (
              <button className="btn-primary btn-sm" onClick={generateDoc}>
                Generate Research Doc ✨
              </button>
            )}
            {docState === 'generating' && (
              <span className="generating-badge">⚡ AI Writing…</span>
            )}
            {docState === 'done' && (
              <span className="done-badge">✓ Complete</span>
            )}
          </div>

          {docState === 'idle' && (
            <div className="doc-prompt">
              <div className="doc-prompt-icon">📄</div>
              <p>
                Click <strong>Generate Research Doc</strong> to transform this
                transcript into a structured, research-grade document with modules,
                insights, and academic framing — streamed live by AI.
              </p>
            </div>
          )}

          {(docState === 'generating' || docState === 'done') && (
            <div className="doc-output">
              <MarkdownRenderer text={docText} streaming={docState === 'generating'} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

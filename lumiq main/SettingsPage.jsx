import React, { useState } from 'react';

const ACCENT_COLORS = [
  { label: 'Indigo',  value: '#6366f1' },
  { label: 'Violet',  value: '#7c3aed' },
  { label: 'Sky',     value: '#0ea5e9' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Rose',    value: '#f43f5e' },
  { label: 'Amber',   value: '#f59e0b' },
];

export default function SettingsPage({ user, theme, setTheme, analyses, playlists, notes, onClearData, showToast }) {
  const [accent,   setAccent]   = useState('#6366f1');
  const [fontSize, setFontSize] = useState('15');
  const [confirmClear, setConfirmClear] = useState(false);

  const applyAccent = (color) => {
    setAccent(color);
    document.documentElement.style.setProperty('--indigo', color);
    showToast('Accent colour updated', 'success');
  };

  const applyFontSize = (size) => {
    setFontSize(size);
    document.documentElement.style.fontSize = size + 'px';
    showToast(`Font size set to ${size}px`, 'info');
  };

  const exportData = () => {
    const data = { user, analyses, playlists, notes, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `lumiq-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!', 'success');
  };

  return (
    <div className="settings-page">
      <div className="settings-inner">

        {/* ── Account ── */}
        <section className="settings-section">
          <h2 className="settings-section-title">👤 Account</h2>
          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-user-info">
                <div className="settings-avatar">{user?.avatar}</div>
                <div>
                  <div className="settings-username">{user?.name}</div>
                  <div className="settings-email">{user?.email}</div>
                </div>
              </div>
            </div>
            <div className="settings-row settings-row-border">
              <div>
                <div className="settings-label">Member since</div>
                <div className="settings-value">January 2025</div>
              </div>
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-label">Total analyses</div>
                <div className="settings-value">{analyses.length}</div>
              </div>
              <div>
                <div className="settings-label">Playlists</div>
                <div className="settings-value">{playlists.length}</div>
              </div>
              <div>
                <div className="settings-label">Notes saved</div>
                <div className="settings-value">{Object.values(notes).filter(Boolean).length}</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Appearance ── */}
        <section className="settings-section">
          <h2 className="settings-section-title">🎨 Appearance</h2>
          <div className="settings-card">
            <div className="settings-row settings-row-between">
              <div>
                <div className="settings-label">Theme</div>
                <div className="settings-hint">Choose your visual theme</div>
              </div>
              <div className="settings-theme-btns">
                {['dark', 'light', 'midnight'].map((t) => (
                  <button
                    key={t}
                    className={`settings-theme-btn ${theme === t ? 'active' : ''}`}
                    onClick={() => { setTheme(t); showToast(`${t} theme applied`, 'info'); }}
                  >
                    {t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '🌌'} {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-row settings-row-border settings-row-between">
              <div>
                <div className="settings-label">Accent colour</div>
                <div className="settings-hint">Primary interactive colour</div>
              </div>
              <div className="accent-swatch-row">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    className={`accent-swatch ${accent === c.value ? 'swatch-active' : ''}`}
                    style={{ background: c.value }}
                    onClick={() => applyAccent(c.value)}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div className="settings-row settings-row-border settings-row-between">
              <div>
                <div className="settings-label">Font size</div>
                <div className="settings-hint">Base text size in pixels</div>
              </div>
              <div className="settings-font-sizes">
                {['13', '15', '17', '19'].map((s) => (
                  <button
                    key={s}
                    className={`settings-font-btn ${fontSize === s ? 'active' : ''}`}
                    onClick={() => applyFontSize(s)}
                  >
                    {s}px
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── AI & Analysis ── */}
        <section className="settings-section">
          <h2 className="settings-section-title">🤖 AI & Analysis</h2>
          <div className="settings-card">
            <div className="settings-row settings-row-between">
              <div>
                <div className="settings-label">Anthropic API key</div>
                <div className="settings-hint">
                  Set <code className="settings-code">REACT_APP_ANTHROPIC_API_KEY</code> in{' '}
                  <code className="settings-code">.env.local</code> before building.
                  Without it, the app uses rich demo content.
                </div>
              </div>
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary btn-sm"
              >
                Get key ↗
              </a>
            </div>
            <div className="settings-row settings-row-border settings-row-between">
              <div>
                <div className="settings-label">Analysis model</div>
                <div className="settings-hint">claude-sonnet-4-20250514 — fastest streaming</div>
              </div>
              <span className="settings-badge">claude-sonnet-4</span>
            </div>
          </div>
        </section>

        {/* ── Data ── */}
        <section className="settings-section">
          <h2 className="settings-section-title">💾 Data & Privacy</h2>
          <div className="settings-card">
            <div className="settings-row settings-row-between">
              <div>
                <div className="settings-label">Export all data</div>
                <div className="settings-hint">Download all your analyses, playlists, and notes as JSON</div>
              </div>
              <button className="btn-secondary btn-sm" onClick={exportData}>
                ⬇ Export
              </button>
            </div>

            <div className="settings-row settings-row-border settings-row-between">
              <div>
                <div className="settings-label">Data storage</div>
                <div className="settings-hint">All data is stored locally in your browser — nothing is sent to any server</div>
              </div>
              <span className="settings-badge settings-badge-green">Local only</span>
            </div>

            <div className="settings-row settings-row-border settings-row-between">
              <div>
                <div className="settings-label settings-label-danger">Clear all data</div>
                <div className="settings-hint">Permanently delete all analyses, playlists, notes, and settings</div>
              </div>
              {confirmClear ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn-danger btn-sm" onClick={() => { onClearData(); setConfirmClear(false); }}>
                    Confirm delete
                  </button>
                  <button className="btn-ghost btn-sm" onClick={() => setConfirmClear(false)}>Cancel</button>
                </div>
              ) : (
                <button className="btn-danger btn-sm" onClick={() => setConfirmClear(true)}>
                  Clear data
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── About ── */}
        <section className="settings-section">
          <h2 className="settings-section-title">ℹ About LumiQ</h2>
          <div className="settings-card settings-about">
            <div className="about-logo">
              <span className="title-glow" style={{ fontSize: '2rem' }}>Lumi</span>
              <span className="title-plain" style={{ fontSize: '2rem' }}>Q</span>
            </div>
            <p>AI-powered video learning platform. Transform any video into a living research document.</p>
            <div className="about-links">
              <a href="https://github.com/YOUR_USERNAME/lumiq" target="_blank" rel="noreferrer" className="btn-ghost btn-sm">GitHub ↗</a>
              <a href="https://docs.anthropic.com" target="_blank" rel="noreferrer" className="btn-ghost btn-sm">Anthropic Docs ↗</a>
            </div>
            <div className="about-stack">
              <span>React 18</span><span>·</span>
              <span>Claude AI</span><span>·</span>
              <span>GitHub Pages</span><span>·</span>
              <span>MIT License</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

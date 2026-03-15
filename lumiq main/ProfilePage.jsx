import React, { useState } from 'react';
import ProgressBar from '../shared/ProgressBar';

export default function ProfilePage({
  user, analyses, playlists, bookmarks = [], notes = {},
  onOpenAnalysis, setPage,
}) {
  const [activeTab, setActiveTab] = useState('activity');

  const totalComments   = analyses.reduce((s, a) => s + (a.comments?.length ?? 0), 0);
  const ratedAnalyses   = analyses.filter((a) => Object.values(a.ratings ?? {}).some((v) => v > 0));
  const avgRating       = ratedAnalyses.length
    ? (ratedAnalyses.reduce((s, a) =>
        s + Object.values(a.ratings).reduce((r, v) => r + v, 0) / 3, 0
      ) / ratedAnalyses.length).toFixed(1)
    : '—';
  const notesCount      = Object.values(notes).filter(Boolean).length;

  const engagementScore = Math.min(
    100,
    analyses.length * 8 + totalComments * 5 +
    ratedAnalyses.length * 10 + notesCount * 12 + bookmarks.length * 4
  );

  const STATS = [
    { label: 'Analyses',   val: analyses.length,  icon: '⚡', color: '#6366f1' },
    { label: 'Playlists',  val: playlists.length, icon: '☰',  color: '#f43f5e' },
    { label: 'Comments',   val: totalComments,    icon: '💬', color: '#10b981' },
    { label: 'Bookmarks',  val: bookmarks.length, icon: '🔖', color: '#f59e0b' },
    { label: 'Notes',      val: notesCount,       icon: '📝', color: '#38bdf8' },
    { label: 'Avg Rating', val: avgRating,        icon: '⭐', color: '#f59e0b' },
  ];

  const TABS = [
    { id: 'activity', label: 'Recent Activity' },
    { id: 'notes',    label: 'My Notes'        },
    { id: 'ratings',  label: 'Ratings Given'   },
  ];

  return (
    <div className="profile-page">
      {/* Hero */}
      <div className="profile-hero">
        <div className="profile-avatar-lg">{user?.avatar}</div>
        <div className="profile-hero-text">
          <h2 className="profile-name">{user?.name}</h2>
          <div className="profile-email">{user?.email}</div>
          <div className="profile-badge-row">
            <span className="profile-badge">✦ LumiQ Member</span>
            {analyses.length >= 5 && <span className="profile-badge profile-badge-gold">🏆 Analyst</span>}
            {totalComments >= 10  && <span className="profile-badge profile-badge-blue">💬 Contributor</span>}
            {notesCount >= 3      && <span className="profile-badge profile-badge-green">📝 Researcher</span>}
          </div>
        </div>
        <div className="profile-engagement">
          <div className="engagement-label">Engagement Score</div>
          <div className="engagement-val">{engagementScore}</div>
          <ProgressBar value={engagementScore} max={100} color="#6366f1" size="sm" />
          <div className="engagement-sub">Analyse more videos to level up</div>
        </div>
      </div>

      {/* Stats */}
      <div className="profile-stats-grid">
        {STATS.map((s) => (
          <div className="profile-stat" key={s.label}>
            <div className="ps-icon">{s.icon}</div>
            <div className="ps-val" style={{ color: s.color }}>{s.val}</div>
            <div className="ps-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {TABS.map((t) => (
          <button key={t.id}
            className={`profile-tab-btn${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="profile-section">

        {/* Activity */}
        {activeTab === 'activity' && (
          analyses.length === 0
            ? <div className="profile-empty-state"><span>⚡</span>
                <p>No analyses yet — <button className="inline-link" onClick={() => setPage('home')}>
                  analyse a video
                </button> to get started!</p>
              </div>
            : <div className="activity-list">
                {analyses.slice(0, 10).map((a) => (
                  <div className="activity-item" key={a.id}
                    onClick={() => onOpenAnalysis(a)} style={{ cursor: 'pointer' }}>
                    <div className="activity-thumb">
                      {a.thumbnail
                        ? <img src={a.thumbnail} alt="" onError={(e) => { e.target.style.display = 'none'; }} />
                        : <span style={{ fontSize: '1.2rem' }}>🎬</span>}
                    </div>
                    <div className="activity-body">
                      <div className="activity-title">{a.title}</div>
                      <div className="activity-meta">
                        <span>📅 {a.addedAt}</span>
                        <span>💬 {a.comments?.length ?? 0}</span>
                        {Object.values(a.ratings ?? {}).some((v) => v > 0) && <span>⭐ Rated</span>}
                        {notes[a.id] && <span>📝 Notes</span>}
                      </div>
                    </div>
                    <span className="activity-arrow">›</span>
                  </div>
                ))}
              </div>
        )}

        {/* Notes */}
        {activeTab === 'notes' && (
          notesCount === 0
            ? <div className="profile-empty-state"><span>📝</span>
                <p>No notes yet. Open an analysis and click <strong>📝 Notes</strong> to start writing.</p>
              </div>
            : <div className="notes-list">
                {analyses.filter((a) => notes[a.id]).map((a) => (
                  <div className="notes-preview-card" key={a.id} onClick={() => onOpenAnalysis(a)}>
                    <div className="npc-header">
                      <span className="npc-title">{a.title}</span>
                      <span className="npc-date">{a.addedAt}</span>
                    </div>
                    <div className="npc-preview">
                      {notes[a.id].slice(0, 180)}{notes[a.id].length > 180 ? '…' : ''}
                    </div>
                    <div className="npc-word-count">
                      {notes[a.id].trim().split(/\s+/).length} words
                    </div>
                  </div>
                ))}
              </div>
        )}

        {/* Ratings */}
        {activeTab === 'ratings' && (
          ratedAnalyses.length === 0
            ? <div className="profile-empty-state"><span>⭐</span>
                <p>No ratings yet. Open an analysis and use the <strong>Rate & React</strong> tab.</p>
              </div>
            : <div className="ratings-list">
                {ratedAnalyses.map((a) => (
                  <div className="rating-summary-row" key={a.id} onClick={() => onOpenAnalysis(a)}>
                    <div className="rsr-title">{a.title}</div>
                    <div className="rsr-bars">
                      {[
                        { key: 'music',       label: '🎵 Music',      color: '#6366f1' },
                        { key: 'explanation', label: '📢 Explanation', color: '#f43f5e' },
                        { key: 'theme',       label: '🎨 Theme',       color: '#10b981' },
                      ].map((d) => (
                        <div key={d.key} className="rsr-bar-row">
                          <span className="rsr-bar-label">{d.label}</span>
                          <ProgressBar value={a.ratings?.[d.key] ?? 0} max={5} color={d.color} size="sm" />
                          <span className="rsr-bar-val">{a.ratings?.[d.key] ?? 0}/5</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
        )}

      </div>
    </div>
  );
}

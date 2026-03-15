import React from 'react';
import EmptyState from '../shared/EmptyState';

export default function BookmarksPage({ analyses, bookmarks, onOpenAnalysis, onToggleBookmark }) {
  const saved = analyses.filter((a) => bookmarks.includes(a.id));

  return (
    <div className="bookmarks-page">
      <div className="page-inner-header">
        <h1 className="page-inner-title">🔖 Saved Analyses</h1>
        <p className="page-inner-sub">Videos you've bookmarked for quick access</p>
      </div>

      {saved.length === 0 ? (
        <EmptyState
          icon="🔖"
          title="No saved analyses yet"
          description="Open any analysis and click the bookmark button to save it here for quick access."
        />
      ) : (
        <div className="bookmarks-grid">
          {saved.map((a) => (
            <div className="bookmark-card" key={a.id}>
              <div className="bk-thumb" onClick={() => onOpenAnalysis(a)}>
                {a.thumbnail
                  ? <img src={a.thumbnail} alt="" onError={(e) => { e.target.style.display = 'none'; }} />
                  : <div className="bk-thumb-placeholder">🎬</div>}
                <div className="bk-thumb-overlay">▶ Open</div>
              </div>
              <div className="bk-body">
                <div className="bk-title">{a.title}</div>
                <div className="bk-meta">
                  <span>📅 {a.addedAt}</span>
                  <span>💬 {a.comments?.length ?? 0}</span>
                  <span>
                    ⭐ {Object.values(a.ratings ?? {}).filter((v) => v > 0).length > 0
                      ? (Object.values(a.ratings).reduce((s, v) => s + v, 0) / 3).toFixed(1)
                      : '—'}
                  </span>
                </div>
                <div className="bk-actions">
                  <button className="btn-primary btn-sm" onClick={() => onOpenAnalysis(a)}>Open →</button>
                  <button
                    className="btn-ghost btn-sm"
                    onClick={() => onToggleBookmark(a.id)}
                    title="Remove bookmark"
                  >
                    🔖 Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

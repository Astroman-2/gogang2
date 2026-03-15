import React, { useState, useEffect, useCallback } from 'react';
import {
  sleep, uid,
  extractYouTubeId, getYoutubeThumbnail,
  extractVideoTitle, generateMockTranscript,
} from '../../utils/helpers';
import TranscriptTab    from './TranscriptTab';
import AnalysisTab      from './AnalysisTab';
import RateTab          from './RateTab';
import AddToPlaylistBtn from './AddToPlaylistBtn';
import NotesPanel       from '../notes/NotesPanel';

const TABS = [
  { id: 'transcript', label: '📄 Transcript',  hint: 'Timestamped segments + AI research doc' },
  { id: 'analysis',   label: '🎵 Analysis',    hint: 'Music · Sound · Theme breakdown'        },
  { id: 'rate',       label: '⭐ Rate & React', hint: 'Rate quality + threaded discussion'     },
];

export default function AnalyzePage({
  analysis,
  playlists, setPlaylists,
  showToast,
  notes = {}, onSaveNote,
  bookmarks = [], onToggleBookmark,
  onUpdateAnalysis,
  onDeleteAnalysis,
}) {
  const [tab,               setTab]               = useState('transcript');
  const [localAnalysis,     setLocalAnalysis]     = useState(analysis);
  const [newUrl,            setNewUrl]            = useState('');
  const [loadingNew,        setLoadingNew]        = useState(false);
  const [showNotes,         setShowNotes]         = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /* Reset when a new analysis is selected from outside */
  useEffect(() => {
    setLocalAnalysis(analysis);
    setTab('transcript');
    setShowNotes(false);
    setShowDeleteConfirm(false);
  }, [analysis]);

  const update = useCallback((patch) => {
    setLocalAnalysis((prev) => ({ ...prev, ...patch }));
    if (localAnalysis?.id) onUpdateAnalysis?.(localAnalysis.id, patch);
  }, [localAnalysis, onUpdateAnalysis]);

  /* Load a new URL in place */
  const handleLoadUrl = async () => {
    if (!newUrl.trim()) return;
    setLoadingNew(true);
    await sleep(400);
    const videoId = extractYouTubeId(newUrl);
    setLocalAnalysis((prev) => ({
      ...prev,
      id:           uid(),
      url:          newUrl.trim(),
      videoId,
      title:        extractVideoTitle(newUrl.trim()),
      thumbnail:    videoId ? getYoutubeThumbnail(videoId) : null,
      transcript:   generateMockTranscript(),
      analysisData: null,
    }));
    setNewUrl('');
    setLoadingNew(false);
    setTab('transcript');
    showToast('New video loaded!', 'success');
  };

  const isBookmarked = localAnalysis && bookmarks.includes(localAnalysis.id);

  /* ── Empty state ── */
  if (!localAnalysis) {
    return (
      <div className="analyze-empty">
        <div className="empty-icon">⚡</div>
        <h2>No video selected</h2>
        <p>Go to Home and paste a video URL to start analysing</p>
        <div className="url-input-card" style={{ maxWidth: '500px', margin: '1.5rem auto 0' }}>
          <div className="url-input-row">
            <input
              className="url-input"
              placeholder="Paste a video URL here…"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLoadUrl()}
            />
            <button className="btn-primary" onClick={handleLoadUrl} disabled={loadingNew}>
              {loadingNew
                ? <span className="loading-dots"><span /><span /><span /></span>
                : 'Go →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analyze-page">

      {/* ══════════ Video header ══════════ */}
      <div className="video-header">
        {/* Embed / thumbnail */}
        <div className="video-thumb-area">
          {localAnalysis.videoId ? (
            <iframe
              className="video-embed"
              src={`https://www.youtube.com/embed/${localAnalysis.videoId}`}
              title="Video player"
              allowFullScreen
            />
          ) : (
            <div className="video-embed video-placeholder">
              <span style={{ fontSize: '3rem' }}>🎬</span>
              <span>Video Preview</span>
            </div>
          )}
        </div>

        {/* Meta + actions */}
        <div className="video-info">
          <div className="video-url-chip" title={localAnalysis.url}>
            {localAnalysis.url.slice(0, 55)}{localAnalysis.url.length > 55 ? '…' : ''}
          </div>

          <h2 className="video-title">{localAnalysis.title}</h2>

          <div className="video-stats">
            <span>📅 {localAnalysis.addedAt}</span>
            <span>🎞 {localAnalysis.transcript?.length ?? 0} segments</span>
            <span>💬 {localAnalysis.comments?.length ?? 0} comments</span>
          </div>

          {/* Action buttons */}
          <div className="video-actions">
            <AddToPlaylistBtn
              analysis={localAnalysis}
              playlists={playlists}
              setPlaylists={setPlaylists}
              showToast={showToast}
            />

            <button
              className={`btn-ghost btn-sm${isBookmarked ? ' btn-active-ghost' : ''}`}
              onClick={() => {
                onToggleBookmark(localAnalysis.id);
                showToast(isBookmarked ? 'Bookmark removed' : 'Bookmarked! ✓', isBookmarked ? 'info' : 'success');
              }}
              title={isBookmarked ? 'Remove bookmark' : 'Save to bookmarks'}
            >
              🔖 {isBookmarked ? 'Saved' : 'Save'}
            </button>

            <button
              className={`btn-ghost btn-sm${showNotes ? ' btn-active-ghost' : ''}`}
              onClick={() => setShowNotes((n) => !n)}
              title="Toggle notes panel"
            >
              📝 Notes{notes[localAnalysis.id] ? ' ●' : ''}
            </button>

            {onDeleteAnalysis && (
              <button
                className="btn-ghost btn-sm"
                style={{ color: 'var(--rose)', opacity: 0.7 }}
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete this analysis"
              >
                🗑
              </button>
            )}
          </div>

          {/* Quick URL swap */}
          <div className="url-swap">
            <input
              className="url-input url-input-sm"
              placeholder="Load another URL…"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLoadUrl()}
            />
            <button className="btn-ghost btn-sm" onClick={handleLoadUrl} disabled={loadingNew}>
              {loadingNew ? '…' : 'Load'}
            </button>
          </div>
        </div>
      </div>

      {/* ══════════ Notes panel ══════════ */}
      {showNotes && (
        <NotesPanel
          analysisId={localAnalysis.id}
          initialText={notes[localAnalysis.id] || ''}
          onSave={onSaveNote}
          onClose={() => setShowNotes(false)}
        />
      )}

      {/* ══════════ Delete confirmation ══════════ */}
      {showDeleteConfirm && (
        <div className="dialog-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="dialog-title">Delete this analysis?</h3>
            <p className="dialog-message">
              This will permanently remove <strong>"{localAnalysis.title}"</strong> including
              all comments, ratings, and notes. This cannot be undone.
            </p>
            <div className="dialog-actions">
              <button className="btn-ghost btn-sm" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button
                className="btn-danger btn-sm"
                onClick={() => { setShowDeleteConfirm(false); onDeleteAnalysis(localAnalysis.id); }}
                autoFocus
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Tab bar ══════════ */}
      <div className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            <span className="tab-hint">{t.hint}</span>
          </button>
        ))}
      </div>

      {/* ══════════ Tab content ══════════ */}
      <div className="tab-content">
        {tab === 'transcript' && <TranscriptTab analysis={localAnalysis} showToast={showToast} />}
        {tab === 'analysis'   && <AnalysisTab   analysis={localAnalysis} onUpdate={update}  showToast={showToast} />}
        {tab === 'rate'       && <RateTab        analysis={localAnalysis} onUpdate={update}  showToast={showToast} />}
      </div>

    </div>
  );
}

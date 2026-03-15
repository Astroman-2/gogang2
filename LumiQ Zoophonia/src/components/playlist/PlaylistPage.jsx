import React, { useState } from 'react';
import { uid, PLAYLIST_COLORS } from '../../utils/helpers';

export default function PlaylistPage({ playlists, setPlaylists, showToast, onOpenAnalysis }) {
  const [selected, setSelected]   = useState(null);
  const [creating, setCreating]   = useState(false);
  const [newName, setNewName]     = useState('');

  /* ── CRUD helpers ── */
  const createPlaylist = () => {
    if (!newName.trim()) { showToast('Enter a playlist name', 'warning'); return; }
    const pl = {
      id:      uid(),
      name:    newName.trim(),
      color:   PLAYLIST_COLORS[Math.floor(Math.random() * PLAYLIST_COLORS.length)],
      items:   [],
      created: new Date().toLocaleDateString(),
    };
    setPlaylists((prev) => [...prev, pl]);
    setNewName('');
    setCreating(false);
    showToast(`Playlist "${pl.name}" created!`, 'success');
  };

  const deletePlaylist = (id) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
    if (selected?.id === id) setSelected(null);
    showToast('Playlist deleted', 'info');
  };

  const removeItem = (plId, itemId) => {
    setPlaylists((prev) =>
      prev.map((p) => p.id === plId ? { ...p, items: p.items.filter((i) => i.id !== itemId) } : p)
    );
    showToast('Removed from playlist', 'info');
  };

  /* Keep selected in sync when playlists update */
  const currentSelected = playlists.find((p) => p.id === selected?.id) ?? null;

  return (
    <div className="playlist-page">
      {/* ── Sidebar ── */}
      <div className="playlist-sidebar">
        <div className="playlist-sidebar-header">
          <h3>My Playlists</h3>
          <button className="btn-primary btn-sm" onClick={() => setCreating(true)}>+ New</button>
        </div>

        <div className="hint-box">
          💡 Organise your video analyses into focused playlists for structured study.
        </div>

        {creating && (
          <div className="create-playlist-form">
            <input
              className="field-input"
              placeholder="Playlist name…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createPlaylist()}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="btn-primary btn-sm" onClick={createPlaylist}>Create</button>
              <button className="btn-ghost btn-sm" onClick={() => setCreating(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="pl-list">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              className={`pl-item${currentSelected?.id === pl.id ? ' pl-active' : ''}`}
              onClick={() => setSelected(pl)}
            >
              <div className="pl-dot" style={{ background: pl.color }} />
              <div className="pl-info">
                <div className="pl-name">{pl.name}</div>
                <div className="pl-meta">{pl.items.length} videos · {pl.created}</div>
              </div>
              <button
                className="btn-ghost btn-xs pl-delete"
                onClick={(e) => { e.stopPropagation(); deletePlaylist(pl.id); }}
                title="Delete playlist"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main panel ── */}
      <div className="playlist-main">
        {!currentSelected ? (
          <div className="pl-empty">
            <div style={{ fontSize: '3rem' }}>📚</div>
            <h3>Select a playlist</h3>
            <p>Choose a playlist to view and manage its videos</p>
          </div>
        ) : (
          <>
            <div className="pl-detail-header">
              <div className="pl-detail-dot" style={{ background: currentSelected.color }} />
              <div>
                <h2 className="pl-detail-name">{currentSelected.name}</h2>
                <div className="pl-detail-meta">
                  {currentSelected.items.length} videos · Created {currentSelected.created}
                </div>
              </div>
            </div>

            {currentSelected.items.length === 0 ? (
              <div className="pl-empty-state">
                <span>🎬</span>
                <p>No videos yet. Analyse a video and use <em>Add to Playlist</em> to populate this playlist!</p>
              </div>
            ) : (
              <div className="pl-videos">
                {currentSelected.items.map((item, i) => (
                  <div className="pl-video-row" key={item.id}>
                    <div className="plv-num">{i + 1}</div>
                    <div className="plv-thumb">
                      {item.thumbnail
                        ? <img src={item.thumbnail} alt="" onError={(e) => { e.target.style.display = 'none'; }} />
                        : <div className="plv-placeholder">🎬</div>}
                    </div>
                    <div className="plv-info">
                      <div className="plv-title">{item.title}</div>
                      <div className="plv-meta">
                        <span>📅 {item.addedAt}</span>
                        <span>💬 {item.comments?.length ?? 0}</span>
                      </div>
                    </div>
                    <div className="plv-actions">
                      <button className="btn-primary btn-sm" onClick={() => onOpenAnalysis(item)}>
                        Open →
                      </button>
                      <button className="btn-ghost btn-sm" onClick={() => removeItem(currentSelected.id, item.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

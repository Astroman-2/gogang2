import React, { useState, useEffect, useRef } from 'react';

export default function AddToPlaylistBtn({ analysis, playlists, setPlaylists, showToast }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const addTo = (pl) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === pl.id
          ? { ...p, items: [...p.items.filter((i) => i.id !== analysis.id), analysis] }
          : p
      )
    );
    setOpen(false);
    showToast(`Added to "${pl.name}" ✓`, 'success');
  };

  return (
    <div className="playlist-btn-wrap" ref={ref}>
      <button className="btn-secondary btn-sm" onClick={() => setOpen((o) => !o)}>
        + Add to Playlist
      </button>
      {open && (
        <div className="playlist-dropdown">
          <div className="pd-title">Choose a playlist</div>
          {playlists.length === 0 && (
            <div style={{ padding: '0.5rem 0.7rem', fontSize: '0.8rem', color: 'var(--text3)' }}>
              No playlists yet — create one first
            </div>
          )}
          {playlists.map((pl) => (
            <button key={pl.id} className="pd-item" onClick={() => addTo(pl)}>
              <span className="pd-dot" style={{ background: pl.color }} />
              {pl.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

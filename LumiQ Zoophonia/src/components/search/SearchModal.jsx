import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * CMD+K / CTRL+K global search modal.
 * Searches across analyses, playlists, and navigation actions.
 */
export default function SearchModal({ analyses, playlists, onOpenAnalysis, onNavigate, onClose }) {
  const [query, setQuery]     = useState('');
  const [cursor, setCursor]   = useState(0);
  const inputRef              = useRef(null);
  const listRef               = useRef(null);
  const debouncedQ            = useDebounce(query, 150);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Build results
  const results = buildResults(debouncedQ, analyses, playlists, onOpenAnalysis, onNavigate);

  // Keyboard navigation
  const handleKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    if (e.key === 'Enter' && results[cursor]) { results[cursor].action(); onClose(); }
  };

  useEffect(() => {
    setCursor(0);
  }, [debouncedQ]);

  useEffect(() => {
    listRef.current?.children[cursor]?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-row">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            className="search-modal-input"
            placeholder="Search analyses, playlists, or navigate…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
          />
          <kbd className="search-kbd" onClick={onClose}>ESC</kbd>
        </div>

        {results.length > 0 && (
          <div className="search-results" ref={listRef}>
            {groupResults(results).map(({ group, items }) => (
              <div key={group} className="search-group">
                <div className="search-group-label">{group}</div>
                {items.map((r, i) => {
                  const globalIdx = results.indexOf(r);
                  return (
                    <div
                      key={i}
                      className={`search-result-item${cursor === globalIdx ? ' search-result-active' : ''}`}
                      onClick={() => { r.action(); onClose(); }}
                      onMouseEnter={() => setCursor(globalIdx)}
                    >
                      <span className="sri-icon">{r.icon}</span>
                      <div className="sri-body">
                        <div className="sri-title">{highlight(r.title, debouncedQ)}</div>
                        {r.sub && <div className="sri-sub">{r.sub}</div>}
                      </div>
                      {r.badge && <span className="sri-badge">{r.badge}</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {debouncedQ && results.length === 0 && (
          <div className="search-empty">No results for "{debouncedQ}"</div>
        )}

        {!debouncedQ && (
          <div className="search-hints">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>ESC close</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── helpers ─────────────────────────────────────────────────

function buildResults(q, analyses, playlists, onOpenAnalysis, onNavigate) {
  const lq = q.toLowerCase();
  const results = [];

  // Navigation shortcuts (always shown when query is empty or matches)
  const navItems = [
    { icon: '⌂', title: 'Go to Home',      sub: 'Dashboard',          badge: 'Nav', action: () => onNavigate('home'),     group: 'Navigate' },
    { icon: '⚡', title: 'Go to Analyze',   sub: 'Video analysis',     badge: 'Nav', action: () => onNavigate('analyze'),  group: 'Navigate' },
    { icon: '☰', title: 'Go to Playlists', sub: 'Manage collections', badge: 'Nav', action: () => onNavigate('playlist'), group: 'Navigate' },
    { icon: '◉', title: 'Go to Profile',   sub: 'Your stats',         badge: 'Nav', action: () => onNavigate('profile'),  group: 'Navigate' },
    { icon: '⚙', title: 'Settings',        sub: 'Theme & preferences',badge: 'Nav', action: () => onNavigate('settings'), group: 'Navigate' },
  ];

  if (!lq) {
    results.push(...navItems.slice(0, 4));
  } else {
    navItems.forEach((n) => { if (n.title.toLowerCase().includes(lq) || n.sub.toLowerCase().includes(lq)) results.push(n); });
  }

  // Analyses
  analyses
    .filter((a) => !lq || a.title.toLowerCase().includes(lq) || a.url.toLowerCase().includes(lq))
    .slice(0, 6)
    .forEach((a) => results.push({
      icon: '🎬', title: a.title, sub: a.url.slice(0, 50),
      badge: a.addedAt, group: 'Analyses',
      action: () => onOpenAnalysis(a),
    }));

  // Playlists
  playlists
    .filter((p) => !lq || p.name.toLowerCase().includes(lq))
    .slice(0, 4)
    .forEach((p) => results.push({
      icon: '📚', title: p.name, sub: `${p.items.length} videos`,
      badge: p.created, group: 'Playlists',
      action: () => onNavigate('playlist'),
    }));

  return results;
}

function groupResults(results) {
  const groups = {};
  results.forEach((r) => {
    if (!groups[r.group]) groups[r.group] = [];
    groups[r.group].push(r);
  });
  return Object.entries(groups).map(([group, items]) => ({ group, items }));
}

function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="search-highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

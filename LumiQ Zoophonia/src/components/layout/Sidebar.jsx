import React from 'react';

const NAV_LINKS = [
  { id: 'home',      icon: '⌂', label: 'Home'      },
  { id: 'analyze',   icon: '⚡', label: 'Analyze'   },
  { id: 'playlist',  icon: '☰', label: 'Playlists' },
  { id: 'bookmarks', icon: '🔖', label: 'Saved'     },
  { id: 'profile',   icon: '◉', label: 'Profile'   },
  { id: 'settings',  icon: '⚙', label: 'Settings'  },
];

export default function Sidebar({ user, page, setPage, onLogout, onSearchOpen, bookmarkCount = 0 }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="title-glow" style={{ fontSize: '1.4rem' }}>Lumi</span>
        <span className="title-plain" style={{ fontSize: '1.4rem' }}>Q</span>
      </div>

      {/* Search trigger */}
      <div className="sidebar-search-wrap">
        <button className="sidebar-search-btn" onClick={onSearchOpen} title="Search (⌘K)">
          <span>🔍</span>
          <span className="slink-label">Search</span>
          <kbd className="sidebar-kbd">⌘K</kbd>
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_LINKS.map(({ id, icon, label }) => (
          <button
            key={id}
            className={`sidebar-link${page === id ? ' active' : ''}`}
            onClick={() => setPage(id)}
            aria-current={page === id ? 'page' : undefined}
          >
            <span className="slink-icon">{icon}</span>
            <span className="slink-label">{label}</span>
            {id === 'bookmarks' && bookmarkCount > 0 && (
              <span className="slink-badge">{bookmarkCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{user?.avatar}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>
        <button className="btn-ghost btn-sm" onClick={onLogout} title="Sign out">
          ⎋ Logout
        </button>
      </div>
    </aside>
  );
}

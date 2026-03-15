import React from 'react';

export default function TopBar({ user, page, pageTitle, onSearchOpen }) {
  return (
    <header className="topbar">
      <div className="topbar-title">{pageTitle || 'LumiQ'}</div>
      <div className="topbar-right">
        <button className="topbar-search-btn" onClick={onSearchOpen} title="Search (⌘K)">
          🔍 <span className="topbar-search-label">Search</span>
          <kbd className="topbar-kbd">⌘K</kbd>
        </button>
        <div className="status-pill">✦ AI Ready</div>
        <div className="topbar-avatar" aria-label={`User: ${user?.name}`}>{user?.avatar}</div>
      </div>
    </header>
  );
}

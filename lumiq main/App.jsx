import React, { useState, useCallback } from 'react';
import './App.css';

import { AppProvider, useApp } from './context/AppContext';
import LandingPage  from './components/auth/LandingPage';
import AuthFlow     from './components/auth/AuthFlow';
import Sidebar      from './components/layout/Sidebar';
import TopBar       from './components/layout/TopBar';
import HomePage     from './components/home/HomePage';
import AnalyzePage  from './components/analyze/AnalyzePage';
import PlaylistPage from './components/playlist/PlaylistPage';
import ProfilePage  from './components/profile/ProfilePage';
import SettingsPage from './components/settings/SettingsPage';
import BookmarksPage from './components/bookmarks/BookmarksPage';
import Toast        from './components/shared/Toast';
import SearchModal  from './components/search/SearchModal';
import { useKeyboard } from './hooks/useKeyboard';

function InnerApp() {
  const {
    user, authState, setAuthState, login, logout,
    page, setPage, activeAnalysis, setActiveAnalysis, openAnalysis,
    playlists, setPlaylists,
    analyses, addAnalysis, updateAnalysis, deleteAnalysis,
    notes, setNote,
    bookmarks, toggleBookmark,
    theme, setTheme,
    toast, showToast,
  } = useApp();

  const [searchOpen, setSearchOpen] = useState(false);

  useKeyboard([
    { key: 'k', ctrlKey: true,  handler: () => setSearchOpen(true) },
    { key: 'k', metaKey: true,  handler: () => setSearchOpen(true) },
  ]);

  if (authState === 'landing') return <LandingPage onStart={() => setAuthState('otp')} />;
  if (authState === 'otp')     return <AuthFlow onSuccess={login} />;

  const handleClearData = useCallback(() => {
    localStorage.removeItem('lumiq_v1');
    window.location.reload();
  }, []);

  const PAGE_TITLES = {
    home:'Dashboard', analyze:'Video Analysis', playlist:'My Playlists',
    bookmarks:'Saved', profile:'Profile', settings:'Settings',
  };

  return (
    <div className="app-shell" data-theme={theme}>
      <Sidebar
        user={user} page={page} setPage={setPage} onLogout={logout}
        onSearchOpen={() => setSearchOpen(true)} bookmarkCount={bookmarks.length}
      />
      <main className="app-main">
        <TopBar user={user} page={page} pageTitle={PAGE_TITLES[page]} onSearchOpen={() => setSearchOpen(true)} />
        <div className="page-content">
          {page === 'home' && (
            <HomePage
              onAnalyze={(a) => { addAnalysis(a); openAnalysis(a); }}
              recentAnalyses={analyses.slice(0, 4)}
              playlists={playlists} showToast={showToast}
              setPage={setPage} setActiveAnalysis={setActiveAnalysis}
            />
          )}
          {page === 'analyze' && (
            <AnalyzePage
              analysis={activeAnalysis} playlists={playlists} setPlaylists={setPlaylists}
              showToast={showToast} notes={notes} onSaveNote={setNote}
              bookmarks={bookmarks} onToggleBookmark={toggleBookmark}
              onUpdateAnalysis={updateAnalysis}
              onDeleteAnalysis={(id) => { deleteAnalysis(id); setPage('home'); showToast('Analysis deleted','info'); }}
            />
          )}
          {page === 'playlist' && (
            <PlaylistPage
              playlists={playlists} setPlaylists={setPlaylists}
              analyses={analyses} showToast={showToast} onOpenAnalysis={openAnalysis}
            />
          )}
          {page === 'bookmarks' && (
            <BookmarksPage
              analyses={analyses} bookmarks={bookmarks}
              onOpenAnalysis={openAnalysis} onToggleBookmark={toggleBookmark}
            />
          )}
          {page === 'profile' && (
            <ProfilePage
              user={user} analyses={analyses} playlists={playlists}
              bookmarks={bookmarks} notes={notes}
              onOpenAnalysis={openAnalysis} setPage={setPage}
            />
          )}
          {page === 'settings' && (
            <SettingsPage
              user={user} theme={theme} setTheme={setTheme}
              analyses={analyses} playlists={playlists} notes={notes}
              onClearData={handleClearData} showToast={showToast}
            />
          )}
        </div>
      </main>
      {searchOpen && (
        <SearchModal
          analyses={analyses} playlists={playlists}
          onOpenAnalysis={(a) => { openAnalysis(a); setSearchOpen(false); }}
          onNavigate={(p) => { setPage(p); setSearchOpen(false); }}
          onClose={() => setSearchOpen(false)}
        />
      )}
      {toast && <Toast key={toast.id} toast={toast} />}
    </div>
  );
}

export default function App() {
  return <AppProvider><InnerApp /></AppProvider>;
}

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { uid } from '../utils/helpers';

// ─── Default seed data ────────────────────────────────────────
const SEED_PLAYLISTS = [
  { id: 'pl1', name: 'AI & ML Deep Dives',       color: '#6366f1', items: [], created: 'Dec 2024', pinned: true  },
  { id: 'pl2', name: 'Music Theory Essentials',  color: '#f43f5e', items: [], created: 'Jan 2025', pinned: false },
];

const LOCAL_KEY = 'lumiq_v1';

function loadState() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
  } catch {}
}

// ─── Context ──────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const saved = loadState();

  const [user,       setUser]       = useState(saved?.user       ?? null);
  const [authState,  setAuthState]  = useState(saved?.user ? 'app' : 'landing');
  const [page,       setPage]       = useState('home');
  const [playlists,  setPlaylists]  = useState(saved?.playlists  ?? SEED_PLAYLISTS);
  const [analyses,   setAnalyses]   = useState(saved?.analyses   ?? []);
  const [notes,      setNotes]      = useState(saved?.notes      ?? {}); // { analysisId: noteText }
  const [bookmarks,  setBookmarks]  = useState(saved?.bookmarks  ?? []); // array of analysisIds
  const [theme,      setTheme]      = useState(saved?.theme      ?? 'dark');
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [toast,      setToast]      = useState(null);
  const toastTimer = useRef(null);

  // ── Persist to localStorage ──────────────────────────────────
  useEffect(() => {
    saveState({ user, playlists, analyses, notes, bookmarks, theme });
  }, [user, playlists, analyses, notes, bookmarks, theme]);

  // ── Apply theme class ────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ── Toast ────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'info', duration = 3200) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type, id: uid() });
    toastTimer.current = setTimeout(() => setToast(null), duration);
  }, []);

  // ── Analyses CRUD ────────────────────────────────────────────
  const addAnalysis = useCallback((a) => {
    setAnalyses((prev) => [a, ...prev]);
  }, []);

  const updateAnalysis = useCallback((id, patch) => {
    setAnalyses((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a));
  }, []);

  const deleteAnalysis = useCallback((id) => {
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
    setPlaylists((prev) =>
      prev.map((p) => ({ ...p, items: p.items.filter((i) => i.id !== id) }))
    );
  }, []);

  // ── Notes ────────────────────────────────────────────────────
  const setNote = useCallback((analysisId, text) => {
    setNotes((prev) => ({ ...prev, [analysisId]: text }));
  }, []);

  // ── Bookmarks ────────────────────────────────────────────────
  const toggleBookmark = useCallback((analysisId) => {
    setBookmarks((prev) =>
      prev.includes(analysisId)
        ? prev.filter((id) => id !== analysisId)
        : [...prev, analysisId]
    );
  }, []);

  // ── Auth ─────────────────────────────────────────────────────
  const login = useCallback((userData) => {
    setUser(userData);
    setAuthState('app');
    setPage('home');
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAuthState('landing');
    setPage('home');
    setActiveAnalysis(null);
  }, []);

  // ── Navigation ───────────────────────────────────────────────
  const openAnalysis = useCallback((a) => {
    setActiveAnalysis(a);
    setPage('analyze');
  }, []);

  const value = {
    // Auth
    user, authState, setAuthState, login, logout,
    // Navigation
    page, setPage, activeAnalysis, setActiveAnalysis, openAnalysis,
    // Data
    playlists, setPlaylists,
    analyses, addAnalysis, updateAnalysis, deleteAnalysis,
    notes, setNote,
    bookmarks, toggleBookmark,
    // UI
    theme, setTheme,
    toast, showToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

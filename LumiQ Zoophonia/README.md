# ⚡ LumiQ — AI Video Learning Platform

> Transform any video into a living research document.  
> Transcripts · Music Analysis · Visual Snippets · Playlists · Notes · Community

[![CI](https://github.com/YOUR_USERNAME/lumiq/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/lumiq/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ Features

| Category | Features |
|----------|---------|
| 🔐 **Auth** | Email → OTP passwordless sign-in with countdown timer & resend |
| 🎬 **Video Analysis** | Any YouTube or direct video URL; live AI streaming in 3 phases |
| 📄 **Transcript** | Timestamped segment navigation, full-text search, AI research doc generator |
| 🎵 **Analysis** | Music & Sound · Explanation Quality · Theme Integration — all streamed live |
| 📸 **Snippets** | Detected infographic / keyframe thumbnails per video |
| ⭐ **Ratings** | 3-dimension star ratings (Music · Explanation · Theme) |
| 💬 **Discussion** | Threaded comments, emoji reactions, emoji picker, reply threading |
| 📝 **Notes** | Per-analysis sticky notepad with autosave, word count, markdown shortcuts |
| 🔖 **Bookmarks** | Save analyses for quick access from the Bookmarks page |
| 📚 **Playlists** | Create, colour-code, reorder, and manage video playlists |
| 🔍 **Search** | ⌘K spotlight search across all analyses, playlists, and navigation |
| ⚙️ **Settings** | Theme switcher (dark/light/midnight), accent colour, font size, JSON export |
| 💾 **Persistence** | All data auto-saved to `localStorage` — survives page refresh |
| 🤖 **AI Streaming** | Watch analysis text evolve token-by-token; rich demo fallback without API key |
| 🌌 **Design** | Radiant Aurora Glass dark theme with animated orbs, 3 theme variants |

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/lumiq.git
cd lumiq

# 2. Install
npm install

# 3. (Optional) Add your Anthropic API key
cp .env.example .env.local
# Edit .env.local → REACT_APP_ANTHROPIC_API_KEY=sk-ant-...

# 4. Run
npm start
# → http://localhost:3000
```

> **No API key needed.** All three analysis panels and the research doc generator fall back to
> expertly-written demo content that streams character-by-character, preserving the full UX.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open spotlight search |
| `Escape` | Close any modal / dialog |
| `↑ ↓` in search | Navigate results |
| `Enter` in search | Open selected result |
| `Ctrl+S` in notes | Force-save note |
| `Tab` in notes | Insert 2-space indent |

---

## 🏗️ Project Structure

```
lumiq/
├── public/
│   ├── index.html              HTML entry point
│   └── favicon.svg             SVG gradient favicon
│
├── src/
│   ├── App.jsx                 Root — auth gates + InnerApp shell
│   ├── App.css                 Complete design system (1200+ lines)
│   ├── index.js / index.css    React entry + global resets
│   │
│   ├── context/
│   │   └── AppContext.jsx      Global state + localStorage persistence
│   │
│   ├── hooks/
│   │   ├── useKeyboard.js      Global keyboard shortcut registration
│   │   ├── useLocalStorage.js  Typed localStorage-synced state
│   │   └── useDebounce.js      Debounce hook for search inputs
│   │
│   ├── utils/
│   │   ├── helpers.js          uid, sleep, YouTube helpers, mock data, emoji list
│   │   └── api.js              Anthropic streaming API + 4 rich demo fallbacks
│   │
│   └── components/
│       ├── auth/
│       │   ├── LandingPage.jsx     Hero with animated aurora orbs
│       │   └── AuthFlow.jsx        Email → OTP flow with countdown
│       │
│       ├── layout/
│       │   ├── Sidebar.jsx         Nav + search trigger + bookmark badge
│       │   └── TopBar.jsx          Sticky header with ⌘K search button
│       │
│       ├── home/
│       │   └── HomePage.jsx        URL input, stats cards, recent analyses, tips
│       │
│       ├── analyze/
│       │   ├── AnalyzePage.jsx     Shell: embed, notes, bookmark, delete, tabs
│       │   ├── TranscriptTab.jsx   Segments + search + module nav + AI research doc
│       │   ├── AnalysisTab.jsx     3-panel streaming AI analysis + visual snippets
│       │   ├── RateTab.jsx         Star ratings + threaded comments + emoji reactions
│       │   └── AddToPlaylistBtn.jsx Playlist picker dropdown
│       │
│       ├── bookmarks/
│       │   └── BookmarksPage.jsx   Saved analyses grid
│       │
│       ├── playlist/
│       │   └── PlaylistPage.jsx    Create / rename / manage playlists
│       │
│       ├── profile/
│       │   └── ProfilePage.jsx     Stats, engagement score, activity, notes, ratings tabs
│       │
│       ├── notes/
│       │   └── NotesPanel.jsx      Per-analysis notepad with autosave + markdown shortcuts
│       │
│       ├── search/
│       │   └── SearchModal.jsx     ⌘K spotlight search with keyboard navigation
│       │
│       ├── settings/
│       │   └── SettingsPage.jsx    Theme, accent, font size, API docs, data export/clear
│       │
│       └── shared/
│           ├── LoadingDots.jsx     Animated 3-dot loading indicator
│           ├── Toast.jsx           Colour-coded notification toasts
│           ├── MarkdownRenderer.jsx Lightweight streaming markdown renderer
│           ├── ProgressBar.jsx     Animated progress bar (sm/md sizes)
│           ├── EmptyState.jsx      Consistent empty state with optional CTA
│           └── ConfirmDialog.jsx   Accessible confirmation modal
│
├── .github/
│   └── workflows/deploy.yml    CI build + GitHub Pages auto-deploy
│
├── .env.example                API key template
├── .gitignore
├── package.json                CRA + React 18
├── README.md
├── LICENSE                     MIT
└── CONTRIBUTING.md
```

---

## 🌐 Deploy to GitHub Pages

### Automatic (push to main)

1. Push to `main` — the GitHub Actions workflow builds and deploys automatically.
2. **Settings → Pages → Source → GitHub Actions**
3. Live at `https://YOUR_USERNAME.github.io/lumiq/`

### Add API key (optional)

**Settings → Secrets → Actions** → add `REACT_APP_ANTHROPIC_API_KEY`.

### Manual

```bash
npm run build
# Deploy /build to Netlify / Vercel / S3 / any static host
```

---

## 🎨 Design Tokens

| Token | Dark (default) | Light | Midnight |
|-------|---------------|-------|----------|
| Background | `#06070f` | `#f8f9ff` | `#000008` |
| Panel | `#14162a` | `#ffffff` | `#0a0a1e` |
| Primary | `#6366f1` | `#6366f1` | `#6366f1` |
| Font Display | Sora | Sora | Sora |
| Font Body | Lora | Lora | Lora |
| Font Mono | JetBrains Mono | JetBrains Mono | JetBrains Mono |

Switch theme in **Settings → Appearance** or programmatically via the `data-theme` attribute on `.app-shell`.

---

## 🔑 Auth Notes

- OTP is **shown on screen in demo mode** — no email server needed.
- Production: replace `sendOtp()` in `AuthFlow.jsx` with a real call to
  [Resend](https://resend.com), SendGrid, AWS SES, or [Supabase Auth](https://supabase.com/auth).

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 |
| State | React Context + localStorage |
| Styling | Hand-crafted CSS with custom properties |
| AI | Anthropic Claude (SSE streaming) |
| Build | Create React App |
| CI/CD | GitHub Actions |
| Hosting | GitHub Pages |
| Fonts | Google Fonts (Sora · Lora · JetBrains Mono) |

**Zero external UI libraries.** Everything is hand-crafted.

---

## 📝 License

[MIT](LICENSE) — free to use, modify, and distribute.

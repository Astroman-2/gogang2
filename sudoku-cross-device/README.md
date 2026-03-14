# Sudoku Multiplayer — Cross-Device Real-Time

Play Sudoku with a friend on **different phones/devices** in real time. Share a room code, both open the same URL, and moves sync instantly.

## Live Demo
Deploy to GitHub Pages (instructions below) and share the URL.

---

## How Multiplayer Works

This game uses **three sync transports**, auto-selected best-to-worst:

| Transport | When used | How |
|-----------|-----------|-----|
| **WebRTC (PeerJS)** | Cross-device (phones, laptops) | P2P via free PeerJS cloud signaling |
| **BroadcastChannel** | Same device, different tabs | Browser native API, zero latency |
| **localStorage polling** | Fallback for old browsers | 150ms poll interval |

### Playing on two phones:
1. Phone 1 opens your hosted URL → taps **1v1 Live** → gets a 4-letter room code
2. Phone 2 opens the same URL → taps **1v1 Live** → enters the room code → taps **Join**
3. Phone 1 sees "Opponent connected!" → taps **Start Game**
4. Every move syncs in real time ⚡

### WebRTC / PeerJS
- Uses the **free public PeerJS signaling server** (`0.peerjs.com`) for the initial handshake
- Once connected, all game data travels **peer-to-peer** (no relay, no server costs)
- Works across Wi-Fi, 4G, 5G — anywhere with internet

---

## Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/sudoku-multiplayer.git
cd sudoku-multiplayer

# No build step — open directly or serve:
npx serve .
# → http://localhost:3000
```

Open on two devices on the same URL (local IP or hosted), use a room code.

---

## Deploy to GitHub Pages (free hosting)

1. Push to GitHub
2. **Settings → Pages → Source: `main` branch, root `/`**
3. Visit: `https://YOUR_USERNAME.github.io/sudoku-multiplayer/`

The included `.github/workflows/deploy.yml` auto-deploys on every push.

> **Important:** GitHub Pages uses HTTPS, which is required for WebRTC (PeerJS). It works perfectly.

---

## Upgrade to Production WebRTC Server

The free `0.peerjs.com` server works great for demos but has rate limits. For production:

### Option A — Self-host PeerJS server
```bash
npm install -g peer
peerjs --port 9000 --key peerjs --path /myapp
```
Then in `src/js/realtime.js`, update:
```js
const PEER_CFG = {
  host: 'your-server.com',
  port: 9000,
  path: '/myapp',
  secure: true
};
```

### Option B — Firebase Realtime Database
Replace the `Realtime` module internals with Firebase SDK calls. The rest of the app is unchanged.

### Option C — Ably / Supabase Realtime
Both have generous free tiers and drop-in WebSocket APIs.

---

## File Structure

```
sudoku-multiplayer/
├── index.html
├── README.md
├── .github/workflows/deploy.yml
└── src/
    ├── css/main.css
    └── js/
        ├── puzzles.js      Curated puzzle bank (4 difficulties)
        ├── generator.js    Procedural generator + backtracking solver
        ├── realtime.js     ← Cross-device sync (WebRTC + fallbacks)
        ├── game.js         Core game state engine
        └── ui.js           UI controller + multiplayer wiring
```

---

## Game Modes

| Mode | Description |
|------|-------------|
| Solo | Classic Sudoku, 4 difficulties |
| 1v1 Live | Race a friend — same puzzle, real-time score comparison |
| Co-op | Both fill cells together toward one shared solution |

## Scoring

| Action | Points |
|--------|--------|
| Correct cell | +10 (or +12 if under 2 min) |
| Wrong number | −3 |
| Hint | +5 |

## Difficulty

| Level | Cells removed |
|-------|--------------|
| Easy | ~36 |
| Medium | ~46 |
| Hard | ~53 |
| Expert | ~58 |

---

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| WebRTC / PeerJS | ✅ 54+ | ✅ 54+ | ✅ 11+ | ✅ 79+ |
| BroadcastChannel | ✅ | ✅ | ✅ 15.4+ | ✅ |
| Core game | ✅ | ✅ | ✅ | ✅ |

---

## License
MIT — free to use and modify.

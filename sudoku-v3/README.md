# Sudoku Multiplayer — Fellowship Edition

Real-time Sudoku with up to 4 players across devices. Lord of the Rings themed hero names, team battles, and live move sync via WebRTC.

## Modes
| Mode | Players | Description |
|------|---------|-------------|
| Solo Quest | 1 | Classic single-player |
| Versus | 2–4 | Race on the same puzzle, real-time |
| Team Battle | 2v2 | Team Light vs Team Shadow, combined scores |
| Co-op | 2–4 | Solve together |

## Playing on Two Phones (or more)

1. Host opens the game → taps **Versus** → shares 4-letter room code
2. Others open the same URL → tap **Versus** → enter room code → tap **Join**
3. Host sees joined players in the waiting list
4. Host taps **Start Game** — everyone gets the same puzzle, moves sync live ⚡

## Puzzle System
- **50 curated puzzles** across 4 difficulties (15 easy, 15 medium, 12 hard, 8 expert)
- Every session shows `Puzzle X of Y` so players know which set they're on
- Randomized on each new game — you'll rarely repeat

## LOTR Hero Names
25 alphabetical names from Middle-earth:
Aragorn, Arwen, Bilbo, Boromir, Celeborn, Denethor, Eowyn, Faramir, Frodo, Galadriel, Gandalf, Gimli, Glorfindel, Grima, Legolas, Merry, Pippin, Radagast, Samwise, Saruman, Sauron, Shadowfax, Shelob, Theoden, Treebeard

Name conflict detection: if two players pick the same name, a soft warning appears and the Start button is disabled until resolved.

## Celebrations
- ✨ **Every correct number** — flash + emoji popup
- 🎊 **Row/Column/Box complete** — celebration overlay
- 🏆 **Puzzle solved** — result screen with scores

## Deploy to GitHub Pages

```bash
git init && git add . && git commit -m "init"
git remote add origin https://github.com/YOU/sudoku-fellowship.git
git push -u origin main
# Settings → Pages → main branch → /root
```

Game live at `https://YOU.github.io/sudoku-fellowship/`

## Sync Technology

| Transport | Used when |
|-----------|-----------|
| WebRTC (PeerJS) | Cross-device (phones, laptops) |
| BroadcastChannel | Same device, multiple tabs |
| localStorage poll | Fallback |

All game moves, scores, and completions sync in real time.

## Scoring
| Action | Points |
|--------|--------|
| Correct (under 2 min) | +12 |
| Correct | +10 |
| Hint used | +5 |
| Wrong number | −3 |

## Files
```
├── index.html
├── src/
│   ├── css/main.css
│   └── js/
│       ├── puzzles.js     50-puzzle bank
│       ├── game.js        Engine + LOTR names + Generator
│       ├── realtime.js    WebRTC + fallbacks
│       └── ui.js          Full UI controller
├── .github/workflows/deploy.yml
└── README.md
```

## License
MIT

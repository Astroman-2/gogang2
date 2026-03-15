# ☉ Navagraha Ragas
### Live Planetary Positions × Carnatic Classical Music × Circadian Rhythm

A beautiful, interactive web application that maps **live sidereal planetary positions** to the **9 Carnatic ragas** of Muthuswami Dikshitar's *Navagraha Kritis* — exploring the ancient science of sound, time, and healing.

![Dashboard Preview](https://img.shields.io/badge/Live-Dashboard-F5C842?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48dGV4dCB5PSIuOWVtIiBmb250LXNpemU9IjkwIj7imIk8L3RleHQ+PC9zdmc+)

---

## ✨ Features

### 🌌 4 Randomized Dashboard Layouts
Each page load presents a **different visual experience** — one of four unique UX variants:
| Layout | Description |
|--------|-------------|
| **⭕ Mandala** | Concentric planetary wheel with animated orbits |
| **✦ Cosmos** | Star-field card grid with live glow effects |
| **◉ Tāla** | Rhythmic tabla beat visualizer with 16-beat tala animation |
| **◇ Yantra** | Sacred geometry Sri Yantra-inspired node map |

### ☉ Live Planetary Data
- **Real-time sidereal calculations** using the Lahiri ayanamsha (Vedic/Jyotisha standard)
- Shows each planet's current **rashi (zodiac sign)** and degree
- Auto-highlights the **current hour's raga** based on traditional time theory
- Data based on the same sidereal system used by [Drikpanchang.com](https://www.drikpanchang.com/planet/position/planetary-positions-sidereal.html)

### 🎵 Live Audio — Sitar & Tabla
- **No audio files** — all sound generated in real time via Web Audio API
- Synthesized **sitar timbre** (sawtooth + sympathetic string detuning + harmonic partials)
- Synthesized **tabla percussion** (bayan, tun, na hits with authentic envelopes)
- **Tanpura drone** underneath every performance
- **30-second raga pieces** with melodic phrases, gamaka ornaments, and tala rhythm
- Volume control slider

### 📚 Multi-Page Navigation
| Page | Content |
|------|---------|
| **Dashboard** | Live planetary positions, active raga, 24-hour timeline |
| **Ragas** | All 9 Navagraha ragas with arohanam/avarohanam, descriptions, healing properties |
| **Circadian** | How each raga phase aligns with biological clock research |
| **About** | Sources, methodology, audio synthesis explanation |

### 🕐 Circadian Intelligence
- 24-hour raga timeline maps each hour to a planet and raga
- Live progress bar shows where in the day you currently are
- Auto-transitions when the raga of the hour changes
- Detailed circadian phase guide: Brahma Muhurta → Shani Kala

---

## 🚀 Quick Start

### Option 1: Open directly
```bash
# Clone
git clone https://github.com/yourusername/navagraha-ragas.git
cd navagraha-ragas

# Open index.html in your browser
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```
> No build step, no dependencies, no npm install. Pure HTML/CSS/JS.

### Option 2: Local server (recommended for best experience)
```bash
# Python
python3 -m http.server 8080

# Node
npx serve .

# Then open: http://localhost:8080
```

---

## 🌐 Deploy to GitHub Pages

1. Push to GitHub
2. Go to **Settings → Pages**
3. Set source to **main branch / root**
4. Your app is live at `https://yourusername.github.io/navagraha-ragas/`

---

## 📁 Project Structure

```
navagraha-ragas/
├── index.html              # Main app (all pages)
├── css/
│   └── style.css           # All styles (Vedic Cosmos theme)
├── js/
│   ├── data.js             # Planetary & raga data + calculator
│   ├── audio.js            # Web Audio API sitar/tabla synthesizer
│   ├── ux-variants.js      # 4 dashboard UX variants
│   └── dashboard.js        # Main controller
├── README.md
└── LICENSE
```

---

## 🎶 The 9 Navagraha Kritis (Ragas)

| Planet | Raga | Time |
|--------|------|------|
| ☉ Surya (Sun) | Saurashtra | Dawn 6–8 AM |
| ☽ Chandra (Moon) | Asaveri | Night 8–11 PM |
| ♂ Mangala (Mars) | Surati | Afternoon 11 AM–3 PM |
| ☿ Budha (Mercury) | Nattakurunji | Morning 8–11 AM |
| ♃ Guru (Jupiter) | Athana | Dusk 5–8 PM |
| ♀ Shukra (Venus) | Paraju | Late Afternoon 3–6 PM |
| ♄ Shani (Saturn) | Yadukulakambhoji | Midnight 10 PM–2 AM |
| ☊ Rahu | Ramapriya | Pre-Dawn 2–4 AM |
| ☋ Ketu | Shanmukhapriya | Brahma Muhurta 4–6 AM |

*Raga assignments based on Muthuswami Dikshitar's Navagraha Kritis (c. 1800 CE)*

---

## 🔬 The Science

### Raga Time Theory (Ganakala Niyama)
Ancient Tamil texts (Silappatikaram, 1st–2nd century CE) classified musical modes by time:
- **Pakalpann** — daytime modes (12 panns)
- **Iravupann** — night modes (9 panns)  
- **Podupann** — universal modes (3 panns)

### Circadian Biology Connection
Modern chronobiology confirms what ancient musicians encoded:
- Morning ragas with **Gandhar-dominant** scales → cortisol activation
- Evening ragas with **komal notes** → parasympathetic engagement
- Night ragas with **Nishad emphasis** → melatonin pathway support
- Brahma Muhurta (4–6 AM) ragas → pineal gland peak activity window

---

## 📖 Sources & References

- **Planetary Data**: [Drikpanchang.com](https://www.drikpanchang.com/planet/position/planetary-positions-sidereal.html) — Sidereal Zodiac, Lahiri Ayanamsha
- **Navagraha Kritis**: Muthuswami Dikshitar (1775–1835) — [Wikipedia](https://en.wikipedia.org/wiki/Navagraha_Kritis)
- **Raga Time Theory**: Artium Academy, Spardha School of Music
- **Carnatic Classifications**: P. Sambamurthi, B. Subba Rao
- **Chronobiology**: Russell Foster (*Life Time*), Satchin Panda (*The Circadian Code*)

---

## 🛠 Technical Notes

- **Zero dependencies** — no frameworks, no npm, no bundler
- **Web Audio API** — all audio synthesized client-side in real time
- **Sidereal calculation** — simplified mean-motion model with Lahiri ayanamsha correction (~23.85°)
- **Responsive** — works on mobile, tablet, and desktop
- **Font**: Cinzel (display) + Crimson Text (body) via Google Fonts

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*"Nāda Brahma — Sound is Brahman (the Absolute). Music is the path to the divine."*
— Natyashastra

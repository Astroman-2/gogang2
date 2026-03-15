// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD CONTROLLER
// ═══════════════════════════════════════════════════════════════

window.Dashboard = {
  activePlanetId: null,
  variant: null,
  planetPositions: {},
  clockInterval: null,
  autoAdvance: false,

  init() {
    this.variant = DashboardUX.pickVariant();
    document.documentElement.setAttribute('data-variant', this.variant);

    this.planetPositions = PlanetCalc.getCurrentPositions();
    this.updatePlanetPositions();

    // Set active planet based on current time
    const currentRaga = PlanetCalc.getCurrentRaga();
    this.activePlanetId = currentRaga ? currentRaga.planet : 'surya';

    this.render();
    this.startClock();
    this.updateMoodDisplay();

    // Auto-update every minute
    setInterval(() => {
      const newRaga = PlanetCalc.getCurrentRaga();
      if (newRaga && newRaga.planet !== this.activePlanetId) {
        this.activePlanetId = newRaga.planet;
        this.render();
        this.showTransitionNotice(newRaga);
      }
      this.updateMoodDisplay();
      this.updateClock();
    }, 60000);

    // Show variant badge
    this.showVariantBadge();
  },

  updatePlanetPositions() {
    RAGA_DATA.planets.forEach(p => {
      const pos = this.planetPositions[p.id];
      if (pos) {
        p.planet_position = pos;
      }
    });
  },

  render() {
    const container = document.getElementById('dashboard-visual');
    if (!container) return;

    const activePlanet = RAGA_DATA.planets.find(p => p.id === this.activePlanetId) || RAGA_DATA.planets[0];
    DashboardUX.render(this.variant, container, RAGA_DATA.planets, activePlanet);

    this.updateInfoPanel(activePlanet);
    this.updatePlanetTable();
  },

  selectPlanet(id) {
    this.activePlanetId = id;
    const activePlanet = RAGA_DATA.planets.find(p => p.id === id) || RAGA_DATA.planets[0];
    const container = document.getElementById('dashboard-visual');
    DashboardUX.render(this.variant, container, RAGA_DATA.planets, activePlanet);
    this.updateInfoPanel(activePlanet);

    // Stop audio if playing different raga
    if (RagaAudio.playing) {
      RagaAudio.stopAll();
      const btn = document.getElementById('play-btn');
      if (btn) btn.innerHTML = `<span>▶</span> Play ${activePlanet.raga}`;
    }
  },

  updateInfoPanel(planet) {
    const panel = document.getElementById('info-panel');
    if (!panel) return;

    const pos = planet.planet_position;

    panel.innerHTML = `
      <div class="info-header" style="--pc:${planet.color};--pg:${planet.glowColor}">
        <div class="info-symbol">${planet.symbol}</div>
        <div class="info-title">
          <h2 class="info-planet-name">${planet.name}</h2>
          <p class="info-english">${planet.english} · ${planet.dayOfWeek}</p>
        </div>
      </div>

      <div class="info-raga-block">
        <div class="raga-label">Carnatic Raga</div>
        <div class="raga-name-big" style="color:${planet.glowColor}">${planet.raga}</div>
        <div class="raga-kriti">Kriti: <em>${planet.kriti}</em></div>
        <div class="raga-tala">Tāḷa: ${planet.tala}</div>
        <div class="raga-swaras">${planet.swaras}</div>
      </div>

      <div class="info-position">
        <div class="pos-label">Current Position (Sidereal)</div>
        <div class="pos-sign">${pos.zodiacSign || '—'}</div>
        <div class="pos-degree">${pos.degree ? pos.degree + '°' : ''} ${pos.retrograde ? '℞' : ''}</div>
      </div>

      <div class="info-time">
        <div class="time-label">Optimal Time</div>
        <div class="time-value" style="color:${planet.glowColor}">${planet.timeLabel}</div>
      </div>

      <div class="info-desc">${planet.description}</div>

      <div class="info-circadian">
        <div class="circ-label">Circadian Effect</div>
        <div class="circ-text">${planet.circadianEffect}</div>
      </div>

      <div class="info-healing">
        <div class="heal-label">Healing Properties</div>
        <div class="heal-text">${planet.healingProperty}</div>
      </div>

      <div class="info-tags">
        <span class="tag" style="--tc:${planet.color}">${planet.element}</span>
        <span class="tag" style="--tc:${planet.color}">${planet.quality.split(',')[0]}</span>
        <span class="tag" style="--tc:${planet.color}">${planet.bodySystem.split(',')[0]}</span>
      </div>

      <div class="audio-controls">
        <button id="play-btn" class="play-button" onclick="Dashboard.togglePlay('${planet.id}')" style="--pc:${planet.color}">
          <span>▶</span> Play ${planet.raga}
        </button>
        <div class="volume-row">
          <span>🔈</span>
          <input type="range" id="vol-slider" min="0" max="1" step="0.05" value="0.6"
            oninput="RagaAudio.setVolume(this.value)" class="vol-slider">
          <span>🔊</span>
        </div>
        <div id="play-status" class="play-status"></div>
      </div>
    `;
  },

  togglePlay(planetId) {
    const planet = RAGA_DATA.planets.find(p => p.id === planetId);
    if (!planet) return;

    const btn = document.getElementById('play-btn');
    const status = document.getElementById('play-status');

    if (RagaAudio.playing) {
      RagaAudio.stopAll();
      if (btn) btn.innerHTML = `<span>▶</span> Play ${planet.raga}`;
      if (status) status.textContent = '';
    } else {
      if (btn) btn.innerHTML = `<span>■</span> Stop`;
      if (status) status.textContent = `Playing ${planet.raga} (30s) · Sitar & Tabla`;

      RagaAudio.playRaga(planet.raga, () => {
        if (btn) btn.innerHTML = `<span>▶</span> Play ${planet.raga}`;
        if (status) status.textContent = '';
      });
    }
  },

  updatePlanetTable() {
    const table = document.getElementById('planet-table-body');
    if (!table) return;

    const hour = new Date().getHours();

    table.innerHTML = RAGA_DATA.planets.map(planet => {
      const isActive = planet.id === this.activePlanetId;
      const inTime = hour >= planet.timeRange[0] && hour < (planet.timeRange[1] > planet.timeRange[0] ? planet.timeRange[1] : 24);
      const pos = planet.planet_position;

      return `
        <tr class="${isActive ? 'row-active' : ''} ${inTime ? 'row-in-time' : ''}"
            onclick="Dashboard.selectPlanet('${planet.id}')"
            style="cursor:pointer;--pc:${planet.color}">
          <td><span class="t-sym">${planet.symbol}</span></td>
          <td><span class="t-name">${planet.name}</span></td>
          <td><span class="t-raga" style="color:${planet.glowColor}">${planet.raga}</span></td>
          <td><span class="t-sign">${pos.zodiacSign ? pos.zodiacSign.split('(')[0].trim() : '—'}</span></td>
          <td><span class="t-deg">${pos.degree ? pos.degree + '°' : '—'}</span></td>
          <td><span class="t-time">${planet.timeLabel.split('–')[0].trim()}</span></td>
          <td>${inTime ? '<span class="active-dot">●</span>' : ''}</td>
        </tr>
      `;
    }).join('');
  },

  updateMoodDisplay() {
    const currentRaga = PlanetCalc.getCurrentRaga();
    const el = document.getElementById('current-mood');
    if (el && currentRaga) {
      el.textContent = currentRaga.mood;
    }
  },

  startClock() {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
  },

  updateClock() {
    const now = new Date();
    const timeEl = document.getElementById('live-time');
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: true
      });
    }
    const dateEl = document.getElementById('live-date');
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }

    // Update time progress bar
    const h = now.getHours();
    const m = now.getMinutes();
    const pct = ((h * 60 + m) / 1440) * 100;
    const progress = document.getElementById('time-progress');
    if (progress) progress.style.width = pct + '%';

    // Highlight current hour in timeline
    const hourCells = document.querySelectorAll('[data-hour]');
    hourCells.forEach(cell => {
      cell.classList.toggle('current-hour', parseInt(cell.dataset.hour) === h);
    });
  },

  showVariantBadge() {
    const badge = document.createElement('div');
    badge.className = 'variant-badge';
    const names = {
      mandala: '⭕ Mandala View',
      cosmos: '✦ Cosmos View',
      tabla: '◉ Tāla View',
      yantra: '◇ Yantra View'
    };
    badge.textContent = names[this.variant] || 'Custom View';
    badge.title = 'Refresh to see a different layout';
    document.body.appendChild(badge);
    setTimeout(() => badge.classList.add('badge-fade'), 3000);
  },

  showTransitionNotice(ragaInfo) {
    const notice = document.createElement('div');
    notice.className = 'transition-notice';
    const planet = RAGA_DATA.planets.find(p => p.id === ragaInfo.planet);
    notice.innerHTML = `
      <div>🎵 Raga shifts to <strong>${planet?.raga || ragaInfo.raga}</strong></div>
      <div style="font-size:0.8em;opacity:0.7">${ragaInfo.mood}</div>
    `;
    document.body.appendChild(notice);
    setTimeout(() => notice.remove(), 5000);
  }
};

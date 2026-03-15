// ═══════════════════════════════════════════════════════════════
// DASHBOARD UX VARIANTS
// 4 unique randomized dashboard experiences
// ═══════════════════════════════════════════════════════════════

window.DashboardUX = {
  currentVariant: null,
  
  // Pick a variant — persisted per session but randomized each visit
  pickVariant() {
    const variants = ['mandala', 'cosmos', 'tabla', 'yantra'];
    // Random on each page load
    const idx = Math.floor(Math.random() * variants.length);
    this.currentVariant = variants[idx];
    return this.currentVariant;
  },

  // ─── VARIANT 1: MANDALA — Concentric rings, rotating planetary wheel ───
  renderMandala(container, planets, activePlanet) {
    container.innerHTML = '';
    container.className = 'dash-mandala';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '-300 -300 600 600');
    svg.style.cssText = 'width:100%;height:100%;overflow:visible;';
    
    // Background rings
    for (let r = 50; r <= 280; r += 28) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', 0);
      circle.setAttribute('cy', 0);
      circle.setAttribute('r', r);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', 'rgba(255,220,100,0.06)');
      circle.setAttribute('stroke-width', '1');
      svg.appendChild(circle);
    }

    // Center — active planet
    const active = activePlanet;
    const centerG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerCircle.setAttribute('cx', 0);
    centerCircle.setAttribute('cy', 0);
    centerCircle.setAttribute('r', 45);
    centerCircle.setAttribute('fill', active.color + '33');
    centerCircle.setAttribute('stroke', active.color);
    centerCircle.setAttribute('stroke-width', '2');
    
    const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    centerText.setAttribute('x', 0);
    centerText.setAttribute('y', -8);
    centerText.setAttribute('text-anchor', 'middle');
    centerText.setAttribute('fill', active.glowColor);
    centerText.setAttribute('font-size', '22');
    centerText.textContent = active.symbol;
    
    const centerName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    centerName.setAttribute('x', 0);
    centerName.setAttribute('y', 14);
    centerName.setAttribute('text-anchor', 'middle');
    centerName.setAttribute('fill', active.glowColor);
    centerName.setAttribute('font-size', '8');
    centerName.setAttribute('font-family', 'serif');
    centerName.textContent = active.raga;
    
    centerG.appendChild(centerCircle);
    centerG.appendChild(centerText);
    centerG.appendChild(centerName);
    svg.appendChild(centerG);

    // Planet nodes in orbit
    const orbits = [120, 175, 240];
    const planetGroups = [
      planets.slice(0, 3),
      planets.slice(3, 6),
      planets.slice(6, 9)
    ];

    planetGroups.forEach((group, gi) => {
      const r = orbits[gi];
      group.forEach((planet, i) => {
        const angle = (i / group.length) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const isActive = planet.id === active.id;

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.style.cursor = 'pointer';
        g.setAttribute('transform', `translate(${x},${y})`);
        g.setAttribute('data-planet', planet.id);

        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', 0);
        dot.setAttribute('cy', 0);
        dot.setAttribute('r', isActive ? 22 : 16);
        dot.setAttribute('fill', planet.color + (isActive ? '55' : '22'));
        dot.setAttribute('stroke', planet.color);
        dot.setAttribute('stroke-width', isActive ? '2.5' : '1');
        if (isActive) {
          dot.setAttribute('filter', `drop-shadow(0 0 8px ${planet.glowColor})`);
        }

        const sym = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        sym.setAttribute('x', 0);
        sym.setAttribute('y', 4);
        sym.setAttribute('text-anchor', 'middle');
        sym.setAttribute('fill', planet.glowColor);
        sym.setAttribute('font-size', isActive ? '14' : '11');
        sym.textContent = planet.symbol;

        g.appendChild(dot);
        g.appendChild(sym);
        svg.appendChild(g);

        g.addEventListener('click', () => window.Dashboard.selectPlanet(planet.id));
      });
    });

    container.appendChild(svg);
  },

  // ─── VARIANT 2: COSMOS — Star field with floating planet cards ───
  renderCosmos(container, planets, activePlanet) {
    container.innerHTML = '';
    container.className = 'dash-cosmos';

    // Starfield canvas
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    container.appendChild(canvas);

    // Draw stars
    requestAnimationFrame(() => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      const ctx = canvas.getContext('2d');
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.6})`;
        ctx.fill();
      }
    });

    // Planet grid with staggered positioning
    const grid = document.createElement('div');
    grid.className = 'cosmos-grid';

    planets.forEach((planet, i) => {
      const card = document.createElement('div');
      card.className = `cosmos-card ${planet.id === activePlanet.id ? 'cosmos-active' : ''}`;
      card.setAttribute('data-planet', planet.id);
      card.style.cssText = `
        --planet-color: ${planet.color};
        --planet-glow: ${planet.glowColor};
        animation-delay: ${i * 0.08}s;
      `;

      card.innerHTML = `
        <div class="cosmos-symbol">${planet.symbol}</div>
        <div class="cosmos-name">${planet.name}</div>
        <div class="cosmos-raga">${planet.raga}</div>
        <div class="cosmos-time">${planet.timeLabel}</div>
      `;
      card.addEventListener('click', () => window.Dashboard.selectPlanet(planet.id));
      grid.appendChild(card);
    });

    container.appendChild(grid);
  },

  // ─── VARIANT 3: TABLA — Rhythmic beat visualizer with tala circles ───
  renderTabla(container, planets, activePlanet) {
    container.innerHTML = '';
    container.className = 'dash-tabla';

    const header = document.createElement('div');
    header.className = 'tabla-header';
    header.innerHTML = `
      <div class="tabla-active-info">
        <span class="tabla-symbol" style="color:${activePlanet.glowColor}">${activePlanet.symbol}</span>
        <span class="tabla-raga-name">${activePlanet.raga}</span>
        <span class="tabla-tala">Tāḷa: ${activePlanet.tala}</span>
      </div>
    `;
    container.appendChild(header);

    // Tala beat circles (teental = 16 beats)
    const talaSection = document.createElement('div');
    talaSection.className = 'tabla-tala-section';
    const beats = 16;
    for (let i = 0; i < beats; i++) {
      const beat = document.createElement('div');
      beat.className = 'tala-beat';
      beat.setAttribute('data-beat', i);
      const isVibhag = [0, 4, 8, 12].includes(i);
      const isSam = i === 0;
      if (isSam) beat.classList.add('sam');
      else if (isVibhag) beat.classList.add('vibhag');
      beat.textContent = isSam ? 'X' : (isVibhag ? '2' : '•');
      talaSection.appendChild(beat);
    }
    container.appendChild(talaSection);

    // Planet list as rhythm cards
    const planetList = document.createElement('div');
    planetList.className = 'tabla-planet-list';

    planets.forEach(planet => {
      const row = document.createElement('div');
      row.className = `tabla-planet-row ${planet.id === activePlanet.id ? 'tabla-active-row' : ''}`;
      row.setAttribute('data-planet', planet.id);
      row.style.setProperty('--pc', planet.color);
      row.innerHTML = `
        <span class="tpr-sym">${planet.symbol}</span>
        <span class="tpr-name">${planet.name}</span>
        <span class="tpr-raga">${planet.raga}</span>
        <span class="tpr-time">${planet.timeLabel}</span>
        <div class="tpr-bar"><div class="tpr-fill" style="background:${planet.color}"></div></div>
      `;
      row.addEventListener('click', () => window.Dashboard.selectPlanet(planet.id));
      planetList.appendChild(row);
    });

    container.appendChild(planetList);

    // Animate the beat
    this._startTalaAnimation(talaSection, activePlanet);
  },

  _talaInterval: null,
  _startTalaAnimation(section, planet) {
    clearInterval(this._talaInterval);
    let beat = 0;
    const beats = section.querySelectorAll('.tala-beat');
    const tempos = { 'surya': 100, 'chandra': 60, 'mangala': 120, 'budha': 110, 'guru': 80, 'shukra': 70, 'shani': 50, 'rahu': 75, 'ketu': 85 };
    const bpm = tempos[planet.id] || 80;
    const ms = 60000 / bpm / 2;

    this._talaInterval = setInterval(() => {
      beats.forEach(b => b.classList.remove('current-beat'));
      if (beats[beat]) {
        beats[beat].classList.add('current-beat');
        beats[beat].style.setProperty('--pc', planet.color);
      }
      beat = (beat + 1) % 16;
    }, ms);
  },

  // ─── VARIANT 4: YANTRA — Geometric Sri Yantra-inspired layout ───
  renderYantra(container, planets, activePlanet) {
    container.innerHTML = '';
    container.className = 'dash-yantra';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 700 500');
    svg.style.cssText = 'width:100%;height:100%;overflow:visible;';

    // Yantra-inspired background triangles
    const triangles = [
      'M350,30 L620,450 L80,450 Z',
      'M350,100 L560,400 L140,400 Z',
      'M350,470 L80,50 L620,50 Z',
      'M350,380 L180,80 L520,80 Z'
    ];

    triangles.forEach((d, i) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', `rgba(255,200,80,${0.08 + i * 0.02})`);
      path.setAttribute('stroke-width', '1');
      svg.appendChild(path);
    });

    // Inner petals (lotus pattern)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x1 = 350 + Math.cos(angle) * 80;
      const y1 = 250 + Math.sin(angle) * 80;
      const x2 = 350 + Math.cos(angle + Math.PI / 8) * 50;
      const y2 = 250 + Math.sin(angle + Math.PI / 8) * 50;
      const petal = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      petal.setAttribute('cx', x1);
      petal.setAttribute('cy', y1);
      petal.setAttribute('rx', 30);
      petal.setAttribute('ry', 12);
      petal.setAttribute('transform', `rotate(${(i / 8) * 360 + 90},${x1},${y1})`);
      petal.setAttribute('fill', `rgba(255,180,50,0.04)`);
      petal.setAttribute('stroke', `rgba(255,200,80,0.12)`);
      svg.appendChild(petal);
    }

    // Center active planet
    const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerCircle.setAttribute('cx', 350);
    centerCircle.setAttribute('cy', 250);
    centerCircle.setAttribute('r', 50);
    centerCircle.setAttribute('fill', activePlanet.color + '22');
    centerCircle.setAttribute('stroke', activePlanet.color);
    centerCircle.setAttribute('stroke-width', '2');
    svg.appendChild(centerCircle);

    const centerSym = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    centerSym.setAttribute('x', 350);
    centerSym.setAttribute('y', 242);
    centerSym.setAttribute('text-anchor', 'middle');
    centerSym.setAttribute('fill', activePlanet.glowColor);
    centerSym.setAttribute('font-size', '28');
    centerSym.textContent = activePlanet.symbol;
    svg.appendChild(centerSym);

    const centerRaga = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    centerRaga.setAttribute('x', 350);
    centerRaga.setAttribute('y', 262);
    centerRaga.setAttribute('text-anchor', 'middle');
    centerRaga.setAttribute('fill', activePlanet.glowColor);
    centerRaga.setAttribute('font-size', '9');
    centerRaga.setAttribute('font-family', 'serif');
    centerRaga.textContent = activePlanet.raga;
    svg.appendChild(centerRaga);

    // 9 planets around yantra
    const positions = [
      [350, 70], [550, 120], [610, 280], [540, 420], [350, 460],
      [160, 420], [90, 280], [150, 120], [350, 160]
    ];

    planets.slice(0, 9).forEach((planet, i) => {
      if (!positions[i]) return;
      const [px, py] = positions[i];
      const isActive = planet.id === activePlanet.id;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.style.cursor = 'pointer';
      g.setAttribute('data-planet', planet.id);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', 350);
      line.setAttribute('y1', 250);
      line.setAttribute('x2', px);
      line.setAttribute('y2', py);
      line.setAttribute('stroke', planet.color + '33');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);

      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', px);
      dot.setAttribute('cy', py);
      dot.setAttribute('r', isActive ? 24 : 18);
      dot.setAttribute('fill', planet.color + (isActive ? '44' : '22'));
      dot.setAttribute('stroke', planet.color);
      dot.setAttribute('stroke-width', isActive ? '2' : '1');

      const sym = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      sym.setAttribute('x', px);
      sym.setAttribute('y', py + 5);
      sym.setAttribute('text-anchor', 'middle');
      sym.setAttribute('fill', planet.glowColor);
      sym.setAttribute('font-size', '14');
      sym.textContent = planet.symbol;

      g.appendChild(dot);
      g.appendChild(sym);
      svg.appendChild(g);
      g.addEventListener('click', () => window.Dashboard.selectPlanet(planet.id));
    });

    container.appendChild(svg);
  },

  render(variant, container, planets, activePlanet) {
    const renders = {
      mandala: this.renderMandala.bind(this),
      cosmos:  this.renderCosmos.bind(this),
      tabla:   this.renderTabla.bind(this),
      yantra:  this.renderYantra.bind(this)
    };
    (renders[variant] || renders.mandala)(container, planets, activePlanet);
  },

  stopAnimations() {
    clearInterval(this._talaInterval);
  }
};

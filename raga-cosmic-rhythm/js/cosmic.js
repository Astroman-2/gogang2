/* ═══════════════════════════════════════════════
   COSMIC.JS — Starfield, Sun/Moon, Mandala, Time Wheel
═══════════════════════════════════════════════ */

// ── STARFIELD ──────────────────────────────────
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.2,
      opacity: Math.random() * 0.7 + 0.1,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2
    }));
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.01;
    stars.forEach(s => {
      const op = s.opacity * (0.5 + 0.5 * Math.sin(t * s.twinkleSpeed * 60 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,248,230,${op})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

// ── SUN / MOON ORB ─────────────────────────────
function updateSunMoonOrb(hour) {
  const orb = document.getElementById('sun-moon-orb');
  const label = document.getElementById('cycle-label');
  if (!orb) return;

  // Daytime: 6–18, night otherwise
  const isDaytime = hour >= 6 && hour < 18;
  const progress = isDaytime ? (hour - 6) / 12 : (hour < 6 ? (hour + 6) / 12 : (hour - 18) / 12);

  // Position arc across top
  const x = 10 + 80 * (isDaytime ? progress : 1 - progress);
  const y = isDaytime ? 8 + Math.sin(progress * Math.PI) * (-4) : 4;

  orb.style.right = `${100 - x}%`;
  orb.style.top = `${y}%`;

  if (isDaytime) {
    orb.style.background = 'radial-gradient(circle, #ffe566, #ffa500)';
    if (label) label.textContent = '☀ SOLAR PHASE';
  } else {
    orb.style.background = 'radial-gradient(circle, #d0e8ff, #7090cc)';
    if (label) label.textContent = '☽ LUNAR PHASE';
  }
}

// ── CLOCK ──────────────────────────────────────
function updateClock() {
  const el = document.getElementById('time-display');
  if (!el) return;
  const now = new Date();
  const h = now.getHours().toString().padStart(2,'0');
  const m = now.getMinutes().toString().padStart(2,'0');
  const s = now.getSeconds().toString().padStart(2,'0');
  el.textContent = `${h}:${m}:${s}`;
  updateSunMoonOrb(now.getHours());
}
setInterval(updateClock, 1000);
updateClock();

// ── CURRENT RAGA BY HOUR ───────────────────────
function getRagaForHour(hour) {
  for (const r of RAGAS) {
    const [startStr] = r.hours.split('–');
    const start = parseInt(startStr.trim());
    const endStr = r.hours.split('–')[1];
    const endH = parseInt(endStr.trim());
    const end = endH < start ? endH + 24 : endH;
    const h = hour < start ? hour + 24 : hour;
    if (h >= start && h < end) return r;
  }
  // Fallback to nearest
  return RAGAS[0];
}

function updateCurrentRagaBadge() {
  const badge = document.getElementById('current-raga-badge');
  const hour = new Date().getHours();
  const raga = getRagaForHour(hour);
  if (badge && raga) badge.textContent = raga.name;
  return raga;
}

function updateHeroCycleCard() {
  const hour = new Date().getHours();
  const raga = getRagaForHour(hour);
  if (!raga) return;

  const nameEl = document.getElementById('hero-raga-name');
  const metaEl = document.getElementById('hero-raga-meta');
  const descEl = document.getElementById('hero-raga-desc');
  const notesEl = document.getElementById('raga-notes-display');

  if (nameEl) nameEl.textContent = raga.name;
  if (metaEl) metaEl.textContent = `${raga.time.toUpperCase()} · ${raga.hours} · ${raga.tradition} · Vādī: ${raga.vadi}`;
  if (descEl) descEl.textContent = raga.description;
  if (notesEl) {
    notesEl.innerHTML = raga.arohana.map(n => `<span class="note-pill">${n}</span>`).join('');
  }
}

// ── MANDALA ────────────────────────────────────
function drawMandala() {
  const canvas = document.getElementById('mandala-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;

  ctx.clearRect(0, 0, W, H);

  // Background
  const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cx);
  bgGrad.addColorStop(0, 'rgba(20,25,48,0.95)');
  bgGrad.addColorStop(1, 'rgba(5,8,16,0.9)');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, cx, 0, Math.PI * 2);
  ctx.fill();

  // Draw concentric petal rings
  const rings = [
    { r: 30, petals: 6, color: '#e8a94a', inner: 0.5 },
    { r: 60, petals: 8, color: '#9b7fcf', inner: 0.6 },
    { r: 90, petals: 12, color: '#2ab8b0', inner: 0.65 },
    { r: 120, petals: 16, color: '#e05c1a', inner: 0.7 },
    { r: 150, petals: 22, color: '#e8a94a', inner: 0.75 }
  ];

  rings.forEach(ring => {
    for (let i = 0; i < ring.petals; i++) {
      const angle = (i / ring.petals) * Math.PI * 2;
      const x1 = cx + Math.cos(angle) * ring.r * ring.inner;
      const y1 = cy + Math.sin(angle) * ring.r * ring.inner;
      const x2 = cx + Math.cos(angle) * ring.r;
      const y2 = cy + Math.sin(angle) * ring.r;
      const xc = cx + Math.cos(angle + Math.PI / ring.petals) * ring.r * 0.6;
      const yc = cy + Math.sin(angle + Math.PI / ring.petals) * ring.r * 0.6;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(x1, y1, x2, y2);
      ctx.quadraticCurveTo(xc, yc, cx, cy);
      ctx.fillStyle = ring.color + '40';
      ctx.fill();
      ctx.strokeStyle = ring.color + '80';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  });

  // Circle rings
  [20, 45, 75, 105, 135, 155].forEach((r, i) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(232,169,74,${0.1 + i * 0.04})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  });

  // Center gem
  const gemGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
  gemGrad.addColorStop(0, '#fff8e7');
  gemGrad.addColorStop(0.5, '#e8a94a');
  gemGrad.addColorStop(1, '#9a6f2e');
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fillStyle = gemGrad;
  ctx.fill();
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#e8a94a';
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ── 24-HOUR TIME WHEEL (Dashboard) ────────────────
function drawTimeWheel() {
  const canvas = document.getElementById('time-wheel');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2, R = Math.min(cx, cy) - 12;

  ctx.clearRect(0, 0, W, H);

  const segColors = {
    dawn: '#9b7fcf', morning: '#ffce7a', afternoon: '#8be8ff',
    evening: '#ff8c69', night: '#5c6bc0', midnight: '#2d1b5c'
  };

  // Draw 24-hour arcs for each raga
  RAGAS.forEach((raga) => {
    const [s, e] = raga.hours.split('–').map(t => parseInt(t.trim()));
    const start = ((s - 6) / 24) * Math.PI * 2 - Math.PI / 2;
    const end   = ((e - 6) / 24) * Math.PI * 2 - Math.PI / 2;
    const col = segColors[raga.filter] || '#666';

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, start, end);
    ctx.closePath();
    ctx.fillStyle = col + '28';
    ctx.fill();
    ctx.strokeStyle = col + '80';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label
    const midAngle = (start + end) / 2;
    const lx = cx + Math.cos(midAngle) * (R * 0.7);
    const ly = cy + Math.sin(midAngle) * (R * 0.7);
    ctx.font = '7px Space Mono, monospace';
    ctx.fillStyle = col;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = raga.name.replace('Rāga ', '').substring(0, 8);
    ctx.fillText(label, lx, ly);
  });

  // Current hour hand
  const hour = new Date().getHours() + new Date().getMinutes() / 60;
  const hourAngle = ((hour - 6) / 24) * Math.PI * 2 - Math.PI / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(hourAngle) * R * 0.9, cy + Math.sin(hourAngle) * R * 0.9);
  ctx.strokeStyle = '#e8a94a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Center
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#e8a94a';
  ctx.fill();

  // Hour ticks
  for (let h = 0; h < 24; h++) {
    const a = ((h - 6) / 24) * Math.PI * 2 - Math.PI / 2;
    const inner = h % 6 === 0 ? R - 14 : R - 8;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
    ctx.strokeStyle = h % 6 === 0 ? 'rgba(232,169,74,0.6)' : 'rgba(255,255,255,0.15)';
    ctx.lineWidth = h % 6 === 0 ? 1.5 : 0.5;
    ctx.stroke();
  }
}

// ── RAGA WHEEL SMALL ───────────────────────────
function drawRagaWheelSmall() {
  const canvas = document.getElementById('raga-wheel-small');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2, R = cx - 10;

  ctx.clearRect(0, 0, W, H);

  const sliceAngle = (Math.PI * 2) / RAGAS.length;
  RAGAS.forEach((raga, i) => {
    const start = i * sliceAngle - Math.PI / 2;
    const end   = start + sliceAngle;
    const col1  = raga.colors[0] || '#666';
    const col2  = raga.colors[1] || '#999';

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, start, end);
    ctx.closePath();

    const grad = ctx.createLinearGradient(cx, cy, cx + Math.cos((start+end)/2)*R, cy + Math.sin((start+end)/2)*R);
    grad.addColorStop(0, col1 + '60');
    grad.addColorStop(1, col2 + 'aa');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#050810';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Short label
    const midAngle = (start + end) / 2;
    const lx = cx + Math.cos(midAngle) * (R * 0.72);
    const ly = cy + Math.sin(midAngle) * (R * 0.72);
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(midAngle + Math.PI / 2);
    ctx.font = 'bold 7px Space Mono, monospace';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(raga.name.replace('Rāga ','').substring(0,6), 0, 0);
    ctx.restore();
  });

  // Inner circle
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#0b0f1e';
  ctx.fill();
  ctx.strokeStyle = '#e8a94a40';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ── HEATMAP ────────────────────────────────────
function drawHeatmap() {
  const canvas = document.getElementById('heatmap-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const hours = 24;
  const cellW = W / hours;

  // Simulated listening data per hour (0-100%)
  const data = [
    15, 28, 42, 60, 75, 82, 88, 90, 85, 78, 70, 65,
    62, 60, 55, 65, 72, 88, 92, 85, 78, 65, 50, 30
  ];

  data.forEach((val, h) => {
    const ratio = val / 100;
    const x = h * cellW;
    const heightFill = H * ratio;

    // Color by time of day
    let r, g, b;
    if (h >= 4 && h < 7)       { r=155; g=132; b=205; } // dawn
    else if (h >= 7 && h < 12) { r=255; g=206; b=122; } // morning
    else if (h >= 12 && h < 16){ r=139; g=232; b=255; } // afternoon
    else if (h >= 16 && h < 20){ r=255; g=140; b=105; } // evening
    else if (h >= 20 && h < 23){ r=92; g=107; b=192; }  // night
    else                        { r=45; g=35; b=90; }    // midnight

    const grad = ctx.createLinearGradient(0, H - heightFill, 0, H);
    grad.addColorStop(0, `rgba(${r},${g},${b},0.9)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0.2)`);
    ctx.fillStyle = grad;
    ctx.fillRect(x + 1, H - heightFill, cellW - 2, heightFill);

    // Hour tick
    if (h % 3 === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(x, H - 4, 1, 4);
    }
  });

  // Current hour line
  const nowH = new Date().getHours();
  const nowX = nowH * cellW + cellW / 2;
  ctx.beginPath();
  ctx.moveTo(nowX, 0);
  ctx.lineTo(nowX, H);
  ctx.strokeStyle = '#e8a94a';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.stroke();
  ctx.setLineDash([]);
}

// ── SOLAR SYSTEM CANVAS ────────────────────────
function drawSolarSystem() {
  const canvas = document.getElementById('solar-system-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W/2, cy = H/2;
  let hoverPlanet = null;

  const planets = [
    { name: 'Sun',     raga: 'Bilaval',   r: 18, orbit: 0,  color: '#ffe066', angle: 0 },
    { name: 'Moon',    raga: 'Bhairavī',  r: 8,  orbit: 52, color: '#c9d6ff', angle: 0.5 },
    { name: 'Mercury', raga: 'Tōḍī',     r: 5,  orbit: 78, color: '#90e0ef', angle: 1.2 },
    { name: 'Venus',   raga: 'Yaman',     r: 9,  orbit: 102, color: '#e8a4e6', angle: 2.1 },
    { name: 'Mars',    raga: 'Kāfī',     r: 7,  orbit: 130, color: '#ff6b6b', angle: 0.8 },
    { name: 'Jupiter', raga: 'Laḷit',   r: 13, orbit: 158, color: '#ffd166', angle: 1.5 },
    { name: 'Saturn',  raga: 'Darbārī', r: 11, orbit: 178, color: '#9fa8da', angle: 2.8 }
  ];

  let speeds = [0, 0.008, 0.012, 0.007, 0.005, 0.003, 0.002];
  let angles = planets.map(p => p.angle);

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Space bg
    ctx.fillStyle = '#050810';
    ctx.fillRect(0, 0, W, H);

    // Orbit rings
    planets.forEach((p, i) => {
      if (p.orbit === 0) return;
      ctx.beginPath();
      ctx.arc(cx, cy, p.orbit, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // Planets
    planets.forEach((p, i) => {
      angles[i] = (angles[i] + (speeds[i] || 0)) % (Math.PI * 2);
      const px = i === 0 ? cx : cx + Math.cos(angles[i]) * p.orbit;
      const py = i === 0 ? cy : cy + Math.sin(angles[i]) * p.orbit;

      // Glow
      const glow = ctx.createRadialGradient(px, py, 0, px, py, p.r * 3);
      glow.addColorStop(0, p.color + '60');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, p.r * 3, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      // Hover label
      if (hoverPlanet === i) {
        ctx.fillStyle = 'rgba(5,8,16,0.85)';
        const lx = px + p.r + 4;
        const ly = py - p.r;
        ctx.fillRect(lx, ly - 14, 110, 38);
        ctx.strokeStyle = p.color + '80';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(lx, ly - 14, 110, 38);
        ctx.fillStyle = p.color;
        ctx.font = 'bold 10px Space Mono';
        ctx.fillText(p.name, lx + 6, ly);
        ctx.fillStyle = '#ddd3c0';
        ctx.font = '9px Cormorant Garamond, serif';
        ctx.fillText('Rāga ' + p.raga, lx + 6, ly + 14);
      }

      p._px = px; p._py = py;
    });

    requestAnimationFrame(draw);
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top)  * (H / rect.height);
    hoverPlanet = null;
    planets.forEach((p, i) => {
      if (p._px !== undefined) {
        const dx = mx - p._px, dy = my - p._py;
        if (Math.sqrt(dx*dx + dy*dy) < p.r + 8) hoverPlanet = i;
      }
    });
  });

  draw();
}

// ── RASA WHEEL ─────────────────────────────────
function drawRasaWheel() {
  const canvas = document.getElementById('rasa-wheel');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W/2, cy = H/2, R = cx - 12;

  const rasas = [
    { name: 'Śṛṅgāra', meaning: 'Love',      color: '#e8a4e6' },
    { name: 'Hāsya',   meaning: 'Joy',        color: '#ffe066' },
    { name: 'Karuṇā',  meaning: 'Pathos',     color: '#90caf9' },
    { name: 'Raudra',  meaning: 'Fury',        color: '#ff6b6b' },
    { name: 'Vīra',    meaning: 'Heroism',    color: '#ffd166' },
    { name: 'Bhayānaka', meaning: 'Terror',   color: '#546e7a' },
    { name: 'Bībhatsa', meaning: 'Disgust',   color: '#78909c' },
    { name: 'Adbhuta', meaning: 'Wonder',     color: '#2ab8b0' },
    { name: 'Śānta',   meaning: 'Serenity',   color: '#a5d6a7' }
  ];

  const sliceAngle = (Math.PI * 2) / rasas.length;
  rasas.forEach((rasa, i) => {
    const start = i * sliceAngle - Math.PI / 2;
    const end = start + sliceAngle;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, start, end);
    ctx.closePath();
    ctx.fillStyle = rasa.color + '50';
    ctx.fill();
    ctx.strokeStyle = rasa.color;
    ctx.lineWidth = 1;
    ctx.stroke();

    const mid = (start + end) / 2;
    const lx = cx + Math.cos(mid) * R * 0.68;
    const ly = cy + Math.sin(mid) * R * 0.68;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(mid + Math.PI/2);
    ctx.font = '7px Space Mono, monospace';
    ctx.fillStyle = rasa.color;
    ctx.textAlign = 'center';
    ctx.fillText(rasa.name, 0, 0);
    ctx.font = '6px serif';
    ctx.fillStyle = '#aaa';
    ctx.fillText(rasa.meaning, 0, 8);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(cx, cy, 16, 0, Math.PI*2);
  ctx.fillStyle = '#0b0f1e';
  ctx.fill();
  ctx.strokeStyle = '#e8a94a40';
  ctx.stroke();
}

// ── MELAKARTA VISUALIZATION ────────────────────
function drawMelakartaVis() {
  const canvas = document.getElementById('melakarta-vis');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Simplified grid showing 72 melakartas as colored cells
  const cols = 12, rows = 6;
  const cw = W / cols - 2, ch = H / rows - 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const hue = (idx / 72) * 300 + 30;
      ctx.fillStyle = `hsla(${hue},60%,45%,0.7)`;
      ctx.fillRect(c * (cw + 2) + 1, r * (ch + 2) + 1, cw, ch);
    }
  }

  ctx.font = '9px Space Mono';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.textAlign = 'center';
  ctx.fillText('72 Parent Scales', W/2, H - 2);
}

// Initialize all cosmic visuals
window.addEventListener('load', () => {
  drawMandala();
  drawTimeWheel();
  drawRagaWheelSmall();
  drawHeatmap();
  setInterval(drawTimeWheel, 30000);
  setInterval(drawHeatmap, 60000);
  setTimeout(drawRasaWheel, 500);
  setTimeout(drawMelakartaVis, 500);
  setTimeout(drawSolarSystem, 800);
  updateCurrentRagaBadge();
  updateHeroCycleCard();
  setInterval(updateCurrentRagaBadge, 60000);
});

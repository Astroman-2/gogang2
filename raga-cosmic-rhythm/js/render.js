/* ═══════════════════════════════════════════════
   RENDER.JS — Dynamic content rendering
═══════════════════════════════════════════════ */

// ── RAGA CAROUSEL BAND ─────────────────────────
function renderRagaBand() {
  const track = document.getElementById('raga-carousel-track');
  if (!track) return;
  const hour = new Date().getHours();
  const currentRaga = getRagaForHour(hour);

  // Duplicate for infinite scroll
  const items = [...RAGAS, ...RAGAS].map(r =>
    `<span class="band-item ${r.id === currentRaga.id ? 'band-current' : ''}"
           onclick="openRagaModal(${r.id - 1})">
      ${r.name} <span style="opacity:0.4">·</span>
      <span style="font-family:var(--font-mono);font-size:0.6em;opacity:0.6">${r.hours}</span>
    </span>`
  ).join('');
  track.innerHTML = items;
}

// ── RAGA GRID ──────────────────────────────────
function renderRagaGrid() {
  const grid = document.getElementById('raga-grid');
  if (!grid) return;

  const hour = new Date().getHours();
  const currentRaga = getRagaForHour(hour);

  grid.innerHTML = RAGAS.map((raga, i) => `
    <div class="raga-card" data-filter="${raga.filter}"
         style="--c1:${raga.colors[0]};--c2:${raga.colors[1]}"
         onclick="openRagaModal(${i})">
      <div class="raga-card-number">0${i+1 < 10 ? '0' : ''}${i+1} · ${raga.tradition}</div>
      <div class="raga-card-name">${raga.name}</div>
      <div class="raga-card-time" style="color:${raga.colorTime}">${raga.time} · ${raga.hours}</div>
      <div class="raga-card-rasa">${raga.rasa}</div>
      <div class="raga-card-notes">
        ${raga.arohana.slice(0,6).map(n => `<span class="note-pill">${n}</span>`).join('')}
      </div>
      ${raga.id === currentRaga.id ? '<div class="listen-current-indicator" style="margin-top:0.8rem">● NOW PLAYING THIS HOUR</div>' : ''}
    </div>
  `).join('');
}

// ── RAGA MODAL ─────────────────────────────────
function openRagaModal(index) {
  const raga = RAGAS[index];
  if (!raga) return;

  const html = `
    <div class="modal-raga-title">${raga.name}</div>
    <div style="font-size:1.3rem;color:var(--text-dim);font-family:var(--font-body);margin-bottom:0.3rem">${raga.hindi}</div>
    <div class="modal-raga-subtitle">${raga.tradition} · ${raga.time} · ${raga.hours}</div>
    <div class="modal-grid">
      <div class="modal-info-item"><label>Rasa</label><span>${raga.rasa}</span></div>
      <div class="modal-info-item"><label>Thaat</label><span>${raga.thaat}</span></div>
      <div class="modal-info-item"><label>Vādī (dominant)</label><span>${raga.vadi}</span></div>
      <div class="modal-info-item"><label>Samvādī</label><span>${raga.samvadi}</span></div>
      <div class="modal-info-item"><label>Season</label><span>${raga.season}</span></div>
      <div class="modal-info-item"><label>Planet</label><span>${raga.planet}</span></div>
    </div>
    <div style="margin-bottom:1rem">
      <div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--text-dim);letter-spacing:0.15em;margin-bottom:0.4rem">ĀROHA (ASCENT)</div>
      <div style="display:flex;flex-wrap:wrap;gap:0.4rem">
        ${raga.arohana.map(n => `<span class="note-pill">${n}</span>`).join('')}
      </div>
    </div>
    <div style="margin-bottom:1rem">
      <div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--text-dim);letter-spacing:0.15em;margin-bottom:0.4rem">AVAROHA (DESCENT)</div>
      <div style="display:flex;flex-wrap:wrap;gap:0.4rem">
        ${raga.avarohana.map(n => `<span class="note-pill">${n}</span>`).join('')}
      </div>
    </div>
    <div style="margin-bottom:1rem">
      <div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--text-dim);letter-spacing:0.15em;margin-bottom:0.4rem">PAKAḌ (CHARACTERISTIC PHRASE)</div>
      <div style="font-family:var(--font-mono);font-size:0.85rem;color:var(--teal)">${raga.pakad}</div>
    </div>
    <p style="font-size:1rem;line-height:1.7;margin-bottom:1rem">${raga.description}</p>
    <div class="theory-box">
      <h4>Research Connection</h4>
      <p style="font-size:0.9rem">${raga.research}</p>
    </div>
    <div style="margin-top:1.5rem;display:flex;gap:1rem">
      <button class="cta-btn" onclick="setPlayerRaga(${index});closeModal();">
        ▶ Play This Rāga
      </button>
    </div>
  `;
  openModal(html);
}

// ── EVOLUTION TIMELINE ─────────────────────────
function renderEvolutionTimeline() {
  const container = document.getElementById('evo-timeline-full');
  if (!container) return;

  container.innerHTML = TIMELINE_EVENTS.map((ev, i) => `
    <div class="evo-entry" style="--i:${i}">
      <div class="evo-entry-year">${ev.year}</div>
      <div class="evo-entry-title">${ev.title}</div>
      <div class="evo-entry-text">${ev.text}</div>
    </div>
  `).join('');
}

// ── RESEARCH GRID ──────────────────────────────
function renderResearchGrid() {
  const grid = document.getElementById('research-grid');
  if (!grid) return;

  grid.innerHTML = RESEARCH_PAPERS.map(p => `
    <div class="research-card">
      <span class="research-badge" style="background:${p.color}20;border:1px solid ${p.color}40;color:${p.color}">
        ${p.category}
      </span>
      <h3>${p.title}</h3>
      <p>${p.abstract}</p>
      <div class="research-meta">
        <span>${p.source}</span>
        <span>${p.year}</span>
        <span>Impact: <strong style="color:${p.color}">${p.impact}</strong></span>
      </div>
      <div class="research-vis">
        <canvas class="research-mini-chart" data-id="${p.id}" width="300" height="60"></canvas>
      </div>
    </div>
  `).join('');

  // Draw mini charts on each research card
  document.querySelectorAll('.research-mini-chart').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const n = 20;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = (i / (n-1)) * W;
      const y = H - (0.2 + 0.7 * Math.pow(i / n, 1.5) + 0.1 * Math.sin(i * 1.2)) * H;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#e8a94a80';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = 'rgba(232,169,74,0.06)';
    ctx.fill();
  });
}

// ── PRAHAR TABLE ───────────────────────────────
function renderPraharTable() {
  const container = document.getElementById('prahar-table');
  if (!container) return;

  const tableHTML = `
    <table class="prahar-table">
      <thead>
        <tr>
          <th>Prahar</th>
          <th>Time</th>
          <th>Period</th>
          <th>Rāgas</th>
        </tr>
      </thead>
      <tbody>
        ${PRAHAR_DATA.map(p => `
          <tr>
            <td><span class="time-dot" style="background:${p.color}"></span>${p.prahar}</td>
            <td style="font-family:var(--font-mono);font-size:0.75rem;color:${p.color}">${p.time}</td>
            <td>${p.type}</td>
            <td style="font-style:italic;font-size:0.88rem">${p.ragas}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  container.innerHTML = tableHTML;
}

function renderGrahaTable() {
  const container = document.getElementById('graha-table');
  if (!container) return;

  const tableHTML = `
    <table class="graha-table">
      <thead>
        <tr>
          <th>Planet (Graha)</th>
          <th>Rāga</th>
          <th>Frequency</th>
        </tr>
      </thead>
      <tbody>
        ${GRAHA_DATA.map(g => `
          <tr>
            <td><span class="time-dot" style="background:${g.color}"></span>${g.planet}</td>
            <td style="font-style:italic;color:var(--gold)">${g.raga}</td>
            <td style="font-family:var(--font-mono);font-size:0.75rem;color:${g.color}">${g.freq}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  container.innerHTML = tableHTML;
}

// ── INFOGRAPHICS ───────────────────────────────
function renderInfographics() {
  const grid = document.getElementById('infograph-grid');
  if (!grid) return;

  grid.innerHTML = INFOGRAPH_ITEMS.map((item, i) => `
    <div class="infograph-card">
      <div class="infograph-header">
        <h3>${item.title}</h3>
        <p style="font-size:0.85rem;color:var(--text-dim);margin-top:0.3rem">${item.desc}</p>
      </div>
      <div class="infograph-body">
        <canvas id="infograph-canvas-${i}" width="380" height="220"></canvas>
      </div>
    </div>
  `).join('');

  // Draw illustrative canvases for each infographic
  INFOGRAPH_ITEMS.forEach((item, i) => {
    const canvas = document.getElementById(`infograph-canvas-${i}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    drawInfographVis(ctx, canvas.width, canvas.height, item.type, i);
  });
}

function drawInfographVis(ctx, W, H, type, idx) {
  ctx.clearRect(0, 0, W, H);
  const colors = ['#e8a94a','#2ab8b0','#9b7fcf','#e05c1a','#4a6fa5','#f4a261'];

  if (type === 'wheel') {
    // Emotion wheel
    const cx = W/2, cy = H/2, R = Math.min(cx,cy) - 14;
    const labels = ['Love','Joy','Pathos','Fury','Heroism','Terror','Disgust','Wonder','Peace'];
    labels.forEach((l, i) => {
      const start = (i/labels.length)*Math.PI*2 - Math.PI/2;
      const end = ((i+1)/labels.length)*Math.PI*2 - Math.PI/2;
      const hue = i*40;
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.arc(cx,cy,R,start,end);
      ctx.closePath();
      ctx.fillStyle = `hsla(${hue},55%,45%,0.7)`;
      ctx.fill();
      const mid = (start+end)/2;
      ctx.fillStyle = '#fff';
      ctx.font = '9px Space Mono';
      ctx.textAlign = 'center';
      ctx.fillText(l, cx+Math.cos(mid)*R*0.7, cy+Math.sin(mid)*R*0.7+3);
    });
    ctx.beginPath();
    ctx.arc(cx,cy,20,0,Math.PI*2);
    ctx.fillStyle = '#0b0f1e';
    ctx.fill();
  }
  else if (type === 'svara') {
    // 22 shrutis as horizontal bands
    const svaras = ['Sa','Re♭','Re','Ga♭','Ga','Ma','Ma#','Pa','Dha♭','Dha','Ni♭','Ni'];
    const barH = H / svaras.length - 2;
    svaras.forEach((s, i) => {
      const y = i * (barH + 2);
      const w = W * (0.4 + 0.5 * Math.random());
      ctx.fillStyle = colors[i % colors.length] + '60';
      ctx.fillRect(0, y, w, barH);
      ctx.fillStyle = '#ddd3c0';
      ctx.font = '9px Space Mono';
      ctx.textAlign = 'left';
      ctx.fillText(s, w + 6, y + barH/2 + 3);
    });
  }
  else if (type === 'tree') {
    // Simple tree diagram
    ctx.strokeStyle = '#e8a94a40';
    ctx.lineWidth = 0.5;
    // Root
    ctx.beginPath(); ctx.arc(W/2, 20, 10, 0, Math.PI*2);
    ctx.fillStyle = '#e8a94a'; ctx.fill();
    // Branches
    for (let b = 0; b < 6; b++) {
      const bx = (b + 0.5) * (W / 6);
      ctx.beginPath();
      ctx.moveTo(W/2, 30);
      ctx.lineTo(bx, 80);
      ctx.strokeStyle = '#e8a94a40';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(bx, 85, 8, 0, Math.PI*2);
      ctx.fillStyle = colors[b] + 'aa';
      ctx.fill();
      // Children
      for (let c = 0; c < 3; c++) {
        const cx2 = bx - 20 + c * 20;
        ctx.beginPath();
        ctx.moveTo(bx, 93);
        ctx.lineTo(cx2, 140);
        ctx.strokeStyle = colors[b] + '30';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx2, 144, 5, 0, Math.PI*2);
        ctx.fillStyle = colors[b] + '60';
        ctx.fill();
      }
    }
    ctx.fillStyle = 'rgba(180,170,155,0.5)';
    ctx.font = '8px Space Mono';
    ctx.textAlign = 'center';
    ctx.fillText('72 Parent Scales → 500+ Rāgas', W/2, H - 8);
  }
  else if (type === 'brain') {
    // Simulated brainwave chart
    const waves = [
      { label: 'Delta (0.5–4Hz)',  col: '#5c6bc0', val: 0.7 },
      { label: 'Theta (4–8Hz)',    col: '#9b7fcf', val: 0.85 },
      { label: 'Alpha (8–12Hz)',   col: '#2ab8b0', val: 0.95 },
      { label: 'Beta (12–30Hz)',   col: '#e8a94a', val: 0.45 },
      { label: 'Gamma (30+Hz)',    col: '#e05c1a', val: 0.30 }
    ];
    const barHeight = 28;
    waves.forEach((w, i) => {
      const y = i * (barHeight + 6) + 14;
      const barW = (W - 130) * w.val;
      const grad = ctx.createLinearGradient(130, y, 130 + barW, y);
      grad.addColorStop(0, w.col + 'cc');
      grad.addColorStop(1, w.col + '40');
      ctx.fillStyle = grad;
      ctx.fillRect(130, y, barW, barHeight);
      ctx.fillStyle = 'rgba(180,170,155,0.7)';
      ctx.font = '8px Space Mono';
      ctx.textAlign = 'right';
      ctx.fillText(w.label, 124, y + barHeight/2 + 3);
      ctx.fillStyle = w.col;
      ctx.textAlign = 'left';
      ctx.fillText(Math.round(w.val * 100) + '%', 130 + barW + 4, y + barHeight/2 + 3);
    });
    ctx.fillStyle = 'rgba(180,170,155,0.5)';
    ctx.font = '8px Space Mono';
    ctx.textAlign = 'center';
    ctx.fillText('During Rāga listening — enhanced alpha & theta', W/2, H - 4);
  }
  else {
    // Generic wave pattern
    ctx.beginPath();
    for (let x = 0; x < W; x++) {
      const y = H/2 + Math.sin(x * 0.05 + idx) * 40 + Math.sin(x * 0.02) * 20;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = colors[idx % colors.length];
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// ── LISTEN GRID ────────────────────────────────
function renderListenGrid() {
  const grid = document.getElementById('listen-grid');
  if (!grid) return;
  const hour = new Date().getHours();
  const currentRaga = getRagaForHour(hour);

  const sortedRagas = [...RAGAS].sort((a, b) => {
    const aStart = parseInt(a.hours.split('–')[0]);
    const bStart = parseInt(b.hours.split('–')[0]);
    return aStart - bStart;
  });

  grid.innerHTML = sortedRagas.map((raga, i) => {
    const origIdx = RAGAS.findIndex(r => r.id === raga.id);
    const isCurrent = raga.id === currentRaga.id;
    return `
      <div class="listen-card ${isCurrent ? 'is-current' : ''}" data-orig="${origIdx}">
        <div class="listen-time-badge" style="background:${raga.colors[0]}20;border:1px solid ${raga.colors[0]}40;color:${raga.colorTime}">
          ${raga.time} · ${raga.hours}
        </div>
        <div class="listen-raga-name">${raga.name}</div>
        <div style="font-size:0.75rem;color:var(--text-dim);font-family:var(--font-mono);margin-bottom:0.3rem">${raga.hindi} · ${raga.tradition}</div>
        <div class="listen-raga-rasa">${raga.rasa}</div>
        <div style="display:flex;flex-wrap:wrap;gap:0.3rem;margin-bottom:0.8rem">
          ${raga.arohana.slice(0,5).map(n => `<span class="note-pill">${n}</span>`).join('')}
        </div>
        <button class="listen-play-btn" onclick="setPlayerRaga(${origIdx})">
          ▶ Play ${raga.name}
        </button>
        <div class="listen-current-indicator">● RECOMMENDED FOR THIS HOUR</div>
      </div>
    `;
  }).join('');
}

// ── FULL TIMELINE ──────────────────────────────
function renderFullTimeline() {
  const container = document.getElementById('full-timeline');
  if (!container) return;

  container.innerHTML = TIMELINE_EVENTS.map((ev, i) => `
    <div class="timeline-entry" style="--i:${i}">
      <div class="timeline-year">${ev.year}</div>
      <div class="timeline-title">${ev.title}</div>
      <div class="timeline-text">${ev.text}</div>
    </div>
  `).join('');
}

// ── COMMUNITY ──────────────────────────────────
function renderCommunity() {
  const postsContainer = document.getElementById('community-posts');
  const ragaSelect = document.getElementById('post-raga');

  // Populate raga select
  if (ragaSelect) {
    ragaSelect.innerHTML = '<option value="">Select a Rāga…</option>' +
      RAGAS.map(r => `<option value="${r.name}">${r.name}</option>`).join('');
  }

  // Load stored + default posts
  const stored = JSON.parse(localStorage.getItem('raga-posts') || '[]');
  const allPosts = [...stored, ...COMMUNITY_POSTS_DEFAULT];

  function renderPosts(posts) {
    if (!postsContainer) return;
    postsContainer.innerHTML = posts.map(p => `
      <div class="community-post">
        <div class="post-header">
          <span class="post-author">${p.author}</span>
          <span>
            <span class="post-raga-tag">${p.raga}</span>
            &nbsp;${p.date}
          </span>
        </div>
        <div class="post-body">${p.text}</div>
      </div>
    `).join('');
  }

  renderPosts(allPosts);

  // Submit post
  const submitBtn = document.getElementById('submit-post');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const name    = document.getElementById('post-name')?.value.trim();
      const raga    = document.getElementById('post-raga')?.value;
      const content = document.getElementById('post-content')?.value.trim();
      if (!name || !raga || !content) {
        alert('Please fill in all fields.');
        return;
      }
      const newPost = { author: name, raga, date: 'Just now', text: content };
      const stored  = JSON.parse(localStorage.getItem('raga-posts') || '[]');
      stored.unshift(newPost);
      localStorage.setItem('raga-posts', JSON.stringify(stored.slice(0, 20)));
      document.getElementById('post-name').value = '';
      document.getElementById('post-raga').value = '';
      document.getElementById('post-content').value = '';
      renderPosts([...stored, ...COMMUNITY_POSTS_DEFAULT]);
    });
  }
}

window.addEventListener('load', () => {
  renderRagaBand();
  renderRagaGrid();
  renderEvolutionTimeline();
  renderResearchGrid();
  renderPraharTable();
  renderGrahaTable();
  renderInfographics();
  renderListenGrid();
  renderFullTimeline();
  renderCommunity();
});

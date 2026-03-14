/* ═══════════════════════════════════════════════
   CHARTS.JS — Analytics charts (vanilla canvas)
═══════════════════════════════════════════════ */

function drawBarChart() {
  const canvas = document.getElementById('bar-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const data = [
    { label: 'Yaman',    val: 92, color: '#e9c46a' },
    { label: 'Bhairavī', val: 88, color: '#9b7fcf' },
    { label: 'Darbārī',  val: 75, color: '#5c6bc0' },
    { label: 'Bhūpālī',  val: 71, color: '#f4a261' },
    { label: 'Tōḍī',    val: 65, color: '#2ab8b0' },
    { label: 'Bhairav',  val: 60, color: '#ffce7a' },
    { label: 'Mālkauns', val: 58, color: '#3d2f7a' },
    { label: 'Kāfī',    val: 54, color: '#e05c1a' },
    { label: 'Laḷit',   val: 50, color: '#c084fc' },
    { label: 'Bilaval',  val: 48, color: '#ffe099' },
    { label: 'Śivārañ.', val: 45, color: '#6d4c9e' },
    { label: 'Pūriyā',  val: 42, color: '#9b5de5' }
  ];

  const pad = { left: 40, right: 20, top: 20, bottom: 40 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const barW = chartW / data.length * 0.65;
  const maxVal = 100;

  // Grid lines
  for (let i = 0; i <= 5; i++) {
    const y = pad.top + chartH * (1 - i / 5);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.fillStyle = 'rgba(120,110,100,0.6)';
    ctx.font = '9px Space Mono';
    ctx.textAlign = 'right';
    ctx.fillText((i * 20) + 'k', pad.left - 4, y + 3);
  }

  // Bars
  data.forEach((d, i) => {
    const x = pad.left + (i / data.length) * chartW + (chartW / data.length - barW) / 2;
    const barH = (d.val / maxVal) * chartH;
    const y = pad.top + chartH - barH;

    const grad = ctx.createLinearGradient(x, y, x, y + barH);
    grad.addColorStop(0, d.color);
    grad.addColorStop(1, d.color + '40');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barW, barH);

    // Value
    ctx.fillStyle = d.color;
    ctx.font = 'bold 9px Space Mono';
    ctx.textAlign = 'center';
    ctx.fillText(d.val + 'k', x + barW/2, y - 4);

    // Label
    ctx.fillStyle = 'rgba(180,170,155,0.8)';
    ctx.font = '8px Space Mono';
    ctx.save();
    ctx.translate(x + barW/2, H - pad.bottom + 8);
    ctx.rotate(-Math.PI/5);
    ctx.fillText(d.label, 0, 0);
    ctx.restore();
  });
}

function drawDonutChart() {
  const canvas = document.getElementById('donut-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W/2, cy = H/2 - 10;
  const R = 90, r = 52;
  ctx.clearRect(0, 0, W, H);

  const slices = [
    { label: 'Dawn',      val: 22, color: '#9b7fcf' },
    { label: 'Morning',   val: 28, color: '#ffce7a' },
    { label: 'Afternoon', val: 12, color: '#8be8ff' },
    { label: 'Evening',   val: 25, color: '#ff8c69' },
    { label: 'Night',     val: 13, color: '#5c6bc0' }
  ];

  let total = slices.reduce((s, d) => s + d.val, 0);
  let start = -Math.PI / 2;

  slices.forEach(s => {
    const span = (s.val / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, start, start + span);
    ctx.closePath();
    ctx.fillStyle = s.color + 'cc';
    ctx.fill();
    ctx.strokeStyle = '#050810';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label
    const mid = start + span / 2;
    const lx = cx + Math.cos(mid) * (R * 0.7);
    const ly = cy + Math.sin(mid) * (R * 0.7);
    ctx.font = 'bold 9px Space Mono';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.val + '%', lx, ly);

    start += span;
  });

  // Hole
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#0b0f1e';
  ctx.fill();

  // Legend
  let ly = cy + R + 12;
  slices.forEach((s, i) => {
    const lx = 12 + (i % 3) * 80;
    if (i % 3 === 0 && i > 0) ly += 16;
    ctx.fillStyle = s.color;
    ctx.fillRect(lx, ly, 10, 10);
    ctx.fillStyle = 'rgba(180,170,155,0.8)';
    ctx.font = '8px Space Mono';
    ctx.textAlign = 'left';
    ctx.fillText(s.label, lx + 14, ly + 9);
  });
}

function drawLineChart() {
  const canvas = document.getElementById('line-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const years = [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024];
  const datasets = [
    { label: 'Neuroscience',   data: [12,18,24,32,40,52,68,82,96,118], color: '#2ab8b0' },
    { label: 'Music Therapy',  data: [8,10,15,22,30,44,58,72,88,104],  color: '#e8a94a' },
    { label: 'AI/Computation', data: [2,4,8,14,22,36,55,74,90,120],    color: '#9b7fcf' }
  ];

  const pad = { left: 36, right: 20, top: 16, bottom: 36 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const maxVal = 130;

  // Grid
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + chartH * (1 - i / 4);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.fillStyle = 'rgba(120,110,100,0.5)';
    ctx.font = '8px Space Mono';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(i * 32), pad.left - 4, y + 3);
  }

  // Year labels
  years.forEach((yr, i) => {
    const x = pad.left + (i / (years.length - 1)) * chartW;
    ctx.fillStyle = 'rgba(120,110,100,0.5)';
    ctx.font = '8px Space Mono';
    ctx.textAlign = 'center';
    ctx.fillText(yr, x, H - pad.bottom + 12);
  });

  // Lines
  datasets.forEach(ds => {
    ctx.beginPath();
    ds.data.forEach((val, i) => {
      const x = pad.left + (i / (ds.data.length - 1)) * chartW;
      const y = pad.top + chartH * (1 - val / maxVal);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = ds.color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Area fill
    ctx.beginPath();
    ds.data.forEach((val, i) => {
      const x = pad.left + (i / (ds.data.length - 1)) * chartW;
      const y = pad.top + chartH * (1 - val / maxVal);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(pad.left + chartW, pad.top + chartH);
    ctx.lineTo(pad.left, pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = ds.color + '18';
    ctx.fill();

    // Dots
    ds.data.forEach((val, i) => {
      const x = pad.left + (i / (ds.data.length - 1)) * chartW;
      const y = pad.top + chartH * (1 - val / maxVal);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = ds.color;
      ctx.fill();
    });
  });

  // Legend
  datasets.forEach((ds, i) => {
    const lx = pad.left + i * 130;
    ctx.fillStyle = ds.color;
    ctx.fillRect(lx, 4, 14, 3);
    ctx.fillStyle = 'rgba(180,170,155,0.8)';
    ctx.font = '8px Space Mono';
    ctx.textAlign = 'left';
    ctx.fillText(ds.label, lx + 18, 9);
  });
}

function drawRadarChart() {
  const canvas = document.getElementById('radar-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W/2, cy = H/2 + 10;
  const R = 90;
  ctx.clearRect(0, 0, W, H);

  const axes = [
    { label: 'Serenity',  val: 0.85 },
    { label: 'Romance',   val: 0.72 },
    { label: 'Devotion',  val: 0.90 },
    { label: 'Vitality',  val: 0.55 },
    { label: 'Depth',     val: 0.95 },
    { label: 'Joy',       val: 0.48 },
    { label: 'Longing',   val: 0.88 },
    { label: 'Awe',       val: 0.78 }
  ];

  const N = axes.length;
  const step = (Math.PI * 2) / N;

  // Grid rings
  [0.25, 0.5, 0.75, 1.0].forEach(scale => {
    ctx.beginPath();
    axes.forEach((_, i) => {
      const a = i * step - Math.PI / 2;
      const x = cx + Math.cos(a) * R * scale;
      const y = cy + Math.sin(a) * R * scale;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  });

  // Axis lines
  axes.forEach((_, i) => {
    const a = i * step - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  });

  // Data polygon
  ctx.beginPath();
  axes.forEach((ax, i) => {
    const a = i * step - Math.PI / 2;
    const x = cx + Math.cos(a) * R * ax.val;
    const y = cy + Math.sin(a) * R * ax.val;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(232,169,74,0.15)';
  ctx.fill();
  ctx.strokeStyle = '#e8a94a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Labels
  axes.forEach((ax, i) => {
    const a = i * step - Math.PI / 2;
    const lx = cx + Math.cos(a) * (R + 14);
    const ly = cy + Math.sin(a) * (R + 14);
    ctx.fillStyle = 'rgba(180,170,155,0.8)';
    ctx.font = '8px Space Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ax.label, lx, ly);
  });
}

// Draw charts when analytics section is shown
function initCharts() {
  drawBarChart();
  drawDonutChart();
  drawLineChart();
  drawRadarChart();
}

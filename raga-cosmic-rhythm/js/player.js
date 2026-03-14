/* ═══════════════════════════════════════════════
   PLAYER.JS — Waveform animation & mini player
═══════════════════════════════════════════════ */

let playerState = {
  isPlaying: false,
  currentIndex: 0,
  animFrame: null
};

function getPlayerRaga() {
  return RAGAS[playerState.currentIndex] || RAGAS[0];
}

function updatePlayerDisplay() {
  const raga = getPlayerRaga();
  const nameEl = document.getElementById('player-raga-display');
  const tagEl  = document.getElementById('player-time-tag');
  const tradEl = document.getElementById('player-tradition');

  if (nameEl) nameEl.textContent = raga.name;
  if (tagEl)  tagEl.textContent  = `${raga.time} · ${raga.hours}`;
  if (tradEl) tradEl.textContent = raga.tradition;
}

// ── WAVEFORM ───────────────────────────────────
function drawWaveform(playing) {
  const canvas = document.getElementById('waveform-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const raga = getPlayerRaga();
  const barCount = 48;
  const barW = W / barCount - 1;
  const t = Date.now() / 1000;

  for (let i = 0; i < barCount; i++) {
    const x = i * (barW + 1);
    let h;

    if (playing) {
      // Animated waveform based on raga notes
      const freq1 = 1.2 + i * 0.04;
      const freq2 = 0.8 + i * 0.02;
      h = H * 0.15 + H * 0.7 * Math.abs(
        0.5 * Math.sin(t * freq1 + i * 0.3) +
        0.3 * Math.sin(t * freq2 * 1.5 + i * 0.5) +
        0.2 * Math.sin(t * 2.1 + i * 0.8)
      );
    } else {
      // Static minimal wave
      h = H * 0.1 + H * 0.15 * Math.abs(Math.sin(i * 0.4));
    }

    const ratio = i / barCount;
    const col = raga.colors[0] || '#e8a94a';
    const col2 = raga.colors[1] || '#9b7fcf';
    const grad = ctx.createLinearGradient(x, H/2 - h/2, x, H/2 + h/2);
    grad.addColorStop(0, col + 'cc');
    grad.addColorStop(0.5, col);
    grad.addColorStop(1, col2 + '80');
    ctx.fillStyle = grad;

    // Symmetric bars
    ctx.fillRect(x, H/2 - h/2, barW, h);
  }

  if (playing) {
    playerState.animFrame = requestAnimationFrame(() => drawWaveform(true));
  }
}

function startWaveform() {
  if (playerState.animFrame) cancelAnimationFrame(playerState.animFrame);
  drawWaveform(true);
}

function stopWaveform() {
  if (playerState.animFrame) {
    cancelAnimationFrame(playerState.animFrame);
    playerState.animFrame = null;
  }
  drawWaveform(false);
}

// ── PLAYER CONTROLS ────────────────────────────
function setupPlayer() {
  const btnPlay = document.getElementById('btn-play');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');

  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      playerState.isPlaying = !playerState.isPlaying;
      btnPlay.textContent = playerState.isPlaying ? '⏸' : '▶';
      if (playerState.isPlaying) {
        startWaveform();
      } else {
        stopWaveform();
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      playerState.currentIndex = (playerState.currentIndex - 1 + RAGAS.length) % RAGAS.length;
      updatePlayerDisplay();
      if (playerState.isPlaying) startWaveform(); else stopWaveform();
      highlightListenCard();
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      playerState.currentIndex = (playerState.currentIndex + 1) % RAGAS.length;
      updatePlayerDisplay();
      if (playerState.isPlaying) startWaveform(); else stopWaveform();
      highlightListenCard();
    });
  }

  updatePlayerDisplay();
  drawWaveform(false);
}

function setPlayerRaga(index) {
  playerState.currentIndex = index;
  updatePlayerDisplay();
  if (!playerState.isPlaying) {
    playerState.isPlaying = true;
    const btnPlay = document.getElementById('btn-play');
    if (btnPlay) btnPlay.textContent = '⏸';
    startWaveform();
  } else {
    startWaveform();
  }
  highlightListenCard();
}

function highlightListenCard() {
  document.querySelectorAll('.listen-card').forEach((card, i) => {
    card.classList.toggle('is-current', i === playerState.currentIndex);
  });
}

window.addEventListener('load', setupPlayer);

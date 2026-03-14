/* ═══════════════════════════════════════════════
   MAIN.JS — App initialization & coordination
═══════════════════════════════════════════════ */

window.addEventListener('load', () => {
  console.log('%c🎵 Rāga & Cosmic Rhythm — Initialized', 'color:#e8a94a;font-size:14px;font-weight:bold');
  console.log('%cThe universe breathes in rāga.', 'color:#9b7fcf;font-style:italic');

  // Auto-select current raga in player based on time
  const hour = new Date().getHours();
  const currentRaga = getRagaForHour(hour);
  const idx = RAGAS.findIndex(r => r.id === currentRaga.id);
  if (idx >= 0) {
    playerState.currentIndex = idx;
    updatePlayerDisplay();
    drawWaveform(false);
  }

  // Page title with current raga
  document.title = `Rāga & Cosmic Rhythm — ${currentRaga.name} (Now Playing)`;
});

// Resize handler
window.addEventListener('resize', () => {
  setTimeout(() => {
    drawMandala();
    drawTimeWheel();
    drawRagaWheelSmall();
    drawHeatmap();
  }, 200);
});

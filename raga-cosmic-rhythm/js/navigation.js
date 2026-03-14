/* ═══════════════════════════════════════════════
   NAVIGATION.JS — Section switching & filtering
═══════════════════════════════════════════════ */

function setupNavigation() {
  const navLinks = document.querySelectorAll('#main-nav a[data-section]');
  const sections = document.querySelectorAll('.content-section');

  function showSection(id) {
    sections.forEach(s => s.classList.remove('sec-active'));
    navLinks.forEach(l => l.classList.remove('nav-active'));

    const target = document.getElementById('sec-' + id);
    const link   = document.querySelector(`[data-section="${id}"]`);

    if (target) target.classList.add('sec-active');
    if (link)   link.classList.add('nav-active');

    // Lazy init section-specific visuals
    if (id === 'analytics') {
      setTimeout(initCharts, 100);
    }
    if (id === 'cosmology') {
      setTimeout(() => { drawSolarSystem(); }, 100);
    }
    if (id === 'evolution') {
      setTimeout(() => { drawRasaWheel(); drawMelakartaVis(); }, 100);
    }
    if (id === 'listen') {
      updateListenTimeContext();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(link.dataset.section);
    });
  });

  // CTA buttons with data-section
  document.querySelectorAll('.cta-btn[data-section]').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
  });
}

// ── RAGA FILTER ────────────────────────────────
function setupRagaFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const cards  = document.querySelectorAll('.raga-card');
      cards.forEach(card => {
        if (filter === 'all' || card.dataset.filter === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ── MODAL ──────────────────────────────────────
function openModal(html) {
  const modal = document.getElementById('raga-modal');
  const inner = document.getElementById('modal-content-inner');
  if (!modal || !inner) return;
  inner.innerHTML = html;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('raga-modal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
}

function setupModal() {
  const closeBtn = document.querySelector('.modal-close');
  const backdrop = document.querySelector('.modal-backdrop');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

function updateListenTimeContext() {
  const el = document.getElementById('listen-time-context');
  if (!el) return;
  const hour = new Date().getHours();
  const raga = getRagaForHour(hour);
  const period = hour < 5 ? 'late night' : hour < 8 ? 'dawn' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 20 ? 'evening' : 'night';
  el.textContent = `It is currently ${period}. The prescribed rāga for this hour is ${raga.name}. Listen with open awareness — the ancient masters calibrated these sounds for exactly this moment.`;
}

window.addEventListener('load', () => {
  setupNavigation();
  setupRagaFilter();
  setupModal();
});

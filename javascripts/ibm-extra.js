/* IBM-extra JavaScript helpers */

document$.subscribe(function () {
  // ── Apply IBM dark as default scheme ───────────────────────
  const stored = localStorage.getItem('__palette');
  if (!stored) {
    document.body.setAttribute('data-md-color-scheme', 'ibm-dark');
    document.body.setAttribute('data-md-color-primary', 'blue');
    document.body.setAttribute('data-md-color-accent', 'teal');
  }

  // ── Animate section-progress pips on page load ─────────────
  document.querySelectorAll('.section-progress .pip').forEach((pip, i) => {
    pip.style.opacity = '0';
    setTimeout(() => {
      pip.style.transition = 'opacity .3s ease';
      pip.style.opacity = '1';
    }, i * 80);
  });

  // ── Add copy-flash to code blocks ──────────────────────────
  document.querySelectorAll('.md-clipboard').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.style.color = 'var(--ibm-teal-40)';
      setTimeout(() => { btn.style.color = ''; }, 1200);
    });
  });

});

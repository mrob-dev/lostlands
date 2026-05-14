// Lost Lands — interaction layer
(function () {
  // Scroll progress bar
  const bar = document.querySelector('.scroll-progress');
  if (bar) {
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = pct + '%';
    };
    document.addEventListener('scroll', update, { passive: true });
    update();
  }

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
})();

// Lost Lands — interaction layer
(function () {
  // Theme: apply saved preference before anything paints, so the toggle
  // doesn't flicker when navigating between pages.
  try {
    const saved = localStorage.getItem('lostlands.theme');
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-theme', saved);
    }
  } catch (e) {}

  // Inject the theme toggle button into the nav once the DOM is ready.
  // Inject a Bibliography link into the volume sub-nav (skipped on the
  // homepage and the timeline). Path is depth-adjusted so it works from
  // both volume index pages and chapter pages.
  function injectBibliographyLink() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const VOLS = ['prussia','ottoman','east-germany','yugoslavia','persia','soviet-union','inca','congo-free-state','rome','cordoba','green-ukraine','jerusalem'];
    const vol = parts.find(p => VOLS.includes(p));
    if (!vol) return;
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks || navLinks.querySelector('[data-bib-link]')) return;
    const inChapter = parts.includes('chapters');
    const href = inChapter ? '../bibliography.html' : 'bibliography.html';
    const link = document.createElement('a');
    link.href = href;
    link.textContent = 'Sources';
    link.dataset.bibLink = '1';
    const toggle = navLinks.querySelector('.theme-toggle');
    if (toggle) navLinks.insertBefore(link, toggle);
    else navLinks.appendChild(link);
  }

  function injectThemeToggle() {
    const nav = document.querySelector('.nav-links');
    if (!nav || nav.querySelector('.theme-toggle')) return;
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle light and dark mode');
    btn.innerHTML = '<span class="theme-toggle-dot"></span>';
    btn.addEventListener('click', () => {
      const root = document.documentElement;
      const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const cur = root.getAttribute('data-theme') || (sysDark ? 'dark' : 'light');
      const next = cur === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('lostlands.theme', next); } catch (e) {}
    });
    nav.appendChild(btn);
  }
  // Site-wide Search link in the volume sub-nav. Depth-adjusted from the
  // current path so a chapter page (two levels deep) reaches search.html too.
  function injectSearchLink() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const VOLS = ['prussia','ottoman','east-germany','yugoslavia','persia','soviet-union','inca','congo-free-state','rome','cordoba','green-ukraine','jerusalem'];
    const vol = parts.find(p => VOLS.includes(p));
    if (!vol) return; // top-level pages already have the link in their HTML
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks || navLinks.querySelector('[data-search-link]')) return;
    const inChapter = parts.includes('chapters');
    const href = inChapter ? '../../search.html' : '../search.html';
    const link = document.createElement('a');
    link.href = href;
    link.textContent = 'Search';
    link.dataset.searchLink = '1';
    const toggle = navLinks.querySelector('.theme-toggle');
    if (toggle) navLinks.insertBefore(link, toggle);
    else navLinks.appendChild(link);
  }

  function injectAll() { injectBibliographyLink(); injectSearchLink(); injectThemeToggle(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectAll);
  } else {
    injectAll();
  }

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

  // ===========================================================
  // Reading progress tracker
  // -----------------------------------------------------------
  // Tracks which chapters have been read per volume in localStorage.
  // On chapter pages: marks the chapter as read when the foot-nav
  //   becomes visible (i.e. the user has reached the end).
  // On volume index pages: renders a progress bar and per-chapter
  //   read markers in the table of contents.
  // On the homepage: surfaces a "Continue reading" banner that links
  //   back to the last-seen chapter.
  // ===========================================================
  const STORAGE_KEY = 'lostlands.progress.v1';
  const VOLUMES = [
    'prussia','ottoman','east-germany','yugoslavia','persia','soviet-union',
    'inca','congo-free-state','rome','cordoba','green-ukraine','jerusalem',
  ];
  const VOLUME_NAMES = {
    'prussia': 'Prussia',
    'ottoman': 'The Ottoman Empire',
    'east-germany': 'East Germany',
    'yugoslavia': 'Yugoslavia',
    'persia': 'Persia',
    'soviet-union': 'The Soviet Union',
    'inca': 'The Inca Empire',
    'congo-free-state': 'The Congo Free State',
    'rome': 'The Roman Empire',
    'cordoba': 'The Caliphate of Córdoba',
    'green-ukraine': 'Green Ukraine',
    'jerusalem': 'The Kingdom of Jerusalem',
  };

  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { volumes: {}, lastSeen: null };
      const parsed = JSON.parse(raw);
      if (!parsed.volumes) parsed.volumes = {};
      return parsed;
    } catch (e) {
      return { volumes: {}, lastSeen: null };
    }
  }
  function writeState(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  function pathParts() {
    return window.location.pathname.split('/').filter(Boolean);
  }
  function getVolumeId() {
    for (const p of pathParts()) if (VOLUMES.includes(p)) return p;
    return null;
  }
  function getChapterId() {
    const parts = pathParts();
    const i = parts.indexOf('chapters');
    if (i < 0 || i + 1 >= parts.length) return null;
    return parts[i + 1].replace(/\.html$/, '');
  }
  function isVolumeIndex() {
    const parts = pathParts();
    if (parts.length === 0) return false;
    const last = parts[parts.length - 1];
    return getVolumeId() && (last === 'index.html' || VOLUMES.includes(last));
  }
  function isHomepage() {
    const parts = pathParts();
    if (parts.length === 0) return true;
    if (parts.length === 1 && parts[0] === 'index.html') return true;
    return false;
  }

  // ---- chapter pages ----
  const chapterId = getChapterId();
  const volumeId = getVolumeId();
  if (chapterId && volumeId) {
    // Always update lastSeen on visit
    const data = readState();
    data.lastSeen = { vol: volumeId, chap: chapterId, ts: Date.now() };
    writeState(data);

    // Mark read when the foot-nav is in view
    const endMarker = document.querySelector('.chap-foot');
    if (endMarker && 'IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const cur = readState();
            if (!cur.volumes[volumeId]) cur.volumes[volumeId] = [];
            if (!cur.volumes[volumeId].includes(chapterId)) {
              cur.volumes[volumeId].push(chapterId);
            }
            cur.lastSeen = { vol: volumeId, chap: chapterId, ts: Date.now() };
            writeState(cur);
            obs.disconnect();
          }
        }
      }, { threshold: 0.25 });
      obs.observe(endMarker);
    }
  }

  // ---- volume index pages ----
  if (isVolumeIndex() && document.querySelector('.toc')) {
    const vol = getVolumeId();
    const data = readState();
    const readSet = new Set(data.volumes[vol] || []);
    let total = 0, readCount = 0, firstUnreadHref = null;
    document.querySelectorAll('.toc-item').forEach(item => {
      const a = item.querySelector('.toc-link');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      const m = href.match(/chapters\/(.+)\.html/);
      if (!m) return;
      total++;
      const chap = m[1];
      const indicator = document.createElement('span');
      indicator.className = 'toc-progress';
      if (readSet.has(chap)) {
        indicator.classList.add('is-read');
        readCount++;
      } else if (!firstUnreadHref) {
        firstUnreadHref = href;
      }
      const numSpan = a.querySelector('.toc-num');
      if (numSpan) {
        numSpan.insertBefore(indicator, numSpan.firstChild);
      } else {
        a.insertBefore(indicator, a.firstChild);
      }
    });
    if (total > 0) {
      const pct = Math.round((readCount / total) * 100);
      const wrap = document.createElement('div');
      wrap.className = 'toc-progress-summary';
      wrap.innerHTML = `
        <p class="toc-progress-eyebrow">Your progress</p>
        <p class="toc-progress-count">${readCount} of ${total} chapters read &nbsp;·&nbsp; ${pct}%</p>
        <div class="toc-progress-bar"><div class="toc-progress-bar-fill" style="width:${pct}%"></div></div>
        ${firstUnreadHref && readCount > 0
          ? `<a class="toc-progress-resume" href="${firstUnreadHref}">Continue from the next unread chapter →</a>`
          : ''}
      `;
      const toc = document.querySelector('.toc');
      toc.parentNode.insertBefore(wrap, toc);
    }
  }

  // ---- homepage ----
  if (isHomepage()) {
    const data = readState();
    const ls = data.lastSeen;
    if (ls && ls.vol && VOLUME_NAMES[ls.vol]) {
      const banner = document.createElement('a');
      banner.className = 'resume-banner';
      let href, label;
      if (ls.chap) {
        href = `${ls.vol}/chapters/${ls.chap}.html`;
        const chapTitle = ls.chap.replace(/^\d+-/, '').replace(/-/g, ' ');
        label = `${VOLUME_NAMES[ls.vol]} &nbsp;·&nbsp; <span>${chapTitle}</span>`;
      } else {
        href = `${ls.vol}/index.html`;
        label = VOLUME_NAMES[ls.vol];
      }
      banner.href = href;
      banner.innerHTML = `
        <div class="resume-banner-inner">
          <p class="resume-banner-eyebrow">Continue reading</p>
          <p class="resume-banner-title">${label}</p>
        </div>
        <span class="resume-banner-arrow">→</span>
      `;
      const hero = document.querySelector('.hero');
      if (hero && hero.parentNode) hero.parentNode.insertBefore(banner, hero.nextSibling);
    }
  }
})();

/* =====================================================================
 * Image lightbox — click any .foreword-map img or .prose figure img to
 * open a full-screen overlay. Click again to toggle zoom between 1×, 2×
 * and fit-to-window. Drag to pan when zoomed. ESC or click-outside closes.
 * Touch devices retain the browser's native pinch-zoom inside the overlay.
 * =================================================================== */
(function() {
  const SELECTOR = '.foreword-map img, .prose figure img';
  const targets = document.querySelectorAll(SELECTOR);
  if (!targets.length) return;

  // Build overlay once, lazily on first click.
  let overlay, stage, img, closeBtn;
  let zoom = 1;
  let panX = 0, panY = 0;
  let dragging = false, dragStartX = 0, dragStartY = 0, panStartX = 0, panStartY = 0;

  function ensureOverlay() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="lightbox-stage">
        <img class="lightbox-img" alt="" />
      </div>
      <button type="button" class="lightbox-close" aria-label="Close">×</button>
      <p class="lightbox-hint">Click image to zoom · drag to pan · esc to close</p>
    `;
    document.body.appendChild(overlay);
    stage = overlay.querySelector('.lightbox-stage');
    img = overlay.querySelector('.lightbox-img');
    closeBtn = overlay.querySelector('.lightbox-close');

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    img.addEventListener('click', cycleZoom);

    img.addEventListener('mousedown', (e) => {
      if (zoom <= 1) return;
      dragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      panStartX = panX;
      panStartY = panY;
      img.style.cursor = 'grabbing';
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      panX = panStartX + (e.clientX - dragStartX);
      panY = panStartY + (e.clientY - dragStartY);
      applyTransform();
    });
    window.addEventListener('mouseup', () => {
      dragging = false;
      if (img) img.style.cursor = zoom > 1 ? 'grab' : 'zoom-in';
    });

    window.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === '+' || e.key === '=') { zoom = Math.min(zoom * 1.5, 6); applyTransform(); }
      else if (e.key === '-') { zoom = Math.max(zoom / 1.5, 1); if (zoom === 1) { panX = panY = 0; } applyTransform(); }
      else if (e.key === '0') { zoom = 1; panX = panY = 0; applyTransform(); }
    });

    // Wheel-zoom on desktop.
    stage.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 1/1.15;
      zoom = Math.max(1, Math.min(zoom * factor, 6));
      if (zoom === 1) { panX = panY = 0; }
      applyTransform();
    }, { passive: false });
  }

  function applyTransform() {
    img.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
    img.style.cursor = zoom > 1 ? 'grab' : 'zoom-in';
  }

  function cycleZoom() {
    if (dragging) return;
    if (zoom < 1.5) zoom = 2;
    else if (zoom < 3) zoom = 3;
    else { zoom = 1; panX = panY = 0; }
    applyTransform();
  }

  function open(src, alt) {
    ensureOverlay();
    img.src = src;
    img.alt = alt || '';
    zoom = 1; panX = 0; panY = 0;
    applyTransform();
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { if (img) img.src = ''; }, 250);
  }

  targets.forEach((t) => {
    t.classList.add('is-clickable');
    t.addEventListener('click', (e) => {
      // Don't hijack if the image is inside a link.
      if (t.closest('a')) return;
      e.preventDefault();
      open(t.currentSrc || t.src, t.alt);
    });
  });
})();

/* =====================================================================
 * Hide the chapter-sidebar / FAB until the reader has scrolled past the
 * chap-hero header. Avoids the sidebar overlapping the hero's title,
 * subtitle and metadata.
 * =================================================================== */
(function() {
  const sidebar = document.querySelector('.chap-sidebar');
  const hero = document.querySelector('.chap-hero');
  if (!sidebar || !hero) return;

  sidebar.style.transition = 'opacity 220ms ease';
  function update() {
    const heroBottom = hero.getBoundingClientRect().bottom;
    const past = heroBottom < 60;
    sidebar.style.opacity = past ? '1' : '0';
    sidebar.style.pointerEvents = past ? 'auto' : 'none';
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

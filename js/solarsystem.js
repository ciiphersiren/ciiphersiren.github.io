/* ============================================================
   Builds the orbiting-planet navigation from data, wires up
   clicks/keyboard, and drives panel open/close. Exposes a small
   `Portfolio` namespace that shatter.js and main.js hook into.
   ============================================================ */
(function () {
  // `radius` is the orbit's diameter as a fraction of the container's
  // width/height (so it can never exceed 1 without overflowing).
  const PLANETS = [
    { id: 'about',      label: 'About',       color: '#7ec8e3', radius: 0.22, size: 34, period: 28, phase: 10 },
    { id: 'education',  label: 'Education',   color: '#ff6fae', radius: 0.38, size: 36, period: 40, phase: 95 },
    { id: 'projects',   label: 'Projects',    color: '#22d3ee', radius: 0.54, size: 50, period: 54, phase: 190 },
    { id: 'research',   label: 'Research',    color: '#c98bdb', radius: 0.68, size: 34, period: 70, phase: 290 },
    { id: 'leadership', label: 'Leadership',  color: '#e38b6b', radius: 0.82, size: 38, period: 86, phase: 55, ring: true },
    { id: 'resume',     label: 'Résumé',      color: '#9fe3b0', size: 30, radius: 0.94, period: 100, phase: 230 },
  ];

  // How flattened each orbit's ellipse is (Y radius as a fraction of X
  // radius) — reads as a horizontal sweep instead of a perfect circle
  // that bobs noticeably up/down at its left/right points.
  const ORBIT_ASPECT = 0.44;

  const solarSystem = document.getElementById('solar-system');
  const dock = document.getElementById('dock');
  const panelRoot = document.getElementById('panel-root');
  const panelBackdrop = document.getElementById('panel-backdrop');
  const topbarResume = document.getElementById('topbar-resume');

  const planetEls = {}; // id -> { el, anchor, cfg }
  let currentPanel = null;

  function buildPlanet(cfg) {
    // Decorative ellipse ring only — actual planet position is driven
    // per-frame in JS (see animateOrbits) so the planet itself never
    // gets visually stretched by the ellipse math, only its anchor moves.
    const orbit = document.createElement('div');
    orbit.className = 'orbit';
    orbit.style.width = (cfg.radius * 100) + '%';
    orbit.style.height = (cfg.radius * 100 * ORBIT_ASPECT) + '%';
    solarSystem.appendChild(orbit);

    const anchor = document.createElement('div');
    anchor.className = 'planet-anchor';

    const planet = document.createElement('div');
    planet.className = 'planet';
    planet.style.width = cfg.size + 'px';
    planet.style.height = cfg.size + 'px';
    planet.style.setProperty('--planet-color', cfg.color);
    planet.tabIndex = 0;
    planet.setAttribute('role', 'button');
    planet.setAttribute('aria-label', 'Open ' + cfg.label + ' section');
    planet.dataset.planet = cfg.id;

    if (cfg.ring) {
      const ring = document.createElement('span');
      ring.className = 'planet-ring';
      planet.appendChild(ring);
    }

    const label = document.createElement('span');
    label.className = 'planet-label mono';
    label.textContent = cfg.label;

    anchor.appendChild(planet);
    anchor.appendChild(label);
    solarSystem.appendChild(anchor);

    const activate = (e) => {
      e.preventDefault();
      Portfolio.open(cfg.id, planet);
    };
    planet.addEventListener('click', activate);
    planet.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') activate(e);
    });

    planetEls[cfg.id] = {
      el: planet,
      anchor,
      cfg: {
        ...cfg,
        phaseRad: (cfg.phase * Math.PI) / 180,
        timeOffset: Math.random() * cfg.period,
      },
    };
  }

  // ---- per-frame orbital motion ----
  let sysW = 0, sysH = 0;
  function measureSystem() {
    sysW = solarSystem.offsetWidth;
    sysH = solarSystem.offsetHeight;
  }
  window.addEventListener('resize', measureSystem);

  function animateOrbits(now) {
    const t = now / 1000;
    for (const id in planetEls) {
      const { anchor, cfg } = planetEls[id];
      const angle = ((t + cfg.timeOffset) / cfg.period) * Math.PI * 2 + cfg.phaseRad;
      const rx = (cfg.radius * sysW) / 2;
      const ry = (cfg.radius * sysH * ORBIT_ASPECT) / 2;
      const x = Math.cos(angle) * rx;
      const y = Math.sin(angle) * ry;
      anchor.style.transform = `translate(-50%, -50%) translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
    }
    requestAnimationFrame(animateOrbits);
  }

  function buildDock() {
    PLANETS.forEach((cfg) => {
      const item = document.createElement('button');
      item.className = 'dock-item';
      item.textContent = cfg.label;
      item.dataset.planet = cfg.id;
      item.style.setProperty('--dot-color', cfg.color);
      item.addEventListener('click', () => Portfolio.open(cfg.id, planetEls[cfg.id].el));
      dock.appendChild(item);
    });
  }

  function syncDock(id) {
    dock.querySelectorAll('.dock-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.planet === id);
    });
  }

  function openPanel(id) {
    const panel = document.getElementById('panel-' + id);
    if (!panel) return;
    document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
    panel.classList.add('active');
    panelRoot.classList.add('open');
    panelRoot.setAttribute('aria-hidden', 'false');
    syncDock(id);
    currentPanel = id;
    panel.scrollTop = 0;
    return panel;
  }

  function closePanel() {
    panelRoot.classList.remove('open');
    panelRoot.setAttribute('aria-hidden', 'true');
    // Explicitly drop .active too — a child's own `visibility: visible`
    // otherwise overrides the ancestor's `visibility: hidden`, which is
    // why the panel used to stay on screen (just unclickable) after close.
    document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
    syncDock(null);
    const openedId = currentPanel;
    currentPanel = null;
    if (openedId && window.ShatterEffect && planetEls[openedId]) {
      window.ShatterEffect.reform(planetEls[openedId].el);
    }
  }

  function open(id, planetEl) {
    const entry = planetEls[id];
    if (entry && window.ShatterEffect) {
      window.ShatterEffect.shatter(planetEl, entry.cfg.color, () => {
        const panel = openPanel(id);
        if (panel) window.ShatterEffect.converge(panel.getBoundingClientRect(), entry.cfg.color);
      });
    } else {
      openPanel(id);
    }
  }

  function cyclePanel(dir) {
    if (!currentPanel) return;
    const ids = PLANETS.map((p) => p.id);
    const idx = ids.indexOf(currentPanel);
    const next = ids[(idx + dir + ids.length) % ids.length];
    open(next, planetEls[next].el);
  }

  // ---- global interactions ----
  // "Home" means something: close whatever panel is open AND actually
  // take you back to the top of the page, not just dismiss the overlay
  // in place. Plain closePanel() (Escape, backdrop, the panel's own ✕)
  // stays put where you are, since that's a dismiss, not a "go home".
  function goHome() {
    closePanel();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.getElementById('sun').addEventListener('click', goHome);
  document.getElementById('sun').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goHome(); }
  });
  document.getElementById('home-link').addEventListener('click', (e) => { e.preventDefault(); goHome(); });
  panelBackdrop.addEventListener('click', closePanel);
  document.querySelectorAll('.panel-close').forEach((btn) => btn.addEventListener('click', closePanel));
  topbarResume.addEventListener('click', (e) => {
    e.preventDefault();
    open('resume', planetEls.resume.el);
  });
  document.addEventListener('keydown', (e) => {
    if (!panelRoot.classList.contains('open')) return;
    if (e.key === 'Escape') closePanel();
    if (e.key === 'ArrowRight') cyclePanel(1);
    if (e.key === 'ArrowLeft') cyclePanel(-1);
  });

  PLANETS.forEach(buildPlanet);
  buildDock();
  measureSystem();
  requestAnimationFrame(animateOrbits);

  window.Portfolio = { open, close: closePanel, PLANETS };
})();

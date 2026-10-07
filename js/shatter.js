/* ============================================================
   Particle effects for planet navigation:
   - shatter(): the clicked planet disintegrates into falling,
     gravity-affected particles before its panel opens.
   - converge(): as the panel appears, particles drift inward and
     fade into it — a "materializing" complement to the shatter.
   - reform(): the planet quietly re-materializes on close.
   Both effects share one particle list + render loop on the same
   canvas, so a shatter burst and its following converge never fight
   over clearRect in the same frame.
   ============================================================ */
(function () {
  const canvas = document.getElementById('shatter-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, DPR;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  function hexToRgb(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  const GRAVITY = 640; // px/s^2

  // ---- shared particle list + single render loop ----
  let particles = [];
  let looping = false;

  function ensureLoop() {
    if (!looping) {
      looping = true;
      requestAnimationFrame(loop);
    }
  }

  function loop(now) {
    ctx.clearRect(0, 0, W, H);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const t = (now - p.born) / 1000 - p.delay;
      if (t < 0) continue; // staggered start, not yet visible
      if (t > p.duration) { particles.splice(i, 1); continue; }

      if (p.type === 'shatter') {
        const x = p.x0 + p.vx * t;
        const y = p.y0 + p.vy * t + 0.5 * GRAVITY * t * t;
        const alpha = Math.max(0, 1 - t / p.duration);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(p.rot0 + p.vrot * t);
        ctx.fillStyle = p.lit
          ? `rgba(255,255,255,${alpha})`
          : `rgba(${p.r},${p.g},${p.b},${alpha})`;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      } else if (p.type === 'converge') {
        const k = t / p.duration;
        const ek = 1 - Math.pow(1 - k, 3); // ease-out cubic
        const x = p.x0 + (p.tx - p.x0) * ek;
        const y = p.y0 + (p.ty - p.y0) * ek;
        const alpha = k < 0.7 ? k / 0.7 : Math.max(0, 1 - (k - 0.7) / 0.3);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${alpha})`;
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (particles.length > 0) {
      requestAnimationFrame(loop);
    } else {
      looping = false;
    }
  }

  // ---- shatter: planet -> outward, gravity-falling debris ----
  function shatter(planetEl, color, onMidpoint) {
    const rect = planetEl.getBoundingClientRect();
    planetEl.classList.add('shattering');
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const radius = rect.width / 2 || 12;
    const rgb = hexToRgb(color);
    const born = performance.now();
    const grid = 10;

    for (let gy = 0; gy < grid; gy++) {
      for (let gx = 0; gx < grid; gx++) {
        const ox = (gx / (grid - 1) - 0.5) * 2 * radius;
        const oy = (gy / (grid - 1) - 0.5) * 2 * radius;
        if (ox * ox + oy * oy > radius * radius) continue;
        const angle = Math.atan2(oy, ox);
        const outward = 60 + Math.random() * 140;
        particles.push({
          type: 'shatter',
          x0: cx + ox,
          y0: cy + oy,
          vx: Math.cos(angle) * outward + (Math.random() - 0.5) * 40,
          vy: Math.sin(angle) * outward * 0.45 - Math.random() * 90,
          size: Math.random() * 3.2 + 1.6,
          rot0: Math.random() * Math.PI,
          vrot: (Math.random() - 0.5) * 4,
          delay: Math.random() * 0.14,
          duration: 0.85 + Math.random() * 0.5,
          r: rgb.r, g: rgb.g, b: rgb.b,
          lit: Math.random() < 0.3,
          born,
        });
      }
    }
    ensureLoop();

    // The panel opens a touch before every last particle fades — feels
    // like the burst "reveals" it rather than a hard cut.
    setTimeout(() => { if (onMidpoint) onMidpoint(); }, 650);
  }

  // ---- converge: ambient particles drift in and fade into the panel ----
  function converge(rect, color) {
    if (!rect) return;
    const rgb = hexToRgb(color);
    const born = performance.now();
    const count = 70;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.max(rect.width, rect.height) * (0.5 + Math.random() * 0.35);
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      particles.push({
        type: 'converge',
        x0: cx + Math.cos(angle) * dist,
        y0: cy + Math.sin(angle) * dist,
        tx: rect.left + Math.random() * rect.width,
        ty: rect.top + Math.random() * rect.height,
        size: Math.random() * 2.6 + 1.2,
        delay: Math.random() * 0.15,
        duration: 0.45 + Math.random() * 0.25,
        r: rgb.r, g: rgb.g, b: rgb.b,
        born,
      });
    }
    ensureLoop();
  }

  function reform(planetEl) {
    planetEl.classList.remove('shattering');
    planetEl.classList.add('reform-pop');
    setTimeout(() => planetEl.classList.remove('reform-pop'), 600);
  }

  window.ShatterEffect = { shatter, converge, reform };
})();

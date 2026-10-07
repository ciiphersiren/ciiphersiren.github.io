/* ============================================================
   Final glue: cursor stardust trail + footer clock.
   Everything else (boot, starfield, orbits, shatter) is already
   self-initializing in its own module.
   ============================================================ */
(function () {
  // ---- footer clock, a small "this thing is alive" touch ----
  const clockEl = document.getElementById('clock');
  if (clockEl) {
    function tick() {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    tick();
    setInterval(tick, 1000);
  }

  // ---- cursor stardust trail (skipped on touch devices) ----
  const isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const canvas = document.getElementById('cursor-trail');
  if (!canvas || isCoarsePointer) return;
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

  let dust = [];
  let lastSpawn = 0;

  window.addEventListener('mousemove', (e) => {
    const now = performance.now();
    if (now - lastSpawn < 28) return; // throttle spawn rate
    lastSpawn = now;
    dust.push({
      x: e.clientX,
      y: e.clientY,
      size: Math.random() * 1.6 + 0.6,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3 - 0.15,
      life: 1,
      decay: Math.random() * 0.012 + 0.014,
    });
    if (dust.length > 120) dust.splice(0, dust.length - 120);
  });

  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (let i = dust.length - 1; i >= 0; i--) {
      const d = dust[i];
      d.x += d.vx;
      d.y += d.vy;
      d.life -= d.decay;
      if (d.life <= 0) { dust.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.fillStyle = `rgba(242,241,247,${d.life * 0.55})`;
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

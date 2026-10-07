/* ============================================================
   Starfield background: twinkling stars with subtle parallax,
   occasional shooting stars. Pure canvas, no dependencies.
   ============================================================ */
(function () {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, DPR;
  let stars = [];
  let shootingStars = [];
  let mouseX = 0, mouseY = 0;
  let targetParallaxX = 0, targetParallaxY = 0;
  let parallaxX = 0, parallaxY = 0;

  const STAR_COUNT_DENSITY = 0.00012; // stars per px^2

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    initStars();
  }

  function initStars() {
    const count = Math.round(W * H * STAR_COUNT_DENSITY);
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.3 + 0.25,
        baseAlpha: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.015 + 0.004,
        twinklePhase: Math.random() * Math.PI * 2,
        depth: Math.random() * 0.6 + 0.2, // parallax depth factor
        hue: Math.random() < 0.12 ? 'warm' : 'white',
      });
    }
  }

  function maybeSpawnShootingStar() {
    if (Math.random() < 0.0035 && shootingStars.length < 2) {
      const startX = Math.random() * W * 0.6 + W * 0.2;
      shootingStars.push({
        x: startX,
        y: -10,
        vx: (Math.random() * 2 + 3) * (Math.random() < 0.5 ? 1 : -1),
        vy: Math.random() * 2 + 4,
        life: 1,
        len: Math.random() * 70 + 60,
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    parallaxX += (targetParallaxX - parallaxX) * 0.04;
    parallaxY += (targetParallaxY - parallaxY) * 0.04;

    for (const s of stars) {
      const alpha = s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.twinklePhase) * 0.35;
      const px = s.x + parallaxX * s.depth;
      const py = s.y + parallaxY * s.depth;
      ctx.beginPath();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = s.hue === 'warm' ? '#e8c07d' : '#f2f1fa';
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    maybeSpawnShootingStar();
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const sh = shootingStars[i];
      sh.x += sh.vx;
      sh.y += sh.vy;
      sh.life -= 0.012;
      if (sh.life <= 0 || sh.y > H + 20) {
        shootingStars.splice(i, 1);
        continue;
      }
      const angle = Math.atan2(sh.vy, sh.vx);
      const tailX = sh.x - Math.cos(angle) * sh.len;
      const tailY = sh.y - Math.sin(angle) * sh.len;
      const grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255,255,255,${sh.life})`);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    targetParallaxX = (mouseX / W - 0.5) * -24;
    targetParallaxY = (mouseY / H - 0.5) * -24;
  });

  resize();
  requestAnimationFrame(draw);
})();

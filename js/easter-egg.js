/* ============================================================
   A small hidden visitor in the corner. Click the cat enough
   times and things escalate. Purely decorative, entirely
   skippable, never blocks anything else on the page.
   ============================================================ */
(function () {
  const cat = document.getElementById('egg-cat');
  const heartsEl = document.getElementById('egg-hearts');
  const dino = document.getElementById('egg-dino');
  const died = document.getElementById('egg-died');
  const dim = document.getElementById('egg-dim');
  if (!cat || !heartsEl || !dino || !died || !dim) return;

  const MAX_LIVES = 3;
  let lives = MAX_LIVES;
  let locked = false;

  function renderHearts() {
    heartsEl.querySelectorAll('img').forEach((img, i) => {
      img.src = i < lives ? 'assets/img/ascii-full-heart.png' : 'assets/img/ascii-empty-heart.png';
    });
  }

  function reset() {
    lives = MAX_LIVES;
    locked = false;
    renderHearts();
    cat.style.visibility = 'visible';
    heartsEl.classList.remove('visible');
    died.classList.remove('show');
    dino.classList.remove('run');
    dim.classList.remove('show');
  }

  function hit() {
    if (locked) return;
    heartsEl.classList.add('visible');
    lives -= 1;
    renderHearts();
    cat.classList.add('hit');
    setTimeout(() => cat.classList.remove('hit'), 180);

    if (lives <= 0) {
      locked = true;
      cat.style.visibility = 'hidden';
      dino.classList.add('run');
      // Dim everything, dino included, right as "You died!" appears,
      // so the text is the one thing left bright on screen.
      setTimeout(() => {
        dim.classList.add('show');
        died.classList.add('show');
      }, 700);
      setTimeout(reset, 2800);
    }
  }

  cat.addEventListener('click', hit);
  renderHearts();
})();

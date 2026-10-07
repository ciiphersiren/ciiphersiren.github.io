/* ============================================================
   Boot sequence, two stages:
     1. idle    — ascii art + "[ enter solar system ]" prompt only.
                  Nothing advances until the visitor clicks/taps/
                  presses a key.
     2. booting — the typed log plays as the "entering" sequence;
                  a second interaction fast-forwards straight in.
   Then hands off to the solar system itself (not the hero text).
   ============================================================ */
(function () {
  const overlay = document.getElementById('boot-overlay');
  const asciiEl = document.getElementById('boot-ascii');
  const logEl = document.getElementById('boot-log');
  const skipBtn = document.getElementById('boot-skip');
  if (!overlay || !logEl) return;

  const ASCII_PLANET = [
    '          .   ·   ✦   ·   .',
    '        ╭──────────────╮',
    '       ╱                  ╲',
    '      │         ◉         │      ·',
    '       ╲                  ╱',
    '        ╰──────────────╯',
    '          ·   .   ✦   .   ·',
  ].join('\n');

  const LINES = [
    'booting portfolio.sys ...',
    'calibrating starfield ...',
    'plotting 6 orbital bodies ...',
    'decompressing résumé.pdf ...',
    'welcome, visitor.',
  ];

  let stage = 'idle'; // idle -> booting -> done
  document.body.classList.add('boot-lock'); // no scrolling behind the overlay

  function dismiss() {
    if (stage === 'done') return;
    stage = 'done';
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('boot-lock');
    document.body.classList.add('booted');
    window.dispatchEvent(new CustomEvent('boot:done'));

    const solarSystem = document.getElementById('solar-system');
    if (solarSystem) {
      solarSystem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => { overlay.style.display = 'none'; }, 1000);
  }

  function typeAscii() {
    asciiEl.textContent = '';
    let i = 0;
    const speed = 4;
    function step() {
      asciiEl.textContent = ASCII_PLANET.slice(0, i);
      i += speed;
      if (i <= ASCII_PLANET.length) {
        requestAnimationFrame(step);
      } else {
        asciiEl.textContent = ASCII_PLANET;
      }
    }
    step();
  }

  function typeLines(onComplete) {
    let lineIndex = 0;

    function typeLine() {
      if (lineIndex >= LINES.length) { onComplete(); return; }

      const text = LINES[lineIndex];
      const row = document.createElement('div');
      row.className = 'line';
      const textSpan = document.createElement('span');
      const cursor = document.createElement('span');
      cursor.className = 'cursor';
      row.appendChild(textSpan);
      row.appendChild(cursor);
      logEl.appendChild(row);

      let charIndex = 0;
      const interval = setInterval(() => {
        textSpan.textContent = text.slice(0, charIndex);
        charIndex++;
        if (charIndex > text.length) {
          clearInterval(interval);
          row.removeChild(cursor);
          row.classList.add('ok');
          lineIndex++;
          setTimeout(typeLine, 180);
        }
      }, 22);
    }
    typeLine();
  }

  function startBooting() {
    if (stage !== 'idle') return;
    stage = 'booting';
    if (skipBtn) skipBtn.classList.add('consumed');
    // Ascii art and the log both appear together as the "entering"
    // sequence — idle state before this is the button alone.
    asciiEl.classList.remove('boot-hidden');
    logEl.classList.remove('boot-hidden');
    setTimeout(() => {
      typeAscii();
      typeLines(() => setTimeout(dismiss, 700));
    }, 150);
  }

  // First interaction starts the "entering" sequence; a second one
  // (for the impatient) skips straight past it.
  function handleInteraction() {
    if (stage === 'idle') startBooting();
    else if (stage === 'booting') dismiss();
  }

  ['click', 'keydown', 'touchstart'].forEach((evt) => {
    overlay.addEventListener(evt, handleInteraction, { passive: true });
  });
  if (skipBtn) skipBtn.addEventListener('click', (e) => { e.stopPropagation(); handleInteraction(); });

  // Pure failsafe (stuck tab, JS error elsewhere) — not part of the
  // normal flow, which always waits for a click to even begin.
  setTimeout(dismiss, 45000);
})();

# 🪐 reet. — a solar-system portfolio

My personal portfolio, built as a small solar system you can explore.
Each section of the site is a planet orbiting the sun. Click one and it
breaks into particles, and that section opens in its place.

**Live:** https://ciiphersiren.github.io

## What's inside

- **Boot sequence:** a short terminal-style intro with ASCII art that
  types itself out before you enter the system.
- **Orbiting navigation:** six planets (About, Education, Projects,
  Research, Leadership, Résumé), each on its own orbit and moving at
  its own speed.
- **Shatter effect:** clicking a planet breaks it into debris that
  falls under gravity. Particles then gather into the section that
  opens, and the planet reappears when you close it.
- **Living background:** twinkling stars that shift slightly as you
  move the mouse, occasional shooting stars, and a faint trail of
  stardust behind your cursor.
- **Keyboard friendly:** Tab and Enter open planets, the arrow keys
  move between sections, and Escape closes the current one.
- **A hidden visitor:** there's something tucked in a corner. Go find it.

## Built with

Plain HTML, CSS and JavaScript, with no frameworks, build step or
dependencies. All the animation is drawn on `<canvas>`. Fonts are
Space Grotesk and IBM Plex Mono.

## Structure

    index.html          page markup and section content
    css/style.css       styles and animations
    js/boot.js          intro sequence
    js/starfield.js     star background and shooting stars
    js/solarsystem.js   planets, orbits, navigation and sections
    js/shatter.js       particle effects for shattering and re-forming
    js/main.js          cursor stardust trail and footer clock
    js/easter-egg.js    ¯\_(ツ)_/¯
    assets/             certificates, logos, images and résumé

## Running locally

No build step needed. Open `index.html` in a browser, or serve the
folder with any static server:

    npx serve .

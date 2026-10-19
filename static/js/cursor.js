/* ============================================================
   cursor.js
   Custom dual-layer cursor (dot + lagging ring).
   Includes touch-device detection to prevent mobile glitches.
   ============================================================ */

(function () {
  // Disable on mobile/touch screens
  if (window.matchMedia('(pointer: coarse)').matches) {
    var c = document.getElementById('cursor');
    var cr = document.getElementById('cursor-ring');
    if (c) c.style.display = 'none';
    if (cr) cr.style.display = 'none';
    return;
  }

  var cursor = document.getElementById('cursor');
  var cursorRing = document.getElementById('cursor-ring');
  if (!cursor || !cursorRing) return;

  var mx = window.innerWidth / 2;
  var my = window.innerHeight / 2;
  var rx = mx;
  var ry = my;

  // Move dot instantly to mouse
  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = (mx - 6) + 'px';
    cursor.style.top = (my - 6) + 'px';
  });

  // Animate ring toward cursor position each frame
  function animateRing() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    cursorRing.style.left = (rx - 18) + 'px';
    cursorRing.style.top = (ry - 18) + 'px';
    requestAnimationFrame(animateRing);
  }
  requestAnimationFrame(animateRing);

  // Scale up ring when hovering clickable elements
  var clickablesSelector = 'a, button, input, .service-card, .dev-card, .logo, .dtag, .sample-chip, .upload-zone, .drone-zone, .gallery-card';

  function attachCursorHover() {
    document.querySelectorAll(clickablesSelector).forEach(function (el) {
      el.removeEventListener('mouseenter', onMouseEnter);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.addEventListener('mouseenter', onMouseEnter);
      el.addEventListener('mouseleave', onMouseLeave);
    });
  }

  function onMouseEnter() {
    cursorRing.style.transform = 'scale(1.7)';
    cursorRing.style.opacity = '0.9';
    cursorRing.style.borderColor = 'var(--gold-light, #f5cf6d)';
  }

  function onMouseLeave() {
    cursorRing.style.transform = 'scale(1)';
    cursorRing.style.opacity = '0.55';
    cursorRing.style.borderColor = 'var(--gold-primary, #e5b02a)';
  }

  attachCursorHover();
  window.attachCursorHover = attachCursorHover;
})();

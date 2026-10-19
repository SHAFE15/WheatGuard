/* ============================================================
   navigation.js
   Single-page section switching, hash routing, mobile drawer.
   ============================================================ */

function showSection(id) {
  // Hide all sections
  document.querySelectorAll('section').forEach(function (sec) {
    sec.classList.remove('active-section');
    sec.style.display = 'none';
  });

  // Deactivate all nav links
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    a.classList.remove('active');
  });

  // Show target section
  var target = document.getElementById(id);
  if (!target) return false;

  target.style.display = 'flex';
  target.classList.add('active-section');

  // Trigger smooth fade-in
  target.classList.remove('fade-in');
  void target.offsetWidth; // force reflow
  target.classList.add('fade-in');

  // Activate matching nav link
  var navLink = document.getElementById('nav-' + id);
  if (navLink) navLink.classList.add('active');

  // Close mobile drawer if open
  var navLinksMenu = document.querySelector('.nav-links');
  if (navLinksMenu && navLinksMenu.classList.contains('open')) {
    navLinksMenu.classList.remove('open');
  }

  // Update hash without jumping
  if (history.pushState) {
    history.pushState(null, null, '#' + id);
  } else {
    location.hash = '#' + id;
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Reattach cursor hover effects
  if (window.attachCursorHover) {
    setTimeout(window.attachCursorHover, 100);
  }

  return false;
}

function toggleMobileNav() {
  var navLinksMenu = document.querySelector('.nav-links');
  if (navLinksMenu) {
    navLinksMenu.classList.toggle('open');
  }
}

// Support hash routing on page load & back/forward navigation
window.addEventListener('DOMContentLoaded', function () {
  var hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) {
    showSection(hash);
  }
});

window.addEventListener('popstate', function () {
  var hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) {
    showSection(hash);
  } else {
    showSection('home');
  }
});

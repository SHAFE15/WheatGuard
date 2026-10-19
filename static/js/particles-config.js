/* ============================================================
   particles-config.js
   Floating golden agricultural spores / ambient pollen particles.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: {
          value: 48,
          density: {
            enable: true,
            value_area: 900
          }
        },
        color: {
          value: ['#e5b02a', '#f5cf6d', '#b8860b', '#84cc16']
        },
        shape: {
          type: 'circle',
          stroke: {
            width: 0,
            color: '#000000'
          }
        },
        opacity: {
          value: 0.42,
          random: true,
          anim: {
            enable: true,
            speed: 0.8,
            opacity_min: 0.12,
            sync: false
          }
        },
        size: {
          value: 2.8,
          random: true,
          anim: {
            enable: true,
            speed: 1.2,
            size_min: 0.8,
            sync: false
          }
        },
        line_linked: {
          enable: true,
          distance: 140,
          color: '#d4a017',
          opacity: 0.14,
          width: 1
        },
        move: {
          enable: true,
          speed: 1.1,
          direction: 'top',
          random: true,
          straight: false,
          out_mode: 'out',
          bounce: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200
          }
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: {
            enable: true,
            mode: 'bubble'
          },
          onclick: {
            enable: true,
            mode: 'push'
          },
          resize: true
        },
        modes: {
          bubble: {
            distance: 160,
            size: 4.5,
            duration: 1.5,
            opacity: 0.7,
            speed: 3
          },
          push: {
            particles_nb: 3
          }
        }
      },
      retina_detect: true
    });
  }
});

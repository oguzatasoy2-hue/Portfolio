// ============================================
// PORTFOLIO ANIMATIONS — Oguz Atasoy (v11)
// ============================================

// Sticky Navigation
window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links li');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    links.forEach((link, index) => {
        if (link.style.animation) {
            link.style.animation = '';
        } else {
            link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
        }
    });
    hamburger.classList.toggle('toggle');
});

links.forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('toggle');
        }
    });
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetElement = document.querySelector(this.getAttribute('href'));
        if (targetElement) {
            const headerOffset = 70;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
    });
});

// ============================================
// MASTER OBSERVER — Scroll Animations
// ============================================
document.addEventListener('DOMContentLoaded', () => {

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });

  // Staggered children
  document.querySelectorAll('.stagger-children').forEach(parent => {
    const children = parent.children;
    Array.from(children).forEach((child, index) => {
      child.style.transitionDelay = `${index * 120}ms`;
    });
    observer.observe(parent);
  });

  // ============================================
  // ANIMATED COUNTERS (integers)
  // ============================================
  function animateCounter(element, target, duration = 2000, suffix = '') {
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      element.textContent = (suffix === '%' ? '+' : '') + current + suffix;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = (suffix === '%' ? '+' : '') + target + suffix;
      }
    }
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, 2000, suffix);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter-animate').forEach(el => {
    counterObserver.observe(el);
  });

  // ============================================
  // FLOAT COUNTERS (KPI yield : +23,05 % / 12 478 €)
  // ============================================
  const floatObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target  = parseFloat(el.dataset.target);
      const prefix  = el.dataset.prefix  || '';
      const suffix  = el.dataset.suffix  || '';
      const fmt     = el.dataset.format  || '';
      const isFloat = target % 1 !== 0;
      const duration = 2000;
      const start = performance.now();

      function formatNum(val) {
        if (fmt === 'space') {
          return Math.floor(val).toLocaleString('fr-FR');
        }
        if (isFloat) return val.toFixed(2).replace('.', ',');
        return Math.floor(val);
      }

      function tick(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + formatNum(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = prefix + formatNum(target) + suffix;
      }
      requestAnimationFrame(tick);
      floatObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter-float').forEach(el => floatObserver.observe(el));

  // ============================================
  // SVG CHART ANIMATION (cercles + ligne tracée)
  // ============================================
  const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const circles = entry.target.querySelectorAll('.bar-animate');
        circles.forEach((circle, i) => {
          setTimeout(() => circle.classList.add('is-visible'), i * 200);
        });
        const line = entry.target.querySelector('.chart-line-draw');
        if (line) {
          line.classList.add('is-visible');
        }
        chartObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.chart-container').forEach(el => {
    chartObserver.observe(el);
  });

  // ============================================
  // CARD TILT 3D (desktop only)
  // ============================================
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.card-tilt').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -3;
        const rotateY = ((x - centerX) / centerX) * 3;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      });
    });
  }

  // ============================================
  // TAGS POP-IN STAGGERED
  // ============================================
  const tagObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const tags = entry.target.querySelectorAll('.tag-pop');
        tags.forEach((tag, i) => {
          setTimeout(() => tag.classList.add('is-visible'), i * 80);
        });
        tagObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.tags-container').forEach(el => {
    tagObserver.observe(el);
  });

  // ============================================
  // PARALLAX SUBTIL PHOTO HERO (desktop)
  // ============================================
  if (window.matchMedia('(hover: hover)').matches) {
    const photoWrap = document.querySelector('.hero-photo');
    if (photoWrap) {
      setTimeout(() => {
        photoWrap.style.animation = 'none';
        photoWrap.style.opacity = '1';
        photoWrap.style.transform = 'scale(1)';
        window.addEventListener('scroll', () => {
          const scroll = window.scrollY;
          if (scroll < 700) {
            photoWrap.style.transform = `translateY(${scroll * 0.07}px)`;
          }
        }, { passive: true });
      }, 1400);
    }
  }

  // ============================================
  // MAGNETIC BUTTONS
  // ============================================
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.btn-magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  // ============================================
  // TYPEWRITER — saisie lettre par lettre sur le role
  // ============================================
  const twEl = document.querySelector('.text-scramble');
  if (twEl) {
    const fullText = twEl.textContent.trim();
    twEl.textContent = '';
    let i = 0;
    function typeNext() {
      if (i < fullText.length) {
        twEl.textContent += fullText[i];
        i++;
        setTimeout(typeNext, 35);
      }
    }
    setTimeout(typeNext, 700);
  }

}); // fin DOMContentLoaded

// ============================================
// CURSEUR CUSTOM DORÉ
// ============================================
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
    cursorDot.classList.add('is-active');
    cursorRing.classList.add('is-active');
  });

  (function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  })();

  document.querySelectorAll('a, button, .btn, .contact-box, .card-tilt').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorDot.classList.add('hovered');
      cursorRing.classList.add('hovered');
    });
    el.addEventListener('mouseleave', () => {
      cursorDot.classList.remove('hovered');
      cursorRing.classList.remove('hovered');
    });
  });

  document.addEventListener('mouseleave', () => {
    cursorDot.classList.remove('is-active');
    cursorRing.classList.remove('is-active');
  });
  document.addEventListener('mouseenter', () => {
    cursorDot.classList.add('is-active');
    cursorRing.classList.add('is-active');
  });
}

// ============================================
// CURSOR GLOW (desktop)
// ============================================
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const glow = document.getElementById('cursorGlow');
  if (glow) {
    glow.style.display = 'block';
    document.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    }, { passive: true });
  }
}

// ============================================
// CARD LIGHT EFFECT (reflet curseur)
// ============================================
document.querySelectorAll('.card-light').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', x + '%');
    card.style.setProperty('--mouse-y', y + '%');
  });
});

// ============================================
// NAV ACTIVE SECTION
// ============================================
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
const pageSections = document.querySelectorAll('section[id], header[id]');

const activeSectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navAnchors.forEach(a => {
        a.classList.remove('nav-active');
        if (a.getAttribute('href') === `#${id}`) {
          a.classList.add('nav-active');
        }
      });
    }
  });
}, { threshold: 0.4 });

pageSections.forEach(s => activeSectionObserver.observe(s));

// ============================================
// SCROLL PROGRESS BAR
// ============================================
window.addEventListener('scroll', () => {
  const scrollBar = document.getElementById('scrollProgress');
  if (scrollBar) {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    scrollBar.style.width = progress + '%';
  }
}, { passive: true });

// ============================================
// tsParticles (Particules Dorées)
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  if (typeof tsParticles !== 'undefined') {
    tsParticles.load("tsparticles", {
      background: { color: { value: "transparent" } },
      particles: {
        color: { value: "#D4AF37" },
        links: {
          color: "#D4AF37",
          distance: 150,
          enable: true,
          opacity: 0.2,
          width: 1,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: { default: "bounce" },
          random: false,
          speed: 1,
          straight: false,
        },
        number: {
          density: { enable: true, area: 800 },
          value: 60,
        },
        opacity: { value: 0.3 },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 3 } },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: "grab" }
        },
        modes: {
          grab: { distance: 140, links: { opacity: 0.4 } }
        }
      },
      detectRetina: true,
    });
  }
});

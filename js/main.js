/* Oğuz Atasoy, portfolio. Aucune dépendance.
   Le site reste lisible sans ce fichier : il ne fait qu'orchestrer les animations. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  var stack = $('#poStack');
  var tilt = $('#poTilt');
  var pin = $('#pin');
  var bar = $('#topbar');
  var hero = $('#accueil');

  /* ---- Longueur des tracés dessinés (cercle autour de « 24 mois », coches) ---- */
  $$('[data-draw]').forEach(function (p) {
    try { p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 2); } catch (e) { /* tracé affiché en entier */ }
  });

  /* ---- Compteurs : valeur finale lue par les lecteurs d'écran, animation purement visuelle ---- */
  var counters = $$('[data-count]').map(function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var sr = document.createElement('span');
    sr.className = 'sr';
    sr.textContent = fmt(target) + suffix;
    el.parentNode.insertBefore(sr, el);
    el.setAttribute('aria-hidden', 'true');
    return { el: el, target: target, suffix: suffix };
  });

  function runCounters(delay) {
    if (reduce) { return; }
    /* la largeur finale est réservée : les chiffres voisins ne bougent pas pendant le comptage */
    counters.forEach(function (c) {
      c.el.style.display = 'inline-block';
      c.el.style.minWidth = c.el.getBoundingClientRect().width + 'px';
      c.el.textContent = fmt(0) + c.suffix;
    });
    window.setTimeout(function () {
      var t0 = null;
      var dur = 1100;
      function step(t) {
        if (t0 === null) { t0 = t; }
        var k = clamp((t - t0) / dur, 0, 1);
        var e = 1 - Math.pow(1 - k, 3);
        counters.forEach(function (c) { c.el.textContent = fmt(Math.round(c.target * e)) + c.suffix; });
        if (k < 1) {
          window.requestAnimationFrame(step);
        } else {
          counters.forEach(function (c) { c.el.style.display = ''; c.el.style.minWidth = ''; });
        }
      }
      window.requestAnimationFrame(step);
    }, delay);
  }

  /* ---- Bon de commande : lecture de la séquence ---- */
  function playStack() {
    if (!stack || stack.classList.contains('is-in') || stack.classList.contains('is-done')) { return; }
    stack.classList.add('is-in');
    /* l'inclinaison à la souris est active dès l'impact de l'épingle */
    window.setTimeout(function () { stack.classList.add('is-live'); }, 2100);
    window.setTimeout(function () {
      stack.classList.remove('is-in');
      stack.classList.add('is-done');
    }, 3500);
  }

  /* ---- Épingle : un clic la retire et la replante ---- */
  var replayTimer = 0;
  function replay() {
    if (!stack || !stack.classList.contains('is-done')) { return; }
    stack.classList.remove('is-replay');
    void stack.offsetWidth;
    stack.classList.add('is-replay');
    window.clearTimeout(replayTimer);
    replayTimer = window.setTimeout(function () { stack.classList.remove('is-replay'); }, 3000);
  }
  if (pin) {
    if (reduce) {
      pin.removeAttribute('role');
      pin.removeAttribute('title');
      pin.setAttribute('tabindex', '-1');
      pin.setAttribute('aria-hidden', 'true');
    } else {
      pin.addEventListener('click', replay);
      pin.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); replay(); }
      });
    }
  }

  /* ---- Inclinaison douce du bon de commande selon la souris (écrans à pointeur précis) ---- */
  if (tilt && stack && fine && !reduce) {
    var cur = { x: 0, y: 0 };
    var goal = { x: 0, y: 0 };
    var raf = 0;
    var heroVisible = true;

    var loop = function () {
      cur.x += (goal.x - cur.x) * 0.085;
      cur.y += (goal.y - cur.y) * 0.085;
      tilt.style.setProperty('--rx', cur.x.toFixed(3));
      tilt.style.setProperty('--ry', cur.y.toFixed(3));
      if (Math.abs(goal.x - cur.x) > 0.01 || Math.abs(goal.y - cur.y) > 0.01) {
        raf = window.requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };
    var kick = function () { if (!raf) { raf = window.requestAnimationFrame(loop); } };

    window.addEventListener('pointermove', function (e) {
      if (!heroVisible || !(stack.classList.contains('is-live') || stack.classList.contains('is-done')) || stack.classList.contains('is-replay')) { return; }
      var r = stack.getBoundingClientRect();
      var nx = clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2), -1, 1);
      var ny = clamp((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2), -1, 1);
      goal.y = nx * 5.5;
      goal.x = -ny * 4.5;
      kick();
    }, { passive: true });

    document.documentElement.addEventListener('mouseleave', function () {
      goal.x = 0; goal.y = 0; kick();
    });

    if ('IntersectionObserver' in window && hero) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        if (!heroVisible) { goal.x = 0; goal.y = 0; kick(); }
      }).observe(hero);
    }
  }

  /* ---- Apparitions au défilement ---- */
  var revealItems = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          rio.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealItems.forEach(function (el) { rio.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Barre compacte, progression et rubrique active ---- */
  var ticking = false;
  function onScroll() {
    if (ticking || !bar) { return; }
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      var y = window.pageYOffset || root.scrollTop;
      var h = hero ? hero.offsetHeight : 600;
      bar.classList.toggle('on', y > h * 0.62);
      var max = root.scrollHeight - window.innerHeight;
      bar.style.setProperty('--p', max > 0 ? clamp(y / max, 0, 1).toFixed(4) : '0');
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if ('IntersectionObserver' in window) {
    var links = $$('.nav a[href^="#"]');
    var barNav = $('.topbar .nav');
    var ids = ['accueil', 'lignes', 'dossiers', 'parcours', 'lexique', 'contact'];
    /* sur mobile la barre défile : on centre la rubrique active */
    var centerLink = function (a) {
      if (!barNav || barNav.scrollWidth <= barNav.clientWidth + 2) { return; }
      var left = barNav.scrollLeft + (a.getBoundingClientRect().left - barNav.getBoundingClientRect().left) - (barNav.clientWidth - a.offsetWidth) / 2;
      barNav.scrollTo({ left: left, behavior: 'smooth' });
    };
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) { return; }
        var id = e.target.id;
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + id) {
            a.setAttribute('aria-current', 'true');
            if (barNav && barNav.contains(a)) { centerLink(a); }
          } else { a.removeAttribute('aria-current'); }
        });
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { nio.observe(el); }
    });
  }

  /* ---- Départ de la séquence : après chargement des polices pour éviter tout saut de mise en page ---- */
  var started = false;
  function start() {
    if (started) { return; }
    started = true;
    runCounters(1400);
    root.classList.add('is-ready');
    if (!stack) { return; }
    if (reduce) { stack.classList.add('is-done'); return; }
    if ('IntersectionObserver' in window) {
      var sio = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { sio.disconnect(); playStack(); }
      }, { threshold: 0.3 });
      sio.observe(stack);
    } else {
      playStack();
    }
  }

  var fontsReady = Promise.resolve();
  if (document.fonts && document.fonts.load) {
    fontsReady = Promise.all([
      document.fonts.load('800 1em Archivo', 'Oğuz Atasoy'),
      document.fonts.load('400 1em Archivo', 'Alternance'),
      document.fonts.load('500 1em "IBM Plex Mono"', 'N° 01')
    ]).catch(function () { /* on démarre quand même */ });
  }
  var grace = new Promise(function (resolve) { window.setTimeout(resolve, 1500); });
  Promise.race([fontsReady, grace]).then(function () {
    window.requestAnimationFrame(function () { window.requestAnimationFrame(start); });
  });
})();

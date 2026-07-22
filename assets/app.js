/* TRE Worldwide Conference — Bali 2027 | site scripts */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  // ---- footer year ----
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // ---- mobile nav ----
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  // ---- transparent header -> solid on scroll ----
  var header = document.querySelector('.site-header');
  if (header) {
    var setHeader = function () {
      header.classList.toggle('scrolled', (window.scrollY || window.pageYOffset) > 24);
    };
    setHeader();
    window.addEventListener('scroll', setHeader, { passive: true });
    window.addEventListener('resize', setHeader, { passive: true });
  }

  // ---- countdown ----
  // Event opens: 12 November 2027, 09:00 Bali time (WITA, UTC+8)
  var TARGET = new Date('2027-11-12T09:00:00+08:00').getTime();
  var boxes = document.querySelectorAll('[data-countdown]');
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    if (!boxes.length) return;
    var diff = TARGET - Date.now();
    if (diff < 0) diff = 0;
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    var map = { days: d, hours: pad(h), minutes: pad(m), seconds: pad(s) };
    boxes.forEach(function (root) {
      Object.keys(map).forEach(function (k) {
        var el = root.querySelector('[data-cd="' + k + '"]');
        if (el && el.textContent !== String(map[k])) {
          el.textContent = map[k];
          el.classList.remove('tick');
          void el.offsetWidth; // reflow to restart the pop animation
          el.classList.add('tick');
        }
      });
    });
  }
  if (boxes.length) { tick(); setInterval(tick, 1000); }

  // ---- reveal on scroll (auto-applied site-wide + staggered) ----
  var revealSel = '.reveal, .card, .tier, .speaker, .day, .stat, .fact, .gallery figure, .split-media, .note, .section-head';
  document.querySelectorAll(revealSel).forEach(function (el) { el.classList.add('reveal'); });
  var reveals = document.querySelectorAll('.reveal');
  reveals.forEach(function (el) {
    if (!el.parentElement) return;
    var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('reveal'); });
    var idx = sibs.indexOf(el);
    if (idx > 0) el.style.transitionDelay = Math.min(idx, 6) * 70 + 'ms';
  });
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }
  // safety net: never leave in-view content hidden if the observer is delayed
  setTimeout(function () {
    reveals.forEach(function (el) {
      if (el.classList.contains('in')) return;
      var r = el.getBoundingClientRect();
      if (r.top < (window.innerHeight || 800) && r.bottom > 0) el.classList.add('in');
    });
  }, 2200);

  // ---- gallery lightbox ----
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img');
    document.querySelectorAll('.gallery figure').forEach(function (fig) {
      fig.addEventListener('click', function () {
        var img = fig.querySelector('img');
        if (img) { lbImg.src = img.src; lbImg.alt = img.alt; lb.classList.add('open'); }
      });
    });
    function close() { lb.classList.remove('open'); }
    lb.addEventListener('click', close);
    var cl = lb.querySelector('.lb-close');
    if (cl) cl.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  // ---- attendance (in-person vs online) + tier selection ----
  var params = new URLSearchParams(window.location.search);
  var pretier = params.get('tier');
  var radios = document.querySelectorAll('input[name="tier"]');

  function refreshTiers() {
    document.querySelectorAll('.radio-tier').forEach(function (rt) {
      var r = rt.querySelector('input');
      rt.classList.toggle('sel', r && r.checked);
    });
    var sel = document.querySelector('input[name="tier"]:checked');
    var sumTier = document.getElementById('sum-tier');
    var sumPrice = document.getElementById('sum-price');
    if (sel && sumTier) sumTier.textContent = sel.getAttribute('data-name');
    if (sel && sumPrice) sumPrice.textContent = sel.getAttribute('data-price');
  }

  function setAttend(mode) {
    // sync every toggle on the page (tickets section + form)
    document.querySelectorAll('.at-opt').forEach(function (b) {
      var on = b.getAttribute('data-attend') === mode;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    // ticket card groups
    document.querySelectorAll('[data-tiers]').forEach(function (g) {
      g.hidden = g.getAttribute('data-tiers') !== mode;
    });
    // form radio groups — enable only the active group so hidden radios don't submit
    document.querySelectorAll('[data-attend-group]').forEach(function (g) {
      var on = g.getAttribute('data-attend-group') === mode;
      g.hidden = !on;
      g.querySelectorAll('input[name="tier"]').forEach(function (r) { r.disabled = !on; });
    });
    // ensure a radio is selected in the active group
    var active = document.querySelector('[data-attend-group="' + mode + '"]');
    if (active && !active.querySelector('input[name="tier"]:checked')) {
      var first = active.querySelector('input[name="tier"]');
      if (first) first.checked = true;
    }
    // summary labels
    var sumAttend = document.getElementById('sum-attend');
    if (sumAttend) sumAttend.textContent = mode === 'online' ? 'Online · Live-stream' : 'In person · Bali';
    var sumAccess = document.getElementById('sum-access');
    if (sumAccess) sumAccess.textContent = mode === 'online' ? 'Live-stream + recordings' : 'Full 3.5 days';
    refreshTiers();
  }

  document.querySelectorAll('.at-opt').forEach(function (b) {
    b.addEventListener('click', function () { setAttend(b.getAttribute('data-attend')); });
  });

  if (radios.length) {
    radios.forEach(function (r) { r.addEventListener('change', refreshTiers); });
    // preselect from ?tier= (picks the right mode), else default to in-person
    var pre = pretier ? document.querySelector('input[name="tier"][value="' + pretier + '"]') : null;
    if (pre) {
      var grp = pre.closest('[data-attend-group]');
      setAttend(grp && grp.getAttribute('data-attend-group') === 'online' ? 'online' : 'inperson');
      pre.checked = true;
      refreshTiers();
    } else {
      setAttend('inperson');
    }
  }

  // ---- pick a tier from the ticket cards -> switch mode + select the form radio ----
  document.querySelectorAll('.pick-tier').forEach(function (el) {
    el.addEventListener('click', function () {
      setAttend(el.getAttribute('data-attend') || 'inperson');
      var t = el.getAttribute('data-tier');
      var r = document.querySelector('input[name="tier"][value="' + t + '"]');
      if (r) { r.checked = true; refreshTiers(); }
    });
  });

  // ---- get-ticket: visa conditional note ----
  var visaSel = document.getElementById('visa');
  var visaNote = document.getElementById('visa-note');
  if (visaSel && visaNote) {
    visaSel.addEventListener('change', function () {
      visaNote.classList.toggle('show', visaSel.value === 'yes');
    });
  }

  // ---- get-ticket: demo submit ----
  var form = document.getElementById('ticket-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = document.getElementById('form-success');
      form.style.display = 'none';
      if (ok) { ok.classList.add('show'); ok.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
  }

  // ---- stat count-up (animates the big numbers into view) ----
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nums = document.querySelectorAll('.stat .num');
  if (nums.length && !reduceMotion && 'IntersectionObserver' in window) {
    var countUp = function (el) {
      var small = el.querySelector('small');
      var suffix = small ? small.outerHTML : '';
      var raw = (small ? el.textContent.replace(small.textContent, '') : el.textContent).trim();
      var target = parseFloat(raw);
      if (isNaN(target)) return;
      var decimals = raw.indexOf('.') > -1 ? (raw.split('.')[1] || '').length : 0;
      var dur = 1400, startTs = null;
      var step = function (ts) {
        if (startTs === null) startTs = ts;
        var p = Math.min((ts - startTs) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.innerHTML = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) { requestAnimationFrame(step); }
        else { el.innerHTML = raw + suffix; }
      };
      requestAnimationFrame(step);
    };
    var statIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); statIO.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { statIO.observe(el); });
  }
})();

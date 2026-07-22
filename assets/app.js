/* TRE Worldwide Conference — Bali 2027 | site scripts */
(function () {
  'use strict';

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
        if (el) el.textContent = map[k];
      });
    });
  }
  if (boxes.length) { tick(); setInterval(tick, 1000); }

  // ---- reveal on scroll ----
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

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

  // ---- get-ticket: preselect tier from ?tier= ----
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
  if (radios.length) {
    radios.forEach(function (r) {
      r.addEventListener('change', refreshTiers);
      if (pretier && r.value === pretier) r.checked = true;
    });
    if (!document.querySelector('input[name="tier"]:checked')) radios[0].checked = true;
    refreshTiers();
  }

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
})();

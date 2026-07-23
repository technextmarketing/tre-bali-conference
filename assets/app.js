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

  function money(n) { return '$' + Number(n).toLocaleString('en-US') + ' USD'; }
  function priceOf(el) { return parseInt(((el && el.getAttribute('data-price')) || '').replace(/[^0-9]/g, ''), 10) || 0; }
  function refreshTiers() {
    document.querySelectorAll('.radio-tier').forEach(function (rt) {
      var r = rt.querySelector('input');
      rt.classList.toggle('sel', r && r.checked);
    });
    var sel = document.querySelector('input[name="tier"]:checked');
    if (!sel) return;
    var qtyEl = document.getElementById('qty');
    var qty = qtyEl ? (parseInt(qtyEl.value, 10) || 1) : 1;
    var unit = priceOf(sel);
    var sumTier = document.getElementById('sum-tier');
    var sumUnit = document.getElementById('sum-unit');
    var sumQty = document.getElementById('sum-qty');
    var sumTotal = document.getElementById('sum-total');
    if (sumTier) sumTier.textContent = sel.getAttribute('data-name');
    if (sumUnit) sumUnit.textContent = money(unit);
    if (sumQty) sumQty.textContent = qty + (qty > 1 ? ' tickets' : ' ticket');
    if (sumTotal) {
      var next = money(unit * qty);
      if (sumTotal.textContent !== next) {
        sumTotal.textContent = next;
        var box = sumTotal.closest('.total');
        if (box) { box.classList.remove('bump'); void box.offsetWidth; box.classList.add('bump'); }
      }
    }
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

  // ---- quantity drives the order total (1 ticket = 1 price) ----
  var qtySel = document.getElementById('qty');
  if (qtySel) qtySel.addEventListener('change', refreshTiers);

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
      // enforce all required fields — including the "I agree" checkbox — before payment
      if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;
      var agree = form.querySelector('input[type="checkbox"]');
      if (agree && !agree.checked) { agree.focus(); return; }
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

  // ---- card 3D tilt + cursor glare (pointer devices only, motion-safe) ----
  if (window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches && !reduceMotion) {
    document.querySelectorAll('.card, .tier, .speaker, .day').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        el.style.transition = 'transform .08s ease-out';
        el.style.transform = 'perspective(900px) rotateX(' + ((0.5 - py) * 6).toFixed(2) + 'deg) rotateY(' + ((px - 0.5) * 6).toFixed(2) + 'deg) translateY(-6px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transition = '';
        el.style.transform = '';
      });
    });
  }

  // ---- floating demo chatbot (injected on every page) ----
  (function () {
    if (document.querySelector('.chatbot')) return;
    var cb = document.createElement('div');
    cb.className = 'chatbot';
    cb.innerHTML =
      '<div class="chat-panel" role="dialog" aria-label="Conference assistant" aria-hidden="true">' +
        '<div class="chat-head">' +
          '<span class="avatar">TRE</span>' +
          '<div><div class="ch-title">Conference assistant</div><div class="ch-sub">Typically replies instantly</div></div>' +
          '<button class="ch-close" type="button" aria-label="Close chat">&times;</button>' +
        '</div>' +
        '<div class="chat-body" id="chat-body"></div>' +
        '<div class="chat-chips" id="chat-chips"></div>' +
        '<form class="chat-input" id="chat-form">' +
          '<input type="text" id="chat-text" placeholder="Ask about tickets, dates, visas…" autocomplete="off" aria-label="Your message">' +
          '<button type="submit" aria-label="Send"><svg viewBox="0 0 24 24"><path d="M4 12l16-8-6 16-3-7-7-1z"/></svg></button>' +
        '</form>' +
      '</div>' +
      '<button class="chat-fab" type="button" aria-label="Open chat" aria-expanded="false">' +
        '<span class="badge">1</span>' +
        '<svg class="ic-chat" viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 21l2-5.6A8.5 8.5 0 1 1 21 11.5z"/></svg>' +
        '<svg class="ic-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button>';
    document.body.appendChild(cb);

    var fab = cb.querySelector('.chat-fab');
    var panel = cb.querySelector('.chat-panel');
    var msgs = cb.querySelector('#chat-body');
    var chips = cb.querySelector('#chat-chips');
    var cform = cb.querySelector('#chat-form');
    var input = cb.querySelector('#chat-text');
    var greeted = false;

    var QUICK = [
      { label: '🎟 Tickets & prices', q: 'tickets' },
      { label: '📅 Dates', q: 'when are the dates' },
      { label: '🌏 Online or in person?', q: 'online or in person' },
      { label: '🛂 Visa', q: 'visa' },
      { label: '🎤 Speakers', q: 'speakers' }
    ];
    var ANSWERS = [
      { k: /ticket|price|cost|pay|wave|how much/i, a: 'Tickets are released in rising-price waves — the earliest buyers pay the least. <b>In person</b> starts at $300 and <b>online</b> from $120. See the full breakdown on the <a href="index.html#tickets">Tickets section</a>.' },
      { k: /online|in.?person|virtual|stream|remote|attend/i, a: 'You can join <b>in person in Bali</b> (full 3.5 days + hands-on workshops) or <b>online by live-stream</b> (keynotes & panels + recordings). Choose your mode on the <a href="index.html#tickets">Tickets</a> toggle.' },
      { k: /date|when|schedul|programme|program/i, a: 'The conference runs <b>12–15 November 2027</b> — a 3.5-day gathering in Bali. The day-by-day flow is on the <a href="info.html#programme">Info page</a>.' },
      { k: /visa|invitation|letter|passport/i, a: 'Many visitors enter Indonesia visa-free or on arrival. When you register we ask if you need a visa, and TRE Indonesia can issue an official <b>invitation letter</b>. More on the <a href="info.html#visa">Info page</a>.' },
      { k: /where|location|venue|bali|hotel|stay|travel|airport|fly/i, a: 'It’s in <b>Bali, Indonesia</b> — fly into Denpasar (DPS). The exact venue and a recommended hotel list are shared when you book. See <a href="info.html#hotels">travel & stay</a>.' },
      { k: /speaker|facilitator|workshop|host|who/i, a: 'Hosts, facilitators, workshop leads and guest speakers are listed on the <a href="speakers.html">Speakers page</a>, with more announced as the programme is confirmed.' },
      { k: /register|book|sign|reserve|join|buy/i, a: 'Reserve your place on the <a href="index.html#register">registration form</a> — pick in-person or online, choose your wave, and you’re set.' },
      { k: /refund|cancel|transfer/i, a: 'Refund and transfer terms are in our <a href="terms.html">Terms & Conditions</a> (draft) — final terms are confirmed at launch.' },
      { k: /hello|hi|hey|good (morning|afternoon|evening)/i, a: 'Hi there! 👋 I can help with tickets, dates, online vs in-person, visas, location and speakers. What would you like to know?' },
      { k: /thank|thanks|cheers/i, a: 'You’re welcome! Anything else I can help with?' }
    ];

    function addMsg(html, who) {
      var m = document.createElement('div');
      m.className = 'msg ' + who;
      m.innerHTML = html;
      msgs.appendChild(m);
      msgs.scrollTop = msgs.scrollHeight;
    }
    function reply(text) {
      var ans = null, i;
      for (i = 0; i < ANSWERS.length; i++) { if (ANSWERS[i].k.test(text)) { ans = ANSWERS[i].a; break; } }
      if (!ans) ans = 'I’m a demo assistant for the TRE Worldwide Conference. Try asking about <b>tickets</b>, <b>dates</b>, <b>online vs in-person</b>, <b>visas</b>, <b>location</b> or <b>speakers</b> — or email <a href="mailto:hello@technext.asia">hello@technext.asia</a>.';
      setTimeout(function () { addMsg(ans, 'bot'); }, 420);
    }
    function greet() {
      if (greeted) return;
      greeted = true;
      addMsg('Welcome to the <b>TRE Worldwide Conference</b> 🌴 I’m here to help — tap a topic below or type your question. <i>(demo assistant)</i>', 'bot');
    }
    QUICK.forEach(function (q) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = q.label;
      b.addEventListener('click', function () { addMsg(q.label.replace(/^\S+\s/, ''), 'user'); reply(q.q); });
      chips.appendChild(b);
    });

    function openChat() { cb.classList.add('open'); fab.setAttribute('aria-expanded', 'true'); panel.setAttribute('aria-hidden', 'false'); greet(); setTimeout(function () { input.focus(); }, 280); }
    function closeChat() { cb.classList.remove('open'); fab.setAttribute('aria-expanded', 'false'); panel.setAttribute('aria-hidden', 'true'); }
    fab.addEventListener('click', function () { if (cb.classList.contains('open')) { closeChat(); } else { openChat(); } });
    cb.querySelector('.ch-close').addEventListener('click', closeChat);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && cb.classList.contains('open')) closeChat(); });
    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      var t = input.value.trim();
      if (!t) return;
      addMsg(t.replace(/</g, '&lt;'), 'user');
      input.value = '';
      reply(t);
    });
  })();
})();

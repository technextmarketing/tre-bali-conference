/* TRE™ Worldwide Conference — Bali 2027 | site scripts */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  // Odoo lead bridge: paste the deployed Google Apps Script /exec URL here.
  // The Odoo API key lives ONLY inside that script (server-side) — never in this file.
  // Leave blank to keep the form in demo mode (no data sent).
  var LEAD_ENDPOINT = '';

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

  // ---- scroll progress bar ----
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  var setProgress = function () {
    var st = window.scrollY || document.documentElement.scrollTop || 0;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? Math.min(st / h * 100, 100) : 0) + '%';
  };
  setProgress();
  window.addEventListener('scroll', setProgress, { passive: true });
  window.addEventListener('resize', setProgress, { passive: true });

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
      // send the registration to Odoo via the server-side bridge (fire-and-forget)
      if (LEAD_ENDPOINT) {
        try {
          var v = function (id) { var el = document.getElementById(id); return el ? el.value : ''; };
          var selTier = document.querySelector('input[name="tier"]:checked');
          var attendEl = document.getElementById('sum-attend');
          var totalEl = document.getElementById('sum-total');
          var data = new URLSearchParams();
          data.set('source', 'tre-bali-website');
          data.set('first_name', v('fname'));
          data.set('last_name', v('lname'));
          data.set('email', v('email'));
          data.set('phone', v('phone'));
          data.set('country', v('country'));
          data.set('quantity', v('qty'));
          data.set('visa', v('visa'));
          data.set('notes', v('notes'));
          data.set('tier', selTier ? selTier.getAttribute('data-name') : '');
          data.set('attendance', attendEl ? attendEl.textContent : '');
          data.set('total', totalEl ? totalEl.textContent : '');
          fetch(LEAD_ENDPOINT, { method: 'POST', mode: 'no-cors', body: data }).catch(function () {});
        } catch (err) { /* never block the confirmation on a network hiccup */ }
      }
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

  // ---- speaker profile modal + per-card share (works wherever .speaker cards exist) ----
  (function () {
    var cards = document.querySelectorAll('.speaker');
    if (!cards.length) return;

    var POOL = ['images/g1.jpg','images/g2.jpg','images/g3.jpg','images/g4.jpg','images/g5.jpg','images/g6.jpg','images/g7.jpg','images/g8.jpg'];
    var IC = {
      share:'<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
      fb:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13.5 21v-7H16l.4-3h-2.9V9.2c0-.8.3-1.4 1.5-1.4H17V5.1C16.6 5 15.7 5 14.7 5c-2.1 0-3.6 1.3-3.6 3.7V11H8.5v3h2.6v7z"/></svg>',
      x:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M17.5 3h3l-6.6 7.5L21.7 21h-6l-4.2-5.5L6.5 21h-3l7-8L2.3 3h6.1l3.8 5z"/></svg>',
      li:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.4 8.65 21 10.9 21 14v7h-4v-6.2c0-1.48-.03-3.38-2.06-3.38-2.06 0-2.38 1.6-2.38 3.27V21H9z"/></svg>',
      th:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C6.7 2 3 5.9 3 12s3.7 10 9 10 9-3.9 9-10S17.3 2 12 2zm4.4 11.4c.2 1.5-.3 3.3-2.7 4.2-1 .4-2.1.5-3.3.5-2.4 0-4.2-.8-5.4-2.4C4 14.5 3.6 12.9 3.6 12s.4-2.5 1.4-3.7C6.2 6.7 8 5.9 10.4 5.9c2.4 0 4.2.8 5.4 2.4.4.6.8 1.3 1 2.1l-1.6.4c-.2-.6-.4-1.1-.7-1.5-.8-1.1-2.1-1.6-3.9-1.6-1.8 0-3.1.5-3.9 1.6-.7 1-1 2.1-1 3.2s.3 2.2 1 3.2c.8 1.1 2.1 1.6 3.9 1.6 1.1 0 2-.2 2.6-.4 1.1-.4 1.4-1.2 1.3-1.9-.1-.5-.4-.9-.9-1.2-.2 1-.7 2.1-2.6 2.1-1.2 0-2.2-.8-2.2-1.9 0-1.3 1.1-2 2.7-2 .5 0 1 .1 1.4.2 0-.9-.6-1.5-1.5-1.5-.6 0-1.1.2-1.4.7l-1.4-.8c.5-.8 1.5-1.2 2.8-1.2z"/></svg>',
      ig:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
      cp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>',
      person:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:52px;height:52px"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0 1 14 0v1"/></svg>'
    };

    var host = document.createElement('div');
    host.innerHTML =
      '<div class="pm-overlay" id="pm-ov"><div class="pm-card" role="dialog" aria-modal="true" aria-label="Speaker profile">' +
        '<div class="pm-hero" id="pm-hero"></div><button class="pm-close" id="pm-x" aria-label="Close">×</button>' +
        '<div class="pm-body">' +
          '<div class="pm-role" id="pm-role"></div><div class="pm-name" id="pm-name"></div>' +
          '<p class="pm-bio" id="pm-bio"></p><div class="pm-session" id="pm-session"></div>' +
          '<div class="pm-socials" id="pm-socials"></div>' +
          '<div class="pm-gallery-h">Gallery</div><div class="pm-gallery" id="pm-gal"></div>' +
          '<div class="pm-share"><div class="pm-share-h">Share this facilitator</div><div class="share-row" id="pm-share"></div></div>' +
        '</div></div></div>' +
      '<div class="share-pop-ov" id="sp-ov"><div class="share-pop"><h4>Share</h4><p id="sp-name"></p><div class="share-row" id="sp-row"></div></div></div>' +
      '<div class="toast" id="pm-toast"></div>';
    document.body.appendChild(host);

    var ov = document.getElementById('pm-ov'), spOv = document.getElementById('sp-ov'), toastEl = document.getElementById('pm-toast');
    var toastTimer;
    function toast(m){ toastEl.textContent = m; toastEl.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(function(){ toastEl.classList.remove('show'); }, 3400); }

    function cardData(card){
      var img = card.querySelector('.ph img');
      var name = (card.querySelector('h3') || {}).textContent || 'Speaker';
      var roleEl = card.querySelector('.s-role'); var role = roleEl ? roleEl.textContent.trim() : '';
      var bio = (card.querySelector('.s-bio') || {}).textContent || '';
      var session = (card.querySelector('.s-session') || {}).innerHTML || '';
      var socials = (card.querySelector('.socials') || {}).innerHTML || '';
      var gallery = (card.getAttribute('data-gallery') || '').split(',').filter(Boolean);
      var url = location.origin + location.pathname + '?speaker=' + encodeURIComponent(card.id);
      var photo = img ? img.src : (gallery[0] ? new URL(gallery[0], location.href).href : '');
      var caption = name + ' — ' + role + ' at the TRE™ Worldwide Conference, Bali · 12–15 November 2027.';
      return { id: card.id, name: name, role: role, bio: bio, session: session, socials: socials, gallery: gallery, url: url, photo: photo, caption: caption, hasPhoto: !!img };
    }

    function shareIG(d){
      var cap = d.caption + '\n' + d.url;
      function fallback(){ try { if (navigator.clipboard) navigator.clipboard.writeText(cap); } catch (e) {} if (d.photo) window.open(d.photo, '_blank', 'noopener'); toast('Caption copied — photo opened; save it and post to Instagram'); }
      if (d.photo && navigator.canShare) {
        fetch(d.photo).then(function(r){ return r.blob(); }).then(function(b){
          var file = new File([b], 'tre-facilitator.jpg', { type: b.type || 'image/jpeg' });
          if (navigator.canShare({ files: [file] })) { return navigator.share({ files: [file], text: cap }); }
          throw 0;
        }).catch(fallback);
      } else { fallback(); }
    }

    function share(p, d){
      var u = encodeURIComponent(d.url), t = encodeURIComponent(d.caption), tu = encodeURIComponent(d.caption + ' ' + d.url);
      if (p === 'fb') window.open('https://www.facebook.com/sharer/sharer.php?u=' + u, '_blank', 'noopener,width=640,height=640');
      else if (p === 'x') window.open('https://twitter.com/intent/tweet?text=' + t + '&url=' + u, '_blank', 'noopener,width=600,height=640');
      else if (p === 'li') window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + u, '_blank', 'noopener,width=640,height=640');
      else if (p === 'th') window.open('https://www.threads.net/intent/post?text=' + tu, '_blank', 'noopener,width=640,height=720');
      else if (p === 'ig') shareIG(d);
      else if (p === 'cp') { if (navigator.clipboard) { navigator.clipboard.writeText(d.url).then(function(){ toast('Link copied to clipboard'); }, function(){ toast(d.url); }); } else { toast(d.url); } }
    }

    function renderShare(el, d){
      var defs = [['fb','Facebook'],['x','X'],['li','LinkedIn'],['th','Threads'],['ig','Instagram'],['cp','Copy link']];
      el.innerHTML = '';
      defs.forEach(function(x){
        var b = document.createElement('button'); b.className = 'share-btn ' + x[0]; b.type = 'button';
        b.innerHTML = IC[x[0]] + '<span>' + x[1] + '</span>';
        b.addEventListener('click', function(e){ e.stopPropagation(); share(x[0], d); });
        el.appendChild(b);
      });
    }

    function openProfile(card){
      var d = cardData(card);
      var hero = document.getElementById('pm-hero');
      if (d.hasPhoto) { hero.className = 'pm-hero'; hero.innerHTML = '<img src="' + d.photo + '" alt="' + d.name + '">'; }
      else { hero.className = 'pm-hero placeholder'; hero.innerHTML = '<div style="text-align:center">' + IC.person + '<div style="margin-top:10px;font-weight:600">Speaker photo — to be announced</div></div>'; }
      document.getElementById('pm-role').textContent = d.role;
      document.getElementById('pm-name').textContent = d.name;
      document.getElementById('pm-bio').textContent = d.bio;
      document.getElementById('pm-session').innerHTML = d.session;
      var soc = document.getElementById('pm-socials'); soc.innerHTML = d.socials; soc.style.display = d.socials ? 'flex' : 'none';
      document.getElementById('pm-gal').innerHTML = d.gallery.map(function(g){ return '<img src="' + g + '" alt="" loading="lazy">'; }).join('');
      renderShare(document.getElementById('pm-share'), d);
      ov.classList.add('open'); document.body.style.overflow = 'hidden';
      try { history.replaceState(null, '', location.pathname + '?speaker=' + encodeURIComponent(d.id)); } catch (e) {}
    }
    function closeProfile(){ ov.classList.remove('open'); document.body.style.overflow = ''; try { history.replaceState(null, '', location.pathname); } catch (e) {} }
    function openSheet(d){ document.getElementById('sp-name').textContent = d.name; renderShare(document.getElementById('sp-row'), d); spOv.classList.add('open'); }
    function closeSheet(){ spOv.classList.remove('open'); }

    document.getElementById('pm-x').addEventListener('click', closeProfile);
    ov.addEventListener('click', function(e){ if (e.target === ov) closeProfile(); });
    spOv.addEventListener('click', function(e){ if (e.target === spOv) closeSheet(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') { if (spOv.classList.contains('open')) closeSheet(); else if (ov.classList.contains('open')) closeProfile(); } });

    Array.prototype.forEach.call(cards, function(card, i){
      if (!card.id) card.id = 'spk-' + i;
      if (!card.getAttribute('data-gallery')) card.setAttribute('data-gallery', [POOL[i % 8], POOL[(i + 3) % 8], POOL[(i + 5) % 8]].join(','));
      var sb = document.createElement('button'); sb.className = 'card-share'; sb.type = 'button'; sb.setAttribute('aria-label', 'Share this facilitator'); sb.innerHTML = IC.share;
      sb.addEventListener('click', function(e){ e.stopPropagation(); openSheet(cardData(card)); });
      card.appendChild(sb);
      card.setAttribute('role', 'button'); card.setAttribute('tabindex', '0');
      card.addEventListener('click', function(){ openProfile(card); });
      card.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProfile(card); } });
      var soc = card.querySelector('.socials'); if (soc) soc.addEventListener('click', function(e){ e.stopPropagation(); });
    });

    var sp = new URLSearchParams(location.search).get('speaker');
    if (sp) { var c = document.getElementById(sp); if (c && c.classList.contains('speaker')) setTimeout(function(){ openProfile(c); }, 300); }
  })();

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
      { k: /visa|invitation|letter|passport/i, a: 'Many visitors enter Indonesia visa-free or on arrival. When you register we ask if you need a visa, and TRE™ Indonesia can issue an official <b>invitation letter</b>. More on the <a href="info.html#visa">Info page</a>.' },
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
      if (!ans) ans = 'I’m a demo assistant for the TRE™ Worldwide Conference. Try asking about <b>tickets</b>, <b>dates</b>, <b>online vs in-person</b>, <b>visas</b>, <b>location</b> or <b>speakers</b> — or email <a href="mailto:hello@technext.asia">hello@technext.asia</a>.';
      setTimeout(function () { addMsg(ans, 'bot'); }, 420);
    }
    function greet() {
      if (greeted) return;
      greeted = true;
      addMsg('Welcome to the <b>TRE™ Worldwide Conference</b> 🌴 I’m here to help — tap a topic below or type your question. <i>(demo assistant)</i>', 'bot');
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

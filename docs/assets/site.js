/* =============================================================================
   Taxi Aktiv Willingen – Interaktionen
   Verhalten 1:1 nach dem Claude-Design (Komponente in „Taxi Aktiv Website.dc.html“).
   Kein Framework, keine externen Skripte. Nutzereingaben werden nie als HTML
   eingefügt.
   ============================================================================= */
(function () {
  'use strict';

  var doc = document;
  var root = doc.querySelector('.ta-root');
  if (!root) return;
  var page = doc.body.getAttribute('data-page') || 'home';
  var motionOn = root.getAttribute('data-motion') !== 'off';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  /* ---------------------------------------------------------------------------
     Header: Hintergrund ab scrollY > 24
     ------------------------------------------------------------------------- */
  var bar = $('[data-bar]');
  function onScroll() { if (bar) bar.classList.toggle('is-scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------------------
     Navigations-Indikator (gelber Balken folgt Hover, kehrt zur aktiven Seite zurück)
     ------------------------------------------------------------------------- */
  var nav = $('[data-navbar]');
  var ind = nav && $('[data-nav-ind]', nav);
  var hoverNav = false;
  function placeInd(el) {
    if (!ind) return;
    if (!el || !el.offsetWidth) { ind.style.opacity = '0'; return; }
    ind.style.left = el.offsetLeft + 'px';
    ind.style.width = el.offsetWidth + 'px';
    ind.style.opacity = '1';
  }
  function syncNav() { if (nav && !hoverNav) placeInd($('[data-nav-item="' + page + '"]', nav)); }
  if (nav) {
    $$('[data-nav-item]', nav).forEach(function (item) {
      item.addEventListener('mouseenter', function () { hoverNav = true; placeInd(item); });
    });
    nav.addEventListener('mouseleave', function () { hoverNav = false; syncNav(); });
    setTimeout(syncNav, 80);
    setTimeout(syncNav, 600);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(syncNav);
    window.addEventListener('resize', syncNav);
  }

  /* ---------------------------------------------------------------------------
     Mobiles Menü
     ------------------------------------------------------------------------- */
  var menuBtn = $('[data-menu-toggle]');
  var menu = $('#ta-mmenu');
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      var open = menu.hasAttribute('hidden');
      menu.toggleAttribute('hidden', !open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      $('[data-icon-menu]', menuBtn).toggleAttribute('hidden', open);
      $('[data-icon-close]', menuBtn).toggleAttribute('hidden', !open);
    });
  }

  /* ---------------------------------------------------------------------------
     Fahrzeug-Slider im Hero (Startseite)
     ------------------------------------------------------------------------- */
  var EASE = 'cubic-bezier(.22,.8,.25,1)';
  function el(tag, style, attrs) {
    var n = doc.createElement(tag);
    if (style) n.setAttribute('style', style);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function buildStage(car, prevSrc) {
    var wrap = el('div', 'position:absolute;inset:0');
    if (prevSrc && motionOn) {
      wrap.appendChild(el('img', 'position:absolute;inset:-4% -2% 0;width:104%;height:104%;object-fit:contain;transform-origin:30% 80%;animation:taLeave .7s cubic-bezier(.5,0,.9,.4) both;pointer-events:none', { src: prevSrc, alt: '', 'data-prev-car': '' }));
    }
    wrap.appendChild(el('div', 'position:absolute;left:10%;right:10%;bottom:2%;height:11%;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.32),transparent);animation:taShadowIn 1.5s ' + EASE + ' both'));
    var carBox = el('div', 'position:absolute;inset:-4% -2% 0;transform-origin:30% 85%;animation:taArrive 1.5s ' + EASE + ' both');
    var rumble = el('div', 'width:100%;height:100%;animation:taRumble .12s linear 0s 9');
    var img = el('img', 'width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 18px 22px rgba(0,0,0,.18))', { src: car.src });
    img.alt = car.name;
    rumble.appendChild(img);
    carBox.appendChild(rumble);
    wrap.appendChild(carBox);
    var lines = el('div', 'position:absolute;right:-6%;top:30%;width:32%;display:flex;flex-direction:column;gap:14px;pointer-events:none', { 'aria-hidden': 'true' });
    [['70%', '#151515', '.15s'], ['100%', '#FFD000', '.25s'], ['55%', '#151515', '.35s']].forEach(function (l) {
      lines.appendChild(el('span', 'display:block;height:4px;width:' + l[0] + ';border-radius:4px;background:' + l[1] + ';transform-origin:left;animation:taSpeedR .9s ' + l[2] + ' ease-out both'));
    });
    wrap.appendChild(lines);
    return wrap;
  }

  var stage = $('[data-car-stage][data-fleet]');
  if (stage) {
    var fleet = [];
    try { fleet = JSON.parse(stage.getAttribute('data-fleet')) || []; } catch (e) { fleet = []; }
    var slide = 1, prevTimer = 0;
    var numEl = $('[data-slide-num]'), nameEl = $('[data-car-name]'), seatsEl = $('[data-car-seats]');
    var changeSlide = function (dir) {
      if (fleet.length !== 6) return;
      var prevSrc = fleet[slide - 1].src;
      slide = ((slide - 1 + dir + 6) % 6) + 1;
      var car = fleet[slide - 1];
      stage.replaceChildren(buildStage(car, prevSrc));
      if (numEl) numEl.textContent = String(slide);
      if (nameEl) nameEl.textContent = car.name;
      if (seatsEl) seatsEl.textContent = car.seats;
      clearTimeout(prevTimer);
      prevTimer = setTimeout(function () { var p = $('[data-prev-car]', stage); if (p) p.remove(); }, 750);
    };
    $$('[data-slide]').forEach(function (b) {
      b.addEventListener('click', function () { changeSlide(parseInt(b.getAttribute('data-slide'), 10) || 1); });
    });
    // Fahrzeugbilder vorladen, damit der Wechsel ohne Ladepause animiert.
    window.addEventListener('load', function () {
      setTimeout(function () { fleet.forEach(function (c) { var i = new Image(); i.src = c.src; }); }, 400);
    });
  }

  /* ---------------------------------------------------------------------------
     Scroll-Reveal (data-reveal) – identische Staffelung wie im Design.
     Bei reduzierter Bewegung bleiben Inhalte einfach sichtbar.
     ------------------------------------------------------------------------- */
  if (motionOn && !reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'none'; io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    $$('[data-reveal]', root).forEach(function (n) {
      var idx = n.parentElement ? Array.prototype.indexOf.call(n.parentElement.children, n) : 0;
      var d = (idx % 6) * 90;
      n.style.opacity = '0';
      n.style.transform = 'translateY(32px)';
      n.style.transition = 'opacity .7s ease ' + d + 'ms, transform .7s cubic-bezier(.2,.8,.2,1) ' + d + 'ms';
      io.observe(n);
    });
  }

  /* ---------------------------------------------------------------------------
     „Alle Leistungen im Überblick“ – sanft scrollen (−20 px wie im Design)
     ------------------------------------------------------------------------- */
  $$('[data-scroll-to]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var target = doc.getElementById(a.getAttribute('data-scroll-to'));
      if (!target) return;
      ev.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 20, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------------------------------------------------------------------------
     FAQ-Akkordeon (Leistungen) – immer nur ein Eintrag offen
     ------------------------------------------------------------------------- */
  var faqs = $$('[data-faq]');
  function setFaq(item, open) {
    $('[data-faq-toggle]', item).setAttribute('aria-expanded', String(open));
    $('[data-faq-answer]', item).toggleAttribute('hidden', !open);
    $('[data-chev-down]', item).toggleAttribute('hidden', open);
    $('[data-chev-up]', item).toggleAttribute('hidden', !open);
  }
  faqs.forEach(function (item) {
    $('[data-faq-toggle]', item).addEventListener('click', function () {
      var wasOpen = this.getAttribute('aria-expanded') === 'true';
      faqs.forEach(function (f) { setFaq(f, false); });
      if (!wasOpen) setFaq(item, true);
    });
  });

  /* ---------------------------------------------------------------------------
     Datum/Uhrzeit-Felder: Platzhalter wie im Design, beim Fokus nativer Picker
     ------------------------------------------------------------------------- */
  $$('input[data-type]').forEach(function (inp) {
    inp.addEventListener('focus', function () { if (inp.type === 'text') inp.type = inp.getAttribute('data-type'); });
    inp.addEventListener('blur', function () { if (!inp.value) inp.type = 'text'; });
  });

  /* ---------------------------------------------------------------------------
     Formulare
     TODO(Supabase): Anfragen werden aktuell NICHT übertragen – es wird nur die
     Bestätigung angezeigt (wie im Design-Prototyp). Hier später den Versand an
     das Backend (z. B. Supabase Edge Function mit Validierung + Rate-Limit)
     anbinden und erst bei Erfolg die Bestätigung zeigen.
     ------------------------------------------------------------------------- */
  $$('form[data-form]').forEach(function (form) {
    var key = form.getAttribute('data-form');
    var sent = $('[data-sent="' + key + '"]');
    var reset = $('[data-reset="' + key + '"]');
    form.addEventListener('invalid', function () { form.classList.add('was-validated'); }, true);
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!form.checkValidity()) { form.classList.add('was-validated'); form.reportValidity(); return; }
      form.hidden = true;
      if (sent) { sent.hidden = false; sent.setAttribute('tabindex', '-1'); sent.focus(); }
    });
    if (reset) {
      reset.addEventListener('click', function () {
        form.reset();
        form.classList.remove('was-validated');
        $$('input[data-type]', form).forEach(function (i) { i.type = 'text'; });
        if (sent) sent.hidden = true;
        form.hidden = false;
        var first = $('input, select', form);
        if (first) first.focus();
      });
    }
  });

  // Platzhalter-Links (z. B. WhatsApp ohne Nummer) springen nicht nach oben.
  $$('a[data-todo]').forEach(function (a) { a.addEventListener('click', function (ev) { ev.preventDefault(); }); });

  /* ---------------------------------------------------------------------------
     Cookie-Einwilligung (localStorage „taxiaktiv-consent“, wie im Design)
     ------------------------------------------------------------------------- */
  var KEY = 'taxiaktiv-consent';
  function readConsent() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY));
      if (c && typeof c === 'object') return { necessary: true, stats: c.stats === true, media: c.media === true };
    } catch (e) { /* kein Speicher verfügbar */ }
    return null;
  }
  var consent = readConsent();
  var draft = { stats: false, media: false };
  var bannerEl = $('[data-cookie-banner]');
  var modal = $('[data-cookie-modal]');
  var fab = $('[data-fab]');
  var lastFocus = null;

  function renderDraft() {
    $$('[data-consent-toggle]').forEach(function (t) {
      t.setAttribute('aria-checked', String(!!draft[t.getAttribute('data-consent-toggle')]));
    });
  }
  function renderConsentUi() {
    var modalOpen = modal && !modal.hidden;
    if (bannerEl) bannerEl.hidden = !!consent || modalOpen;
    if (fab) fab.hidden = !consent; // mobil-only per CSS
    renderMap();
  }
  function openCookies() {
    var c = consent || { stats: false, media: false };
    draft = { stats: c.stats, media: c.media };
    renderDraft();
    lastFocus = doc.activeElement;
    modal.hidden = false;
    renderConsentUi();
    var close = $('[data-close-cookies]', modal);
    if (close) close.focus();
  }
  function closeCookies() {
    modal.hidden = true;
    renderConsentUi();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function saveConsent(c) {
    consent = { necessary: true, stats: !!c.stats, media: !!c.media };
    try { localStorage.setItem(KEY, JSON.stringify(consent)); } catch (e) { /* ignorieren */ }
    draft = { stats: consent.stats, media: consent.media };
    if (modal && !modal.hidden) closeCookies(); else renderConsentUi();
  }

  if (modal) {
    $$('[data-open-cookies]').forEach(function (b) { b.addEventListener('click', openCookies); });
    $$('[data-close-cookies]').forEach(function (b) { b.addEventListener('click', closeCookies); });
    modal.addEventListener('click', function (ev) { if (ev.target === modal) closeCookies(); });
    doc.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && !modal.hidden) closeCookies(); });
    $$('[data-consent-toggle]').forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-consent-toggle');
        draft[k] = !draft[k];
        renderDraft();
      });
    });
    $$('[data-consent]').forEach(function (b) {
      b.addEventListener('click', function () {
        var mode = b.getAttribute('data-consent');
        if (mode === 'all') saveConsent({ stats: true, media: true });
        else if (mode === 'necessary') saveConsent({ stats: false, media: false });
        else saveConsent(draft);
      });
    });
  }

  /* ---------------------------------------------------------------------------
     Google Maps (Kontakt) – lädt erst nach Einwilligung „Externe Medien“
     ------------------------------------------------------------------------- */
  var mapBox = $('[data-map]');
  var MAP_SRC = 'https://www.google.com/maps?q=' + encodeURIComponent('Briloner Straße 34, 34508 Willingen (Upland)') + '&output=embed';
  function renderMap() {
    if (!mapBox) return;
    var frame = $('iframe', mapBox);
    var ph = $('[data-map-placeholder]', mapBox);
    var allowed = !!(consent && consent.media);
    if (allowed && !frame) {
      frame = el('iframe', null, {
        class: 'ta-map-frame',
        src: MAP_SRC,
        title: 'Karte: Taxi Aktiv Willingen, Briloner Straße 34',
        referrerpolicy: 'strict-origin-when-cross-origin',
        sandbox: 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox',
        allowfullscreen: '',
      });
      mapBox.appendChild(frame);
      if (ph) ph.hidden = true;
    } else if (!allowed && frame) {
      frame.remove();
      if (ph) ph.hidden = false;
    }
  }

  renderConsentUi();
})();

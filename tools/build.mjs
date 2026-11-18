// =============================================================================
// Taxi Aktiv Willingen – statischer Seitengenerator
// -----------------------------------------------------------------------------
// Erzeugt aus dieser einen Datei alle Seiten nach docs/ (GitHub-Pages-Ordner).
// Markup und Maße sind 1:1 aus dem Claude-Design „Taxi Aktiv Website.dc.html“
// übernommen (inline-Styles wie im Design). `style-hover="…"` wird beim Build
// – genau wie in der Design-Runtime – in eine :hover-Klasse mit !important
// umgewandelt.
//
//   node tools/build.mjs        → docs/*.html, docs/assets/site.css, site.js
// =============================================================================
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs');

// Vor dem Livegang auf true setzen (Impressum-Platzhalter vorher ausfüllen!).
const INDEXING = false;

const SITE = {
  name: 'Taxi Aktiv Willingen',
  phone: '05632 9988',
  tel: 'tel:+4956329988',
  mail: 'info@taxi-aktiv-willingen.de',
  web: 'www.taxi-aktiv-willingen.de',
  street: 'Briloner Straße 34',
  city: '34508 Willingen (Upland)',
};

// ---------------------------------------------------------------------------
// Icons (Lucide-Pfade, identisch zum Design)
// ---------------------------------------------------------------------------
const P = {
  phone: ['M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z'],
  calendarCheck: [{ r: [3, 4, 18, 18, 2] }, 'M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4'],
  calendar: [{ r: [3, 4, 18, 18, 2] }, 'M16 2v4M8 2v4M3 10h18'],
  car: ['M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2', { c: [7, 17, 2] }, 'M9 17h6', { c: [17, 17, 2] }],
  mapPin: ['M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z', { c: [12, 10, 3] }],
  clock: [{ c: [12, 12, 10] }, 'M12 6v6l4 2'],
  user: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', { c: [12, 7, 4] }],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', { c: [9, 7, 4] }, 'M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75'],
  mail: [{ r: [2, 4, 20, 16, 2] }, 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'],
  arrowRight: ['M5 12h14M12 5l7 7-7 7'],
  chevronDown: ['m6 9 6 6 6-6'], chevronUp: ['m18 15-6-6-6 6'],
  chevronLeft: ['m15 18-6-6 6-6'], chevronRight: ['m9 18 6-6-6-6'],
  headphones: ['M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3'],
  timer: ['M10 2h4M12 14l3-3', { c: [12, 14, 8] }],
  plane: ['M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z'],
  mountain: ['m8 3 4 8 5-5 5 15H2L8 3z', 'M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19'],
  pkg: ['M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73zM12 22V12M3.29 7 12 12l8.71-5M7.5 4.27l9 5.15'],
  medical: [{ r: [2, 6, 20, 14, 2] }, 'M12 10v6M9 13h6M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2'],
  check: ['M20 6 9 17l-5-5'],
  shield: ['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z', 'm9 12 2 2 4-4'],
  star: [{ p: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' }],
  send: ['M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z'],
  zap: ['M13 2 3 14h9l-1 8 10-12h-9l1-8z'],
  whatsapp: ['M7.9 20A9 9 0 1 0 4 16.1L2 22Z', 'M9 10c.5 2 2 3.5 4 4l1.2-1.2 2 .8-.4 1.6c-3.5.3-7-3.2-6.8-6.8l1.6-.4.8 2Z'],
  msgSquare: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
  globe: [{ c: [12, 12, 10] }, 'M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'],
  menu: ['M4 6h16M4 12h16M4 18h16'], x: ['M18 6 6 18M6 6l12 12'],
  instagram: [{ r: [2, 2, 20, 20, 5] }, 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01'],
  facebook: ['M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z'],
  youtube: ['M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17', 'm10 15 5-3-5-3z'],
};
function ic(spec) {
  const parts = spec.map((s) => typeof s === 'string' ? `<path d="${s}"></path>`
    : s.c ? `<circle cx="${s.c[0]}" cy="${s.c[1]}" r="${s.c[2]}"></circle>`
    : s.r ? `<rect x="${s.r[0]}" y="${s.r[1]}" width="${s.r[2]}" height="${s.r[3]}" rx="${s.r[4]}"></rect>`
    : `<polygon points="${s.p}" fill="currentColor" stroke="none"></polygon>`).join('');
  return `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="display:block" aria-hidden="true" focusable="false">${parts}</svg>`;
}
const I = Object.fromEntries(Object.entries(P).map(([k, v]) => [k, ic(v)]));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------------------------------------------------------------------------
// Daten (aus dem Design)
// ---------------------------------------------------------------------------
const PAGES = {
  home: { file: 'index.html', label: 'Home' },
  leistungen: { file: 'leistungen.html', label: 'Leistungen' },
  ueber: { file: 'ueber-uns.html', label: 'Über uns' },
  kontakt: { file: 'kontakt.html', label: 'Kontakt' },
  impressum: { file: 'impressum.html' },
  datenschutz: { file: 'datenschutz.html' },
};
const NAV = ['home', 'leistungen', 'ueber', 'kontakt'];
const href = (k) => PAGES[k].file;

const IMG = 'assets/img/';
const FLEET = {
  bus: { src: IMG + 'car-vwbus.webp', name: 'VW Bus Großraumtaxi', seats: 'bis 8 Personen' },
  e: { src: IMG + 'car-eklasse.webp', name: 'Mercedes E-Klasse', seats: 'bis 4 Personen' },
  v: { src: IMG + 'car-vklasse.webp', name: 'Mercedes V-Klasse', seats: 'bis 7 Personen' },
  q5: { src: IMG + 'car-q5.webp', name: 'Audi Q5', seats: 'bis 4 Personen' },
  p: { src: IMG + 'car-passat.webp', name: 'VW Passat Variant', seats: 'bis 4 Personen' },
  s: { src: IMG + 'car-sprinter.webp', name: 'Mercedes Sprinter', seats: 'bis 8 Personen' },
};
const FLEET_LIST = [FLEET.bus, FLEET.e, FLEET.v, FLEET.q5, FLEET.p, FLEET.s];

const SVC = {
  stadt: { t: 'Stadt- &amp; Regionalfahrten', alt: 'Stadt- & Regionalfahrten', icon: I.car, src: IMG + 'svc-stadt.webp', ph: 'Willingen Ortskern', short: 'Bequem in Willingen und der gesamten Umgebung.', long: 'Bequem in Willingen und der gesamten Region unterwegs – für kurze Strecken und längere Fahrten.' },
  flug: { t: 'Flughafentransfer', alt: 'Flughafentransfer', icon: I.plane, src: IMG + 'svc-flughafen.webp', ph: 'Flughafen', short: 'Entspannt und pünktlich zu allen Flughäfen der Region.', long: 'Entspannt und pünktlich zu allen Flughäfen der Region, z. B. Paderborn, Kassel, Dortmund oder Frankfurt.' },
  kranken: { t: 'Krankenfahrten', alt: 'Krankenfahrten', icon: I.medical, ph: 'Klinik', short: '', long: 'Sichere und hilfsbereite Fahrten zu Arztterminen, Behandlungen, Reha oder Klinikaufenthalten.' },
  gruppen: { t: 'Gruppenfahrten', alt: 'Gruppenfahrten', icon: I.users, src: IMG + 'svc-gruppen.webp', ph: 'Gruppe beim Ausflug', short: 'Platz für die ganze Gruppe – ideal für Ausflüge und Events.', long: 'Platz für die ganze Gruppe – ideal für Ausflüge, Vereinsfahrten, Events und gemeinsame Erlebnisse.' },
  kurier: { t: 'Kurierfahrten', alt: 'Kurierfahrten', icon: I.pkg, ph: 'Fahrer mit Paket', short: '', long: 'Schnelle und zuverlässige Zustellung von Dokumenten, Paketen und wichtigen Sendungen in der Region.' },
  ski: { t: 'Freizeit- &amp; Skishuttle', alt: 'Freizeit- & Skishuttle', icon: I.mountain, src: IMG + 'svc-ski.webp', ph: 'Skilift im Winter', short: 'Bequem zu Skigebiet, Bikepark und Freizeitattraktionen.', long: 'Bequem zu Skipisten, Bikeparks, Wanderzielen und Freizeitattraktionen rund um Willingen und im Sauerland.' },
};

const FEAT_A = [
  { icon: I.headphones, t: '24/7 erreichbar', s: 'Rund um die Uhr für Sie da.' },
  { icon: I.calendarCheck, t: 'Einfache Buchung', s: 'Schnell und unkompliziert.' },
  { icon: I.timer, t: 'Pünktlich', s: 'Zuverlässig zu Ihrem Termin.' },
  { icon: I.car, t: 'Komfortabel', s: 'Moderne, gepflegte Fahrzeuge.' },
];
const FEAT_B = [
  { icon: I.timer, t: 'Pünktlich', s: 'Zuverlässig zu Ihrem Termin.' },
  { icon: I.calendarCheck, t: 'Flexible Buchung', s: 'Telefonisch, online oder kurzfristig.' },
  { icon: I.car, t: 'Komfortabel', s: 'Moderne, gepflegte Fahrzeuge.' },
  { icon: I.mapPin, t: 'Ortskundig', s: 'Wir kennen Willingen und die Region wie unsere Westentasche.' },
];

// ---------------------------------------------------------------------------
// Bausteine
// ---------------------------------------------------------------------------
const SWOOSH = (w, h, c) => `<svg width="${w}" height="${h}" viewBox="0 0 58 22" aria-hidden="true"><path d="M2 20C14 6 34 2 56 3 38 6 22 12 12 20Z" fill="${c}"></path><path d="M14 20C24 12 40 8 56 8 42 11 32 15 26 20Z" fill="#FFD000"></path></svg>`;

function logo({ mobile = false, color = '#151515' } = {}) {
  const [w, h, fs, gap, pl] = mobile ? [42, 16, 22, 6, 48] : [53, 20, 28, 8, 61];
  return `<div style="display:flex;align-items:center;gap:${gap}px">${SWOOSH(w, h, color)}<span style="font:italic 800 ${fs}px/1 Poppins,sans-serif;letter-spacing:-.02em;white-space:nowrap;color:${color}">Taxi <span style="color:#FFC400">Aktiv</span></span></div><div style="font:700 8px/1 Poppins,sans-serif;letter-spacing:.6em;padding-left:${pl}px;color:${color}">WILLINGEN</div>`;
}

const SLOT_ICON = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><path d="m21 15-5-5L5 21"></path></svg>';
// Leerer Bild-Platzhalter – sieht aus wie <image-slot> im Design.
function slot(caption, radius = 0) {
  const r = radius ? `border-radius:${radius}px` : '';
  return `<div class="ta-slot" role="img" aria-label="Bildplatzhalter: ${esc(caption)}" style="${r}"><div class="ta-slot-empty">${SLOT_ICON}<div class="ta-slot-cap">${caption}</div></div><div class="ta-slot-ring" style="${r}"></div></div>`;
}

const EASE = 'cubic-bezier(.22,.8,.25,1)';
function carStage(car) {
  const lines = [['70%', '#151515', '.15s'], ['100%', '#FFD000', '.25s'], ['55%', '#151515', '.35s']]
    .map(([w, c, d]) => `<span style="display:block;height:4px;width:${w};border-radius:4px;background:${c};transform-origin:left;animation:taSpeedR .9s ${d} ease-out both"></span>`).join('');
  return `<div style="position:absolute;inset:0">`
    + `<div style="position:absolute;left:10%;right:10%;bottom:2%;height:11%;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.32),transparent);animation:taShadowIn 1.5s ${EASE} both"></div>`
    + `<div style="position:absolute;inset:-4% -2% 0;transform-origin:30% 85%;animation:taArrive 1.5s ${EASE} both"><div style="width:100%;height:100%;animation:taRumble .12s linear 0s 9"><img src="${car.src}" alt="${esc(car.name)}" fetchpriority="high" style="width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 18px 22px rgba(0,0,0,.18))"></div></div>`
    + `<div aria-hidden="true" style="position:absolute;right:-6%;top:30%;width:32%;display:flex;flex-direction:column;gap:14px;pointer-events:none">${lines}</div>`
    + `</div>`;
}

// Kicker „LABEL ——“ wie im Design
const kicker = (text, { size = 12, ls = '.32em', line = 36, color = '#FFD000', weight = 600, extra = '' } = {}) =>
  `<div style="display:flex;align-items:center;gap:14px;font:${weight} ${size}px Poppins,sans-serif;letter-spacing:${ls}${extra}">${text}<span style="width:${line}px;height:2px;background:${color}"></span></div>`;
const kickerCenter = (text) =>
  `<div style="display:flex;align-items:center;justify-content:center;gap:18px;font:600 12px Poppins,sans-serif;letter-spacing:.32em"><span style="width:40px;height:2px;background:#FFD000"></span>${text}<span style="width:40px;height:2px;background:#FFD000"></span></div>`;

const btnDark = (to, label, icon = I.arrowRight) =>
  `<a href="${href(to)}" style="display:flex;align-items:center;gap:12px;height:52px;padding:0 26px;border:0;border-radius:999px;background:#151515;color:#fff;font:600 16px Poppins,sans-serif;cursor:pointer;text-decoration:none" style-hover="background:#000">${label} <span style="font-size:18px">${icon}</span></a>`;

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
function header(page) {
  const mItems = NAV.map((k) => `<a href="${href(k)}"${k === page ? ' aria-current="page"' : ''} style="display:flex;justify-content:space-between;align-items:center;padding:14px 4px;border-bottom:1px solid #f0f0f0;font:600 17px Poppins,sans-serif;cursor:pointer;color:inherit;text-decoration:none">${PAGES[k].label}${k === page ? '<span style="width:10px;height:10px;border-radius:50%;background:#FFD000"></span>' : ''}</a>`).join('\n');
  const dItems = NAV.map((k) => `<a href="${href(k)}"${k === page ? ' aria-current="page"' : ''} data-nav-item="${k}" style="position:relative;cursor:pointer;font:500 14px 'DM Sans',sans-serif;padding:6px 0;white-space:nowrap;color:inherit;text-decoration:none" style-hover="color:#000">${PAGES[k].label}</a>`).join('\n');
  return `
<!-- HEADER (mobil) -->
<div class="only-m" style="position:sticky;top:0;z-index:30;background:#fff;box-shadow:0 1px 0 #eee">
<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 18px;gap:12px">
<a href="index.html" aria-label="Taxi Aktiv Willingen – Startseite" style="cursor:pointer;display:flex;flex-direction:column;gap:3px;flex:none;color:inherit;text-decoration:none">${logo({ mobile: true })}</a>
<div style="display:flex;gap:8px">
<a href="${SITE.tel}" aria-label="Anrufen: ${SITE.phone}" style="width:44px;height:44px;border-radius:50%;background:#FFD000;color:#151515;display:grid;place-items:center;font-size:19px;animation:taPulse 2.2s infinite">${I.phone}</a>
<button type="button" data-menu-toggle aria-expanded="false" aria-controls="ta-mmenu" aria-label="Menü öffnen" style="width:44px;height:44px;border-radius:50%;border:2px solid #151515;background:#fff;display:grid;place-items:center;font-size:20px;cursor:pointer;color:#151515"><span data-icon-menu>${I.menu}</span><span data-icon-close hidden>${I.x}</span></button>
</div>
</div>
<nav id="ta-mmenu" aria-label="Hauptnavigation (mobil)" hidden style="display:flex;flex-direction:column;gap:4px;padding:8px 18px 20px;border-top:1px solid #eee">
${mItems}
<a href="kontakt.html" style="margin-top:12px;display:flex;align-items:center;justify-content:center;gap:10px;height:52px;border:0;border-radius:999px;background:#151515;color:#fff;font:600 16px Poppins,sans-serif;cursor:pointer;text-decoration:none"><span style="font-size:18px">${I.calendarCheck}</span>Taxi buchen</a>
</nav>
</div>

<!-- HEADER (Desktop) -->
<div class="ta-bar only-d" data-bar>
<header style="max-width:1240px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;gap:clamp(14px,2.2cqw,28px)">
<div class="ta-pill"><a href="index.html" aria-label="Taxi Aktiv Willingen – Startseite" style="cursor:pointer;display:flex;flex-direction:column;gap:3px;flex:none;color:inherit;text-decoration:none">${logo()}</a></div>
<div style="width:1px;height:22px;background:#cfcfcf"></div>
<div style="flex:1;display:flex"><nav class="ta-nav" data-navbar aria-label="Hauptnavigation">
${dItems}
<span class="ta-nav-ind" data-nav-ind></span>
</nav></div>
<a class="only-wide" href="${SITE.tel}" style="display:flex;align-items:center;gap:8px;height:42px;padding:0 18px;border-radius:999px;background:#fff;color:#151515;text-decoration:none;font:700 15px Poppins,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.08);white-space:nowrap;flex:none"><span style="font-size:15px">${I.phone}</span>${SITE.phone}</a>
<a href="kontakt.html" style="display:flex;align-items:center;gap:9px;height:42px;padding:0 20px;border:2px solid #151515;border-radius:999px;background:#151515;color:#fff;font:600 15px Poppins,sans-serif;cursor:pointer;white-space:nowrap;flex:none;animation:taBeat 1.8s ease-in-out infinite, taRing 1.8s ease-out infinite;text-decoration:none" style-hover="background:#000"><span style="font-size:16px;color:#FFD000">${I.calendarCheck}</span>Taxi buchen</a>
</header>
</div>`;
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
const HERO_BG = `
<div class="only-d" aria-hidden="true" style="position:absolute;inset:0">
<svg viewBox="0 0 1000 520" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;display:block"><defs><linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE45A"></stop><stop offset="1" stop-color="#FFCC00"></stop></linearGradient></defs><path d="M520 0H1000V478C820 512 640 455 450 492 300 520 150 488 0 515V360C140 420 320 380 410 270 480 180 450 70 520 0Z" fill="url(#hg)"></path><path d="M0 0H300C210 40 120 30 60 90 30 120 10 160 0 190Z" fill="#f6f6f4"></path></svg>
<div style="position:absolute;left:-130px;top:-130px;width:210px;height:210px;border-radius:50%;background:#FFD000;animation:taFloatS 9s ease-in-out infinite"></div>
<div style="position:absolute;left:68px;top:142px;width:42px;height:42px;border-radius:50%;background:#FFD000;animation:taFloatB 7s ease-in-out infinite"></div>
<div style="position:absolute;left:44%;top:56%;width:22px;height:22px;border-radius:50%;background:#FFD000;animation:taFloatC 5s ease-in-out infinite"></div>
<div style="position:absolute;right:7%;top:58%;width:84px;height:84px;border-radius:50%;background:rgba(255,255,255,.32);animation:taFloatA 9s ease-in-out -3s infinite"></div>
<div style="position:absolute;right:30%;top:16%;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.45);animation:taFloatB 8s ease-in-out -2s infinite"></div>
<div style="position:absolute;right:3%;top:22%;width:14px;height:14px;border-radius:50%;background:#151515;opacity:.85;animation:taFloatC 6s ease-in-out -1s infinite"></div>
</div>
<div class="only-m" aria-hidden="true" style="position:absolute;inset:0;background:linear-gradient(160deg,#FFE45A,#FFCC00);border-radius:0 0 40px 40px;overflow:hidden"><div style="position:absolute;right:-40px;top:-40px;width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,.3);animation:taFloatA 10s ease-in-out infinite"></div><div style="position:absolute;left:8%;top:48%;width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.5);animation:taFloatB 7s ease-in-out infinite"></div><div style="position:absolute;right:12%;bottom:14%;width:16px;height:16px;border-radius:50%;background:#151515;animation:taFloatC 5s ease-in-out infinite"></div></div>`;

const HERO_GRID = 'position:relative;z-index:2;max-width:1240px;margin:0 auto;padding:36px 24px 96px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr));gap:32px;align-items:center';
const KICKER_HERO = '<div style="font:600 13px Poppins,sans-serif;letter-spacing:.42em">TAXI AKTIV – WILLINGEN</div>';
const heroField = (icon, attrs, size = 18) =>
  `<label class="ta-field" style="display:flex;align-items:center;gap:12px;height:48px;padding:0 14px;background:#fff;border-radius:8px"><span style="font-size:${size}px">${icon}</span><input ${attrs} style="flex:1;min-width:0;border:0;outline:0;font:500 14px 'DM Sans',sans-serif"></label>`;

function heroHome() {
  const car = FLEET_LIST[0];
  const fleetJson = esc(JSON.stringify(FLEET_LIST));
  return `
<div style="${HERO_GRID}">
<div style="display:flex;flex-direction:column;gap:18px">
<div data-car-stage data-fleet="${fleetJson}" style="position:relative;width:100%;aspect-ratio:16/11">${carStage(car)}</div>
<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
<button type="button" data-slide="-1" aria-label="Vorheriges Fahrzeug" style="width:44px;height:44px;border-radius:50%;border:0;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.1);display:grid;place-items:center;font-size:18px;cursor:pointer;color:#151515">${I.chevronLeft}</button>
<div style="font:700 20px Poppins,sans-serif" aria-live="polite"><span data-slide-num>1</span><span style="font-weight:500;color:#555">/6</span></div>
<button type="button" data-slide="1" aria-label="Nächstes Fahrzeug" style="width:44px;height:44px;border-radius:50%;border:0;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.1);display:grid;place-items:center;font-size:18px;cursor:pointer;color:#151515">${I.chevronRight}</button>
<div style="width:1px;height:30px;background:rgba(0,0,0,.2);margin:0 10px"></div>
<div style="display:flex;flex-direction:column;gap:2px;font:600 13px/1.25 'DM Sans',sans-serif"><span data-car-name style="font:700 14px Poppins,sans-serif">${car.name}</span><span data-car-seats style="color:#555">${car.seats}</span></div>
</div>
</div>
<div style="display:flex;flex-direction:column;gap:14px;animation:taFadeUp .9s .35s both">
${KICKER_HERO}
<h1 style="margin:0;font:800 clamp(34px,4.8cqw,58px)/1.02 Poppins,sans-serif;letter-spacing:-.01em;text-wrap:balance"><span style="font-weight:500">IMMER DA, WENN SIE</span><br>EIN TAXI BRAUCHEN</h1>
<p style="margin:0;font:400 17px/1.5 'DM Sans',sans-serif;max-width:520px;text-wrap:pretty">Ihr zuverlässiger Taxipartner in Willingen und im Sauerland – komfortabel, sicher und pünktlich ans Ziel.</p>
<form data-form="home" method="post" action="#" aria-label="Fahrt anfragen" style="margin-top:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:12px">
<div style="grid-column:1/-1;font:700 19px Poppins,sans-serif">FAHRT ANFRAGEN</div>
<label class="ta-field" style="grid-column:1/-1;display:flex;align-items:center;gap:12px;height:48px;padding:0 14px;background:#fff;border-radius:8px"><span style="font-size:19px">${I.car}</span><select name="fahrzeug" aria-label="Fahrzeug wählen" style="flex:1;border:0;outline:0;background:transparent;font:500 14px 'DM Sans',sans-serif;color:#151515;height:100%;cursor:pointer"><option value="">Fahrzeug wählen</option><option>Taxi – bis 4 Personen</option><option>Großraumtaxi – bis 8 Personen</option><option>Kleinbus – bis 16 Personen</option></select></label>
${heroField(I.mapPin, 'name="abholort" placeholder="Abholort" aria-label="Abholort" required maxlength="160" autocomplete="street-address"')}
${heroField(I.mapPin, 'name="zielort" placeholder="Zielort" aria-label="Zielort" required maxlength="160"')}
${heroField(I.calendar, 'name="datum" placeholder="Datum" aria-label="Datum" data-type="date" maxlength="20"')}
${heroField(I.clock, 'name="uhrzeit" placeholder="Uhrzeit" aria-label="Uhrzeit" data-type="time" maxlength="10"')}
${heroField(I.user, 'name="name" placeholder="Name" aria-label="Name" required maxlength="100" autocomplete="name"')}
${heroField(I.phone, 'name="telefon" type="tel" placeholder="Telefon" aria-label="Telefon" required maxlength="40" autocomplete="tel"')}
<button type="submit" style="grid-column:1/-1;margin-top:6px;height:54px;border:0;border-radius:10px;background:#151515;color:#fff;font:700 16px Poppins,sans-serif;letter-spacing:.04em;display:flex;align-items:center;justify-content:center;gap:12px;cursor:pointer" style-hover="background:#000">JETZT ANFRAGEN <span style="font-size:18px">${I.arrowRight}</span></button>
</form>
<div data-sent="home" hidden role="status" style="margin-top:14px;background:#fff;border-radius:14px;padding:24px;display:flex;gap:16px;align-items:flex-start;box-shadow:0 8px 28px rgba(0,0,0,.08)">
<div style="width:48px;height:48px;flex:none;border-radius:50%;background:#151515;color:#FFD000;display:grid;place-items:center;font-size:22px">${I.check}</div>
<div><div style="font:700 19px Poppins,sans-serif">Anfrage gesendet</div><p style="margin:6px 0 12px;font:15px/1.5 'DM Sans',sans-serif;color:#3d3d3d">Vielen Dank! Wir melden uns in wenigen Minuten telefonisch bei Ihnen.</p><button type="button" data-reset="home" style="border:0;background:none;padding:0;font:600 14px 'DM Sans',sans-serif;text-decoration:underline;cursor:pointer;color:#151515">Neue Anfrage</button></div>
</div>
</div>
</div>`;
}

function heroLeistungen() {
  return `
<div style="${HERO_GRID}">
<div data-car-stage style="position:relative;width:100%;aspect-ratio:16/10">${carStage(FLEET.v)}</div>
<div style="display:flex;flex-direction:column;gap:16px;animation:taFadeUp .9s .35s both">
${KICKER_HERO}
<h1 style="margin:0;font:800 clamp(36px,5.4cqw,66px)/1 Poppins,sans-serif">UNSERE<br>LEISTUNGEN</h1>
<p style="margin:0;font:400 17px/1.5 'DM Sans',sans-serif;max-width:520px;text-wrap:pretty">Vielfältige Mobilitätslösungen für Willingen, das Sauerland und darüber hinaus – zuverlässig, komfortabel und exakt auf Ihre Bedürfnisse abgestimmt.</p>
<div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:6px">
${btnDark('kontakt', 'Jetzt Fahrt anfragen')}
<a href="#angebote" data-scroll-to="angebote" style="display:flex;align-items:center;height:52px;padding:0 26px;border:2px solid #151515;border-radius:999px;background:transparent;color:#151515;font:600 16px Poppins,sans-serif;cursor:pointer;text-decoration:none" style-hover="background:#151515;color:#fff">Alle Leistungen im Überblick</a>
</div>
</div>
</div>`;
}

function heroUeber() {
  return `
<div style="${HERO_GRID}">
<div data-car-stage style="position:relative;width:100%;aspect-ratio:16/10">${carStage(FLEET.q5)}</div>
<div style="display:flex;flex-direction:column;gap:16px;animation:taFadeUp .9s .35s both">
<div style="display:flex;align-items:center;gap:14px;font:600 13px Poppins,sans-serif;letter-spacing:.42em">ÜBER UNS<span style="width:40px;height:2px;background:#151515"></span></div>
<h1 style="margin:0;font:800 clamp(36px,5cqw,62px)/1.05 Poppins,sans-serif">Über Taxi Aktiv</h1>
<p style="margin:0;font:400 17px/1.5 'DM Sans',sans-serif;max-width:540px;text-wrap:pretty">Ihr lokaler und zuverlässiger Taxi-Service in Willingen und im gesamten Sauerland. Wir bringen Menschen bequem, sicher und pünktlich ans Ziel – mit Erfahrung, Regionalität und persönlichem Service.</p>
<div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:6px">
${btnDark('kontakt', 'Taxi buchen')}
<a href="kontakt.html" style="display:flex;align-items:center;gap:10px;height:52px;padding:0 26px;border:2px solid #151515;border-radius:999px;background:transparent;color:#151515;font:600 16px Poppins,sans-serif;cursor:pointer;text-decoration:none" style-hover="background:#151515;color:#fff"><span style="font-size:17px">${I.phone}</span>Kontakt aufnehmen</a>
</div>
</div>
</div>`;
}

function heroKontakt() {
  const tile = (icon, text) => `<div style="background:#FFD70F;display:flex;flex-direction:column;align-items:center;gap:8px;padding:8px;text-align:center;font:700 14px/1.2 Poppins,sans-serif"><span style="font-size:28px">${icon}</span>${text}</div>`;
  return `
<div style="${HERO_GRID}">
<div data-car-stage style="position:relative;width:100%;aspect-ratio:16/10">${carStage(FLEET.e)}</div>
<div style="display:flex;flex-direction:column;gap:16px;animation:taFadeUp .9s .35s both">
${KICKER_HERO}
<h1 style="margin:0;font:800 clamp(34px,4.8cqw,60px)/1.02 Poppins,sans-serif">KONTAKT &amp;<br>FAHRTANFRAGE</h1>
<p style="margin:0;font:400 17px/1.5 'DM Sans',sans-serif;max-width:540px;text-wrap:pretty">Sie möchten eine Fahrt buchen, haben eine Frage oder benötigen ein individuelles Angebot? Kontaktieren Sie uns – wir sind gerne für Sie da!</p>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:1px;background:rgba(0,0,0,.18);margin-top:10px">
${tile(I.clock, '24/7<br>erreichbar')}
${tile(I.calendarCheck, 'Einfache<br>Anfrage')}
${tile(I.zap, 'Schnelle<br>Rückmeldung')}
${tile(I.car, 'Zuverlässiger<br>Service')}
</div>
</div>
</div>`;
}

function heroLegal(page) {
  const h1 = page === 'impressum'
    ? '<h1 style="margin:0;font:800 clamp(36px,5cqw,62px)/1.02 Poppins,sans-serif">IMPRESSUM</h1>'
    : '<h1 style="margin:0;font:800 clamp(32px,4.6cqw,58px)/1.02 Poppins,sans-serif">DATENSCHUTZ&shy;ERKLÄRUNG</h1>';
  return `
<div style="position:relative;z-index:2;max-width:1240px;margin:0 auto;padding:40px 24px 110px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr));gap:32px;align-items:center">
<div></div>
<div style="display:flex;flex-direction:column;gap:14px;animation:taFadeUp .9s .2s both">
<div style="display:flex;align-items:center;gap:14px;font:600 13px Poppins,sans-serif;letter-spacing:.42em">RECHTLICHES<span style="width:40px;height:2px;background:#151515"></span></div>
${h1}
<p style="margin:0;font:400 17px/1.5 'DM Sans',sans-serif;max-width:520px">Taxi Aktiv Willingen · Briloner Straße 34 · 34508 Willingen (Upland)</p>
</div>
</div>`;
}

function featureStrip(list) {
  return `
<!-- FEATURE STRIP -->
<div style="position:relative;z-index:3;max-width:1240px;margin:-40px auto 0;padding:0 24px">
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:1px;background:#e9e9e9;border-radius:16px;overflow:hidden;box-shadow:0 10px 36px rgba(0,0,0,.08)">
${list.map((f) => `<div style="background:#fff;display:flex;align-items:center;gap:16px;padding:22px 24px"><span style="font-size:34px;flex:none">${f.icon}</span><div><div style="font:700 15px Poppins,sans-serif">${f.t}</div><div style="font:13px/1.35 'DM Sans',sans-serif;color:#555;margin-top:2px">${f.s}</div></div></div>`).join('\n')}
</div>
</div>`;
}

// ---------------------------------------------------------------------------
// Seiteninhalte
// ---------------------------------------------------------------------------
function contentHome() {
  const cards = [SVC.stadt, SVC.flug, SVC.ski, SVC.gruppen].map((s) => `
<a data-reveal href="leistungen.html" style="display:block;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,.08);cursor:pointer;transition:transform .2s;color:inherit;text-decoration:none" style-hover="transform:translateY(-4px)">
<div style="position:relative;aspect-ratio:2.5/1"><img src="${s.src}" alt="${esc(s.alt)}" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block"></div>
<div style="display:flex;gap:14px;padding:16px 16px 20px">
<div style="width:44px;height:44px;flex:none;border-radius:10px;background:#FFD000;display:grid;place-items:center;font-size:21px">${s.icon}</div>
<div><h3 style="margin:0;font:700 15px/1.25 Poppins,sans-serif">${s.t}</h3><div style="font:13px/1.4 'DM Sans',sans-serif;color:#3d3d3d;margin-top:4px">${s.short}</div></div>
</div>
</a>`).join('');
  return `
<section data-reveal style="max-width:1240px;margin:0 auto;padding:72px 24px 40px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:48px;align-items:center">
<div>
<div style="font:600 12px Poppins,sans-serif;letter-spacing:.32em">ÜBER TAXI AKTIV</div>
<div style="width:40px;height:3px;background:#FFD000;margin:12px 0 20px"></div>
<h2 style="margin:0 0 16px;font:700 clamp(28px,3.2cqw,38px)/1.15 Poppins,sans-serif">Ihr Taxi in Willingen<br>und im Sauerland</h2>
<p style="margin:0 0 26px;font:15px/1.65 'DM Sans',sans-serif;color:#2f2f2f;max-width:540px;text-wrap:pretty"><strong>Taxi Aktiv</strong> ist Ihr lokaler Mobilitätspartner in Willingen. Ob kurze Fahrten im Ort, Transfers in die Region, zum Bahnhof oder Flughafen – wir bringen Sie bequem, sicher und zuverlässig ans Ziel. Freundlicher Service, moderne Fahrzeuge und echte Ortskenntnis zeichnen uns aus.</p>
<a href="ueber-uns.html" style="display:inline-flex;align-items:center;gap:12px;height:48px;padding:0 24px;border:0;border-radius:999px;background:#FFD000;color:#151515;font:600 15px Poppins,sans-serif;cursor:pointer;text-decoration:none" style-hover="background:#F5C400">Mehr über uns <span style="font-size:17px">${I.arrowRight}</span></a>
</div>
<div style="position:relative">
<div style="position:absolute;left:-14px;top:-14px;width:90px;height:90px;border-radius:50%;background:#FFD000;animation:taFloatB 9s ease-in-out infinite"></div>
<div style="position:absolute;right:30px;bottom:-26px;width:150px;height:60px;border-radius:0 0 90px 90px;background:#FFE45A"></div>
<div style="position:relative;aspect-ratio:2/1.05;display:flex;align-items:center"><img src="${IMG}van-willingen.webp" alt="Taxi Aktiv Großraumtaxi mit Willingen-Beschriftung" loading="lazy" decoding="async" width="1235" height="529" style="position:relative;width:100%;height:auto;display:block;filter:drop-shadow(0 16px 20px rgba(0,0,0,.12))"></div>
</div>
</section>
<section data-reveal style="max-width:1240px;margin:0 auto;padding:48px 24px 80px">
${kickerCenter('UNSERE LEISTUNGEN')}
<h2 style="margin:12px 0 10px;text-align:center;font:800 clamp(26px,3.4cqw,40px)/1.15 Poppins,sans-serif;text-wrap:balance">VIELSEITIG, ZUVERLÄSSIG, REGIONAL</h2>
<p style="margin:0 auto 36px;text-align:center;font:15px/1.5 'DM Sans',sans-serif;color:#3d3d3d;max-width:640px">Ob Alltag, Reise oder besonderer Anlass – Taxi Aktiv bringt Sie flexibel und bequem ans Ziel.</p>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:20px">${cards}
</div>
</section>`;
}

function contentLeistungen() {
  const cards = [SVC.stadt, SVC.flug, SVC.kranken, SVC.gruppen, SVC.kurier, SVC.ski].map((s) => `
<div data-reveal style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,.08)">
<div style="position:relative;aspect-ratio:3/1">${s.src ? `<img src="${s.src}" alt="${esc(s.alt)}" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block">` : slot(s.ph)}</div>
<div style="display:flex;gap:18px;padding:18px 20px 22px">
<div style="width:48px;height:48px;flex:none;border-radius:12px;background:#FFD000;display:grid;place-items:center;font-size:23px">${s.icon}</div>
<div><h3 style="margin:0;font:700 18px/1.25 Poppins,sans-serif">${s.t}</h3><div style="font:14px/1.5 'DM Sans',sans-serif;color:#3d3d3d;margin-top:6px;text-wrap:pretty">${s.long}</div></div>
</div>
</div>`).join('');
  const step = (icon, t, s) => `<div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px"><div style="width:56px;height:56px;border-radius:12px;background:#FFD000;display:grid;place-items:center;font-size:26px">${icon}</div><div style="font:700 15px Poppins,sans-serif">${t}</div><div style="font:13px/1.4 'DM Sans',sans-serif;color:#3d3d3d">${s}</div></div>`;
  const faq = [
    ['Welche Flughäfen fahren Sie an?', 'Wir fahren regelmäßig Paderborn/Lippstadt, Kassel, Dortmund, Düsseldorf und Frankfurt an – auf Wunsch auch weitere Ziele.'],
    ['Übernehmen Sie auch Krankenfahrten?', 'Ja. Wir fahren Sie zu Arztterminen, Behandlungen, Reha und Klinikaufenthalten. Sprechen Sie uns zur Abrechnung mit Ihrer Krankenkasse an.'],
    ['Kann ich auch eine Gruppenfahrt buchen?', 'Gerne. Mit Großraumtaxi und Kleinbus befördern wir Gruppen bis 16 Personen inklusive Gepäck.'],
  ].map(([q, a], i) => `
<div data-faq style="background:#fff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.05)">
<button type="button" data-faq-toggle aria-expanded="${i === 0}" aria-controls="faq-${i}" style="width:100%;border:0;background:none;text-align:left;color:inherit;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 16px;cursor:pointer;font:600 14px 'DM Sans',sans-serif">${q}<span style="font-size:18px;flex:none"><span data-chev-down${i === 0 ? ' hidden' : ''}>${I.chevronDown}</span><span data-chev-up${i === 0 ? '' : ' hidden'}>${I.chevronUp}</span></span></button>
<div id="faq-${i}" data-faq-answer${i === 0 ? '' : ' hidden'} style="padding:0 16px 14px;font:14px/1.5 'DM Sans',sans-serif;color:#3d3d3d">${a}</div>
</div>`).join('');
  return `
<section id="angebote" data-reveal style="max-width:1240px;margin:0 auto;padding:64px 24px 40px;scroll-margin-top:20px">
<div style="font:600 12px Poppins,sans-serif;letter-spacing:.32em">UNSERE ANGEBOTE</div>
<h2 style="margin:12px 0 10px;font:700 clamp(26px,3.2cqw,38px)/1.15 Poppins,sans-serif">Unsere Taxi-Leistungen im Überblick</h2>
<p style="margin:0 0 32px;font:15px/1.5 'DM Sans',sans-serif;color:#3d3d3d">Ob im Alltag, auf Reisen oder in der Freizeit – wir bringen Sie sicher, bequem und zuverlässig an Ihr Ziel.</p>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:22px">${cards}
</div>
</section>
<section data-reveal style="max-width:1240px;margin:0 auto;padding:24px 24px 80px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr));gap:24px;align-items:start">
<div style="background:#f6f6f4;border-radius:18px;padding:30px 32px">
${kicker('SO EINFACH GEHT\'S')}
<h3 style="margin:10px 0 26px;font:700 24px/1.2 Poppins,sans-serif">In 3 Schritten zu Ihrer Fahrt</h3>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:18px">
${step(I.calendarCheck, '1. Anfrage stellen', 'Termin, Strecke und Wünsche angeben.')}
${step(I.car, '2. Bestätigung erhalten', 'Wir melden uns schnell mit allen Details.')}
${step(I.check, '3. Entspannt fahren', 'Pünktlich einsteigen und komfortabel ankommen.')}
</div>
</div>
<div style="background:#f6f6f4;border-radius:18px;padding:30px 32px">
${kicker('FAQ')}
<h3 style="margin:10px 0 20px;font:700 24px/1.2 Poppins,sans-serif">Häufige Fragen zu unseren Leistungen</h3>
<div style="display:flex;flex-direction:column;gap:10px">${faq}
</div>
<a href="kontakt.html" style="margin-top:18px;display:inline-flex;align-items:center;gap:10px;font:600 14px 'DM Sans',sans-serif;cursor:pointer;border-bottom:2px solid #FFD000;padding-bottom:2px;color:inherit;text-decoration:none">Weitere Fragen &amp; Antworten <span style="font-size:16px">${I.arrowRight}</span></a>
</div>
</section>`;
}

function contentUeber() {
  const werte = [
    ['Kundennähe:', 'Persönlicher Service und ein offenes Ohr für Ihre Wünsche.'],
    ['Verlässlichkeit:', 'Pünktliche Abholung, faire Preise und gelebte Servicequalität.'],
    ['Regionalität:', 'Tief in Willingen und dem Sauerland verwurzelt.'],
    ['Sicherheit:', 'Moderner Fuhrpark und erfahrene, geschulte Fahrer.'],
  ].map(([t, s]) => `<div style="display:flex;gap:14px;font:14px/1.45 'DM Sans',sans-serif"><span style="font-size:20px;color:#E8B800;flex:none">${I.check}</span><div><strong>${t}</strong> ${s}</div></div>`).join('\n');
  const valueCards = [
    [I.shield, 'Zuverlässig', 'Pünktlich, planbar und immer erreichbar.'],
    [I.users, 'Freundlich', 'Ein motiviertes Team, das gerne für Sie da ist.'],
    [I.mapPin, 'Regional', 'Verwurzelt in Willingen und dem Sauerland.'],
    [I.shield, 'Sicher', 'Moderne Fahrzeuge und erfahrene Fahrer.'],
  ].map(([icon, t, s]) => `
<div data-reveal style="background:#fff;border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.08);padding:20px;display:flex;gap:16px;align-items:center">
<div style="width:52px;height:52px;flex:none;border-radius:50%;background:#FFD000;display:grid;place-items:center;font-size:24px">${icon}</div>
<div><div style="font:700 16px Poppins,sans-serif">${t}</div><div style="font:13px/1.4 'DM Sans',sans-serif;color:#3d3d3d;margin-top:3px">${s}</div></div>
</div>`).join('');
  const fleet = Object.values(FLEET).map((v) => `
<div data-reveal style="background:#fff;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.1);padding:12px 14px 14px;display:flex;flex-direction:column;gap:8px">
<div style="aspect-ratio:16/9;display:flex;align-items:center;justify-content:center"><img src="${v.src}" alt="${esc(v.name)}" width="${v.src.includes('vwbus') ? 1214 : 1200}" height="${v.src.includes('vwbus') ? 716 : 900}" loading="lazy" decoding="async" style="width:100%;height:auto;max-width:100%;max-height:100%;object-fit:contain"></div>
<div style="font:700 14px Poppins,sans-serif">${v.name}</div>
<div style="display:flex;align-items:center;gap:6px;font:12px 'DM Sans',sans-serif;color:#555"><span style="font-size:14px">${I.users}</span>${v.seats}</div>
</div>`).join('');
  const reviews = [
    ['„Zuverlässig, pünktlich und sehr freundlich – unser Stammtaxi in Willingen!“', 'Sabine M.'],
    ['„Top Service! Sowohl der Flughafentransfer als auch die Fahrten im Sauerland laufen immer reibungslos.“', 'Thomas K.'],
    ['„Ein super Team und moderne, saubere Fahrzeuge. Man fühlt sich einfach gut aufgehoben.“', 'Andreas L.'],
  ].map(([q, n]) => `
<figure data-reveal style="margin:0;background:#fff;border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.08);padding:22px 24px;display:flex;gap:16px">
<div aria-hidden="true" style="font:800 46px/0.8 Poppins,sans-serif;color:#FFD000">“</div>
<div style="display:flex;flex-direction:column;gap:10px">
<blockquote style="margin:0;font:500 14px/1.5 'DM Sans',sans-serif">${q}</blockquote>
<div role="img" aria-label="5 von 5 Sternen" style="display:flex;gap:3px;color:#FFC400;font-size:15px">${I.star.repeat(5)}</div>
<figcaption style="display:flex;align-items:center;gap:8px;font:700 13px 'DM Sans',sans-serif"><span style="font-size:15px">${I.user}</span>${n}</figcaption>
</div>
</figure>`).join('');
  return `
<section data-reveal style="max-width:1240px;margin:0 auto;padding:64px 24px 40px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:40px;align-items:center">
<div>
${kicker('UNSERE GESCHICHTE')}
<h2 style="margin:12px 0 14px;font:700 clamp(26px,2.8cqw,34px)/1.15 Poppins,sans-serif">Von Willingen für das Sauerland</h2>
<p style="margin:0;font:14px/1.6 'DM Sans',sans-serif;color:#2f2f2f;text-wrap:pretty">Taxi Aktiv ist aus der Region für die Region entstanden. Seit vielen Jahren sind wir in Willingen fest verwurzelt und haben uns als zuverlässiger Mobilitätspartner für Einheimische, Urlauber und Unternehmen etabliert. Was als kleiner Taxi-Betrieb begann, ist heute ein moderner, kundenorientierter Service mit einem starken Team, moderner Fahrzeugflotte und einem klaren Ziel: Ihre Mobilität im Sauerland – zuverlässig, flexibel und immer persönlich.</p>
</div>
<div>
${kicker('UNSERE WERTE')}
<div style="display:flex;flex-direction:column;gap:16px;margin-top:20px">
${werte}
</div>
</div>
<div style="position:relative">
<div style="position:absolute;left:-12px;top:-14px;width:80px;height:80px;border-radius:50%;background:#FFE45A;animation:taFloatB 9s ease-in-out infinite"></div>
<div style="position:absolute;right:-12px;bottom:-16px;width:110px;height:56px;border-radius:0 0 70px 70px;background:#FFD000"></div>
<div style="position:relative;aspect-ratio:1.85/1;border-radius:18px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,.12)">${slot('Willingen – Panorama mit Ortsschild', 18)}</div>
</div>
</section>
<section data-reveal style="max-width:1240px;margin:0 auto;padding:40px 24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:48px;align-items:center">
<div style="position:relative">
<div style="position:absolute;left:-20px;top:-16px;width:96px;height:96px;border-radius:50%;background:#FFD000;animation:taFloatA 10s ease-in-out infinite"></div>
<div style="position:relative;aspect-ratio:2.2/1;border-radius:22px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,.12)">${slot('Teamfoto vor dem Taxi', 22)}</div>
</div>
<div>
${kicker('DAS TEAM HINTER TAXI AKTIV')}
<h2 style="margin:12px 0 14px;font:700 clamp(26px,2.8cqw,34px)/1.15 Poppins,sans-serif">Persönlich. Erfahren. Für Sie da.</h2>
<p style="margin:0;font:15px/1.6 'DM Sans',sans-serif;color:#2f2f2f;text-wrap:pretty">Hinter Taxi Aktiv steht ein engagiertes Team rund um Inhaber Markus Schneider. Gemeinsam sorgen wir jeden Tag dafür, dass Sie sicher, komfortabel und entspannt an Ihr Ziel kommen – in Willingen, im Sauerland und darüber hinaus.</p>
<div aria-hidden="true" style="font:500 40px/1 Caveat,cursive;margin:18px 0 6px">Markus Schneider</div>
<div style="font:700 14px 'DM Sans',sans-serif">Markus Schneider</div>
<div style="font:13px 'DM Sans',sans-serif;color:#555">Inhaber &amp; Geschäftsführer</div>
</div>
</section>
<section data-reveal style="max-width:1240px;margin:0 auto;padding:16px 24px 56px">
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:18px">${valueCards}
</div>
</section>
<section style="position:relative;padding:40px 0 56px">
<div style="position:absolute;right:0;top:10px;bottom:0;width:62%;background:linear-gradient(135deg,#FFE45A,#FFCC00);border-radius:200px 0 0 120px"></div>
<div style="position:relative;max-width:1240px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:40px;align-items:center">
<div style="max-width:380px">
${kicker('UNSERE FAHRZEUGE')}
<h2 style="margin:12px 0 14px;font:700 clamp(26px,2.8cqw,34px)/1.15 Poppins,sans-serif">Moderner Fuhrpark für jeden Anlass</h2>
<p style="margin:0 0 22px;font:15px/1.6 'DM Sans',sans-serif;color:#2f2f2f">Ob Einzeltransfer, Gruppenfahrt oder Sonderfahrt – unsere gepflegte und komfortable Fahrzeugflotte bietet für jede Anforderung die passende Lösung.</p>
<a href="leistungen.html" style="display:inline-flex;align-items:center;gap:12px;height:48px;padding:0 24px;border:0;border-radius:999px;background:#FFD000;color:#151515;font:600 15px Poppins,sans-serif;cursor:pointer;text-decoration:none" style-hover="background:#F5C400">Unsere Fahrzeuge ansehen <span style="font-size:17px">${I.arrowRight}</span></a>
</div>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr));gap:14px">${fleet}
</div>
</div>
</section>
<section data-reveal style="max-width:1240px;margin:0 auto;padding:40px 24px 80px">
${kicker('DAS SAGEN UNSERE KUNDEN', { extra: ';margin-bottom:22px' })}
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:20px">${reviews}
</div>
</section>`;
}

function contentKontakt() {
  const fields = [
    [I.mapPin, 'Abholort *', 'z. B. Willingen, Hotel, Adresse …', 'name="abholort" required maxlength="160"'],
    [I.mapPin, 'Zielort *', 'z. B. Bahnhof, Flughafen, Ort …', 'name="zielort" required maxlength="160"'],
    [I.calendar, 'Datum *', 'TT.MM.JJJJ', 'name="datum" required data-type="date" maxlength="20"'],
    [I.clock, 'Uhrzeit *', '--:-- Uhr', 'name="uhrzeit" required data-type="time" maxlength="10"'],
    [I.user, 'Name *', 'Ihr vollständiger Name', 'name="name" required maxlength="100" autocomplete="name"'],
    [I.phone, 'Telefon *', 'z. B. 0176 12345678', 'name="telefon" type="tel" required maxlength="40" autocomplete="tel"'],
    [I.mail, 'E-Mail', 'z. B. name@beispiel.de', 'name="email" type="email" maxlength="160" autocomplete="email"'],
  ].map(([icon, label, ph, attrs]) => `<label class="ta-field" style="display:flex;gap:14px;align-items:flex-start;background:#fff;border:1px solid #e6e6e6;border-radius:10px;padding:12px 14px"><span style="font-size:20px;margin-top:2px">${icon}</span><span style="flex:1;display:flex;flex-direction:column;gap:3px"><span style="font:700 13px 'DM Sans',sans-serif">${label}</span><input ${attrs} placeholder="${esc(ph)}" style="border:0;outline:0;padding:0;font:14px 'DM Sans',sans-serif;background:transparent;width:100%"></span></label>`).join('\n');
  const channels = [
    [I.phone, 'Telefon', 'Rufen Sie uns direkt an – wir sind 24/7 für Sie da.', SITE.phone, SITE.tel, ''],
    // TODO: WhatsApp-Nummer eintragen (z. B. https://wa.me/49…). Bis dahin ohne Ziel.
    [I.whatsapp, 'WhatsApp', 'Schnell und unkompliziert per WhatsApp schreiben.', 'Jetzt chatten →', '#', ' data-todo="whatsapp"'],
    [I.mail, 'E-Mail', 'Senden Sie uns Ihre Anfrage bequem per E-Mail.', SITE.mail, 'mailto:' + SITE.mail, ''],
  ].map(([icon, t, s, cta, link, extra]) => `
<div style="background:#FFF6CC;border-radius:14px;padding:14px 16px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
<div style="width:46px;height:46px;flex:none;border-radius:50%;background:#FFD000;display:grid;place-items:center;font-size:21px">${icon}</div>
<div style="flex:1;min-width:160px"><div style="font:700 16px Poppins,sans-serif">${t}</div><div style="font:13px/1.4 'DM Sans',sans-serif;color:#3d3d3d">${s}</div></div>
<a href="${link}"${extra} style="display:flex;align-items:center;gap:8px;height:42px;padding:0 20px;border-radius:999px;background:#151515;color:#fff;text-decoration:none;font:700 14px 'DM Sans',sans-serif" style-hover="background:#000;color:#FFD000">${cta}</a>
</div>`).join('');
  const kfaq = [
    [I.calendarCheck, 'Wie kann ich ein Taxi buchen?', 'Ganz einfach über das Anfrageformular, telefonisch, per WhatsApp oder per E-Mail.'],
    [I.clock, 'Wie schnell erhalte ich eine Rückmeldung?', 'In der Regel melden wir uns innerhalb weniger Minuten bei Ihnen.'],
    [I.users, 'Kann ich auch Fahrten für Gruppen anfragen?', 'Ja, gerne! Teilen Sie uns einfach die Anzahl der Personen und weitere Wünsche mit.'],
  ].map(([icon, q, a]) => `
<div data-reveal style="background:#fff;border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.08);padding:20px;display:flex;gap:16px;align-items:center">
<div style="width:46px;height:46px;flex:none;border-radius:50%;background:#FFD000;display:grid;place-items:center;font-size:21px">${icon}</div>
<div style="flex:1"><h3 style="margin:0;font:700 15px/1.3 Poppins,sans-serif">${q}</h3><div style="font:13px/1.45 'DM Sans',sans-serif;color:#3d3d3d;margin-top:4px">${a}</div></div>
</div>`).join('');
  return `
<section data-reveal style="max-width:1240px;margin:0 auto;padding:56px 24px 48px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr));gap:48px;align-items:start">
<div>
${kicker('IHRE FAHRTANFRAGE')}
<h2 style="margin:12px 0 10px;font:700 clamp(28px,3.2cqw,38px)/1.15 Poppins,sans-serif">Jetzt Taxi anfragen</h2>
<p style="margin:0 0 22px;font:15px/1.5 'DM Sans',sans-serif;color:#2f2f2f">Teilen Sie uns einfach Ihre gewünschte Fahrt mit. Wir melden uns schnellstmöglich zur Bestätigung bei Ihnen – in der Regel innerhalb weniger Minuten.</p>
<form data-form="kontakt" method="post" action="#" aria-label="Fahrtanfrage" style="background:#f6f6f4;border-radius:18px;padding:18px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:14px">
${fields}
<label class="ta-field" style="grid-column:1/-1;display:flex;gap:14px;align-items:flex-start;background:#fff;border:1px solid #e6e6e6;border-radius:10px;padding:12px 14px"><span style="font-size:20px;margin-top:2px">${I.msgSquare}</span><span style="flex:1;display:flex;flex-direction:column;gap:3px"><span style="font:700 13px 'DM Sans',sans-serif">Nachricht</span><textarea name="nachricht" rows="3" maxlength="2000" placeholder="z. B. Anzahl der Personen, Gepäck, besondere Wünsche, Rückfahrt …" style="border:0;outline:0;padding:0;font:14px/1.5 'DM Sans',sans-serif;resize:vertical;background:transparent"></textarea></span></label>
<label style="grid-column:1/-1;display:flex;gap:12px;align-items:flex-start;font:13px/1.5 'DM Sans',sans-serif;padding:4px 2px;cursor:pointer"><input type="checkbox" name="datenschutz" value="ja" required style="width:20px;height:20px;accent-color:#151515;margin:0;flex:none"><span>Ich akzeptiere die <a href="datenschutz.html">Datenschutzerklärung</a> und stimme der Kontaktaufnahme zur Bearbeitung meiner Anfrage zu. *</span></label>
<button type="submit" style="grid-column:1/-1;height:56px;border:0;border-radius:10px;background:#151515;color:#fff;font:700 16px Poppins,sans-serif;letter-spacing:.04em;display:flex;align-items:center;justify-content:center;gap:14px;cursor:pointer" style-hover="background:#000"><span style="font-size:19px">${I.send}</span>JETZT ANFRAGE SENDEN <span style="font-size:18px">${I.arrowRight}</span></button>
</form>
<div data-sent="kontakt" hidden role="status" style="background:#FFF6CC;border-radius:18px;padding:32px;display:flex;flex-direction:column;gap:12px;align-items:flex-start">
<div style="width:56px;height:56px;border-radius:50%;background:#151515;color:#FFD000;display:grid;place-items:center;font-size:26px">${I.check}</div>
<div style="font:700 24px Poppins,sans-serif">Vielen Dank für Ihre Anfrage!</div>
<p style="margin:0;font:15px/1.5 'DM Sans',sans-serif;color:#2f2f2f">Wir haben Ihre Fahrtanfrage erhalten und melden uns in wenigen Minuten zur Bestätigung. Eilig? Rufen Sie uns direkt an: <strong>${SITE.phone}</strong>.</p>
<button type="button" data-reset="kontakt" style="margin-top:6px;height:46px;padding:0 22px;border:2px solid #151515;border-radius:999px;background:transparent;font:600 15px Poppins,sans-serif;cursor:pointer;color:#151515">Weitere Anfrage senden</button>
</div>
</div>
<div>
${kicker('DIREKT KONTAKTIEREN')}
<h2 style="margin:12px 0 22px;font:700 clamp(28px,3.2cqw,38px)/1.15 Poppins,sans-serif">So erreichen Sie uns</h2>
<div style="display:flex;flex-direction:column;gap:12px">${channels}
</div>
${kicker('UNSER STANDORT', { extra: ';margin-top:34px' })}
<h3 style="margin:10px 0 16px;font:700 24px Poppins,sans-serif">Taxi Aktiv Willingen</h3>
<div data-map style="position:relative;aspect-ratio:2.3/1;border-radius:16px;overflow:hidden">
<button type="button" class="ta-slot" data-open-cookies data-map-placeholder style="border-radius:16px"><span class="ta-slot-empty">${SLOT_ICON}<span class="ta-slot-cap">Karte / Google-Maps-Einbettung</span><span class="ta-slot-sub">Zum Anzeigen „Externe Medien“ in den <u>Cookie-Einstellungen</u> erlauben</span></span><span class="ta-slot-ring" style="border-radius:16px"></span></button>
</div>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-top:18px">
<div style="display:flex;gap:12px;font:13px/1.45 'DM Sans',sans-serif"><span style="font-size:20px;color:#E8B800">${I.mapPin}</span><address style="font-style:normal"><strong>Taxi Aktiv Willingen</strong><br>${SITE.street}<br>${SITE.city}<br>Deutschland</address></div>
<div style="display:flex;gap:12px;font:13px/1.45 'DM Sans',sans-serif"><span style="font-size:20px;color:#E8B800">${I.mail}</span><div><strong>Unser Einsatzgebiet</strong><br>Willingen und die gesamte Region Sauerland – zuverlässig, flexibel und pünktlich.</div></div>
</div>
</div>
</section>
<section data-reveal style="max-width:1240px;margin:0 auto;padding:24px 24px 80px">
${kickerCenter('HÄUFIGE FRAGEN')}
<h2 style="margin:12px 0 30px;text-align:center;font:700 clamp(26px,3.2cqw,36px)/1.15 Poppins,sans-serif">Kurz und schnell beantwortet</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:18px">${kfaq}
</div>
</section>`;
}

// Rechtstexte -----------------------------------------------------------------
const MARK = (t) => `<mark style="background:#FFF1A8;padding:0 4px;border-radius:3px">${t}</mark>`;
const P_STYLE = "margin:0 0 12px;font:15px/1.7 'DM Sans',sans-serif;color:#2f2f2f;text-wrap:pretty";
const UL_STYLE = "margin:0 0 12px;padding-left:20px;font:15px/1.7 'DM Sans',sans-serif;color:#2f2f2f";
const block = (title, body) => `<div style="padding:28px 0 16px;border-top:2px solid #151515"><h2 style="margin:0 0 12px;font:700 20px/1.3 Poppins,sans-serif">${title}</h2>${body}</div>`;
const p = (t) => `<p style="${P_STYLE}">${t}</p>`;
const ul = (items) => `<ul style="${UL_STYLE}">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
const note = (t) => `<div style="background:#FFF6CC;border-radius:14px;padding:14px 18px;margin-bottom:28px;font:14px/1.5 'DM Sans',sans-serif">${t}</div>`;

function contentImpressum() {
  return `
<section style="max-width:900px;margin:0 auto;padding:56px 24px 72px">
${note('Gelb markierte Angaben sind Platzhalter und müssen vor Veröffentlichung ergänzt bzw. geprüft werden.')}
${block('Angaben gemäß § 5 DDG', p(`<strong>Taxi Aktiv Willingen</strong><br>Inhaber: ${MARK('Markus Schneider')}<br>${SITE.street}<br>${SITE.city}<br>Deutschland`))}
${block('Kontakt', p(`Telefon: <a href="${SITE.tel}" style="color:inherit;text-decoration:none">${SITE.phone}</a><br>E-Mail: <a href="mailto:${SITE.mail}" style="color:inherit;text-decoration:none">${SITE.mail}</a><br>Web: ${SITE.web}`))}
${block('Umsatzsteuer-ID', p(`Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: ${MARK('DE XXX XXX XXX')}`))}
${block('Genehmigung nach Personenbeförderungsgesetz', p(`Genehmigung zum Verkehr mit Taxen nach §§ 2, 47 PBefG<br>Ordnungsnummer / Konzession: ${MARK('Nr. XXXX')}<br>Zuständige Genehmigungsbehörde: ${MARK('Kreisausschuss des Landkreises Waldeck-Frankenberg, Fachdienst Straßenverkehr')}`))}
${block('Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV', p(`${MARK('Markus Schneider')}<br>Anschrift wie oben`))}
${block('Verbraucherstreitbeilegung', p('Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'))}
${block('Haftung für Inhalte', p('Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehmen wir jedoch keine Gewähr. Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen. Bei Bekanntwerden von Rechtsverletzungen entfernen wir entsprechende Inhalte umgehend.'))}
${block('Haftung für Links', p('Unsere Website enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für diese fremden Inhalte ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Zum Zeitpunkt der Verlinkung waren keine Rechtsverstöße erkennbar. Bei Bekanntwerden von Rechtsverletzungen entfernen wir derartige Links umgehend.'))}
${block('Urheberrecht', p('Die durch uns erstellten Inhalte, Texte und Bilder auf dieser Website unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen unserer schriftlichen Zustimmung.') + p(`Bildnachweise: ${MARK('eigene Aufnahmen / Quelle ergänzen')}`))}
</section>`;
}

function contentDatenschutz() {
  return `
<section style="max-width:900px;margin:0 auto;padding:56px 24px 72px">
${note('Gelb markierte Angaben sind Platzhalter. Diese Vorlage ersetzt keine Rechtsberatung und sollte vor Veröffentlichung geprüft werden.')}
${block('1. Verantwortlicher', p('Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:') + p(`<strong>Taxi Aktiv Willingen</strong>, Inhaber ${MARK('Markus Schneider')}<br>${SITE.street}, 34508 Willingen (Upland)<br>Telefon: ${SITE.phone} · E-Mail: ${SITE.mail}`))}
${block('2. Allgemeines zur Datenverarbeitung', p('Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung dieser Website, zur Bearbeitung Ihrer Fahrtanfragen und zur Durchführung von Fahrten erforderlich ist. Rechtsgrundlagen sind insbesondere Art. 6 Abs. 1 lit. a DSGVO (Einwilligung), lit. b (Vertrag bzw. vorvertragliche Maßnahmen), lit. c (rechtliche Verpflichtung) und lit. f (berechtigtes Interesse).'))}
${block('3. Hosting und Server-Logfiles', p(`Diese Website wird bei ${MARK('Name und Anschrift des Hosters')} gehostet. Beim Aufruf der Website werden automatisch Informationen erfasst, die Ihr Browser übermittelt: IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seite, Referrer-URL, Browsertyp und Betriebssystem. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO zur Gewährleistung eines sicheren und stabilen Betriebs. Die Logfiles werden nach ${MARK('7')} Tagen gelöscht. Mit dem Hoster besteht ein Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO.`))}
${block('4. Fahrtanfrage- und Kontaktformular', p('Wenn Sie uns über das Formular eine Fahrt anfragen, verarbeiten wir die von Ihnen eingegebenen Daten:') + ul(['Abhol- und Zielort, Datum und Uhrzeit', 'Name und Telefonnummer', 'optional E-Mail-Adresse und Nachricht (z. B. Personenzahl, Gepäck)']) + p('Die Daten nutzen wir ausschließlich zur Bearbeitung Ihrer Anfrage und zur Durchführung der Fahrt (Art. 6 Abs. 1 lit. b DSGVO). Eine Weitergabe an Dritte erfolgt nicht, außer an den eingesetzten Fahrer. Die Daten werden gelöscht, sobald sie für den Zweck nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten bestehen.'))}
${block('5. Kontakt per Telefon, E-Mail und WhatsApp', p('Kontaktieren Sie uns per Telefon oder E-Mail, verarbeiten wir Ihre Angaben zur Bearbeitung Ihres Anliegens (Art. 6 Abs. 1 lit. b bzw. f DSGVO).') + p('Wenn Sie uns über WhatsApp schreiben, erfolgt die Kommunikation über den Dienst der WhatsApp Ireland Ltd., Merrion Road, Dublin 4, Irland. Dabei können Daten auch an Server der Meta Platforms Inc. in den USA übermittelt werden. Die Nutzung ist freiwillig; alternativ erreichen Sie uns jederzeit telefonisch oder per E-Mail. Weitere Informationen finden Sie in der Datenschutzrichtlinie von WhatsApp.'))}
${block('6. Cookies und Einwilligungen', p('Diese Website verwendet technisch notwendige Cookies bzw. lokalen Speicher, um Ihre Cookie-Auswahl zu speichern (§ 25 Abs. 2 TDDDG). Alle weiteren Dienste setzen wir nur mit Ihrer Einwilligung ein (§ 25 Abs. 1 TDDDG, Art. 6 Abs. 1 lit. a DSGVO). Ihre Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen oder ändern:') + `<button type="button" data-open-cookies style="display:inline-flex;align-items:center;gap:10px;height:46px;padding:0 22px;border:0;border-radius:999px;background:#FFD000;color:#151515;font:600 15px Poppins,sans-serif;cursor:pointer;margin-bottom:12px" style-hover="background:#F5C400">Cookie-Einstellungen öffnen</button>`)}
${block('7. Google Maps', p('Auf der Kontaktseite kann eine Karte von Google Maps eingebunden werden (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland). Die Karte wird erst geladen, wenn Sie in den Cookie-Einstellungen „Externe Medien“ zustimmen. Dabei werden u. a. Ihre IP-Adresse an Google übertragen, ggf. auch in die USA. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).'))}
${block('8. Links zu sozialen Netzwerken', p('Auf unserer Website verlinken wir auf unsere Profile bei Instagram, Facebook und YouTube. Es handelt sich um einfache Links; Daten werden erst übertragen, wenn Sie diese anklicken und die jeweilige Plattform aufrufen.'))}
${block('9. Ihre Rechte', p('Sie haben jederzeit das Recht auf:') + ul(['Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)', 'Berichtigung unrichtiger Daten (Art. 16 DSGVO)', 'Löschung (Art. 17 DSGVO) und Einschränkung der Verarbeitung (Art. 18 DSGVO)', 'Datenübertragbarkeit (Art. 20 DSGVO)', 'Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)', 'Widerruf einer erteilten Einwilligung (Art. 7 Abs. 3 DSGVO)']) + p('Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren. Für uns zuständig ist: Der Hessische Beauftragte für Datenschutz und Informationsfreiheit, Gustav-Stresemann-Ring 1, 65189 Wiesbaden.'))}
${block('10. SSL-/TLS-Verschlüsselung', p('Diese Website nutzt aus Sicherheitsgründen eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie an „https://“ in der Adresszeile Ihres Browsers.'))}
<p style="margin:20px 0 0;font:13px 'DM Sans',sans-serif;color:#555">Stand: November 2026</p>
</section>`;
}

// ---------------------------------------------------------------------------
// CTA-Banner, Footer, Overlays
// ---------------------------------------------------------------------------
function banner(page) {
  let inner;
  if (page === 'leistungen') {
    inner = `<div style="padding-left:clamp(0px,6cqw,80px)">${kicker('JETZT FAHRT ANFRAGEN', { weight: 700, color: '#151515' })}<h2 style="margin:10px 0 8px;font:700 clamp(26px,2.8cqw,34px)/1.15 Poppins,sans-serif">Ihr Taxi in Willingen<br>und im Sauerland</h2><p style="margin:0;font:15px/1.5 'DM Sans',sans-serif">Schnell, unkompliziert und zuverlässig –<br>wir sind für Sie da.</p></div>
<div style="justify-self:end"><a href="kontakt.html" style="pointer-events:auto;display:flex;align-items:center;gap:14px;height:60px;padding:0 32px;border:0;border-radius:999px;background:#FFD000;color:#151515;font:700 18px Poppins,sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.25);text-decoration:none" style-hover="background:#fff"><span style="font-size:20px">${I.calendarCheck}</span>Jetzt Fahrt anfragen <span style="font-size:20px">${I.arrowRight}</span></a></div>`;
  } else if (page === 'ueber') {
    inner = `<div style="padding-left:clamp(0px,6cqw,80px)">${kicker('JETZT TAXI BUCHEN', { weight: 700, color: '#151515' })}<h2 style="margin:10px 0 0;font:700 clamp(28px,3.2cqw,38px)/1.12 Poppins,sans-serif">Kontakt aufnehmen<br>und mobil bleiben!</h2></div>
<div style="justify-self:end;display:flex;flex-direction:column;gap:12px;min-width:240px">
<a href="kontakt.html" style="pointer-events:auto;display:flex;align-items:center;gap:12px;height:52px;padding:0 26px;border:0;border-radius:999px;background:#FFD000;color:#151515;font:700 16px Poppins,sans-serif;cursor:pointer;text-decoration:none" style-hover="background:#fff"><span style="font-size:18px">${I.calendarCheck}</span>Taxi buchen<span style="margin-left:auto;font-size:18px">${I.arrowRight}</span></a>
<a href="kontakt.html" style="pointer-events:auto;display:flex;align-items:center;gap:12px;height:52px;padding:0 26px;border:2px solid #fff;border-radius:999px;background:#151515;color:#fff;font:700 16px Poppins,sans-serif;cursor:pointer;text-decoration:none" style-hover="background:#000"><span style="font-size:18px">${I.phone}</span>Kontakt aufnehmen</a>
</div>`;
  } else {
    const item = (t) => `<div style="display:flex;gap:12px;align-items:center;color:#fff;font:500 14px 'DM Sans',sans-serif"><span style="color:#FFD000;font-size:20px">${I.check}</span>${t}</div>`;
    inner = `<div style="padding-left:clamp(0px,6cqw,80px)">${kicker('WILLINGEN &amp; SAUERLAND', { weight: 700, color: '#151515' })}<h2 style="margin:10px 0 0;font:700 clamp(26px,2.8cqw,34px)/1.15 Poppins,sans-serif">Mobil in einer<br>der schönsten Regionen<br>Deutschlands</h2></div>
<div style="display:flex;flex-direction:column;gap:12px;justify-self:end;background:rgba(20,20,20,.55);padding:20px 24px;border-radius:14px">
${item('Ideale Anbindung in der Region')}
${item('Für Urlauber, Einheimische und Gäste')}
${item('Zuverlässiger Service – das ganze Jahr')}
</div>`;
  }
  return `
<!-- CTA BANNER -->
<section style="position:relative;min-height:240px;overflow:hidden">
<img src="${IMG}banner-sauerland.webp" alt="Sauerland bei Sonnenuntergang" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 45%;display:block">
<div style="position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,#FFD000 0%,rgba(255,208,0,.88) 30%,rgba(255,208,0,.35) 52%,rgba(20,20,20,.15) 70%,rgba(20,20,20,.55) 100%)"></div>
<div style="position:relative;pointer-events:none;max-width:1240px;margin:0 auto;padding:40px 24px 44px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));gap:28px;align-items:center">
${inner}
</div>
</section>`;
}

function footer() {
  const social = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['youtube', 'YouTube']]
    // TODO: echte Profil-URLs eintragen und <span> durch <a href="…" rel="noopener"> ersetzen.
    .map(([k, label]) => `<span role="img" aria-label="${label}" style="width:44px;height:44px;border-radius:50%;border:1.5px solid #3a3a3a;display:grid;place-items:center;font-size:19px;cursor:pointer" style-hover="background:#FFD000;color:#151515;border-color:#FFD000">${I[k]}</span>`).join('\n');
  const nav = NAV.map((k) => `<a href="${href(k)}" style="font:500 16px 'DM Sans',sans-serif;color:#d6d6d6;cursor:pointer;text-decoration:none" style-hover="color:#FFD000">${PAGES[k].label}</a>`).join('');
  return `
<!-- FOOTER -->
<footer style="background:#141414;color:#fff;border-top:4px solid #FFD000">
<div style="max-width:1240px;margin:0 auto;padding:56px 24px 48px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:48px 40px;align-items:start">
<div style="display:flex;flex-direction:column;gap:22px">
<div style="display:flex;flex-direction:column;gap:3px;flex:none">${logo({ color: '#ffffff' })}</div>
<p style="margin:0;font:15px/1.6 'DM Sans',sans-serif;color:#bdbdbd;max-width:280px">Ihr zuverlässiger Taxipartner in Willingen und im Sauerland – rund um die Uhr erreichbar.</p>
<div style="display:flex;gap:12px">
${social}
</div>
</div>
<div><div style="font:700 12px Poppins,sans-serif;letter-spacing:.28em;color:#FFD000;margin-bottom:18px">ADRESSE</div>
<div style="display:flex;gap:14px;font:16px/1.65 'DM Sans',sans-serif;color:#d6d6d6"><span style="color:#FFD000;font-size:21px;margin-top:2px">${I.mapPin}</span><address style="font-style:normal"><strong style="color:#fff">Taxi Aktiv Willingen</strong><br>${SITE.street}<br>${SITE.city}<br>Deutschland</address></div>
</div>
<div><div style="font:700 12px Poppins,sans-serif;letter-spacing:.28em;color:#FFD000;margin-bottom:18px">KONTAKT</div>
<div style="display:flex;flex-direction:column;gap:14px;font:16px 'DM Sans',sans-serif;color:#d6d6d6">
<a href="${SITE.tel}" style="display:flex;gap:14px;align-items:center;color:#fff;text-decoration:none;font:700 20px Poppins,sans-serif" style-hover="color:#FFD000"><span style="color:#FFD000;font-size:21px">${I.phone}</span>${SITE.phone}</a>
<a href="mailto:${SITE.mail}" style="display:flex;gap:14px;align-items:center;color:#d6d6d6;text-decoration:none;white-space:nowrap" style-hover="color:#FFD000"><span style="color:#FFD000;font-size:21px">${I.mail}</span>${SITE.mail}</a>
<div style="display:flex;gap:14px;align-items:center;white-space:nowrap"><span style="color:#FFD000;font-size:21px">${I.globe}</span>${SITE.web}</div>
<div style="display:flex;gap:14px;align-items:center"><span style="color:#FFD000;font-size:21px">${I.clock}</span>24/7 erreichbar</div>
</div>
</div>
<div><div style="font:700 12px Poppins,sans-serif;letter-spacing:.28em;color:#FFD000;margin-bottom:18px">SEITEN</div>
<nav aria-label="Seiten" style="display:flex;flex-direction:column;gap:10px">${nav}</nav>
</div>
</div>
<div style="max-width:1240px;margin:0 auto;padding:22px 24px 28px;border-top:1px solid #2e2e2e;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font:14px 'DM Sans',sans-serif;color:#9a9a9a">
<div>© 2025 Taxi Aktiv Willingen. Alle Rechte vorbehalten.</div>
<div style="display:flex;gap:24px;flex-wrap:wrap"><a href="impressum.html" style="cursor:pointer;color:inherit;text-decoration:none" style-hover="color:#FFD000">Impressum</a><a href="datenschutz.html" style="cursor:pointer;color:inherit;text-decoration:none" style-hover="color:#FFD000">Datenschutz</a><button type="button" data-open-cookies style="cursor:pointer;background:none;border:0;padding:0;font:inherit;color:inherit" style-hover="color:#FFD000">Cookie-Einstellungen</button></div>
</div>
</footer>`;
}

function overlays(page) {
  const fab = page === 'kontakt' ? '' : `
<a href="kontakt.html" class="ta-fab" data-fab hidden aria-label="Taxi jetzt buchen" style="position:fixed;right:24px;bottom:24px;z-index:55;display:flex;align-items:center;gap:12px;height:60px;padding:0 28px;border:2px solid #FFD000;border-radius:999px;background:#151515;color:#fff;font:700 17px Poppins,sans-serif;cursor:pointer;white-space:nowrap;box-shadow:0 10px 30px rgba(0,0,0,.3);animation:taBeat 1.8s ease-in-out infinite, taRing 1.8s ease-out infinite;text-decoration:none" style-hover="background:#000"><span style="font-size:21px">${I.car}</span>Taxi jetzt buchen<span style="font-size:19px">${I.arrowRight}</span></a>`;
  const row = (key, title, text) => `<div style="display:flex;gap:16px;align-items:flex-start;padding:16px 0;border-top:1px solid #ececec">
<div style="flex:1"><div id="ck-${key}" style="font:700 15px Poppins,sans-serif">${title}</div><div style="font:13px/1.5 'DM Sans',sans-serif;color:#555;margin-top:3px">${text}</div></div>
<button type="button" role="switch" aria-checked="false" aria-labelledby="ck-${key}" class="ta-switch" data-consent-toggle="${key}"><span></span></button>
</div>`;
  return `${fab}

<!-- COOKIE-BANNER -->
<div data-cookie-banner hidden style="position:fixed;left:16px;right:16px;bottom:16px;z-index:60;display:flex;justify-content:center;pointer-events:none">
<div role="region" aria-label="Cookie-Hinweis" style="pointer-events:auto;max-width:980px;width:100%;background:#151515;color:#fff;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.35);padding:20px 22px;display:flex;gap:20px;align-items:center;flex-wrap:wrap;animation:taFadeUp .6s .4s both">
<div style="width:46px;height:46px;flex:none;border-radius:50%;background:#FFD000;color:#151515;display:grid;place-items:center;font-size:22px">${I.shield}</div>
<div style="flex:1;min-width:240px"><div style="font:700 16px Poppins,sans-serif">Wir respektieren Ihre Privatsphäre</div><div style="font:13px/1.5 'DM Sans',sans-serif;color:#cfcfcf;margin-top:4px">Wir nutzen notwendige Cookies für den Betrieb der Website. Externe Medien wie Google Maps laden wir nur mit Ihrer Zustimmung. <a href="datenschutz.html" style="color:#FFD000;text-decoration:underline;cursor:pointer">Mehr erfahren</a></div></div>
<div style="display:flex;gap:10px;flex-wrap:wrap">
<button type="button" data-open-cookies style="height:44px;padding:0 18px;border:2px solid #555;border-radius:999px;background:transparent;color:#fff;font:600 14px Poppins,sans-serif;cursor:pointer" style-hover="border-color:#fff">Einstellungen</button>
<button type="button" data-consent="necessary" style="height:44px;padding:0 18px;border:2px solid #fff;border-radius:999px;background:transparent;color:#fff;font:600 14px Poppins,sans-serif;cursor:pointer" style-hover="background:#fff;color:#151515">Nur notwendige</button>
<button type="button" data-consent="all" style="height:44px;padding:0 20px;border:0;border-radius:999px;background:#FFD000;color:#151515;font:700 14px Poppins,sans-serif;cursor:pointer" style-hover="background:#fff">Alle akzeptieren</button>
</div>
</div>
</div>

<!-- COOKIE-EINSTELLUNGEN -->
<div data-cookie-modal hidden style="position:fixed;inset:0;z-index:70;background:rgba(20,20,20,.55);display:flex;align-items:center;justify-content:center;padding:16px">
<div role="dialog" aria-modal="true" aria-labelledby="ck-title" style="background:#fff;border-radius:20px;max-width:560px;width:100%;max-height:90vh;overflow:auto;box-shadow:0 30px 80px rgba(0,0,0,.35);animation:taFadeUp .35s both">
<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:22px 24px 6px">
<div><div style="display:flex;align-items:center;gap:12px;font:600 11px Poppins,sans-serif;letter-spacing:.32em">DATENSCHUTZ<span style="width:30px;height:2px;background:#FFD000"></span></div><div id="ck-title" style="font:700 22px Poppins,sans-serif;margin-top:6px">Cookie-Einstellungen</div></div>
<button type="button" data-close-cookies aria-label="Schließen" style="width:42px;height:42px;border-radius:50%;border:0;background:#f3f3f1;display:grid;place-items:center;font-size:18px;cursor:pointer;color:#151515">${I.x}</button>
</div>
<div style="padding:6px 24px 8px">
<p style="margin:0 0 8px;font:14px/1.55 'DM Sans',sans-serif;color:#3d3d3d">Wählen Sie, welche Dienste wir verwenden dürfen. Ihre Auswahl können Sie jederzeit über „Cookie-Einstellungen“ im Footer ändern.</p>
<div style="display:flex;gap:16px;align-items:flex-start;padding:16px 0;border-top:1px solid #ececec">
<div style="flex:1"><div style="font:700 15px Poppins,sans-serif">Notwendig</div><div style="font:13px/1.5 'DM Sans',sans-serif;color:#555;margin-top:3px">Speichern Ihre Cookie-Auswahl und sichern den Betrieb der Website. Immer aktiv.</div></div>
<span aria-label="Immer aktiv" role="img" style="flex:none;width:50px;height:28px;border-radius:999px;background:#151515;position:relative;opacity:.45"><span style="position:absolute;top:3px;left:25px;width:22px;height:22px;border-radius:50%;background:#FFD000"></span></span>
</div>
${row('stats', 'Statistik', 'Anonyme Auswertung der Seitenaufrufe, damit wir unser Angebot verbessern können.')}
${row('media', 'Externe Medien', 'Lädt Google Maps auf der Kontaktseite. Dabei werden Daten an Google übertragen.')}
</div>
<div style="display:flex;gap:10px;flex-wrap:wrap;padding:16px 24px 22px;border-top:2px solid #151515">
<button type="button" data-consent="necessary" style="flex:1;min-width:140px;height:48px;padding:0 18px;border:2px solid #151515;border-radius:999px;background:transparent;color:#151515;font:600 14px Poppins,sans-serif;cursor:pointer" style-hover="background:#f3f3f1">Nur notwendige</button>
<button type="button" data-consent="save" style="flex:1;min-width:140px;height:48px;padding:0 18px;border:0;border-radius:999px;background:#151515;color:#fff;font:600 14px Poppins,sans-serif;cursor:pointer" style-hover="background:#000">Auswahl speichern</button>
<button type="button" data-consent="all" style="flex:1;min-width:140px;height:48px;padding:0 18px;border:0;border-radius:999px;background:#FFD000;color:#151515;font:700 14px Poppins,sans-serif;cursor:pointer" style-hover="background:#F5C400">Alle akzeptieren</button>
</div>
</div>
</div>`;
}

// ---------------------------------------------------------------------------
// Seitenrahmen
// ---------------------------------------------------------------------------
const META = {
  home: ['Taxi Aktiv Willingen – Ihr Taxi in Willingen und im Sauerland', 'Taxi Aktiv Willingen: Ihr zuverlässiger Taxipartner in Willingen und im Sauerland – Flughafentransfer, Krankenfahrten, Gruppenfahrten und Skishuttle. 24/7 erreichbar: 05632 9988.'],
  leistungen: ['Leistungen – Taxi Aktiv Willingen', 'Stadt- und Regionalfahrten, Flughafentransfer, Krankenfahrten, Gruppenfahrten, Kurierfahrten und Skishuttle in Willingen und im Sauerland.'],
  ueber: ['Über uns – Taxi Aktiv Willingen', 'Lernen Sie Taxi Aktiv kennen: Ihr lokaler Taxi-Service in Willingen und im Sauerland – mit modernem Fuhrpark und persönlichem Service.'],
  kontakt: ['Kontakt & Fahrtanfrage – Taxi Aktiv Willingen', 'Taxi in Willingen anfragen: per Formular, Telefon 05632 9988 oder E-Mail. Wir melden uns in der Regel innerhalb weniger Minuten.'],
  impressum: ['Impressum – Taxi Aktiv Willingen', 'Impressum von Taxi Aktiv Willingen, Briloner Straße 34, 34508 Willingen (Upland).'],
  datenschutz: ['Datenschutzerklärung – Taxi Aktiv Willingen', 'Informationen zum Datenschutz bei Taxi Aktiv Willingen gemäß DSGVO.'],
};
const HERO_IMG = { home: FLEET.bus.src, leistungen: FLEET.v.src, ueber: FLEET.q5.src, kontakt: FLEET.e.src };

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  'frame-src https://www.google.com https://maps.google.com',
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

const JSONLD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'TaxiService',
  name: SITE.name,
  telephone: '+49 5632 9988',
  email: SITE.mail,
  address: { '@type': 'PostalAddress', streetAddress: SITE.street, postalCode: '34508', addressLocality: 'Willingen (Upland)', addressRegion: 'Hessen', addressCountry: 'DE' },
  areaServed: ['Willingen (Upland)', 'Sauerland'],
  openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' },
});

function renderPage(page, v) {
  const [title, desc] = META[page];
  const hero = { home: heroHome, leistungen: heroLeistungen, ueber: heroUeber, kontakt: heroKontakt }[page];
  const content = { home: contentHome, leistungen: contentLeistungen, ueber: contentUeber, kontakt: contentKontakt, impressum: contentImpressum, datenschutz: contentDatenschutz }[page];
  const strip = page === 'leistungen' ? featureStrip(FEAT_B) : ['home', 'ueber'].includes(page) ? featureStrip(FEAT_A) : '';
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${INDEXING ? '' : '<meta name="robots" content="noindex, nofollow">\n'}<meta name="theme-color" content="#FFD000">
<meta property="og:type" content="website">
<meta property="og:locale" content="de_DE">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/poppins-800.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/dmsans-var.woff2" as="font" type="font/woff2" crossorigin>
${HERO_IMG[page] ? `<link rel="preload" href="${HERO_IMG[page]}" as="image" fetchpriority="high">\n` : ''}<link rel="stylesheet" href="assets/site.css?v=${v.css}">
<script src="assets/site.js?v=${v.js}" defer></script>
${page === 'home' ? `<script type="application/ld+json">${JSONLD}</script>\n` : ''}</head>
<body data-page="${page}">
<a class="ta-skip" href="#inhalt">Zum Inhalt springen</a>
<div class="ta-root" data-motion="on" style="background:#fff;overflow-x:clip;position:relative;min-height:100vh">
${header(page)}

<main id="inhalt">
<!-- HERO -->
<section class="ta-hero" style="position:relative;margin-top:-80px;padding-top:80px">
${HERO_BG}
${page === 'impressum' || page === 'datenschutz' ? heroLegal(page) : hero()}
</section>
${strip}
${content()}
</main>
${banner(page)}
${footer()}
</div>
${overlays(page)}
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// style-hover → :hover-Klassen (wie die Design-Runtime, mit !important)
// ---------------------------------------------------------------------------
const hoverRules = new Map();
function importantify(css) {
  return css.split(';').map((d) => d.trim()).filter(Boolean)
    .map((d) => (/!\s*important$/i.test(d) ? d : `${d} !important`)).join(';');
}
function applyHover(html) {
  return html.replace(/<([a-zA-Z][\w-]*)([^<>]*?)\sstyle-hover="([^"]*)"([^<>]*)>/g, (m, tag, pre, css, post) => {
    let cls = hoverRules.get(css);
    if (!cls) { cls = `hv${hoverRules.size + 1}`; hoverRules.set(css, cls); }
    let attrs = pre + post;
    if (/\sclass="/.test(attrs)) attrs = attrs.replace(/\sclass="([^"]*)"/, (mm, c) => ` class="${c} ${cls}"`);
    else attrs = ` class="${cls}"${attrs}`;
    return `<${tag}${attrs}>`;
  });
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------
const hash = (s) => createHash('sha256').update(s).digest('hex').slice(0, 10);
mkdirSync(join(OUT, 'assets'), { recursive: true });

const order = ['home', 'leistungen', 'ueber', 'kontakt', 'impressum', 'datenschutz'];
// 1. Durchlauf: Hover-Klassen sammeln (Platzhalter-Versionen)
const drafts = order.map((pg) => [pg, applyHover(renderPage(pg, { css: '@CSS@', js: '@JS@' }))]);

const hoverCss = [...hoverRules].map(([css, cls]) => `.${cls}:hover{${importantify(css)}}`).join('\n');
const css = `${readFileSync(join(ROOT, 'src/styles.css'), 'utf8')}\n/* ---------- Hover (generiert aus style-hover) ---------- */\n${hoverCss}\n`;
const js = readFileSync(join(ROOT, 'src/main.js'), 'utf8');
writeFileSync(join(OUT, 'assets/site.css'), css);
writeFileSync(join(OUT, 'assets/site.js'), js);
const v = { css: hash(css), js: hash(js) };

for (const [pg, html] of drafts) {
  writeFileSync(join(OUT, PAGES[pg].file), html.replace('@CSS@', v.css).replace('@JS@', v.js));
}
console.log(`✓ ${order.length} Seiten, ${hoverRules.size} Hover-Klassen → docs/`);

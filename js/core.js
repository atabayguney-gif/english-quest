/* =========================================================================
   ENGLISH QUEST — Core: utilities, storage, players, XP, achievements,
   daily challenges, mistakes, leaderboards, audio, speech, effects, router
   ========================================================================= */
'use strict';

/* ---------------------------------- utils ---------------------------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fmt = n => Math.round(n).toLocaleString('en-US');
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad2 = n => String(n).padStart(2, '0');
const dateKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const todayKey = () => dateKey();
const yesterdayKey = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dateKey(d); };
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function seeded(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function weightedSample(items, n, weightFn) {
  const pool = items.map(it => ({ it, w: Math.max(0.01, weightFn(it)) }));
  const out = [];
  while (out.length < n && pool.length) {
    const total = pool.reduce((s, x) => s + x.w, 0);
    let r = Math.random() * total, i = 0;
    for (; i < pool.length - 1; i++) { r -= pool[i].w; if (r <= 0) break; }
    out.push(pool[i].it); pool.splice(i, 1);
  }
  return out;
}
function timeAgo(t) {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + ' min ago';
  if (s < 86400) return Math.floor(s / 3600) + ' h ago';
  const d = Math.floor(s / 86400); return d === 1 ? 'yesterday' : d + ' days ago';
}
const normalizeKey = k => {
  if (!k) return '';
  const map = { 'ı': 'I', 'i': 'I', 'İ': 'I', 'ş': 'S', 'ğ': 'G', 'ü': 'U', 'ö': 'O', 'ç': 'C' };
  if (map[k]) return map[k];
  return k.length === 1 ? k.toUpperCase() : k;
};

/* ---------------------------------- icons ---------------------------------- */
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  gamepad: '<rect x="2" y="6" width="20" height="12" rx="6"/><path d="M6.5 12h4M8.5 10v4"/><path d="M15 11h.01M18 13h.01" stroke-width="3"/>',
  trophy: '<path d="M8 21h8M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  settings: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3 0 1.66 1.34 3 2.5 3z"/>',
  star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  volume: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path class="w1" d="M15.5 8.5a5 5 0 0 1 0 7"/><path class="w2" d="M19 5a10 10 0 0 1 0 14"/>',
  bulb: '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  next: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  shuffle: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-5 4 3 5-7"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 7v6M12 16.5h.01"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  medal: '<circle cx="12" cy="15" r="6"/><path d="M8.5 10.2 5 2h4l3 6M15.5 10.2 19 2h-4l-3 6"/>',
  crown: '<path d="M3 18h18M3 7l4.5 4L12 4l4.5 7L21 7l-2 11H5L3 7z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  play: '<path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" fill="currentColor"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  skip: '<path d="M5 4l10 8-10 8V4zM19 5v14"/>',
  backspace: '<path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><path d="M18 9l-6 6M12 9l6 6"/>',
  fullscreen: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-5-6.7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  swords: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/><path d="M9.5 6.5 14 2h3v3l-4.5 4.5M5 14l-2 2 3 3 2-2"/>',
  graduation: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5M22 10v6"/>',
  rotate: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  switch: '<path d="M16 3l4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  sparkles: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  circle: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="18" cy="15" r="1.5" fill="currentColor"/><circle cx="6" cy="15" r="1.5" fill="currentColor"/><path d="M12 5l6 10H6z"/>',
  blocks: '<rect x="2" y="14" width="9" height="7" rx="1.5"/><rect x="13" y="14" width="9" height="7" rx="1.5"/><rect x="7" y="4" width="10" height="7" rx="1.5"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  letters: '<rect x="2" y="7" width="9" height="10" rx="2"/><rect x="13" y="7" width="9" height="10" rx="2"/><path d="M4.5 14l2-5 2 5M5.2 12.5h2.6M15.5 9v5.5h3"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4 2.5-2.5z"/>',
  question: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
  school: '<path d="M2 10l10-6 10 6-10 6z"/><path d="M6 12v5l6 3 6-3v-5"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" stroke-width="2.5"/>',
  ball: '<circle cx="12" cy="12" r="10"/><path d="M4.9 4.9c4 2 6.5 6 7.1 11.1M19.1 4.9c-3 3.5-3.5 9-1 14.6M2 12c5 0 12-1 20 0"/>',
  flag: '<path d="M4 22V4M4 4h12l-2 4 2 4H4"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v9H5v-9"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  repeat: '<path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  headphones: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
  wifi: '<path d="M2 8.8a15 15 0 0 1 20 0M5 12.6a10 10 0 0 1 14 0M8.5 16.4a5 5 0 0 1 7 0"/><path d="M12 20h.01" stroke-width="3"/>',
};
function icon(name, cls = '') {
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.star}</svg>`;
}

/* --------------------------------- avatars --------------------------------- */
const AVATARS = [
  { bg: '#EEEBFF', body: '#6D5DFC', acc: 'cap' },
  { bg: '#E0F2FE', body: '#0EA5E9', acc: 'headphones' },
  { bg: '#FCE7F3', body: '#EC4899', acc: 'bow' },
  { bg: '#DCFCE7', body: '#22C55E', acc: 'sprout' },
  { bg: '#FEF3C7', body: '#F59E0B', acc: 'crown' },
  { bg: '#FFE4E6', body: '#F43F5E', acc: 'cat' },
  { bg: '#CCFBF1', body: '#14B8A6', acc: 'glasses' },
  { bg: '#EDE9FE', body: '#8B5CF6', acc: 'star' },
  { bg: '#FFEDD5', body: '#F97316', acc: 'beanie' },
  { bg: '#DBEAFE', body: '#3B82F6', acc: 'antenna' },
  { bg: '#FAE8FF', body: '#D946EF', acc: 'bunny' },
  { bg: '#ECFCCB', body: '#65A30D', acc: 'party' },
];
function avatarSVG(i, cls = '') {
  const a = AVATARS[((i % AVATARS.length) + AVATARS.length) % AVATARS.length];
  const b = a.body;
  const behind = {
    cat: `<path d="M22 56 L26 20 L46 38Z M78 56 L74 20 L54 38Z" fill="${b}"/><path d="M27 44 L29 28 L38 37Z M73 44 L71 28 L62 37Z" fill="#fff" opacity=".45"/>`,
    bunny: `<ellipse cx="38" cy="24" rx="7.5" ry="19" fill="${b}"/><ellipse cx="62" cy="24" rx="7.5" ry="19" fill="${b}"/><ellipse cx="38" cy="24" rx="3.2" ry="12" fill="#fff" opacity=".5"/><ellipse cx="62" cy="24" rx="3.2" ry="12" fill="#fff" opacity=".5"/>`,
  }[a.acc] || '';
  const front = {
    cap: '<path d="M22 31 L50 19 L78 31 L50 43Z" fill="#1B1E3C"/><path d="M35 35 v8 c0 4.5 30 4.5 30 0 v-8 L50 42Z" fill="#2E3266"/><path d="M78 31 v14" stroke="#FBBF24" stroke-width="2.5"/><circle cx="78" cy="47" r="3.2" fill="#FBBF24"/>',
    headphones: '<path d="M19 60 C19 26 81 26 81 60" stroke="#1B1E3C" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="12" y="52" width="13" height="21" rx="6.5" fill="#1B1E3C"/><rect x="75" y="52" width="13" height="21" rx="6.5" fill="#1B1E3C"/>',
    bow: '<path d="M50 33 L35 24 L35 42Z M50 33 L65 24 L65 42Z" fill="#FDE047" stroke="#EAB308" stroke-width="1.5" stroke-linejoin="round"/><circle cx="50" cy="33" r="4.5" fill="#FACC15"/>',
    sprout: '<path d="M50 33 v-11" stroke="#15803D" stroke-width="3" stroke-linecap="round"/><path d="M50 25 C40 14 31 20 33 27 C40 30 46 28 50 25Z" fill="#4ADE80"/><path d="M50 23 C58 12 69 16 67 23 C61 26 54 25 50 23Z" fill="#86EFAC"/>',
    crown: '<path d="M31 37 L33 19 L42 28 L50 15 L58 28 L67 19 L69 37Z" fill="#FACC15" stroke="#EAB308" stroke-width="2" stroke-linejoin="round"/><circle cx="50" cy="29" r="2.5" fill="#F43F5E"/>',
    glasses: '<g fill="none" stroke="#1B1E3C" stroke-width="3"><circle cx="40" cy="56" r="9.5"/><circle cx="61" cy="56" r="9.5"/><path d="M49.5 56 h2"/></g>',
    star: '<path d="M67 26 l3.2 6.4 7 1 -5.1 5 1.2 7 -6.3-3.3 -6.3 3.3 1.2-7 -5.1-5 7-1z" fill="#FDE047" stroke="#F59E0B" stroke-width="1.6" stroke-linejoin="round"/>',
    beanie: '<path d="M25 46 C25 18 75 18 75 46Z" fill="#1E40AF"/><rect x="22" y="40" width="56" height="10" rx="5" fill="#60A5FA"/><circle cx="50" cy="18" r="6" fill="#BFDBFE"/>',
    antenna: '<path d="M50 34 V16" stroke="#1B1E3C" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="14" r="5.5" fill="#F43F5E"/>',
    party: '<path d="M50 5 L37 36 L63 36Z" fill="#F472B6"/><path d="M44 20 L56 20 M41 28 L59 28" stroke="#fff" stroke-width="2.6"/><circle cx="50" cy="6" r="4.5" fill="#FDE047"/>',
  }[a.acc] || '';
  return `<svg class="avatar-svg ${cls}" viewBox="0 0 100 100" aria-hidden="true">
    <rect width="100" height="100" fill="${a.bg}"/>
    ${behind}
    <path d="M15 112 C15 62 29 32 50 32 C71 32 85 62 85 112Z" fill="${b}"/>
    <ellipse cx="38" cy="45" rx="9" ry="5" fill="#fff" opacity=".18" transform="rotate(-25 38 45)"/>
    <g class="av-eyes">
      <ellipse cx="40" cy="56" rx="7" ry="8" fill="#fff"/><ellipse cx="61" cy="56" rx="7" ry="8" fill="#fff"/>
      <circle cx="41.5" cy="57.5" r="3.9" fill="#1B1E3C"/><circle cx="62.5" cy="57.5" r="3.9" fill="#1B1E3C"/>
      <circle cx="42.8" cy="55.8" r="1.4" fill="#fff"/><circle cx="63.8" cy="55.8" r="1.4" fill="#fff"/>
    </g>
    <ellipse cx="31" cy="67" rx="5" ry="3" fill="#fff" opacity=".35"/><ellipse cx="70" cy="67" rx="5" ry="3" fill="#fff" opacity=".35"/>
    <path d="M44 68 Q50.5 75 57 68" stroke="#1B1E3C" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${front}
  </svg>`;
}
function avatarHTML(i, size = 44, extra = '') {
  return `<span class="avatar ${extra}" style="--s:${size}px">${avatarSVG(i)}</span>`;
}

/* --------------------------------- storage --------------------------------- */
const STORE_KEY = 'englishQuest.v1';
const GAME_IDS = ['connect', 'match', 'wordle', 'quiz', 'sentence', 'circle', 'riddle'];
const GAME_META = {
  connect:  { name: 'Word Connect',     sub: 'Letter Connection Puzzle',  color: '#3B82F6', dark: '#1D4ED8', light: '#EAF2FF', icon: 'letters', grad: 'linear-gradient(135deg,#60A5FA 0%,#2563EB 100%)' },
  match:    { name: 'Word Match',       sub: 'English ↔ Turkish',         color: '#EC4899', dark: '#BE185D', light: '#FDEBF5', icon: 'link',    grad: 'linear-gradient(135deg,#F472B6 0%,#DB2777 100%)' },
  wordle:   { name: 'Wordle',           sub: 'Guess the Hidden Word',     color: '#10B981', dark: '#047857', light: '#E3FAF1', icon: 'grid',    grad: 'linear-gradient(135deg,#34D399 0%,#059669 100%)' },
  quiz:     { name: 'English Quiz',     sub: 'Test Your Knowledge',       color: '#F59E0B', dark: '#B45309', light: '#FEF4E2', icon: 'question',grad: 'linear-gradient(135deg,#FBBF24 0%,#F97316 100%)' },
  sentence: { name: 'Sentence Builder', sub: 'Build Correct Sentences',   color: '#06B6D4', dark: '#0E7490', light: '#E2F8FC', icon: 'blocks',  grad: 'linear-gradient(135deg,#22D3EE 0%,#0891B2 100%)' },
  circle:   { name: 'Word Circle',      sub: 'Circular Letter Connection',color: '#8B5CF6', dark: '#6D28D9', light: '#F1EBFF', icon: 'circle',  grad: 'linear-gradient(135deg,#A78BFA 0%,#7C3AED 100%)' },
  riddle:   { name: 'Word Riddle',      sub: 'Kelime Bilmecesi · Hints',  color: '#F43F5E', dark: '#BE123C', light: '#FFEDF0', icon: 'bulb',    grad: 'linear-gradient(135deg,#FB7185 0%,#E11D48 100%)' },
  final:    { name: 'Final Exam',       sub: 'Unit Challenge',            color: '#EF4444', dark: '#B91C1C', light: '#FEECEC', icon: 'trophy',  grad: 'linear-gradient(135deg,#FB7185 0%,#F97316 100%)' },
  review:   { name: 'Review Test',      sub: 'Fix your mistakes',         color: '#14B8A6', dark: '#0F766E', light: '#E0F7F4', icon: 'repeat',  grad: 'linear-gradient(135deg,#2DD4BF 0%,#0D9488 100%)' },
  battle:   { name: 'Class Battle',     sub: 'Team vs Team on the board', color: '#6366F1', dark: '#4338CA', light: '#ECEDFF', icon: 'swords',  grad: 'linear-gradient(135deg,#818CF8 0%,#4F46E5 100%)' },
};

const DB = {
  state: null,
  load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { s = null; }
    if (!s || typeof s !== 'object') s = {};
    s.players = s.players || {};
    s.settings = Object.assign({ sound: true, voice: false, accent: 'us', rate: 0.9, motion: true, matchMode: 'timed', voiceId: '', voiceChosen: false, classServer: '' }, s.settings || {});
    // v3: only single WORDS are read aloud, and only when a speaker button is tapped
    if (s.settings.v !== 3) { s.settings.voice = true; s.settings.v = 3; }
    Object.values(s.players).forEach(migratePlayer);
    if (!s.current || !s.players[s.current]) s.current = Object.keys(s.players)[0] || null;
    this.state = s;
  },
  save() { clearTimeout(this._t); this._t = setTimeout(() => this.saveNow(), 120); },
  saveNow() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(this.state)); } catch (e) { /* storage full or blocked */ }
    try { if (typeof ClassNet !== 'undefined') ClassNet.push(); } catch (e) { }
  },
};
const S = () => DB.state.settings;
const P = () => (DB.state && DB.state.players[DB.state.current]) || null;

function blankGames() {
  const g = {};
  GAME_IDS.forEach(id => g[id] = { score: 0, best: 0, plays: 0, level: 1 });
  g.final = { best: 0, score: 0, plays: 0, last: null };
  return g;
}
function migratePlayer(p) {
  const d = {
    xp: 0, streak: { count: 0, last: null, best: 0 }, words: {}, mistakes: [], games: blankGames(),
    stats: { correct: 0, wrong: 0, bestCombo: 0, sentences: 0, circleWords: 0, circleLevels: 0, wordles: 0, wordleBest: 99, pairs: 0, fixed: 0, perfect: 0, speedMatch: 0, battles: 0, dailyAll: 0, games: 0, top1: 0 },
    topics: {}, daily: null, ach: {}, history: {}, recentQ: [], circleDone: [], connectDone: [],
    quest: { stage: 0, done: {} },
  };
  for (const k in d) if (p[k] === undefined) p[k] = d[k];
  for (const k in d.stats) if (p.stats[k] === undefined) p.stats[k] = d.stats[k];
  const bg = blankGames();
  for (const k in bg) p.games[k] = Object.assign(bg[k], p.games[k] || {});
  return p;
}
function createPlayer(name, avatar) {
  const p = migratePlayer({ id: 'p' + uid(), name: name.trim().slice(0, 18), avatar, created: Date.now() });
  DB.state.players[p.id] = p;
  DB.state.current = p.id;
  DB.saveNow();
  return p;
}
function switchPlayer(id) { if (DB.state.players[id]) { DB.state.current = id; DB.saveNow(); } }
function deletePlayer(id) {
  delete DB.state.players[id];
  DB.state.removed = [...(DB.state.removed || []), id]; // also remove from the class leaderboard
  if (DB.state.current === id) DB.state.current = Object.keys(DB.state.players)[0] || null;
  DB.saveNow();
}

/* ------------------------------ level & words ------------------------------ */
const LEVEL_TITLES = ['Newcomer', 'Newcomer', 'Explorer', 'Explorer', 'Learner', 'Learner', 'Scholar', 'Scholar', 'Scholar', 'Expert', 'Expert', 'Expert', 'Master', 'Master', 'Master', 'Champion', 'Champion', 'Champion', 'Champion', 'Legend'];
function xpNeeded(level) { return 120 + (level - 1) * 60; }
function levelInfo(xp) {
  let level = 1, rem = xp, need = xpNeeded(1);
  while (rem >= need) { rem -= need; level++; need = xpNeeded(level); }
  return { level, cur: rem, need, pct: rem / need, title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] };
}
function wstat(p, id) { return p.words[id] || (p.words[id] = { c: 0, w: 0 }); }
const isLearned = ws => !!ws && (ws.k || ws.c >= 2);
function learnedCount(p = P()) { return VOCAB.filter(w => isLearned(p.words[w.id])).length; }
/* weight: words with more mistakes appear more often (smart mistake system) */
function wordWeight(p, id) {
  const ws = p.words[id];
  if (!ws) return 1.6;
  return clamp(1 + ws.w * 1.6 - Math.min(ws.c, 5) * 0.18 + (ws.k ? -0.3 : 0), 0.35, 9);
}
function pickWords(pool, n, p = P()) { return weightedSample(pool, n, w => wordWeight(p, w.id)); }
function studyWord(id) {
  const p = P(); if (!p || !id) return;
  const ws = wstat(p, id);
  ensureDaily(p);
  if (!p.daily.words.includes(id)) { p.daily.words.push(id); dailyEvent('learn', 1); }
  ws.seen = (ws.seen || 0) + 1;
}

/* ------------------------------- daily stuff ------------------------------- */
function dayStat(field, n = 1) {
  const p = P(); const k = todayKey();
  const h = p.history[k] || (p.history[k] = { c: 0, w: 0, xp: 0 });
  h[field] = (h[field] || 0) + n;
}
function touchStreak() {
  const p = P(); const t = todayKey();
  if (p.streak.last === t) return;
  p.streak.count = p.streak.last === yesterdayKey() ? p.streak.count + 1 : 1;
  p.streak.last = t;
  p.streak.best = Math.max(p.streak.best, p.streak.count);
  if (p.streak.count > 1) setTimeout(() => toast(`${p.streak.count}-day streak! Keep it up!`, 'streak'), 400);
}
function currentStreak(p = P()) {
  if (!p.streak.last) return 0;
  return (p.streak.last === todayKey() || p.streak.last === yesterdayKey()) ? p.streak.count : 0;
}
function ensureDaily(p = P()) {
  const t = todayKey();
  if (p.daily && p.daily.date === t) return p.daily;
  const rng = seeded(hashStr(t + p.id));
  const ids = DAILY_TEMPLATES.map(d => d.id).sort(() => rng() - 0.5).slice(0, 4);
  p.daily = { date: t, ids, prog: {}, claimed: [], words: [], allDone: false };
  return p.daily;
}
function dailyEvent(event, amount = 1) {
  const p = P(); if (!p) return;
  const d = ensureDaily(p);
  d.ids.forEach(id => {
    const tpl = DAILY_TEMPLATES.find(x => x.id === id);
    if (!tpl || tpl.event !== event) return;
    const before = d.prog[id] || 0;
    if (before >= tpl.target) return;
    const now = tpl.max ? Math.max(before, amount) : before + amount;
    d.prog[id] = Math.min(now, tpl.target);
    if (d.prog[id] >= tpl.target) setTimeout(() => toast(`Daily challenge complete: ${tpl.title}`, 'daily'), 300);
  });
}
function dailyReadyCount(p = P()) {
  const d = ensureDaily(p);
  return d.ids.filter(id => { const t = DAILY_TEMPLATES.find(x => x.id === id); return (d.prog[id] || 0) >= t.target && !d.claimed.includes(id); }).length;
}

/* ------------------------------ achievements ------------------------------ */
const ACHIEVEMENTS = [
  { id: 'first_steps',  name: 'First Steps',        desc: 'Complete your first mini game',            icon: 'play',      color: '#22C55E', prog: p => [Math.min(p.stats.games, 1), 1] },
  { id: 'word_master',  name: 'Word Master',        desc: 'Learn 25 words',                           icon: 'book',      color: '#3B82F6', prog: p => [Math.min(learnedCount(p), 25), 25] },
  { id: 'vocab_expert', name: 'Vocabulary Expert',  desc: 'Learn 50 words',                           icon: 'graduation',color: '#6D5DFC', prog: p => [Math.min(learnedCount(p), 50), 50] },
  { id: 'perfect',      name: 'Perfect Score',      desc: 'Get 100% in an English Quiz',              icon: 'target',    color: '#F59E0B', prog: p => [Math.min(p.stats.perfect, 1), 1] },
  { id: 'champion',     name: 'English Champion',   desc: 'Pass the Final Exam with 80% or more',     icon: 'trophy',    color: '#EF4444', prog: p => [p.games.final.best >= 80 ? 1 : 0, 1] },
  { id: 'daily_hero',   name: 'Daily Hero',         desc: 'Complete all daily challenges in one day', icon: 'calendar',  color: '#EC4899', prog: p => [Math.min(p.stats.dailyAll, 1), 1] },
  { id: 'combo_king',   name: 'Combo King',         desc: 'Reach a 10x combo',                        icon: 'flame',     color: '#F97316', prog: p => [Math.min(p.stats.bestCombo, 10), 10] },
  { id: 'wordle_wiz',   name: 'Wordle Wizard',      desc: 'Solve a Wordle in 2 guesses or fewer',     icon: 'grid',      color: '#10B981', prog: p => [p.stats.wordleBest <= 2 ? 1 : 0, 1] },
  { id: 'circle_master',name: 'Circle Master',      desc: 'Complete 5 Word Circle levels',            icon: 'circle',    color: '#8B5CF6', prog: p => [Math.min(p.stats.circleLevels, 5), 5] },
  { id: 'architect',    name: 'Sentence Architect', desc: 'Build 20 correct sentences',               icon: 'blocks',    color: '#06B6D4', prog: p => [Math.min(p.stats.sentences, 20), 20] },
  { id: 'speed',        name: 'Speed Matcher',      desc: 'Clear a timed Word Match round with 20+ seconds left', icon: 'clock', color: '#DB2777', prog: p => [Math.min(p.stats.speedMatch, 1), 1] },
  { id: 'fixer',        name: 'Mistake Fixer',      desc: 'Fix 10 mistakes in review tests',          icon: 'wrench',    color: '#14B8A6', prog: p => [Math.min(p.stats.fixed, 10), 10] },
  { id: 'on_fire',      name: 'On Fire',            desc: 'Keep a 3-day streak',                      icon: 'flame',     color: '#EF4444', prog: p => [Math.min(p.streak.best, 3), 3] },
  { id: 'unstoppable',  name: 'Unstoppable',        desc: 'Keep a 7-day streak',                      icon: 'zap',       color: '#EAB308', prog: p => [Math.min(p.streak.best, 7), 7] },
  { id: 'explorer',     name: 'Game Explorer',      desc: `Play all ${GAME_IDS.length} mini games`,   icon: 'gamepad',   color: '#2563EB', prog: p => [GAME_IDS.filter(g => p.games[g].plays > 0).length, GAME_IDS.length] },
  { id: 'quester',      name: 'Quest Hero',         desc: 'Finish Chapter 1 of the Quest',            icon: 'flag',      color: '#0EA5E9', prog: p => [Math.min(p.quest.stage, QUEST_STEPS.length), QUEST_STEPS.length] },
  { id: 'xp_hunter',    name: 'XP Hunter',          desc: 'Earn 1,000 XP',                            icon: 'star',      color: '#CA8A04', prog: p => [Math.min(p.xp, 1000), 1000] },
  { id: 'top_class',    name: 'Top of the Class',   desc: 'Reach #1 on a leaderboard (2+ players)',   icon: 'crown',     color: '#D97706', prog: p => [Math.min(p.stats.top1, 1), 1] },
  { id: 'class_hero',   name: 'Class Hero',         desc: 'Play a Class Battle on the board',         icon: 'swords',    color: '#4F46E5', prog: p => [Math.min(p.stats.battles, 1), 1] },
];
function checkAchievements() {
  const p = P(); if (!p) return [];
  const got = [];
  ACHIEVEMENTS.forEach(a => {
    if (p.ach[a.id]) return;
    const [c, t] = a.prog(p);
    if (c >= t) { p.ach[a.id] = Date.now(); got.push(a); }
  });
  got.forEach((a, i) => setTimeout(() => { achievementToast(a); SFX.badge(); }, 700 + i * 1300));
  if (got.length) { addXP(got.length * 25, { quiet: true }); DB.save(); }
  return got;
}

/* --------------------------------- XP --------------------------------- */
let pendingLevelUp = null;
function addXP(n, opts = {}) {
  const p = P(); if (!p || n <= 0) return;
  const before = levelInfo(p.xp).level;
  p.xp += n;
  dayStat('xp', n);
  dailyEvent('xp', n);
  touchStreak();
  const after = levelInfo(p.xp).level;
  if (after > before) {
    pendingLevelUp = after;
    if (!Game.s && !opts.defer) setTimeout(flushLevelUp, 600);
  }
  updateHUD();
  DB.save();
}
function flushLevelUp() {
  if (!pendingLevelUp || Game.s) return;
  const lv = pendingLevelUp; pendingLevelUp = null;
  const info = levelInfo(P().xp);
  SFX.levelUp(); FX.rain();
  modal(`
    <div class="levelup">
      <div class="lu-burst"></div>
      <div class="lu-badge"><span>${lv}</span></div>
      <h2>Level Up!</h2>
      <p>You reached <b>Level ${lv}</b> — <b>${info.title}</b></p>
      <p class="muted small">New challenges unlocked. Keep going!</p>
      <button class="btn big" data-close>${icon('sparkles')} Awesome!</button>
    </div>`, { cls: 'center' });
}

/* ------------------------------- QUEST (continuity) -------------------------------
   An endless path: every chapter plays all games in order and ends with an exam.
   Difficulty grows chapter by chapter, so the game never "ends".            */
const QUEST_STEPS = ['connect', 'match', 'riddle', 'wordle', 'circle', 'sentence', 'quiz', 'final'];
function questStage(i) {
  const n = QUEST_STEPS.length;
  const chapter = Math.floor(i / n) + 1, step = i % n, game = QUEST_STEPS[step];
  const band = chapter <= 2 ? 'easy' : chapter <= 4 ? 'medium' : 'hard';
  return {
    index: i, chapter, step, game, band,
    connectLevel: ((chapter - 1) % 8) + 1,
    circleLevel: ((chapter - 1) % 16) + 1,
    matchMode: chapter === 1 ? 'relaxed' : 'timed',
  };
}
function questLabel(st) { return `Quest · Chapter ${st.chapter} · Stage ${st.step + 1}/${QUEST_STEPS.length}`; }
function questRoute(st) { return `play/${st.game}/quest`; }

/* -------------------------------- leaderboards -------------------------------- */
/* one player's leaderboard numbers (this is also what is sent to the class server) */
function playerSummary(p) {
  const scores = {};
  GAME_IDS.forEach(g => { scores[g] = Math.round((p.games[g] && p.games[g].score) || 0); });
  scores.final = Math.round(p.games.final.best || 0);
  return { id: p.id, name: p.name, avatar: p.avatar, created: p.created, xp: Math.round(p.xp), scores };
}
/* every leaderboard = players on this device + players of the class (other devices) */
function board(game) {
  const local = Object.values(DB.state.players).map(p => ({ s: playerSummary(p), remote: false }));
  const remote = ClassNet.remote.map(s => ({ s, remote: true }));
  return [...local, ...remote]
    .map(({ s, remote }) => ({ p: { id: s.id, name: s.name, avatar: s.avatar, created: s.created || 0, xp: s.xp || 0 }, v: game === 'overall' ? (s.xp || 0) : ((s.scores && s.scores[game]) || 0), remote }))
    .sort((a, b) => b.v - a.v || a.p.created - b.p.created)
    .map((x, i) => ({ ...x, rank: i + 1 }));
}

/* --------------------------- CLASS LEADERBOARD (shared) ---------------------------
   A computer that runs Baslat.bat (tools/serve.js) is the class score server.
   Every device on the same Wi-Fi sends its players' scores there and reads all the
   others, so phones, the smart board and computers share ONE leaderboard per game.
   No accounts and no internet service: the names stay inside the school network. */
const ClassNet = {
  connected: false, remote: [], info: null, lastSent: '', _t: 0, onChange: null,
  normalize(addr) {
    let a = String(addr || '').trim().replace(/\s+/g, '');
    if (!a) return '';
    if (!/^https?:\/\//i.test(a)) a = 'http://' + a;
    a = a.replace(/\/+$/, '');
    if (!/:\d+$/.test(a.replace(/^https?:\/\//i, ''))) a += ':5173';
    return a;
  },
  base() {
    if (S().classServer) return S().classServer;
    if (/^https?:$/.test(location.protocol) && location.port === '5173') return location.origin; // opened from the server itself
    return '';
  },
  async req(path, body, base = this.base()) {
    if (!base) throw new Error('no class server');
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = setTimeout(() => ctl && ctl.abort(), 4000);
    try {
      const r = await fetch(base + path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl && ctl.signal } : { signal: ctl && ctl.signal });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } finally { clearTimeout(timer); }
  },
  /* true only on the computer that runs the server (never inside the phone app) */
  isHost() {
    if (!this.connected || !this.info || !this.info.host || TARGET === 'app' || TARGET === 'phone') return false;
    return location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  },
  setRemote(list) {
    const local = new Set(Object.keys(DB.state.players));
    this.remote = (Array.isArray(list) ? list : []).filter(x => x && x.id && !local.has(x.id) && typeof x.name === 'string');
    if (this.onChange) this.onChange();
  },
  async test(addr) {
    const base = this.normalize(addr);
    const info = await this.req('/api/ping', null, base);
    if (!info || info.app !== 'english-quest') throw new Error('This address is not an English Quest class server');
    return { base, info };
  },
  async connect() {
    if (!this.base()) { this.connected = false; return false; }
    try {
      this.info = await this.req('/api/ping');
      this.connected = !!(this.info && this.info.app === 'english-quest');
    } catch (e) { this.connected = false; }
    if (this.connected) { this.lastSent = ''; await this.pushNow(); }
    return this.connected;
  },
  async pull() {
    if (!this.base()) return;
    try { const r = await this.req('/api/scores'); this.connected = true; this.setRemote(r.players); }
    catch (e) { this.connected = false; }
  },
  async pushNow() {
    if (!this.base()) return;
    const players = Object.values(DB.state.players).map(playerSummary);
    const key = JSON.stringify(players);
    try {
      const r = await this.req('/api/scores', { players, removed: DB.state.removed || [] });
      this.connected = true; this.lastSent = key; DB.state.removed = [];
      this.setRemote(r.players);
    } catch (e) { this.connected = false; }
  },
  /* called whenever progress is saved: sends only when a score really changed */
  push() {
    if (!this.base()) return;
    const key = JSON.stringify(Object.values(DB.state.players).map(playerSummary));
    if (key === this.lastSent) return;
    clearTimeout(this._t);
    this._t = setTimeout(() => this.pushNow(), 700);
  },
};
function rankOf(pid, game) { const b = board(game); const e = b.find(x => x.p.id === pid); return e ? e.rank : b.length + 1; }

/* -------------------------------- game session -------------------------------- */
const Game = {
  s: null,
  start(game, opts = {}) {
    this.s = { game, opts, score: 0, correct: 0, wrong: 0, combo: 0, maxCombo: 0, xp: 0, t0: Date.now(), wordsOk: new Set(), wordsBad: new Set(), topicsOk: {}, topicsBad: {}, wrongList: [] };
    return this.s;
  },
  /* correct answer → points, xp, combo, word stats */
  correct({ wordId = null, points = 100, el = null, topic = null } = {}) {
    const s = this.s, p = P(); if (!s || !p) return 0;
    s.correct++; s.combo++; s.maxCombo = Math.max(s.maxCombo, s.combo);
    const comboBonus = Math.min(s.combo - 1, 10) * 10;
    const pts = Math.round(points + comboBonus);
    const xp = 10 + Math.min((s.combo - 1) * 2, 10);
    s.score += pts; s.xp += xp;
    p.stats.correct++;
    p.stats.bestCombo = Math.max(p.stats.bestCombo, s.combo);
    dailyEvent('combo', s.combo);
    dayStat('c');
    if (wordId) { const ws = wstat(p, wordId); ws.c++; ws.last = Date.now(); s.wordsOk.add(wordId); studyWord(wordId); }
    if (topic) { const t = p.topics[topic] || (p.topics[topic] = { c: 0, w: 0 }); t.c++; s.topicsOk[topic] = (s.topicsOk[topic] || 0) + 1; }
    addXP(xp, { defer: true });
    if (el) FX.float(el, `+${pts}`, 'good');
    if (s.combo >= 3) FX.combo(s.combo);
    SFX.correct(); buzz(18);
    DB.save();
    return pts;
  },
  /* wrong answer → combo reset, mistake recorded (smart mistake system) */
  wrong({ wordId = null, topic = null, el = null, mistake = null, penalty = 0 } = {}) {
    const s = this.s, p = P(); if (!s || !p) return;
    s.wrong++; s.combo = 0;
    if (penalty) s.score = Math.max(0, s.score - penalty);
    p.stats.wrong++;
    dayStat('w');
    if (wordId) { const ws = wstat(p, wordId); ws.w++; ws.lastWrong = Date.now(); s.wordsBad.add(wordId); }
    if (topic) { const t = p.topics[topic] || (p.topics[topic] = { c: 0, w: 0 }); t.w++; s.topicsBad[topic] = (s.topicsBad[topic] || 0) + 1; }
    if (mistake) {
      const m = Object.assign({ id: uid(), game: s.game, t: Date.now(), wordId, topic, fixed: false }, mistake);
      p.mistakes.unshift(m);
      if (p.mistakes.length > 300) p.mistakes.length = 300;
      s.wrongList.push(m);
    }
    if (el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
    SFX.wrong(); buzz([30, 40, 30]);
    DB.save();
  },
  /* end of a session → save score, rank change, results */
  finish(extra = {}) {
    const s = this.s, p = P(); if (!s || !p) return null;
    const g = s.game;
    const rankBefore = rankOf(p.id, g === 'final' ? 'final' : g);
    const overallBefore = rankOf(p.id, 'overall');
    const total = s.correct + s.wrong;
    const accuracy = total ? Math.round((s.correct / total) * 100) : 0;
    let bonusXP = 20 + (accuracy >= 100 ? 20 : accuracy >= 80 ? 10 : 0);
    if (extra.bonusXP) bonusXP += extra.bonusXP;
    const rec = p.games[g];
    if (rec) {
      if (g === 'final') {
        rec.best = Math.max(rec.best, extra.percent || 0); rec.plays++; rec.last = extra.percent || 0;
        rec.score = Math.max(rec.score, s.score);
      } else {
        rec.score += s.score; rec.best = Math.max(rec.best, s.score); rec.plays++;
      }
    }
    if (GAME_IDS.includes(g)) { p.stats.games++; dailyEvent('game', 1); }
    s.bonusXP = bonusXP;
    addXP(bonusXP, { defer: true });
    const rankAfter = rankOf(p.id, g === 'final' ? 'final' : g);
    const overallAfter = rankOf(p.id, 'overall');
    if (board('overall').length > 1 && (rankAfter === 1 || overallAfter === 1)) p.stats.top1 = 1;
    const result = { game: g, score: s.score, correct: s.correct, wrong: s.wrong, accuracy, maxCombo: s.maxCombo, xp: s.xp + bonusXP, rankBefore, rankAfter, overallBefore, overallAfter, time: Math.round((Date.now() - s.t0) / 1000), session: s };
    this.s = null;
    DB.saveNow();
    return result;
  },
  abort() { this.s = null; DB.save(); },
};

/* ------------------------------- results screen ------------------------------- */
function showResults(el, r, opts = {}) {
  const meta = GAME_META[r.game] || GAME_META.quiz;
  const stars = opts.stars != null ? opts.stars : (r.accuracy >= 90 ? 3 : r.accuracy >= 65 ? 2 : r.accuracy > 0 ? 1 : 0);
  const players = board(r.game).length;
  const rankMoved = r.rankBefore - r.rankAfter;
  const title = opts.title || (stars === 3 ? 'Amazing!' : stars === 2 ? 'Great job!' : stars === 1 ? 'Good effort!' : 'Keep practising!');
  el.innerHTML = `
  <div class="results" style="--gc:${meta.color};--gd:${meta.dark};--gl:${meta.light}">
    <div class="res-top">
      <div class="res-rays"></div>
      <div class="res-mascot">${avatarSVG(P().avatar)}</div>
      <div class="res-stars">${[1, 2, 3].map(i => `<span class="rstar ${i <= stars ? 'on' : ''}" style="--d:${i * 0.18 + 0.3}s">${icon('star')}</span>`).join('')}</div>
      <h1 class="res-title">${esc(title)}</h1>
      <p class="res-sub">${esc(opts.subtitle || meta.name + ' complete')}</p>
    </div>
    <div class="res-score">
      <div class="lbl">Score</div>
      <div class="val" data-count="${r.score}">0</div>
    </div>
    <div class="res-grid">
      <div class="res-box"><span class="ib good">${icon('check')}</span><b data-count="${r.correct}">0</b><small>Correct</small></div>
      <div class="res-box"><span class="ib bad">${icon('x')}</span><b data-count="${r.wrong}">0</b><small>Wrong</small></div>
      <div class="res-box"><span class="ib xp">${icon('zap')}</span><b>+<span data-count="${r.xp}">0</span></b><small>XP earned</small></div>
      <div class="res-box"><span class="ib fire">${icon('flame')}</span><b data-count="${r.maxCombo}">0</b><small>Best combo</small></div>
    </div>
    <div class="res-rank ${rankMoved > 0 ? 'up' : ''}" ${opts.noRank ? 'hidden' : ''}>
      <span class="rr-icon">${icon('trophy')}</span>
      <div class="rr-text">
        <b>${players > 1 ? `Rank #${r.rankAfter} of ${players}` : 'You lead the board!'}</b>
        <small>${meta.name} ${ClassNet.connected ? 'class ' : ''}leaderboard${rankMoved > 0 ? ` · climbed ${rankMoved} place${rankMoved > 1 ? 's' : ''}!` : ''}</small>
      </div>
      ${rankMoved > 0 ? `<span class="rr-up">${icon('next')}</span>` : ''}
    </div>
    ${opts.extraHTML || ''}
    <div class="res-actions">
      ${(opts.actions || []).map((a, i) => `<button class="btn ${a.ghost ? 'ghost' : ''} ${a.big ? 'big' : ''}" data-act="${i}" style="${a.ghost ? '' : `--c:${meta.color};--cd:${meta.dark}`}">${a.icon ? icon(a.icon) : ''}${esc(a.label)}</button>`).join('')}
    </div>
  </div>`;
  (opts.actions || []).forEach((a, i) => { const b = $(`[data-act="${i}"]`, el); if (b) b.onclick = a.onClick; });
  $$('[data-count]', el).forEach(n => countUp(n, +n.dataset.count, 900));
  setTimeout(() => {
    if (stars >= 2) { FX.confetti({ count: stars === 3 ? 160 : 90 }); SFX.win(); } else SFX.done();
  }, 350);
  setTimeout(() => { checkAchievements(); updateHUD(); }, 900);
  setTimeout(flushLevelUp, stars >= 2 ? 1900 : 1200);
}
function countUp(node, to, dur = 800) {
  if (!S().motion) { node.textContent = fmt(to); return; }
  const t0 = performance.now();
  const step = t => { const k = clamp((t - t0) / dur, 0, 1); const e = 1 - Math.pow(1 - k, 3); node.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
  setTimeout(() => { node.textContent = fmt(to); }, dur + 150); // always end on the exact value
}

/* ---------------------------------- audio ---------------------------------- */
const SFX = {
  ctx: null,
  ensure() {
    if (!S().sound) return null;
    try {
      if (!this.ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; this.ctx = new AC(); }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) { return null; }
    return this.ctx;
  },
  tone(freq, dur = 0.12, type = 'sine', vol = 0.14, delay = 0, slideTo = null) {
    const ctx = this.ensure(); if (!ctx) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + dur + 0.05);
  },
  /* short filtered noise burst → a crisp "tak" click */
  click(vol = 0.22, freq = 2400, dur = 0.035, delay = 0) {
    const ctx = this.ensure(); if (!ctx) return;
    if (!this.noise) {
      const len = Math.floor(ctx.sampleRate * 0.08);
      this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = this.noise; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.4;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(ctx.destination);
    src.start(t); src.stop(t + dur + 0.02);
  },
  tap() { this.click(0.25, 2600); this.tone(620, 0.04, 'triangle', 0.05); },
  pop(i = 0) { this.click(0.2, 1800 + i * 120); this.tone(392 * Math.pow(2, (i * 2) / 12), 0.09, 'triangle', 0.12); },
  flip() { this.click(0.18, 1500, 0.05); this.tone(330, 0.05, 'triangle', 0.04); },
  correct() { this.tone(659, 0.1, 'triangle', 0.13); this.tone(880, 0.12, 'triangle', 0.13, 0.08); this.tone(1319, 0.2, 'sine', 0.09, 0.16); },
  wrong() { this.tone(240, 0.16, 'sawtooth', 0.05, 0, 170); this.tone(170, 0.22, 'square', 0.04, 0.1, 120); },
  coin() { this.tone(988, 0.07, 'square', 0.05); this.tone(1319, 0.16, 'square', 0.05, 0.07); },
  win() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.12, i * 0.1)); this.tone(1568, 0.4, 'sine', 0.08, 0.42); },
  done() { [523, 659, 784].forEach((f, i) => this.tone(f, 0.16, 'triangle', 0.1, i * 0.1)); },
  levelUp() { [392, 523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.16, 'triangle', 0.12, i * 0.08)); },
  badge() { [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, 0.14, 'sine', 0.1, i * 0.07)); },
  tick() { this.click(0.3, 3200, 0.03); this.tone(1200, 0.03, 'square', 0.025); },
  whoosh() { this.tone(300, 0.18, 'sine', 0.05, 0, 900); },
};
function buzz(p) {
  try {
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
    if (navigator.vibrate && S().sound) navigator.vibrate(p);
  } catch (e) { }
}

/* ---------------------------------- speech ---------------------------------- */
/* build target: 'board' (PC / smart board file), 'phone' (phone file), 'app' (Android app) or 'web' */
const TARGET = window.EQ_TARGET || 'web';
const Speech = {
  voices: [],
  supported: typeof window !== 'undefined' && (!!window.AndroidTTS || 'speechSynthesis' in window),
  init() {
    if (!this.supported || !('speechSynthesis' in window)) return;
    const load = () => { this.voices = speechSynthesis.getVoices() || []; };
    load();
    try { speechSynthesis.addEventListener('voiceschanged', load); } catch (e) { speechSynthesis.onvoiceschanged = load; }
  },
  /* the voice chosen by the student (falls back to the best English voice) */
  voice() {
    const v = this.voices;
    const norm = x => (x.lang || '').replace('_', '-');
    if (S().voiceId) { const chosen = v.find(x => (x.voiceURI || x.name) === S().voiceId); if (chosen) return chosen; }
    const want = S().accent === 'uk' ? 'en-GB' : 'en-US';
    return v.find(x => norm(x) === want && /natural|online|google/i.test(x.name))
      || v.find(x => norm(x) === want)
      || v.find(x => norm(x).startsWith('en') && /natural|online|google/i.test(x.name))
      || v.find(x => norm(x).startsWith('en')) || null;
  },
  /* English voices on this device → [{id, label, lang}] (waits a little for them to load) */
  async list() {
    const accent = lang => ({ 'en-US': 'American', 'en-GB': 'British', 'en-AU': 'Australian', 'en-IN': 'Indian', 'en-CA': 'Canadian', 'en-IE': 'Irish', 'en-ZA': 'South African', 'en-NZ': 'New Zealand' }[lang] || 'English');
    const rank = lang => (lang === 'en-US' ? 0 : lang === 'en-GB' ? 1 : 2);
    let raw = [];
    if (window.AndroidTTS) {
      for (let i = 0; i < 30; i++) {
        try { raw = JSON.parse(window.AndroidTTS.voices() || '[]'); } catch (e) { raw = []; }
        if (raw.length || (window.AndroidTTS.ready && window.AndroidTTS.ready() && i > 3)) break;
        await sleep(150);
      }
      raw = raw.map(v => ({ id: v.name, lang: String(v.lang || '').replace('_', '-'), name: '' }));
    } else if ('speechSynthesis' in window) {
      for (let i = 0; i < 20 && !speechSynthesis.getVoices().length; i++) await sleep(100);
      this.voices = speechSynthesis.getVoices() || [];
      raw = this.voices.filter(v => /^en/i.test(v.lang)).map(v => ({ id: v.voiceURI || v.name, lang: v.lang.replace('_', '-'), name: v.name.replace(/^(Microsoft|Google)\s+/i, '').replace(/\s*-\s*English.*$/i, '').replace(/\s*\(.*\)$/, '').trim() }));
    }
    raw.sort((a, b) => rank(a.lang) - rank(b.lang) || a.lang.localeCompare(b.lang));
    const counts = {};
    return raw.slice(0, 12).map(v => {
      counts[v.lang] = (counts[v.lang] || 0) + 1;
      const a = accent(v.lang);
      return { id: v.id, lang: v.lang, label: v.name && !/^[a-z]{2}-[a-z]{2}-x-/i.test(v.name) ? `${v.name} · ${a}` : `${a} voice ${counts[v.lang]}` };
    });
  },
  say(text, btn) {
    if (!S().voice) { toast('Voice is turned off in Settings', 'info'); return; }
    if (!this.supported) { toast('Audio pronunciation is not supported on this device', 'info'); return; }
    const clean = String(text).replace(/\s*\(.*?\)\s*/g, ' ').trim();
    if (window.AndroidTTS) { // Android app: the phone's own text-to-speech
      let ok = false;
      try { ok = window.AndroidTTS.speak(clean, S().rate || 0.9, S().accent === 'uk' ? 'en-GB' : 'en-US', S().voiceId || ''); } catch (e) { }
      if (!ok) { toast('Ses için telefonda "Google Konuşma Hizmetleri" gerekli', 'info'); return; }
      if (btn) { btn.classList.add('speaking'); setTimeout(() => btn.classList.remove('speaking'), 1400); }
      return;
    }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      const v = this.voice();
      if (v) u.voice = v;
      u.lang = v ? v.lang : (S().accent === 'uk' ? 'en-GB' : 'en-US');
      u.rate = S().rate || 0.9; u.pitch = 1;
      if (btn) { btn.classList.add('speaking'); u.onend = u.onerror = () => btn.classList.remove('speaking'); setTimeout(() => btn.classList.remove('speaking'), 6000); }
      speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  },
};

/* voice picker (shown after the name on first start, and from Settings) */
async function voicePicker(box, { onDone, doneLabel = 'Continue' } = {}) {
  box.innerHTML = `<div class="vp-loading">${icon('headphones')} Looking for English voices…</div>`;
  const list = Speech.supported ? await Speech.list() : [];
  const s = S();
  let sel = s.voice ? (s.voiceId && list.find(v => v.id === s.voiceId) ? s.voiceId : (list[0] && list[0].id) || '') : 'off';
  const draw = () => {
    box.innerHTML = `
      <div class="vp-list">
        ${list.length ? list.map(v => `<div class="vp-item ${sel === v.id ? 'sel' : ''}" data-v="${esc(v.id)}">
            <span class="vp-radio"></span><span class="vp-name">${esc(v.label)}</span>
            <button class="speak" data-test="${esc(v.id)}" aria-label="Test this voice">${icon('volume')}</button></div>`).join('')
          : `<div class="tip">${icon('info')}<span>No English voice was found on this device. On Android phones install <b>"Google Konuşma Hizmetleri" (Speech Services by Google)</b> from the Play Store, then choose a voice in Settings.</span></div>`}
        <div class="vp-item ${sel === 'off' ? 'sel' : ''}" data-v="off"><span class="vp-radio"></span><span class="vp-name">No voice — sound effects only</span></div>
      </div>
      <div class="vp-speed"><b>Speed</b><div class="seg">${[['Slow', 0.7], ['Normal', 0.9], ['Fast', 1.1]].map(([n, r]) => `<button data-rate="${r}" class="${Math.abs((s.rate || 0.9) - r) < 0.06 ? 'active' : ''}">${n}</button>`).join('')}</div></div>
      <button class="btn big block" data-vdone>${icon('check')} ${esc(doneLabel)}</button>`;
    $$('.vp-item', box).forEach(it => it.onclick = e => {
      if (e.target.closest('[data-test]')) return;
      sel = it.dataset.v; SFX.tap(); draw();
      if (sel !== 'off') test(sel);
    });
    $$('[data-test]', box).forEach(b => b.onclick = () => { sel = b.dataset.test; draw(); test(sel); });
    $$('[data-rate]', box).forEach(b => b.onclick = () => { s.rate = +b.dataset.rate; DB.save(); draw(); if (sel !== 'off') test(sel); });
    $('[data-vdone]', box).onclick = () => {
      s.voice = sel !== 'off'; s.voiceId = sel !== 'off' ? sel : (s.voiceId || '');
      const v = list.find(x => x.id === sel); if (v) s.accent = v.lang === 'en-GB' ? 'uk' : 'us';
      s.voiceChosen = true; DB.saveNow();
      document.body.classList.toggle('no-voice', !s.voice);
      SFX.correct(); onDone && onDone();
    };
  };
  const test = id => {          // plays one sample word with this voice
    const wasOn = s.voice;
    s.voice = true; s.voiceId = id;
    Speech.say('school');
    s.voice = wasOn;
  };
  draw();
}
/* speaker buttons are only for WORDS (no sentences are read aloud) */
function speakBtn(text, cls = '') {
  const t = String(text || '').trim();
  if (!t || /[.!?]$/.test(t) || t.split(/\s+/).length > 7) return '';
  return `<button class="speak ${cls}" data-say="${esc(t)}" aria-label="Listen to the word" title="Listen">${icon('volume')}</button>`;
}

/* --------------------------------- effects --------------------------------- */
const FX = {
  cv: null, ctx: null, parts: [], raf: 0,
  init() {
    this.cv = $('#fx'); this.ctx = this.cv.getContext('2d');
    const rs = () => { const d = Math.min(window.devicePixelRatio || 1, 2); this.cv.width = innerWidth * d; this.cv.height = innerHeight * d; this.ctx.setTransform(d, 0, 0, d, 0, 0); };
    rs(); addEventListener('resize', rs);
  },
  colors: ['#6D5DFC', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#06B6D4', '#F43F5E', '#FACC15'],
  confetti({ x = innerWidth / 2, y = innerHeight * 0.35, count = 120, spread = 1 } = {}) {
    if (!S().motion) return;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, sp = (4 + Math.random() * 9) * spread;
      this.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 6, g: 0.28, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, w: 6 + Math.random() * 7, h: 4 + Math.random() * 6, c: pick(this.colors), life: 120 + Math.random() * 60, shape: Math.random() < 0.25 ? 'c' : 'r' });
    }
    this.run();
  },
  rain() {
    if (!S().motion) return;
    for (let i = 0; i < 160; i++) this.parts.push({ x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.6, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3, g: 0.05, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, w: 7 + Math.random() * 6, h: 5 + Math.random() * 5, c: pick(this.colors), life: 260, shape: Math.random() < 0.3 ? 'c' : 'r' });
    this.run();
  },
  burst(el, count = 26) {
    if (!el || !S().motion) return;
    const r = el.getBoundingClientRect();
    this.confetti({ x: r.left + r.width / 2, y: r.top + r.height / 2, count, spread: 0.55 });
  },
  run() {
    if (this.raf) return;
    const tick = () => {
      const c = this.ctx; c.clearRect(0, 0, innerWidth, innerHeight);
      this.parts = this.parts.filter(p => p.life > 0 && p.y < innerHeight + 40);
      for (const p of this.parts) {
        p.vx *= 0.985; p.vy = p.vy * 0.985 + p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.globalAlpha = Math.min(1, p.life / 40); c.fillStyle = p.c;
        if (p.shape === 'c') { c.beginPath(); c.arc(0, 0, p.w / 2.4, 0, Math.PI * 2); c.fill(); } else c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 2)) + 1);
        c.restore();
      }
      if (this.parts.length) this.raf = requestAnimationFrame(tick); else { this.raf = 0; c.clearRect(0, 0, innerWidth, innerHeight); }
    };
    this.raf = requestAnimationFrame(tick);
  },
  float(el, text, kind = 'good') {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const n = document.createElement('div');
    n.className = `float-txt ${kind}`; n.textContent = text;
    n.style.left = (r.left + r.width / 2) + 'px'; n.style.top = (r.top + r.height / 2) + 'px';
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 1200);
  },
  combo(n) {
    const old = $('.combo-pop'); if (old) old.remove();
    const d = document.createElement('div');
    d.className = 'combo-pop';
    d.innerHTML = `${icon('flame')}<b>${n}x</b><span>COMBO!</span>`;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1300);
  },
};

/* ----------------------------------- UI ----------------------------------- */
function toast(msg, kind = 'info', ms = 2600) {
  const root = $('#toasts');
  const ic = { info: 'info', good: 'check', bad: 'x', streak: 'flame', daily: 'calendar', xp: 'zap' }[kind] || 'info';
  const t = document.createElement('div');
  t.className = `toast t-${kind}`;
  t.innerHTML = `<span class="t-ic">${icon(ic)}</span><span>${esc(msg)}</span>`;
  root.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, ms);
}
function achievementToast(a) {
  const root = $('#toasts');
  const t = document.createElement('div');
  t.className = 'toast t-ach';
  t.innerHTML = `<span class="ach-medal" style="--ac:${a.color}">${icon(a.icon)}</span><span><small>Achievement unlocked!</small><b>${esc(a.name)}</b></span><span class="ach-xp">+25 XP</span>`;
  t.onclick = () => Router.go('achievements');
  root.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 3800);
}
function modal(html, { cls = '', onClose = null, dismissable = true } = {}) {
  const root = $('#modal-root');
  const m = document.createElement('div');
  m.className = 'modal-wrap';
  m.innerHTML = `<div class="modal ${cls}">${html}</div>`;
  const close = () => { m.classList.add('out'); setTimeout(() => m.remove(), 280); if (onClose) onClose(); };
  m.addEventListener('click', e => {
    if (e.target === m && dismissable) close();
    if (e.target.closest('[data-close]')) close();
  });
  root.appendChild(m);
  return { el: m, close };
}
function confirmBox(title, text, okLabel = 'Yes', danger = false) {
  return new Promise(res => {
    const m = modal(`<div class="confirm"><h3>${esc(title)}</h3><p>${esc(text)}</p>
      <div class="row gap"><button class="btn ghost" data-no>Cancel</button><button class="btn ${danger ? 'danger' : ''}" data-yes>${esc(okLabel)}</button></div></div>`,
      { cls: 'center', onClose: () => res(false) });
    $('[data-yes]', m.el).onclick = () => { res(true); m.el.remove(); };
    $('[data-no]', m.el).onclick = () => { res(false); m.el.remove(); };
  });
}
function wordCardHTML(w, opts = {}) {
  if (!w) return '';
  const cat = CATEGORIES.find(c => c.id === w.cat) || CATEGORIES[0];
  return `<div class="wcard ${opts.cls || ''}" style="--cc:${cat.color}">
    <div class="wc-head">
      <div><span class="lbl">English</span><div class="wc-en">${esc(w.en)}</div></div>
      ${speakBtn(w.en, 'lg')}
    </div>
    <div class="wc-tr"><span class="lbl">Türkçe anlamı</span>${esc(w.tr)}</div>
    ${w.ex ? `<div class="wc-ex"><span class="lbl">Example</span><div class="en"><span>${esc(w.ex)}</span></div>${w.exTr ? `<div class="tr">${esc(w.exTr)}</div>` : ''}</div>` : ''}
  </div>`;
}

/* HUD numbers on home/nav */
function updateHUD() {
  const p = P(); if (!p) return;
  $$('[data-hud="xp"]').forEach(n => n.textContent = fmt(p.xp));
  $$('[data-hud="streak"]').forEach(n => n.textContent = currentStreak(p));
  $$('[data-hud="level"]').forEach(n => n.textContent = levelInfo(p.xp).level);
  const dot = $('#nav-daily-dot'); if (dot) dot.hidden = !dailyReadyCount(p);
}

/* -------------------------------- pointer drag -------------------------------- */
/* Unified mouse/touch/pen drag helper. Calls onTap if the pointer barely moved. */
function makeDraggable(el, { onStart, onMove, onDrop, onTap, ghost = true, threshold = 8 } = {}) {
  el.addEventListener('pointerdown', e => {
    if (e.button !== undefined && e.button !== 0) return;
    const sx = e.clientX, sy = e.clientY;
    let dragging = false, g = null, ox = 0, oy = 0;
    const id = e.pointerId;
    const move = ev => {
      if (ev.pointerId !== id) return;
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!dragging && Math.hypot(dx, dy) > threshold) {
        dragging = true;
        if (ghost) {
          const r = el.getBoundingClientRect();
          ox = sx - r.left; oy = sy - r.top;
          g = el.cloneNode(true);
          g.classList.add('drag-ghost');
          g.style.width = r.width + 'px'; g.style.height = r.height + 'px';
          document.body.appendChild(g);
          el.classList.add('drag-src');
        }
        onStart && onStart(ev);
      }
      if (dragging) {
        ev.preventDefault();
        if (g) { g.style.left = (ev.clientX - ox) + 'px'; g.style.top = (ev.clientY - oy) + 'px'; }
        onMove && onMove(ev, under(ev));
      }
    };
    const under = ev => {
      if (g) g.style.display = 'none';
      const t = document.elementFromPoint(ev.clientX, ev.clientY);
      if (g) g.style.display = '';
      return t;
    };
    const up = ev => {
      if (ev.pointerId !== id) return;
      removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
      el.classList.remove('drag-src');
      if (dragging) { const t = ev.type === 'pointercancel' ? null : under(ev); if (g) g.remove(); onDrop && onDrop(ev, t); }
      else if (ev.type !== 'pointercancel') onTap && onTap(ev);
    };
    addEventListener('pointermove', move, { passive: false });
    addEventListener('pointerup', up); addEventListener('pointercancel', up);
  });
}

/* ---------------------------------- router ---------------------------------- */
const Router = {
  routes: {},
  cleanup: null,
  current: '',
  go(path) { if (location.hash === '#/' + path) this.render(); else location.hash = '#/' + path; },
  start() { addEventListener('hashchange', () => this.render()); this.render(); },
  render() {
    const hash = decodeURIComponent(location.hash.replace(/^#\/?/, '')) || 'home';
    const [name, ...args] = hash.split('/');
    if (!P() && name !== 'welcome') { location.replace('#/welcome'); return; }
    const route = this.routes[name] || this.routes.home;
    if (this.cleanup) { try { this.cleanup(); } catch (e) { } this.cleanup = null; }
    if (Game.s && !route.game) Game.abort();
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { }
    $$('.drag-ghost, .sheet, .found-toast').forEach(n => n.remove());
    Keys.fn = null;
    const view = $('#view');
    $$('#view > .screen:not(.leaving)').forEach(old => { old.classList.add('leaving'); setTimeout(() => old.remove(), 260); });
    const scr = document.createElement('div');
    scr.className = 'screen ' + (route.game ? 'is-game' : 'is-page') + ' scr-' + name;
    document.body.classList.toggle('in-game', !!route.game);
    document.body.classList.toggle('in-welcome', name === 'welcome');
    view.appendChild(scr);
    view.scrollTop = 0; window.scrollTo(0, 0);
    this.current = name;
    $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.nav === (route.nav || name)));
    const res = route.render(scr, args);
    if (typeof res === 'function') this.cleanup = res;
    updateHUD();
  },
};

/* ------------------------------ global handlers ------------------------------ */
/* one keyboard handler per game screen (physical keyboards on boards/desktops) */
const Keys = { fn: null };
document.addEventListener('keydown', e => {
  if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
  const sh = $('.sheet.show');
  if (sh) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const n = $('.next', sh); if (n) n.click(); } return; }
  if ($('.modal-wrap')) return;
  if (Keys.fn) Keys.fn(e);
});
document.addEventListener('click', e => {
  const say = e.target.closest('[data-say]');
  if (say) { e.stopPropagation(); Speech.say(say.dataset.say, say); return; }
  const go = e.target.closest('[data-go]');
  if (go) { SFX.tap(); Router.go(go.dataset.go); }
});
document.addEventListener('pointerdown', () => SFX.ensure(), { once: true });

/* =========================================================================
   ENGLISH QUEST — shared game helpers (route, top bar, start screen,
   feedback sheet, multiple-choice renderer)
   ========================================================================= */
'use strict';
const GAMES = {};
let GameBack = 'games';

Router.routes.play = {
  game: true,
  render(el, args) {
    const g = args[0];
    const fn = GAMES[g];
    if (!fn) { setTimeout(() => Router.go('games')); return; }
    const m = GAME_META[g];
    GameBack = args.includes('quest') ? 'quest' : 'games';   // the back button returns to where the game was opened
    el.style.setProperty('--gc', m.color); el.style.setProperty('--gd', m.dark);
    el.style.setProperty('--gl', m.light); el.style.setProperty('--gg', m.grad);
    return fn(el, args.slice(1));
  },
};

/* ------------------------------ quest helpers ------------------------------ */
function questFor(game, args) {
  if (!args || args[0] !== 'quest') return null;
  const st = questStage(P().quest.stage);
  return st.game === game ? st : null;
}
/* marks the current quest stage as done and returns the "continue" buttons */
function questDone(Q, stars = 1) {
  const p = P();
  if (Q && p.quest.stage === Q.index) {
    p.quest.done[Q.index] = Math.max(stars, p.quest.done[Q.index] || 0);
    p.quest.stage = Q.index + 1;
    DB.save();
  }
  const next = questStage(p.quest.stage);
  return [
    { label: `Continue · ${next.game === 'final' ? 'Exam ' + next.chapter : GAME_META[next.game].name}`, icon: 'next', big: true, onClick: () => Router.go(questRoute(next)) },
    { label: 'Quest map', icon: 'map', ghost: true, onClick: () => Router.go('quest') },
  ];
}

function gameTop(g, sub = '', right = '') {
  const m = GAME_META[g];
  return `<div class="g-top">
    <button class="icon-btn" data-back aria-label="Back">${icon('back')}</button>
    <div class="g-title"><b>${m.name}</b><small>${sub}</small></div>
    ${right}
  </div>`;
}
function scorePill(v = 0, ic = 'star') { return `<span class="score-pill" data-score>${icon(ic)}<span>${fmt(v)}</span></span>`; }
function setScore(el, v) {
  const pill = $('[data-score]', el); if (!pill) return;
  $('span', pill).textContent = fmt(v);
  pill.classList.remove('bump'); void pill.offsetWidth; pill.classList.add('bump');
}
function bindBack(el, { ask = false, to = GameBack } = {}) {
  const b = $('[data-back]', el); if (!b) return;
  b.onclick = async () => {
    if (ask && Game.s && (Game.s.correct + Game.s.wrong) > 0) {
      if (!(await confirmBox('Leave the game?', 'Your progress in this round will be lost.', 'Leave'))) return;
    }
    Router.go(to);
  };
}
function stepsHTML(n, cur) { return `<div class="g-steps">${[...Array(n)].map((_, i) => `<i class="${i < cur ? 'done' : i === cur ? 'cur' : ''}"></i>`).join('')}</div>`; }

function startScreen(el, g, { desc, how = [], extra = '', btn = 'Start', onStart, onBind, hideStart = false }) {
  const m = GAME_META[g];
  el.innerHTML = gameTop(g, m.sub) + `
    <div class="g-start">
      <div class="gs-art">${gameArt(g === 'review' ? 'quiz' : g)}</div>
      <h1>${m.name}</h1>
      <p>${desc}</p>
      ${how.length ? `<div class="how">${how.map((h, i) => `<div><span class="n">${i + 1}</span><span>${h}</span></div>`).join('')}</div>` : ''}
      ${extra}
      ${hideStart ? '' : `<button class="btn big" data-startgame style="--c:${m.color};--cd:${m.dark}">${icon('play')} ${btn}</button>`}
    </div>`;
  bindBack(el);
  if (onBind) onBind(el);
  const s = $('[data-startgame]', el);
  if (s) s.onclick = () => { SFX.whoosh(); onStart(); };
  Keys.fn = e => { if (e.key === 'Enter' && s) s.click(); };
}

/* bottom feedback sheet */
function showSheet({ good, title, body = '', btn = 'Continue', onNext }) {
  $$('.sheet').forEach(n => n.remove());
  const d = document.createElement('div');
  d.className = `sheet ${good ? 'good' : 'bad'}`;
  d.innerHTML = `<div class="sh-head"><span class="sh-ic">${icon(good ? 'check' : 'x')}</span><h3>${esc(title)}</h3></div>
    <div class="sh-body">${body}</div>
    <button class="btn big next">${esc(btn)} ${icon('next')}</button>`;
  document.body.appendChild(d);
  void d.offsetWidth;
  setTimeout(() => d.classList.add('show'), 20);
  $('.next', d).onclick = () => { SFX.tap(); closeSheet(); onNext && onNext(); };
  return d;
}
function closeSheet() { $$('.sheet').forEach(s => { s.classList.remove('show'); setTimeout(() => s.remove(), 450); }); }

const GOOD_WORDS = ['Correct!', 'Excellent!', 'Well done!', 'Perfect!', 'Great job!', 'Brilliant!', 'Nice one!'];
const BAD_WORDS = ['Not quite', 'Almost!', 'Oops!', 'Keep trying!'];

/* multiple choice block (quiz, review, final exam, class battle) */
function mcqHTML(q, { chips = true, label = null } = {}) {
  const opts = shuffle(q.options);
  const long = opts.some(o => o.length > 32);
  const qText = esc(q.q).replace(/_{3,}/g, '<span class="blank"></span>');
  return {
    opts,
    html: `<div class="qz-card">
      ${chips ? `<div class="qz-meta"><span class="chip c" style="--cc:var(--gc)">${esc(label || QUESTION_TYPES[q.type] || '')}</span>${TOPICS[q.topic] ? `<span class="chip">${esc(TOPICS[q.topic])}</span>` : ''}</div>` : ''}
      <div class="qz-q">${qText}</div>
    </div>
    <div class="qz-opts" style="${long ? 'grid-template-columns:1fr' : ''}">${opts.map((o, i) => `<button class="opt" data-i="${i}" style="--i:${i}"><span class="ol">${'ABCD'[i]}</span><span>${esc(o)}</span></button>`).join('')}</div>`,
  };
}
function bindMCQ(el, opts, answer, onPick) {
  let done = false;
  const pickBtn = b => {
    if (done || b.disabled) return; done = true;
    const picked = opts[+b.dataset.i];
    const ok = picked === answer;
    $$('.opt', el).forEach(x => {
      x.disabled = true;
      const o = opts[+x.dataset.i];
      if (o === answer) x.classList.add('ok');
      else if (x === b) x.classList.add('no');
      else x.classList.add('dim');
    });
    Keys.fn = null;
    onPick(ok, picked, b);
  };
  $$('.opt', el).forEach(b => b.onclick = () => pickBtn(b));
  Keys.fn = e => {
    const k = e.key.toUpperCase();
    const idx = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'ABCD'.indexOf(k);
    if (idx >= 0) { const b = $(`.opt[data-i="${idx}"]`, el); if (b) pickBtn(b); }
  };
}
/* distractor meanings for "what does X mean" questions */
function meaningQuestion(w, { reverse = false } = {}) {
  const same = VOCAB.filter(x => x.id !== w.id && x.tr.split(',')[0] !== w.tr.split(',')[0]);
  const others = shuffle(same).slice(0, 3);
  if (reverse) return { q: `Which English word means '${w.tr}'?`, options: [w.en, ...others.map(o => o.en)], answer: w.en };
  return { q: `What does '${w.en}' mean?`, options: [w.tr, ...others.map(o => o.tr)], answer: w.tr };
}
/* fit a size so that items wrap into a box (used by letter games) */
function fitSize(W, H, lengths, { max = 56, min = 18, gapX = 16, gapY = 8, pad = 4 } = {}) {
  for (let bs = max; bs >= min; bs--) {
    let rows = 1, rw = 0;
    for (const len of lengths) {
      const ww = len * (bs + 4) + pad * 2;
      if (rw > 0 && rw + gapX + ww > W) { rows++; rw = ww; } else rw += (rw > 0 ? gapX : 0) + ww;
      if (ww > W) { rows = 999; break; }
    }
    if (rows * (bs + pad * 2 + gapY) <= H) return bs;
  }
  return min;
}

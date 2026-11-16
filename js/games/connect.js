/* =========================================================================
   GAME 1 — WORD CONNECT · Letter Connection Puzzle
   Drag (or tap) scrambled letters into the slots to build the English word.
   ========================================================================= */
'use strict';
const CONNECT_LEVELS = [
  { min: 4, max: 4, decoys: 0, name: 'Warm-up' },
  { min: 5, max: 5, decoys: 0, name: 'Easy' },
  { min: 6, max: 6, decoys: 0, name: 'Easy+' },
  { min: 7, max: 7, decoys: 0, name: 'Medium' },
  { min: 7, max: 8, decoys: 1, name: 'Medium+' },
  { min: 8, max: 9, decoys: 1, name: 'Hard' },
  { min: 9, max: 10, decoys: 2, name: 'Expert' },
  { min: 10, max: 13, decoys: 2, name: 'Master' },
];
const WORDS_PER_LEVEL = 5;
const TILE_COLORS = ['#3B82F6', '#6366F1', '#0EA5E9', '#8B5CF6', '#2563EB', '#06B6D4'];

GAMES.connect = function (el, args) {
  const p = P();
  const Q = questFor('connect', args);
  const rec = p.games.connect;
  rec.stars = rec.stars || {};

  const levelSelect = () => {
    const unlocked = Math.min(rec.level, CONNECT_LEVELS.length);
    startScreen(el, 'connect', {
      desc: 'Read the Turkish meaning, then drag the letters into the boxes to build the English word.',
      how: ['Drag a letter into a box — or just tap it.', 'Tap a box to send its letter back.', 'Stuck? Use a hint (it costs points).'],
      extra: `<div class="level-grid">${CONNECT_LEVELS.map((L, i) => {
        const n = i + 1, st = rec.stars[n] || 0;
        const cls = n > unlocked ? 'locked' : n === unlocked && !st ? 'cur' : st ? 'done' : '';
        return `<button class="lvl ${cls}" data-lvl="${n}" title="${L.name}">${n > unlocked ? icon('lock') : n}${st ? `<span class="lstars">${icon('star').repeat(st)}</span>` : ''}</button>`;
      }).join('')}</div><p class="muted small" style="font-weight:800">Choose a level · ${WORDS_PER_LEVEL} words each</p>`,
      hideStart: true,
      onBind: e => $$('[data-lvl]', e).forEach(b => b.onclick = () => { SFX.whoosh(); play(+b.dataset.lvl); }),
    });
  };

  const play = level => {
    const L = CONNECT_LEVELS[level - 1];
    let pool = LETTER_WORDS.filter(w => w.key.length >= L.min && w.key.length <= L.max);
    if (pool.length < WORDS_PER_LEVEL) pool = LETTER_WORDS.filter(w => w.key.length >= L.min - 1 && w.key.length <= L.max + 1);
    const words = pickWords(pool, WORDS_PER_LEVEL, p);
    const s = Game.start('connect', { level });
    let idx = 0, solvedCount = 0, totalHints = 0;
    let tiles = [], slots = [], hints = 0, wrongs = 0, recorded = false, busy = false, target = '';

    const layout = () => {
      el.innerHTML = gameTop('connect', Q ? questLabel(Q) : `Level ${level} · ${L.name}`, scorePill(s.score)) + `
        <div class="g-body">
          ${stepsHTML(words.length, idx)}
          <div class="wc-area">
            <div class="clue" id="clue"></div>
            <div class="slots" id="slots"></div>
            <div class="tiles" id="tiles"></div>
          </div>
          <div class="g-tools">
            <button class="tool-btn hint" data-hint>${icon('bulb')}Hint<small>-30</small></button>
            <button class="tool-btn" data-shuffle>${icon('shuffle')}Shuffle</button>
            <button class="tool-btn" data-clear>${icon('rotate')}Clear</button>
            <button class="tool-btn" data-skip>${icon('eye')}Reveal</button>
          </div>
        </div>`;
      bindBack(el, { ask: true });
      $('[data-hint]', el).onclick = hint;
      $('[data-shuffle]', el).onclick = () => { SFX.whoosh(); renderTiles(true); };
      $('[data-clear]', el).onclick = () => { slots.forEach((sl, i) => { if (!sl.locked) unplace(i, true); }); SFX.tap(); updateSlots(); };
      $('[data-skip]', el).onclick = reveal;
    };

    const loadWord = () => {
      const w = words[idx];
      target = w.key; hints = 0; wrongs = 0; recorded = false; busy = false;
      const letters = target.split('');
      for (let i = 0; i < L.decoys; i++) letters.push(pick('EARIOTNSLCDUMP'.split('')));
      let order = shuffle(letters.map((ch, i) => ({ ch, id: i })));
      if (order.map(t => t.ch).join('').startsWith(target)) order = order.reverse();
      tiles = order.map((t, i) => ({ ch: t.ch, id: i, slot: -1 }));
      slots = target.split('').map(() => ({ tile: -1, locked: false }));
      layout();
      const cat = CATEGORIES.find(c => c.id === w.cat);
      $('#clue', el).innerHTML = `<div class="c-lbl">Turkish meaning</div><div class="c-main">${esc(w.tr)}</div>
        <div class="c-sub">${target.length} letters · ${esc(cat ? cat.name : '')}${L.decoys ? ` · ${L.decoys} extra letter${L.decoys > 1 ? 's' : ''}!` : ''}</div>`;
      sizeUp(); renderSlots(); renderTiles();
      Keys.fn = onKey;
    };

    const sizeUp = () => {
      const area = $('.wc-area', el);
      const W = Math.min(area.clientWidth, 900) - 8;
      const n = target.length;
      const ts = Math.max(28, Math.min(74, Math.floor((W - (n - 1) * 8) / n), Math.floor(innerHeight * 0.085)));
      area.style.setProperty('--ts', ts + 'px');
    };

    const renderSlots = () => {
      $('#slots', el).innerHTML = slots.map((_, i) => `<div class="slot" data-i="${i}" style="--i:${i}"></div>`).join('');
      $$('.slot', el).forEach(sl => sl.onclick = () => { const i = +sl.dataset.i; if (slots[i].tile >= 0 && !slots[i].locked && !busy) { unplace(i); SFX.tap(); updateSlots(); } });
      updateSlots();
    };
    const updateSlots = () => {
      $$('.slot', el).forEach((n, i) => {
        const sl = slots[i];
        const was = n.textContent;
        n.textContent = sl.tile >= 0 ? tiles[sl.tile].ch : '';
        n.className = 'slot' + (sl.tile >= 0 ? ' filled' : '') + (sl.locked ? ' locked' : '');
        if (was && !n.textContent) n.style.animation = 'none';
        else n.style.animation = '';
      });
      $$('.tile', el).forEach(t => t.classList.toggle('used', tiles[+t.dataset.t].slot >= 0));
    };
    const renderTiles = (reshuffle = false) => {
      const box = $('#tiles', el);
      let order = tiles.map(t => t.id);
      if (reshuffle) order = shuffle(order);
      box.innerHTML = order.map((id, i) => `<div class="tile" data-t="${id}" style="--i:${i};--tc:${TILE_COLORS[id % TILE_COLORS.length]}">${tiles[id].ch}</div>`).join('');
      $$('.tile', box).forEach(t => {
        const id = +t.dataset.t;
        makeDraggable(t, {
          onMove: (ev, under) => { $$('.slot.hover', el).forEach(x => x.classList.remove('hover')); const sl = under && under.closest('.slot'); if (sl && !slots[+sl.dataset.i].locked) sl.classList.add('hover'); },
          onDrop: (ev, under) => { $$('.slot.hover', el).forEach(x => x.classList.remove('hover')); const sl = under && under.closest('.slot'); if (sl) place(id, +sl.dataset.i); },
          onTap: () => place(id),
        });
      });
      updateSlots();
    };

    const unplace = (si, quiet) => {
      const sl = slots[si]; if (sl.tile < 0 || sl.locked) return;
      tiles[sl.tile].slot = -1; sl.tile = -1;
    };
    const place = (tid, si) => {
      if (busy) return;
      const t = tiles[tid]; if (!t || t.slot >= 0) return;
      if (si === undefined) si = slots.findIndex(x => x.tile < 0);
      if (si < 0 || slots[si].locked) return;
      if (slots[si].tile >= 0) unplace(si);
      slots[si].tile = tid; t.slot = si;
      SFX.pop(slots.filter(x => x.tile >= 0).length);
      updateSlots();
      if (slots.every(x => x.tile >= 0)) setTimeout(check, 180);
    };
    const onKey = e => {
      if (busy) return;
      if (e.key === 'Backspace') {
        for (let i = slots.length - 1; i >= 0; i--) if (slots[i].tile >= 0 && !slots[i].locked) { unplace(i); updateSlots(); SFX.tap(); break; }
        return;
      }
      const k = normalizeKey(e.key);
      if (/^[A-Z]$/.test(k)) { const t = tiles.find(x => x.ch === k && x.slot < 0); if (t) place(t.id); }
    };

    const check = () => {
      const guess = slots.map(x => tiles[x.tile].ch).join('');
      const w = words[idx];
      if (guess === target) return success();
      busy = true; wrongs++;
      const sEl = $('#slots', el);
      $$('.slot', el).forEach(n => { if (!n.classList.contains('locked')) n.classList.add('no'); });
      if (!recorded) {
        recorded = true;
        Game.wrong({ wordId: w.id, el: sEl, mistake: { q: `Word Connect: build the word for "${w.tr}"`, mine: guess, correct: target, exp: `${target} = ${w.tr}. ${w.def ? '(' + w.def + ')' : ''}` } });
      } else { sEl.classList.remove('shake'); void sEl.offsetWidth; sEl.classList.add('shake'); SFX.wrong(); }
      FX.float(sEl, 'Try again!', 'bad');
      setTimeout(() => { slots.forEach((sl, i) => { if (!sl.locked) unplace(i); }); updateSlots(); busy = false; if (wrongs >= 3) toast('Tip: use a Hint or Reveal the word', 'info'); }, 700);
    };

    const hint = () => {
      if (busy) return;
      const i = slots.findIndex((sl, k) => !sl.locked && (sl.tile < 0 || tiles[sl.tile].ch !== target[k]));
      if (i < 0) return;
      if (hints >= target.length - 1) { toast('No more hints for this word', 'info'); return; }
      if (slots[i].tile >= 0) unplace(i);
      let t = tiles.find(x => x.ch === target[i] && x.slot < 0);
      if (!t) {
        const si = slots.findIndex((sl, k) => !sl.locked && sl.tile >= 0 && tiles[sl.tile].ch === target[i]);
        if (si >= 0) { const tid = slots[si].tile; unplace(si); t = tiles[tid]; }
      }
      if (!t) return;
      slots[i].tile = t.id; t.slot = i; slots[i].locked = true;
      hints++; totalHints++;
      s.score = Math.max(0, s.score - 30); setScore(el, s.score);
      FX.float($(`.slot[data-i="${i}"]`, el), '-30', 'bad');
      SFX.coin(); updateSlots();
      if (slots.every(x => x.tile >= 0)) setTimeout(check, 250);
    };

    const success = () => {
      busy = true;
      const w = words[idx];
      $$('.slot', el).forEach(n => n.classList.add('ok'));
      const pts = Math.max(30, 100 + target.length * 10 - hints * 30 - wrongs * 20);
      if (wrongs === 0 || !recorded) Game.correct({ wordId: w.id, points: pts, el: $('#slots', el) });
      else { s.score += Math.round(pts / 2); FX.float($('#slots', el), `+${Math.round(pts / 2)}`); SFX.correct(); }
      solvedCount++;
      dailyEvent('connectWord', 1);
      setScore(el, s.score);
      FX.burst($('#slots', el), 40);
      setTimeout(() => showSheet({ good: true, title: pick(GOOD_WORDS), body: wordCardHTML(w), btn: idx + 1 < words.length ? 'Next word' : 'See results', onNext: next }), 700);
    };
    const reveal = () => {
      if (busy) return;
      busy = true;
      const w = words[idx];
      if (!recorded) { recorded = true; Game.wrong({ wordId: w.id, mistake: { q: `Word Connect: build the word for "${w.tr}"`, mine: '(revealed)', correct: target, exp: `${target} = ${w.tr}.` } }); }
      slots.forEach((sl, i) => { if (!sl.locked) unplace(i); });
      slots.forEach((sl, i) => { const t = tiles.find(x => x.ch === target[i] && x.slot < 0); if (t) { sl.tile = t.id; t.slot = i; sl.locked = true; } });
      updateSlots();
      setTimeout(() => showSheet({ good: false, title: 'The word was ' + target, body: wordCardHTML(w), btn: idx + 1 < words.length ? 'Next word' : 'See results', onNext: next }), 500);
    };
    const next = () => {
      idx++;
      if (idx < words.length) loadWord(); else finish();
    };
    const finish = () => {
      Keys.fn = null;
      const stars = solvedCount === words.length ? (totalHints === 0 && s.wrong === 0 ? 3 : 2) : solvedCount >= 3 ? 1 : 0;
      if (stars > (rec.stars[level] || 0)) rec.stars[level] = stars;
      const unlockedNew = solvedCount >= 3 && rec.level <= level && level < CONNECT_LEVELS.length;
      if (unlockedNew) rec.level = level + 1;
      const r = Game.finish();
      let actions = [];
      if (Q) actions = questDone(Q, stars);
      else {
        // continuous play: the next level starts right away (or the same level again)
        const nextLvl = solvedCount >= 3 && level < CONNECT_LEVELS.length ? level + 1 : level;
        actions.push({ label: nextLvl > level ? `Continue · Level ${nextLvl}` : 'Try again', icon: 'next', big: true, onClick: () => play(nextLvl) });
        actions.push({ label: 'Levels', icon: 'grid', ghost: true, onClick: levelSelect });
      }
      showResults(el, r, {
        stars, subtitle: `Level ${level} complete · ${solvedCount}/${words.length} words`,
        extraHTML: unlockedNew ? `<div class="tip">${icon('sparkles')}<span>Level ${level + 1} unlocked! Longer words are waiting.</span></div>` : '',
        actions,
      });
    };

    loadWord();
    const onResize = () => { if ($('.wc-area', el)) sizeUp(); };
    addEventListener('resize', onResize);
    cleanup = () => removeEventListener('resize', onResize);
  };

  let cleanup = null;
  if (Q) play(Q.connectLevel); else levelSelect();
  return () => cleanup && cleanup();
};

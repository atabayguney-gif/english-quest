/* =========================================================================
   GAME 6 — WORD CIRCLE · Circular Letter Connection Game
   Swipe across the letters on the wheel to make words. A line follows your
   finger/mouse, selected letters change colour, swipe back to undo.
   ========================================================================= */
'use strict';
GAMES.circle = function (el, args) {
  const p = P();
  const Q = questFor('circle', args);
  const rec = p.games.circle;
  rec.stars = rec.stars || {};
  let cleanupFns = [];
  const addCleanup = f => cleanupFns.push(f);

  const levelSelect = () => {
    cleanupFns.forEach(f => f()); cleanupFns = [];
    const unlocked = Math.min(rec.level, CIRCLE_LEVELS.length);
    startScreen(el, 'circle', {
      desc: 'Swipe across the letters on the wheel to connect them and find all the hidden words!',
      how: ['Press on a letter and slide to the next letters.', 'Slide back to undo the last letter.', 'All words come from Unit 1. Find them all to finish the level!'],
      extra: `<div class="level-grid">${CIRCLE_LEVELS.map((L, i) => {
        const n = i + 1, st = rec.stars[n] || 0;
        const cls = n > unlocked ? 'locked' : n === unlocked && !st ? 'cur' : st ? 'done' : '';
        return `<button class="lvl ${cls}" data-lvl="${n}">${n > unlocked ? icon('lock') : n}${st ? `<span class="lstars">${icon('star').repeat(st)}</span>` : ''}</button>`;
      }).join('')}</div><p class="muted small" style="font-weight:800">Short words first — longer words in higher levels</p>`,
      hideStart: true,
      onBind: e => $$('[data-lvl]', e).forEach(b => b.onclick = () => { SFX.whoosh(); play(+b.dataset.lvl); }),
    });
  };

  const play = level => {
    cleanupFns.forEach(f => f()); cleanupFns = [];
    // every word is a word from the unit list; the wheel is built from their letters
    const levelWords = CIRCLE_LEVELS[level - 1];
    const wheelLetters = circleLetters(levelWords);
    const canMake = w => { const pool = wheelLetters.split(''); for (const ch of w) { const i = pool.indexOf(ch); if (i < 0) return false; pool.splice(i, 1); } return true; };
    const vocabOf = w => VOCAB.find(v => v.key === w);
    const targets = levelWords.slice().sort((a, b) => a.length - b.length || a.localeCompare(b));
    const L = {
      main: targets[targets.length - 1],
      // other unit words that also fit on this wheel count as bonus words
      bonus: LETTER_WORDS.map(w => w.key).filter(k => !targets.includes(k) && canMake(k)),
    };
    const info = Object.fromEntries(targets.map(w => { const v = vocabOf(w); return [w, { w, tr: v.tr, ex: v.ex, vocab: v }]; }));
    L.bonus.forEach(b => { const v = vocabOf(b); info[b] = { w: b, tr: v.tr, ex: v.ex, vocab: v }; });
    let letters = shuffle(wheelLetters.split(''));
    const found = new Set(), bonusFound = new Set();
    const revealed = {}; targets.forEach(t => revealed[t] = new Set());
    let hintsUsed = 0, path = [], dragging = false, ws = 300, ls = 70, pts = [];
    const s = Game.start('circle', { level });

    el.innerHTML = gameTop('circle', `${Q ? `Chapter ${Q.chapter} · ` : ''}Level ${level} · <span id="fcount">0/${targets.length}</span> words`, (L.bonus.length ? `<button class="score-pill coin-pill" data-bonus title="Bonus words">${icon('sparkles')}<span id="bcount">0</span></button>` : '<span id="bcount" hidden></span>') + scorePill(s.score)) + `
      <div class="g-body">
        <div class="ci-wrap">
          <div class="ci-words" id="words">${targets.map(t => `<div class="ci-word ${t === L.main ? 'main' : ''}" data-w="${t}">${t.split('').map((ch, k) => `<span class="ci-box" style="--i:${k}">${ch}</span>`).join('')}</div>`).join('')}</div>
          <div class="ci-bar">
            <button class="ci-tool" data-shuffle aria-label="Shuffle letters">${icon('shuffle')}<small>Shuffle</small></button>
            <div class="ci-preview" id="prev"></div>
            <button class="ci-tool hint" data-hint aria-label="Hint">${icon('bulb')}<small>Hint -25</small></button>
          </div>
          <div class="ci-wheel-area" data-progress-area>
            <div class="wheel" id="wheel"><svg class="lines"><path id="line"/></svg></div>
          </div>
        </div>
      </div>`;
    bindBack(el, { ask: true });
    const wheel = $('#wheel', el), line = $('#line', el), prev = $('#prev', el);

    const isWide = () => matchMedia('(min-aspect-ratio: 5/4) and (min-width: 900px)').matches;
    const layoutWheel = () => {
      const body = $('.g-body', el);
      const bw = body.clientWidth, bh = body.clientHeight;
      const barH = $('.ci-bar', el).offsetHeight || 56;
      ws = isWide()
        ? Math.max(240, Math.min(bh - barH - 24, bw * 0.46, 560))
        : Math.max(200, Math.min(bw - 12, (bh - barH) * 0.56, 440));
      const n = letters.length;
      ls = ws * (n <= 4 ? 0.27 : n <= 5 ? 0.25 : n <= 6 ? 0.23 : n <= 7 ? 0.21 : n <= 8 ? 0.195 : 0.178);
      const R = ws / 2 - ls / 2 - ws * 0.045;
      wheel.style.setProperty('--ws', ws + 'px'); wheel.style.setProperty('--ls', ls + 'px');
      pts = letters.map((_, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return { x: ws / 2 + R * Math.cos(a), y: ws / 2 + R * Math.sin(a) }; });
      let nodes = $$('.wl', wheel);
      if (nodes.length !== n) {
        nodes.forEach(x => x.remove());
        letters.forEach((ch, i) => { const d = document.createElement('div'); d.className = 'wl'; d.dataset.i = i; d.textContent = ch; wheel.appendChild(d); });
        nodes = $$('.wl', wheel);
      }
      nodes.forEach((d, i) => { d.textContent = letters[i]; d.style.left = pts[i].x + 'px'; d.style.top = pts[i].y + 'px'; });
      sizeWords();
    };
    const sizeWords = () => {
      const box = $('#words', el);
      const body = $('.g-body', el);
      const barH = $('.ci-bar', el).offsetHeight || 56;
      const wide = isWide();
      const W = (wide ? body.clientWidth - ws - 48 : body.clientWidth) - 12;
      const H = (wide ? body.clientHeight : body.clientHeight - ws - barH - 20) - 12;
      const bs = fitSize(W, H, targets.map(t => t.length + (t === L.main ? 0.6 : 0)), { max: 52, min: 18, gapX: 18, gapY: 9, pad: 3 });
      box.style.setProperty('--bs', bs + 'px'); box.style.setProperty('--bsb', bs + 'px');
    };

    const hit = (e, factor = 0.5) => {
      const r = wheel.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      for (let i = 0; i < pts.length; i++) if (Math.hypot(pts[i].x - x, pts[i].y - y) < ls * factor) return i;
      return -1;
    };
    const drawLine = e => {
      if (!path.length) { line.setAttribute('d', ''); return; }
      let d = path.map((i, k) => `${k ? 'L' : 'M'}${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`).join(' ');
      if (e && dragging) { const r = wheel.getBoundingClientRect(); d += ` L${(e.clientX - r.left).toFixed(1)} ${(e.clientY - r.top).toFixed(1)}`; }
      line.setAttribute('d', d);
    };
    const mark = () => {
      $$('.wl', wheel).forEach((d, i) => d.classList.toggle('on', path.includes(i)));
      prev.className = 'ci-preview';
      prev.innerHTML = path.map(i => `<span>${letters[i]}</span>`).join('');
    };
    wheel.addEventListener('pointerdown', e => {
      const i = hit(e, 0.62); if (i < 0) return;
      e.preventDefault();
      try { wheel.setPointerCapture(e.pointerId); } catch (_) { }
      dragging = true; path = [i]; SFX.pop(0); mark(); drawLine(e);
    });
    wheel.addEventListener('pointermove', e => {
      if (!dragging) return;
      e.preventDefault();
      const i = hit(e, 0.44);
      if (i >= 0) {
        if (path.length > 1 && i === path[path.length - 2]) { path.pop(); SFX.tap(); mark(); }
        else if (!path.includes(i)) { path.push(i); SFX.pop(path.length - 1); buzz(8); mark(); }
      }
      drawLine(e);
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      const word = path.map(i => letters[i]).join('');
      path = []; drawLine(); $$('.wl', wheel).forEach(d => d.classList.remove('on'));
      evaluate(word);
    };
    wheel.addEventListener('pointerup', end);
    wheel.addEventListener('pointercancel', end);
    wheel.addEventListener('lostpointercapture', end);

    const flashPreview = (cls, word) => {
      prev.className = 'ci-preview ' + cls;
      prev.innerHTML = word.split('').map(ch => `<span>${ch}</span>`).join('');
      clearTimeout(flashPreview.t);
      flashPreview.t = setTimeout(() => { prev.className = 'ci-preview'; prev.innerHTML = ''; }, 750);
    };
    const showFound = (t, bonus = false) => {
      $$('.found-toast', el).forEach(n => n.remove());
      const inf = info[t];
      const d = document.createElement('div');
      d.className = 'found-toast';
      d.innerHTML = `<b>${t}</b><span>${esc((bonus ? 'Bonus! ' : '') + inf.tr)}</span>${speakBtn(inf.vocab ? inf.vocab.en : t.toLowerCase(), 'sm')}`;
      $('.g-body', el).appendChild(d);
      setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 300); }, 2300);
    };
    const evaluate = word => {
      if (word.length < 2) { prev.innerHTML = ''; return; }
      const row = $(`.ci-word[data-w="${word}"]`, el);
      if (targets.includes(word)) {
        if (found.has(word)) { flashPreview('dup', word); row.classList.remove('flash'); void row.offsetWidth; row.classList.add('flash'); toast('Already found!', 'info', 1100); SFX.tap(); return; }
        found.add(word);
        row.classList.add('found');
        $$('.ci-box', row).forEach(b => b.classList.remove('hint'));
        flashPreview('good', word);
        const inf = info[word];
        const bonusMain = word === L.main ? 60 : 0;
        Game.correct({ wordId: inf.vocab ? inf.vocab.id : null, points: word.length * 20 + bonusMain, el: row });
        p.stats.circleWords++; dailyEvent('circleWord', 1);
        setScore(el, s.score);
        FX.burst(row, 26);
        showFound(word);
        $('#fcount', el).textContent = `${found.size}/${targets.length}`;
        if (found.size === targets.length) setTimeout(finish, 1300);
        return;
      }
      if (L.bonus.includes(word)) {
        if (bonusFound.has(word)) { flashPreview('dup', word); toast('Bonus word already found', 'info', 1100); return; }
        bonusFound.add(word);
        s.score += 15; setScore(el, s.score);
        flashPreview('good', word); SFX.coin();
        FX.float(prev, '+15 Bonus', 'gold');
        $('#bcount', el).textContent = bonusFound.size;
        showFound(word, true);
        return;
      }
      flashPreview('bad', word); SFX.wrong(); buzz([20, 30, 20]);
    };

    $('[data-shuffle]', el).onclick = () => {
      SFX.whoosh();
      const order = shuffle(letters.map((_, i) => i));
      letters = order.map(i => letters[i]);
      wheel.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(200deg) scale(.92)' }, { transform: 'rotate(360deg)' }], { duration: 550, easing: 'cubic-bezier(.2,.8,.2,1)' });
      setTimeout(() => layoutWheel(), 120);
    };
    $('[data-hint]', el).onclick = () => {
      const t = targets.find(x => !found.has(x) && revealed[x].size < x.length - 1) || targets.find(x => !found.has(x));
      if (!t) return;
      const row = $(`.ci-word[data-w="${t}"]`, el);
      const boxes = $$('.ci-box', row);
      const k = [...Array(t.length).keys()].find(i => !revealed[t].has(i));
      if (k === undefined) return;
      revealed[t].add(k);
      boxes[k].classList.add('hint');
      boxes[k].animate([{ transform: 'scale(.4)' }, { transform: 'scale(1.2)' }, { transform: 'scale(1)' }], { duration: 450, easing: 'cubic-bezier(.34,1.56,.64,1)' });
      hintsUsed++;
      s.score = Math.max(0, s.score - 25); setScore(el, s.score);
      FX.float(boxes[k], '-25', 'bad'); SFX.coin();
    };
    const bonusBtn = $('[data-bonus]', el);
    if (bonusBtn) bonusBtn.onclick = () => {
      modal(`<h3 style="margin-bottom:.6rem">${icon('sparkles')} Bonus words</h3>
        <p class="muted small" style="margin-bottom:1rem;font-weight:800">Other Unit 1 words hidden in these letters (+15 each).</p>
        <div class="tags" style="display:flex;flex-wrap:wrap;gap:.4rem;justify-content:center">${bonusFound.size ? [...bonusFound].map(b => `<span class="chip c" style="--cc:#8B5CF6">${b} · ${esc(info[b].tr)}</span>`).join('') : '<span class="muted">None yet — keep swiping!</span>'}</div>
        <p class="muted small" style="margin-top:1rem">${bonusFound.size} of ${L.bonus.length} found</p>
        <button class="btn block" style="margin-top:1rem" data-close>OK</button>`, { cls: 'center' });
    };
    $('.g-title', el).style.cursor = 'pointer';
    $('.g-title', el).onclick = () => wordList();
    $('#words', el).onclick = e => { const row = e.target.closest('.ci-word.found'); if (row) wordInfo(row.dataset.w); };
    const wordInfo = t => modal(wordCardHTML(info[t].vocab) + `<button class="btn block" style="margin-top:1rem" data-close>OK</button>`);
    const wordList = () => {
      modal(`<h3 style="margin-bottom:.8rem">Found words</h3>
        <div style="display:grid;gap:.5rem">${targets.map(t => found.has(t)
          ? `<div class="exp" style="display:flex;align-items:center;gap:.6rem">${speakBtn(t.toLowerCase(), 'sm')}<span><b>${t}</b> — ${esc(info[t].tr)}<br><span class="muted small">${esc(info[t].ex)}</span></span></div>`
          : `<div class="exp" style="opacity:.6"><b>${'•'.repeat(t.length)}</b> <span class="muted small">(${t.length} letters)</span></div>`).join('')}</div>
        <button class="btn block" style="margin-top:1rem" data-close>OK</button>`);
    };

    const finish = () => {
      const stars = hintsUsed === 0 ? 3 : hintsUsed <= 2 ? 2 : 1;
      if (stars > (rec.stars[level] || 0)) rec.stars[level] = stars;
      if (!p.circleDone.includes(level)) { p.circleDone.push(level); p.stats.circleLevels = p.circleDone.length; }
      const newUnlock = rec.level <= level && level < CIRCLE_LEVELS.length;
      if (newUnlock) rec.level = level + 1;
      const r = Game.finish({ bonusXP: bonusFound.size * 2 });
      const nextLvl = level < CIRCLE_LEVELS.length ? level + 1 : 1;
      showResults(el, r, {
        stars, subtitle: `Level ${level} complete${bonusFound.size ? ` · ${bonusFound.size} bonus word${bonusFound.size === 1 ? '' : 's'}` : ''}`,
        extraHTML: `<div style="display:grid;gap:.6rem">${targets.map(t => wordCardHTML(info[t].vocab)).join('')}</div>` + (newUnlock && !Q ? `<div class="tip">${icon('sparkles')}<span>Level ${level + 1} unlocked!</span></div>` : ''),
        actions: Q ? questDone(Q, stars) : [
          { label: `Continue · Level ${nextLvl}`, icon: 'next', big: true, onClick: () => play(nextLvl) },
          { label: 'Levels', icon: 'grid', ghost: true, onClick: levelSelect },
        ],
      });
    };

    layoutWheel();
    setTimeout(() => { if ($('#wheel', el)) layoutWheel(); }, 60);
    const onResize = () => { if ($('#wheel', el)) layoutWheel(); };
    addEventListener('resize', onResize);
    addCleanup(() => removeEventListener('resize', onResize));
  };

  if (Q) play(Q.circleLevel); else levelSelect();
  return () => cleanupFns.forEach(f => f());
};

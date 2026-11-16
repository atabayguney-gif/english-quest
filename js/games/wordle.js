/* =========================================================================
   GAME 3 — WORDLE · Guess the Hidden Word
   GREEN = right letter, right place · ORANGE = in the word, wrong place ·
   GRAY = not in the word. Duplicate letters are evaluated correctly.
   ========================================================================= */
'use strict';
/* two-pass evaluation so repeated letters are coloured correctly */
function wordleEvaluate(guess, target) {
  const n = target.length, res = Array(n).fill('x'), left = {};
  for (let i = 0; i < n; i++) {
    if (guess[i] === target[i]) res[i] = 'g';
    else left[target[i]] = (left[target[i]] || 0) + 1;
  }
  for (let i = 0; i < n; i++) {
    if (res[i] === 'g') continue;
    if (left[guess[i]] > 0) { res[i] = 'o'; left[guess[i]]--; }
  }
  return res;
}

GAMES.wordle = function (el, args) {
  const p = P();
  const Q = questFor('wordle', args);
  const MAX_TRIES = 5, WORDS = 3;
  const BANDS = {
    easy: { min: 4, max: 5, label: 'Easy', sub: '4–5 letters' },
    medium: { min: 6, max: 7, label: 'Medium', sub: '6–7 letters' },
    hard: { min: 8, max: 9, label: 'Hard', sub: '8–9 letters' },
  };
  let resizeFn = null;

  const menu = () => {
    let band = 'easy';
    startScreen(el, 'wordle', {
      desc: 'The Turkish meaning is your clue. Guess the English word in 5 tries!',
      extra: `<div class="wd-legend" style="font-size:.85rem">
          <span><i style="background:var(--green)"></i>Correct place</span>
          <span><i style="background:#F59E0B"></i>Wrong place</span>
          <span><i style="background:var(--gray-tile)"></i>Not in word</span></div>
        <div class="mode-row">${Object.entries(BANDS).map(([k, b]) => `<button class="mode-card" data-band="${k}">${icon(k === 'easy' ? 'star' : k === 'medium' ? 'zap' : 'flame')}<b>${b.label}</b><small>${b.sub}</small></button>`).join('')}</div>`,
      btn: `Play ${WORDS} words`,
      onBind: e => {
        const upd = () => $$('[data-band]', e).forEach(b => b.classList.toggle('sel', b.dataset.band === band));
        $$('[data-band]', e).forEach(b => b.onclick = () => { band = b.dataset.band; SFX.tap(); upd(); });
        upd();
      },
      onStart: () => play(band),
    });
  };

  const play = bandKey => {
    const B = BANDS[bandKey];
    const words = pickWords(LETTER_WORDS.filter(w => w.key.length >= B.min && w.key.length <= B.max), WORDS, p);
    const s = Game.start('wordle', { band: bandKey });
    let wi = 0, solved = 0;
    let target, w, guesses, cur, locked, keyState, hintLevel;

    const load = () => {
      w = words[wi]; target = w.key; guesses = []; cur = ''; locked = false; keyState = {}; hintLevel = 0;
      const n = target.length;
      const cat = CATEGORIES.find(c => c.id === w.cat);
      el.innerHTML = gameTop('wordle', `${Q ? `Chapter ${Q.chapter} · ` : ''}${B.label} · Word ${wi + 1} of ${words.length}`, scorePill(s.score)) + `
        <div class="g-body">
          <div class="clue">
            <div class="c-lbl">Turkish meaning</div>
            <div class="c-main">${esc(w.tr)}</div>
            <div class="c-sub"><span class="tries" id="tries"></span> · ${n} letters · ${esc(cat ? cat.name : '')}</div>
            <div id="hintbox"></div>
          </div>
          <div class="wd-board" id="board"><div class="wd-grid" id="grid">${[...Array(MAX_TRIES)].map((_, r) => `<div class="wd-row" data-r="${r}" style="--n:${n}">${[...Array(n)].map((_, c) => `<div class="wd-tile" style="--i:${c}"></div>`).join('')}</div>`).join('')}</div></div>
          <div class="g-tools" style="padding:.1rem 0 .5rem"><button class="tool-btn hint" data-hint>${icon('bulb')}Hint<small>-30</small></button></div>
          <div class="kb" id="kb">${['QWERTYUIOP', 'ASDFGHJKL', '>ZXCVBNM<'].map(row => `<div class="kb-row">${row.split('').map(k => k === '>' ? `<button class="key wide" data-k="ENTER">ENTER</button>` : k === '<' ? `<button class="key wide" data-k="BACK" aria-label="Delete">${icon('backspace')}</button>` : `<button class="key" data-k="${k}">${k}</button>`).join('')}</div>`).join('')}</div>
        </div>`;
      bindBack(el, { ask: true });
      $$('.key', el).forEach(k => k.onclick = () => press(k.dataset.k));
      $('[data-hint]', el).onclick = hint;
      Keys.fn = e => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key === 'Enter') { e.preventDefault(); press('ENTER'); }
        else if (e.key === 'Backspace') press('BACK');
        else { const k = normalizeKey(e.key); if (/^[A-Z]$/.test(k)) press(k); }
      };
      updateTries(); size(); paintRow();
    };
    const size = () => {
      const board = $('#board', el); if (!board) return;
      const n = target.length, gap = 8;
      const W = board.clientWidth - 4, H = board.clientHeight - 22;
      const ts = Math.max(26, Math.min(70, Math.floor((W - (n - 1) * gap) / n), Math.floor((H - (MAX_TRIES - 1) * gap) / MAX_TRIES)));
      board.style.setProperty('--ts', ts + 'px');
    };
    resizeFn = size;
    const updateTries = () => {
      const left = MAX_TRIES - guesses.length;
      $('#tries', el).innerHTML = `${[...Array(MAX_TRIES)].map((_, i) => `<i class="${i < left ? '' : 'off'}"></i>`).join('')} ${left} ${left === 1 ? 'try' : 'tries'} left`;
    };
    const rowEl = r => $(`.wd-row[data-r="${r}"]`, el);
    const paintRow = () => {
      const r = guesses.length; if (r >= MAX_TRIES) return;
      $$('.wd-row', el).forEach((x, i) => x.classList.toggle('current', i === r));
      $$('.wd-tile', rowEl(r)).forEach((t, i) => { t.textContent = cur[i] || ''; t.classList.toggle('filled', !!cur[i]); });
    };
    const press = k => {
      if (locked) return;
      if (k === 'ENTER') return submit();
      if (k === 'BACK') { cur = cur.slice(0, -1); SFX.tap(); return paintRow(); }
      if (cur.length < target.length) { cur += k; SFX.pop(cur.length % 8); paintRow(); }
    };
    const submit = () => {
      const row = rowEl(guesses.length);
      if (cur.length < target.length) {
        row.classList.remove('shake'); void row.offsetWidth; row.classList.add('shake');
        toast(`Not enough letters — the word has ${target.length}`, 'info', 1600); SFX.wrong(); return;
      }
      locked = true;
      const res = wordleEvaluate(cur, target);
      const guess = cur;
      guesses.push(guess);
      $$('.wd-tile', row).forEach((t, i) => { t.classList.add(res[i], 'rev'); });
      const n = target.length, dur = 230 * (n - 1) + 620;
      $$('.wd-tile', row).forEach((t, i) => setTimeout(() => SFX.flip(), i * 230 + 300));
      setTimeout(() => {
        $$('.wd-tile', row).forEach(t => { t.classList.remove('rev'); t.classList.add('done'); });
        const rank = { x: 1, o: 2, g: 3 };
        guess.split('').forEach((ch, i) => { if (!keyState[ch] || rank[res[i]] > rank[keyState[ch]]) keyState[ch] = res[i]; });
        $$('.key', el).forEach(k => { const st = keyState[k.dataset.k]; k.classList.remove('g', 'o', 'x'); if (st) k.classList.add(st); });
        updateTries();
        if (guess === target) return win(row);
        if (guesses.length >= MAX_TRIES) return lose();
        cur = ''; locked = false; paintRow();
        const left = MAX_TRIES - guesses.length;
        if (left <= 2) toast(`${left} ${left === 1 ? 'try' : 'tries'} left!`, 'info', 1400);
      }, dur);
    };
    const win = row => {
      row.classList.add('win');
      const tries = guesses.length;
      const pts = Math.max(40, 100 + target.length * 10 + (MAX_TRIES - tries) * 40 - hintLevel * 30);
      Game.correct({ wordId: w.id, points: pts, el: row });
      solved++; p.stats.wordles++; p.stats.wordleBest = Math.min(p.stats.wordleBest, tries);
      dailyEvent('wordleSolved', 1);
      setScore(el, s.score);
      FX.burst(row, 60);
      setTimeout(() => showSheet({ good: true, title: tries === 1 ? 'Genius! First try!' : `${pick(GOOD_WORDS)} ${tries} ${tries === 1 ? 'try' : 'tries'}`, body: wordCardHTML(w), btn: wi + 1 < words.length ? 'Next word' : 'See results', onNext: next }), 900);
    };
    const lose = () => {
      Game.wrong({ wordId: w.id, mistake: { q: `Wordle: find the word for "${w.tr}"`, mine: guesses[guesses.length - 1], correct: target, exp: `${target} = ${w.tr}. ${w.def ? 'Definition: ' + w.def + '.' : ''}` } });
      setTimeout(() => showSheet({ good: false, title: `The word was ${target}`, body: `<div class="exp">${esc(w.def ? 'Definition: ' + w.def : '')}</div>` + wordCardHTML(w), btn: wi + 1 < words.length ? 'Next word' : 'See results', onNext: next }), 500);
    };
    const hint = () => {
      if (locked) return;
      const box = $('#hintbox', el);
      if (hintLevel === 0) {
        hintLevel = 1;
        box.innerHTML = `<div class="c-hint">${icon('bulb')} <b>English hint:</b> ${esc(w.def || w.ex.replace(new RegExp(w.key, 'ig'), '____'))}</div>`;
      } else if (hintLevel === 1) {
        hintLevel = 2;
        box.innerHTML += `<div class="c-hint">${icon('bulb')} The word starts with <b>${target[0]}</b> and ends with <b>${target[target.length - 1]}</b>.</div>`;
        $('[data-hint]', el).disabled = true;
      }
      s.score = Math.max(0, s.score - 30); setScore(el, s.score); SFX.coin();
      setTimeout(size, 50);
    };
    const next = () => { wi++; if (wi < words.length) load(); else finish(); };
    const finish = () => {
      Keys.fn = null;
      const r = Game.finish();
      const stars = solved === words.length ? (r.wrong === 0 && s.score > 0 ? 3 : 2) : solved > 0 ? 1 : 0;
      const order = ['easy', 'medium', 'hard'];
      const nextBand = solved === words.length && bandKey !== 'hard' ? order[order.indexOf(bandKey) + 1] : bandKey;
      showResults(el, r, {
        stars,
        subtitle: `${B.label} · ${solved}/${words.length} words solved`,
        actions: Q ? questDone(Q, stars) : [
          { label: `Continue · ${BANDS[nextBand].label}`, icon: 'next', big: true, onClick: () => play(nextBand) },
          { label: 'Difficulty', icon: 'settings', ghost: true, onClick: menu },
        ],
      });
    };
    load();
  };

  const onResize = () => resizeFn && $('#board', el) && resizeFn();
  addEventListener('resize', onResize);
  if (Q) play(Q.band); else menu();
  return () => removeEventListener('resize', onResize);
};

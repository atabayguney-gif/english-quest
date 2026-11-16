/* =========================================================================
   GAME 5 — SENTENCE BUILDER · Build Correct English Sentences
   Drag word chips into order (or tap them). Wrong order → hint about where
   the mistake starts. Turkish translation + spoken English sentence.
   ========================================================================= */
'use strict';
function tokenizeSentence(en) {
  let text = en.trim(), end = '';
  const m = text.match(/[.!?]$/);
  if (m) { end = m[0]; text = text.slice(0, -1); }
  const words = text.split(/\s+/);
  return {
    end,
    tokens: words.map((w, i) => {
      let shown = w;
      if (i === 0) {
        const bare = w.replace(/[^A-Za-zÀ-ž.']/g, '');
        if (!PROPER_WORDS.has(bare) && !PROPER_WORDS.has(w)) shown = w.charAt(0).toLowerCase() + w.slice(1);
      }
      return { id: i, text: shown, key: w.toLowerCase() };
    }),
  };
}

GAMES.sentence = function (el, args) {
  const p = P();
  const Q = questFor('sentence', args);
  const PER = 5;
  const LEVELS = { easy: { label: 'Easy', sub: 'short sentences' }, medium: { label: 'Medium', sub: '7–9 words' }, hard: { label: 'Hard', sub: 'long & tricky' } };

  const menu = () => {
    let lvl = 'easy';
    startScreen(el, 'sentence', {
      desc: 'Put the English words in the correct order. The Turkish translation is your guide.',
      how: ['Drag the words into the answer box — or tap them.', 'Tap a word in the box to send it back.', 'Press Check. If the order is wrong you get a hint!'],
      extra: `<div class="mode-row">${Object.entries(LEVELS).map(([k, v]) => `<button class="mode-card" data-lv="${k}">${icon(k === 'easy' ? 'star' : k === 'medium' ? 'zap' : 'flame')}<b>${v.label}</b><small>${v.sub}</small></button>`).join('')}</div>`,
      btn: `Build ${PER} sentences`,
      onBind: e => {
        const upd = () => $$('[data-lv]', e).forEach(b => b.classList.toggle('sel', b.dataset.lv === lvl));
        $$('[data-lv]', e).forEach(b => b.onclick = () => { lvl = b.dataset.lv; SFX.tap(); upd(); });
        upd();
      },
      onStart: () => play(lvl),
    });
  };

  const play = lvl => {
    const recent = new Set(p.recentQ || []);
    let pool = SENTENCES.filter(x => x.level === lvl);
    const fresh = pool.filter(x => !recent.has(x.id));
    const list = shuffle(fresh.length >= PER ? fresh : pool).slice(0, PER);
    rememberQuestions(list.map(x => x.id));
    const s = Game.start('sentence', { level: lvl });
    let i = 0, solved = 0;
    let cur, tk, answer, poolIds, locked, hints, wrongs, recorded, busy, listened;

    const load = () => {
      cur = list[i]; tk = tokenizeSentence(cur.en);
      answer = []; locked = 0; hints = 0; wrongs = 0; recorded = false; busy = false; listened = false;
      const ids = tk.tokens.map(t => t.id);
      let sh = shuffle(ids);
      for (let k = 0; k < 5 && sh.map(x => tk.tokens[x].key).join(' ') === tk.tokens.map(t => t.key).join(' '); k++) sh = shuffle(ids);
      poolIds = sh;
      el.innerHTML = gameTop('sentence', `${Q ? `Chapter ${Q.chapter} · ` : ''}${LEVELS[lvl].label} · Sentence ${i + 1} of ${list.length}`, scorePill(s.score)) + `
        <div class="g-body">
          ${stepsHTML(list.length, i)}
          <div class="sb-area">
            <div class="clue">
              <div class="c-lbl">Build this sentence in English</div>
              <div class="c-main" style="font-size:clamp(1.15rem,2.8vh,1.55rem)">${esc(cur.tr)}</div>
              <div class="c-sub">${tk.tokens.length} words · ${esc(TOPICS[cur.topic] || '')}</div>
              <div id="hintbox"></div>
            </div>
            <div class="sb-answer" id="ans"></div>
            <div class="sb-pool" id="pool"></div>
          </div>
          <div class="g-tools">
            <button class="tool-btn hint" data-hint>${icon('bulb')}Hint<small>-25</small></button>
            <button class="tool-btn" data-clear>${icon('rotate')}Clear</button>
            <button class="btn big" data-check disabled style="--c:var(--gc);--cd:var(--gd)">${icon('check')} Check</button>
          </div>
        </div>`;
      bindBack(el, { ask: true });
      $('[data-check]', el).onclick = check;
      $('[data-hint]', el).onclick = hint;
      $('[data-clear]', el).onclick = () => { if (busy) return; poolIds.push(...answer.slice(locked)); answer = answer.slice(0, locked); SFX.tap(); render(); };
      Keys.fn = e => { if (e.key === 'Enter' && !$('[data-check]', el).disabled) check(); if (e.key === 'Backspace') { if (answer.length > locked) { poolIds.push(answer.pop()); render(); } } };
      render();
    };

    const chip = (id, where, k) => `<div class="wchip ${where === 'ans' && k < locked ? 'locked' : ''}" data-id="${id}" data-where="${where}" style="--i:${k}">${esc(tk.tokens[id].text)}</div>`;
    const render = () => {
      const ans = $('#ans', el), pl = $('#pool', el);
      ans.innerHTML = answer.length
        ? answer.map((id, k) => chip(id, 'ans', k)).join('') + `<span class="sb-end">${esc(tk.end)}</span>`
        : `<span class="ph">Drag or tap the words here…</span>`;
      ans.classList.remove('ok', 'no');
      pl.innerHTML = poolIds.map((id, k) => chip(id, 'pool', k)).join('');
      $$('.wchip', el).forEach(c => {
        const id = +c.dataset.id, where = c.dataset.where;
        if (where === 'ans' && answer.indexOf(id) < locked) return;
        makeDraggable(c, {
          onMove: (ev, under) => { ans.classList.toggle('hover', !!(under && under.closest('#ans'))); },
          onDrop: (ev, under) => {
            ans.classList.remove('hover');
            if (busy) return;
            const inAns = under && under.closest('#ans');
            if (inAns) {
              const others = answer.filter(x => x !== id);
              let pos = others.length;
              const chips = $$('.wchip', ans).filter(n => +n.dataset.id !== id);
              for (let k = 0; k < chips.length; k++) {
                const r = chips[k].getBoundingClientRect();
                if (ev.clientY < r.top || (ev.clientY <= r.bottom && ev.clientX < r.left + r.width / 2)) { pos = k; break; }
              }
              pos = Math.max(pos, locked);
              poolIds = poolIds.filter(x => x !== id);
              others.splice(pos, 0, id);
              answer = others;
              SFX.pop(answer.length % 8);
            } else if (where === 'ans') {
              answer = answer.filter(x => x !== id); poolIds.push(id); SFX.tap();
            }
            render();
          },
          onTap: () => {
            if (busy) return;
            if (where === 'pool') { poolIds = poolIds.filter(x => x !== id); answer.push(id); SFX.pop(answer.length % 8); }
            else { answer = answer.filter(x => x !== id); poolIds.push(id); SFX.tap(); }
            render();
          },
        });
      });
      $('[data-check]', el).disabled = poolIds.length > 0 || busy;
    };

    const firstWrong = () => {
      for (let k = 0; k < tk.tokens.length; k++) if (!answer[k] && answer[k] !== 0 || tk.tokens[answer[k]].key !== tk.tokens[k].key) return k;
      return -1;
    };
    const check = () => {
      if (busy || poolIds.length) return;
      const k = firstWrong();
      if (k < 0) return success();
      wrongs++;
      const ansEl = $('#ans', el);
      const chips = $$('.wchip', ansEl);
      chips.forEach((c, n) => { if (n < k) c.classList.add('good'); else if (n === k) c.classList.add('bad'); });
      const mine = answer.map(id => tk.tokens[id].text).join(' ');
      if (!recorded) {
        recorded = true;
        Game.wrong({ topic: cur.topic, el: ansEl, mistake: { q: `Sentence Builder: "${cur.tr}"`, mine: mine + tk.end, correct: cur.en, exp: `Word order (${TOPICS[cur.topic] || 'grammar'}). Correct: ${cur.en}` } });
      } else { SFX.wrong(); ansEl.classList.remove('no'); void ansEl.offsetWidth; }
      ansEl.classList.add('no');
      const prev = k > 0 ? tk.tokens[answer[k - 1]].text : '';
      $('#hintbox', el).innerHTML = `<div class="c-hint">${icon('bulb')} ${k === 0 ? 'Think about how the sentence should <b>start</b>.' : `The first <b>${k}</b> word${k > 1 ? 's are' : ' is'} correct. Check the word after "<b>${esc(prev)}</b>".`}${wrongs >= 2 ? ' Try the Hint button!' : ''}</div>`;
    };
    const hint = () => {
      if (busy) return;
      let k = firstWrong();
      if (k < 0) k = answer.length;
      if (k >= tk.tokens.length) return;
      const needKey = tk.tokens[k].key;
      // keep the correct prefix, move the needed word into position k
      const prefix = answer.slice(0, k);
      const rest = [...answer.slice(k), ...poolIds];
      const ni = rest.findIndex(id => tk.tokens[id].key === needKey);
      if (ni < 0) return;
      const need = rest.splice(ni, 1)[0];
      answer = [...prefix, need];
      poolIds = rest;
      locked = k + 1; hints++;
      s.score = Math.max(0, s.score - 25); setScore(el, s.score);
      SFX.coin();
      $('#hintbox', el).innerHTML = `<div class="c-hint">${icon('bulb')} "${esc(tk.tokens[need].text)}" is word number ${k + 1}.</div>`;
      render();
      if (!poolIds.length) setTimeout(check, 300);
    };
    const success = () => {
      busy = true;
      const ansEl = $('#ans', el);
      $('#hintbox', el).innerHTML = '';
      ansEl.classList.add('ok');
      $$('.wchip', ansEl).forEach(c => c.classList.add('ok'));
      const pts = Math.max(30, 100 + tk.tokens.length * 10 - hints * 25 - wrongs * 15);
      if (wrongs === 0) Game.correct({ topic: cur.topic, points: pts, el: ansEl });
      else { s.score += Math.round(pts / 2); FX.float(ansEl, `+${Math.round(pts / 2)}`); SFX.correct(); }
      solved++; p.stats.sentences++;
      setScore(el, s.score);
      FX.burst(ansEl, 50);
      $('[data-check]', el).disabled = true;
      setTimeout(() => showSheet({
        good: true, title: pick(GOOD_WORDS),
        body: `<div class="wcard" style="--cc:var(--gc)"><div class="wc-ex"><div class="en" style="font-size:1.1rem">${speakBtn(cur.en)}<span><b>${esc(cur.en)}</b></span></div><div class="tr">${esc(cur.tr)}</div></div></div><div class="exp">${icon('book')} Topic: <b>${esc(TOPICS[cur.topic] || '')}</b></div>`,
        btn: i + 1 < list.length ? 'Next sentence' : 'See results', onNext: next,
      }), 800);
    };
    const next = () => { i++; if (i < list.length) load(); else finish(); };
    const finish = () => {
      Keys.fn = null;
      dailyEvent('sentenceSession', 1);
      const r = Game.finish();
      const stars = solved === list.length ? (r.wrong === 0 ? 3 : 2) : solved >= 3 ? 1 : 0;
      const order = ['easy', 'medium', 'hard'];
      const nextLvl = r.wrong <= 1 && lvl !== 'hard' ? order[order.indexOf(lvl) + 1] : lvl;
      showResults(el, r, {
        stars,
        subtitle: `${LEVELS[lvl].label} · ${solved}/${list.length} sentences built`,
        actions: Q ? questDone(Q, stars) : [
          { label: `Continue · ${LEVELS[nextLvl].label}`, icon: 'next', big: true, onClick: () => play(nextLvl) },
          { label: 'Difficulty', icon: 'settings', ghost: true, onClick: menu },
        ],
      });
    };
    load();
  };
  if (Q) play(Q.band); else menu();
};

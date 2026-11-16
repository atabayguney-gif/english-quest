/* =========================================================================
   FINAL EXAM (Unit Challenge) · REVIEW TEST (from mistakes) · CLASS BATTLE
   ========================================================================= */
'use strict';
const EXAM_TOPICS = { listening: 'Listening', matching: 'Vocabulary Matching', order: 'Word Order' };
function topicName(t) {
  if (TOPICS[t]) return TOPICS[t];
  if (EXAM_TOPICS[t]) return EXAM_TOPICS[t];
  if (t && t.startsWith('cat:')) { const c = CATEGORIES.find(x => x.id === t.slice(4)); return c ? c.name : t; }
  return t || 'General';
}
const KIND_LABEL = { mcq: 'Multiple Choice', spell: 'Spell the Word', order: 'Sentence Order', match: 'Match the Pairs', listen: 'Listen & Choose', odd: 'Odd One Out' };
const KIND_ICON = { mcq: 'question', spell: 'letters', order: 'blocks', match: 'link', listen: 'headphones', odd: 'search' };

function buildFinalExam(p) {
  const qs = [];
  const byTopic = {};
  const recent = new Set(p.recentQ || []);
  QUIZ.forEach(q => (byTopic[q.topic] = byTopic[q.topic] || []).push(q));
  // every new exam uses questions the student has not seen recently
  shuffle(Object.keys(byTopic)).slice(0, 8).forEach(t => {
    const fresh = byTopic[t].filter(q => !recent.has(q.id));
    qs.push({ kind: 'mcq', q: pick(fresh.length ? fresh : byTopic[t]), topic: t });
  });
  rememberQuestions(qs.map(x => x.q.id));
  pickWords(LETTER_WORDS.filter(w => w.key.length >= 4 && w.key.length <= 8), 3, p).forEach(w => qs.push({ kind: 'spell', w, topic: 'spelling' }));
  shuffle(SENTENCES.filter(s => s.level !== 'hard')).slice(0, 3).forEach(s => qs.push({ kind: 'order', s, topic: s.topic }));
  const matchPool = pickWords(VOCAB.filter(w => w.en.length <= 24 && w.tr.length <= 26), 30, p);
  for (let k = 0; k < 2; k++) {
    const set = [], trs = new Set();
    for (const w of matchPool) { const n = w.tr.split(',')[0]; if (set.length < 4 && !trs.has(n) && !qs.some(q => q.words && q.words.includes(w))) { set.push(w); trs.add(n); } }
    qs.push({ kind: 'match', words: set, topic: 'matching' });
  }
  pickWords(VOCAB.filter(w => w.en.length < 22), 2, p).forEach(w => {
    if (S().voice && Speech.supported) { qs.push({ kind: 'listen', w, topic: 'listening' }); return; }
    // voice is off → a silent vocabulary question instead of a listening one
    const m = meaningQuestion(w, { reverse: Math.random() < 0.5 });
    qs.push({ kind: 'mcq', topic: 'cat:' + w.cat, q: { q: m.q, options: m.options, answer: m.answer, exp: `'${w.en}' = ${w.tr}`, wordId: w.id } });
  });
  const groups = {
    schools: VOCAB.filter(w => w.cat === 'schools'),
    facilities: VOCAB.filter(w => w.cat === 'facilities' && !['headmaster', 'counsellor'].includes(w.id)),
    activities: VOCAB.filter(w => w.cat === 'activities'),
    feelings: VOCAB.filter(w => w.cat === 'feelings'),
    days: VOCAB.filter(w => w.cat === 'days' && (/_day$/.test(w.id) || w.id.startsWith('eid')) && w.en.length < 36),
  };
  const gk = shuffle(Object.keys(groups));
  for (let k = 0; k < 2; k++) {
    const main = gk[k * 2], other = gk[k * 2 + 1];
    qs.push({ kind: 'odd', three: shuffle(groups[main]).slice(0, 3), odd: pick(groups[other]), cat: main, oddCat: other, topic: 'cat:' + main });
  }
  return shuffle(qs);
}

GAMES.final = function (el, args) {
  const p = P();
  const Q = questFor('final', args);
  const played = GAME_IDS.filter(g => p.games[g].plays > 0).length;
  // exams are numbered and never end: Exam 1 → Exam 2 → Exam 3 …
  let examNo = Q ? Q.chapter : (p.games.final.plays || 0) + 1;
  const menu = () => startScreen(el, 'final', {
    desc: `<b>Exam ${examNo}</b> · The Unit 1 challenge! 20 questions with different game mechanics. Score 80% or more to become an <b>English Champion</b>.`,
    how: ['Multiple choice, spelling, sentence order, matching, listening and odd-one-out.', 'No hints in the exam — do your best!', 'At the end you see your mistakes with the solutions, then the next exam.'],
    extra: `${played < GAME_IDS.length ? `<div class="tip" style="max-width:30rem">${icon('info')}<span>Recommended: play all ${GAME_IDS.length} mini games first (<b>${played}/${GAME_IDS.length}</b> played). You can still start now!</span></div>` : ''}
      ${(p.games.final.history || []).length ? `<div class="chips" style="justify-content:center;flex-wrap:wrap">${p.games.final.history.slice(-6).map(h => `<span class="chip c" style="--cc:${h.pct >= 80 ? '#22C55E' : '#F59E0B'}">Exam ${h.n}: ${h.pct}%</span>`).join('')}</div>` : ''}`,
    btn: `Start Exam ${examNo}`,
    onStart: run,
  });

  const run = () => {
    const qs = buildFinalExam(p);
    const s = Game.start('final');
    p.games.final.lastT = s.t0;
    const results = [];
    let i = 0;
    const draw = () => {
      const q = qs[i];
      el.innerHTML = gameTop('final', `${Q ? `Chapter ${Q.chapter} · ` : ''}Exam ${examNo} · Question ${i + 1} of ${qs.length}`, scorePill(s.score)) + `
        <div class="g-body">
          <div class="g-progress" style="margin-bottom:.8rem"><i style="width:${(i / qs.length) * 100}%"></i></div>
          <div id="qa" style="flex:1;display:flex;flex-direction:column;justify-content:center;overflow-y:auto;padding-bottom:.6rem"></div>
        </div>`;
      bindBack(el, { ask: true });
      const box = $('#qa', el);
      const head = `<div class="qz-meta"><span class="chip c" style="--cc:var(--gc)">${icon(KIND_ICON[q.kind])} ${KIND_LABEL[q.kind]}</span><span class="chip">${esc(topicName(q.topic))}</span></div>`;
      const done = (ok, info) => {
        results.push(Object.assign({ ok, topic: q.topic, kind: q.kind }, info));
        if (ok) Game.correct({ wordId: info.wordId, topic: TOPICS[q.topic] ? q.topic : null, points: 100, el: box });
        else Game.wrong({ wordId: info.wordId, topic: TOPICS[q.topic] ? q.topic : null, mistake: { q: info.q, mine: info.mine, correct: info.correct, exp: info.exp, qid: info.qid || null } });
        setScore(el, s.score);
        setTimeout(() => { i++; i < qs.length ? draw() : finish(); }, ok ? 900 : 1700);
      };

      if (q.kind === 'mcq' || q.kind === 'listen' || q.kind === 'odd') {
        let item;
        if (q.kind === 'mcq') item = { q: q.q.q, options: q.q.options, answer: q.q.answer, exp: q.q.exp, wordId: q.q.wordId, qid: q.q.id };
        if (q.kind === 'listen') { const m = meaningQuestion(q.w); item = { q: 'Listen and choose the Turkish meaning.', options: m.options, answer: m.answer, exp: `'${q.w.en}' = ${q.w.tr}`, wordId: q.w.id }; }
        if (q.kind === 'odd') {
          const c1 = CATEGORIES.find(c => c.id === q.cat), c2 = CATEGORIES.find(c => c.id === q.oddCat);
          item = { q: 'Which word does NOT belong to the group?', options: [q.odd.en, ...q.three.map(w => w.en)], answer: q.odd.en, exp: `${q.three.map(w => w.en).join(', ')} → ${c1.name}. '${q.odd.en}' → ${c2.name}.`, wordId: q.odd.id };
        }
        const { opts, html } = mcqHTML({ q: item.q, options: item.options }, { chips: false });
        box.innerHTML = html.replace('<div class="qz-card">', `<div class="qz-card">${head}`) ;
        if (q.kind === 'listen') {
          const card = $('.qz-card', box);
          card.insertAdjacentHTML('beforeend', `<button class="listen-big" data-say="${esc(q.w.en)}">${icon('volume')}</button>${Speech.supported && S().voice ? '' : `<p class="center" style="font-family:var(--display);font-size:1.6rem">${esc(q.w.en)}</p>`}`);
        }
        bindMCQ(box, opts, item.answer, (ok, picked) => done(ok, { q: item.q + (q.kind === 'listen' ? ` (${q.w.en})` : ''), mine: picked, correct: item.answer, exp: item.exp, wordId: item.wordId, qid: item.qid }));
        return;
      }

      if (q.kind === 'spell') {
        const w = q.w, target = w.key;
        let letters = shuffle(target.split('').map((ch, k) => ({ ch, k })));
        if (letters.map(x => x.ch).join('') === target) letters = letters.reverse();
        const filled = [];
        box.innerHTML = `<div class="qz-card">${head}<div class="qz-q">Spell the English word for: <b style="color:var(--gc)">${esc(w.tr)}</b></div></div>
          <div class="wc-area" style="flex:none;margin-top:1.2rem;--ts:${Math.min(60, Math.floor((Math.min(el.clientWidth, 700) - 40) / target.length))}px"><div class="slots" id="sl"></div><div class="tiles" id="tl"></div></div>`;
        const upd = () => {
          $('#sl', box).innerHTML = target.split('').map((_, k) => `<div class="slot ${filled[k] ? 'filled' : ''}" data-k="${k}">${filled[k] ? filled[k].ch : ''}</div>`).join('');
          $('#tl', box).innerHTML = letters.map((t, k) => `<div class="tile ${filled.includes(t) ? 'used' : ''}" data-k="${k}" style="--i:${k};--tc:${TILE_COLORS[k % TILE_COLORS.length]};animation:none">${t.ch}</div>`).join('');
          $$('.tile', box).forEach(n => n.onclick = () => { const t = letters[+n.dataset.k]; if (filled.includes(t)) return; filled.push(t); SFX.pop(filled.length); upd(); if (filled.length === target.length) check(); });
          $$('.slot', box).forEach(n => n.onclick = () => { const k = +n.dataset.k; if (k === filled.length - 1) { filled.pop(); SFX.tap(); upd(); } });
        };
        const check = () => {
          const guess = filled.map(t => t.ch).join('');
          const ok = guess === target;
          $$('.slot', box).forEach(n => n.classList.add(ok ? 'ok' : 'no'));
          if (!ok) setTimeout(() => { $('#sl', box).insertAdjacentHTML('afterend', `<div class="ans-row" style="justify-content:center;margin-top:.6rem"><span class="right">${target}</span></div>`); }, 300);
          done(ok, { q: `Spell the word for "${w.tr}"`, mine: guess, correct: target, exp: `${target} = ${w.tr}`, wordId: w.id });
        };
        Keys.fn = e => { const k = normalizeKey(e.key); const t = letters.find(x => x.ch === k && !filled.includes(x)); if (t) { filled.push(t); upd(); if (filled.length === target.length) check(); } if (e.key === 'Backspace' && filled.length) { filled.pop(); upd(); } };
        upd();
        return;
      }

      if (q.kind === 'order') {
        const tk = tokenizeSentence(q.s.en);
        let poolIds = shuffle(tk.tokens.map(t => t.id)); const ans = [];
        if (poolIds.map(x => tk.tokens[x].key).join(' ') === tk.tokens.map(t => t.key).join(' ')) poolIds = poolIds.reverse();
        box.innerHTML = `<div class="qz-card">${head}<div class="qz-q">Put the words in order:<br><span style="color:var(--gc)">${esc(q.s.tr)}</span></div></div>
          <div class="sb-area" style="flex:none;margin-top:1rem"><div class="sb-answer" id="ans"></div><div class="sb-pool" id="pool"></div>
          <div class="center"><button class="btn big" id="chk" style="--c:var(--gc);--cd:var(--gd)" disabled>${icon('check')} Check</button></div></div>`;
        const upd = () => {
          $('#ans', box).innerHTML = ans.length ? ans.map(id => `<div class="wchip" data-id="${id}" style="animation:none">${esc(tk.tokens[id].text)}</div>`).join('') + `<span class="sb-end">${tk.end}</span>` : '<span class="ph">Tap the words in the correct order…</span>';
          $('#pool', box).innerHTML = poolIds.map(id => `<div class="wchip" data-id="${id}" style="animation:none">${esc(tk.tokens[id].text)}</div>`).join('');
          $$('#ans .wchip', box).forEach(c => c.onclick = () => { const id = +c.dataset.id; ans.splice(ans.indexOf(id), 1); poolIds.push(id); SFX.tap(); upd(); });
          $$('#pool .wchip', box).forEach(c => c.onclick = () => { const id = +c.dataset.id; poolIds = poolIds.filter(x => x !== id); ans.push(id); SFX.pop(ans.length % 8); upd(); });
          $('#chk', box).disabled = poolIds.length > 0;
        };
        $('#chk', box).onclick = () => {
          $('#chk', box).disabled = true;
          const mine = ans.map(id => tk.tokens[id].key).join(' ');
          const ok = mine === tk.tokens.map(t => t.key).join(' ');
          $('#ans', box).classList.add(ok ? 'ok' : 'no');
          if (!ok) $('#ans', box).insertAdjacentHTML('afterend', `<div class="ans-row" style="justify-content:center"><span class="right">${esc(q.s.en)}</span></div>`);
          done(ok, { q: `Order: "${q.s.tr}"`, mine: ans.map(id => tk.tokens[id].text).join(' ') + tk.end, correct: q.s.en, exp: `Correct order: ${q.s.en}` });
        };
        upd();
        return;
      }

      if (q.kind === 'match') {
        const ens = shuffle(q.words), trs = shuffle(q.words);
        let sel = null, wrongs = 0, matched = 0, firstMiss = null;
        box.innerHTML = `<div class="qz-card">${head}<div class="qz-q">Match the English words with their Turkish meanings.</div></div>
          <div class="mini-match"><div class="match-col">${ens.map((w, k) => `<button class="mcard en" style="--i:${k};padding-left:.7rem" data-side="en" data-id="${w.id}">${esc(w.en)}</button>`).join('')}</div>
          <div class="match-col">${trs.map((w, k) => `<button class="mcard" style="--i:${k}" data-side="tr" data-id="${w.id}">${esc(w.tr)}</button>`).join('')}</div></div>`;
        $$('.mcard', box).forEach(c => c.onclick = () => {
          if (c.classList.contains('ok')) return;
          if (!sel || sel.dataset.side === c.dataset.side) { if (sel) sel.classList.remove('sel'); sel = c; c.classList.add('sel'); SFX.tap(); return; }
          const a = sel, b = c; sel = null; a.classList.remove('sel');
          if (a.dataset.id === b.dataset.id) { a.classList.add('ok'); b.classList.add('ok'); SFX.pop(matched + 2); matched++; }
          else {
            wrongs++; a.classList.add('no'); b.classList.add('no'); SFX.wrong();
            const enId = a.dataset.side === 'en' ? a.dataset.id : b.dataset.id, trId = a.dataset.side === 'tr' ? a.dataset.id : b.dataset.id;
            if (!firstMiss) firstMiss = { en: VOCAB_BY_ID[enId], tr: VOCAB_BY_ID[trId] };
            setTimeout(() => { a.classList.remove('no'); b.classList.remove('no'); }, 600);
          }
          if (matched === q.words.length) {
            const ok = wrongs === 0;
            done(ok, ok ? { q: 'Match the pairs' } : { q: `Match: "${firstMiss.en.en}"`, mine: firstMiss.tr.tr, correct: firstMiss.en.tr, exp: `'${firstMiss.en.en}' = ${firstMiss.en.tr}`, wordId: firstMiss.en.id });
          }
        });
      }
    };

    const finish = () => {
      Keys.fn = null;
      const total = results.length;
      const okN = results.filter(r => r.ok).length;
      const pct = Math.round((okN / total) * 100);
      const per = {};
      results.forEach(r => { const t = topicName(r.topic); per[t] = per[t] || { c: 0, n: 0 }; per[t].n++; if (r.ok) per[t].c++; });
      const strong = Object.entries(per).filter(([, v]) => v.c / v.n >= 0.75).map(([k]) => k);
      const weak = Object.entries(per).filter(([, v]) => v.c / v.n < 0.75).map(([k]) => k);
      const learned = [...s.wordsOk].map(id => VOCAB_BY_ID[id]).filter(Boolean);
      const wrongs = results.filter(r => !r.ok);
      const report = `
        <div class="card pad report">
          <div class="row gap" style="align-items:center">
            <div class="ring" style="--p:${pct};--rc:${pct >= 80 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#EF4444'}"><b>${pct}%</b></div>
            <div><h3>${pct >= 80 ? 'You passed! English Champion!' : pct >= 50 ? 'Good, but keep practising' : 'More practice needed'}</h3><p class="muted small" style="font-weight:800">${okN} of ${total} correct · overall success rate</p></div>
          </div>
          ${pct < 80 ? `<div class="tip">${icon('bulb')}<span>Your score is below 80%. Review these topics: <b>${weak.map(esc).join(', ') || 'all topics'}</b>. Then try the exam again!</span></div>` : ''}
          <div><h4>${icon('check')} Strong topics</h4><div class="tags">${strong.length ? strong.map(t => `<span class="chip tag-strong">${esc(t)}</span>`).join('') : '<span class="muted small">—</span>'}</div></div>
          <div><h4>${icon('alert')} Weak topics</h4><div class="tags">${weak.length ? weak.map(t => `<span class="chip tag-weak">${esc(t)}</span>`).join('') : '<span class="muted small">None!</span>'}</div></div>
          <div><h4>${icon('book')} Words you know</h4><div class="tags">${learned.length ? learned.map(w => `<span class="chip">${esc(w.en)}</span>`).join('') : '<span class="muted small">—</span>'}</div></div>
          ${wrongs.length ? `<div><h4>${icon('wrench')} Your mistakes & the solutions</h4><div style="display:grid;gap:.5rem">${wrongs.map((r, k) => `<div class="exp"><b>${k + 1}. ${esc(r.q)}</b><div class="ans-row" style="margin:.35rem 0">${r.mine ? `<span class="mine">${esc(r.mine)}</span>` : ''}<span class="right">${icon('check')} ${esc(r.correct)}</span></div><span class="small">${esc(r.exp || '')}</span></div>`).join('')}</div></div>` : `<div class="tip">${icon('sparkles')}<span>No mistakes in this exam. Perfect!</span></div>`}
          ${pct < 80 ? `<div class="row gap" style="flex-wrap:wrap"><button class="btn sm" data-go="learn">${icon('book')} Learn words</button><button class="btn sm ghost" data-go="play/quiz">${icon('question')} Practice quiz</button></div>` : ''}
        </div>`;
      p.games.final.history = [...(p.games.final.history || []), { n: examNo, pct, t: Date.now() }].slice(-30);
      const r = Game.finish({ percent: pct, bonusXP: pct >= 80 ? 60 : 0 });
      const stars = pct >= 90 ? 3 : pct >= 80 ? 2 : pct >= 50 ? 1 : 0;
      const fix = wrongs.length ? [{ label: `Solve my ${wrongs.length} mistake${wrongs.length > 1 ? 's' : ''}`, icon: 'wrench', ghost: true, onClick: () => Router.go(`play/review/final${Q ? '/quest' : ''}`) }] : [];
      const actions = Q ? [...questDone(Q, stars).slice(0, 1), ...fix]
        : [{ label: `Continue · Exam ${examNo + 1}`, icon: 'next', big: true, onClick: () => { examNo++; run(); } }, ...fix];
      showResults(el, r, {
        stars,
        title: pct >= 80 ? 'Champion!' : `Exam ${examNo} complete`,
        subtitle: `Exam ${examNo} · ${pct}% success · next: Exam ${examNo + 1}`,
        extraHTML: report,
        actions,
      });
    };
    draw();
  };
  if (Q) run(); else menu();
};

/* ------------------------------ REVIEW TEST ------------------------------ */
function sentenceVariants(en, n = 3) {
  const tk = tokenizeSentence(en);
  const base = tk.tokens.map(t => t.text);
  const out = new Set();
  let guard = 0;
  while (out.size < n && guard++ < 60) {
    const a = base.slice();
    const i = randInt(0, a.length - 2);
    const j = Math.random() < 0.6 ? i + 1 : randInt(0, a.length - 1);
    if (i === j) continue;
    [a[i], a[j]] = [a[j], a[i]];
    let str = a.join(' ');
    str = str.charAt(0).toUpperCase() + str.slice(1) + tk.end;
    if (str.toLowerCase() !== en.toLowerCase()) out.add(str);
  }
  return [...out];
}
GAMES.review = function (el, args = []) {
  const p = P();
  const fromExam = args[0] === 'final';
  const fromQuest = args.includes('quest');
  // after an exam: only that exam's mistakes are solved again
  const open = p.mistakes.filter(m => !m.fixed && (!fromExam || (m.game === 'final' && m.t >= (p.games.final.lastT || 0))));
  const seen = new Set(), items = [];
  for (const m of open) {
    const key = m.qid || m.q;
    if (seen.has(key)) continue;
    seen.add(key);
    let it = null;
    const qq = m.qid ? QUIZ.find(q => q.id === m.qid) : QUIZ.find(q => q.q === m.q && q.answer === m.correct);
    if (qq) it = { q: qq.q, options: qq.options, answer: qq.answer, exp: qq.exp, wordId: qq.wordId, topic: qq.topic, key, type: qq.type };
    else if (m.wordId && VOCAB_BY_ID[m.wordId]) { const mq = meaningQuestion(VOCAB_BY_ID[m.wordId], { reverse: Math.random() < 0.5 }); it = Object.assign(mq, { exp: `'${VOCAB_BY_ID[m.wordId].en}' = ${VOCAB_BY_ID[m.wordId].tr}`, wordId: m.wordId, key, type: 'vocab' }); }
    else if (m.game === 'sentence' || /^Order:/.test(m.q)) { const v = sentenceVariants(m.correct); if (v.length === 3) it = { q: `Which sentence is correct? (${m.q.replace(/^.*?"|"$/g, '')})`, options: [m.correct, ...v], answer: m.correct, exp: m.exp, key, type: 'select', topic: m.topic }; }
    if (it) items.push(it);
    if (items.length >= 10) break;
  }
  if (!items.length) {
    startScreen(el, 'review', { desc: 'You have no mistakes to review right now. Great job!', btn: 'Back to Mistakes', onStart: () => Router.go('mistakes') });
    return;
  }
  const s = Game.start('review');
  let i = 0, fixedNow = 0;
  const draw = () => {
    const it = items[i];
    const { opts, html } = mcqHTML(it, { label: 'Review' });
    el.innerHTML = gameTop('review', `Question ${i + 1} of ${items.length}`, scorePill(s.score)) + `
      <div class="g-body"><div class="g-progress" style="margin-bottom:.8rem"><i style="width:${(i / items.length) * 100}%"></i></div>
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;overflow-y:auto">${html}</div></div>`;
    bindBack(el, { to: 'mistakes' });
    bindMCQ(el, opts, it.answer, (ok, picked, btn) => {
      if (ok) {
        Game.correct({ wordId: it.wordId, topic: it.topic, points: 80, el: btn });
        p.mistakes.forEach(m => { if (!m.fixed && (m.qid || m.q) === it.key) m.fixed = true; });
        p.stats.fixed++; fixedNow++; dailyEvent('fix', 1);
      } else {
        Game.wrong({ wordId: it.wordId, topic: it.topic, el: btn });
      }
      setScore(el, s.score);
      DB.save();
      setTimeout(() => showSheet({ good: ok, title: ok ? 'Mistake fixed!' : 'Correct answer: ' + it.answer, body: `<div class="exp">${esc(it.exp || '')}</div>`, btn: i + 1 < items.length ? 'Next' : 'See results', onNext: () => { i++; i < items.length ? draw() : finish(); } }), 450);
    });
  };
  const finish = () => {
    const r = Game.finish();
    const next = fromQuest ? questStage(p.quest.stage) : null;
    const actions = fromQuest
      ? [{ label: `Continue · ${GAME_META[next.game].name}`, icon: 'next', big: true, onClick: () => Router.go(questRoute(next)) }]
      : fromExam
        ? [{ label: `Continue · Exam ${(p.games.final.plays || 0) + 1}`, icon: 'next', big: true, onClick: () => Router.go('play/final') }]
        : [{ label: 'Mistakes', icon: 'alert', big: true, onClick: () => Router.go('mistakes') }];
    actions.push({ label: 'Home', icon: 'home', ghost: true, onClick: () => Router.go('home') });
    showResults(el, r, { noRank: true, subtitle: `${fixedNow} mistake${fixedNow === 1 ? '' : 's'} fixed`, actions });
  };
  draw();
};

/* ------------------------------ CLASS BATTLE ------------------------------ */
GAMES.battle = function (el) {
  const p = P();
  let timer = 0;
  const setup = () => {
    clearInterval(timer);
    let count = 10;
    startScreen(el, 'battle', {
      desc: 'Two teams take turns answering questions on the smart board. Faster answers earn more points!',
      extra: `<div class="team-inputs"><input class="a" maxlength="16" value="Red Team" aria-label="Team 1 name"><input class="b" maxlength="16" value="Blue Team" aria-label="Team 2 name"></div>
        <div class="mode-row">${[10, 16, 20].map(n => `<button class="mode-card" data-n="${n}">${icon('question')}<b>${n} questions</b><small>${n / 2} per team</small></button>`).join('')}</div>`,
      btn: 'Start the battle',
      onBind: e => {
        const upd = () => $$('[data-n]', e).forEach(b => b.classList.toggle('sel', +b.dataset.n === count));
        $$('[data-n]', e).forEach(b => b.onclick = () => { count = +b.dataset.n; SFX.tap(); upd(); });
        upd();
      },
      onStart: () => play([$('.team-inputs .a', el).value.trim() || 'Red Team', $('.team-inputs .b', el).value.trim() || 'Blue Team'], count),
    });
  };
  const play = (names, count) => {
    const TIME = 20;
    const teams = names.map(n => ({ name: n, score: 0, ok: 0 }));
    const qs = pickQuestions(count, QUIZ, p);
    let qi = 0, left = TIME;
    const draw = () => {
      const turn = qi % 2, q = qs[qi];
      const { opts, html } = mcqHTML(q);
      left = TIME;
      el.innerHTML = gameTop('battle', `Question ${qi + 1} of ${qs.length}`) + `
        <div class="g-body">
          <div class="bt-score">
            <div class="bt-team a ${turn === 0 ? 'active' : ''}"><b>${esc(teams[0].name)}</b><span class="sc">${teams[0].score}</span></div>
            <span class="bt-vs">VS</span>
            <div class="bt-team b ${turn === 1 ? 'active' : ''}"><b>${esc(teams[1].name)}</b><span class="sc">${teams[1].score}</span></div>
          </div>
          <div class="bt-turn" style="color:${turn === 0 ? '#E11D48' : '#2563EB'}">${esc(teams[turn].name)} — your turn!</div>
          <div class="mt-timer" id="tm"><span>${icon('clock')}</span><div class="g-progress"><i style="width:100%"></i></div><b id="tml">${TIME}s</b></div>
          <div style="flex:1;display:flex;flex-direction:column;justify-content:center;overflow-y:auto">${html}</div>
        </div>`;
      bindBack(el);
      $('[data-back]', el).onclick = async () => { if (await confirmBox('Stop the battle?', 'The current scores will be lost.', 'Stop')) Router.go('games'); };
      clearInterval(timer);
      timer = setInterval(() => {
        left--;
        const tm = $('#tm', el); if (!tm) return clearInterval(timer);
        $('i', tm).style.width = (left / TIME) * 100 + '%'; $('#tml', el).textContent = left + 's';
        tm.classList.toggle('low', left <= 5);
        if (left <= 5 && left > 0) SFX.tick();
        if (left <= 0) {
          clearInterval(timer); Keys.fn = null;
          $$('.opt', el).forEach(x => { x.disabled = true; if (opts[+x.dataset.i] === q.answer) x.classList.add('ok'); else x.classList.add('dim'); });
          SFX.wrong();
          answered(false, null, true);
        }
      }, 1000);
      bindMCQ(el, opts, q.answer, (ok, picked, btn) => {
        clearInterval(timer);
        if (ok) {
          const pts = 100 + left * 5;
          teams[turn].score += pts; teams[turn].ok++;
          FX.float(btn, `+${pts}`); SFX.correct(); FX.burst(btn, 30);
        } else SFX.wrong();
        answered(ok, picked, false);
      });
      const answered = (ok, picked, timeout) => {
        const nextTeam = teams[(qi + 1) % 2].name;
        setTimeout(() => showSheet({
          good: ok, title: ok ? `${pick(GOOD_WORDS)} +${100 + left * 5}` : timeout ? "Time's up!" : 'Correct answer: ' + q.answer,
          body: `<div class="exp">${esc(q.exp)}</div>`,
          btn: qi + 1 < qs.length ? `Next: ${nextTeam}` : 'Show the winner',
          onNext: () => { qi++; qi < qs.length ? draw() : end(); },
        }), 500);
      };
    };
    const end = () => {
      clearInterval(timer);
      p.stats.battles++; addXP(30); checkAchievements();
      const [a, b] = teams;
      const draw_ = a.score === b.score;
      const win = a.score > b.score ? a : b;
      el.innerHTML = gameTop('battle', 'Final score') + `
        <div class="g-start">
          <div class="trophy-big">${icon(draw_ ? 'users' : 'trophy')}</div>
          <h1>${draw_ ? "It's a draw!" : esc(win.name) + ' wins!'}</h1>
          <div class="bt-score" style="width:min(34rem,100%)">
            <div class="bt-team a active"><b>${esc(a.name)}</b><span class="sc">${a.score}</span></div><span class="bt-vs">VS</span>
            <div class="bt-team b active"><b>${esc(b.name)}</b><span class="sc">${b.score}</span></div>
          </div>
          <p class="muted" style="font-weight:800">${esc(a.name)}: ${a.ok} correct · ${esc(b.name)}: ${b.ok} correct</p>
          <div class="row gap"><button class="btn big" data-again>${icon('repeat')} Rematch</button><button class="btn big ghost" data-go="home">${icon('home')} Home</button></div>
        </div>`;
      bindBack(el);
      $('[data-again]', el).onclick = () => play(names, count);
      FX.rain(); SFX.win(); setTimeout(() => FX.confetti({ count: 160 }), 400);
    };
    draw();
  };
  setup();
  return () => clearInterval(timer);
};

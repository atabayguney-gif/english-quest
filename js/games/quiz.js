/* =========================================================================
   GAME 4 — ENGLISH QUIZ · Test Your Knowledge
   6 question types, 4 options each, explanations, weak-topic report.
   Questions are weighted toward the student's weak topics/words and
   recently seen questions are avoided.
   ========================================================================= */
'use strict';
function pickQuestions(n, pool = QUIZ, p = P()) {
  const recent = new Set(p.recentQ || []);
  const fresh = pool.filter(q => !recent.has(q.id));
  const base = fresh.length >= n ? fresh : pool;
  const picked = weightedSample(base, n, q => {
    const t = p.topics[q.topic];
    const weak = t ? (t.w + 0.5) / (t.c + t.w + 1) : 0.4;
    const ws = q.wordId && p.words[q.wordId];
    return 1 + weak * 2.5 + (ws ? ws.w * 0.6 : 0);
  });
  // spread question types so the same type is not shown back-to-back
  const out = [];
  const rest = picked.slice();
  while (rest.length) {
    const last = out[out.length - 1];
    const i = rest.findIndex(q => !last || q.type !== last.type);
    out.push(rest.splice(i < 0 ? 0 : i, 1)[0]);
  }
  return out;
}
function rememberQuestions(ids) {
  const p = P();
  p.recentQ = [...ids, ...(p.recentQ || []).filter(x => !ids.includes(x))].slice(0, 45);
}
function quizReportHTML(s, total) {
  const pct = total ? Math.round((s.correct / total) * 100) : 0;
  const weak = Object.keys(s.topicsBad).map(t => TOPICS[t] || t);
  const strong = Object.keys(s.topicsOk).filter(t => !s.topicsBad[t]).map(t => TOPICS[t] || t);
  const review = [...s.wordsBad].map(id => VOCAB_BY_ID[id]).filter(Boolean);
  return `<div class="card pad report">
    <div class="r-row">
      <div><b>${total}</b><small>Total Questions</small></div>
      <div><b style="color:var(--green-d)">${s.correct}</b><small>Correct Answers</small></div>
      <div><b style="color:var(--red-d)">${s.wrong}</b><small>Wrong Answers</small></div>
      <div><b>${pct}%</b><small>Success Rate</small></div>
    </div>
    <div><h4>${icon('alert')} Weak Topics</h4><div class="tags">${weak.length ? weak.map(t => `<span class="chip tag-weak">${esc(t)}</span>`).join('') : '<span class="muted small">None — great work!</span>'}</div></div>
    ${strong.length ? `<div><h4>${icon('check')} Strong Topics</h4><div class="tags">${strong.map(t => `<span class="chip tag-strong">${esc(t)}</span>`).join('')}</div></div>` : ''}
    <div><h4>${icon('book')} Words to Review</h4><div class="tags">${review.length ? review.map(w => `<span class="chip" title="${esc(w.tr)}">${esc(w.en)} · <span class="muted">${esc(w.tr)}</span></span>`).join('') : '<span class="muted small">No words to review.</span>'}</div></div>
  </div>`;
}

GAMES.quiz = function (el, args) {
  const p = P();
  const Q = questFor('quiz', args);
  const N = 10;
  const menu = () => startScreen(el, 'quiz', {
    desc: `${N} questions about ${UNIT.title}: vocabulary, national days and grammar.`,
    how: ['Multiple Choice · Fill in the Blanks · True or False', 'Sentence Completion · Vocabulary · Correct Word Selection', 'Read the explanation after each answer. Keys 1–4 work too!'],
    btn: 'Start quiz',
    onStart: play,
  });

  const play = () => {
    const qs = pickQuestions(N, QUIZ, p);
    rememberQuestions(qs.map(q => q.id));
    const s = Game.start('quiz');
    let i = 0;
    const draw = () => {
      const q = qs[i];
      const { opts, html } = mcqHTML(q);
      el.innerHTML = gameTop('quiz', `${Q ? `Chapter ${Q.chapter} · ` : ''}Question ${i + 1} of ${qs.length}`, scorePill(s.score)) + `
        <div class="g-body" style="gap:.2rem">
          <div class="g-progress" style="margin-bottom:.8rem"><i style="width:${(i / qs.length) * 100}%"></i></div>
          <div style="flex:1;display:flex;flex-direction:column;justify-content:center;overflow-y:auto;padding-bottom:.5rem">${html}</div>
        </div>`;
      bindBack(el, { ask: true });
      bindMCQ(el, opts, q.answer, (ok, picked, btn) => {
        const w = q.wordId ? VOCAB_BY_ID[q.wordId] : null;
        if (ok) Game.correct({ wordId: q.wordId, topic: q.topic, points: 100, el: btn });
        else Game.wrong({ wordId: q.wordId, topic: q.topic, el: btn, mistake: { q: q.q, mine: picked, correct: q.answer, exp: q.exp, qid: q.id } });
        setScore(el, s.score);
        const body = `${ok ? '' : `<div class="ans-row"><span class="mine">${esc(picked)}</span><span class="right">${esc(q.answer)}</span></div>`}
          <div class="exp">${esc(q.exp)}</div>
          ${w ? `<div class="exp" style="display:flex;align-items:center;gap:.6rem">${speakBtn(w.en, 'sm')}<span><b>${esc(w.en)}</b> = ${esc(w.tr)}</span></div>` : ''}`;
        setTimeout(() => showSheet({ good: ok, title: ok ? pick(GOOD_WORDS) : 'Correct answer: ' + q.answer, body, btn: i + 1 < qs.length ? 'Next question' : 'See report', onNext: () => { i++; i < qs.length ? draw() : finish(); } }), ok ? 450 : 650);
      });
    };
    const finish = () => {
      const total = s.correct + s.wrong;
      const pct = total ? Math.round((s.correct / total) * 100) : 0;
      if (pct >= 80) dailyEvent('quiz80', 1);
      if (pct === 100) p.stats.perfect++;
      const report = quizReportHTML(s, total);
      const r = Game.finish();
      showResults(el, r, {
        subtitle: `Success rate ${pct}%`,
        extraHTML: report,
        actions: Q ? questDone(Q, pct >= 90 ? 3 : pct >= 65 ? 2 : 1) : [
          { label: 'Continue · Next quiz', icon: 'next', big: true, onClick: play },
          { label: 'Fix my mistakes', icon: 'wrench', ghost: true, onClick: () => Router.go('play/review') },
        ],
      });
    };
    draw();
  };
  if (Q) play(); else menu();
};

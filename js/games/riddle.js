/* =========================================================================
   GAME 7 — WORD RIDDLE · Kelime Bilmecesi
   Three kinds of questions about Unit 1 words:
     • Riddle  — read the English clue, find the English word
     • English → Türkçe — what is the Turkish meaning?
     • Türkçe → English — what is it in English?
   Hints (each costs points): 1) letter pattern / example, 2) Turkish meaning
   or example sentence, 3) 50:50 (removes two wrong answers).
   ========================================================================= */
'use strict';
const RIDDLE_MODES = {
  riddle: { label: 'Riddle · Bilmece', ask: 'Which word is it?', icon: 'bulb' },
  en2tr: { label: 'English → Türkçe', ask: 'What is the Turkish meaning?', icon: 'repeat' },
  tr2en: { label: 'Türkçe → English', ask: 'What is it in English?', icon: 'repeat' },
};
function letterPattern(en) {
  return en.replace(/\s*\(.*?\)/g, '').split(' ').map(w => w.charAt(0).toUpperCase() + ' _'.repeat(Math.max(0, w.replace(/[^A-Za-z]/g, '').length - 1))).join('   ');
}
function blankExample(w) {
  const base = w.en.replace(/\s*\(.*?\)/g, '').trim();
  const re = new RegExp(base.split(/\s+/).map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+') + '\\w*', 'i');
  return re.test(w.ex) ? w.ex.replace(re, '______') : null;
}

GAMES.riddle = function (el, args) {
  const p = P();
  const Q = questFor('riddle', args);
  const N = 10;
  const menu = () => startScreen(el, 'riddle', {
    desc: 'Solve word riddles from Unit 1! Find the English word or its Turkish meaning.',
    how: ['Riddle: read the clue and find the English word.', 'English → Türkçe and Türkçe → English questions.', 'Stuck? Hints show the first letters, the meaning or an example — or remove two wrong answers.'],
    btn: 'Start riddles',
    onStart: play,
  });

  const play = () => {
    const words = pickWords(VOCAB.filter(w => w.riddle), N, p);
    const modeList = shuffle([...Array(N)].map((_, k) => ['riddle', 'riddle', 'en2tr', 'tr2en'][k % 4]));
    const items = words.map((w, k) => ({ w, mode: modeList[k] }));
    const s = Game.start('riddle');
    let i = 0, totalHints = 0;

    const draw = () => {
      const { w, mode } = items[i];
      const M = RIDDLE_MODES[mode];
      const norm = x => x.tr.split(',')[0].trim().toLowerCase();
      const pool = VOCAB.filter(x => x.id !== w.id && norm(x) !== norm(w));
      const distract = [...shuffle(pool.filter(x => x.cat === w.cat)), ...shuffle(pool.filter(x => x.cat !== w.cat))].slice(0, 3);
      const answerEN = mode !== 'en2tr';
      const answer = answerEN ? w.en : w.tr;
      // four different options (never two identical answers)
      const uniq = [answer];
      for (const d of [...distract, ...shuffle(pool)]) { const o = answerEN ? d.en : d.tr; if (!uniq.includes(o)) uniq.push(o); if (uniq.length === 4) break; }
      const opts = shuffle(uniq);
      const cat = CATEGORIES.find(c => c.id === w.cat);
      let hints = 0;
      const main = mode === 'riddle' ? `“${esc(w.riddle)}”` : mode === 'en2tr' ? `${esc(w.en)} ${speakBtn(w.en)}` : esc(w.tr);
      el.innerHTML = gameTop('riddle', `${Q ? `Chapter ${Q.chapter} · ` : ''}Riddle ${i + 1} of ${items.length}`, `<button class="score-pill hint-pill" data-hint title="Hint (-20)">${icon('bulb')}<span><span class="hp-l">Hint </span><b id="hn">1/3</b></span></button>` + scorePill(s.score)) + `
        <div class="g-body">
          ${stepsHTML(items.length, i)}
          <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:.8rem;overflow-y:auto;padding-bottom:.4rem">
            <div class="qz-card riddle-card">
              <div class="qz-meta"><span class="chip c" style="--cc:var(--gc)">${icon(M.icon)} ${M.label}</span><span class="chip">${esc(cat ? cat.name : '')}</span></div>
              <div class="riddle-main ${mode === 'riddle' ? 'is-riddle' : ''}">${main}</div>
              <div class="riddle-ask">${M.ask}</div>
              <div id="hints"></div>
            </div>
            <div class="qz-opts" style="${opts.some(o => o.length > 30) ? 'grid-template-columns:1fr' : ''}">${opts.map((o, k) => `<button class="opt" data-i="${k}" style="--i:${k}"><span class="ol">${'ABCD'[k]}</span><span>${esc(o)}</span></button>`).join('')}</div>
          </div>
        </div>`;
      bindBack(el, { ask: true });
      const hintBox = $('#hints', el);
      const addHint = html => hintBox.insertAdjacentHTML('beforeend', `<div class="c-hint">${icon('bulb')} ${html}</div>`);
      $('[data-hint]', el).onclick = () => {
        if (hints >= 3) return;
        hints++; totalHints++;
        s.score = Math.max(0, s.score - 20); setScore(el, s.score); SFX.coin();
        const ex = blankExample(w);
        if (hints === 1) {
          if (mode === 'en2tr') addHint(`Example: <b>${esc(w.ex)}</b>`);
          else addHint(`The word: <b class="pattern">${esc(letterPattern(w.en))}</b>`);
        } else if (hints === 2) {
          if (mode === 'riddle') addHint(`Türkçesi: <b>${esc(w.tr)}</b>`);
          else if (mode === 'tr2en') addHint(ex ? `Example: <b>${esc(ex)}</b>` : `Category: <b>${esc(cat.name)}</b>`);
          else addHint(`Örnek cümlenin Türkçesi: <b>${esc(w.exTr)}</b>`);
        } else {
          // 50:50 — remove two wrong answers
          const wrongBtns = shuffle($$('.opt', el).filter(b => opts[+b.dataset.i] !== answer && !b.disabled)).slice(0, 2);
          wrongBtns.forEach(b => { b.disabled = true; b.classList.add('dim'); });
          addHint('Two wrong answers are gone (50:50).');
        }
        $('#hn', el).textContent = `${Math.min(hints + 1, 3)}/3`;
        if (hints >= 3) $('[data-hint]', el).disabled = true;
      };
      bindMCQ(el, opts, answer, (ok, picked, btn) => {
        $('[data-hint]', el).disabled = true;
        const qText = mode === 'riddle' ? `Riddle: "${w.riddle}"` : mode === 'en2tr' ? `What is the Turkish of '${w.en}'?` : `What is the English of '${w.tr}'?`;
        if (ok) Game.correct({ wordId: w.id, points: Math.max(30, 100 - hints * 20), el: btn });
        else Game.wrong({ wordId: w.id, el: btn, mistake: { q: qText, mine: picked, correct: answer, exp: `${w.en} = ${w.tr}` } });
        setScore(el, s.score);
        setTimeout(() => showSheet({
          good: ok, title: ok ? pick(GOOD_WORDS) : 'Answer: ' + answer,
          body: (mode === 'riddle' ? `<div class="exp">${icon('bulb')} ${esc(w.riddle)}</div>` : '') + wordCardHTML(w),
          btn: i + 1 < items.length ? 'Next riddle' : 'See results',
          onNext: () => { i++; i < items.length ? draw() : finish(); },
        }), ok ? 450 : 650);
      });
    };
    const finish = () => {
      Keys.fn = null;
      const r = Game.finish();
      const stars = r.accuracy >= 90 && totalHints <= 2 ? 3 : r.accuracy >= 65 ? 2 : r.accuracy > 0 ? 1 : 0;
      showResults(el, r, {
        stars, subtitle: `${r.correct}/${items.length} riddles solved · ${totalHints} hint${totalHints === 1 ? '' : 's'} used`,
        actions: Q ? questDone(Q, stars) : [
          { label: 'Continue · New riddles', icon: 'next', big: true, onClick: play },
          { label: 'Fix my mistakes', icon: 'wrench', ghost: true, onClick: () => Router.go('play/review') },
        ],
      });
    };
    draw();
  };
  if (Q) play(); else menu();
};

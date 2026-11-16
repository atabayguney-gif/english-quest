/* =========================================================================
   GAME 2 — WORD MATCH · English ↔ Turkish
   Drag an English card onto its Turkish meaning, or tap one then the other.
   ========================================================================= */
'use strict';
GAMES.match = function (el, args) {
  const p = P();
  const Q = questFor('match', args);
  let timer = 0;
  const ROUNDS = 3;
  const ROUND_TIME = 50;

  const menu = () => {
    clearInterval(timer);
    let mode = S().matchMode || 'timed';
    startScreen(el, 'match', {
      desc: 'Match each English word with its Turkish meaning. Correct pairs turn green!',
      how: ['Drag an English card onto the Turkish card…', '…or tap one card, then tap its partner.', 'Tap the speaker to hear the word.'],
      extra: `<div class="mode-row">
        <button class="mode-card" data-mode="timed">${icon('clock')}<b>Timed</b><small>${ROUND_TIME}s per round · time bonus</small></button>
        <button class="mode-card" data-mode="relaxed">${icon('heart')}<b>Relaxed</b><small>No timer · take your time</small></button>
      </div>`,
      btn: 'Start matching',
      onBind: e => {
        const upd = () => $$('[data-mode]', e).forEach(b => b.classList.toggle('sel', b.dataset.mode === mode));
        $$('[data-mode]', e).forEach(b => b.onclick = () => { mode = b.dataset.mode; S().matchMode = mode; DB.save(); SFX.tap(); upd(); });
        upd();
      },
      onStart: () => play(S().matchMode || 'timed'),
    });
  };

  const play = mode => {
    const timed = mode === 'timed';
    const perRound = innerHeight < 640 ? 5 : 6;
    const norm = w => w.tr.split(',')[0].replace(/[()’']/g, '').trim().toLowerCase();
    const candidates = VOCAB.filter(w => w.en.length <= 28 && w.tr.length <= 30);
    const chosen = pickWords(candidates, candidates.length, p);
    // build rounds with no two similar Turkish meanings in the same round
    const rounds = [];
    const used = new Set();
    for (let r = 0; r < ROUNDS; r++) {
      const round = [], trs = new Set();
      for (const w of chosen) {
        if (round.length >= perRound) break;
        if (used.has(w.id) || trs.has(norm(w))) continue;
        round.push(w); trs.add(norm(w)); used.add(w.id);
      }
      rounds.push(round);
    }
    const s = Game.start('match', { mode });
    let ri = 0, left = ROUND_TIME, sel = null, matched = 0, roundMistake = {};

    const drawRound = () => {
      const words = rounds[ri];
      matched = 0; sel = null; roundMistake = {}; left = ROUND_TIME;
      const ens = shuffle(words), trs = shuffle(words);
      el.innerHTML = gameTop('match', `${Q ? `Chapter ${Q.chapter} · ` : ''}Round ${ri + 1} of ${ROUNDS} · ${timed ? 'Timed' : 'Relaxed'}`, scorePill(s.score)) + `
        <div class="g-body">
          ${timed ? `<div class="mt-timer" id="tm"><span class="ic-wrap">${icon('clock')}</span><div class="g-progress"><i style="width:100%"></i></div><b id="tml">${left}s</b></div>` : `<div style="margin:.2rem 0 .5rem">${stepsHTML(ROUNDS, ri)}</div>`}
          <div class="match-board">
            <div class="match-col"><h4>English</h4>${ens.map((w, i) => `<div class="mcard en" data-side="en" data-id="${w.id}" style="--i:${i}">${speakBtn(w.en, 'sm')}<span>${esc(w.en)}</span></div>`).join('')}</div>
            <div class="match-col"><h4>Türkçe</h4>${trs.map((w, i) => `<div class="mcard tr" data-side="tr" data-id="${w.id}" style="--i:${i + 0.5}"><span>${esc(w.tr)}</span></div>`).join('')}</div>
          </div>
        </div>`;
      bindBack(el, { ask: true });
      $$('.mcard', el).forEach(card => {
        makeDraggable(card, {
          onStart: () => select(card, true),
          onMove: (ev, under) => {
            $$('.mcard.hover', el).forEach(x => x.classList.remove('hover'));
            const t = under && under.closest('.mcard');
            if (t && t.dataset.side !== card.dataset.side && !t.classList.contains('ok')) t.classList.add('hover');
          },
          onDrop: (ev, under) => {
            $$('.mcard.hover', el).forEach(x => x.classList.remove('hover'));
            const t = under && under.closest('.mcard');
            if (t && t.dataset.side !== card.dataset.side && !t.classList.contains('ok')) attempt(card, t);
          },
          onTap: ev => { if (ev.target.closest && ev.target.closest('[data-say]')) return; tap(card); },
        });
      });
      if (timed) {
        clearInterval(timer);
        timer = setInterval(() => {
          left--;
          const tm = $('#tm', el); if (!tm) return clearInterval(timer);
          $('i', tm).style.width = (left / ROUND_TIME) * 100 + '%';
          $('#tml', el).textContent = left + 's';
          tm.classList.toggle('low', left <= 10);
          if (left <= 5 && left > 0) SFX.tick();
          if (left <= 0) { clearInterval(timer); timeUp(); }
        }, 1000);
      }
    };
    const select = (card, keep) => {
      if (card.classList.contains('ok')) return;
      if (sel && sel !== card && sel.dataset.side === card.dataset.side) sel.classList.remove('sel');
      sel = card; card.classList.add('sel'); if (!keep) SFX.tap();
    };
    const tap = card => {
      if (card.classList.contains('ok')) return;
      if (!sel || sel === card) { if (sel === card) { card.classList.remove('sel'); sel = null; return; } select(card); return; }
      if (sel.dataset.side === card.dataset.side) { select(card); return; }
      attempt(sel, card);
    };
    const attempt = (a, b) => {
      const en = a.dataset.side === 'en' ? a : b, tr = a.dataset.side === 'en' ? b : a;
      $$('.mcard.sel', el).forEach(x => x.classList.remove('sel'));
      sel = null;
      const w = VOCAB_BY_ID[en.dataset.id];
      if (en.dataset.id === tr.dataset.id) {
        en.classList.add('ok'); tr.classList.add('ok');
        Game.correct({ wordId: w.id, points: 50, el: tr });
        p.stats.pairs++; dailyEvent('pair', 1);
        setScore(el, s.score);
        setTimeout(() => { en.classList.add('gone'); tr.classList.add('gone'); }, 700);
        matched++;
        if (matched === rounds[ri].length) roundDone(false);
      } else {
        const picked = VOCAB_BY_ID[tr.dataset.id];
        en.classList.add('no'); tr.classList.add('no');
        Game.wrong({
          wordId: w.id, el: en, penalty: 10,
          mistake: roundMistake[w.id] ? null : { q: `Word Match: "${w.en}"`, mine: picked.tr, correct: w.tr, exp: `'${w.en}' means '${w.tr}'. '${picked.tr}' is '${picked.en}'.` },
        });
        roundMistake[w.id] = true;
        tr.classList.add('shake');
        setScore(el, s.score);
        setTimeout(() => { en.classList.remove('no', 'shake'); tr.classList.remove('no', 'shake'); }, 650);
      }
    };
    const timeUp = () => {
      toast("Time's up!", 'bad');
      SFX.wrong();
      $$('.mcard:not(.ok)', el).forEach(c => c.classList.add('no'));
      roundDone(true);
    };
    const roundDone = timeout => {
      clearInterval(timer);
      if (timed && !timeout && left > 0) {
        const bonus = left * 5;
        s.score += bonus;
        setTimeout(() => { FX.float($('.match-board', el), `Time bonus +${bonus}`, 'gold'); setScore(el, s.score); SFX.coin(); }, 300);
        if (left >= 20) p.stats.speedMatch = 1;
      }
      if (!timeout) FX.burst($('.match-board', el), 50);
      setTimeout(() => { ri++; if (ri < ROUNDS) drawRound(); else finish(); }, timeout ? 1400 : 1300);
    };
    const finish = () => {
      clearInterval(timer);
      const r = Game.finish();
      showResults(el, r, {
        subtitle: `${timed ? 'Timed' : 'Relaxed'} mode · ${r.correct} pairs matched`,
        actions: Q ? questDone(Q, r.accuracy >= 90 ? 3 : r.accuracy >= 65 ? 2 : 1) : [
          { label: 'Continue · New words', icon: 'next', big: true, onClick: () => play(mode) },
          { label: 'Change mode', icon: 'settings', ghost: true, onClick: menu },
        ],
      });
    };
    drawRound();
  };

  if (Q) play(Q.matchMode); else menu();
  return () => clearInterval(timer);
};

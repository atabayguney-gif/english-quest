/* =========================================================================
   ENGLISH QUEST — Screens: welcome, home, games, learn, flashcards, daily,
   progress, mistakes, achievements, leaderboard, settings
   ========================================================================= */
'use strict';

/* ------------------------------ game card art ------------------------------ */
function gameArt(id) {
  const F = 'font-family="Fredoka, Nunito, sans-serif" font-weight="700" text-anchor="middle"';
  const arts = {
    connect: `<svg viewBox="0 0 120 100"><g ${F}>
      ${[8, 36, 64, 92].map(x => `<rect x="${x}" y="64" width="22" height="25" rx="7" fill="none" stroke="#fff" stroke-width="2.6" stroke-dasharray="4 4" opacity=".75"/>`).join('')}
      <rect x="36" y="64" width="22" height="25" rx="7" fill="#fff"/><text x="47" y="82" font-size="15" fill="#2563EB">D</text>
      <g transform="rotate(-10 26 30)"><rect x="13" y="14" width="27" height="29" rx="8" fill="#fff"/><text x="26.5" y="35" font-size="18" fill="#2563EB">W</text></g>
      <g transform="rotate(7 60 26)"><rect x="47" y="8" width="27" height="29" rx="8" fill="#fff"/><text x="60.5" y="29" font-size="18" fill="#2563EB">O</text></g>
      <g transform="rotate(-5 94 32)"><rect x="81" y="16" width="27" height="29" rx="8" fill="#fff"/><text x="94.5" y="37" font-size="18" fill="#2563EB">R</text></g>
    </g></svg>`,
    match: `<svg viewBox="0 0 120 100"><g ${F} font-size="11">
      <rect x="4" y="12" width="46" height="24" rx="8" fill="#fff"/><text x="27" y="28" fill="#DB2777">exam</text>
      <rect x="4" y="58" width="46" height="24" rx="8" fill="#fff" opacity=".45"/>
      <rect x="70" y="58" width="46" height="24" rx="8" fill="#fff"/><text x="93" y="74" fill="#DB2777">sınav</text>
      <rect x="70" y="12" width="46" height="24" rx="8" fill="#fff" opacity=".45"/>
      <path d="M50 24 C64 24 56 70 70 70" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-dasharray="1 7"/>
      <circle cx="60" cy="47" r="9" fill="#22C55E" stroke="#fff" stroke-width="2.5"/><path d="M56 47 l3 3 5-6" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </g></svg>`,
    wordle: `<svg viewBox="0 0 120 100"><g ${F} font-size="13">
      ${[['#fff', '#A7F3D0', '#FCD34D', '#fff'], ['#34D399', '#fff', '#FBBF24', '#fff'], ['#16A34A', '#16A34A', '#16A34A', '#16A34A']].map((row, r) => row.map((c, i) => `<rect x="${12 + i * 25}" y="${8 + r * 29}" width="21" height="25" rx="6" fill="${c}" ${c === '#fff' ? 'opacity=".55"' : ''}/>`).join('')).join('')}
      ${['Q', 'U', 'I', 'Z'].map((l, i) => `<text x="${22.5 + i * 25}" y="${74}" fill="#fff">${l}</text>`).join('')}
    </g></svg>`,
    quiz: `<svg viewBox="0 0 120 100"><g ${F}>
      <path d="M30 6 h60 a12 12 0 0 1 12 12 v22 a12 12 0 0 1 -12 12 h-34 l-12 10 v-10 h-14 a12 12 0 0 1 -12 -12 v-22 a12 12 0 0 1 12 -12z" fill="#fff"/>
      <text x="60" y="41" font-size="30" fill="#F97316">?</text>
      <rect x="8" y="68" width="48" height="12" rx="6" fill="#fff" opacity=".6"/><rect x="64" y="68" width="48" height="12" rx="6" fill="#fff"/>
      <rect x="8" y="84" width="48" height="12" rx="6" fill="#fff" opacity=".6"/><rect x="64" y="84" width="48" height="12" rx="6" fill="#fff" opacity=".6"/>
      <circle cx="104" cy="74" r="7" fill="#22C55E" stroke="#fff" stroke-width="2"/>
    </g></svg>`,
    sentence: `<svg viewBox="0 0 120 100"><g ${F} font-size="10">
      <rect x="6" y="64" width="34" height="22" rx="7" fill="#fff"/><text x="23" y="79" fill="#0891B2">I</text>
      <rect x="44" y="64" width="34" height="22" rx="7" fill="#fff"/><text x="61" y="79" fill="#0891B2">love</text>
      <rect x="82" y="64" width="34" height="22" rx="7" fill="#fff"/><text x="99" y="79" fill="#0891B2">school</text>
      <g transform="rotate(-8 40 30)"><rect x="18" y="18" width="42" height="22" rx="7" fill="#fff" opacity=".7"/></g>
      <g transform="rotate(6 84 26)"><rect x="66" y="14" width="40" height="22" rx="7" fill="#fff" opacity=".85"/></g>
      <path d="M60 44 v12 m-5 -5 l5 5 5 -5" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g></svg>`,
    circle: `<svg viewBox="0 0 120 100"><g ${F} font-size="13">
      <circle cx="60" cy="52" r="42" fill="#fff" opacity=".22"/>
      <path d="M60 20 L89 41 L78 76" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${[[60, 20, 'T'], [89, 41, 'E'], [78, 76, 'A'], [42, 76, 'M'], [31, 41, 'S']].map(([x, y, l], i) => `<circle cx="${x}" cy="${y}" r="12" fill="${i < 3 ? '#FDE047' : '#fff'}"/><text x="${x}" y="${y + 4.6}" fill="#7C3AED">${l}</text>`).join('')}
    </g></svg>`,
    final: `<svg viewBox="0 0 120 100"><g>
      <path d="M38 12 h44 v22 a22 22 0 0 1 -44 0z" fill="#fff"/>
      <path d="M38 18 h-10 v8 a12 12 0 0 0 12 12 M82 18 h10 v8 a12 12 0 0 1 -12 12" stroke="#fff" stroke-width="5" fill="none"/>
      <rect x="54" y="56" width="12" height="14" fill="#fff"/><rect x="40" y="70" width="40" height="12" rx="4" fill="#fff"/>
      <path d="M60 22 l3.5 7 7.7 1 -5.6 5.3 1.4 7.6 -7-3.7 -7 3.7 1.4-7.6 -5.6-5.3 7.7-1z" fill="#F97316"/>
    </g></svg>`,
    riddle: `<svg viewBox="0 0 120 100"><g ${F}>
      <rect x="14" y="8" width="70" height="52" rx="12" fill="#fff"/>
      <text x="49" y="31" font-size="11" fill="#E11D48">I am a</text><text x="49" y="47" font-size="11" fill="#E11D48">short test…</text>
      <path d="M30 60 l-6 12 16-12z" fill="#fff"/>
      <circle cx="92" cy="58" r="18" fill="#FDE047"/><path d="M86 74 h12 M88 80 h8" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <text x="92" y="65" font-size="20" fill="#E11D48">?</text>
    </g></svg>`,
    battle: `<svg viewBox="0 0 120 100"><g ${F}>
      <path d="M12 16 h36 v26 c0 18 -18 28 -18 28 s-18 -10 -18 -28z" fill="#FB7185" stroke="#fff" stroke-width="4"/>
      <path d="M72 16 h36 v26 c0 18 -18 28 -18 28 s-18 -10 -18 -28z" fill="#60A5FA" stroke="#fff" stroke-width="4"/>
      <circle cx="60" cy="72" r="15" fill="#fff"/><text x="60" y="78" font-size="15" fill="#4F46E5">VS</text>
    </g></svg>`,
  };
  return arts[id] || arts.quiz;
}

/* ---------------------------------- welcome ---------------------------------- */
Router.routes.welcome = {
  render(el) {
    const players = Object.values(DB.state.players);
    let step = players.length ? 'choose' : 'intro';
    let name = '', avatar = randInt(0, AVATARS.length - 1);
    const draw = () => {
      if (step === 'choose') {
        el.innerHTML = `<div class="welcome"><div class="welcome-card">
          <div class="logo"><div class="logo-mark">${icon('graduation')}</div><div class="logo-word">English Quest</div><div class="logo-sub">Who's playing today?</div></div>
          <div class="player-list">${players.sort((a, b) => b.xp - a.xp).map(p => `
            <button class="player-row" data-pid="${p.id}">${avatarHTML(p.avatar, 48)}<span class="grow"><b>${esc(p.name)}</b><small>Level ${levelInfo(p.xp).level} · ${fmt(p.xp)} XP</small></span>${icon('next')}</button>`).join('')}
          </div>
          <button class="btn big block" data-new>${icon('plus')} New Player</button>
        </div></div>`;
        $$('[data-pid]', el).forEach(b => b.onclick = () => { switchPlayer(b.dataset.pid); SFX.correct(); Router.go('home'); });
        $('[data-new]', el).onclick = () => { step = 'name'; draw(); };
        return;
      }
      if (step === 'intro') {
        el.innerHTML = `<div class="welcome"><div class="welcome-card">
          <div class="logo"><div class="logo-mark">${icon('graduation')}</div><div class="logo-word">English Quest</div><div class="logo-sub">${UNIT.grade} · ${UNIT.title}</div></div>
          <div class="wel-mascots">${avatarHTML(2, 84)}${avatarHTML(0, 100)}${avatarHTML(9, 84)}</div>
          <h2 style="font-size:1.5rem">Learn English. Play games. Climb the ranks!</h2>
          <div class="wel-feats">
            <div style="color:#3B82F6">${icon('gamepad')}${GAME_IDS.length} Mini Games</div>
            <div style="color:#EC4899">${icon('trophy')}Leaderboards</div>
            <div style="color:#10B981">${icon('book')}${VOCAB.length} Words</div>
          </div>
          <button class="btn big block" data-start>${icon('play')} Start Your Quest</button>
        </div></div>`;
        $('[data-start]', el).onclick = () => { SFX.whoosh(); step = 'name'; draw(); };
        return;
      }
      if (step === 'name') {
        el.innerHTML = `<div class="welcome"><div class="welcome-card">
          <div class="step-dots"><i></i><i class="on"></i><i></i><i></i></div>
          <h1 style="font-size:2rem;margin-bottom:.3rem">What's your name?</h1>
          <p class="muted" style="margin-bottom:1rem">Your name will appear on the leaderboards.</p>
          <input class="name-input" maxlength="18" placeholder="Type your name" value="${esc(name)}" autocomplete="off" enterkeyhint="done">
          <p class="muted small" style="margin:1.2rem 0 0;font-weight:900">Choose your avatar</p>
          <div class="avatar-pick">${AVATARS.map((a, i) => `<button data-av="${i}" class="${i === avatar ? 'sel' : ''}" aria-label="Avatar ${i + 1}">${avatarHTML(i, 60)}</button>`).join('')}</div>
          <div class="row gap"><button class="btn ghost" data-back>${icon('back')}</button><button class="btn big grow" data-go-on disabled>${icon('trophy')} Join the Leaderboard</button></div>
        </div></div>`;
        const inp = $('.name-input', el), go = $('[data-go-on]', el);
        const upd = () => { name = inp.value; go.disabled = name.trim().length < 2; };
        inp.oninput = upd; upd();
        setTimeout(() => inp.focus(), 300);
        inp.onkeydown = e => { if (e.key === 'Enter' && !go.disabled) go.click(); };
        $$('[data-av]', el).forEach(b => b.onclick = () => { avatar = +b.dataset.av; $$('[data-av]', el).forEach(x => x.classList.toggle('sel', x === b)); SFX.pop(avatar % 7); });
        $('[data-back]', el).onclick = () => { step = Object.keys(DB.state.players).length ? 'choose' : 'intro'; draw(); };
        go.onclick = () => {
          const taken = Object.values(DB.state.players).some(p => p.name.toLowerCase() === name.trim().toLowerCase());
          if (taken) { toast('This name is already on this device — pick another one!', 'bad'); inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 500); return; }
          createPlayer(name, avatar);
          ensureDaily();
          ClassNet.push();
          // first player on this device → choose the pronunciation voice
          step = S().voiceChosen ? 'joined' : 'voice'; draw();
        };
        return;
      }
      if (step === 'voice') {
        el.innerHTML = `<div class="welcome"><div class="welcome-card">
          <div class="step-dots"><i></i><i></i><i class="on"></i><i></i></div>
          <div class="vp-hero">${icon('headphones')}</div>
          <h1 style="font-size:2rem;margin-bottom:.3rem">Choose a voice</h1>
          <p class="muted" style="margin-bottom:1rem">This voice reads English words when you tap ${icon('volume')}. Tap a voice to hear it.</p>
          <div id="vp"></div>
        </div></div>`;
        voicePicker($('#vp', el), { onDone: () => { step = 'joined'; draw(); } });
        return;
      }
      if (step === 'joined') {
        const p = P();
        const b = board('overall');
        const r = rankOf(p.id, 'overall'), total = b.length;
        const where = ClassNet.connected ? 'in your class' : 'on this device';
        el.innerHTML = `<div class="welcome"><div class="welcome-card">
          <div class="step-dots"><i></i><i></i><i></i><i class="on"></i></div>
          <div class="join-anim">${avatarHTML(p.avatar, 130)}</div>
          <h1 style="font-size:2rem">Welcome, ${esc(p.name)}!</h1>
          <p class="muted" style="font-weight:800">You joined all ${GAME_IDS.length + 2} leaderboards</p>
          <div class="join-rank">#${r}</div>
          <p class="muted small" style="margin-bottom:1.6rem">${total > 1 ? `of ${total} players ${where} — time to climb!` : `You are the first player ${where}!`}</p>
          <button class="btn big block" data-home>${icon('play')} Let's Go!</button>
        </div></div>`;
        SFX.levelUp(); setTimeout(() => FX.confetti({ count: 170 }), 250);
        $('[data-home]', el).onclick = () => Router.go('home');
      }
    };
    draw();
  },
};

/* ----------------------------------- home ----------------------------------- */
function gameCardsHTML(p) {
  return GAME_IDS.map((g, i) => {
    const m = GAME_META[g];
    const rec = p.games[g];
    return `<button class="game-card" style="--gg:${m.grad};--gcc:${m.color};animation-delay:${i * 0.06}s" data-go="play/${g}">
      <span class="gc-num">GAME ${i + 1}</span>
      <span class="gc-art">${gameArt(g)}</span>
      <b>${m.name}</b><small>${m.sub}</small>
      <span class="gc-foot"><span class="gc-best">${icon('trophy')} ${fmt(rec.score)}</span><span class="gc-play">${icon('play')}</span></span>
    </button>`;
  }).join('');
}
function specialCardsHTML(p) {
  const played = GAME_IDS.filter(g => p.games[g].plays > 0).length;
  return `<div class="special-row">
    <button class="special-card" style="--gg:${GAME_META.final.grad}" data-go="play/final">
      <span class="sc-ic">${icon('trophy')}</span>
      <span><b>Exam ${(p.games.final.plays || 0) + 1}</b><small>Unit 1 Exams never end · 20 questions${p.games.final.best ? ` · Best ${p.games.final.best}%` : ''}</small></span>
      ${played < GAME_IDS.length ? `<span class="lock-tag">${icon('gamepad')} ${played}/${GAME_IDS.length} games</span>` : ''}
    </button>
    <button class="special-card" style="--gg:${GAME_META.battle.grad}" data-go="play/battle">
      <span class="sc-ic">${icon('swords')}</span>
      <span><b>Class Battle</b><small>Two teams compete on the smart board</small></span>
    </button>
  </div>`;
}
Router.routes.home = {
  nav: 'home',
  render(el) {
    const p = P();
    ensureDaily(p);
    const L = levelInfo(p.xp);
    const learned = learnedCount(p);
    const QS = questStage(p.quest.stage);
    const recMeta = GAME_META[QS.game];
    const unresolved = p.mistakes.filter(m => !m.fixed).length;
    const dailyReady = dailyReadyCount(p);
    const dailyDone = p.daily.claimed.length;
    const achCount = Object.keys(p.ach).length;
    const wotd = VOCAB[hashStr(todayKey()) % VOCAB.length];
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const tiles = [
      { go: 'learn', icon: 'book', c: '#3B82F6', t: 'Learn Vocabulary', s: `${learned}/${VOCAB.length} learned` },
      { go: 'quest', icon: 'map', c: '#0EA5E9', t: 'Quest Map', s: `Chapter ${QS.chapter} · stage ${QS.step + 1}/${QUEST_STEPS.length}` },
      { go: 'games', icon: 'gamepad', c: '#8B5CF6', t: 'Mini Games', s: `${GAME_IDS.length} games` },
      { go: 'daily', icon: 'calendar', c: '#EC4899', t: 'Daily Challenges', s: `${dailyDone}/4 done`, badge: dailyReady },
      { go: 'progress', icon: 'chart', c: '#10B981', t: 'My Progress', s: `Level ${L.level}` },
      { go: 'mistakes', icon: 'alert', c: '#EF4444', t: 'Mistakes', s: `${unresolved} to review`, badge: unresolved > 0 ? unresolved : 0 },
      { go: 'achievements', icon: 'medal', c: '#F59E0B', t: 'Achievements', s: `${achCount}/${ACHIEVEMENTS.length} badges` },
      { go: 'ranks', icon: 'trophy', c: '#D97706', t: 'Leaderboard', s: `#${rankOf(p.id, 'overall')} overall` },
      { go: 'settings', icon: 'settings', c: '#64748B', t: 'Settings', s: 'Sound, voice…' },
    ];
    el.innerHTML = `
      <div class="home-top">
        <span data-go="progress">${avatarHTML(p.avatar, 54)}</span>
        <div class="who"><small>${greet},</small><b>${esc(p.name)}</b></div>
        <span class="pill fire" title="Daily streak">${icon('flame')}<span data-hud="streak">${currentStreak(p)}</span></span>
        <span class="pill xp" title="Total XP">${icon('zap')}<span data-hud="xp">${fmt(p.xp)}</span></span>
        ${TARGET === 'phone' || TARGET === 'app' ? '' : `<button class="icon-btn" data-fs title="Full screen" aria-label="Full screen">${icon('fullscreen')}</button>`}
      </div>
      <div class="stats-strip">
        <div class="stat" style="--sc:linear-gradient(135deg,#8B7BFF,#5243E0)"><span class="s-ic">${icon('star')}</span><b>Level ${L.level}</b><small>${L.title}</small><div class="s-bar"><i data-w="${Math.round(L.pct * 100)}"></i></div></div>
        <div class="stat" style="--sc:linear-gradient(135deg,#FDE047,#EAB308)"><span class="s-ic">${icon('zap')}</span><b data-count="${p.xp}">0</b><small>Total XP</small></div>
        <div class="stat" style="--sc:linear-gradient(135deg,#FDBA74,#F97316)"><span class="s-ic">${icon('flame')}</span><b>${currentStreak(p)} ${currentStreak(p) === 1 ? 'day' : 'days'}</b><small>Daily streak · best ${p.streak.best}</small></div>
        <div class="stat" style="--sc:linear-gradient(135deg,#6EE7B7,#10B981)"><span class="s-ic">${icon('book')}</span><b data-count="${learned}">0</b><small>Words learned</small><div class="s-bar"><i data-w="${Math.round(learned / VOCAB.length * 100)}"></i></div></div>
      </div>
      <div class="hero">
        <div>
          <span class="next-up">${icon(recMeta.icon)} Chapter ${QS.chapter} · Stage ${QS.step + 1}: ${recMeta.name}${QS.game === 'final' ? ' ' + QS.chapter : ''}</span>
          <h2>${p.quest.stage ? 'Continue your English quest!' : 'Ready for your English quest?'}</h2>
          <p>${UNIT.grade} · ${UNIT.title}</p>
          <div class="row gap" style="flex-wrap:wrap;position:relative"><button class="btn big" data-go="${questRoute(QS)}">${icon('play')} ${p.quest.stage ? 'CONTINUE' : 'PLAY NOW'}</button><button class="btn ghost hero-map" data-go="quest">${icon('map')} Quest Map</button></div>
        </div>
        <div class="hero-mascot"><span class="bubble">Let's play!</span>${avatarHTML(p.avatar, 128)}</div>
      </div>
      <div class="section-title"><h2>Menu</h2></div>
      <div class="menu-grid">${tiles.map((t, i) => `
        <button class="menu-tile" style="--mc:${t.c};animation-delay:${0.15 + i * 0.04}s" data-go="${t.go}">
          <span class="mt-ic">${icon(t.icon)}</span><b>${t.t}</b><small>${t.s}</small>${t.badge ? `<span class="badge">${t.badge}</span>` : ''}
        </button>`).join('')}
      </div>
      <div class="section-title"><h2>Mini Games</h2><button class="link" data-go="ranks">Leaderboards ${icon('next')}</button></div>
      <div class="games-grid">${gameCardsHTML(p)}</div>
      ${specialCardsHTML(p)}
      <div class="section-title"><h2>Word of the Day</h2></div>
      <div class="card wotd">
        <span class="w-badge">${icon('sparkles')}</span>
        <div><small>${esc((CATEGORIES.find(c => c.id === wotd.cat) || {}).name || '')}</small><b>${esc(wotd.en)}</b><div class="tr">Türkçe anlamı: <b>${esc(wotd.tr)}</b></div><div class="ex">"${esc(wotd.ex)}"</div></div>
        ${speakBtn(wotd.en, 'lg')}
      </div>
      <p class="foot-note">English Quest · ${UNIT.grade} · ${UNIT.title} (${UNIT.level}) · MEB curriculum</p>`;
    $$('[data-count]', el).forEach(n => countUp(n, +n.dataset.count, 1000));
    setTimeout(() => $$('[data-w]', el).forEach(n => n.style.width = n.dataset.w + '%'), 200);
    const fs = $('[data-fs]', el); if (fs) fs.onclick = toggleFullscreen;
  },
};

/* --------------------------------- quest map --------------------------------- */
Router.routes.quest = {
  nav: 'quest',
  render(el) {
    const p = P();
    const cur = p.quest.stage;
    const curSt = questStage(cur);
    const n = QUEST_STEPS.length;
    const chapters = curSt.chapter + 1;
    const diffName = c => (c <= 2 ? 'Easy' : c <= 4 ? 'Medium' : 'Hard');
    const offsets = [0, 70, 105, 70, 0, -70, -105, -70];
    let html = `<div class="page-head"><div class="grow"><h1>Quest Map</h1><p>All games in order · every chapter ends with an exam · it never ends!</p></div>
      <button class="btn sm" data-go="${questRoute(curSt)}">${icon('play')} Continue</button></div>`;
    for (let ch = 1; ch <= chapters; ch++) {
      const doneIn = Math.max(0, Math.min(n, cur - (ch - 1) * n));
      html += `<div class="qchap ${ch > curSt.chapter ? 'locked' : ''}">
        <div class="qc-num">${ch}</div>
        <div class="grow"><b>Chapter ${ch}</b><small>${diffName(ch)} · ${doneIn}/${n} stages · ends with Exam ${ch}</small>
          <div class="qc-bar"><i style="width:${(doneIn / n) * 100}%"></i></div></div>
        ${doneIn === n ? `<span class="qc-done">${icon('check')}</span>` : ch > curSt.chapter ? icon('lock') : ''}
      </div><div class="quest-path">`;
      for (let k = 0; k < n; k++) {
        const idx = (ch - 1) * n + k, st = questStage(idx), m = GAME_META[st.game];
        const state = idx < cur ? 'done' : idx === cur ? 'cur' : 'locked';
        const stars = p.quest.done[idx] || 0;
        if (k > 0) html += `<div class="qdots" style="--x:${(offsets[k] + offsets[k - 1]) / 2}px"><i></i><i></i></div>`;
        html += `<div class="qstop" style="--x:${offsets[k]}px">
          ${state === 'cur' ? `<span class="qbubble">${cur ? 'CONTINUE' : 'START'}</span>` : ''}
          <button class="qnode ${state} ${st.game === 'final' ? 'exam' : ''}" style="--gc:${m.color};--gd:${m.dark}" data-idx="${idx}" aria-label="${m.name}">
            ${icon(state === 'locked' ? 'lock' : st.game === 'final' ? 'trophy' : m.icon)}
          </button>
          <span class="qlabel">${st.game === 'final' ? `Exam ${ch}` : m.name}${state === 'done' ? `<span class="qstars">${icon('star').repeat(stars)}</span>` : ''}</span>
        </div>`;
      }
      html += `</div>`;
    }
    html += `<p class="foot-note">Finish a stage to unlock the next one. Tap a finished stage to practise it again.</p>`;
    el.innerHTML = html;
    $$('.qnode', el).forEach(b => b.onclick = () => {
      const idx = +b.dataset.idx, st = questStage(idx);
      if (idx === cur) { SFX.whoosh(); Router.go(questRoute(st)); }
      else if (idx < cur) { SFX.tap(); Router.go(`play/${st.game}`); }
      else { SFX.wrong(); toast('Finish the stages before this one first!', 'info', 1800); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); }
    });
    setTimeout(() => { const c = $('.qnode.cur', el); if (c) c.scrollIntoView({ behavior: S().motion ? 'smooth' : 'auto', block: 'center' }); }, 350);
  },
};

/* ----------------------------------- games ----------------------------------- */
Router.routes.games = {
  nav: 'games',
  render(el) {
    const p = P();
    el.innerHTML = `
      <div class="page-head"><div class="grow"><h1>Mini Games</h1><p>${GAME_IDS.length} ways to master ${UNIT.title}</p></div><button class="btn sm ghost" data-go="ranks">${icon('trophy')} Ranks</button></div>
      <div class="games-grid">${gameCardsHTML(p)}</div>
      ${specialCardsHTML(p)}
      <div class="section-title"><h2>Your best scores</h2></div>
      <div class="game-stats">${GAME_IDS.map(g => { const m = GAME_META[g], r = p.games[g]; return `<div class="gstat" style="--gc:${m.color}"><b>${m.name}</b><span class="gv">${fmt(r.score)}</span><small>${r.plays} plays · best round ${fmt(r.best)} · rank #${rankOf(p.id, g)}</small></div>`; }).join('')}</div>`;
  },
};

/* ----------------------------------- learn ----------------------------------- */
const LearnState = { cat: 'all', filter: 'all', q: '' };
Router.routes.learn = {
  nav: 'learn',
  render(el) {
    const p = P();
    el.innerHTML = `
      <div class="page-head"><div class="grow"><h1>Vocabulary Center</h1><p>${UNIT.title} · ${VOCAB.length} words · tap a card to flip</p></div>
        <button class="btn sm" data-go="flash/all">${icon('repeat')} Review</button></div>
      <div class="search">${icon('search')}<input type="search" placeholder="Search English or Turkish…" value="${esc(LearnState.q)}"></div>
      <div class="chips" id="cats">
        <button class="chip-btn ${LearnState.cat === 'all' ? 'active' : ''}" data-cat="all">${icon('grid')} All</button>
        ${CATEGORIES.map(c => `<button class="chip-btn ${LearnState.cat === c.id ? 'active' : ''}" style="--cc:${c.color}" data-cat="${c.id}">${icon(c.icon)} ${c.name}</button>`).join('')}
      </div>
      <div class="learn-bar">
        <div class="seg" id="filt">
          <button data-f="all">All</button><button data-f="fav">${icon('heart')} Favorites</button><button data-f="known">${icon('check')} Known</button><button data-f="learning">Learning</button>
        </div>
        <span class="muted small" id="count"></span>
      </div>
      <div class="word-grid" id="grid"></div>`;
    const grid = $('#grid', el);
    const draw = () => {
      const q = LearnState.q.trim().toLowerCase();
      const list = VOCAB.filter(w => {
        if (LearnState.cat !== 'all' && w.cat !== LearnState.cat) return false;
        const ws = p.words[w.id];
        if (LearnState.filter === 'fav' && !(ws && ws.f)) return false;
        if (LearnState.filter === 'known' && !isLearned(ws)) return false;
        if (LearnState.filter === 'learning' && isLearned(ws)) return false;
        if (q && !(w.en.toLowerCase().includes(q) || w.tr.toLowerCase().includes(q))) return false;
        return true;
      });
      $$('#filt button', el).forEach(b => b.classList.toggle('active', b.dataset.f === LearnState.filter));
      $('#count', el).textContent = `${list.length} word${list.length === 1 ? '' : 's'}`;
      if (!list.length) { grid.innerHTML = `<div class="empty" style="grid-column:1/-1">${icon(LearnState.filter === 'fav' ? 'heart' : 'search')}${LearnState.filter === 'fav' ? 'No favorites yet. Tap the heart on words you want to practise.' : 'No words found.'}</div>`; return; }
      grid.innerHTML = list.map((w, i) => {
        const c = CATEGORIES.find(x => x.id === w.cat);
        const ws = p.words[w.id] || {};
        return `<div class="flip" data-id="${w.id}" style="--cc:${c.color};animation-delay:${Math.min(i, 16) * 0.03}s">
          <div class="flip-in">
            <div class="face front">
              ${isLearned(ws) ? `<span class="known-tag">${icon('check')} Known</span>` : ''}
              <span class="f-cat">${esc(c.name)}</span>
              <div class="f-en">${esc(w.en)}</div>
              <div class="f-hint">Do you know the meaning?</div>
              <div class="f-actions">
                ${speakBtn(w.en)}
                <button class="mini-toggle fav ${ws.f ? 'on' : ''}" data-fav title="Add to favorites">${icon('heart')}</button>
                <button class="mini-toggle known ${ws.k ? 'on' : ''}" data-known title="I know this word">${icon('check')}</button>
                <span class="f-tap">${icon('rotate')} Meaning</span>
              </div>
            </div>
            <div class="face back">
              <div class="f-word">${esc(w.en)}</div>
              <span class="f-cat">Türkçe anlamı</span>
              <div class="f-tr">${esc(w.tr)}</div>
              <div class="f-ex">${esc(w.ex)}</div>
              <div class="f-ex-tr">${esc(w.exTr)}</div>
              <div class="f-actions"><span class="f-tap">${icon('rotate')} Back</span></div>
            </div>
          </div>
        </div>`;
      }).join('');
    };
    grid.onclick = e => {
      const card = e.target.closest('.flip'); if (!card) return;
      const id = card.dataset.id, ws = wstat(p, id);
      if (e.target.closest('[data-fav]')) {
        ws.f = !ws.f; e.target.closest('[data-fav]').classList.toggle('on', ws.f); SFX.pop(ws.f ? 4 : 0);
        toast(ws.f ? 'Added to favorites' : 'Removed from favorites', 'info', 1500); DB.save(); return;
      }
      if (e.target.closest('[data-known]')) {
        ws.k = !ws.k; e.target.closest('[data-known]').classList.toggle('on', ws.k);
        if (ws.k) { studyWord(id); SFX.correct(); FX.burst(e.target.closest('[data-known]'), 18); } else SFX.tap();
        DB.save(); checkAchievements(); return;
      }
      if (e.target.closest('[data-say]')) return;
      card.classList.toggle('flipped'); SFX.flip();
      if (card.classList.contains('flipped')) { studyWord(id); DB.save(); }
    };
    $('input', el).oninput = e => { LearnState.q = e.target.value; draw(); };
    $$('[data-cat]', el).forEach(b => b.onclick = () => { LearnState.cat = b.dataset.cat; $$('[data-cat]', el).forEach(x => x.classList.toggle('active', x === b)); SFX.tap(); draw(); });
    $$('#filt button', el).forEach(b => b.onclick = () => { LearnState.filter = b.dataset.f; SFX.tap(); draw(); });
    draw();
  },
};

/* ---------------------------------- flashcards ---------------------------------- */
Router.routes.flash = {
  game: true,
  render(el) {
    const p = P();
    const favs = VOCAB.filter(w => p.words[w.id] && p.words[w.id].f);
    const pool = favs.length >= 5 ? favs : VOCAB.filter(w => !isLearned(p.words[w.id]));
    const deck = pickWords(pool.length >= 5 ? pool : VOCAB, 10, p);
    let i = 0, knew = 0;
    const draw = () => {
      if (i >= deck.length) {
        el.innerHTML = `<div class="g-top"><button class="icon-btn" data-go="learn">${icon('back')}</button><div class="g-title"><b>Review Cards</b><small>Finished</small></div></div>
          <div class="fc-wrap"><div class="trophy-big">${icon('sparkles')}</div><h1>Review complete!</h1><p class="muted" style="font-weight:800">You knew ${knew} of ${deck.length} words.</p>
          <div class="row gap"><button class="btn ghost" data-go="learn">${icon('book')} Vocabulary</button><button class="btn" data-again>${icon('repeat')} Again</button></div></div>`;
        $('[data-again]', el).onclick = () => Router.render();
        FX.confetti({ count: 100 }); SFX.win(); addXP(knew * 3); checkAchievements();
        return;
      }
      const w = deck[i], c = CATEGORIES.find(x => x.id === w.cat);
      el.innerHTML = `<div class="g-top"><button class="icon-btn" data-go="learn">${icon('back')}</button><div class="g-title"><b>Review Cards</b><small>${favs.length >= 5 ? 'Your favorite words' : 'Words you are learning'}</small></div><span class="score-pill">${i + 1}/${deck.length}</span></div>
        <div class="g-progress" style="--gc:#6D5DFC"><i style="width:${(i / deck.length) * 100}%"></i></div>
        <div class="fc-wrap">
          <div class="fc"><div class="flip" style="--cc:${c.color}"><div class="flip-in">
            <div class="face front"><span class="f-cat">${esc(c.name)}</span><div class="f-en">${esc(w.en)}</div><div style="margin-top:1rem">${speakBtn(w.en, 'lg')}</div><p class="muted small" style="margin-top:1rem">Do you remember the meaning? Tap to check.</p></div>
            <div class="face back"><span class="f-cat">Turkish meaning</span><div class="f-tr">${esc(w.tr)}</div><div class="f-ex">${esc(w.ex)}</div><div class="f-ex-tr">${esc(w.exTr)}</div></div>
          </div></div></div>
          <div class="fc-btns"><button class="btn danger" data-no>${icon('repeat')} Still learning</button><button class="btn good" data-yes>${icon('check')} I knew it!</button></div>
        </div>`;
      const card = $('.flip', el);
      card.onclick = e => { if (e.target.closest('[data-say]')) return; card.classList.toggle('flipped'); SFX.flip(); };
      $('[data-yes]', el).onclick = () => { const ws = wstat(p, w.id); ws.k = true; studyWord(w.id); knew++; SFX.correct(); i++; DB.save(); draw(); };
      $('[data-no]', el).onclick = () => { const ws = wstat(p, w.id); ws.f = true; studyWord(w.id); SFX.tap(); i++; DB.save(); draw(); };
    };
    draw();
  },
};

/* ----------------------------------- daily ----------------------------------- */
Router.routes.daily = {
  nav: 'home',
  render(el) {
    const p = P();
    const d = ensureDaily(p);
    let timer = 0;
    const draw = () => {
      const tasks = d.ids.map(id => DAILY_TEMPLATES.find(t => t.id === id));
      const allClaimed = tasks.every(t => d.claimed.includes(t.id));
      el.innerHTML = `
        <div class="page-head"><button class="icon-btn" data-go="home">${icon('back')}</button><div class="grow"><h1>Daily Challenges</h1><p>New challenges every day</p></div></div>
        <div class="card daily-hero">
          <h2>${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
          <p>Complete all 4 challenges to open the bonus chest!</p>
          <div class="count">${icon('clock')} New in <span id="cd">--:--:--</span></div>
          <div class="chest">${icon('gift')}</div>
        </div>
        <div class="section-title"><h2>Today's tasks</h2><span class="chip">${d.claimed.length}/4 claimed</span></div>
        <div style="display:grid;gap:.7rem">${tasks.map((t, i) => {
          const prog = d.prog[t.id] || 0, done = prog >= t.target, claimed = d.claimed.includes(t.id);
          return `<div class="card task ${done ? 'done' : ''} ${claimed ? 'claimed' : ''}" style="animation-delay:${i * 0.07}s">
            <span class="t-ic">${icon(done ? 'check' : t.icon)}</span>
            <div><b>${t.title}</b><div class="t-bar"><i style="width:${(prog / t.target) * 100}%"></i></div><small>${fmt(prog)} / ${fmt(t.target)} · +${t.xp} XP</small></div>
            ${claimed ? `<span class="claimed-tag">${icon('check')} Claimed</span>` : done ? `<button class="btn sm gold" data-claim="${t.id}">${icon('gift')} Claim</button>` : `<button class="btn sm ghost" data-goto="${t.event}">Go</button>`}
          </div>`;
        }).join('')}</div>
        ${allClaimed ? `<div class="tip" style="margin-top:1rem">${icon('sparkles')}<span>Amazing! You finished every challenge today. Come back tomorrow to keep your streak!</span></div>` : ''}`;
      $$('[data-claim]', el).forEach(b => b.onclick = () => {
        const t = DAILY_TEMPLATES.find(x => x.id === b.dataset.claim);
        d.claimed.push(t.id); SFX.coin(); FX.burst(b, 40); FX.float(b, `+${t.xp} XP`, 'gold');
        addXP(t.xp);
        if (d.claimed.length === d.ids.length && !d.allDone) {
          d.allDone = true; p.stats.dailyAll++;
          setTimeout(() => { FX.rain(); SFX.win(); modal(`<div class="center"><div class="trophy-big">${icon('gift')}</div><h2 style="margin-top:1.2rem">Bonus Chest!</h2><p class="muted" style="margin:.4rem 0 1rem;font-weight:800">All daily challenges complete. +50 XP</p><button class="btn big" data-close>Collect</button></div>`, { cls: 'center' }); addXP(50); checkAchievements(); }, 500);
        }
        DB.save(); setTimeout(draw, 350);
      });
      const gotoMap = { learn: 'learn', game: 'games', quiz80: 'play/quiz', circleWord: 'play/circle', sentenceSession: 'play/sentence', wordleSolved: 'play/wordle', pair: 'play/match', xp: 'games', fix: 'mistakes', combo: 'play/quiz', connectWord: 'play/connect' };
      $$('[data-goto]', el).forEach(b => b.onclick = () => Router.go(gotoMap[b.dataset.goto] || 'games'));
      tick();
    };
    const tick = () => {
      const n = new Date(), m = new Date(n); m.setHours(24, 0, 0, 0);
      const s = Math.max(0, Math.floor((m - n) / 1000));
      const cd = $('#cd', el); if (cd) cd.textContent = `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}`;
    };
    draw();
    timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  },
};

/* ---------------------------------- progress ---------------------------------- */
Router.routes.progress = {
  nav: 'progress',
  render(el) {
    const p = P();
    const L = levelInfo(p.xp);
    const learned = learnedCount(p);
    const total = p.stats.correct + p.stats.wrong;
    const acc = total ? Math.round(p.stats.correct / total * 100) : 0;
    const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
    const vals = days.map(d => (p.history[dateKey(d)] || {}).xp || 0);
    const max = Math.max(50, ...vals);
    const fixed = p.mistakes.filter(m => m.fixed).length;
    el.innerHTML = `
      <div class="page-head"><div class="grow"><h1>My Progress</h1><p>Your learning journey</p></div><button class="btn sm ghost" data-go="settings">${icon('settings')}</button></div>
      <div class="card prof-card">
        ${avatarHTML(p.avatar, 92)}
        <div><h2>${esc(p.name)}</h2><div class="lvl-title">Level ${L.level} · ${L.title}</div>
          <div class="xpbar"><i data-w="${Math.round(L.pct * 100)}"></i></div>
          <small class="muted" style="font-weight:800">${fmt(L.cur)} / ${fmt(L.need)} XP to Level ${L.level + 1}</small></div>
      </div>
      <div class="kpis">
        <div class="kpi" style="--kc:#EAB308">${icon('zap')}<b data-count="${p.xp}">0</b><small>Total XP</small></div>
        <div class="kpi" style="--kc:#10B981">${icon('book')}<b>${learned}/${VOCAB.length}</b><small>Words learned</small></div>
        <div class="kpi" style="--kc:#3B82F6">${icon('target')}<b>${acc}%</b><small>Accuracy (${fmt(total)} answers)</small></div>
        <div class="kpi" style="--kc:#F97316">${icon('flame')}<b>${currentStreak(p)}</b><small>Day streak · best ${p.streak.best}</small></div>
        <div class="kpi" style="--kc:#8B5CF6">${icon('gamepad')}<b>${p.stats.games}</b><small>Games completed</small></div>
        <div class="kpi" style="--kc:#EF4444">${icon('flame')}<b>${p.stats.bestCombo}x</b><small>Best combo</small></div>
        <div class="kpi" style="--kc:#14B8A6">${icon('wrench')}<b>${fixed}</b><small>Mistakes fixed</small></div>
        <div class="kpi" style="--kc:#D97706">${icon('medal')}<b>${Object.keys(p.ach).length}/${ACHIEVEMENTS.length}</b><small>Achievements</small></div>
      </div>
      <div class="two-col" style="margin-top:1rem">
        <div class="card chart-card"><h3>Last 7 days · XP</h3>
          <div class="bars">${days.map((d, i) => `<div class="bc"><span class="bv">${vals[i] || ''}</span><div class="b ${i === 6 ? 'today' : ''}" style="height:${(vals[i] / max) * 100}%;animation-delay:${i * 0.06}s"></div><span class="bd">${d.toLocaleDateString('en-GB', { weekday: 'short' })}</span></div>`).join('')}</div>
        </div>
        <div class="card chart-card"><h3>Topic mastery</h3>
          <div class="mastery" style="margin-top:.8rem">${CATEGORIES.map(c => { const ws = VOCAB.filter(w => w.cat === c.id); const k = ws.filter(w => isLearned(p.words[w.id])).length; return `<div class="mrow" style="--cc:${c.color}"><span>${c.name}</span><span class="mbar"><i data-w="${Math.round(k / ws.length * 100)}"></i></span><span class="muted">${k}/${ws.length}</span></div>`; }).join('')}</div>
        </div>
      </div>
      <div class="section-title"><h2>Games</h2><button class="link" data-go="ranks">Leaderboards ${icon('next')}</button></div>
      <div class="game-stats">${[...GAME_IDS, 'final'].map(g => { const m = GAME_META[g], r = p.games[g]; return `<div class="gstat" style="--gc:${m.color}"><b>${m.name}</b><span class="gv">${g === 'final' ? (r.best + '%') : fmt(r.score)}</span><small>${r.plays} plays · rank #${rankOf(p.id, g)}</small></div>`; }).join('')}</div>
      <div class="section-title"><h2>Grammar topics</h2></div>
      <div class="card pad"><div class="mastery">${Object.entries(TOPICS).filter(([k]) => p.topics[k]).map(([k, name]) => { const t = p.topics[k]; const pct = Math.round(t.c / (t.c + t.w) * 100); return `<div class="mrow" style="--cc:${pct >= 75 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#EF4444'}"><span>${esc(name)}</span><span class="mbar"><i data-w="${pct}"></i></span><span class="muted">${pct}%</span></div>`; }).join('') || `<p class="muted small">Play the English Quiz to see your grammar strengths here.</p>`}</div></div>
      <div class="row gap" style="margin-top:1.2rem;flex-wrap:wrap">
        <button class="btn" data-go="achievements">${icon('medal')} Achievements</button>
        <button class="btn ghost" data-go="mistakes">${icon('alert')} Mistakes</button>
        <button class="btn ghost" data-go="welcome">${icon('switch')} Switch Player</button>
      </div>`;
    $$('[data-count]', el).forEach(n => countUp(n, +n.dataset.count));
    setTimeout(() => $$('[data-w]', el).forEach(n => n.style.width = n.dataset.w + '%'), 150);
  },
};

/* ---------------------------------- mistakes ---------------------------------- */
const MistakeState = { game: 'all' };
Router.routes.mistakes = {
  nav: 'home',
  render(el) {
    const p = P();
    const open = p.mistakes.filter(m => !m.fixed);
    const hard = VOCAB.map(w => ({ w, n: (p.words[w.id] || {}).w || 0 })).filter(x => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 8);
    const games = [...new Set(p.mistakes.map(m => m.game))];
    const draw = () => {
      const list = p.mistakes.filter(m => MistakeState.game === 'all' || m.game === MistakeState.game).slice(0, 80);
      el.innerHTML = `
        <div class="page-head"><button class="icon-btn" data-go="home">${icon('back')}</button><div class="grow"><h1>Smart Mistakes</h1><p>Every wrong answer becomes a lesson</p></div></div>
        <div class="card mk-hero">
          <div>
            <h3 style="font-size:1.3rem">${open.length ? `${open.length} mistake${open.length > 1 ? 's' : ''} to review` : 'No open mistakes!'}</h3>
            <p class="muted small" style="font-weight:800">Words you miss appear more often in games until you master them.</p>
            ${hard.length ? `<div class="hard-words">${hard.map(x => `<span class="hard-word">${esc(x.w.en)} <i>${x.n}x</i></span>`).join('')}</div>` : ''}
          </div>
          <button class="btn big" style="--c:#14B8A6;--cd:#0F766E" data-review ${open.length ? '' : 'disabled'}>${icon('repeat')} Review Test</button>
        </div>
        ${games.length > 1 ? `<div class="chips" style="margin-top:1rem"><button class="chip-btn ${MistakeState.game === 'all' ? 'active' : ''}" data-g="all">All</button>${games.map(g => `<button class="chip-btn ${MistakeState.game === g ? 'active' : ''}" style="--cc:${(GAME_META[g] || {}).color}" data-g="${g}">${(GAME_META[g] || { name: g }).name}</button>`).join('')}</div>` : '<div style="height:1rem"></div>'}
        <div class="mk-list">${list.length ? list.map((m, i) => {
          const w = m.wordId ? VOCAB_BY_ID[m.wordId] : null;
          const gm = GAME_META[m.game] || GAME_META.quiz;
          return `<div class="card mk ${m.fixed ? 'fixed' : ''}" style="animation-delay:${Math.min(i, 10) * 0.04}s">
            <div class="mk-head"><span class="chip c" style="--cc:${gm.color}">${icon(gm.icon)} ${gm.name}</span>${m.fixed ? `<span class="chip c" style="--cc:#22C55E">${icon('check')} Fixed</span>` : ''}<span class="when">${timeAgo(m.t)}</span></div>
            <div class="mk-q">${esc(m.q)}</div>
            <dl class="mk-grid">
              <dt>My answer</dt><dd class="mine">${esc(m.mine || '—')}</dd>
              <dt>Correct</dt><dd class="right">${esc(m.correct)}</dd>
              ${m.exp ? `<dt>Why</dt><dd>${esc(m.exp)}</dd>` : ''}
              ${w ? `<dt>Turkish</dt><dd><b>${esc(w.en)}</b> = ${esc(w.tr)}</dd><dt>Example</dt><dd>${esc(w.ex)} <span class="muted">(${esc(w.exTr)})</span> ${speakBtn(w.ex, 'sm')}</dd>` : ''}
            </dl>
          </div>`;
        }).join('') : `<div class="empty">${icon('sparkles')}No mistakes yet — play some games! Your wrong answers will be analysed here.</div>`}</div>`;
      const rv = $('[data-review]', el); if (rv) rv.onclick = () => Router.go('play/review');
      $$('[data-g]', el).forEach(b => b.onclick = () => { MistakeState.game = b.dataset.g; draw(); });
    };
    draw();
  },
};

/* -------------------------------- achievements -------------------------------- */
Router.routes.achievements = {
  nav: 'progress',
  render(el) {
    const p = P();
    checkAchievements();
    const got = Object.keys(p.ach).length;
    el.innerHTML = `
      <div class="page-head"><button class="icon-btn" data-go="progress">${icon('back')}</button><div class="grow"><h1>Achievements</h1><p>${got} of ${ACHIEVEMENTS.length} badges unlocked</p></div></div>
      <div class="ach-grid">${ACHIEVEMENTS.map((a, i) => {
        const [c, t] = a.prog(p); const done = !!p.ach[a.id];
        return `<div class="ach ${done ? '' : 'locked'}" style="--ac:${a.color};animation-delay:${i * 0.03}s">
          <div class="medal">${icon(done ? a.icon : 'lock')}</div>
          <b>${a.name}</b><small>${a.desc}</small>
          ${done ? `<span class="ach-date">${icon('check')} ${new Date(p.ach[a.id]).toLocaleDateString('en-GB')}</span>` : `<div class="ach-prog"><i style="width:${(c / t) * 100}%"></i></div><small style="min-height:0;margin-top:.3rem">${fmt(c)} / ${fmt(t)}</small>`}
        </div>`;
      }).join('')}</div>`;
  },
};

/* --------------------------------- leaderboard --------------------------------- */
let RankTab = 'overall';
Router.routes.ranks = {
  nav: 'ranks',
  render(el) {
    const p = P();
    const tabs = [['overall', 'Overall XP', 'zap', '#6D5DFC'], ...GAME_IDS.map(g => [g, GAME_META[g].name, GAME_META[g].icon, GAME_META[g].color]), ['final', 'Final Exam', 'trophy', GAME_META.final.color]];
    let first = true;
    const draw = () => {
      const b = board(RankTab);
      const unit = RankTab === 'overall' ? 'XP' : RankTab === 'final' ? '%' : 'pts';
      const val = v => RankTab === 'final' ? `${v}%` : `${fmt(v)} ${unit}`;
      const top = [b[1], b[0], b[2]];
      const others = b.filter(e => e.remote).length;
      const status = ClassNet.connected
        ? `<div class="cl-banner on">${icon('wifi')}<span><b>Class leaderboard · live</b><small>${b.length} players · ${others} on other devices · updates every few seconds${ClassNet.isHost() && (ClassNet.info.addresses || []).length ? `<br>Students join in Settings → Class leaderboard: <b class="cl-addr">${esc(ClassNet.info.addresses[0].replace(/^http:\/\//, ''))}</b>` : ''}</small></span></div>`
        : ClassNet.base()
          ? `<div class="cl-banner off">${icon('wifi')}<span><b>Class server not reachable</b><small>Showing this device only. Check that Baslat.bat is running and you are on the same Wi-Fi.</small></span><button class="btn sm ghost" data-go="settings">Settings</button></div>`
          : `<div class="cl-banner">${icon('users')}<span><b>This device only</b><small>Play with your whole class: connect to the class leaderboard in Settings.</small></span><button class="btn sm" data-go="settings">${icon('link')} Connect</button></div>`;
      el.classList.toggle('no-anim', !first); first = false;
      el.innerHTML = `
        <div class="page-head"><div class="grow"><h1>Leaderboards</h1><p>Every game has its own ranking</p></div><button class="btn sm" data-go="welcome">${icon('users')} Players</button></div>
        ${status}
        <div class="lb-tabs">${tabs.map(([id, name, ic, c]) => `<button class="chip-btn ${RankTab === id ? 'active' : ''}" style="--cc:${c}" data-tab="${id}">${icon(ic)} ${name}</button>`).join('')}</div>
        <div class="podium">${top.map((e, i) => {
          const r = [2, 1, 3][i];
          if (!e) return `<div class="pod r${r} empty"><span class="avatar" style="--s:${r === 1 ? 84 : 64}px;background:#E5E7F0"></span><div class="pn">—</div><div class="pbar">${r}</div></div>`;
          return `<div class="pod r${r} ${e.p.id === p.id ? 'me' : ''}">${r === 1 ? icon('crown', 'crown') : ''}${avatarHTML(e.p.avatar, r === 1 ? 84 : 64)}<div class="pn">${esc(e.p.name)}</div><div class="pv">${val(e.v)}</div><div class="pbar">${r}</div></div>`;
        }).join('')}</div>
        <div class="lb-list">${b.map((e, i) => `
          <div class="lb-row ${e.p.id === p.id ? 'me' : ''}" style="animation-delay:${Math.min(i, 12) * 0.04}s">
            <span class="rk">${e.rank}</span>${avatarHTML(e.p.avatar, 40)}
            <span class="nm">${esc(e.p.name)}${e.p.id === p.id ? '<span class="you">YOU</span>' : ''}${e.remote ? `<span class="peer" title="Plays on another device">${icon('wifi')}</span>` : ''}<small>Level ${levelInfo(e.p.xp).level} · ${levelInfo(e.p.xp).title}</small></span>
            <span class="vl">${val(e.v)}</span>
          </div>`).join('')}</div>
        ${b.length < 2 ? `<div class="tip" style="margin-top:1rem">${icon('users')}<span>Only you so far! Classmates can join on this device from <b>Players → New Player</b>, or on their own phones through the class leaderboard.</span></div>` : ''}`;
      $$('[data-tab]', el).forEach(t => t.onclick = () => { RankTab = t.dataset.tab; SFX.tap(); first = true; draw(); });
    };
    draw();
    // live updates from the class server
    const refresh = async () => { if (!ClassNet.base()) return; await ClassNet.pull(); if (el.isConnected) draw(); };
    refresh();
    const timer = setInterval(refresh, 6000);
    return () => clearInterval(timer);
  },
};

/* ----------------------------------- settings ----------------------------------- */
Router.routes.settings = {
  nav: 'progress',
  render(el) {
    const p = P();
    const draw = () => {
      const s = S();
      el.innerHTML = `
        <div class="page-head"><button class="icon-btn" data-go="progress">${icon('back')}</button><div class="grow"><h1>Settings</h1><p>Make English Quest yours</p></div></div>
        <div class="card set-group">
          <h3>Player</h3>
          <div class="set-row">${avatarHTML(p.avatar, 48)}<div class="s-txt"><b>${esc(p.name)}</b><small>Level ${levelInfo(p.xp).level} · ${fmt(p.xp)} XP</small></div><button class="btn sm ghost" data-edit>${icon('edit')} Edit</button></div>
          <div class="set-row"><span class="s-ic">${icon('users')}</span><div class="s-txt"><b>Switch player</b><small>${Object.keys(DB.state.players).length} player(s) on this device</small></div><button class="btn sm" data-go="welcome">Switch</button></div>
        </div>
        <div class="card set-group">
          <h3>Sound & Voice</h3>
          <div class="set-row"><span class="s-ic">${icon('volume')}</span><div class="s-txt"><b>Sound effects</b><small>Game sounds and vibration</small></div><button class="switch ${s.sound ? 'on' : ''}" data-toggle="sound" aria-label="Sound effects"></button></div>
          <div class="set-row"><span class="s-ic">${icon('headphones')}</span><div class="s-txt"><b>Pronunciation voice</b><small>${!Speech.supported ? 'Not supported on this device' : s.voice ? 'On: tap a speaker button to hear a word' : 'Off: the game never talks (sound effects still play)'}</small></div><button class="switch ${s.voice ? 'on' : ''}" data-toggle="voice" aria-label="Voice"></button></div>
          <div class="set-row"><span class="s-ic">${icon('users')}</span><div class="s-txt"><b>Choose voice</b><small>Pick the voice and speed that reads the words</small></div><button class="btn sm" data-voicepick>${icon('headphones')} Choose</button></div>
        </div>
        <div class="card set-group" id="classbox">
          <h3>Class leaderboard</h3>
          <div class="set-row"><span class="s-ic" style="background:#E0F2FE;color:#0284C7">${icon('trophy')}</span><div class="s-txt"><b id="cl-status">Checking…</b><small id="cl-sub">Share one leaderboard with every phone and the smart board on the same Wi-Fi.</small></div></div>
          <div class="set-row cl-form">
            <input class="cl-input" placeholder="Server address, e.g. 192.168.1.20:5173" value="${esc((s.classServer || '').replace(/^http:\/\//, ''))}" inputmode="url" autocomplete="off">
            <button class="btn sm" data-clconnect>${icon('link')} Connect</button>
          </div>
          <div class="set-row" id="cl-extra" hidden></div>
        </div>
        <div class="card set-group">
          <h3>Display</h3>
          <div class="set-row"><span class="s-ic">${icon('sparkles')}</span><div class="s-txt"><b>Animations</b><small>Turn off for slower devices</small></div><button class="switch ${s.motion ? 'on' : ''}" data-toggle="motion" aria-label="Animations"></button></div>
          <div class="set-row"><span class="s-ic">${icon('fullscreen')}</span><div class="s-txt"><b>Full screen</b><small>Great for the smart board</small></div><button class="btn sm" data-full>${icon('fullscreen')} Toggle</button></div>
        </div>
        <div class="card set-group">
          <h3>Data</h3>
          <div class="set-row"><span class="s-ic" style="background:#FEECEC;color:#EF4444">${icon('rotate')}</span><div class="s-txt"><b>Reset my progress</b><small>XP, scores and mistakes go back to zero</small></div><button class="btn sm danger" data-reset>Reset</button></div>
          <div class="set-row"><span class="s-ic" style="background:#FEECEC;color:#EF4444">${icon('trash')}</span><div class="s-txt"><b>Delete this player</b><small>Removes ${esc(p.name)} from all leaderboards</small></div><button class="btn sm danger" data-del>Delete</button></div>
        </div>
        <div class="card set-group"><h3>About</h3><div class="set-row"><span class="s-ic">${icon('info')}</span><div class="s-txt"><b>English Quest</b><small>${UNIT.grade} (${UNIT.level}) · ${UNIT.title}. Content follows the MEB Türkiye Yüzyılı Maarif Modeli English curriculum. Progress is saved on this device and works offline.</small></div></div></div>`;
      $$('[data-toggle]', el).forEach(b => b.onclick = () => {
        const k = b.dataset.toggle; s[k] = !s[k]; DB.save();
        if (k === 'motion') document.body.classList.toggle('reduce-motion', !s.motion);
        if (k === 'voice') document.body.classList.toggle('no-voice', !s.voice);
        if (k === 'sound' && s.sound) SFX.correct();
        draw();
      });
      $('[data-voicepick]', el).onclick = () => {
        const m = modal(`<h3 style="margin-bottom:.4rem">${icon('headphones')} Choose a voice</h3><p class="muted small" style="margin-bottom:.8rem;font-weight:800">Tap a voice to hear it.</p><div id="vpm"></div>`, { cls: 'wide' });
        voicePicker($('#vpm', m.el), { doneLabel: 'Save', onDone: () => { m.close(); draw(); } });
      };
      // ---- class leaderboard ----
      const clStatus = async () => {
        const st = $('#cl-status', el), sub = $('#cl-sub', el), extra = $('#cl-extra', el);
        if (!st) return;
        if (!ClassNet.base()) { st.textContent = 'Not connected · this device only'; sub.textContent = 'Run Baslat.bat on the teacher computer, then type the address it shows here.'; return; }
        await ClassNet.connect();
        if (!$('#cl-status', el)) return;
        if (ClassNet.connected) {
          const n = board('overall').length;
          st.innerHTML = `<span style="color:var(--green-d)">${icon('check')} Connected</span> · ${n} player${n === 1 ? '' : 's'} in the class`;
          sub.textContent = ClassNet.base().replace(/^http:\/\//, '');
          const addrs = (ClassNet.info && ClassNet.info.addresses) || [];
          if (ClassNet.isHost()) {
            extra.hidden = false;
            extra.innerHTML = `<span class="s-ic" style="background:#FEF3C7;color:#D97706">${icon('wifi')}</span><div class="s-txt"><b>This computer is the class server</b><small>Students type this in Settings → Class leaderboard:<br><b class="cl-addr">${esc((addrs[0] || '—').replace(/^http:\/\//, ''))}</b>${addrs.length > 1 ? `<br>other networks: ${addrs.slice(1).map(a => esc(a.replace(/^http:\/\//, ''))).join(', ')}` : ''}</small></div><button class="btn sm danger" data-clreset>Reset</button>`;
            $('[data-clreset]', el).onclick = async () => {
              if (!(await confirmBox('Reset class leaderboard?', 'All class scores on the server will be deleted. Players keep their own progress on their devices.', 'Reset', true))) return;
              try { await ClassNet.req('/api/reset', {}); ClassNet.setRemote([]); toast('Class leaderboard reset', 'info'); ClassNet.lastSent = ''; ClassNet.push(); } catch (e) { toast('Reset failed', 'bad'); }
            };
          }
        } else {
          st.innerHTML = `<span style="color:var(--red-d)">${icon('x')} Server not reachable</span>`;
          sub.textContent = `${ClassNet.base().replace(/^http:\/\//, '')} — is Baslat.bat running and are you on the same Wi-Fi?`;
        }
      };
      $('.cl-input', el).onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); $('[data-clconnect]', el).click(); } };
      $('[data-clconnect]', el).onclick = async () => {
        const inp = $('.cl-input', el);
        const val = inp.value.trim();
        if (!val) { s.classServer = ''; DB.saveNow(); ClassNet.setRemote([]); clStatus(); toast('Class leaderboard turned off', 'info'); return; }
        const btn = $('[data-clconnect]', el); btn.disabled = true;
        try {
          const { base } = await ClassNet.test(val);
          s.classServer = base; DB.saveNow();
          SFX.correct(); toast('Connected to the class leaderboard!', 'good');
        } catch (e) {
          SFX.wrong(); toast('Could not connect. Check the address and the Wi-Fi.', 'bad');
        }
        btn.disabled = false;
        clStatus();
      };
      clStatus();
      $('[data-full]', el).onclick = toggleFullscreen;
      $('[data-edit]', el).onclick = () => editPlayer(draw);
      $('[data-reset]', el).onclick = async () => {
        if (!(await confirmBox('Reset progress?', `All XP, scores, words and mistakes of ${p.name} will be deleted. This cannot be undone.`, 'Reset', true))) return;
        const keep = { id: p.id, name: p.name, avatar: p.avatar, created: p.created };
        Object.keys(p).forEach(k => delete p[k]); Object.assign(p, keep); migratePlayer(p); DB.saveNow();
        toast('Progress reset', 'info'); Router.go('home');
      };
      $('[data-del]', el).onclick = async () => {
        if (!(await confirmBox('Delete player?', `${p.name} will be removed from this device and all leaderboards.`, 'Delete', true))) return;
        deletePlayer(p.id); Router.go(P() ? 'welcome' : 'welcome');
      };
    };
    draw();
  },
};
function editPlayer(after) {
  const p = P();
  let av = p.avatar;
  const m = modal(`<h3 style="margin-bottom:1rem">Edit player</h3>
    <input class="name-input" maxlength="18" value="${esc(p.name)}">
    <div class="avatar-pick">${AVATARS.map((a, i) => `<button data-av="${i}" class="${i === av ? 'sel' : ''}">${avatarHTML(i, 56)}</button>`).join('')}</div>
    <div class="row gap"><button class="btn ghost grow" data-close>Cancel</button><button class="btn grow" data-save>${icon('check')} Save</button></div>`, { cls: 'center' });
  $$('[data-av]', m.el).forEach(b => b.onclick = () => { av = +b.dataset.av; $$('[data-av]', m.el).forEach(x => x.classList.toggle('sel', x === b)); });
  $('[data-save]', m.el).onclick = () => {
    const n = $('.name-input', m.el).value.trim();
    if (n.length < 2) { toast('Name is too short', 'bad'); return; }
    if (Object.values(DB.state.players).some(x => x.id !== p.id && x.name.toLowerCase() === n.toLowerCase())) { toast('That name is taken on this device', 'bad'); return; }
    p.name = n.slice(0, 18); p.avatar = av; DB.saveNow(); m.close(); after && after();
  };
}
function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) (document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen).call(document.documentElement);
    else (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  } catch (e) { toast('Full screen is not available here', 'info'); }
}

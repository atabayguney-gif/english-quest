/* =========================================================================
   ENGLISH QUEST — boot
   ========================================================================= */
'use strict';
(function boot() {
  DB.load();
  document.body.classList.toggle('reduce-motion', !S().motion);
  document.body.classList.toggle('no-voice', !S().voice);
  document.body.classList.add('t-' + TARGET);
  FX.init();
  Speech.init();

  // animated background confetti squares
  const bg = $('#bg');
  const cols = ['#6D5DFC', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#06B6D4'];
  for (let i = 0; i < 12; i++) {
    const n = document.createElement('i');
    n.style.left = Math.random() * 100 + 'vw';
    n.style.background = cols[i % cols.length];
    n.style.animationDuration = 16 + Math.random() * 18 + 's';
    n.style.animationDelay = -Math.random() * 30 + 's';
    n.style.transform = `rotate(${Math.random() * 90}deg)`;
    if (i % 3 === 0) n.style.borderRadius = '50%';
    bg.appendChild(n);
  }

  // navigation (bottom bar on phones, side rail on boards / desktops)
  const items = [['home', 'Home', 'home'], ['quest', 'Quest', 'map'], ['learn', 'Learn', 'book'], ['games', 'Games', 'gamepad'], ['ranks', 'Ranks', 'trophy'], ['progress', 'Profile', 'user']];
  $('#nav').innerHTML = `<span class="nav-brand" aria-hidden="true">EQ</span>` + items.map(([id, label, ic]) =>
    `<button class="nav-item" data-nav="${id}" data-go="${id}" aria-label="${label}">${icon(ic)}<span>${label}</span>${id === 'home' ? '<i class="nav-dot" id="nav-daily-dot" hidden></i>' : ''}</button>`).join('');

  if (!location.hash) history.replaceState(null, '', '#/home');
  Router.start();

  // shared class leaderboard: connect, then keep other players' scores fresh
  const startClass = () => ClassNet.connect().then(ok => { if (ok && ['home', 'ranks'].includes(Router.current)) Router.render(); });
  if (!S().classServer && location.protocol === 'file:') {
    // smart board: if Baslat.bat runs on this computer, join its class leaderboard automatically
    ClassNet.test('localhost:5173').then(({ base }) => { S().classServer = base; DB.saveNow(); startClass(); }).catch(() => { });
  } else startClass();
  setInterval(() => { if (ClassNet.base() && !document.hidden) ClassNet.pull(); }, 20000);

  // players who started before the voice picker existed choose their voice once
  if (P() && !S().voiceChosen && Router.current !== 'welcome') {
    setTimeout(() => {
      const m = modal(`<div class="vp-hero">${icon('headphones')}</div><h3 class="center" style="margin-bottom:.3rem">Choose a voice</h3><p class="muted small center" style="margin-bottom:.8rem;font-weight:800">This voice reads English words when you tap the speaker. Tap a voice to hear it.</p><div id="vpb"></div>`, { cls: 'wide', dismissable: false });
      voicePicker($('#vpb', m.el), { onDone: () => m.close() });
    }, 900);
  }

  document.addEventListener('visibilitychange', () => { if (document.hidden) DB.saveNow(); });
  addEventListener('pagehide', () => DB.saveNow());

  // offline support when served over http(s)
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
  }
})();

(function () {
  const music = document.getElementById('public-music');
  const button = document.getElementById('public-audio');
  const preferenceKey = 'home-cup-info-music';
  let requested = true, failed = false, leaving = false;
  try { requested = localStorage.getItem(preferenceKey) !== 'off'; } catch {}
  if (new URLSearchParams(location.search).get('music') === 'off') requested = false;
  music.volume = .45;

  function update(state) {
    const playing = requested && !music.paused;
    document.body.dataset.musicState = state || (playing ? 'playing' : requested ? 'waiting' : 'off');
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Tắt nhạc' : 'Bật nhạc');
    button.setAttribute('title', 'Valorant Jett · Nhạc nền');
    button.querySelector('span').textContent = playing ? 'NHẠC BẬT' : failed ? 'THỬ LẠI NHẠC' : requested ? 'BẬT NHẠC' : 'NHẠC TẮT';
  }
  function savePreference() {
    try { localStorage.setItem(preferenceKey, requested ? 'on' : 'off'); } catch {}
  }
  function start() {
    if (!requested || document.hidden || leaving) return;
    failed = false;
    music.play().then(() => {
      if (!requested || document.hidden || leaving) music.pause();
      update();
    }).catch(error => {
      if (!requested) { failed = false; update('off'); return; }
      failed = error.name !== 'NotAllowedError';
      update(failed ? 'error' : requested ? 'waiting' : 'off');
    });
  }
  music.addEventListener('playing', () => update('playing'));
  music.addEventListener('pause', () => update());
  music.addEventListener('error', () => { failed = true; update('error'); });
  button.addEventListener('click', () => {
    if (requested && !music.paused) {
      requested = false; music.pause(); update('off');
    } else {
      requested = true; start();
    }
    savePreference();
  });
  function firstInteraction(event) {
    if (event.target.closest?.('#public-audio')) return;
    if (requested && music.paused && !failed) start();
  }
  document.addEventListener('pointerdown', firstInteraction, { passive: true });
  document.addEventListener('click', firstInteraction);
  document.addEventListener('keydown', firstInteraction);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      music.pause(); update(requested ? 'background' : 'off');
    } else if (requested && !failed) start();
  });
  addEventListener('pagehide', () => { leaving = true; music.pause(); update('background'); });
  addEventListener('pageshow', event => {
    if (!event.persisted) return;
    leaving = false;
    if (requested) start();
  });
  addEventListener('storage', event => {
    if (event.key !== preferenceKey) return;
    requested = event.newValue !== 'off';
    if (!requested) { music.pause(); update('off'); }
    else start();
  });
  update();
  if (requested) start(); else music.pause();
})();

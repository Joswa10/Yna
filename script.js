/* ==========================================================================
   SPRING SNOW — application logic
   Sections: 0 Setup · 1 Stages · 2 Intro/loading · 3 Audio + clock ·
             4 Lyrics · 5 Player UI · 6 Hearts & sparkles · 7 Snow ·
             8 Cursor · 9 Sync helper (?sync) · 10 Boot
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- 0. Setup ---------- */
  const CFG = window.SPRING_SNOW || {};
  const START = Number(CFG.startTime ?? 20);
  const END = Number(CFG.endTime ?? 135);
  const SPAN = END - START;

  const $ = (sel) => document.querySelector(sel);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const isSmall = () => window.innerWidth < 700;

  const el = {
    body: document.body,
    audio: $('#audio'),
    intro: $('#intro'), main: $('#main'), ending: $('#ending'),
    openBtn: $('#open-btn'), skipBtn: $('#skip-btn'), replayBtn: $('#replay-btn'),
    introTitle: $('#intro-title'), introReady: $('#intro-ready'),
    loader: $('#loader'), loaderFill: $('#loader-fill'), loaderHeart: $('#loader-heart'),
    lines: $('#lyric-lines'), hint: $('#start-hint'),
    playBtn: $('#play-btn'), restartBtn: $('#restart-btn'), muteBtn: $('#mute-btn'),
    volume: $('#volume'), progress: $('#progress'),
    timeNow: $('#time-now'), timeEnd: $('#time-end'), note: $('#player-note'),
    heartsLayer: $('#hearts-layer'), fxLayer: $('#fx-layer'),
    snow: $('#snow'), cursor: $('#cursor'),
    endingTitle: $('#ending-title'), endingSub: $('#ending-sub')
  };

  const fmt = (s) => {
    s = Math.max(0, Math.floor(s));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };
  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  if (CFG.endingTitle) el.endingTitle.textContent = CFG.endingTitle;
  if (CFG.endingSub) el.endingSub.textContent = CFG.endingSub;
  el.timeNow.textContent = fmt(START);
  el.timeEnd.textContent = fmt(END);
  el.progress.max = String(SPAN);

  /* ---------- 1. Stages ---------- */
  let stage = 'intro';
  function showStage(name) {
    stage = name;
    el.body.dataset.stage = name;
    [['intro', el.intro], ['main', el.main], ['ending', el.ending]].forEach(([key, node]) => {
      const active = key === name;
      node.classList.toggle('is-active', active);
      if (active) node.removeAttribute('inert'); else node.setAttribute('inert', '');
    });
  }

  /* ---------- 2. Intro / honest loading ---------- */
  let introDone = false;
  function runIntroLoading() {
    const MIN_SHOW = reduceMotion ? 300 : 2600;   // let the cute animation play
    const HARD_TIMEOUT = 7000;                      // never trap the visitor
    const t0 = performance.now();
    const tasks = { page: false, fonts: false, audio: false };

    const finishTask = (name) => { tasks[name] = true; };
    if (document.readyState === 'complete') finishTask('page');
    else window.addEventListener('load', () => finishTask('page'), { once: true });

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => finishTask('fonts'), () => finishTask('fonts'));
    else finishTask('fonts');

    if (!CFG.audioSrc) finishTask('audio');
    else {
      const done = () => finishTask('audio');
      el.audio.addEventListener('loadedmetadata', done, { once: true });
      el.audio.addEventListener('error', done, { once: true });
      setTimeout(done, 3500);
    }

    const timer = setInterval(() => {
      const elapsed = performance.now() - t0;
      const taskFraction = Object.values(tasks).filter(Boolean).length / 3;
      const timeFraction = Math.min(1, elapsed / MIN_SHOW);
      const shown = Math.min(timeFraction, taskFraction);
      setLoader(shown);
      if (shown >= 1 || elapsed > HARD_TIMEOUT) {
        clearInterval(timer);
        setLoader(1);
        revealIntroButton();
      }
    }, 100);
  }
  function setLoader(fraction) {
    const pct = Math.round(fraction * 100);
    el.loaderFill.style.width = pct + '%';
    el.loaderHeart.style.left = pct + '%';
    el.loader.setAttribute('aria-valuenow', String(pct));
  }
  function revealIntroButton() {
    if (introDone) return;
    el.loader.classList.add('is-done');
    if (el.introTitle) el.introTitle.style.display = 'none';
    el.introReady.hidden = false;
    el.openBtn.focus({ preventScroll: true });
  }
  function enterMain() {
    if (introDone) return;
    introDone = true;
    clearInterval(introHeartTimer);
    showStage('main');
    el.playBtn.focus({ preventScroll: true });
  }

  let introHeartTimer = null;

  /* ---------- 3. Audio + playback clock ---------- */
  // previewMode = no usable audio → a virtual clock drives the lyrics so the page still looks beautiful.
  let previewMode = !CFG.audioSrc;
  let previewTime = START;
  let lastTick = 0;
  let playing = false;
  let hasStarted = false;
  let ended = false;
  let rafId = 0;

  if (!previewMode) {
    el.audio.src = CFG.audioSrc;
    el.audio.volume = Number(el.volume.value);
    el.audio.addEventListener('error', enterPreviewMode);
  }

  function enterPreviewMode() {
    if (previewMode) return;
    previewMode = true;
    previewTime = START;
    setPlaying(false);
    showNote('Preview mode — add your song at ' + (CFG.audioSrc || 'assets/spring-snow.mp3') + ' to hear the music.');
    render(START, true);
  }
  function showNote(msg) {
    el.note.textContent = msg;
    el.note.hidden = !msg;
  }
  if (previewMode) showNote('Preview mode — add your song to assets/ to hear the music.');

  const currentTime = () => (previewMode ? previewTime : el.audio.currentTime);
  function setTime(t) {
    if (previewMode) { previewTime = t; return; }
    try { el.audio.currentTime = t; } catch (_) { /* metadata not ready yet; handled on play */ }
  }

  function setPlaying(value) {
    playing = value;
    el.body.classList.toggle('is-playing', value);
    el.playBtn.setAttribute('aria-pressed', String(value));
    el.playBtn.setAttribute('aria-label', value ? 'Pause' : 'Play');
    if (value) {
      hasStarted = true;
      el.body.classList.add('has-started');
      el.hint.classList.add('is-hidden');
      startLoop();
    } else {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  function play() {
    if (ended) resetSection();
    const t = currentTime();
    if (t < START - 0.25 || t >= END) setTime(START);   // always begin inside the window

    if (previewMode) {
      lastTick = performance.now();
      setPlaying(true);
      return;
    }
    const attempt = el.audio.play();
    if (attempt && attempt.catch) {
      attempt.catch(() => {
        // Autoplay blocked or file unreadable: stay calm, let them tap again.
        setPlaying(false);
        if (!previewMode) showNote('Tap play once more to start the song ♡');
      });
    }
  }
  function pause() {
    if (previewMode) { setPlaying(false); return; }
    el.audio.pause();
  }
  function togglePlay() { (playing ? pause : play)(); }

  function resetSection() {
    ended = false;
    el.body.classList.remove('is-ended');
    setTime(START);
    activeIndex = -2;
    render(START, true);
  }

  // Audio element events (real playback state is the source of truth)
  el.audio.addEventListener('play', () => { if (!previewMode) { showNote(''); setPlaying(true); } });
  el.audio.addEventListener('playing', () => el.body.classList.remove('is-buffering'));
  el.audio.addEventListener('waiting', () => el.body.classList.add('is-buffering'));
  el.audio.addEventListener('pause', () => { if (!previewMode) setPlaying(false); });
  el.audio.addEventListener('ended', () => finishSection());
  el.audio.addEventListener('timeupdate', () => { if (!playing) render(currentTime()); checkEnd(currentTime()); });
  el.audio.addEventListener('seeked', () => render(currentTime(), true));
  el.audio.addEventListener('loadedmetadata', () => {
    if (el.audio.duration && el.audio.duration < END) {
      showNote('This audio file is shorter than 2:15 — check that it is the full song.');
    }
  });

  function startLoop() {
    cancelAnimationFrame(rafId);
    lastTick = performance.now();
    const frame = (now) => {
      if (!playing) return;
      if (previewMode) { previewTime += (now - lastTick) / 1000; }
      lastTick = now;
      const t = currentTime();
      if (checkEnd(t)) return;
      render(t);
      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);
  }

  function checkEnd(t) {
    if (ended || stage !== 'main') return false;
    if (t >= END) { finishSection(); return true; }
    return false;
  }

  /* ---------- 4. Lyrics ---------- */
  const lyricData = (Array.isArray(CFG.lyrics) ? CFG.lyrics : [])
    .filter((l) => l && typeof l.text === 'string' && l.text.trim() && Number.isFinite(l.time))
    .map((l) => ({ time: Math.min(Math.max(l.time, START), END), text: l.text }))
    .sort((a, b) => a.time - b.time);

  const lineEls = [];
  let activeIndex = -2;

  function buildLyrics() {
    if (!lyricData.length) {
      lyricData.push({ time: START, text: 'Add your lyrics in lyrics.js ♡' });
    }
    lyricData.forEach((item) => {
      const line = document.createElement('div');
      line.className = 'line';
      line.dataset.pos = 'future';
      const span = document.createElement('span');
      span.className = 'line-text';
      span.textContent = item.text;           // textContent keeps your wording exactly
      line.appendChild(span);
      el.lines.appendChild(line);
      lineEls.push(line);
    });
    setActiveIndex(-1);
  }

  function indexForTime(t) {
    let found = -1;
    for (let i = 0; i < lyricData.length; i++) {
      if (lyricData[i].time <= t + 0.05) found = i; else break;
    }
    return found;
  }

  function setActiveIndex(i) {
    activeIndex = i;
    lineEls.forEach((node, n) => {
      const d = n - i;
      node.dataset.pos = d === 0 ? '0' : d === 1 ? '1' : d === -1 ? '-1' : d < 0 ? 'past' : 'future';
      if (d !== 0) node.firstElementChild.style.removeProperty('--p');
    });
    // Announce the line to screen readers without re-reading everything
    el.lines.setAttribute('aria-label', i >= 0 ? lyricData[i].text : '');
  }

  function render(t, force) {
    const clamped = Math.min(Math.max(t, START), END);

    // lyric line
    const idx = indexForTime(t);
    if (idx !== activeIndex || force) setActiveIndex(idx);

    // karaoke glow fill across the active line
    if (idx >= 0) {
      const start = lyricData[idx].time;
      const next = idx + 1 < lyricData.length ? lyricData[idx + 1].time : END;
      const duration = Math.max(1, next - start);
      const pct = Math.min(100, ((t - start) / (duration * 0.85)) * 100);
      lineEls[idx].firstElementChild.style.setProperty('--p', pct.toFixed(1));
    }

    // time + slider
    el.timeNow.textContent = fmt(clamped);
    if (!scrubbing) {
      el.progress.value = String(clamped - START);
      paintSlider(el.progress);
    }
  }

  /* ---------- 5. Player UI ---------- */
  let scrubbing = false;

  function paintSlider(input) {
    const pct = ((Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min))) * 100;
    input.style.setProperty('--fill', pct + '%');
  }

  el.playBtn.addEventListener('click', togglePlay);
  el.restartBtn.addEventListener('click', () => {
    ended = false;
    setTime(START);
    activeIndex = -2;
    render(START, true);
    play();
  });

  el.progress.addEventListener('pointerdown', () => { scrubbing = true; });
  el.progress.addEventListener('pointerup', () => { scrubbing = false; });
  el.progress.addEventListener('blur', () => { scrubbing = false; });
  el.progress.addEventListener('input', () => {
    const t = START + Number(el.progress.value);
    setTime(Math.min(t, END - 0.2));                // can never seek past the end
    paintSlider(el.progress);
    render(t, true);
  });

  el.volume.addEventListener('input', () => {
    const v = Number(el.volume.value);
    el.audio.volume = v;
    el.audio.muted = v === 0;
    syncMuteUi();
    paintSlider(el.volume);
  });
  el.muteBtn.addEventListener('click', () => {
    el.audio.muted = !el.audio.muted;
    syncMuteUi();
  });
  function syncMuteUi() {
    el.muteBtn.setAttribute('aria-pressed', String(el.audio.muted));
    el.muteBtn.setAttribute('aria-label', el.audio.muted ? 'Unmute' : 'Mute');
  }
  paintSlider(el.volume);
  paintSlider(el.progress);

  // Space toggles play on the main stage (unless focus is on a button/input)
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && stage === 'main' && !e.target.closest('button, input, textarea')) {
      e.preventDefault();
      togglePlay();
    }
  });

  function finishSection() {
    if (ended) return;
    ended = true;
    el.audio.pause();                               // never run past the endpoint
    setPlaying(false);
    setTime(END);
    render(END, true);
    el.body.classList.add('is-ended');
    // Let the last lyric linger, then fade into the ending
    setTimeout(() => {
      if (!ended) return;
      showStage('ending');
      heartBurst(isSmall() ? 8 : 14);
    }, reduceMotion ? 200 : 1800);
  }

  el.replayBtn.addEventListener('click', () => {
    resetSection();
    showStage('main');
    play();                                          // this click is the user's gesture
    el.playBtn.focus({ preventScroll: true });
  });

  /* ---------- 6. Hearts & sparkles ---------- */
  const HEART_PATH = 'M50 88 C20 66 6 48 6 32 C6 18 17 9 29 9 C38 9 46 14 50 22 C54 14 62 9 71 9 C83 9 94 18 94 32 C94 48 80 66 50 88 Z';
  const MESSAGES = ['joswa'];
  const VARIANTS = ['blush', 'blush', 'white', 'glow', 'lav'];
  const maxHearts = () => (isSmall() ? 4 : 8);

  function spawnHeart(opts = {}) {
    if (reduceMotion || document.hidden) return null;
    if (el.heartsLayer.childElementCount >= maxHearts() && !opts.force) return null;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `heart heart--${opts.variant || pick(VARIANTS)}`;
    btn.setAttribute('aria-label', 'Pop a floating heart');
    btn.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${HEART_PATH}"/></svg>`;
    const size = opts.size || rand(isSmall() ? 22 : 24, isSmall() ? 38 : 48);
    btn.style.setProperty('--size', size + 'px');
    btn.style.setProperty('--x', (opts.x ?? rand(4, 92)) + '%');
    btn.style.setProperty('--drift', rand(-60, 60) + 'px');
    btn.style.setProperty('--dur', (opts.duration || rand(11, 19)) + 's');
    btn.addEventListener('animationend', (e) => { if (e.animationName === 'heart-rise') btn.remove(); });
    btn.addEventListener('click', (e) => { e.stopPropagation(); popHeart(btn); });
    el.heartsLayer.appendChild(btn);
    return btn;
  }

  function popHeart(btn) {
    if (btn.classList.contains('is-popping')) return;
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    btn.classList.add('is-popping');
    btn.disabled = true;
    setTimeout(() => btn.remove(), 450);

    const count = reduceMotion ? 3 : 9;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'particle' + (i % 3 === 0 ? ' is-heart' : '');
      if (i % 3 === 0) p.textContent = '♥';
      const angle = (Math.PI * 2 * i) / count + rand(-.3, .3);
      const dist = rand(34, 70);
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      p.addEventListener('animationend', () => p.remove());
      el.fxLayer.appendChild(p);
    }
    const msg = document.createElement('span');
    msg.className = 'heart-msg';
    msg.textContent = pick(MESSAGES);
    msg.style.left = Math.min(Math.max(cx, 70), window.innerWidth - 70) + 'px';
    msg.style.top = cy + 'px';
    msg.addEventListener('animationend', () => msg.remove());
    el.fxLayer.appendChild(msg);
  }

  // Gentle background spawning — a new heart every couple of seconds
  let heartTimer = null;
  function startHearts() {
    if (reduceMotion || heartTimer) return;
    for (let i = 0; i < 3; i++) setTimeout(spawnHeart, i * 700);
    heartTimer = setInterval(() => { if (stage !== 'ending') spawnHeart(); }, 2300);
  }

  function heartBurst(n) {
    if (reduceMotion) return;
    for (let i = 0; i < n; i++) {
      setTimeout(() => spawnHeart({ force: true, x: rand(8, 90), duration: rand(7, 12), size: rand(20, 40) }), i * 220);
    }
  }

  // Sparkles on empty-space clicks
  document.addEventListener('click', (e) => {
    if (e.target.closest('button, input, a, label, .player')) return;
    const n = reduceMotion ? 2 : 5;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.className = 'sparkle';
      s.textContent = pick(['✦', '✧', '♡', '✦']);
      s.style.left = e.clientX + 'px';
      s.style.top = e.clientY + 'px';
      s.style.setProperty('--dx', rand(-48, 48) + 'px');
      s.style.setProperty('--dy', rand(-56, 20) + 'px');
      s.addEventListener('animationend', () => s.remove());
      el.fxLayer.appendChild(s);
    }
  });

  // Intro: tiny extra hearts from Yoshi's spot are CSS-only (.mini-heart); nothing to clean up here.

  /* ---------- 7. Snow (single canvas, paused when tab hidden) ---------- */
  function initSnow() {
    const canvas = el.snow;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let w = 0, h = 0, dpr = 1, flakes = [], snowRaf = 0;

    const makeFlake = (initial) => ({
      x: rand(0, w), y: initial ? rand(0, h) : -10,
      r: rand(1, 3.2), speed: rand(.25, .9), drift: rand(-.25, .25),
      alpha: rand(.35, .85), sway: rand(0, Math.PI * 2), swaySpeed: rand(.004, .012)
    });
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = reduceMotion ? 18 : isSmall() ? 26 : 55;
      flakes = Array.from({ length: count }, () => makeFlake(true));
      if (reduceMotion) drawStatic();
    }
    function drawFlake(f) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${f.alpha})`;
      ctx.shadowColor = 'rgba(255,255,255,.8)';
      ctx.shadowBlur = f.r * 2.5;
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    function drawStatic() { ctx.clearRect(0, 0, w, h); flakes.forEach(drawFlake); }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        f.y += f.speed;
        f.sway += f.swaySpeed;
        f.x += f.drift + Math.sin(f.sway) * .35;
        if (f.y > h + 10 || f.x < -20 || f.x > w + 20) Object.assign(f, makeFlake(false), { x: rand(0, w) });
        drawFlake(f);
      }
      snowRaf = requestAnimationFrame(tick);
    }
    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 200); });
    resize();
    if (!reduceMotion) {
      snowRaf = requestAnimationFrame(tick);
      document.addEventListener('visibilitychange', () => {
        cancelAnimationFrame(snowRaf);
        if (!document.hidden) snowRaf = requestAnimationFrame(tick);
      });
    }
  }

  /* ---------- 8. Yoshi-style cursor (desktop mouse only) ---------- */
  function initCursor() {
    if (isTouch || reduceMotion) return;
    const c = el.cursor;
    let tx = -100, ty = -100, x = -100, y = -100, running = false, enabled = false;

    function loop() {
      x += (tx - x) * .38;
      y += (ty - y) * .38;
      c.style.transform = `translate3d(${x - 30}px, ${y - 18}px, 0)`; // snout tip ≈ pointer
      if (Math.abs(tx - x) > .1 || Math.abs(ty - y) > .1) requestAnimationFrame(loop);
      else running = false;
    }
    document.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      if (!enabled) { enabled = true; document.documentElement.classList.add('yoshi-cursor'); }
      c.classList.add('is-visible');
      tx = e.clientX; ty = e.clientY;
      c.classList.toggle('is-hover', !!e.target.closest('button, a, input, label, [role="button"]'));
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') c.classList.add('is-down'); });
    document.addEventListener('pointerup', () => c.classList.remove('is-down'));
    document.documentElement.addEventListener('mouseleave', () => c.classList.remove('is-visible'));
    document.documentElement.addEventListener('mouseenter', () => { if (enabled) c.classList.add('is-visible'); });
  }

  /* ---------- 9. Sync helper — add ?sync to the URL ---------- */
  function initSyncHelper() {
    if (!/[?&]sync\b/.test(location.search)) return;
    const panel = document.createElement('div');
    panel.style.cssText = 'position:fixed;left:12px;top:12px;z-index:10000;width:min(340px,90vw);padding:12px;border-radius:14px;background:rgba(23,35,63,.92);color:#fff;font:13px/1.4 Inter,sans-serif;pointer-events:auto';
    panel.innerHTML = '<b>Sync mode</b><br>Play the song. Press <b>M</b> (or tap Mark) the moment each line starts.<div id="sync-next" style="margin:8px 0;color:#F7DCE8"></div><button id="sync-mark" style="padding:6px 12px;border-radius:8px;background:#fff;color:#17233f">Mark</button> <button id="sync-reset" style="padding:6px 12px;border-radius:8px;background:#444;color:#fff">Reset</button><textarea id="sync-out" rows="6" style="width:100%;margin-top:8px;font:11px monospace" readonly></textarea>';
    document.body.appendChild(panel);
    const nextEl = panel.querySelector('#sync-next');
    const out = panel.querySelector('#sync-out');
    let n = 0; let times = [];
    const show = () => { nextEl.textContent = n < lyricData.length ? `Next: ${lyricData[n].text}` : 'Done — copy the result below into lyrics.js'; };
    const mark = () => {
      if (n >= lyricData.length) return;
      times[n] = Math.round(currentTime() * 10) / 10; n++; show();
      out.value = lyricData.slice(0, n).map((l, i) => `    { time: ${times[i]}, text: ${JSON.stringify(l.text)} }`).join(',\n');
      if (n === lyricData.length) console.log('Synced lyrics:\n' + out.value);
    };
    panel.querySelector('#sync-mark').addEventListener('click', mark);
    panel.querySelector('#sync-reset').addEventListener('click', () => { n = 0; times = []; out.value = ''; show(); });
    document.addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 'm' && !e.target.closest('textarea')) mark(); });
    show();
  }

  /* ---------- 10. Boot ---------- */
  buildLyrics();
  render(START, true);
  initSnow();
  initCursor();
  initSyncHelper();
  startHearts();
  runIntroLoading();

  el.openBtn.addEventListener('click', enterMain);
  el.skipBtn.addEventListener('click', enterMain);

  // Pause the song if the tab is hidden (keeps lyrics and audio in step)
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) pause(); });
})();

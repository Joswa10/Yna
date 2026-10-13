/* ==========================================================================
   SPRING SNOW + DITO SA'KIN — application logic
   Sections: 0 Setup · 1 Stages · 2 Intro/loading · 3 Songs (Part 1 / Part 2) ·
             4 Audio + clock · 5 Lyrics sync · 6 Player UI · 7 Hearts ·
             8 Golden sparkles (canvas) · 9 Cursor · 10 Sync helper (?sync) · 11 Boot
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- 0. Setup ---------- */
  const SONGS = window.SONGS || {};
  const ORDER = (window.SONG_ORDER || Object.keys(SONGS)).filter((k) => SONGS[k]);
  if (!ORDER.length) { console.error('lyrics.js defines no songs.'); return; }

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
    lines: $('#lyric-lines'), hint: $('#start-hint'), title: $('#song-title'),
    playBtn: $('#play-btn'), restartBtn: $('#restart-btn'), muteBtn: $('#mute-btn'),
    volume: $('#volume'), progress: $('#progress'),
    timeNow: $('#time-now'), timeEnd: $('#time-end'), note: $('#player-note'),
    heartsLayer: $('#hearts-layer'), fxLayer: $('#fx-layer'),
    sparkles: $('#sparkles'), cursor: $('#cursor'),
    partBtn: $('#part-btn'), partLabel: $('#part-label'), photo: $('#bg-photo'),
    endingTitle: $('#ending-title'), endingSub: $('#ending-sub')
  };

  const fmt = (s) => {
    s = Math.max(0, Math.floor(s));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };
  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

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
  let introHeartTimer = null;
  function runIntroLoading() {
    const MIN_SHOW = reduceMotion ? 300 : 2600;
    const HARD_TIMEOUT = 7000;
    const t0 = performance.now();
    const tasks = { page: false, fonts: false, audio: false };
    const finishTask = (name) => { tasks[name] = true; };

    if (document.readyState === 'complete') finishTask('page');
    else window.addEventListener('load', () => finishTask('page'), { once: true });

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => finishTask('fonts'), () => finishTask('fonts'));
    else finishTask('fonts');

    if (!song.audioSrc || el.audio.readyState >= 1) finishTask('audio');
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

  /* ---------- 3. Songs (Part 1 / Part 2) ---------- */
  let partKey = ORDER[0];
  let song = SONGS[partKey];
  let lyricData = [];      // sorted [{time, text, rom?, en?}] for the ACTIVE song
  const lineEls = [];
  let activeIndex = -2;
  let loadToken = 0;       // guards against late events from the previous track

  let START = 0;           // seconds
  const getOffset = () => Number(song.offset || 0);

  // End of the playable window: explicit endTime, else the real file length, else a sensible guess.
  function getEnd() {
    if (Number.isFinite(song.endTime)) return song.endTime;
    const d = el.audio.duration;
    if (!previewMode && Number.isFinite(d) && d > 0) return d;
    if (Number.isFinite(song.fallbackDuration)) return song.fallbackDuration;
    const last = lyricData.length ? lyricData[lyricData.length - 1].time : START;
    return Math.max(last + 12, START + 30);
  }
  const getSpan = () => Math.max(1, getEnd() - START);

  function prepareLyrics(s) {
    const clean = (Array.isArray(s.lyrics) ? s.lyrics : [])
      .filter((l) => l && typeof l.text === 'string' && l.text.trim() && Number.isFinite(l.time))
      .map((l) => ({ time: Math.max(l.time, START), text: l.text, rom: l.rom || '', en: l.en || '' }))
      .sort((a, b) => a.time - b.time);
    if (!clean.length) {
      clean.push({ time: START, text: `${s.title} — add the lyrics in lyrics.js ♡`, rom: '', en: '', placeholder: true });
    }
    return clean;
  }

  function buildLyrics() {
    el.lines.textContent = '';
    lineEls.length = 0;
    lyricData.forEach((item) => {
      const line = document.createElement('div');
      line.className = 'line';
      line.dataset.pos = 'future';
      const span = document.createElement('span');
      span.className = 'line-text';
      span.textContent = item.text;           // textContent keeps your wording exactly
      line.appendChild(span);
      if (item.rom || item.en) {
        const sub = document.createElement('div');
        sub.className = 'line-sub';
        if (item.rom) { const r = document.createElement('span'); r.className = 'line-rom'; r.textContent = item.rom; sub.appendChild(r); }
        if (item.en)  { const e = document.createElement('span'); e.className = 'line-en';  e.textContent = item.en;  sub.appendChild(e); }
        line.appendChild(sub);
      }
      el.lines.appendChild(line);
      lineEls.push(line);
    });
    activeIndex = -2;
    setActiveIndex(-1);
  }

  function setPhoto(s) {
    if (!s.background) { el.photo.style.opacity = '0'; return; }
    const img = new Image();
    const mine = loadToken;
    img.onload = () => {
      if (mine !== loadToken) return;
      el.photo.style.backgroundImage = `url("${s.background}")`;
      el.photo.style.mixBlendMode = s.backgroundBlend || 'normal';
      el.photo.style.opacity = String(s.backgroundOpacity ?? 0.5);
    };
    img.onerror = () => { if (mine === loadToken) el.photo.style.opacity = '0'; };  // no image yet → pure CSS sunset
    img.src = s.background;
  }

  function updatePartButton() {
    const next = SONGS[ORDER[(ORDER.indexOf(partKey) + 1) % ORDER.length]];
    el.partLabel.textContent = next.label;
    el.partBtn.setAttribute('aria-label', `Switch to ${next.label}: ${next.title}`);
    el.partBtn.hidden = ORDER.length < 2;
  }

  /* Load a song completely: audio, lyrics container, background, titles, progress.
     This is what keeps Part 1 <-> Part 2 in sync. */
  function loadSong(key, { autoplay = false } = {}) {
    if (!SONGS[key]) return;
    loadToken++;
    const token = loadToken;

    // stop whatever is playing
    cancelAnimationFrame(rafId); rafId = 0;
    el.audio.pause();
    setPlaying(false);
    ended = false;
    scrubbing = false;
    el.body.classList.remove('is-ended', 'is-buffering', 'has-started');
    el.hint.classList.remove('is-hidden');

    partKey = key;
    song = SONGS[key];
    START = Number(song.startTime ?? 0);
    el.body.dataset.part = key;
    document.title = `${song.title} ♡`;
    el.title.textContent = song.title;
    el.endingTitle.textContent = song.endingTitle || 'Some moments are too beautiful to end.';
    el.endingSub.textContent = song.endingSubtitle || 'And this one is for you. ♡';

    lyricData = prepareLyrics(song);
    buildLyrics();
    setPhoto(song);
    updatePartButton();

    // audio source
    previewMode = !song.audioSrc;
    previewTime = START;
    showNote(previewMode ? `Preview mode — add your song file to hear the music.` : '');
    if (!previewMode) {
      el.audio.dataset.token = String(token);
      el.audio.src = song.audioSrc;
      el.audio.preload = 'auto';
      el.audio.load();
    } else {
      el.audio.removeAttribute('src');
      el.audio.load();
    }

    refreshSpan();
    render(START, true);
    if (typeof syncHelper !== 'undefined' && syncHelper) syncHelper.refresh();
    if (autoplay) play();
  }

  function switchPart() {
    const next = ORDER[(ORDER.indexOf(partKey) + 1) % ORDER.length];
    el.partBtn.classList.remove('is-switching');
    void el.partBtn.offsetWidth;
    el.partBtn.classList.add('is-switching');
    if (stage !== 'main') showStage('main');
    loadSong(next, { autoplay: true });     // the click is a user gesture, so audio may start
    heartBurst(isSmall() ? 3 : 6);
  }

  /* ---------- 4. Audio + playback clock ---------- */
  // previewMode = no usable audio → a virtual clock drives the lyrics so the page still looks lovely.
  let previewMode = false;
  let previewTime = 0;
  let lastTick = 0;
  let playing = false;
  let ended = false;
  let rafId = 0;
  let scrubbing = false;

  function enterPreviewMode() {
    if (previewMode) return;
    previewMode = true;
    previewTime = START;
    setPlaying(false);
    showNote(`Preview mode — put "${song.audioSrc}" next to index.html to hear the song.`);
    refreshSpan();
    render(START, true);
  }
  function showNote(msg) {
    el.note.textContent = msg;
    el.note.hidden = !msg;
  }

  const currentTime = () => (previewMode ? previewTime : el.audio.currentTime);
  function setTime(t) {
    if (previewMode) { previewTime = t; return; }
    try { el.audio.currentTime = t; } catch (_) { /* metadata not ready yet */ }
  }

  function setPlaying(value) {
    playing = value;
    el.body.classList.toggle('is-playing', value);
    el.playBtn.setAttribute('aria-pressed', String(value));
    el.playBtn.setAttribute('aria-label', value ? 'Pause' : 'Play');
    if (value) {
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
    if (t < START - 0.25 || t >= getEnd() - 0.1) setTime(START);

    if (previewMode) {
      lastTick = performance.now();
      setPlaying(true);
      return;
    }
    const attempt = el.audio.play();
    if (attempt && attempt.catch) {
      attempt.catch((err) => {
        if (err && err.name === 'AbortError') return;   // a track switch interrupted it — harmless
        if (err && err.name === 'NotSupportedError') enterPreviewMode();   // file missing / unreadable
        if (previewMode) { play(); return; }            // run the lyrics on the virtual clock instead
        setPlaying(false);
        showNote('Tap play once more to start the song ♡');
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
    render(START, true);
  }

  // Audio element events (real playback state is the source of truth)
  const isCurrent = () => el.audio.dataset.token === String(loadToken);
  el.audio.addEventListener('error', () => { if (isCurrent()) enterPreviewMode(); });
  el.audio.addEventListener('play', () => { if (!previewMode && isCurrent()) { showNote(''); setPlaying(true); } });
  el.audio.addEventListener('playing', () => el.body.classList.remove('is-buffering'));
  el.audio.addEventListener('waiting', () => el.body.classList.add('is-buffering'));
  el.audio.addEventListener('pause', () => { if (!previewMode && isCurrent() && !el.audio.ended) setPlaying(false); });
  el.audio.addEventListener('ended', () => { if (isCurrent()) finishSection(); });

  // THE SYNC HEARTBEAT — every timeupdate re-checks the timestamps and re-aligns the active line.
  // (A requestAnimationFrame loop adds smooth karaoke fill between the ~4Hz timeupdate events.)
  el.audio.addEventListener('timeupdate', () => {
    if (!isCurrent() || previewMode) return;
    const t = el.audio.currentTime;
    render(t);
    checkEnd(t);
  });
  el.audio.addEventListener('seeked', () => { if (isCurrent()) render(currentTime(), true); });
  el.audio.addEventListener('loadedmetadata', () => { if (isCurrent()) { refreshSpan(); render(currentTime(), true); } });
  el.audio.addEventListener('durationchange', () => { if (isCurrent()) refreshSpan(); });

  function refreshSpan() {
    el.progress.min = '0';
    el.progress.max = String(getSpan());
    el.timeEnd.textContent = fmt(getEnd());
    el.timeNow.textContent = fmt(Math.max(START, Math.min(currentTime(), getEnd())));
    paintSlider(el.progress);
  }

  function startLoop() {
    cancelAnimationFrame(rafId);
    lastTick = performance.now();
    const frame = (now) => {
      if (!playing) return;
      if (previewMode) previewTime += (now - lastTick) / 1000;
      lastTick = now;
      const t = currentTime();
      if (checkEnd(t)) return;
      render(t);
      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);
  }

  function checkEnd(t) {
    if (ended || stage === 'intro') return false;
    // For a full-length song the audio 'ended' event does the job; for a trimmed window we stop at endTime.
    if (Number.isFinite(song.endTime) ? t >= song.endTime : (previewMode && t >= getEnd())) {
      finishSection();
      return true;
    }
    return false;
  }

  function finishSection() {
    if (ended) return;
    ended = true;
    el.audio.pause();
    setPlaying(false);
    render(getEnd(), true);
    el.body.classList.add('is-ended');
    const mine = loadToken;
    setTimeout(() => {
      if (!ended || mine !== loadToken) return;
      showStage('ending');
      heartBurst(isSmall() ? 8 : 14);
    }, reduceMotion ? 200 : 1800);
  }

  /* ---------- 5. Lyrics sync ---------- */
  // Last line whose (time - offset) has been reached. Binary search = exact and cheap.
  function indexForTime(t) {
    const tt = t + getOffset() + 0.02;
    let lo = 0, hi = lyricData.length - 1, found = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (lyricData[mid].time <= tt) { found = mid; lo = mid + 1; } else hi = mid - 1;
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
    el.lines.setAttribute('aria-label', i >= 0 ? lyricData[i].text : '');
  }

  function render(t, force) {
    const end = getEnd();
    const clamped = Math.min(Math.max(t, START), end);

    const idx = indexForTime(t);
    if (idx !== activeIndex || force) setActiveIndex(idx);

    // karaoke glow fill across the active line
    if (idx >= 0 && lineEls[idx]) {
      const tt = t + getOffset();
      const start = lyricData[idx].time;
      const next = idx + 1 < lyricData.length ? lyricData[idx + 1].time : end;
      const duration = Math.max(1, next - start);
      const pct = Math.min(100, Math.max(0, ((tt - start) / (duration * 0.85)) * 100));
      lineEls[idx].firstElementChild.style.setProperty('--p', pct.toFixed(1));
    }

    el.timeNow.textContent = fmt(clamped);
    if (!scrubbing) {
      el.progress.value = String(clamped - START);
      paintSlider(el.progress);
    }
  }

  /* ---------- 6. Player UI ---------- */
  function paintSlider(input) {
    const pct = ((Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min) || 1)) * 100;
    input.style.setProperty('--fill', pct + '%');
  }

  el.playBtn.addEventListener('click', togglePlay);
  el.restartBtn.addEventListener('click', () => {
    ended = false;
    el.body.classList.remove('is-ended');
    setTime(START);
    render(START, true);
    play();
  });
  el.partBtn.addEventListener('click', switchPart);

  el.progress.addEventListener('pointerdown', () => { scrubbing = true; });
  el.progress.addEventListener('pointerup', () => { scrubbing = false; });
  el.progress.addEventListener('blur', () => { scrubbing = false; });
  el.progress.addEventListener('input', () => {
    const t = START + Number(el.progress.value);
    setTime(Math.min(t, getEnd() - 0.2));
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
  el.audio.volume = Number(el.volume.value);
  paintSlider(el.volume);

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && stage === 'main' && !e.target.closest('button, input, textarea')) {
      e.preventDefault();
      togglePlay();
    }
  });

  el.replayBtn.addEventListener('click', () => {
    resetSection();
    showStage('main');
    play();                                          // this click is the user's gesture
    el.playBtn.focus({ preventScroll: true });
  });

  /* ---------- 7. Hearts (warm blush / soft white / golden) ---------- */
  const HEART_PATH = 'M50 88 C20 66 6 48 6 32 C6 18 17 9 29 9 C38 9 46 14 50 22 C54 14 62 9 71 9 C83 9 94 18 94 32 C94 48 80 66 50 88 Z';
  const MESSAGES = ['joswa'];
  const VARIANTS = ['blush', 'blush', 'white', 'gold', 'peach'];
  const maxHearts = () => (isSmall() ? 4 : 8);

  // Hearts are plain, non-interactive elements (pointer-events: none in CSS), so hovering or tapping
  // can never pause/scale/restart their animation — that was the up-and-down glitch.
  function spawnHeart(opts = {}) {
    if (reduceMotion || document.hidden) return null;
    if (el.heartsLayer.childElementCount >= maxHearts() && !opts.force) return null;

    const heart = document.createElement('div');
    heart.className = `heart heart--${opts.variant || pick(VARIANTS)}`;
    heart.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${HEART_PATH}"/></svg>`;
    const size = opts.size || rand(isSmall() ? 22 : 24, isSmall() ? 38 : 48);
    heart.style.setProperty('--size', size + 'px');
    heart.style.setProperty('--x', (opts.x ?? rand(4, 92)) + '%');
    heart.style.setProperty('--drift', rand(-60, 60) + 'px');
    heart.style.setProperty('--dur', (opts.duration || rand(11, 19)) + 's');
    heart.addEventListener('animationend', (e) => { if (e.animationName === 'heart-rise') heart.remove(); });
    el.heartsLayer.appendChild(heart);
    return heart;
  }

  function popHeart(heart) {
    if (heart.classList.contains('is-popping')) return;
    const rect = heart.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    heart.classList.add('is-popping');
    setTimeout(() => heart.remove(), 450);

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

  // Tap-to-pop without pointer events on the hearts: hit-test the tap against their positions.
  let lastPopAt = 0;
  document.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, input, a, label, textarea, .player')) return;
    const pad = 12;
    for (const h of el.heartsLayer.children) {
      if (h.classList.contains('is-popping')) continue;
      const r = h.getBoundingClientRect();
      if (e.clientX >= r.left - pad && e.clientX <= r.right + pad && e.clientY >= r.top - pad && e.clientY <= r.bottom + pad) {
        popHeart(h);
        lastPopAt = performance.now();
        break;
      }
    }
  }, { passive: true });

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

  // Sparkles on empty-space clicks (skipped when the tap just popped a heart)
  document.addEventListener('click', (e) => {
    if (e.target.closest('button, input, a, label, .player, textarea')) return;
    if (performance.now() - lastPopAt < 400) return;
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

  /* ---------- 8. Golden sparkle particles (single canvas, paused when tab hidden) ---------- */
  function initSparkles() {
    const canvas = el.sparkles;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const COLORS = ['255,227,139', '255,241,170', '255,214,160', '255,247,236'];
    let w = 0, h = 0, dpr = 1, motes = [], raf = 0;

    const make = (initial) => ({
      x: rand(0, w), y: initial ? rand(0, h) : h + 12,
      r: rand(.8, 3), vy: rand(.12, .5), vx: rand(-.12, .12),
      tw: rand(0, Math.PI * 2), tws: rand(.01, .035),
      c: pick(COLORS), a: rand(.35, .95)
    });
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = reduceMotion ? 16 : isSmall() ? 28 : 56;
      motes = Array.from({ length: count }, () => make(true));
      if (reduceMotion) drawAll();
    }
    function draw(m) {
      const alpha = m.a * (0.55 + 0.45 * Math.sin(m.tw));
      ctx.beginPath();
      ctx.fillStyle = `rgba(${m.c},${alpha.toFixed(3)})`;
      ctx.shadowColor = `rgba(255,227,139,${Math.min(1, alpha + .2).toFixed(2)})`;
      ctx.shadowBlur = m.r * 4;
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
      if (m.r > 2.2) {                       // the bigger ones get a tiny 4-point glint
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(255,247,236,${(alpha * .7).toFixed(3)})`;
        ctx.lineWidth = .8;
        const g = m.r * 2.6;
        ctx.beginPath();
        ctx.moveTo(m.x - g, m.y); ctx.lineTo(m.x + g, m.y);
        ctx.moveTo(m.x, m.y - g); ctx.lineTo(m.x, m.y + g);
        ctx.stroke();
      }
    }
    function drawAll() { ctx.clearRect(0, 0, w, h); motes.forEach(draw); }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.y -= m.vy;
        m.x += m.vx + Math.sin(m.tw * .5) * .15;
        m.tw += m.tws;
        if (m.y < -12 || m.x < -20 || m.x > w + 20) Object.assign(m, make(false), { x: rand(0, w) });
        draw(m);
      }
      raf = requestAnimationFrame(tick);
    }
    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 200); });
    resize();
    if (!reduceMotion) {
      raf = requestAnimationFrame(tick);
      document.addEventListener('visibilitychange', () => {
        cancelAnimationFrame(raf);
        if (!document.hidden) raf = requestAnimationFrame(tick);
      });
    }
  }

  /* ---------- 9. Yoshi-style cursor (desktop mouse only) ---------- */
  function initCursor() {
    if (isTouch || reduceMotion) return;
    const c = el.cursor;
    let tx = -100, ty = -100, x = -100, y = -100, running = false, enabled = false;

    function loop() {
      x += (tx - x) * .38;
      y += (ty - y) * .38;
      c.style.transform = `translate3d(${x - 30}px, ${y - 18}px, 0)`;
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

  /* ---------- 10. Sync helper — add ?sync to the URL ----------
     Works for whichever Part is active (use the Yoshi button to switch).
     Part 2 with no lyrics yet? Paste them into the box, press "Load lines", then tap M on each line. */
  let syncHelper = null;
  function initSyncHelper() {
    if (!/[?&]sync\b/.test(location.search)) return;
    const panel = document.createElement('div');
    panel.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:10000;width:min(360px,92vw);max-height:70vh;overflow:auto;padding:12px;border-radius:14px;background:rgba(43,27,23,.94);color:#FFF7EC;font:13px/1.4 Inter,sans-serif;pointer-events:auto';
    panel.innerHTML = `
      <b>Sync mode — <span id="sync-part"></span></b><br>
      Play the song. Press <b>M</b> (or tap Mark) the instant each line starts.
      <div id="sync-next" style="margin:8px 0;color:#FFE38B"></div>
      <button id="sync-mark" style="padding:6px 12px;border-radius:8px;background:#FFF7EC;color:#2B1B17">Mark</button>
      <button id="sync-undo" style="padding:6px 12px;border-radius:8px;background:#8C3B27;color:#FFF7EC">Undo</button>
      <button id="sync-reset" style="padding:6px 12px;border-radius:8px;background:#444;color:#fff">Reset</button>
      <div style="margin-top:8px">Fine-tune: <b>[</b> later · <b>]</b> earlier — offset <b id="sync-offset"></b></div>
      <textarea id="sync-paste" rows="3" placeholder="Paste lyrics here (one line per row), then Load lines" style="width:100%;margin-top:8px;font:11px monospace;color:#2B1B17"></textarea>
      <button id="sync-load" style="padding:5px 10px;border-radius:8px;background:#F5C28B;color:#2B1B17">Load lines</button>
      <textarea id="sync-out" rows="6" style="width:100%;margin-top:8px;font:11px monospace;color:#2B1B17" readonly></textarea>`;
    document.body.appendChild(panel);
    const q = (s) => panel.querySelector(s);
    const nextEl = q('#sync-next'), out = q('#sync-out'), offEl = q('#sync-offset');
    let n = 0; let times = [];

    const fmtLine = (l, t) => {
      let s = `      { time: ${t}, text: ${JSON.stringify(l.text)}`;
      if (l.rom) s += `, rom: ${JSON.stringify(l.rom)}`;
      if (l.en) s += `, en: ${JSON.stringify(l.en)}`;
      return s + ' }';
    };
    const show = () => {
      q('#sync-part').textContent = `${song.label} · ${song.title}`;
      offEl.textContent = `${getOffset().toFixed(2)}s  (set offset: ${getOffset().toFixed(2)} in lyrics.js)`;
      nextEl.textContent = n < lyricData.length ? `Next: ${lyricData[n].text}` : 'Done — copy the result below into lyrics.js';
    };
    const dump = () => { out.value = lyricData.slice(0, n).map((l, i) => fmtLine(l, times[i])).join(',\n'); };
    const finish = () => {
      lyricData.forEach((l, i) => { l.time = times[i]; delete l.placeholder; });
      lyricData.sort((a, b) => a.time - b.time);
      buildLyrics(); render(currentTime(), true);
      console.log('Synced lyrics for ' + song.title + ':\n' + out.value);
    };
    const mark = () => {
      if (n >= lyricData.length) return;
      times[n] = Math.round(currentTime() * 10) / 10; n++;
      dump(); show();
      if (n === lyricData.length) finish();
    };
    q('#sync-mark').addEventListener('click', mark);
    q('#sync-undo').addEventListener('click', () => { if (n > 0) { n--; times.length = n; dump(); show(); } });
    q('#sync-reset').addEventListener('click', () => { n = 0; times = []; out.value = ''; show(); });
    q('#sync-load').addEventListener('click', () => {
      const lines = q('#sync-paste').value.split('\n').map((s) => s.trim()).filter(Boolean);
      if (!lines.length) return;
      lyricData = lines.map((text, i) => ({ time: START + i * 3, text, rom: '', en: '' }));
      buildLyrics(); n = 0; times = []; out.value = ''; show(); render(START, true);
    });
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('textarea')) return;
      const k = e.key.toLowerCase();
      if (k === 'm') mark();
      if (k === '[') { song.offset = Math.round((getOffset() - 0.05) * 100) / 100; show(); render(currentTime(), true); }
      if (k === ']') { song.offset = Math.round((getOffset() + 0.05) * 100) / 100; show(); render(currentTime(), true); }
    });
    syncHelper = { refresh() { n = 0; times = []; out.value = ''; show(); } };
    show();
  }

  /* ---------- 11. Boot ---------- */
  loadSong(partKey);                 // builds lyrics, sets audio, background, titles
  initSparkles();
  initCursor();
  initSyncHelper();
  startHearts();
  runIntroLoading();

  el.openBtn.addEventListener('click', enterMain);
  el.skipBtn.addEventListener('click', enterMain);

  // Pause the song if the tab is hidden (keeps lyrics and audio in step)
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) pause(); });
})();

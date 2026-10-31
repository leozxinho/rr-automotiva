/* ============================================================
   RR Studio Details — Tutorial "Como funciona"
   Spotlight tour. Depende de tutorial-data.js (TUTORIAL_DATA).
   Não altera main.js, tutorial-data.js, index.html nem style.css.
   ============================================================ */

(function () {
  'use strict';

  var DATA = window.TUTORIAL_DATA;
  if (!DATA || !Array.isArray(DATA.steps) || !DATA.steps.length) return;

  var STEPS   = DATA.steps;
  var TOTAL   = STEPS.length;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Estado ─────────────────────────────────────────────── */
  var s = {
    open:         false,
    step:         0,
    playing:      false,
    muted:        false,
    speed:        1,
    auto:         true,
    triggerEl:    null,
    scrollY:      0,
    transitioning: false,
    audioToken:   0
  };

  /* ── Preferências ───────────────────────────────────────── */
  function loadPrefs() {
    try {
      var raw = localStorage.getItem('rr_tut_prefs');
      if (!raw) return;
      var p = JSON.parse(raw);
      if (typeof p.muted === 'boolean')            s.muted = p.muted;
      if ([0.9, 1, 1.25].indexOf(p.speed) !== -1) s.speed = p.speed;
      if (typeof p.auto === 'boolean')             s.auto  = p.auto;
    } catch (e) {}
  }
  function savePrefs() {
    try {
      localStorage.setItem('rr_tut_prefs',
        JSON.stringify({ muted: s.muted, speed: s.speed, auto: s.auto })
      );
    } catch (e) {}
  }

  /* ── Utilitário ─────────────────────────────────────────── */
  function el(tag, attrs) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class')   { node.className = attrs[k]; }
      else if (k === 'hidden')  { node.hidden = true; }
      else if (k === 'checked') { node.checked = true; }
      else { node.setAttribute(k, attrs[k]); }
    });
    return node;
  }

  /* ── SVG ────────────────────────────────────────────────── */
  var SVG_PLAY  = '<svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M6 4l10 6-10 6V4z"/></svg>';
  var SVG_PAUSE = '<svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor" aria-hidden="true"><rect x="4" y="3" width="4" height="14" rx="1"/><rect x="12" y="3" width="4" height="14" rx="1"/></svg>';
  var SVG_VOL   = '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 8v4h3l4 4V4L7 8H4z"/><path d="M13 7.5a4 4 0 0 1 0 5M16 5a7 7 0 0 1 0 10"/></svg>';
  var SVG_MUTE  = '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 8v4h3l4 4V4L7 8H4z"/><line x1="14" y1="7" x2="18" y2="13"/><line x1="18" y1="7" x2="14" y2="13"/></svg>';
  var SVG_PLAY_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';

  /* ── Elemento de áudio (único, reutilizado) ─────────────── */
  var audioEl = document.createElement('audio');
  audioEl.preload = 'none';
  var _audioPlayPromise = null;  /* rastreia play() pendente para evitar AbortError */

  /* ── DOM refs ───────────────────────────────────────────── */
  var welcomeBackdrop, welcomeStartBtn, welcomeDismissBtn, welcomeNeverBtn;
  var tutOverlay, tutSpotlight, tutCard;
  var cardStepLabel, cardDots, cardCloseBtn, cardFooter;
  var cardTitle, cardText, audioHint;
  var playBtn, playBtnCompact, muteBtn, speedBtns, autoChk;
  var prevBtn, nextBtn;
  var fab;

  /* ── Construção do DOM ──────────────────────────────────── */
  function buildDOM() {
    /* Welcome modal */
    welcomeBackdrop = el('div', {
      class: 'tut-welcome-backdrop',
      role: 'dialog', 'aria-modal': 'true',
      'aria-label': 'Tour guiado: conheça a RR Studio Details',
      'aria-hidden': 'true'
    });
    var welcomeCard = el('div', { class: 'tut-welcome' });

    var wHeader = el('div', { class: 'tut-welcome-header' });
    var wHeaderIcon = el('span', { class: 'tut-welcome-header-icon' });
    wHeaderIcon.innerHTML = '<svg viewBox="0 0 64 64" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 42l4-14h40l4 14"/><rect x="6" y="42" width="52" height="10" rx="4"/><circle cx="19" cy="42" r="4" fill="currentColor" stroke="none"/><circle cx="45" cy="42" r="4" fill="currentColor" stroke="none"/><path d="M12 36h40M26 28h12"/></svg>';
    var wHeaderTitle = el('h2', {});
    wHeaderTitle.textContent = 'Bem-vindo!';
    var wHeaderSub = el('p', { class: 'tut-welcome-header-sub' });
    wHeaderSub.textContent = 'RR Studio Details';
    wHeader.append(wHeaderIcon, wHeaderTitle, wHeaderSub);

    var wBody = el('div', { class: 'tut-welcome-body' });
    var wText = el('p', {});
    wText.innerHTML = 'Quer ver um <strong>tour rápido</strong> pelos nossos serviços?';
    wBody.appendChild(wText);

    var wActions = el('div', { class: 'tut-welcome-actions' });
    welcomeStartBtn = el('button', { class: 'tut-welcome-start', type: 'button' });
    welcomeStartBtn.innerHTML = SVG_PLAY_ICON + ' Sim, mostrar!';
    welcomeDismissBtn = el('button', { class: 'tut-welcome-dismiss', type: 'button' });
    welcomeDismissBtn.textContent = 'Agora não';
    wActions.append(welcomeStartBtn, welcomeDismissBtn);

    welcomeNeverBtn = el('button', { class: 'tut-welcome-never', type: 'button' });
    welcomeNeverBtn.textContent = 'Não mostrar novamente';

    welcomeCard.append(wHeader, wBody, wActions, welcomeNeverBtn);
    welcomeBackdrop.appendChild(welcomeCard);
    document.body.appendChild(welcomeBackdrop);

    /* Spotlight overlay */
    tutOverlay = el('div', { id: 'tut-overlay', class: 'tut-overlay', 'aria-hidden': 'true' });
    var tutOverlayBg = el('div', { class: 'tut-overlay-bg' });
    tutSpotlight = el('div', { class: 'tut-spotlight', 'aria-hidden': 'true' });
    tutOverlay.append(tutOverlayBg, tutSpotlight);

    /* Card flutuante */
    tutCard = el('div', {
      class: 'tut-card', role: 'dialog',
      'aria-modal': 'true', 'aria-label': 'Tour guiado', tabindex: '-1'
    });

    var cHead = el('div', { class: 'tut-card-head' });
    cardStepLabel = el('span', { class: 'tut-card-step', 'aria-live': 'polite' });
    cardCloseBtn = el('button', { class: 'tut-card-close', type: 'button', 'aria-label': 'Fechar tutorial' });
    cardCloseBtn.textContent = '✕';
    playBtnCompact = el('button', { class: 'tut-play-btn-compact', type: 'button', 'aria-label': 'Ouvir etapa' });
    playBtnCompact.innerHTML = SVG_PLAY;
    cHead.append(cardStepLabel, playBtnCompact, cardCloseBtn);

    cardDots = el('div', { class: 'tut-dots', 'aria-hidden': 'true' });

    var cBody = el('div', { class: 'tut-card-body', id: 'tut-card-body' });
    cardTitle = el('h2', { class: 'tut-card-title', id: 'tut-card-title' });
    cardText  = el('div', { class: 'tut-card-text', 'aria-live': 'polite', 'aria-atomic': 'false' });
    audioHint = el('p', { class: 'tut-tts-notice', hidden: '' });
    cBody.append(cardTitle, cardText, audioHint);

    /* Área de áudio (display:none via CSS; mantida para compatibilidade) */
    var cAudio = el('div', { class: 'tut-card-audio' });
    playBtn = el('button', { class: 'tut-play-btn', type: 'button', 'aria-label': 'Ouvir esta etapa' });
    playBtn.innerHTML = SVG_PLAY + ' Ouvir';
    muteBtn = el('button', { class: 'tut-mute', type: 'button', 'aria-label': 'Silenciar', 'aria-pressed': 'false' });
    muteBtn.innerHTML = SVG_VOL;
    var speedGrp = el('div', { class: 'tut-speed-group', role: 'group', 'aria-label': 'Velocidade' });
    speedBtns = [0.9, 1, 1.25].map(function (v) {
      var b = el('button', {
        class: 'tut-speed-btn', type: 'button',
        'data-speed': String(v),
        'aria-pressed': v === 1 ? 'true' : 'false',
        'aria-label': 'Velocidade ' + String(v).replace('.', ',') + 'x'
      });
      b.textContent = String(v).replace('.', ',') + '×';
      return b;
    });
    speedBtns.forEach(function (b) { speedGrp.appendChild(b); });
    var autoLabel = el('label', { class: 'tut-auto-label' });
    autoChk = el('input', { type: 'checkbox', 'aria-label': 'Avançar automaticamente ao terminar o áudio' });
    autoChk.checked = s.auto;
    autoLabel.append(autoChk);
    autoLabel.appendChild(document.createTextNode(' Auto'));
    var audioOpts = el('div', { class: 'tut-audio-opts' });
    audioOpts.append(muteBtn, speedGrp, autoLabel);
    cAudio.append(playBtn, audioOpts);

    cardFooter = el('div', { class: 'tut-card-footer' });
    prevBtn = el('button', { class: 'tut-prev', type: 'button', 'aria-label': 'Etapa anterior' });
    nextBtn = el('button', { class: 'tut-next', type: 'button' });
    nextBtn.textContent = 'Próxima ›';
    cardFooter.append(prevBtn, nextBtn);

    tutCard.append(cHead, cardDots, cBody, cAudio, cardFooter);
    document.body.appendChild(tutOverlay);
    document.body.appendChild(tutCard);
    document.body.appendChild(audioEl);

    fab = el('button', { class: 'tut-fab', type: 'button', 'aria-label': 'Reabrir tutorial: como funciona' });
    fab.innerHTML = SVG_PLAY_ICON + ' Como funciona';
    document.body.appendChild(fab);

    for (var i = 0; i < TOTAL; i++) {
      (function (idx) {
        var d = el('button', {
          class: 'tut-dot', type: 'button',
          'aria-label': 'Etapa ' + (idx + 1) + ': ' + STEPS[idx].title
        });
        d.addEventListener('click', function () { goToStep(idx); });
        cardDots.appendChild(d);
      })(i);
    }
  }

  /* ── Cubic bezier (0.2, 0.8, 0.2, 1) ───────────────────── */
  function makeCubicBezier(x1, y1, x2, y2) {
    function B(t, a, b) { return 3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t; }
    return function (x) {
      var lo = 0, hi = 1, t = x;
      for (var i = 0; i < 10; i++) {
        var mid = (lo + hi) * 0.5;
        var bx = B(mid, x1, x2);
        if (Math.abs(bx - x) < 0.0001) { t = mid; break; }
        if (bx < x) lo = mid; else hi = mid;
        t = mid;
      }
      return B(t, y1, y2);
    };
  }
  var easeScroll = makeCubicBezier(0.2, 0.8, 0.2, 1);

  /* ── iOS: desbloqueio síncrono (dentro de gesto do usuário) ─ */
  function iosUnlock() {
    audioEl.src = STEPS[0].audio;
    _audioPlayPromise = audioEl.play();
    if (_audioPlayPromise && _audioPlayPromise.catch)
      _audioPlayPromise.catch(function () {});
  }

  /* ── Áudio por etapa — chamado SINCRONAMENTE no início da transição */
  function stepAudio(idx) {
    var token = ++s.audioToken;
    var prev  = _audioPlayPromise;
    _audioPlayPromise = null;
    audioHint.hidden  = true;

    function doPlay() {
      if (s.audioToken !== token) return;
      audioEl.src         = STEPS[idx].audio;
      audioEl.currentTime = 0;
      audioEl.playbackRate = s.speed;
      _audioPlayPromise = audioEl.play();
      if (_audioPlayPromise && _audioPlayPromise.catch) {
        _audioPlayPromise.catch(function (err) {
          if (s.audioToken !== token) return;
          if (err && err.name === 'AbortError') return;
          audioHint.textContent = 'Toque em 🔊 para ouvir';
          audioHint.hidden = false;
          setPlayState(false);
        });
      }
    }

    if (prev) {
      /* aguarda promise pendente (iosUnlock) antes de pausar */
      prev.catch(function () {}).then(function () {
        try { audioEl.pause(); } catch (e) {}
        doPlay();
      });
    } else {
      try { audioEl.pause(); } catch (e) {}
      doPlay();
    }
  }

  /* ── Eventos de áudio ───────────────────────────────────── */
  audioEl.addEventListener('playing', function () {
    setPlayState(true);
    audioHint.hidden = true;
  });

  audioEl.addEventListener('pause', function () {
    if (!audioEl.ended) setPlayState(false);
  });

  audioEl.addEventListener('timeupdate', function () {
    var step = STEPS[s.step];
    if (!step || !step.timestamps || !step.timestamps.length) return;
    var t  = audioEl.currentTime;
    var ts = step.timestamps;
    for (var i = ts.length - 1; i >= 0; i--) {
      if (t >= ts[i]) { captions.set(i); return; }
    }
    captions.clear();
  });

  audioEl.addEventListener('ended', function () {
    setPlayState(false);
    captions.clear();
    if (!s.muted && s.auto && s.open) {
      var token = s.audioToken;
      setTimeout(function () {
        if (s.audioToken === token && !s.muted && s.auto && s.open && !s.transitioning) {
          goToStep(s.step + 1);
        }
      }, 800);
    }
  });

  audioEl.addEventListener('error', function () {
    audioHint.textContent = 'Toque em 🔊 para ouvir';
    audioHint.hidden = false;
    setPlayState(false);
  });

  /* ── Captions ───────────────────────────────────────────── */
  var captions = {
    set: function (i) {
      cardText.querySelectorAll('.tut-phrase').forEach(function (sp, idx) {
        sp.classList.toggle('tut-phrase--active', idx === i);
      });
    },
    clear: function () {
      cardText.querySelectorAll('.tut-phrase').forEach(function (sp) {
        sp.classList.remove('tut-phrase--active');
      });
    }
  };

  /* ── Estado de reprodução ───────────────────────────────── */
  function setPlayState(playing) {
    s.playing = playing;
    var icon  = playing ? SVG_PAUSE : SVG_PLAY;
    var label = playing ? 'Pausar' : 'Ouvir etapa';
    playBtnCompact.innerHTML = icon;
    playBtnCompact.setAttribute('aria-label', label);
    playBtn.innerHTML = icon + (playing ? ' Pausar' : ' Ouvir');
    playBtn.setAttribute('aria-label', playing ? 'Pausar' : 'Ouvir esta etapa');
  }

  /* ── Controles de áudio ─────────────────────────────────── */
  function updateMuteBtn() {
    muteBtn.innerHTML = s.muted ? SVG_MUTE : SVG_VOL;
    muteBtn.setAttribute('aria-pressed', s.muted ? 'true' : 'false');
    muteBtn.setAttribute('aria-label', s.muted ? 'Reativar som' : 'Silenciar');
  }
  function updateSpeedBtns() {
    speedBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', parseFloat(b.dataset.speed) === s.speed ? 'true' : 'false');
    });
  }

  /* ── Posicionamento do Spotlight ────────────────────────── */
  function positionSpotlight(idx) {
    var target = document.querySelector(STEPS[idx].target);
    if (!target) { tutSpotlight.style.display = 'none'; return; }
    tutSpotlight.style.display = '';

    var rect  = target.getBoundingClientRect();
    var PAD   = 8;
    var spTop = rect.top    - PAD;
    var spLeft= rect.left   - PAD;
    var spW   = rect.width  + PAD * 2;
    var spH   = rect.height + PAD * 2;

    if (window.innerWidth <= 640) {
      var visBottom = tutCard.getBoundingClientRect().top - 12;
      spH = Math.max(0, Math.min(spTop + spH, visBottom) - spTop);
    }

    tutSpotlight.style.top    = spTop  + 'px';
    tutSpotlight.style.left   = spLeft + 'px';
    tutSpotlight.style.width  = spW    + 'px';
    tutSpotlight.style.height = spH    + 'px';
  }

  /* ── Posicionamento do Card (desktop) ───────────────────── */
  function positionCard(idx) {
    if (window.innerWidth <= 640) {
      tutCard.style.top  = '';
      tutCard.style.left = '';
      return;
    }
    var target = document.querySelector(STEPS[idx].target);
    if (!target) return;

    var rect   = target.getBoundingClientRect();
    var PAD    = 8, GAP = 12, margin = 16;
    var cardH  = tutCard.offsetHeight || 220;
    var cardW  = 340;
    var vpH    = window.innerHeight;
    var vpW    = window.innerWidth;
    var spBot  = rect.bottom + PAD;
    var spTop  = rect.top    - PAD;

    var top;
    if (vpH - spBot - GAP >= cardH || vpH - spBot - GAP >= spTop - GAP) {
      top = spBot + GAP;
      if (top + cardH > vpH - margin) top = vpH - cardH - margin;
    } else {
      top = spTop - GAP - cardH;
      if (top < margin) top = margin;
    }
    var left = rect.left + rect.width / 2 - cardW / 2;
    left = Math.max(margin, Math.min(left, vpW - cardW - margin));

    tutCard.style.top  = top  + 'px';
    tutCard.style.left = left + 'px';
  }

  /* ── Sync spotlight/card em scroll e resize ─────────────── */
  var _syncRAF = null;
  function scheduleSync() {
    if (_syncRAF || s.transitioning) return;
    _syncRAF = requestAnimationFrame(function () {
      _syncRAF = null;
      if (!s.open || s.transitioning) return;
      positionSpotlight(s.step);
      positionCard(s.step);
    });
  }
  window.addEventListener('scroll', scheduleSync, { passive: true });
  window.addEventListener('resize', scheduleSync, { passive: true });

  /* ── Scroll + spotlight via rAF (350ms, cubic-bezier) ───── */
  function animateScrollAndSpotlight(idx, onComplete) {
    var target = document.querySelector(STEPS[idx].target);
    var startY = window.scrollY;
    var endY   = target
      ? Math.max(0, target.getBoundingClientRect().top + window.scrollY - 16)
      : startY;

    tutSpotlight.style.transition = 'none';

    if (REDUCED) {
      window.scrollTo(0, endY);
      positionSpotlight(idx);
      positionCard(idx);
      tutSpotlight.style.transition = '';
      onComplete && onComplete();
      return;
    }

    var DURATION  = 350;
    var startTime = null;

    function frame(ts) {
      if (!s.open) { tutSpotlight.style.transition = ''; onComplete && onComplete(); return; }
      if (startTime === null) startTime = ts;
      var elapsed  = ts - startTime;
      var progress = Math.min(elapsed / DURATION, 1);
      var eased    = easeScroll(progress);

      window.scrollTo(0, startY + (endY - startY) * eased);
      positionSpotlight(idx);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        tutSpotlight.style.transition = '';
        positionSpotlight(idx);
        positionCard(idx);
        onComplete && onComplete();
      }
    }
    requestAnimationFrame(frame);
  }

  /* ── Conteúdo do card ───────────────────────────────────── */
  function renderContent(idx) {
    var step = STEPS[idx];
    cardTitle.textContent = step.title;
    cardText.innerHTML = '';
    step.phrases.forEach(function (phrase, i) {
      var span = el('span', { class: 'tut-phrase', id: 'tut-p-' + i });
      span.textContent = phrase;
      cardText.appendChild(span);
    });
    captions.clear();
  }

  function updateStepUI(idx) {
    cardStepLabel.textContent = 'Etapa ' + (idx + 1) + ' de ' + TOTAL;

    cardDots.querySelectorAll('.tut-dot').forEach(function (d, i) {
      d.classList.toggle('tut-dot--active', i === idx);
      d.classList.toggle('tut-dot--done',   i < idx);
    });

    if (idx === TOTAL - 1) {
      nextBtn.textContent = 'Montar meu orçamento';
      nextBtn.classList.add('tut-next--cta');
    } else {
      nextBtn.textContent = 'Próxima ›';
      nextBtn.classList.remove('tut-next--cta');
    }
    nextBtn.disabled = false;
    prevBtn.hidden = (idx === 0);
    if (idx === 0) cardFooter.setAttribute('data-first', '');
    else           cardFooter.removeAttribute('data-first');
  }

  /* ── Navegação ──────────────────────────────────────────── */
  function goToStep(idx) {
    if (!s.open)            return;
    if (idx < 0)            return;
    if (idx >= TOTAL)       { goToOrcamento(); return; }
    if (s.transitioning)    return;

    var prevIdx = s.step;
    s.step = idx;
    s.transitioning = true;
    var t0   = performance.now();
    var step = STEPS[idx];

    /* 1. Áudio — SÍNCRONO antes de qualquer setTimeout ou scroll */
    if (!s.muted) {
      stepAudio(idx);
    } else {
      ++s.audioToken;
      var _prev = _audioPlayPromise;
      _audioPlayPromise = null;
      if (_prev) {
        _prev.catch(function () {}).then(function () { try { audioEl.pause(); } catch (e) {} });
      } else {
        try { audioEl.pause(); } catch (e) {}
      }
    }

    /* 2. UI: dots, rótulos, botões */
    updateStepUI(idx);

    var cBody   = document.getElementById('tut-card-body');
    var isFirst = !tutCard.classList.contains('tut-card--open');

    /* ── Primeira exibição (sem crossfade) ─────────────────── */
    if (isFirst) {
      renderContent(idx);

      /* Um frame para garantir que o DOM está finalizado antes de medir posições */
      requestAnimationFrame(function () {
        positionSpotlight(idx);
        positionCard(idx);
        tutOverlay.classList.add('tut--open');
        tutOverlay.removeAttribute('aria-hidden');
        tutCard.classList.add('tut-card--open');

        animateScrollAndSpotlight(idx, function () {
          s.transitioning = false;
          var t1 = performance.now();
          console.log('[tour] step open: ' + Math.round(t1 - t0) + 'ms');
        });
      });
      return;
    }

    /* ── Transição normal: crossfade texto + scroll em paralelo ─ */

    /* (A) Fade-out do corpo — 120ms */
    cBody.style.transition = 'opacity 120ms ease';
    cBody.style.opacity    = '0';

    /* (B) Scroll + spotlight — começa imediatamente, em paralelo */
    animateScrollAndSpotlight(idx, function () {
      var t1 = performance.now();
      console.log('[tour] step ' + (prevIdx + 1) + '→' + (idx + 1) + ': ' + Math.round(t1 - t0) + 'ms');
      s.transitioning = false;
    });

    /* (C) Após fade-out: atualiza conteúdo, anima altura + fade-in */
    setTimeout(function () {
      if (!s.open) return;

      var oldH = cBody.offsetHeight;
      cBody.style.height   = oldH + 'px';
      cBody.style.overflow = 'hidden';

      renderContent(idx);

      void cBody.offsetHeight; /* força reflow */

      cBody.style.height = 'auto';
      var newH = cBody.scrollHeight;
      cBody.style.height = oldH + 'px';
      void cBody.offsetHeight;

      /* Fade-in (180ms) + altura (250ms) em paralelo */
      cBody.style.transition = 'opacity 180ms ease, height 250ms ease';
      cBody.style.height     = newH + 'px';
      cBody.style.opacity    = '1';

      setTimeout(function () {
        cBody.style.height   = 'auto';
        cBody.style.overflow = '';
        cBody.style.transition = '';
      }, 260);
    }, 120);
  }

  function goToOrcamento() {
    closeTutorial();
    var btn1 = document.querySelector('#stepper li[data-go="1"] button');
    if (btn1) btn1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    var sec = document.getElementById('orcamento');
    if (sec) sec.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    setTimeout(function () {
      var nome = document.getElementById('nome');
      if (nome) nome.focus();
    }, 600);
  }

  /* ── Welcome ────────────────────────────────────────────── */
  function openWelcome(triggerEl) {
    if (s.open) return;
    s.triggerEl = triggerEl || null;
    welcomeBackdrop.removeAttribute('aria-hidden');
    welcomeBackdrop.classList.add('tut-welcome--open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { welcomeStartBtn.focus(); }, 120);
  }
  function closeWelcome() {
    welcomeBackdrop.classList.remove('tut-welcome--open');
    welcomeBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (s.triggerEl && s.triggerEl.focus) {
      setTimeout(function () { s.triggerEl.focus(); }, 300);
    }
  }

  /* ── Tour ───────────────────────────────────────────────── */
  function openTutorial(triggerEl, startStep) {
    if (s.open) return;
    s.open      = true;
    s.triggerEl = triggerEl || s.triggerEl || null;
    s.scrollY   = window.scrollY;

    document.body.classList.add('tour-active');
    hideFab();
    updateMuteBtn();
    updateSpeedBtns();
    autoChk.checked = s.auto;
    setPlayState(false);

    goToStep(typeof startStep === 'number' ? startStep : 0);

    setTimeout(function () { if (s.open) cardCloseBtn.focus(); }, 700);
  }

  function closeTutorial() {
    if (!s.open) return;
    s.open = false;
    ++s.audioToken;
    var _prev = _audioPlayPromise;
    _audioPlayPromise = null;
    if (_prev) {
      _prev.catch(function () {}).then(function () { try { audioEl.pause(); } catch (e) {} });
    } else {
      try { audioEl.pause(); } catch (e) {}
    }
    setPlayState(false);
    captions.clear();

    tutOverlay.classList.remove('tut--open');
    tutOverlay.setAttribute('aria-hidden', 'true');
    tutCard.classList.remove('tut-card--open');
    document.body.classList.remove('tour-active');

    window.scrollTo({ top: s.scrollY || 0, behavior: 'instant' });

    if (s.triggerEl && s.triggerEl.focus) {
      setTimeout(function () { s.triggerEl.focus(); }, 300);
    }
    showFab();
  }

  /* ── FAB ────────────────────────────────────────────────── */
  function showFab() { fab.classList.add('tut-fab--visible'); }
  function hideFab() { fab.classList.remove('tut-fab--visible'); }

  /* ── Pausa ao trocar de aba ─────────────────────────────── */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && s.playing) {
      audioEl.pause();
      setPlayState(false);
    }
  });

  /* ── Focus trap ─────────────────────────────────────────── */
  function initFocusTrap() {
    function trapFocus(container, e) {
      if (e.key !== 'Tab') return;
      var focusable = Array.from(container.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [tabindex="0"]'
      )).filter(function (el) { return !el.hidden && el.offsetParent !== null; });
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first.focus(); } }
    }

    welcomeBackdrop.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeWelcome(); return; }
      trapFocus(welcomeBackdrop, e);
    });

    tutCard.addEventListener('keydown', function (e) {
      if (!s.open) return;
      if (e.key === 'Escape') { closeTutorial(); return; }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (document.activeElement === nextBtn || document.activeElement === prevBtn) return;
        e.preventDefault(); goToStep(s.step + 1); return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (document.activeElement === nextBtn || document.activeElement === prevBtn) return;
        e.preventDefault(); goToStep(s.step - 1); return;
      }
      if (e.key === 'Enter' && document.activeElement === tutCard) { goToStep(s.step + 1); return; }
      trapFocus(tutCard, e);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (s.open) closeTutorial();
    else if (welcomeBackdrop.classList.contains('tut-welcome--open')) closeWelcome();
  });

  /* ── Swipe no card ──────────────────────────────────────── */
  function initGestures() {
    var bodyEl = document.getElementById('tut-card-body');
    if (!bodyEl) return;
    var swX = 0, swY = 0, isHoriz = null;
    bodyEl.addEventListener('touchstart', function (e) {
      swX = e.touches[0].clientX; swY = e.touches[0].clientY; isHoriz = null;
    }, { passive: true });
    bodyEl.addEventListener('touchmove', function (e) {
      if (isHoriz === null) {
        var dx = Math.abs(e.touches[0].clientX - swX);
        var dy = Math.abs(e.touches[0].clientY - swY);
        if (dx > 8 || dy > 8) isHoriz = dx > dy * 1.6;
      }
      if (isHoriz) e.preventDefault();
    }, { passive: false });
    bodyEl.addEventListener('touchend', function (e) {
      if (!isHoriz) return;
      var dx = e.changedTouches[0].clientX - swX;
      if (Math.abs(dx) > 50) goToStep(dx < 0 ? s.step + 1 : s.step - 1);
      isHoriz = null;
    }, { passive: true });
  }

  /* ── Event listeners ────────────────────────────────────── */
  function bindEvents() {
    welcomeStartBtn.addEventListener('click', function () {
      iosUnlock();       /* desbloqueio síncrono iOS — DEVE ser o primeiro */
      closeWelcome();
      setTimeout(function () { openTutorial(s.triggerEl, 0); }, 350);
    });
    welcomeDismissBtn.addEventListener('click', closeWelcome);
    welcomeNeverBtn.addEventListener('click', function () {
      try { localStorage.setItem('rr_tut_never', '1'); } catch (e) {}
      closeWelcome();
    });
    welcomeBackdrop.addEventListener('click', function (e) {
      if (e.target === welcomeBackdrop) closeWelcome();
    });

    cardCloseBtn.addEventListener('click', closeTutorial);

    var bgEl = tutOverlay.querySelector('.tut-overlay-bg');
    if (bgEl) bgEl.addEventListener('click', closeTutorial);

    playBtnCompact.addEventListener('click', function () {
      if (s.playing) {
        audioEl.pause();
        setPlayState(false);
      } else {
        iosUnlock();  /* garante desbloqueio no tap do usuário */
        stepAudio(s.step);
      }
    });

    playBtn.addEventListener('click', function () {
      if (s.playing) { audioEl.pause(); setPlayState(false); }
      else { stepAudio(s.step); }
    });

    muteBtn.addEventListener('click', function () {
      s.muted = !s.muted;
      if (s.muted) { audioEl.pause(); setPlayState(false); }
      updateMuteBtn();
      savePrefs();
    });

    speedBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        s.speed = parseFloat(b.dataset.speed);
        audioEl.playbackRate = s.speed;
        updateSpeedBtns();
        savePrefs();
      });
    });

    autoChk.addEventListener('change', function () {
      s.auto = autoChk.checked;
      savePrefs();
    });

    prevBtn.addEventListener('click', function () { goToStep(s.step - 1); });
    nextBtn.addEventListener('click', function () {
      if (s.step === TOTAL - 1) goToOrcamento();
      else goToStep(s.step + 1);
    });

    fab.addEventListener('click', function () {
      hideFab();
      openTutorial(null, 0);
    });
  }

  /* ── Triggers .js-tut no HTML ───────────────────────────── */
  function initTriggers() {
    document.querySelectorAll('.js-tut').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        iosUnlock();   /* desbloqueio síncrono iOS — DEVE ser o primeiro */
        openTutorial(trigger, 0);
      });
    });

    window.addEventListener('hashchange', function () {
      if (location.hash === '#tutorial') {
        history.replaceState(null, '', ' ');
        openTutorial(null, 0);
      }
    });
  }

  /* ── Auto-open modal após 1,5s ──────────────────────────── */
  function maybeAutoOpen() {
    try {
      if (localStorage.getItem('rr_tut_never') === '1') return;
      if (sessionStorage.getItem('rr_tut_seen') === '1') return;
    } catch (e) {}
    setTimeout(function () {
      if (s.open) return;
      try { sessionStorage.setItem('rr_tut_seen', '1'); } catch (e) {}
      openWelcome(null);
    }, 1500);
  }

  /* ── Init ───────────────────────────────────────────────── */
  loadPrefs();
  buildDOM();
  initGestures();
  initFocusTrap();
  bindEvents();
  initTriggers();
  maybeAutoOpen();
  setPlayState(false);

})();

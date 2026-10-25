/* ============================================================
   RR Studio Details — Tutorial "Como funciona"
   Spotlight tour. Depende de tutorial-data.js (TUTORIAL_DATA).
   Não altera main.js, tutorial-data.js, index.html nem style.css.
   ============================================================ */

(function () {
  'use strict';

  /* ── Dependências ──────────────────────────────────────── */
  var DATA = window.TUTORIAL_DATA;
  if (!DATA || !Array.isArray(DATA.steps) || !DATA.steps.length) return;

  var STEPS   = DATA.steps;
  var TOTAL   = STEPS.length;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IS_MOBILE = function () { return window.innerWidth <= 640; };

  /* ── Estado ────────────────────────────────────────────── */
  var s = {
    open:         false,
    step:         0,
    playing:      false,
    muted:        false,
    speed:        1,
    auto:         true,
    mode:         'idle',   // 'idle' | 'audio' | 'tts' | 'none'
    activePhrase: -1,
    triggerEl:    null,
    rotating:     false,    // true enquanto o carrossel está animando
    scrollY:      0,        // posição de scroll antes de abrir o tour
    audioStep:    -1        // índice da etapa sendo narrada (-1 = nenhuma)
  };

  /* ── Preferências ──────────────────────────────────────── */
  function loadPrefs() {
    try {
      var raw = localStorage.getItem('rr_tut_prefs');
      if (!raw) return;
      var p = JSON.parse(raw);
      if (typeof p.muted === 'boolean')             s.muted = p.muted;
      if ([0.9, 1, 1.25].indexOf(p.speed) !== -1)  s.speed = p.speed;
      if (typeof p.auto === 'boolean')              s.auto  = p.auto;
    } catch (e) {}
  }
  function savePrefs() {
    try {
      localStorage.setItem('rr_tut_prefs',
        JSON.stringify({ muted: s.muted, speed: s.speed, auto: s.auto })
      );
    } catch (e) {}
  }

  /* ── Utilitário: cria elemento ─────────────────────────── */
  function el(tag, attrs) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class')  { node.className = attrs[k]; }
      else if (k === 'hidden') { node.hidden = true; }
      else if (k === 'checked') { node.checked = true; }
      else { node.setAttribute(k, attrs[k]); }
    });
    return node;
  }

  /* ── SVG helpers ───────────────────────────────────────── */
  var SVG_PLAY  = '<svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M6 4l10 6-10 6V4z"/></svg>';
  var SVG_PAUSE = '<svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor" aria-hidden="true"><rect x="4" y="3" width="4" height="14" rx="1"/><rect x="12" y="3" width="4" height="14" rx="1"/></svg>';
  var SVG_VOL   = '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 8v4h3l4 4V4L7 8H4z"/><path d="M13 7.5a4 4 0 0 1 0 5M16 5a7 7 0 0 1 0 10"/></svg>';
  var SVG_MUTE  = '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 8v4h3l4 4V4L7 8H4z"/><line x1="14" y1="7" x2="18" y2="13"/><line x1="18" y1="7" x2="14" y2="13"/></svg>';
  var SVG_PLAY_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';

  /* ── iOS: desbloqueio síncrono da speechSynthesis ──────── */
  function iosUnlock() {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // Usa a primeira frase real para que iOS aceite a fala — volume baixo
    var utt = new SpeechSynthesisUtterance(STEPS[0].phrases[0]);
    utt.lang  = 'pt-BR';
    utt.voice = getBestVoice();   // getBestVoice está mais abaixo; é chamada depois do buildDOM
    utt.volume = 0.01;            // quase mudo — só destrava o engine
    window.speechSynthesis.speak(utt);
  }

  /* ── DOM refs ──────────────────────────────────────────── */
  var welcomeBackdrop, welcomeCard, welcomeStartBtn, welcomeDismissBtn, welcomeNeverBtn;
  var tutOverlay, tutSpotlight, tutCard;
  var cardStepLabel, cardDots, cardCloseBtn, cardFooter;
  var cardTitle, cardText, ttsNotice;
  var playBtn, playBtnCompact, muteBtn, speedBtns, autoChk;
  var prevBtn, nextBtn;
  var fab;

  /* ── Construção do DOM ─────────────────────────────────── */
  function buildDOM() {
    /* === Welcome modal === */
    welcomeBackdrop = el('div', {
      class: 'tut-welcome-backdrop',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Tour guiado: conheça a RR Studio Details',
      'aria-hidden': 'true'
    });
    welcomeCard = el('div', { class: 'tut-welcome' });

    /* cabeçalho vermelho */
    var wHeader = el('div', { class: 'tut-welcome-header' });
    var wHeaderIcon = el('span', { class: 'tut-welcome-header-icon' });
    wHeaderIcon.innerHTML = '<svg viewBox="0 0 64 64" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 42l4-14h40l4 14"/><rect x="6" y="42" width="52" height="10" rx="4"/><circle cx="19" cy="42" r="4" fill="currentColor" stroke="none"/><circle cx="45" cy="42" r="4" fill="currentColor" stroke="none"/><path d="M12 36h40M26 28h12"/></svg>';
    var wHeaderTitle = el('h2', {});
    wHeaderTitle.textContent = 'Bem-vindo!';
    var wHeaderSub = el('p', { class: 'tut-welcome-header-sub' });
    wHeaderSub.textContent = 'RR Studio Details';
    wHeader.append(wHeaderIcon, wHeaderTitle, wHeaderSub);

    /* corpo */
    var wBody = el('div', { class: 'tut-welcome-body' });
    var wText = el('p', {});
    wText.innerHTML = 'Quer ver um <strong>tour rápido</strong> pelos nossos serviços?';
    wBody.appendChild(wText);

    /* botões */
    var wActions = el('div', { class: 'tut-welcome-actions' });
    welcomeStartBtn = el('button', { class: 'tut-welcome-start', type: 'button' });
    welcomeStartBtn.innerHTML = SVG_PLAY_ICON + ' Sim, mostrar!';
    welcomeDismissBtn = el('button', { class: 'tut-welcome-dismiss', type: 'button' });
    welcomeDismissBtn.textContent = 'Agora não';
    wActions.append(welcomeStartBtn, welcomeDismissBtn);

    /* "Não mostrar novamente" */
    welcomeNeverBtn = el('button', { class: 'tut-welcome-never', type: 'button' });
    welcomeNeverBtn.textContent = 'Não mostrar novamente';

    welcomeCard.append(wHeader, wBody, wActions, welcomeNeverBtn);
    welcomeBackdrop.appendChild(welcomeCard);
    document.body.appendChild(welcomeBackdrop);

    /* === Spotlight overlay === */
    tutOverlay = el('div', {
      id: 'tut-overlay',
      class: 'tut-overlay',
      'aria-hidden': 'true'
    });

    var tutOverlayBg = el('div', { class: 'tut-overlay-bg' });
    tutSpotlight = el('div', { class: 'tut-spotlight', 'aria-hidden': 'true' });

    tutOverlay.append(tutOverlayBg, tutSpotlight);

    /* === Card flutuante === */
    tutCard = el('div', {
      class: 'tut-card',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Tour guiado',
      tabindex: '-1'
    });

    /* cabeçalho */
    var cHead = el('div', { class: 'tut-card-head' });
    cardStepLabel = el('span', { class: 'tut-card-step', 'aria-live': 'polite' });
    cardCloseBtn = el('button', { class: 'tut-card-close', type: 'button', 'aria-label': 'Fechar tutorial' });
    cardCloseBtn.textContent = '✕';
    playBtnCompact = el('button', { class: 'tut-play-btn-compact', type: 'button', 'aria-label': 'Ouvir etapa' });
    playBtnCompact.innerHTML = SVG_PLAY;
    playBtnCompact.addEventListener('click', function () {
      if (s.playing) { audio.stop(); setPlayState(false); }
      else { audio.play(s.step); setPlayState(true); }
    });
    cHead.append(cardStepLabel, playBtnCompact, cardCloseBtn);

    /* dots */
    cardDots = el('div', { class: 'tut-dots', 'aria-hidden': 'true' });

    /* corpo */
    var cBody = el('div', { class: 'tut-card-body', id: 'tut-card-body' });
    cardTitle = el('h2', { class: 'tut-card-title', id: 'tut-card-title' });
    cardText  = el('div', { class: 'tut-card-text', 'aria-live': 'polite', 'aria-atomic': 'false' });
    ttsNotice = el('p',   { class: 'tut-tts-notice', hidden: '' });
    ttsNotice.textContent = 'Usando a voz do seu aparelho';
    cBody.append(cardTitle, cardText, ttsNotice);

    /* áudio */
    var cAudio = el('div', { class: 'tut-card-audio' });
    playBtn = el('button', { class: 'tut-play-btn', type: 'button', 'aria-label': 'Ouvir esta etapa' });
    playBtn.innerHTML = SVG_PLAY + ' Ouvir';

    muteBtn = el('button', { class: 'tut-mute', type: 'button', 'aria-label': 'Silenciar', 'aria-pressed': 'false' });
    muteBtn.innerHTML = SVG_VOL;

    var speedGrp = el('div', { class: 'tut-speed-group', role: 'group', 'aria-label': 'Velocidade' });
    speedBtns = [0.9, 1, 1.25].map(function (v) {
      var b = el('button', {
        class: 'tut-speed-btn',
        type: 'button',
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
    cAudio.append(playBtn, audioOpts, ttsNotice);

    /* rodapé */
    cardFooter = el('div', { class: 'tut-card-footer' });
    var cFooter = cardFooter;
    prevBtn = el('button', { class: 'tut-prev', type: 'button', 'aria-label': 'Etapa anterior' });
    prevBtn.innerHTML = '';
    nextBtn = el('button', { class: 'tut-next', type: 'button' });
    nextBtn.textContent = 'Próxima ›';
    cFooter.append(prevBtn, nextBtn);

    tutCard.append(cHead, cardDots, cBody, cAudio, cFooter);
    document.body.appendChild(tutOverlay);
    document.body.appendChild(tutCard);

    /* === FAB === */
    fab = el('button', { class: 'tut-fab', type: 'button', 'aria-label': 'Reabrir tutorial: como funciona' });
    fab.innerHTML = SVG_PLAY_ICON + ' Como funciona';
    document.body.appendChild(fab);

    /* cria dots */
    for (var i = 0; i < TOTAL; i++) {
      (function (idx) {
        var d = el('button', {
          class: 'tut-dot',
          type: 'button',
          'aria-label': 'Etapa ' + (idx + 1) + ': ' + STEPS[idx].title
        });
        d.addEventListener('click', function () { goToStep(idx); });
        cardDots.appendChild(d);
      })(i);
    }
  }

  /* ── Renderizar etapa ──────────────────────────────────── */
  var CONTENT_OUT_MS = 160;
  var CONTENT_IN_MS  = 200;

  function renderStep(idx) {
    var step    = STEPS[idx];
    var n       = idx + 1;
    var isFirst = !tutCard.classList.contains('tut-card--open');
    var cBody   = document.getElementById('tut-card-body');

    /* ── (a) conteúdo do balão sai imediatamente ─────────── */
    if (cBody && !isFirst) {
      cBody.classList.remove('tut-card-body--in');
      cBody.classList.add('tut-card-body--out');
    }

    /* ── Atualiza rótulos e dots (não visível ainda) ──────── */
    cardStepLabel.textContent = 'Etapa ' + n + ' de ' + TOTAL;

    var dots = cardDots.querySelectorAll('.tut-dot');
    dots.forEach(function (d, i) {
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
    if (cardFooter) {
      if (idx === 0) cardFooter.setAttribute('data-first', '');
      else           cardFooter.removeAttribute('data-first');
    }

    /* ── (b) após content-out: atualiza texto, scroll, spotlight ─ */
    var updateContent = function () {
      if (!s.open) return;

      cardTitle.textContent = step.title;

      cardText.innerHTML = '';
      step.phrases.forEach(function (phrase, i) {
        var span = el('span', { class: 'tut-phrase', id: 'tut-p-' + i });
        span.textContent = phrase;
        cardText.appendChild(span);
      });

      /* scroll corpo ao topo */
      if (cBody) cBody.scrollTop = 0;

      captions.clear();
      /* para narração da etapa anterior */
      audio.stop();
      setPlayState(false);
      ttsNotice.hidden = true;
      audio.load(idx);

      var doFinish = function () {
        if (!s.open) return;

        positionSpotlight(idx);
        positionCard(idx);

        if (!tutOverlay.classList.contains('tut--open')) {
          tutOverlay.classList.add('tut--open');
        }
        tutCard.classList.add('tut-card--open');

        /* ── (d) conteúdo entra ─────────────────────────────── */
        if (cBody) {
          cBody.classList.remove('tut-card-body--out');
          cBody.classList.add('tut-card-body--in');
          setTimeout(function () {
            if (cBody) cBody.classList.remove('tut-card-body--in');
          }, CONTENT_IN_MS + 50);
        }

        /* ── auto-narração ──────────────────────────────────── */
        if (!s.muted && s.audioStep !== idx) {
          audio.play();
          setPlayState(true);
        }
      };

      /* ── (b+c) scroll + carrossel ───────────────────────── */
      var doScroll = function () {
        scrollToTarget(idx, function () {
          if (!s.open) return;
          positionSpotlight(idx);
          doFinish();
        });
      };

      if (typeof step.carouselIndex === 'number') {
        s.rotating = true;
        /* sem dim — spotlight fica na posição antiga enquanto carrossel gira */
        var spinDots = document.querySelectorAll('.spin-dot');
        if (spinDots[step.carouselIndex]) {
          spinDots[step.carouselIndex].click();
        }
        setTimeout(function () {
          s.rotating = false;
          doScroll();
        }, REDUCED ? 0 : 750);
      } else {
        doScroll();
      }
    };

    if (isFirst) {
      updateContent();
    } else {
      setTimeout(updateContent, CONTENT_OUT_MS);
    }
  }

  /* ── Scroll para o alvo ────────────────────────────────── */
  function scrollToTarget(idx, cb) {
    var target = document.querySelector(STEPS[idx].target);
    if (!target) { cb && cb(); return; }

    if (IS_MOBILE()) {
      var rect    = target.getBoundingClientRect();
      var cardH   = tutCard.offsetHeight || 220;
      var cardBottom = 68;
      var visBottom  = window.innerHeight - cardBottom - cardH - 16;
      /* topo do alvo deve ficar a 16px do topo da tela */
      var needsScroll = rect.top < 16 || rect.bottom > visBottom;
      if (needsScroll) {
        var ideal = rect.top + window.scrollY - 16;
        window.scrollTo({ top: Math.max(0, ideal), behavior: REDUCED ? 'auto' : 'smooth' });
      }
    } else {
      target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
    }

    var delay = REDUCED ? 0 : (IS_MOBILE() ? 300 : 550);
    setTimeout(function () { cb && cb(); }, delay);
  }

  /* ── Posicionamento do Spotlight ───────────────────────── */
  var _spotRAF = null;
  function positionSpotlight(idx) {
    var target = document.querySelector(STEPS[idx].target);
    if (!target) {
      tutSpotlight.style.display = 'none';
      return;
    }
    tutSpotlight.style.display = '';
    var rect = target.getBoundingClientRect();
    var PAD  = 8;
    var spTop    = rect.top  - PAD;
    var spLeft   = rect.left - PAD;
    var spWidth  = rect.width  + PAD * 2;
    var spHeight = rect.height + PAD * 2;

    if (IS_MOBILE()) {
      var cardH      = tutCard.offsetHeight || 220;
      var cardBottom = 68;
      var visBottom  = window.innerHeight - cardBottom - cardH - 8;
      spHeight = Math.max(0, Math.min(spTop + spHeight, visBottom) - spTop);
    }

    tutSpotlight.style.top    = spTop    + 'px';
    tutSpotlight.style.left   = spLeft   + 'px';
    tutSpotlight.style.width  = spWidth  + 'px';
    tutSpotlight.style.height = spHeight + 'px';
  }

  /* ── Posicionamento do Card ────────────────────────────── */
  function positionCard(idx) {
    var target = document.querySelector(STEPS[idx].target);
    if (!target) return;

    var targetRect = target.getBoundingClientRect();
    var PAD     = 8;   // padding do spotlight
    var GAP     = 12;  // distância mínima balão↔spotlight
    var cardH   = tutCard.offsetHeight || 220;
    var vpH     = window.innerHeight;
    var vpW     = window.innerWidth;

    if (IS_MOBILE()) {
      // No mobile, o card está fixo no fundo (CSS).
      // Calcula se o spotlight vai entrar na área do card.
      // Se sim, rola a página para que o spotlight fique acima do card.
      var cardBottom = 68; // bottom do card (px do fundo — ajuste se mudar CSS)
      var cardTop    = vpH - cardBottom - cardH;
      var spBottom   = targetRect.bottom + PAD;
      if (spBottom > cardTop - GAP) {
        var extra = spBottom - (cardTop - GAP);
        window.scrollBy({ top: extra, behavior: REDUCED ? 'auto' : 'smooth' });
      }
      tutCard.style.top  = '';
      tutCard.style.left = '';
      return;
    }

    // Desktop
    var cardW   = 340;
    var margin  = 16;
    var spTop   = targetRect.top    - PAD;
    var spBot   = targetRect.bottom + PAD;

    var spaceBelow = vpH - spBot - GAP;
    var spaceAbove = spTop - GAP;

    var top;
    if (spaceBelow >= cardH || spaceBelow >= spaceAbove) {
      top = spBot + GAP;
      if (top + cardH > vpH - margin) top = vpH - cardH - margin;
    } else {
      top = spTop - GAP - cardH;
      if (top < margin) top = margin;
    }

    var left = targetRect.left + targetRect.width / 2 - cardW / 2;
    left = Math.max(margin, Math.min(left, vpW - cardW - margin));

    tutCard.style.top  = top  + 'px';
    tutCard.style.left = left + 'px';
  }

  /* ── Manutenção do spotlight em scroll/resize ──────────── */
  var _syncRAF  = null;
  var _needSync = false;

  function scheduleSync() {
    if (_syncRAF || s.rotating) return;
    _syncRAF = requestAnimationFrame(function () {
      _syncRAF = null;
      if (!s.open || s.rotating) return;
      positionSpotlight(s.step);
      positionCard(s.step);
    });
  }

  window.addEventListener('scroll', scheduleSync, { passive: true });
  window.addEventListener('resize', scheduleSync, { passive: true });

  /* ── Captions ──────────────────────────────────────────── */
  var captions = {
    set: function (i) {
      var spans = cardText.querySelectorAll('.tut-phrase');
      spans.forEach(function (sp, idx) {
        sp.classList.toggle('tut-phrase--active', idx === i);
      });
      if (i >= 0 && spans[i]) {
        spans[i].scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'nearest' });
      }
    },
    clear: function () {
      cardText.querySelectorAll('.tut-phrase').forEach(function (sp) {
        sp.classList.remove('tut-phrase--active');
      });
    }
  };

  /* ── Áudio ─────────────────────────────────────────────── */
  var audioEl = document.createElement('audio');
  audioEl.preload = 'none';

  /* workaround Chrome Mobile: speechSynthesis pausa após ~15s */
  var _chromeTimer = null;
  function startChromeWorkaround() {
    clearInterval(_chromeTimer);
    _chromeTimer = setInterval(function () {
      if (window.speechSynthesis && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 14000);
  }
  function stopChromeWorkaround() { clearInterval(_chromeTimer); }

  var speechId = 0;   // incrementa a cada nova sessão de fala; onend/onerror ignoram ids stale

  var audio = {
    load: function (idx) {
      var step = STEPS[idx];
      if (!step.audio) { s.mode = 'tts'; return; }
      audioEl.src = step.audio;
      audioEl.muted        = s.muted;
      audioEl.playbackRate = s.speed;
      s.mode = 'idle';
      if (idx + 1 < TOTAL && STEPS[idx + 1].audio) {
        var nx = new Audio();
        nx.preload = 'metadata';
        nx.src = STEPS[idx + 1].audio;
      }
    },
    play: function () {
      var step = STEPS[s.step];
      if (s.mode === 'tts') { this._startTTS(step, s.step); return; }
      if (!audioEl.src || audioEl.error) { this._startTTS(step, s.step); return; }
      var self = this;
      var p = audioEl.play();
      if (p && p.catch) { p.catch(function () { self._startTTS(step, s.step); }); }
    },
    pause: function () {
      if (s.mode === 'audio') {
        audioEl.pause();
      } else if (s.mode === 'tts') {
        speechId++;   // invalida onend/onerror futuros
        stopChromeWorkaround();
        if (window.speechSynthesis) window.speechSynthesis.cancel();
      }
    },
    stop: function () {
      speechId++;   // invalida qualquer sessão de fala em curso
      stopChromeWorkaround();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      try { audioEl.pause(); audioEl.currentTime = 0; } catch (e) {}
      s.mode      = 'idle';
      s.playing   = false;
      s.audioStep = -1;
    },
    setMuted: function (m) {
      audioEl.muted = m;
      if (m && s.mode === 'tts') { this.stop(); setPlayState(false); }
    },
    setSpeed: function (r) {
      audioEl.playbackRate = r;
    },
    _startTTS: function (step, stepIdx) {
      if (!window.speechSynthesis) {
        s.mode = 'none';
        ttsNotice.textContent = 'Áudio indisponível neste navegador';
        ttsNotice.hidden = false;
        setPlayState(false);
        return;
      }
      if (s.muted) return;
      window.speechSynthesis.cancel();
      speechId++;
      var myId = speechId;
      s.audioStep = stepIdx;
      s.mode      = 'tts';
      ttsNotice.hidden = true;
      startChromeWorkaround();
      this._speakPhrase(step.phrases, myId, 0);
    },
    _speakPhrase: function (phrases, id, index) {
      if (id !== speechId) return;            // sessão cancelada
      if (index >= phrases.length) {
        stopChromeWorkaround();
        setPlayState(false);
        captions.clear();
        s.audioStep = -1;
        if (s.auto && s.open) {
          setTimeout(function () { goToStep(s.step + 1); }, 1000);
        }
        return;
      }
      var i   = index;
      var utt = new SpeechSynthesisUtterance(phrases[i]);
      utt.lang  = 'pt-BR';
      utt.rate  = s.speed * 0.92;
      utt.pitch = 1.0;
      utt.voice = getBestVoice();
      var self = this;
      utt.onstart = function () {
        if (id !== speechId) return;
        captions.set(i);
      };
      utt.onend = function () {
        if (id !== speechId) return;
        setTimeout(function () { self._speakPhrase(phrases, id, i + 1); }, 400);
      };
      utt.onerror = function (e) {
        if (id !== speechId) return;
        if (e.error === 'interrupted' || e.error === 'canceled') return;  // ignorar
        stopChromeWorkaround();
        setPlayState(false);
        s.audioStep = -1;
        s.mode = 'none';
        ttsNotice.textContent = 'Áudio indisponível neste navegador';
        ttsNotice.hidden = false;
      };
      window.speechSynthesis.speak(utt);
    }
  };

  audioEl.addEventListener('playing', function () {
    s.mode = 'audio';
    setPlayState(true);
  });

  audioEl.addEventListener('timeupdate', function () {
    var step = STEPS[s.step];
    if (!step.timestamps || !step.timestamps.length) return;
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
    if (s.auto) setTimeout(function () { goToStep(s.step + 1); }, 1000);
  });

  audioEl.addEventListener('error', function () {
    audio._startTTS(STEPS[s.step]);
  });

  function getBestVoice() {
    if (!window.speechSynthesis) return null;
    var voices = window.speechSynthesis.getVoices();
    var ptBR   = voices.filter(function (v) {
      return v.lang === 'pt-BR' || v.lang === 'pt_BR';
    });
    var priority = ['Natural', 'Neural', 'Google', 'Microsoft'];
    for (var i = 0; i < priority.length; i++) {
      var p = priority[i];
      var found = ptBR.filter(function (v) { return v.name.indexOf(p) !== -1; })[0];
      if (found) return found;
    }
    return ptBR[0] || null;
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.addEventListener('voiceschanged', function () {
      /* re-seleciona voz quando lista atualizar (Android carrega assíncrono) */
    });
  }

  function setPlayState(playing) {
    s.playing = playing;
    if (playing) {
      playBtn.innerHTML = SVG_PAUSE + ' Pausar';
      playBtn.setAttribute('aria-label', 'Pausar');
      if (playBtnCompact) {
        playBtnCompact.innerHTML = SVG_PAUSE;
        playBtnCompact.setAttribute('aria-label', 'Pausar');
      }
    } else {
      playBtn.innerHTML = SVG_PLAY + ' Ouvir';
      playBtn.setAttribute('aria-label', 'Ouvir esta etapa');
      if (playBtnCompact) {
        playBtnCompact.innerHTML = SVG_PLAY;
        playBtnCompact.setAttribute('aria-label', 'Ouvir etapa');
      }
    }
  }

  /* ── Pausa ao trocar de aba ────────────────────────────── */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && s.playing) {
      audio.pause();
      setPlayState(false);
    }
  });

  /* ── Navegação entre etapas ────────────────────────────── */
  function goToStep(idx) {
    if (idx < 0 || idx >= TOTAL) return;
    if (s.step === TOTAL - 1 && idx >= TOTAL) {
      goToOrcamento();
      return;
    }
    s.step = Math.min(Math.max(idx, 0), TOTAL - 1);
    renderStep(s.step);
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

  /* ── Welcome: abrir / fechar ───────────────────────────── */
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

  /* ── Tour: abrir / fechar ──────────────────────────────── */
  function openTutorial(triggerEl, startStep) {
    if (s.open) return;
    s.open      = true;
    s.triggerEl = triggerEl || s.triggerEl || null;
    s.step      = typeof startStep === 'number' ? startStep : 0;

    document.body.classList.add('tour-active');
    s.scrollY = window.scrollY;

    tutOverlay.removeAttribute('aria-hidden');

    hideFab();
    updateMuteBtn();
    updateSpeedBtns();
    autoChk.checked = s.auto;
    setPlayState(false);

    renderStep(s.step);

    setTimeout(function () { if (s.open) cardCloseBtn.focus(); }, 700);

    if (window.speechSynthesis) window.speechSynthesis.getVoices();
  }

  function closeTutorial() {
    if (!s.open) return;
    s.open = false;
    audio.stop();
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

  /* ── FAB ───────────────────────────────────────────────── */
  function showFab() {
    fab.classList.add('tut-fab--visible');
  }
  function hideFab() {
    fab.classList.remove('tut-fab--visible');
  }

  /* ── Controles de áudio ────────────────────────────────── */
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

  /* ── Focus trap ────────────────────────────────────────── */
  function initFocusTrap() {
    function trapFocus(container, e) {
      if (e.key !== 'Tab') return;
      var focusable = Array.from(container.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [tabindex="0"]'
      )).filter(function (el) {
        return !el.hidden && el.offsetParent !== null;
      });
      if (!focusable.length) return;
      var first = focusable[0];
      var last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
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
        e.preventDefault();
        goToStep(s.step + 1);
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (document.activeElement === nextBtn || document.activeElement === prevBtn) return;
        e.preventDefault();
        goToStep(s.step - 1);
        return;
      }
      if (e.key === 'Enter' && document.activeElement === tutCard) {
        goToStep(s.step + 1);
        return;
      }
      trapFocus(tutCard, e);
    });
  }

  /* Escape global */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (s.open) closeTutorial();
      else if (welcomeBackdrop.classList.contains('tut-welcome--open')) closeWelcome();
    }
  });

  /* ── Gestos mobile no card ─────────────────────────────── */
  function initGestures() {
    /* swipe horizontal no corpo do card → mudar etapa */
    var swX = 0, swY = 0, isHoriz = null;
    var bodyEl = document.getElementById('tut-card-body');
    if (!bodyEl) return;
    bodyEl.addEventListener('touchstart', function (e) {
      swX = e.touches[0].clientX;
      swY = e.touches[0].clientY;
      isHoriz = null;
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

  /* ── Event listeners ───────────────────────────────────── */
  function bindEvents() {
    /* welcome */
    welcomeStartBtn.addEventListener('click', function () {
      iosUnlock();           // desbloqueio síncrono iOS — DEVE ser antes de qualquer setTimeout
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

    /* fechar tour */
    cardCloseBtn.addEventListener('click', closeTutorial);

    /* overlay bg: fechar ao clicar fora do card */
    var bgEl = tutOverlay.querySelector('.tut-overlay-bg');
    if (bgEl) bgEl.addEventListener('click', closeTutorial);

    /* play/pause */
    playBtn.addEventListener('click', function () {
      if (s.playing) { audio.pause(); setPlayState(false); }
      else            { audio.play();  setPlayState(true); }
    });

    /* mudo */
    muteBtn.addEventListener('click', function () {
      s.muted = !s.muted;
      audio.setMuted(s.muted);
      updateMuteBtn();
      savePrefs();
    });

    /* velocidade */
    speedBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        s.speed = parseFloat(b.dataset.speed);
        audio.setSpeed(s.speed);
        updateSpeedBtns();
        savePrefs();
      });
    });

    /* auto-avançar */
    autoChk.addEventListener('change', function () {
      s.auto = autoChk.checked;
      savePrefs();
    });

    /* anterior */
    prevBtn.addEventListener('click', function () { goToStep(s.step - 1); });

    /* próxima / CTA final */
    nextBtn.addEventListener('click', function () {
      if (s.step === TOTAL - 1) goToOrcamento();
      else goToStep(s.step + 1);
    });

    /* FAB */
    fab.addEventListener('click', function () {
      hideFab();
      openTutorial(null, 0);
    });
  }

  /* ── Triggers (.js-tut) ────────────────────────────────── */
  function initTriggers() {
    document.querySelectorAll('.js-tut').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        iosUnlock();          // desbloqueio síncrono iOS — DEVE ser antes de qualquer setTimeout
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

  /* ── Init ──────────────────────────────────────────────── */
  loadPrefs();
  buildDOM();
  initGestures();
  initFocusTrap();
  bindEvents();
  initTriggers();
  maybeAutoOpen();
  setPlayState(false);

})();

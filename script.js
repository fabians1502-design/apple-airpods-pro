/**
 * Apple AirPods Pro (2. Generation) · Premium Product Experience
 * Architecture: Ultra-Crisp Official Assets + GSAP ScrollTrigger + Lenis + Web Audio API
 */

// Register GSAP Plugins
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

document.addEventListener('DOMContentLoaded', () => {
  initLenisAndGSAP();
  initPreloader();
  initScrollProgressBar();
  initTextReveal();
  initMagneticButtons();
  initHeroParallaxAndScroll();
  initAcousticWaveform();
  initAncWipeSlider();
  initSpatial3DWebGL();
  initStemTouchSensor();
  initCaseSimulator();
  initHorizontalScroll();
  init3DTiltAndSpotlight();
  initBuyButton();
});

/* ==========================================================================
   WEB AUDIO API SOUND GENERATOR (TACTILE CLICKS & CHIMES)
   ========================================================================== */
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Gentle tactile volume click
function playVolumeClick(freq = 900) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.025);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.025);
  } catch (e) {}
}

// Case snap dual-tone chime
function playCaseChime(isOpen) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    if (isOpen) {
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.06); // A5
    } else {
      osc1.frequency.setValueAtTime(880.00, ctx.currentTime); // A5
      osc2.frequency.setValueAtTime(440.00, ctx.currentTime + 0.05); // A4
    }

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc1.stop(ctx.currentTime + 0.08);
    osc2.start(ctx.currentTime + 0.05);
    osc2.stop(ctx.currentTime + 0.22);
  } catch (e) {}
}

// Gentle tactile micro-hover tick
function playHoverTick() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(850, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.02);
    gain.gain.setValueAtTime(0.015, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.02);
  } catch (e) {}
}

// Gentle spatial 3D frequency sweep when dragging 3D soundfield
let lastFreqTime = 0;
function playSpatialFrequency(azimuth, elevation) {
  try {
    const now = performance.now();
    if (now - lastFreqTime < 60) return; // Throttle
    lastFreqTime = now;

    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = Math.max(240, Math.min(840, 480 + (azimuth % 180) * 1.5 + elevation * 2));
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.012, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {}
}

/* ==========================================================================
   1. LENIS SMOOTH SCROLL
   ========================================================================== */
let lenis;

function initLenisAndGSAP() {
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 1.8,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

/* ==========================================================================
   2. HERO 3D PARALLAX & PINNED STAGE 2 SCROLLING
   ========================================================================== */
function initHeroParallaxAndScroll() {
  const heroStage = document.getElementById('hero-product-stage');
  const podCard = document.getElementById('hero-pod-card');
  const heroLight = document.getElementById('hero-light');

  if (heroStage && podCard) {
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    window.addEventListener('mousemove', (e) => {
      const rect = heroStage.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      mouse.targetX = (e.clientX - centerX) / (window.innerWidth / 2);
      mouse.targetY = (e.clientY - centerY) / (window.innerHeight / 2);

      if (heroLight) {
        const lightX = ((e.clientX - rect.left) / rect.width) * 100;
        const lightY = ((e.clientY - rect.top) / rect.height) * 100;
        heroLight.style.setProperty('--light-x', `${lightX}%`);
        heroLight.style.setProperty('--light-y', `${lightY}%`);
      }
    });

    // Smooth lerp loop for 3D tilt
    function updateTilt() {
      mouse.x += (mouse.targetX - mouse.x) * 0.07;
      mouse.y += (mouse.targetY - mouse.y) * 0.07;

      const rotateY = mouse.x * 14;
      const rotateX = -mouse.y * 14;

      podCard.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      requestAnimationFrame(updateTilt);
    }
    updateTilt();
  }

  // GSAP ScrollTrigger Pinned Hero Staging (Compact: 1000px, Zero Dead Gaps)
  const heroWrapper = document.querySelector('.hero-pinned-wrapper');
  const heroSticky = document.querySelector('.hero-sticky');
  const stage1 = document.getElementById('hero-stage-1');
  const stage2 = document.getElementById('hero-stage-2');
  const scrollIndicator = document.getElementById('hero-scroll-indicator');
  const callouts = document.querySelectorAll('.guts-callout');

  if (heroWrapper && heroSticky) {
    const heroTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: heroWrapper,
        start: "top top",
        end: "+=1100", // Compact & crisp
        pin: heroSticky,
        scrub: 1.2,
      }
    });

    // Stage 1 fades out in first 40%
    heroTimeline.to(stage1, {
      opacity: 0,
      y: -60,
      scale: 0.95,
      ease: "power1.out"
    }, 0);

    heroTimeline.to(scrollIndicator, {
      opacity: 0,
      ease: "power1.out"
    }, 0);

    // Main AirPods scale up slightly and fade back
    heroTimeline.to('#hero-product-stage', {
      opacity: 0.15,
      scale: 1.15,
      y: -40,
      ease: "power1.inOut"
    }, 0.1);

    // Stage 2 (Akustische Architektur) fades in seamlessly (35% to 75%)
    heroTimeline.fromTo(stage2,
      { opacity: 0, y: 50, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, ease: "power1.out" },
      0.35
    );

    // Animate callout tags with spring pop
    heroTimeline.fromTo(callouts,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, stagger: 0.08, ease: "back.out(1.7)" },
      0.5
    );

    // Stage 2 exits into Acoustics
    heroTimeline.to(stage2, {
      opacity: 0,
      y: -50,
      scale: 0.98,
      ease: "power1.in"
    }, 0.88);
  }
}

/* ==========================================================================
   3. LIVE ACOUSTIC & NOISE-CANCELLATION SIMULATOR
   ========================================================================== */
function initAcousticWaveform() {
  const canvas = document.getElementById('soundwave-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let currentMode = 'anc';
  let phase = 0;

  const modeSettings = {
    anc: {
      noiseAmp: 55,
      antiAmp: 53.5,
      resultAmp: 3.5,
      statusText: 'ANC AKTIV · -42 dB Rauschdämpfung (99.2% Lärmauslöschung)',
      colorNoise: 'rgba(255, 69, 58, 0.45)',
      colorAnti: 'rgba(0, 245, 212, 0.65)',
      colorResult: '#30d158'
    },
    transparency: {
      noiseAmp: 50,
      antiAmp: 0,
      resultAmp: 50,
      statusText: 'TRANSPARENZMODUS · 0 dB Dämpfung (Natürlicher Raumklang)',
      colorNoise: 'rgba(255, 69, 58, 0.25)',
      colorAnti: 'transparent',
      colorResult: '#2997ff'
    },
    adaptive: {
      noiseAmp: 50,
      antiAmp: 32,
      resultAmp: 18,
      statusText: 'ADAPTIVES AUDIO · Dynamische Mischung nach Situation (-24 dB)',
      colorNoise: 'rgba(255, 69, 58, 0.35)',
      colorAnti: 'rgba(0, 245, 212, 0.45)',
      colorResult: '#ffd60a'
    }
  };

  const modeBtns = document.querySelectorAll('.mode-btn');
  const statusEl = document.getElementById('anc-status-text');

  modeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      modeBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      currentMode = btn.dataset.mode;
      if (statusEl) {
        statusEl.textContent = modeSettings[currentMode].statusText;
      }
      playVolumeClick(700);
    });
  });

  function draw() {
    requestAnimationFrame(draw);
    phase += 0.045;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Dark grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const cfg = modeSettings[currentMode];

    // 1. Noise
    if (cfg.noiseAmp > 0) {
      ctx.beginPath();
      ctx.strokeStyle = cfg.colorNoise;
      ctx.lineWidth = 2;
      for (let x = 0; x < width; x++) {
        const y = centerY + Math.sin(x * 0.015 + phase) * cfg.noiseAmp + Math.sin(x * 0.035 - phase * 0.8) * 14;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 2. Anti-Phase
    if (cfg.antiAmp > 0) {
      ctx.beginPath();
      ctx.strokeStyle = cfg.colorAnti;
      ctx.lineWidth = 2.5;
      for (let x = 0; x < width; x++) {
        const y = centerY - Math.sin(x * 0.015 + phase) * cfg.antiAmp - Math.sin(x * 0.035 - phase * 0.8) * (cfg.antiAmp / cfg.noiseAmp * 14);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 3. Result
    ctx.beginPath();
    ctx.strokeStyle = cfg.colorResult;
    ctx.lineWidth = currentMode === 'anc' ? 3 : 2.5;
    ctx.shadowColor = cfg.colorResult;
    ctx.shadowBlur = 10;
    for (let x = 0; x < width; x++) {
      const y = centerY + Math.sin(x * 0.015 + phase) * cfg.resultAmp + (Math.random() - 0.5) * (currentMode === 'anc' ? 1.5 : 0);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  draw();
}

/* ==========================================================================
   4. INTERAKTIVER ANC VORHER/NACHHER WIPE-SLIDER
   ========================================================================== */
function initAncWipeSlider() {
  const stage = document.getElementById('wipe-stage');
  const handle = document.getElementById('wipe-handle');
  const afterLayer = document.getElementById('wipe-layer-after');

  if (!stage || !handle || !afterLayer) return;

  let isWiping = false;

  function updateWipe(clientX) {
    const rect = stage.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(rect.width, relativeX));
    const percent = (clampedX / rect.width) * 100;

    handle.style.left = `${percent}%`;
    afterLayer.style.clipPath = `polygon(${percent}% 0, 100% 0, 100% 100%, ${percent}% 100%)`;
  }

  stage.addEventListener('pointerdown', (e) => {
    isWiping = true;
    stage.setPointerCapture(e.pointerId);
    updateWipe(e.clientX);
    playVolumeClick(800);
  });

  stage.addEventListener('pointermove', (e) => {
    if (!isWiping) return;
    updateWipe(e.clientX);
  });

  const stopWipe = (e) => {
    if (isWiping) {
      isWiping = false;
      try {
        stage.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  stage.addEventListener('pointerup', stopWipe);
  stage.addEventListener('pointercancel', stopWipe);
}

/* ==========================================================================
   5. INTERACTIVE STEM TOUCH SENSOR (WISCHEN ZUM LAUTER / LEISER)
   ========================================================================== */
function initStemTouchSensor() {
  const stemDragZone = document.getElementById('stem-drag-zone');
  const groove = document.getElementById('stem-groove');
  const thumb = document.getElementById('stem-thumb');
  const volValue = document.getElementById('vol-value');
  const volBarsContainer = document.getElementById('vol-bars');

  if (!stemDragZone || !groove || !thumb || !volBarsContainer) return;

  const totalBars = 20;
  volBarsContainer.innerHTML = '';
  for (let i = 0; i < totalBars; i++) {
    const bar = document.createElement('div');
    bar.classList.add('vol-bar');
    const heightPercent = 20 + (i / (totalBars - 1)) * 80;
    bar.style.height = `${heightPercent}%`;
    volBarsContainer.appendChild(bar);
  }

  let currentVolume = 75;
  let lastVolumeTick = 75;

  function updateVolumeUI(vol) {
    currentVolume = Math.max(0, Math.min(100, Math.round(vol)));
    if (volValue) volValue.textContent = `${currentVolume}%`;

    const thumbTopPercent = 100 - currentVolume;
    thumb.style.top = `${thumbTopPercent}%`;

    const activeCount = Math.round((currentVolume / 100) * totalBars);
    const bars = volBarsContainer.querySelectorAll('.vol-bar');
    bars.forEach((bar, index) => {
      if (index < activeCount) {
        bar.classList.add('active');
      } else {
        bar.classList.remove('active');
      }
    });

    // Audio click feedback on change of 4%
    if (Math.abs(currentVolume - lastVolumeTick) >= 4) {
      playVolumeClick(700 + currentVolume * 6);
      lastVolumeTick = currentVolume;
    }
  }

  updateVolumeUI(currentVolume);

  let isDraggingStem = false;

  function calculateVolumeFromPointer(e) {
    const rect = groove.getBoundingClientRect();
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : rect.top);
    const relativeY = clientY - rect.top;
    const clampedY = Math.max(0, Math.min(rect.height, relativeY));
    const vol = 100 - (clampedY / rect.height) * 100;
    updateVolumeUI(vol);
  }

  groove.addEventListener('pointerdown', (e) => {
    isDraggingStem = true;
    groove.setPointerCapture(e.pointerId);
    calculateVolumeFromPointer(e);
  });

  groove.addEventListener('pointermove', (e) => {
    if (!isDraggingStem) return;
    calculateVolumeFromPointer(e);
  });

  const stopDrag = (e) => {
    if (isDraggingStem) {
      isDraggingStem = false;
      try {
        groove.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  groove.addEventListener('pointerup', stopDrag);
  groove.addEventListener('pointercancel', stopDrag);
}

/* ==========================================================================
   6. NEU: INTERAKTIVER MAGSAFE CASE OPEN/CLOSE SIMULATOR
   ========================================================================== */
function initCaseSimulator() {
  const caseBox = document.getElementById('case-toggle-box');
  const toggleBtn = document.getElementById('btn-toggle-case');
  const closedImg = document.getElementById('case-closed-img');
  const openImg = document.getElementById('case-open-img');
  const statusText = document.getElementById('case-status-text');

  if (!caseBox || !toggleBtn || !closedImg || !openImg) return;

  let isOpen = false;

  function toggleCase() {
    isOpen = !isOpen;

    if (isOpen) {
      caseBox.classList.add('is-open');
      closedImg.classList.remove('active');
      openImg.classList.add('active');
      toggleBtn.innerHTML = 'Case Zuklappen ↙';
      if (statusText) statusText.textContent = 'Case Geöffnet · 100% Akku · AirPods Einsatzbereit';
      playCaseChime(true);
    } else {
      caseBox.classList.remove('is-open');
      openImg.classList.remove('active');
      closedImg.classList.add('active');
      toggleBtn.innerHTML = 'Case Aufklappen ↗';
      if (statusText) statusText.textContent = 'Case Geschlossen · 100% Akku';
      playCaseChime(false);
    }
  }

  caseBox.addEventListener('click', toggleCase);
  toggleBtn.addEventListener('click', toggleCase);
}

/* ==========================================================================
   7. PINNED HORIZONTAL CAROUSEL (GSAP SCROLLTRIGGER MIT ECHTEN BILDERN)
   ========================================================================== */
function initHorizontalScroll() {
  const horizontalSection = document.querySelector('.horizontal-scroll-section');
  const horizontalSticky = document.querySelector('.horizontal-sticky-wrapper');
  const track = document.getElementById('horizontal-track');

  if (!horizontalSection || !horizontalSticky || !track) return;

  function getScrollDistance() {
    return track.scrollWidth - window.innerWidth + 80;
  }

  gsap.to(track, {
    x: () => -getScrollDistance(),
    ease: "none",
    scrollTrigger: {
      trigger: horizontalSection,
      start: "top top",
      end: () => `+=${getScrollDistance()}`,
      scrub: 1.2,
      pin: horizontalSticky,
      invalidateOnRefresh: true,
    }
  });
}

/* ==========================================================================
   8. AWWWARDS PRELOADER & VORHANG-WIPE
   ========================================================================== */
function initPreloader() {
  const counterEl = document.querySelector('.counter-number');
  const preloader = document.getElementById('preloader');
  const curtain = document.querySelector('.preloader-curtain');
  if (!counterEl || !preloader) return;

  const counter = { val: 0 };
  gsap.to(counter, {
    val: 100,
    duration: 1.4,
    ease: 'power2.inOut',
    onUpdate: () => {
      const formatted = Math.floor(counter.val).toString().padStart(2, '0');
      counterEl.innerText = formatted;
    },
    onComplete: () => {
      const tl = gsap.timeline({
        onComplete: () => {
          preloader.style.display = 'none';
        }
      });

      tl.to(curtain, {
        y: '0%',
        duration: 0.45,
        ease: 'power3.in'
      })
      .to(preloader, {
        y: '-100%',
        duration: 0.65,
        ease: 'power4.inOut'
      })
      .from('.hero-headline .word-inner', {
        y: 60,
        opacity: 0,
        filter: 'blur(10px)',
        duration: 0.9,
        stagger: 0.05,
        ease: 'power3.out'
      }, '-=0.25')
      .from('#hero-pod-card', {
        scale: 0.88,
        opacity: 0,
        duration: 1.0,
        ease: 'power3.out'
      }, '<');
    }
  });
}

/* ==========================================================================
   9. SCROLL PROGRESS INDICATOR
   ========================================================================== */
function initScrollProgressBar() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  ScrollTrigger.create({
    start: 'top top',
    end: 'max',
    onUpdate: (self) => {
      bar.style.transform = `scaleX(${self.progress})`;
    }
  });
}

/* ==========================================================================
   10. SPLIT-TEXT CASCADE WORD REVEALS (PRESERVES BR & CLEAN KERNING)
   ========================================================================== */
function initTextReveal(selector = '.reveal-headline') {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    if (el.querySelector('.word-mask')) return;
    const rawHtml = el.innerHTML;
    const lines = rawHtml.split(/<br\s*[\/]?>/i);

    el.innerHTML = lines.map(line => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = line;
      const text = tempDiv.innerText.trim();
      const words = text.split(/\s+/).filter(Boolean);
      return words.map(w => `<span class="word-mask"><span class="word-inner">${w}&nbsp;</span></span>`).join('');
    }).join('<br>');

    const inners = el.querySelectorAll('.word-inner');
    if (el.classList.contains('hero-headline')) return;

    gsap.from(inners, {
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none'
      },
      y: 35,
      opacity: 0,
      filter: 'blur(8px)',
      duration: 0.8,
      stagger: 0.04,
      ease: 'power3.out'
    });
  });
}

/* ==========================================================================
   11. MAGNETIC CURSOR PULL (TACTILE MICRO-INTERACTION)
   ========================================================================== */
function initMagneticButtons(selector = '.magnet-btn') {
  const buttons = document.querySelectorAll(selector);
  buttons.forEach((btn) => {
    let bound = null;

    btn.addEventListener('mouseenter', () => {
      bound = btn.getBoundingClientRect();
      playHoverTick();
    });

    btn.addEventListener('mousemove', (e) => {
      if (!bound) bound = btn.getBoundingClientRect();
      const x = e.clientX - (bound.left + bound.width / 2);
      const y = e.clientY - (bound.top + bound.height / 2);

      gsap.to(btn, {
        x: x * 0.35,
        y: y * 0.35,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'elastic.out(1.2, 0.4)',
        overwrite: 'auto'
      });
      bound = null;
    });
  });
}

/* ==========================================================================
   12. 3D TILT PERSPECTIVE CARDS WITH CURSOR SPOTLIGHT
   ========================================================================== */
function init3DTiltAndSpotlight(selector = '[data-tilt], .tilt-card') {
  const cards = document.querySelectorAll(selector);
  cards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease-out';
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      const rotateX = ((y / rect.height) - 0.5) * -14;
      const rotateY = ((x / rect.width) - 0.5) * 14;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
    });
  });
}

/* ==========================================================================
   13. INTERACTIVE 3D SPATIAL AUDIO KLANGFELD (THREE.JS & GLSL SHADERS)
   ========================================================================== */
function initSpatial3DWebGL() {
  const container = document.getElementById('spatial-canvas-wrapper');
  const canvas = document.getElementById('spatial-webgl-canvas');
  const coordsEl = document.getElementById('spatial-coords');
  if (!container || !canvas || typeof THREE === 'undefined') return;

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.z = 4.8;

  // Renderer with retina pixel ratio clamp (60 FPS hygiene)
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Custom GLSL Simplex Noise Vertex & Fragment Shader
  const vertexShader = `
    uniform float uTime;
    uniform float uDistortion;
    uniform float uSpeed;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying float vNoise;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      vec4 j = p - 49.0 * floor(p * (1.0 / 49.0));
      vec4 x_ = floor(j * (1.0 / 7.0));
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * (2.0 / 7.0) + 0.5 / 7.0 - 1.0;
      vec4 y = y_ * (2.0 / 7.0) + 0.5 / 7.0 - 1.0;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vUv = uv;
      vNormal = normal;
      float noise = snoise(position * uDistortion + vec3(uTime * uSpeed));
      vNoise = noise;
      vec3 newPosition = position + normal * (noise * 0.28);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying float vNoise;

    void main() {
      vec3 viewDir = vec3(0.0, 0.0, 1.0);
      float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.8);
      vec3 baseColor = mix(uColorA, uColorB, vNoise * 0.5 + 0.5);
      vec3 finalColor = mix(baseColor, vec3(0.9, 1.0, 0.98), fresnel * 0.85);
      gl_FragColor = vec4(finalColor, 0.92);
    }
  `;

  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uDistortion: { value: 1.4 },
      uSpeed: { value: 0.35 },
      uColorA: { value: new THREE.Color(0x0a0c10) },
      uColorB: { value: new THREE.Color(0x00f5d4) }
    },
    transparent: true,
    wireframe: false
  });

  // Groups
  const outerGroup = new THREE.Group();
  const innerGroup = new THREE.Group();
  scene.add(outerGroup);
  outerGroup.add(innerGroup);

  // Acoustic Orb Geometry
  const geometry = new THREE.IcosahedronGeometry(1.4, 64);
  const soundOrb = new THREE.Mesh(geometry, shaderMaterial);
  innerGroup.add(soundOrb);

  // Holographic Wireframe Accent Shell
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x2997ff,
    wireframe: true,
    transparent: true,
    opacity: 0.12
  });
  const wireMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.48, 16), wireMaterial);
  innerGroup.add(wireMesh);

  // Orbiting Sound Particles
  const particleCount = 450;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const radius = 1.8 + Math.random() * 0.8;
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x00f5d4,
    size: 0.028,
    transparent: true,
    opacity: 0.55
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  innerGroup.add(particles);

  // Interactive 360 Drag & Head-Tracking
  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };
  let targetRotation = { x: 0, y: 0 };
  let currentRotation = { x: 0, y: 0 };

  container.addEventListener('pointerdown', (e) => {
    isDragging = true;
    prevMouse.x = e.clientX;
    prevMouse.y = e.clientY;
    container.setPointerCapture(e.pointerId);
  });

  container.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevMouse.x;
    const deltaY = e.clientY - prevMouse.y;
    prevMouse.x = e.clientX;
    prevMouse.y = e.clientY;

    targetRotation.y += deltaX * 0.008;
    targetRotation.x += deltaY * 0.008;
    targetRotation.x = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, targetRotation.x));

    const degY = (targetRotation.y * (180 / Math.PI)) % 360;
    const degX = targetRotation.x * (180 / Math.PI);
    if (coordsEl) {
      coordsEl.innerText = `AZIMUT: ${degY >= 0 ? '+' : ''}${degY.toFixed(1)}° · ELEVATION: ${degX >= 0 ? '+' : ''}${degX.toFixed(1)}°`;
    }
    playSpatialFrequency(degY, degX);
  });

  const stopDrag = (e) => {
    if (isDragging) {
      isDragging = false;
      try { container.releasePointerCapture(e.pointerId); } catch (err) {}
    }
  };
  container.addEventListener('pointerup', stopDrag);
  container.addEventListener('pointercancel', stopDrag);

  // Preset Buttons Reactivity
  const presetBtns = container.querySelectorAll('.spatial-preset-btn');
  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const preset = btn.dataset.preset;

      if (preset === 'spatial') {
        gsap.to(shaderMaterial.uniforms.uDistortion, { value: 1.4, duration: 0.8 });
        gsap.to(shaderMaterial.uniforms.uSpeed, { value: 0.35, duration: 0.8 });
        shaderMaterial.uniforms.uColorB.value.setHex(0x00f5d4);
        wireMaterial.color.setHex(0x2997ff);
        particleMat.color.setHex(0x00f5d4);
      } else if (preset === 'anc') {
        gsap.to(shaderMaterial.uniforms.uDistortion, { value: 0.3, duration: 0.8 });
        gsap.to(shaderMaterial.uniforms.uSpeed, { value: 0.1, duration: 0.8 });
        shaderMaterial.uniforms.uColorB.value.setHex(0x2997ff);
        wireMaterial.color.setHex(0x00f5d4);
        particleMat.color.setHex(0x2997ff);
      } else if (preset === 'transparency') {
        gsap.to(shaderMaterial.uniforms.uDistortion, { value: 2.2, duration: 0.8 });
        gsap.to(shaderMaterial.uniforms.uSpeed, { value: 0.65, duration: 0.8 });
        shaderMaterial.uniforms.uColorB.value.setHex(0x30d158);
        wireMaterial.color.setHex(0x30d158);
        particleMat.color.setHex(0x30d158);
      }
      playHoverTick();
    });
  });

  // Performance Hygiene: IntersectionObserver (Pauses loop when offscreen)
  let isVisible = true;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      isVisible = entry.isIntersecting;
    });
  }, { threshold: 0.1 });
  observer.observe(container);

  // Render Loop
  let lastTime = performance.now();
  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const now = performance.now();
    const delta = (now - lastTime) * 0.001;
    lastTime = now;

    shaderMaterial.uniforms.uTime.value += delta;

    // Smooth rotation interpolation (lerp)
    currentRotation.x += (targetRotation.x - currentRotation.x) * 0.1;
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.1;
    outerGroup.rotation.x = currentRotation.x;
    outerGroup.rotation.y = currentRotation.y;

    // Organic idle drift
    if (!isDragging) {
      targetRotation.y += delta * 0.18;
      const degY = (targetRotation.y * (180 / Math.PI)) % 360;
      const degX = targetRotation.x * (180 / Math.PI);
      if (coordsEl) {
        coordsEl.innerText = `AZIMUT: ${degY >= 0 ? '+' : ''}${degY.toFixed(1)}° · ELEVATION: ${degX >= 0 ? '+' : ''}${degX.toFixed(1)}°`;
      }
    }

    particles.rotation.y += delta * 0.06;
    renderer.render(scene, camera);
  }
  animate();

  // Responsive Resizing
  window.addEventListener('resize', () => {
    if (!container || !renderer || !camera) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}

/* ==========================================================================
   14. INTERACTIVE BUY ACTION
   ========================================================================== */
function initBuyButton() {
  const buyBtn = document.getElementById('btn-buy-now');
  if (!buyBtn) return;

  buyBtn.addEventListener('click', () => {
    const originalText = buyBtn.textContent;
    buyBtn.innerHTML = '✓ In den Einkaufswagen gelegt!';
    buyBtn.style.background = '#30d158';
    playCaseChime(true);

    setTimeout(() => {
      buyBtn.textContent = originalText;
      buyBtn.style.background = '';
    }, 2800);
  });
}

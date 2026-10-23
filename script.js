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
  initHeroParallaxAndScroll();
  initAcousticWaveform();
  initAncWipeSlider();
  initStemTouchSensor();
  initCaseSimulator();
  initHorizontalScroll();
  initReactBitsInteractions();
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
   8. REACT BITS PATTERNS (3D TILT, SPOTLIGHT & MAGNET BUTTONS)
   ========================================================================== */
function initReactBitsInteractions() {
  const tiltCards = document.querySelectorAll('.tilt-card');

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  const magnetBtns = document.querySelectorAll('.magnet-btn');

  magnetBtns.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);

      gsap.to(btn, {
        x: x * 0.32,
        y: y * 0.32,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.4)'
      });
    });
  });
}

/* ==========================================================================
   9. INTERACTIVE BUY ACTION
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

// JavaScript logic for 3 Pages, Heart Cursor, Virtual Trackpad, Evasive Buttons & Sticker Rain

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const heartCursor = document.getElementById('heartCursor');
  const touchZone = document.getElementById('touchZone');
  const touchRipple = document.getElementById('touchRipple');
  const trackpadClickBtn = document.getElementById('trackpadClickBtn');
  
  // Password Gate Elements
  const passwordOverlay = document.getElementById('passwordOverlay');
  const passBox = document.getElementById('passBox');
  const passInput = document.getElementById('passInput');
  const passMaskDisplay = document.getElementById('passMaskDisplay');
  const passError = document.getElementById('passError');
  const passSubmitBtn = document.getElementById('passSubmitBtn');

  // Welcome Card Elements
  const welcomeModal = document.getElementById('welcomeModal');
  const welcomeBox = document.getElementById('welcomeBox');

  const CORRECT_PASS = 'sizi_sevaman';

  // Render heart icons for password input characters
  if (passInput) {
    passInput.addEventListener('input', () => {
      const len = passInput.value.length;
      passError.classList.add('hidden');
      passBox.classList.remove('animate-shake');

      if (len === 0) {
        passMaskDisplay.innerHTML = '<span id="passPlaceholder" class="text-xs text-gray-400 font-normal">Parolni kiriting...</span>';
      } else {
        let heartsHtml = '';
        for (let i = 0; i < len; i++) {
          heartsHtml += '<span class="text-rose-500 animate-pulse text-base">❤️</span>';
        }
        passMaskDisplay.innerHTML = heartsHtml;
      }
    });

    passSubmitBtn.addEventListener('click', checkPassword);
    passInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') checkPassword();
    });
  }

  function checkPassword() {
    const val = passInput.value.trim();
    if (val === CORRECT_PASS) {
      // Correct Password -> Hide Gate Overlay
      passwordOverlay.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => passwordOverlay.classList.add('hidden'), 300);

      // Show Welcome Card Modal
      welcomeModal.classList.remove('opacity-0', 'pointer-events-none');
      welcomeBox.classList.remove('scale-90');
      welcomeBox.classList.add('scale-100');

      // Heart Explosion
      triggerExplosion();
    } else {
      // Incorrect Password -> Show Error & Shake Box
      passError.classList.remove('hidden');
      passBox.classList.remove('animate-shake');
      void passBox.offsetWidth; // force reflow for animation restart
      passBox.classList.add('animate-shake');
      passInput.value = '';
      passMaskDisplay.innerHTML = '<span id="passPlaceholder" class="text-xs text-gray-400 font-normal">Parolni kiriting...</span>';
    }
  }

  // Dismiss Welcome Modal when clicking/tapping anywhere on screen
  function dismissWelcomeModal() {
    if (!welcomeModal.classList.contains('opacity-0')) {
      welcomeModal.classList.add('opacity-0', 'pointer-events-none');
      welcomeBox.classList.remove('scale-100');
      welcomeBox.classList.add('scale-90');
      setTimeout(() => welcomeModal.classList.add('hidden'), 300);

      // Auto start music on enter
      bgMusic.play().then(() => {
        isPlayingMusic = true;
        musicBtn.classList.add('bg-rose-500', 'text-white');
        musicBtn.classList.remove('bg-white/70', 'text-rose-600');
      }).catch(() => {});
    }
  }

  if (welcomeModal) {
    welcomeModal.addEventListener('click', dismissWelcomeModal);
    welcomeModal.addEventListener('touchstart', dismissWelcomeModal);
  }

  // Page 1 Elements
  const page1 = document.getElementById('page1');
  const btnYes1 = document.getElementById('btnYes1');
  const btnNo1 = document.getElementById('btnNo1');
  const okModal1 = document.getElementById('okModal1');
  const modalBox1 = document.getElementById('modalBox1');
  const modalOkBtn1 = document.getElementById('modalOkBtn1');
  
  // Page 2 Elements
  const page2 = document.getElementById('page2');
  const btnYes2 = document.getElementById('btnYes2');
  const btnNo2 = document.getElementById('btnNo2');
  const okModal2 = document.getElementById('okModal2');
  const modalBox2 = document.getElementById('modalBox2');
  const modalOkBtn2 = document.getElementById('modalOkBtn2');

  // Page 3 Elements
  const page3 = document.getElementById('page3');
  const stickerRain = document.getElementById('stickerRain');
  
  // Audio & Music
  const musicBtn = document.getElementById('musicBtn');
  const bgMusic = document.getElementById('bgMusic');

  // Virtual Heart Cursor Position State
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 3;

  function updateCursorPosition(x, y) {
    // Keep cursor within window bounds
    cursorX = Math.max(10, Math.min(window.innerWidth - 10, x));
    cursorY = Math.max(10, Math.min(window.innerHeight - 10, y));

    heartCursor.style.left = `${cursorX}px`;
    heartCursor.style.top = `${cursorY}px`;

    // Check distance to active runaway button
    checkRunawayButtons();
  }

  // Set initial position
  updateCursorPosition(cursorX, cursorY);

  // ----------------------------------------------------
  // VIRTUAL TRACKPAD CONTROLLER (Laptop Touchpad Logic)
  // ----------------------------------------------------
  let lastTouchX = 0;
  let lastTouchY = 0;
  let isTouchingPad = false;
  let tapStartTime = 0;

  function handlePadStart(clientX, clientY) {
    isTouchingPad = true;
    lastTouchX = clientX;
    lastTouchY = clientY;
    tapStartTime = Date.now();

    // Show touch ripple visual on pad
    const rect = touchZone.getBoundingClientRect();
    touchRipple.style.left = `${clientX - rect.left}px`;
    touchRipple.style.top = `${clientY - rect.top}px`;
    touchRipple.style.opacity = '1';
  }

  function handlePadMove(clientX, clientY) {
    if (!isTouchingPad) return;
    
    // Calculate delta movement on trackpad
    const deltaX = clientX - lastTouchX;
    const deltaY = clientY - lastTouchY;

    lastTouchX = clientX;
    lastTouchY = clientY;

    // Apply sensitivity factor (1.8x speed)
    const sensitivity = 1.8;
    updateCursorPosition(cursorX + deltaX * sensitivity, cursorY + deltaY * sensitivity);

    // Update touch ripple position
    const rect = touchZone.getBoundingClientRect();
    touchRipple.style.left = `${clientX - rect.left}px`;
    touchRipple.style.top = `${clientY - rect.top}px`;
  }

  function handlePadEnd() {
    isTouchingPad = false;
    touchRipple.style.opacity = '0';

    // If tap was quick (less than 200ms) without much movement, trigger click!
    const tapDuration = Date.now() - tapStartTime;
    if (tapDuration < 200) {
      triggerHeartClick();
    }
  }

  // Touch Events on TouchZone
  touchZone.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handlePadStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });

  touchZone.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handlePadMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });

  touchZone.addEventListener('touchend', (e) => {
    e.preventDefault();
    handlePadEnd();
  }, { passive: false });

  // Mouse fallback for trackpad on Desktop
  let isMouseDown = false;
  touchZone.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    handlePadStart(e.clientX, e.clientY);
  });

  window.addEventListener('mousemove', (e) => {
    if (isMouseDown) {
      handlePadMove(e.clientX, e.clientY);
    }
  });

  window.addEventListener('mouseup', () => {
    if (isMouseDown) {
      isMouseDown = false;
      handlePadEnd();
    }
  });

  // Direct Screen Touch / Pointer Sync
  window.addEventListener('pointermove', (e) => {
    if (!isTouchingPad && !isMouseDown && e.pointerType === 'mouse') {
      updateCursorPosition(e.clientX, e.clientY);
    }
  });

  // ----------------------------------------------------
  // TRIGGER CLICK AT HEART CURSOR LOCATION
  // ----------------------------------------------------
  function triggerHeartClick() {
    createClickHeartBurst(cursorX, cursorY);

    heartCursor.style.display = 'none';
    const targetElement = document.elementFromPoint(cursorX, cursorY);
    heartCursor.style.display = 'block';

    if (targetElement) {
      const clickable = targetElement.closest('button, .gift-card, a');
      if (clickable) {
        clickable.click();
      }
    }
  }

  trackpadClickBtn.addEventListener('click', () => {
    triggerHeartClick();
  });

  // ----------------------------------------------------
  // EVASIVE RUNAWAY BUTTONS ALGORITHM (Page 1 & Page 2)
  // ----------------------------------------------------
  let isEvasiveFixed1 = false;
  let isEvasiveFixed2 = false;

  function checkRunawayButtons() {
    // Page 1 runaway button check
    if (!page1.classList.contains('hidden')) {
      checkButtonProximity(btnNo1, () => runawayButton(btnNo1, 1));
    }
    // Page 2 runaway button check
    if (!page2.classList.contains('hidden')) {
      checkButtonProximity(btnNo2, () => runawayButton(btnNo2, 2));
    }
  }

  function checkButtonProximity(btnElem, runawayCallback) {
    if (!btnElem) return;
    const btnRect = btnElem.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;

    const dist = Math.hypot(cursorX - btnCenterX, cursorY - btnCenterY);

    if (dist < 110) {
      runawayCallback();
    }
  }

  function runawayButton(btnElem, pageNum) {
    if (pageNum === 1 && !isEvasiveFixed1) {
      btnElem.style.position = 'fixed';
      btnElem.style.zIndex = '35';
      isEvasiveFixed1 = true;
    } else if (pageNum === 2 && !isEvasiveFixed2) {
      btnElem.style.position = 'fixed';
      btnElem.style.zIndex = '35';
      isEvasiveFixed2 = true;
    }

    const padding = 15;
    const btnW = btnElem.offsetWidth || 130;
    const btnH = btnElem.offsetHeight || 40;

    // Dynamically calculate trackpad top boundary on any device (Samsung A16, etc.)
    const trackpadElem = document.getElementById('trackpad');
    const trackpadTop = trackpadElem ? trackpadElem.getBoundingClientRect().top : (window.innerHeight - 160);

    const minX = padding;
    const maxX = Math.max(minX + 10, window.innerWidth - btnW - padding);
    const minY = 60;
    const maxY = Math.max(minY + 20, trackpadTop - btnH - 15); // Safely stays above trackpad on any device

    let randomX = Math.random() * (maxX - minX) + minX;
    let randomY = Math.random() * (maxY - minY) + minY;

    let attempts = 0;
    while (Math.hypot(cursorX - (randomX + btnW / 2), cursorY - (randomY + btnH / 2)) < 130 && attempts < 10) {
      randomX = Math.random() * (maxX - minX) + minX;
      randomY = Math.random() * (maxY - minY) + minY;
      attempts++;
    }

    btnElem.style.left = `${randomX}px`;
    btnElem.style.top = `${randomY}px`;
    btnElem.style.transform = `rotate(${(Math.random() - 0.5) * 30}deg) scale(1.05)`;

    createMiniHeart(randomX + btnW / 2, randomY + btnH / 2);
  }

  // Event Listeners for Page 1 Runaway Button
  btnNo1.addEventListener('mouseenter', () => runawayButton(btnNo1, 1));
  btnNo1.addEventListener('pointermove', () => runawayButton(btnNo1, 1));
  btnNo1.addEventListener('touchstart', (e) => {
    e.preventDefault();
    runawayButton(btnNo1, 1);
  });

  // Event Listeners for Page 2 Runaway Button
  btnNo2.addEventListener('mouseenter', () => runawayButton(btnNo2, 2));
  btnNo2.addEventListener('pointermove', () => runawayButton(btnNo2, 2));
  btnNo2.addEventListener('touchstart', (e) => {
    e.preventDefault();
    runawayButton(btnNo2, 2);
  });

  // ----------------------------------------------------
  // PAGE 1: TARGET BUTTON -> MODAL 1 -> PAGE 2
  // ----------------------------------------------------
  btnYes1.addEventListener('click', () => {
    okModal1.classList.remove('opacity-0', 'pointer-events-none');
    modalBox1.classList.remove('scale-90');
    modalBox1.classList.add('scale-100');

    triggerExplosion();
  });

  modalOkBtn1.addEventListener('click', () => {
    okModal1.classList.add('opacity-0', 'pointer-events-none');
    modalBox1.classList.remove('scale-100');
    modalBox1.classList.add('scale-90');

    // Switch from Page 1 to Page 2
    page1.classList.add('hidden');
    page2.classList.remove('hidden');
    page2.classList.add('flex');
  });

  // ----------------------------------------------------
  // PAGE 2: TARGET BUTTON -> MODAL 2 -> PAGE 3
  // ----------------------------------------------------
  btnYes2.addEventListener('click', () => {
    okModal2.classList.remove('opacity-0', 'pointer-events-none');
    modalBox2.classList.remove('scale-90');
    modalBox2.classList.add('scale-100');

    triggerExplosion();
  });

  modalOkBtn2.addEventListener('click', () => {
    okModal2.classList.add('opacity-0', 'pointer-events-none');
    modalBox2.classList.remove('scale-100');
    modalBox2.classList.add('scale-90');

    // Switch from Page 2 to Page 3
    page2.classList.add('hidden');
    page2.classList.remove('flex');
    page3.classList.remove('hidden');
    page3.classList.add('flex');

    // Start Love Sticker Rain on Page 3!
    startStickerRain();
  });

  function triggerExplosion() {
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        createClickHeartBurst(
          window.innerWidth / 2 + (Math.random() - 0.5) * 200,
          window.innerHeight / 3 + (Math.random() - 0.5) * 200
        );
      }, i * 40);
    }
  }

  // ----------------------------------------------------
  // PAGE 3: LOVE STICKER RAIN ENGINE
  // ----------------------------------------------------
  const loveStickers = ['💖', '💕', '❤️', '🌸', '✨', '🥰', '👑', '😻', '🌹', '💗'];

  function startStickerRain() {
    stickerRain.classList.remove('hidden');
    
    // Generate falling stickers every 300ms
    setInterval(() => {
      if (page3.classList.contains('hidden')) return;

      const sticker = document.createElement('div');
      sticker.className = 'falling-sticker';
      sticker.innerHTML = loveStickers[Math.floor(Math.random() * loveStickers.length)];
      
      const startX = Math.random() * window.innerWidth;
      const duration = Math.random() * 3 + 2.5; // 2.5s to 5.5s
      const size = Math.random() * 20 + 18; // 18px to 38px

      sticker.style.left = `${startX}px`;
      sticker.style.animationDuration = `${duration}s`;
      sticker.style.fontSize = `${size}px`;

      stickerRain.appendChild(sticker);

      // Clean up after animation finishes
      setTimeout(() => {
        sticker.remove();
      }, duration * 1000);
    }, 250);
  }

  // ----------------------------------------------------
  // BACKGROUND FLOATING HEARTS ANIMATION CANVAS
  // ----------------------------------------------------
  const canvas = document.getElementById('heartCanvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const particles = [];
  class HeartParticle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + 20;
      this.size = Math.random() * 14 + 10;
      this.speedY = Math.random() * 1.5 + 0.8;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.opacity = Math.random() * 0.5 + 0.3;
      this.rotation = Math.random() * Math.PI * 2;
    }
    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      if (this.y < -30) this.reset();
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;
      ctx.font = `${this.size}px serif`;
      ctx.fillText('💖', 0, 0);
      ctx.restore();
    }
  }

  for (let i = 0; i < 20; i++) {
    particles.push(new HeartParticle());
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateCanvas);
  }
  animateCanvas();

  // Helper functions for particles
  function createClickHeartBurst(x, y) {
    for (let i = 0; i < 6; i++) {
      const heart = document.createElement('div');
      heart.innerHTML = '❤️';
      heart.className = 'fixed text-xl pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out';
      heart.style.left = `${x}px`;
      heart.style.top = `${y}px`;
      document.body.appendChild(heart);

      const angle = (i / 6) * Math.PI * 2;
      const distance = Math.random() * 40 + 30;

      setTimeout(() => {
        heart.style.left = `${x + Math.cos(angle) * distance}px`;
        heart.style.top = `${y + Math.sin(angle) * distance}px`;
        heart.style.opacity = '0';
        heart.style.transform = 'translate(-50%, -50%) scale(1.5)';
      }, 20);

      setTimeout(() => heart.remove(), 750);
    }
  }

  function createMiniHeart(x, y) {
    const mini = document.createElement('div');
    mini.innerHTML = '✨';
    mini.className = 'fixed text-sm pointer-events-none z-40 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500';
    mini.style.left = `${x}px`;
    mini.style.top = `${y}px`;
    document.body.appendChild(mini);

    setTimeout(() => {
      mini.style.top = `${y - 25}px`;
      mini.style.opacity = '0';
    }, 20);

    setTimeout(() => mini.remove(), 550);
  }

  // ----------------------------------------------------
  // MUSIC TOGGLE
  // ----------------------------------------------------
  let isPlayingMusic = false;
  musicBtn.addEventListener('click', () => {
    if (!isPlayingMusic) {
      bgMusic.play().then(() => {
        isPlayingMusic = true;
        musicBtn.classList.add('bg-rose-500', 'text-white');
        musicBtn.classList.remove('bg-white/70', 'text-rose-600');
      }).catch(err => {
        console.log("Audio play blocked", err);
      });
    } else {
      bgMusic.pause();
      isPlayingMusic = false;
      musicBtn.classList.remove('bg-rose-500', 'text-white');
      musicBtn.classList.add('bg-white/70', 'text-rose-600');
    }
  });

});

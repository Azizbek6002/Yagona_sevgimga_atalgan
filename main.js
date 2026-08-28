// JavaScript logic for Heart Cursor, Virtual Trackpad, and Evasive Button

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const heartCursor = document.getElementById('heartCursor');
  const touchZone = document.getElementById('touchZone');
  const touchRipple = document.getElementById('touchRipple');
  const trackpadClickBtn = document.getElementById('trackpadClickBtn');
  
  const btnYes = document.getElementById('btnYes');
  const btnNo = document.getElementById('btnNo');
  
  const okModal = document.getElementById('okModal');
  const modalBox = document.getElementById('modalBox');
  const modalOkBtn = document.getElementById('modalOkBtn');
  
  const page1 = document.getElementById('page1');
  const page2 = document.getElementById('page2');
  const btnBack = document.getElementById('btnBack');
  
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

    // Check distance to runaway button
    checkRunawayButton();
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

  // Direct Screen Touch / Pointer Sync (so touching anywhere also moves cursor if desired)
  window.addEventListener('pointermove', (e) => {
    // If not dragging trackpad, sync cursor slightly to mouse pointer on desktop
    if (!isTouchingPad && !isMouseDown && e.pointerType === 'mouse') {
      updateCursorPosition(e.clientX, e.clientY);
    }
  });

  // ----------------------------------------------------
  // TRIGGER CLICK AT HEART CURSOR LOCATION
  // ----------------------------------------------------
  function triggerHeartClick() {
    // Spawn heart ripple effect at cursor position
    createClickHeartBurst(cursorX, cursorY);

    // Hide cursor temporarily to elementFromPoint target
    heartCursor.style.display = 'none';
    const targetElement = document.elementFromPoint(cursorX, cursorY);
    heartCursor.style.display = 'block';

    if (targetElement) {
      // Find closest button or clickable element
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
  // EVASIVE RUNAWAY "menham" BUTTON ALGORITHM
  // ----------------------------------------------------
  let isEvasiveFixed = false;

  function checkRunawayButton() {
    if (page1.classList.contains('hidden')) return;

    const btnRect = btnNo.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;

    const dist = Math.hypot(cursorX - btnCenterX, cursorY - btnCenterY);

    // Proximity threshold (110px) - flees when heart cursor gets close
    if (dist < 110) {
      runawayButton();
    }
  }

  function runawayButton() {
    if (!isEvasiveFixed) {
      btnNo.style.position = 'fixed';
      btnNo.style.zIndex = '35';
      isEvasiveFixed = true;
    }

    // Available screen boundaries (leave space for header & trackpad at bottom)
    const padding = 25;
    const btnW = btnNo.offsetWidth || 120;
    const btnH = btnNo.offsetHeight || 45;

    const minX = padding;
    const maxX = Math.max(minX + 20, window.innerWidth - btnW - padding);
    const minY = 70;
    const maxY = Math.max(minY + 20, window.innerHeight - btnH - 180); // keep above trackpad area

    let randomX = Math.random() * (maxX - minX) + minX;
    let randomY = Math.random() * (maxY - minY) + minY;

    // Make sure new spot is at least 150px away from heart cursor so it feels like a real escape
    let attempts = 0;
    while (Math.hypot(cursorX - (randomX + btnW / 2), cursorY - (randomY + btnH / 2)) < 150 && attempts < 10) {
      randomX = Math.random() * (maxX - minX) + minX;
      randomY = Math.random() * (maxY - minY) + minY;
      attempts++;
    }

    btnNo.style.left = `${randomX}px`;
    btnNo.style.top = `${randomY}px`;
    btnNo.style.transform = `rotate(${(Math.random() - 0.5) * 30}deg) scale(1.05)`;

    // Sparkle effect
    createMiniHeart(randomX + btnW / 2, randomY + btnH / 2);
  }

  function btnRectCenter(elem) {
    const rect = elem.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  // Also trigger runaway if hovered or touched directly
  btnNo.addEventListener('mouseenter', runawayButton);
  btnNo.addEventListener('pointermove', runawayButton);
  btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    runawayButton();
  });

  // ----------------------------------------------------
  // "menham sizi juda yaxshi ko'raman" YES BUTTON & MODAL
  // ----------------------------------------------------
  btnYes.addEventListener('click', () => {
    // Show OK Modal
    okModal.classList.remove('opacity-0', 'pointer-events-none');
    modalBox.classList.remove('scale-90');
    modalBox.classList.add('scale-100');

    // Confetti Heart Explosion
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        createClickHeartBurst(
          window.innerWidth / 2 + (Math.random() - 0.5) * 200,
          window.innerHeight / 3 + (Math.random() - 0.5) * 200
        );
      }, i * 40);
    }
  });

  // MODAL OK BUTTON CLICK -> TRANSITION TO PAGE 2
  modalOkBtn.addEventListener('click', () => {
    // Hide Modal
    okModal.classList.add('opacity-0', 'pointer-events-none');
    modalBox.classList.remove('scale-100');
    modalBox.classList.add('scale-90');

    // Transition Pages
    page1.classList.add('hidden');
    page2.classList.remove('hidden');
    page2.classList.add('flex');
  });

  // PAGE 2 BACK BUTTON
  btnBack.addEventListener('click', () => {
    page2.classList.add('hidden');
    page2.classList.remove('flex');
    page1.classList.remove('hidden');

    // Reset runaway button position
    btnNo.style.position = 'relative';
    btnNo.style.left = 'auto';
    btnNo.style.top = 'auto';
    btnNo.style.transform = 'none';
    isEvasiveFixed = false;
  });

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

  // Helper function for click heart burst
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

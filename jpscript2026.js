// ===== LOADER ANIMATION =====
(function () {
  const loader       = document.getElementById('loader');
  const canvas       = document.getElementById('loader-canvas');
  const core         = document.getElementById('loader-core');
  const flash        = document.getElementById('loader-flash');
  const enterScreen  = document.getElementById('enter-screen');
  const enterBtn     = document.getElementById('enter-btn');
  const ctx          = canvas.getContext('2d');

  // ===== SOUNDS =====
  const crackleSound = new Audio('crackle.mp3');
  crackleSound.volume = 0.5;
  crackleSound.loop = true;

  const thunderSound = new Audio('thunder.mp3');
  thunderSound.volume = 0.9;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const W = () => canvas.width;
  const H = () => canvas.height;
  const CX = () => canvas.width / 2;
  const CY = () => canvas.height / 2;

  // ---- skill dots (used for lightning targets even before visible) ----
  const skillIcons = [
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dart/dart-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/spring/spring-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angularjs/angularjs-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flutter/flutter-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/django/django-plain.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kubernetes/kubernetes-plain.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jenkins/jenkins-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg',
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azuresqldatabase/azuresqldatabase-plain.svg',
  ];

  const skillDefs = [
    {ring:1,angle:0},   {ring:1,angle:90},  {ring:1,angle:180}, {ring:1,angle:270},
    {ring:2,angle:0},   {ring:2,angle:51},  {ring:2,angle:102}, {ring:2,angle:153},
    {ring:2,angle:204}, {ring:2,angle:255}, {ring:2,angle:306},
    {ring:3,angle:0},   {ring:3,angle:40},  {ring:3,angle:80},  {ring:3,angle:120},
    {ring:3,angle:160}, {ring:3,angle:200}, {ring:3,angle:240}, {ring:3,angle:280}, {ring:3,angle:320},
  ];

  const radii  = {1:Math.min(window.innerWidth, window.innerHeight)*0.18,
                  2:Math.min(window.innerWidth, window.innerHeight)*0.28,
                  3:Math.min(window.innerWidth, window.innerHeight)*0.40};
  const speeds = {1:12000, 2:20000, 3:28000};
  const dirs   = {1:1, 2:-1, 3:1};

  // Dot elements
  const dots = [];
  const dotPositions = skillDefs.map(() => ({x: CX(), y: CY()}));
  let dotsVisible = false;

  skillDefs.forEach((sd, idx) => {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed; width:48px; height:48px; border-radius:50%;
      background:#1c1c1c; border:1px solid rgba(192,57,43,0.35);
      display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px;
      z-index:10000; opacity:0; transition:opacity 0.5s ease; pointer-events:none;
    `;
    const img = document.createElement('img');
    img.src = skillIcons[idx];
    img.style.cssText = 'width:22px;height:22px;object-fit:contain;';
    el.appendChild(img);
    document.body.appendChild(el);
    dots.push(el);
  });

  // Craters
  const craters = Array.from({length: 9}, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: 14 + Math.random() * 26,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    rot: Math.random() * Math.PI * 2,
    vrot: (Math.random() - 0.5) * 0.004,
    alpha: 0,
    targetAlpha: 0.12 + Math.random() * 0.18,
    rings: 2 + Math.floor(Math.random() * 2),
    color: Math.random() > 0.5 ? '#c0392b' : '#555'
  }));

  function drawCrater(c) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    ctx.globalAlpha = c.alpha;
    for (let i = 0; i < c.rings; i++) {
      const rr = c.r * (1 - i * 0.28);
      ctx.beginPath();
      ctx.ellipse(0, 0, rr, rr * 0.42, 0, 0, Math.PI * 2);
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 0.7 - i * 0.15;
      ctx.shadowBlur = 6;
      ctx.shadowColor = c.color;
      ctx.stroke();
    }
    for (let d = 0; d < 5; d++) {
      const ang = (d / 5) * Math.PI * 2;
      const dr = c.r * 0.65;
      ctx.beginPath();
      ctx.arc(Math.cos(ang) * dr, Math.sin(ang) * dr * 0.42, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = c.color;
      ctx.globalAlpha = c.alpha * 0.7;
      ctx.fill();
    }
    ctx.restore();
  }

  // Lightning
  function lightningBolt(x1, y1, x2, y2, segs, spread) {
    const pts = [{x: x1, y: y1}];
    for (let i = 1; i < segs; i++) {
      const t = i / segs;
      pts.push({
        x: x1 + (x2 - x1) * t + (Math.random() - 0.5) * spread,
        y: y1 + (y2 - y1) * t + (Math.random() - 0.5) * spread
      });
    }
    pts.push({x: x2, y: y2});
    return pts;
  }

  function drawBolt(pts, alpha, color, width) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.shadowBlur = 14;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.restore();
  }

  // Random screen lightning (phase 1 — before dots appear)
  function randomScreenBolt() {
    const x1 = Math.random() * W(), y1 = 0;
    const x2 = x1 + (Math.random() - 0.5) * 300, y2 = H();
    return {
      pts: lightningBolt(x1, y1, x2, y2, 14, 60),
      alpha: 0.8 + Math.random() * 0.2,
      color: ['#c0392b', '#e74c3c', '#f5c518', '#3498db'][Math.floor(Math.random() * 4)],
      life: 0,
      maxLife: 12 + Math.floor(Math.random() * 10)
    };
  }

  // Dot-to-dot lightning (phase 2)
  function dotBolt() {
    const a = Math.floor(Math.random() * dotPositions.length);
    let b = Math.floor(Math.random() * dotPositions.length);
    while (b === a) b = Math.floor(Math.random() * dotPositions.length);
    const pa = dotPositions[a], pb = dotPositions[b];
    const dist = Math.hypot(pb.x - pa.x, pb.y - pa.y);
    if (dist < 60 || dist > W() * 0.6) return null;
    return {
      pts: lightningBolt(pa.x, pa.y, pb.x, pb.y, 10, 22),
      alpha: 0.9,
      color: ['#c0392b', '#e74c3c', '#f5c518', '#3498db', '#9b59b6'][Math.floor(Math.random() * 5)],
      life: 0,
      maxLife: 18 + Math.floor(Math.random() * 14)
    };
  }

  const activeBolts = [];
  let lastBolt = 0;
  let phase = 1; // 1=lightning only, 2=everything, 3=flash, 4=fadeout
  let phaseStart = performance.now();
  let animStart = null;

  // TIMELINE (ms):
  // 0       → phase 1: lightning only
  // 1200    → phase 2: dots + craters + JP core appear
  // 5000    → phase 3: yellow flash
  // 5300    → phase 4: loader fades out
  // 6300    → loader hidden, page shown

  function tick(ts) {
    if (!animStart) animStart = ts;
    const elapsed = ts - animStart;

    ctx.clearRect(0, 0, W(), H());

    // Phase transitions
    if (phase === 1 && elapsed > 1200) {
      phase = 2;
      phaseStart = ts;
      // Show dots and craters
      dots.forEach(d => { d.style.opacity = '1'; });
      core.classList.add('visible');
      craters.forEach(c => { c.targetAlpha = 0.12 + Math.random() * 0.18; });
    }

    if (phase === 2 && elapsed > 3000) {
      phase = 3;
      phaseStart = ts;
      crackleSound.pause();
      crackleSound.currentTime = 0;
      thunderSound.play().catch(() => {});
      triggerThunder();
    }

    if (phase === 3 && elapsed > 5300) {
      phase = 4;
      loader.classList.add('fade-out');
      dots.forEach(d => { d.style.opacity = '0'; });
    }

  // ---- THUNDER BOLT FUNCTION ----
  function triggerThunder() {
    const tc = document.getElementById('loader-thunder');
    const tctx = tc.getContext('2d');
    tc.width = window.innerWidth;
    tc.height = window.innerHeight;

    function jagged(x1, y1, x2, y2, segs, spread) {
      const pts = [{x: x1, y: y1}];
      for (let i = 1; i < segs; i++) {
        const t = i / segs;
        pts.push({
          x: x1 + (x2 - x1) * t + (Math.random() - 0.5) * spread,
          y: y1 + (y2 - y1) * t + (Math.random() - 0.5) * spread * 0.3
        });
      }
      pts.push({x: x2, y: y2});
      return pts;
    }

    function drawTBolt(pts, alpha, color, width, glow) {
      tctx.save();
      tctx.globalAlpha = alpha;
      tctx.strokeStyle = color;
      tctx.lineWidth = width;
      tctx.shadowBlur = glow;
      tctx.shadowColor = color;
      tctx.lineCap = 'round';
      tctx.lineJoin = 'round';
      tctx.beginPath();
      tctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) tctx.lineTo(pts[i].x, pts[i].y);
      tctx.stroke();
      tctx.restore();
    }

    const W = tc.width, H = tc.height;
    const bolts = [
      { pts: jagged(W*0.15, 0, W*0.25, H, 20, 80), alpha: 1 },
      { pts: jagged(W*0.42, 0, W*0.38, H, 22, 70), alpha: 1 },
      { pts: jagged(W*0.70, 0, W*0.78, H, 18, 90), alpha: 1 },
      { pts: jagged(W*0.88, 0, W*0.82, H, 16, 60), alpha: 0.7 },
      { pts: jagged(W*0.05, 0, W*0.12, H*0.7, 12, 50), alpha: 0.5 },
    ];

    function branch(pts, startIdx, spread) {
      const start = pts[startIdx];
      const end = {
        x: start.x + (Math.random() - 0.5) * spread * 2,
        y: start.y + Math.random() * spread * 1.5
      };
      return jagged(start.x, start.y, end.x, end.y, 6, spread * 0.3);
    }

    const branches  = bolts.map(b => branch(b.pts, Math.floor(b.pts.length * 0.3), 60));
    const branches2 = bolts.map(b => branch(b.pts, Math.floor(b.pts.length * 0.6), 40));

    let tframe = 0;
    const totalFrames = 36;

    // Flash overlay flicker
    flash.style.transition = 'none';
    flash.style.opacity = '0';

    function thunderFrame() {
      tctx.clearRect(0, 0, W, H);
      tframe++;

      if (tframe === 1)  { flash.style.cssText += ';transition:opacity 0.05s;opacity:0.9'; }
      if (tframe === 4)  { flash.style.cssText += ';transition:opacity 0.1s;opacity:0.2'; }
      if (tframe === 8)  { flash.style.cssText += ';transition:opacity 0.05s;opacity:0.7'; }
      if (tframe === 12) { flash.style.cssText += ';transition:opacity 0.3s;opacity:0'; }

      const alpha = Math.max(0, 1 - (tframe / totalFrames) * 1.2);

      bolts.forEach((b, i) => {
        drawTBolt(b.pts, alpha * b.alpha * 0.2, '#fff9c4', 12, 40);
        drawTBolt(b.pts, alpha * b.alpha * 0.5, '#f5c518', 5,  25);
        drawTBolt(b.pts, alpha * b.alpha,        '#ffffff', 1.5, 8);
        drawTBolt(branches[i],  alpha * b.alpha * 0.6, '#f5c518', 2,   15);
        drawTBolt(branches2[i], alpha * b.alpha * 0.4, '#f5c518', 1.5, 10);
      });

      if (tframe < totalFrames) {
        requestAnimationFrame(thunderFrame);
      } else {
        tctx.clearRect(0, 0, W, H);
        flash.style.opacity = '0';
      }
    }

    requestAnimationFrame(thunderFrame);
  }

    if (phase === 4 && elapsed > 6300) {
      loader.classList.add('hidden');
      dots.forEach(d => d.remove());
      return; // stop animation
    }

    // Draw craters
    craters.forEach(c => {
      if (phase >= 2) {
        c.alpha += (c.targetAlpha - c.alpha) * 0.04;
        c.x += c.vx; c.y += c.vy; c.rot += c.vrot;
        if (c.x < -50) c.x = W() + 50;
        if (c.x > W() + 50) c.x = -50;
        if (c.y < -50) c.y = H() + 50;
        if (c.y > H() + 50) c.y = -50;
      }
      drawCrater(c);
    });

    // Spawn lightning
    if (ts - lastBolt > 200 + Math.random() * 300) {
      if (phase === 1) {
        activeBolts.push(randomScreenBolt());
        if (Math.random() > 0.4) activeBolts.push(randomScreenBolt());
      } else if (phase === 2) {
        const b = dotBolt();
        if (b) activeBolts.push(b);
        if (Math.random() > 0.5) {
          const b2 = dotBolt();
          if (b2) activeBolts.push(b2);
        }
      }
      lastBolt = ts;
    }

    // Draw bolts
    for (let i = activeBolts.length - 1; i >= 0; i--) {
      const b = activeBolts[i];
      b.life++;
      const alpha = b.alpha * (1 - b.life / b.maxLife);
      drawBolt(b.pts, alpha * 0.35, b.color, 3);
      drawBolt(b.pts, alpha, b.color, 1.2);
      if (b.life >= b.maxLife) activeBolts.splice(i, 1);
    }

    // Animate dots (phase 2+)
    if (phase >= 2) {
      skillDefs.forEach((sd, idx) => {
        const r = radii[sd.ring];
        const startAngle = sd.angle * Math.PI / 180;
        const speed = speeds[sd.ring];
        const dir = dirs[sd.ring];
        const angle = startAngle + dir * (elapsed / speed) * 2 * Math.PI;
        const x = CX() + Math.sin(angle) * r;
        const y = CY() - Math.cos(angle) * r;
        dots[idx].style.left = (x - 24) + 'px';
        dots[idx].style.top  = (y - 24) + 'px';
        dots[idx].style.transform = `rotate(${-angle}rad)`;
        dotPositions[idx].x = x;
        dotPositions[idx].y = y;
      });
    }

    requestAnimationFrame(tick);
  }

  // ===== WAIT FOR ENTER BUTTON =====
  enterBtn.addEventListener('click', () => {
    enterScreen.classList.add('hide');
    setTimeout(() => { enterScreen.style.display = 'none'; }, 600);
    crackleSound.play().catch(() => {});
    requestAnimationFrame(tick);
  });

})();


document.addEventListener('DOMContentLoaded', () => {

  // ===== ACTIVE NAV ON SCROLL =====
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === entry.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(s => navObserver.observe(s));

  // ===== FADE IN ON SCROLL =====
  const fadeTargets = document.querySelectorAll(
    '.section-inner, .project-row, .edu-row, .stat-block, .skill-category'
  );

  fadeTargets.forEach((el, i) => {
    el.classList.add('fade-in-up');
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
  });

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  fadeTargets.forEach(el => fadeObserver.observe(el));

  setTimeout(() => {
    fadeTargets.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      }
    });
  }, 100);

  // ===== HERO ENTRANCE =====
  const heroEyebrow = document.querySelector('.hero-eyebrow');
  const heroName    = document.querySelector('.hero-name');
  const heroTagline = document.querySelector('.hero-tagline');
  const heroCtas    = document.querySelector('.hero-ctas');
  const heroScroll  = document.querySelector('.hero-scroll-hint');

  [heroEyebrow, heroName, heroTagline, heroCtas, heroScroll].forEach((el, i) => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    el.style.transitionDelay = `${0.15 + i * 0.12}s`;
    setTimeout(() => {
      el.style.opacity = '';
      el.style.transform = '';
    }, 50);
  });

  // ===== THEME TOGGLE =====
  const toggle = document.getElementById('themeToggle');
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (saved === 'light' || (!saved && !prefersDark)) {
    document.body.classList.add('light');
  }

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
  });

  // ===== TYPING TEXT (hero eyebrow cycle) =====
  const roles = [
    'Software Engineer · Backend Specialist',
    'Java & Spring Boot Developer',
    'Cloud & Microservices Builder',
    'Mobile App Developer · Flutter'
  ];
  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;
  const typingEl = document.querySelector('.hero-eyebrow');

  if (typingEl) {
    function type() {
      const current = roles[roleIndex];
      if (deleting) {
        typingEl.textContent = current.substring(0, charIndex--);
        if (charIndex < 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          charIndex = 0;
          setTimeout(type, 400);
          return;
        }
      } else {
        typingEl.textContent = current.substring(0, charIndex++);
        if (charIndex > current.length) {
          deleting = true;
          setTimeout(type, 2200);
          return;
        }
      }
      setTimeout(type, deleting ? 40 : 60);
    }
    setTimeout(type, 800);
  }

  // ===== CONTACT FORM =====
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name     = document.getElementById('name').value.trim();
      const email    = document.getElementById('email').value.trim();
      const message  = document.getElementById('message').value.trim();
      const sendCopy = document.getElementById('sendEmail').checked;

      if (!name || !email || !message) return;

      console.log({ name, email, message, sendCopy });

      const btn = form.querySelector('.btn-submit');
      btn.textContent = 'Sent ✓';
      btn.style.background = '#27ae60';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 3000);
    });
  }

});
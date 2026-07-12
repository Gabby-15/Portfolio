// =========================================
// 1. MOBILE NAV TOGGLE
// =========================================
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

if (hamburger && navLinks) {

  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("nav-links-open");

  });
  
}

// =========================================
// 2. SMOOTH SCROLL FOR NAV LINKS
// =========================================
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", (e) => {
    const targetId = link.getAttribute("href");

    // Only smooth-scroll if the target section actually exists
    if (targetId.startsWith("#") && document.querySelector(targetId)) {
      e.preventDefault();
      document.querySelector(targetId).scrollIntoView({ behavior: "smooth" });
    }

    // Update active link styling
    document.querySelectorAll(".nav-links a").forEach((a) => a.classList.remove("active"));
    link.classList.add("active");
  });
});

// =========================================
// 3. BUTTON ACTIONS (placeholders to customize)
// =========================================
const contactBtn = document.getElementById("contactBtn");
const resumeBtn = document.getElementById("resumeBtn");
const contactModalOverlay = document.getElementById("contactModalOverlay");
const contactModalClose = document.getElementById("contactModalClose");

function openContactModal() {
  contactModalOverlay?.classList.add("is-open");
  document.body.style.overflow = "hidden";
}
function closeContactModal() {
  contactModalOverlay?.classList.remove("is-open");
  document.body.style.overflow = "";
}

contactBtn?.addEventListener("click", openContactModal);
contactModalClose?.addEventListener("click", closeContactModal);
contactModalOverlay?.addEventListener("click", (e) => {
  if (e.target === contactModalOverlay) closeContactModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeContactModal();
});




// =========================================
// 4. SUBTLE TILT EFFECT (on image hover only)
// =========================================
const profileWrap = document.querySelector('.profile-img-wrap');

if (profileWrap) {
  profileWrap.addEventListener('mousemove', function(e) {
    const rect = profileWrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);

    // Toned-down tilt range (was ±20deg/±15deg) for a lighter 3D feel
    profileWrap.style.transition = 'transform 0.1s ease';
    profileWrap.style.transform =
      'rotateY(' + (dx * 6) + 'deg) rotateX(' + (-dy * 5) + 'deg)';
  });

  profileWrap.addEventListener('mouseleave', function() {
    profileWrap.style.transition = 'transform 0.4s ease';
    profileWrap.style.transform = 'rotateY(0deg) rotateX(0deg)';
  });
}


// =========================================
// 5. SKILL CARD SCROLL REVEAL
// =========================================
const skillCards = document.querySelectorAll('.skill-card');

if (skillCards.length && 'IntersectionObserver' in window) {
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // slight stagger so cards power on one after another
          setTimeout(() => entry.target.classList.add('in-view'), i * 90);
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -60px 0px' }
  );

  skillCards.forEach((card) => cardObserver.observe(card));
}









// =========================================
// 6. ANIMATED BACKGROUND — FLOATING GLASS SHARDS
// =========================================
// Small broken-glass "shard" particles drift freely across the page,
// tumbling and glinting on their own. While the page is actively
// scrolling, the shards get a gentle pull/parallax drift; the instant
// scrolling stops they release and go back to tumbling freely. Shards
// also drift away from the cursor when idle.
(function () {
  const canvas = document.getElementById('glass-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const TWO_PI = Math.PI * 2;

  let width, height;
  let shards = [];
  let mouse = { x: null, y: null, active: false };
  let scrollDrift = 0;
  let isScrolling = false;
  let scrollStopTimer = null;

  const MOUSE_DIST = 170;       // radius within which the cursor pushes shards away
  const PUSH_FORCE = 0.9;       // how hard shards get shoved when disturbed
  const RELEASE_FORCE = 1.4;    // outward burst strength the instant scrolling stops

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    buildShards();
  }

  function buildShards() {
    const areaCount = Math.min(70, Math.max(24, Math.floor((width * height) / 22000)));

    shards = Array.from({ length: areaCount }, (_, i) => {
      // simple centered circular cluster spread across the viewport
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const maxRadius = Math.min(width, height) * 0.6;
      const rr = Math.sqrt(i / areaCount) * maxRadius;
      const theta = i * goldenAngle;
      const anchor = { x: width / 2 + Math.cos(theta) * rr, y: height / 2 + Math.sin(theta) * rr };
      return spawnShard(anchor);
    });
  }

  function spawnShard(anchor) {
    // Mix of small, medium, and a handful of larger shards so the field
    // reads as natural scattered debris instead of uniform confetti.
    // Size loosely tracks depth so bigger pieces feel closer up front.
    const roll = Math.random();
    let size, depth;
    if (roll < 0.55) {
      // small — most common, sits toward the back
      size = 7 + Math.random() * 7;
      depth = 0.05 + Math.random() * 0.4;
    } else if (roll < 0.88) {
      // medium
      size = 14 + Math.random() * 11;
      depth = 0.35 + Math.random() * 0.4;
    } else {
      // large — rare foreground accents
      size = 25 + Math.random() * 16;
      depth = 0.7 + Math.random() * 0.3;
    }

    const sides = 3 + Math.floor(Math.random() * 3); // 3–5 sided jagged chunk
    const path = Array.from({ length: sides }, (_, k) => ({
      angle: (k / sides) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
      r: 0.6 + Math.random() * 0.5,
    }));
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * (0.15 + depth * 0.25),
      vy: (Math.random() - 0.5) * (0.15 + depth * 0.25),
      burstVX: 0,
      burstVY: 0,
      size,
      depth,
      path,
      anchor,
      rotZ: Math.random() * TWO_PI,
      rotSpeed: (Math.random() - 0.5) * 0.01,
      flip: Math.random() * TWO_PI,
      flipSpeed: 0.006 + Math.random() * 0.014,
      agitation: 0,
    };
  }

  function triggerScroll() {
    isScrolling = true;
    clearTimeout(scrollStopTimer);
    scrollStopTimer = setTimeout(releaseFormation, 220);
  }

  function releaseFormation() {
    isScrolling = false;
    const cx = width / 2, cy = height / 2;
    for (const s of shards) {
      const dx = s.x - cx, dy = s.y - cy;
      const dist = Math.hypot(dx, dy) || 1;

      const force = RELEASE_FORCE * (0.4 + Math.random() * 0.6);
      s.burstVX += (dx / dist) * force;
      s.burstVY += (dy / dist) * force;

      const dirAngle = Math.random() * Math.PI * 2;
      const mag = (0.5 + s.depth * 0.4) * (0.6 + Math.random() * 0.4);
      s.vx = Math.cos(dirAngle) * mag;
      s.vy = Math.sin(dirAngle) * mag;

      s.agitation = 1;
    }
  }

  function step() {
    for (const s of shards) {
      s.rotZ += s.rotSpeed + s.agitation * 0.02;
      s.flip += s.flipSpeed;

      if (mouse.active) {
        const dx = s.x - mouse.x;
        const dy = s.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_DIST && dist > 0.01) {
          const force = (1 - dist / MOUSE_DIST) * PUSH_FORCE;
          s.vx += (dx / dist) * force * 0.06;
          s.vy += (dy / dist) * force * 0.06;
          s.agitation = Math.min(1, s.agitation + 0.15);
        }
      }
      s.agitation *= 0.94;

      const speed = Math.hypot(s.vx, s.vy);
      const maxSpeed = 0.7 + s.depth * 0.6;
      if (speed > maxSpeed) {
        s.vx = (s.vx / speed) * maxSpeed;
        s.vy = (s.vy / speed) * maxSpeed;
      }
      s.vx *= 0.985;
      s.vy *= 0.985;

      s.x += s.vx + s.burstVX;
      s.y += s.vy + s.burstVY + scrollDrift * (0.4 + s.depth * 0.8);
      s.burstVX *= 0.95;
      s.burstVY *= 0.95;

      const pad = s.size * 2;
      if (s.x < -pad) s.x = width + pad;
      if (s.x > width + pad) s.x = -pad;
      if (s.y < -pad) s.y = height + pad;
      if (s.y > height + pad) s.y = -pad;
    }
    scrollDrift *= 0.9;
  }

  function drawShard(s) {
    const flipScale = Math.cos(s.flip);
    const glint = 1 - Math.abs(flipScale);
    // more transparent, maroon-leaning tone so it blends into the dark background
    const baseAlpha = (0.1 + s.depth * 0.22) + s.agitation * 0.1;

    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rotZ);
    ctx.scale(Math.max(0.06, Math.abs(flipScale)), 1);

    ctx.beginPath();
    s.path.forEach((p, i) => {
      const px = Math.cos(p.angle) * p.r * s.size;
      const py = Math.sin(p.angle) * p.r * s.size;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.closePath();

    const grad = ctx.createLinearGradient(-s.size, -s.size, s.size, s.size);
    grad.addColorStop(0, `rgba(255,255,255,${(0.28 * glint + 0.04).toFixed(3)})`);
    grad.addColorStop(0.5, `rgba(122,13,13,${baseAlpha.toFixed(3)})`);
    grad.addColorStop(1, `rgba(20,3,3,${(baseAlpha * 0.9).toFixed(3)})`);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowColor = `rgba(122,13,13,${(0.2 + glint * 0.25).toFixed(3)})`;
    ctx.shadowBlur = 5 + glint * 8;
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(255,150,150,${(0.1 + glint * 0.3).toFixed(3)})`;
    ctx.stroke();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const ordered = [...shards].sort((a, b) => a.depth - b.depth);
    for (const s of ordered) drawShard(s);
    ctx.shadowBlur = 0;
  }

  function loop() {
    step();
    draw();
    requestAnimationFrame(loop);
  }

  function init() {
    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });
    window.addEventListener('mouseleave', () => { mouse.active = false; });

    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      const delta = window.scrollY - lastScrollY;
      scrollDrift += delta * 0.02;
      lastScrollY = window.scrollY;
      if (!prefersReducedMotion) triggerScroll();
    }, { passive: true });

    if (prefersReducedMotion) {
      draw();
    } else {
      requestAnimationFrame(loop);
    }
  }

  init();
})();
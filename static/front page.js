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

contactBtn?.addEventListener("click", () => {
  alert("Contact form / contact section goes here.");
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
// 6. ANIMATED BACKGROUND — NODE / PIXEL NETWORK
// =========================================
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height;
  let nodes = [];
  let mouse = { x: null, y: null, active: false };
  let scrollDrift = 0;

  const BASE_COLOR = '#0a0000';
  const NODE_COLOR = 'rgba(255, 70, 70, OPACITY)';
  const LINE_COLOR = 'rgba(255, 40, 40, OPACITY)';
  const LINK_DIST = 190;      // max distance to draw a connection between two nodes
  const MOUSE_DIST = 230;     // radius within which the cursor links to nearby nodes

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    // node count scales with screen area, capped for performance
    const targetCount = Math.min(110, Math.max(36, Math.floor((width * height) / 13000)));
    nodes = Array.from({ length: targetCount }, () => spawnNode());
  }

  function spawnNode() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: 2 + Math.random() * 2.5, // small square "pixels", varied for a less mechanical feel
      phase: Math.random() * Math.PI * 2, // offsets the twinkle so nodes don't pulse in sync
      twinkleSpeed: 0.0012 + Math.random() * 0.0018,
    };
  }

  function step() {
    for (const n of nodes) {
      // tiny random drift so movement doesn't look like a perfect physics grid
      n.vx += (Math.random() - 0.5) * 0.012;
      n.vy += (Math.random() - 0.5) * 0.012;

      n.x += n.vx;
      n.y += n.vy + scrollDrift;

      // wrap around edges so the field feels continuous
      if (n.x < -10) n.x = width + 10;
      if (n.x > width + 10) n.x = -10;
      if (n.y < -10) n.y = height + 10;
      if (n.y > height + 10) n.y = -10;

      // gentle repulsion from the cursor, like a signal disturbing the field
      if (mouse.active) {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_DIST && dist > 0.01) {
          const force = (1 - dist / MOUSE_DIST) * 0.7;
          n.vx += (dx / dist) * force * 0.025;
          n.vy += (dy / dist) * force * 0.025;
        }
      }

      // cap speed so the jitter never runs away, then damp slightly
      const speed = Math.hypot(n.vx, n.vy);
      const maxSpeed = 0.6;
      if (speed > maxSpeed) {
        n.vx = (n.vx / speed) * maxSpeed;
        n.vy = (n.vy / speed) * maxSpeed;
      }
      n.vx *= 0.98;
      n.vy *= 0.98;
    }

    // scroll drift decays back to zero each frame
    scrollDrift *= 0.9;
  }

  function draw(time) {
    ctx.fillStyle = BASE_COLOR;
    ctx.fillRect(0, 0, width, height);

    // connections between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < LINK_DIST) {
          const opacity = (1 - dist / LINK_DIST) * 0.55;
          ctx.strokeStyle = LINE_COLOR.replace('OPACITY', opacity.toFixed(3));
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // link nearby nodes to the cursor, so the network visibly reacts to it
      if (mouse.active) {
        const dist = Math.hypot(nodes[i].x - mouse.x, nodes[i].y - mouse.y);
        if (dist < MOUSE_DIST) {
          const opacity = (1 - dist / MOUSE_DIST) * 0.75;
          ctx.strokeStyle = LINE_COLOR.replace('OPACITY', opacity.toFixed(3));
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    // draw nodes as small glowing pixels, gently twinkling like status LEDs
    for (const n of nodes) {
      const twinkle = 0.55 + Math.sin(time * n.twinkleSpeed + n.phase) * 0.35;
      ctx.fillStyle = NODE_COLOR.replace('OPACITY', twinkle.toFixed(3));
      ctx.shadowColor = 'rgba(255, 40, 40, 0.9)';
      ctx.shadowBlur = 7;
      ctx.fillRect(n.x - n.size / 2, n.y - n.size / 2, n.size, n.size);
    }
    ctx.shadowBlur = 0;
  }

  function loop(time) {
    step();
    draw(time || 0);
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });
  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  // scrolling nudges the field slightly, tying the motion to page movement
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const delta = window.scrollY - lastScrollY;
    scrollDrift += delta * 0.02;
    lastScrollY = window.scrollY;
  }, { passive: true });

  if (prefersReducedMotion) {
    // draw a single static frame — no motion, but the background still renders
    draw(0);
  } else {
    requestAnimationFrame(loop);
  }
})();
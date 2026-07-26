// =========================================
// 0. ALWAYS LAND ON HOME AFTER A REFRESH
// =========================================

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

window.scrollTo({ top: 0, left: 0, behavior: "instant" });
window.addEventListener("pageshow", (e) => {
  // Also covers back/forward-cache restores (e.g. Safari), not just
  // a hard refresh.
  if (e.persisted) {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    forceClearScrollLocks();
  }
});

// =========================================
// 0b. UNIFIED SCROLL-LOCK SYSTEM
// =========================================

const scrollLockReasons = new Set();
function setScrollLock(reason, shouldLock) {
  if (shouldLock) scrollLockReasons.add(reason);
  else scrollLockReasons.delete(reason);
  document.body.style.overflow = scrollLockReasons.size ? "hidden" : "";
}
function forceClearScrollLocks() {
  scrollLockReasons.clear();
  document.body.style.overflow = "";
  document.body.classList.remove("nav-open");
  document.getElementById("navLinks")?.classList.remove("nav-links-open");
  document.getElementById("hamburger")?.classList.remove("hamburger-open");
  document.getElementById("hamburger")?.setAttribute("aria-expanded", "false");
  document.getElementById("contactModalOverlay")?.classList.remove("is-open");
  document.getElementById("resumeModalOverlay")?.classList.remove("is-open");
  document.getElementById("certLightboxOverlay")?.classList.remove("is-open");
}

// =========================================
// 1. MOBILE NAV TOGGLE
// =========================================
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

if (hamburger && navLinks) {

  hamburger.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("nav-links-open");
    hamburger.classList.toggle("hamburger-open", isOpen);
    hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    setScrollLock("nav", isOpen);
  });

  // Close the mobile menu once a link is tapped
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("nav-links-open");
      hamburger.classList.remove("hamburger-open");
      hamburger.setAttribute("aria-expanded", "false");
      setScrollLock("nav", false);
    });
  });

  // If the viewport grows back past the mobile breakpoint, make sure the
  // dropdown doesn't stay stuck open underneath the now-visible desktop nav
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      navLinks.classList.remove("nav-links-open");
      hamburger.classList.remove("hamburger-open");
      hamburger.setAttribute("aria-expanded", "false");
      setScrollLock("nav", false);
    }
  });

  // Tapping anywhere outside the open drawer (or hamburger button) closes
  // it too — previously the only way to close it was tapping a link or the
  // hamburger again, so it could get left open with the page's scroll
  // locked underneath it.
  document.addEventListener("click", (e) => {
    const isOpen = navLinks.classList.contains("nav-links-open");
    if (!isOpen) return;
    if (navLinks.contains(e.target) || hamburger.contains(e.target)) return;

    navLinks.classList.remove("nav-links-open");
    hamburger.classList.remove("hamburger-open");
    hamburger.setAttribute("aria-expanded", "false");
    setScrollLock("nav", false);
  });

}

// =========================================
// 2. SMOOTH SCROLL FOR NAV LINKS
// =========================================
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", (e) => {
    const targetId = link.getAttribute("href");
    if (!targetId.startsWith("#")) return;

    // Always take over the click so a missing target can never fall back to
    // the browser's default "jump to top of document" behavior — that
    // fallback was what made links like Projects/Know Me More look like
    // they were sending people back to Home.
    e.preventDefault();

    const targetEl = document.querySelector(targetId);
    if (!targetEl) return; // section not built yet — do nothing, stay put

    targetEl.scrollIntoView({ behavior: "smooth" });

    // Update active link styling only once we've actually navigated
    document.querySelectorAll(".nav-links a").forEach((a) => a.classList.remove("active"));
    link.classList.add("active");
  });
});

// =========================================
// 2b. SCROLL-SPY (keeps the nav link highlighted for whichever
// section is actually in view, not just right after a click —
// so scrolling the page by hand also updates the active link)
// =========================================
(function scrollSpy() {
  const navAnchors = Array.from(document.querySelectorAll(".nav-links a"));
  if (!navAnchors.length) return;

  // Only track links whose target section actually exists on the page
  const tracked = navAnchors
    .map((link) => {
      const id = link.getAttribute("href");
      if (!id || !id.startsWith("#")) return null;
      const section = document.querySelector(id);
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (!tracked.length || !("IntersectionObserver" in window)) return;

  function setActive(link) {
    navAnchors.forEach((a) => a.classList.remove("active"));
    link.classList.add("active");
  }

  const spy = new IntersectionObserver(
    (entries) => {
      // Among sections currently crossing the "active band", pick the one
      // closest to the top of the viewport as the current section.
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length) {
        const match = tracked.find((t) => t.section === visible[0].target);
        if (match) setActive(match.link);
      }
    },
    // Treat a band in the upper-middle of the viewport as "current section"
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
  );

  tracked.forEach(({ section }) => spy.observe(section));
})();

// =========================================
// 2c. BACKGROUND GLOW FOLLOWS SCROLL
// =========================================
// The maroon glow behind the hero picture is anchored to the picture's
// spot on the Home section. Once you scroll away to another page it
// glides toward the center of the screen instead of staying stuck off
// to the side, so it still looks deliberate on every section.
(function () {
  const homeSection = document.getElementById('home');
  if (!homeSection || !('IntersectionObserver' in window)) return;

  const glowObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        document.body.classList.toggle('away-from-home', !entry.isIntersecting);
      });
    },
    { threshold: 0, rootMargin: '-45% 0px -45% 0px' }
  );

  glowObserver.observe(homeSection);
})();

// =========================================
// 3. BUTTON ACTIONS (placeholders to customize)
// =========================================
const contactBtn = document.getElementById("contactBtn");
const resumeBtn = document.getElementById("resumeBtn");
const contactModalOverlay = document.getElementById("contactModalOverlay");
const contactModalClose = document.getElementById("contactModalClose");
const resumeModalOverlay = document.getElementById("resumeModalOverlay");
const resumeModalClose = document.getElementById("resumeModalClose");

function openContactModal() {
  contactModalOverlay?.classList.add("is-open");
  setScrollLock("contact-modal", true);
}
function closeContactModal() {
  contactModalOverlay?.classList.remove("is-open");
  setScrollLock("contact-modal", false);
}

function openResumeModal() {
  resumeModalOverlay?.classList.add("is-open");
  setScrollLock("resume-modal", true);
}
function closeResumeModal() {
  resumeModalOverlay?.classList.remove("is-open");
  setScrollLock("resume-modal", false);
}

contactBtn?.addEventListener("click", openContactModal);
contactModalClose?.addEventListener("click", closeContactModal);
contactModalOverlay?.addEventListener("click", (e) => {
  if (e.target === contactModalOverlay) closeContactModal();
});

// Resume button now opens an in-page preview instead of leaving the site
resumeBtn?.addEventListener("click", openResumeModal);
resumeModalClose?.addEventListener("click", closeResumeModal);
resumeModalOverlay?.addEventListener("click", (e) => {
  if (e.target === resumeModalOverlay) closeResumeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeContactModal();
    closeResumeModal();
    navLinks?.classList.remove("nav-links-open");
    hamburger?.classList.remove("hamburger-open");
    hamburger?.setAttribute("aria-expanded", "false");
    setScrollLock("nav", false);
  }
});

// Copy email / phone to clipboard from the contact modal
const copyButtons = document.querySelectorAll(".contact-copy-btn");

function fallbackCopy(text) {
  const temp = document.createElement("textarea");
  temp.value = text;
  temp.style.position = "fixed";
  temp.style.opacity = "0";
  document.body.appendChild(temp);
  temp.focus();
  temp.select();
  try {
    document.execCommand("copy");
  } catch (err) {
    console.error("Copy failed:", err);
  }
  document.body.removeChild(temp);
}

copyButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const text = btn.dataset.copyText || "";
    if (!text) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopy(text);
      }
    } catch (err) {
      fallbackCopy(text);
    }

    btn.classList.add("is-copied");
    clearTimeout(btn._copyResetTimer);
    btn._copyResetTimer = setTimeout(() => {
      btn.classList.remove("is-copied");
    }, 1600);
  });
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
// 5. SCROLL REVEAL (skill cards + certification cards)
// =========================================
const revealCards = document.querySelectorAll('.skill-card, .cert-card, .project-card, .project-spotlight');

if (revealCards.length && 'IntersectionObserver' in window) {
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

  revealCards.forEach((card) => cardObserver.observe(card));
}

// =========================================
// 5a. WHOLE-SECTION ENTRANCE (the "felt" transition moving between
// Home -> Skills -> Certifications). This runs on the section itself,
// slower and larger than the card reveal above, so the page change
// registers before the individual cards stagger in on top of it.
// =========================================
const revealSections = document.querySelectorAll('.skills-section, .certs-section, .projects-section, .aboutme-section');

if (revealSections.length && 'IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-in-view');
          sectionObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -80px 0px' }
  );

  revealSections.forEach((section) => sectionObserver.observe(section));
}

// =========================================
// 5b. CERTIFICATION CARD 3D TILT
// =========================================
// Same spirit as the profile-photo tilt above, applied to each
// certificate thumbnail: a light tilt toward the cursor plus a
// tracked "shine" highlight (driven by the --mx/--my CSS vars).
const certMedias = document.querySelectorAll('.cert-card-media:not(.cert-card-media--photo):not(.cert-card-media--award), .project-card-media');
const prefersReducedMotionCerts = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (certMedias.length && !prefersReducedMotionCerts) {
  certMedias.forEach((media) => {
    media.addEventListener('mousemove', (e) => {
      const rect = media.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      const rotateY = (px - 0.5) * 14;
      const rotateX = (0.5 - py) * 14;

      media.style.transition = 'transform 0.1s ease';
      media.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.03)`;
      media.style.setProperty('--mx', `${px * 100}%`);
      media.style.setProperty('--my', `${py * 100}%`);
    });

    media.addEventListener('mouseleave', () => {
      media.style.transition = 'transform 0.4s ease';
      media.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
    });
  });
}

// =========================================
// 5b-ii. REAL CERT PHOTO — PAPER-LIKE CURSOR TILT
// =========================================
// Unlike the generic card tilt above, this one has no container
// behind it and no self-playing animation — the certificate only
// moves when the cursor is actually over it, tilting + casting its
// shadow away from the cursor like a loose sheet of paper being
// nudged, then settling flat again on mouseleave.
const paperCertWraps = document.querySelectorAll('.cert-card-media--photo, .cert-card-media--award');

if (paperCertWraps.length && !prefersReducedMotionCerts) {
  paperCertWraps.forEach((wrap) => {
    const img = wrap.querySelector('.cert-card-photo');
    if (!img) return;

    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      const rotateY = (px - 0.5) * 28;
      const rotateX = (0.5 - py) * 28;
      const shadowX = (px - 0.5) * -24;
      const shadowY = (0.5 - py) * -24;

      img.style.transition = 'transform 0.08s ease-out, filter 0.08s ease-out';
      img.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
      img.style.filter = `
        drop-shadow(${shadowX}px ${shadowY - 4}px 22px rgba(0, 0, 0, 0.55))
        drop-shadow(0 0 13px rgba(255, 90, 90, 0.5))
      `;
    });

    wrap.addEventListener('mouseleave', () => {
      img.style.transition = 'transform 0.5s ease, filter 0.5s ease';
      img.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
      img.style.filter = '';
    });
  });
}

// =========================================
// 5b-iii. CERT PHOTO ZOOM LIGHTBOX (GALLERY VIEW)
// =========================================
// Click any real certificate photo to see it big, dimmed backdrop
// and all, then browse the rest with the arrow buttons or ←/→ keys.
// Reusable for every .cert-card-photo, current and future.
const certLightboxOverlay = document.getElementById('certLightboxOverlay');
const certLightboxClose = document.getElementById('certLightboxClose');
const certLightboxImg = document.getElementById('certLightboxImg');
const certLightboxPrev = document.getElementById('certLightboxPrev');
const certLightboxNext = document.getElementById('certLightboxNext');
const certLightboxCounter = document.getElementById('certLightboxCounter');
const certPhotos = Array.from(document.querySelectorAll('.cert-card-photo'));

let certLightboxIndex = 0;

function renderCertLightbox() {
  const photo = certPhotos[certLightboxIndex];
  if (!photo || !certLightboxImg) return;

  certLightboxImg.src = photo.src;
  certLightboxImg.alt = photo.alt || '';

  const hasMultiple = certPhotos.length > 1;
  certLightboxPrev?.toggleAttribute('hidden', !hasMultiple);
  certLightboxNext?.toggleAttribute('hidden', !hasMultiple);
  if (certLightboxCounter) {
    certLightboxCounter.textContent = hasMultiple
      ? `${certLightboxIndex + 1} / ${certPhotos.length}`
      : '';
  }
}

function openCertLightbox(index) {
  if (!certLightboxOverlay || !certPhotos.length) return;
  certLightboxIndex = (index + certPhotos.length) % certPhotos.length;
  renderCertLightbox();
  certLightboxOverlay.classList.add('is-open');
  setScrollLock("cert-lightbox", true);
}

function closeCertLightbox() {
  certLightboxOverlay?.classList.remove('is-open');
  setScrollLock("cert-lightbox", false);
}

function showNextCert() {
  openCertLightbox(certLightboxIndex + 1);
}

function showPrevCert() {
  openCertLightbox(certLightboxIndex - 1);
}

certPhotos.forEach((photo, index) => {
  const card = photo.closest('.cert-card');
  const infoBtn = card?.querySelector('.cert-info-btn');
  infoBtn?.addEventListener('click', () => {
    openCertLightbox(index);
  });
});

certLightboxClose?.addEventListener('click', closeCertLightbox);
certLightboxImg?.addEventListener('click', closeCertLightbox);
certLightboxNext?.addEventListener('click', (e) => {
  e.stopPropagation();
  showNextCert();
});
certLightboxPrev?.addEventListener('click', (e) => {
  e.stopPropagation();
  showPrevCert();
});
certLightboxOverlay?.addEventListener('click', (e) => {
  if (e.target === certLightboxOverlay) closeCertLightbox();
});
document.addEventListener('keydown', (e) => {
  if (!certLightboxOverlay?.classList.contains('is-open')) return;
  if (e.key === 'Escape') closeCertLightbox();
  if (e.key === 'ArrowRight') showNextCert();
  if (e.key === 'ArrowLeft') showPrevCert();
});








// =========================================
// 5c. HERO SCRIPT TEXT — CURSOR-TRACKED GLINT
// =========================================
// Mirrors the cert-card shine: a bright glint follows the cursor's
// exact position over the "Gabb Salvacion" text, on top of the
// slow automatic glass-sweep animation.
const scriptText = document.querySelector('.greeting .script');

if (scriptText) {
  scriptText.addEventListener('mousemove', (e) => {
    const rect = scriptText.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    scriptText.style.setProperty('--mx', `${px * 100}%`);
    scriptText.style.setProperty('--my', `${py * 100}%`);
    scriptText.classList.add('is-glinting');
  });

  scriptText.addEventListener('mouseleave', () => {
    scriptText.classList.remove('is-glinting');
  });
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
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
      // large — rare foreground accents (bumped up a bit so the biggest
      // pieces read more clearly as glass, not confetti)
      size = 30 + Math.random() * 20;
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
})

();
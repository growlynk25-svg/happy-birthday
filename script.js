/* ============================================
   MANSHI'S BIRTHDAY WEBSITE — SCRIPT.JS
   Firefly Theme: sparkling fireflies, scroll-
   following guide firefly, confetti, music
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initFireflyCanvas();
    initFireflyGuide();
    initTypewriter();
    initScrollReveal();
    initLightbox();
    initMusicToggle();
    initFinaleObserver();
});

/* ============================================
   1. FIREFLY CANVAS — Sparkling fireflies bg
   ============================================ */
function initFireflyCanvas() {
    const canvas = document.getElementById('bubbleCanvas');
    const ctx = canvas.getContext('2d');
    let fireflies = [];
    const FIREFLY_COUNT = 45;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Firefly {
        constructor() {
            this.reset(true);
        }

        reset(initial) {
            this.x = Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : canvas.height + 20;
            this.radius = Math.random() * 2.5 + 1;
            this.baseOpacity = Math.random() * 0.6 + 0.2;
            this.opacity = this.baseOpacity;
            this.speedX = (Math.random() - 0.5) * 0.6;
            this.speedY = -(Math.random() * 0.4 + 0.1);
            this.flickerSpeed = Math.random() * 0.04 + 0.01;
            this.flickerOffset = Math.random() * Math.PI * 2;
            this.driftAmp = Math.random() * 30 + 10;
            this.driftSpeed = Math.random() * 0.008 + 0.002;
            this.driftOffset = Math.random() * Math.PI * 2;
            this.life = 0;
            this.maxLife = Math.random() * 600 + 200;
            // Color: warm yellow to green-yellow
            this.hue = Math.random() > 0.3 ? (50 + Math.random() * 15) : (80 + Math.random() * 30);
        }

        update(time) {
            this.life++;
            this.x += Math.sin(time * this.driftSpeed + this.driftOffset) * 0.5 + this.speedX;
            this.y += this.speedY;

            // Flicker
            const flicker = Math.sin(time * this.flickerSpeed + this.flickerOffset);
            this.opacity = this.baseOpacity * (0.4 + 0.6 * ((flicker + 1) / 2));

            // Fade in/out over life
            const lifePct = this.life / this.maxLife;
            if (lifePct < 0.1) {
                this.opacity *= lifePct / 0.1;
            } else if (lifePct > 0.85) {
                this.opacity *= (1 - lifePct) / 0.15;
            }

            if (this.life >= this.maxLife || this.y < -20 || this.x < -20 || this.x > canvas.width + 20) {
                this.reset(false);
                this.y = Math.random() * canvas.height;
                this.x = Math.random() * canvas.width;
            }
        }

        draw() {
            if (this.opacity < 0.01) return;

            ctx.save();
            

            // Outer glow
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.radius * 12
            );
            gradient.addColorStop(0, `hsla(${this.hue}, 100%, 75%, ${this.opacity * 0.8})`);
            gradient.addColorStop(0.1, `hsla(${this.hue}, 100%, 70%, ${this.opacity * 0.4})`);
            gradient.addColorStop(0.4, `hsla(${this.hue}, 80%, 60%, ${this.opacity * 0.1})`);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 12, 0, Math.PI * 2);
            ctx.fill();

            // Core bright dot
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 100%, 85%, ${this.opacity})`;
            ctx.fill();

            ctx.restore();
        }
    }

    for (let i = 0; i < FIREFLY_COUNT; i++) {
        fireflies.push(new Firefly());
    }

    let time = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        time++;
        fireflies.forEach(f => {
            f.update(time);
            f.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

/* ============================================
   2. FIREFLY GUIDE — Scroll-following firefly
   Starts on the 'i' of Manshi, flies to each
   image (lights it up) then to its dot, all
   the way down to the finale
   ============================================ */
function initFireflyGuide() {
    const firefly = document.getElementById('fireflyGuide');
    const heroName = document.querySelector('.hero-name');
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineCards = document.querySelectorAll('.timeline-card');

    if (!firefly || !heroName) return;

    let waypoints = [];
    let lastTrailTime = 0;

    function getAbsoluteCenter(el) {
        const rect = el.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2 + window.scrollX,
            y: rect.top + rect.height / 2 + window.scrollY
        };
    }

    function calculateWaypoints() {
        waypoints = [];

        // 1. Start: the 'i' in Manshi
        const letterI = heroName.querySelector('.letter[style*="--i:5"]');
        if (letterI) {
            const rect = letterI.getBoundingClientRect();
            waypoints.push({
                x: rect.left + rect.width / 2 + window.scrollX,
                y: rect.top + window.scrollY - 5,
                type: 'start'
            });
        }

        // 2. For each timeline item: image → dot
        timelineItems.forEach((item) => {
            const image = item.querySelector('.timeline-image');
            const dot = item.querySelector('.timeline-dot');
            const card = item.querySelector('.timeline-card');

            if (image) {
                const pos = getAbsoluteCenter(image);
                waypoints.push({ x: pos.x, y: pos.y, type: 'image', card: card });
            }
            if (dot) {
                const pos = getAbsoluteCenter(dot);
                waypoints.push({ x: pos.x, y: pos.y, type: 'dot' });
            }
        });

        // 3-7: Remaining sections
        const sections = [
            { sel: '#gallery .section-title', type: 'section' },
            { sel: '#videoSection', type: 'section' },
            { sel: '.quote-hero', type: 'section' },
            { sel: '.letter-paper', type: 'section' },
            { sel: '.finale-cake', type: 'finale' }
        ];
        sections.forEach(s => {
            const el = document.querySelector(s.sel);
            if (el) {
                const pos = getAbsoluteCenter(el);
                waypoints.push({ x: pos.x, y: pos.y, type: s.type });
            }
        });
    }

    function updateFirefly() {
        if (waypoints.length < 2) return;

        const scrollY = window.scrollY;
        const viewH = window.innerHeight;
        const docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        const maxScroll = docH - viewH;

        // Map scroll (0 → maxScroll) to waypoints evenly
        // This ensures the firefly always keeps pace with scroll
        const scrollProgress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
        const totalSegments = waypoints.length - 1;

        const rawIdx = scrollProgress * totalSegments;
        const fromIdx = Math.min(Math.floor(rawIdx), totalSegments);
        const toIdx = Math.min(fromIdx + 1, totalSegments);
        const t = rawIdx - fromIdx; // 0 to 1 within segment

        const from = waypoints[fromIdx];
        const to = waypoints[toIdx];

        // Smooth easing within segment
        const ease = v => v < 0.5 ? 2 * v * v : -1 + (4 - 2 * v) * v;
        const eased = ease(t);

        // Small natural waver
        const waveX = Math.sin(scrollY * 0.02) * 12;
        const waveY = Math.cos(scrollY * 0.015) * 6;

        // Absolute page position (firefly is position: absolute)
        const absX = from.x + (to.x - from.x) * eased + waveX;
        const absY = from.y + (to.y - from.y) * eased + waveY;

        firefly.style.transform = `translate(${absX}px, ${absY}px)`;

        // Trail (in viewport coords for fixed trails)
        const now = Date.now();
        if (now - lastTrailTime > 60) {
            const trail = document.createElement('div');
            trail.className = 'firefly-trail';
            trail.style.position = 'fixed';
            trail.style.zIndex = '99';
            trail.style.left = (absX - scrollY * 0 + 6 - window.scrollX) + 'px';
            trail.style.top = (absY - scrollY + 6) + 'px';
            document.body.appendChild(trail);
            setTimeout(() => trail.remove(), 600);
            lastTrailTime = now;
        }

        // Light up timeline cards
        timelineCards.forEach(card => card.classList.remove('firefly-lit'));
        const nearWp = (t < 0.5) ? from : to;
        if (nearWp.type === 'image' && nearWp.card) {
            nearWp.card.classList.add('firefly-lit');
        }
    }

    // Setup after layout settles
    setTimeout(() => {
        calculateWaypoints();
        updateFirefly();
    }, 500);

    // Instant update on every scroll
    window.addEventListener('scroll', updateFirefly, { passive: true });

    // Recalculate on resize
    window.addEventListener('resize', () => {
        calculateWaypoints();
        updateFirefly();
    });
}

/* ============================================
   3. TYPEWRITER EFFECT — Hero tagline
   ============================================ */
function initTypewriter() {
    const el = document.getElementById('heroTypewriter');
    const text = "I like the way we became friends in such a short time ✨";
    let i = 0;
    const speed = 55;
    const startDelay = 2200;

    function type() {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    setTimeout(type, startDelay);
}

/* ============================================
   4. SCROLL REVEAL — Intersection Observer
   ============================================ */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

/* ============================================
   5. LIGHTBOX — Photo gallery expand
   ============================================ */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const polaroids = document.querySelectorAll('.polaroid');

    polaroids.forEach(polaroid => {
        polaroid.addEventListener('click', () => {
            const img = polaroid.querySelector('img');
            const caption = polaroid.getAttribute('data-caption') || '';
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightboxCaption.textContent = caption;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    lightboxClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

/* ============================================
   6. MUSIC TOGGLE
   ============================================ */
function initMusicToggle() {
    const btn = document.getElementById('musicToggle');
    const audio = document.getElementById('bgMusic');
    // If the button doesn't exist on the page, gracefully handle it
    const label = btn ? btn.querySelector('.music-label') : null;
    let isPlaying = true; // Assume true since HTML defaults to playing

    const playMusic = () => {
        if (!isPlaying || audio.paused) {
            audio.play().then(() => {
                if (btn) btn.classList.add('playing');
                if (label) label.textContent = 'Pause';
                isPlaying = true;
            }).catch(err => {
                console.log('Autoplay prevented by browser', err);
                if (btn) btn.classList.remove('playing');
                if (label) label.textContent = 'Play';
                isPlaying = false;
            });
        }
    };

    // Attempt to play on load (may be blocked by browser)
    playMusic();

    // Attach one-time event listeners to document for first interaction
    const interactionEvents = ['click', 'scroll', 'keydown', 'touchstart'];
    const onInteraction = () => {
        playMusic();
        interactionEvents.forEach(e => document.removeEventListener(e, onInteraction));
    };
    interactionEvents.forEach(e => document.addEventListener(e, onInteraction, { once: true }));

    if (btn) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering the global interaction again
            if (isPlaying) {
                audio.pause();
                btn.classList.remove('playing');
                if (label) label.textContent = 'Play';
                isPlaying = false;
            } else {
                playMusic();
            }
        });
    }
}

/* ============================================
   7. CONFETTI — Finale section
   ============================================ */
function initFinaleObserver() {
    const finale = document.getElementById('finale');
    let confettiTriggered = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !confettiTriggered) {
                confettiTriggered = true;
                launchConfetti();
            }
        });
    }, {
        threshold: 0.3
    });

    observer.observe(finale);
}

function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    let confetti = [];
    const CONFETTI_COUNT = 200;

    function resize() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }
    resize();

    const colors = [
        '#FFE87C', '#FFF4B8', '#ADFF2F', '#CCFF66',
        '#FFD700', '#FF9F43', '#C4B1D4', '#FFFFFF',
        '#7CCC00', '#D4B84A'
    ];

    class Confetto {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = -10 - Math.random() * canvas.height * 0.5;
            this.w = Math.random() * 10 + 5;
            this.h = Math.random() * 6 + 3;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.speedY = Math.random() * 3 + 1.5;
            this.speedX = (Math.random() - 0.5) * 2;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 10;
            this.opacity = 1;
            this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.rotation += this.rotationSpeed;
            this.speedX += (Math.random() - 0.5) * 0.1;
            if (this.y > canvas.height * 0.7) {
                this.opacity -= 0.008;
            }
        }

        draw() {
            if (this.opacity <= 0) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            if (this.shape === 'rect') {
                ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.w / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    function spawnWave(count) {
        for (let i = 0; i < count; i++) {
            confetti.push(new Confetto());
        }
    }

    spawnWave(CONFETTI_COUNT);
    setTimeout(() => spawnWave(80), 800);
    setTimeout(() => spawnWave(60), 1600);
    setTimeout(() => spawnWave(40), 2400);

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confetti = confetti.filter(c => c.opacity > 0 && c.y < canvas.height + 20);
        confetti.forEach(c => {
            c.update();
            c.draw();
        });
        if (confetti.length > 0) {
            requestAnimationFrame(animate);
        }
    }
    animate();
}

/* ============================================
   8. SMOOTH PARALLAX — Subtle depth on scroll
   ============================================ */
(function initParallax() {
    const hero = document.getElementById('hero');
    const heroContent = hero?.querySelector('.hero-content');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (heroContent && scrollY < window.innerHeight) {
            const parallaxAmount = scrollY * 0.3;
            const opacityFade = 1 - scrollY / (window.innerHeight * 0.8);
            heroContent.style.transform = `translateY(${parallaxAmount}px)`;
            heroContent.style.opacity = Math.max(opacityFade, 0);
        }
    }, { passive: true });
})();

/* ============================================
   9. IMAGE PLACEHOLDER HANDLING
   ============================================ */
(function handleMissingImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function () {
            this.style.display = 'none';
            const parent = this.parentElement;
            if (parent) {
                const placeholder = document.createElement('div');
                placeholder.style.cssText = `
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, rgba(255,232,124,0.08), rgba(173,255,47,0.08));
                    color: rgba(255,232,124,0.3);
                    font-size: 3rem;
                    min-height: 180px;
                `;
                placeholder.textContent = '✨';
                parent.appendChild(placeholder);
            }
        });
    });
})();

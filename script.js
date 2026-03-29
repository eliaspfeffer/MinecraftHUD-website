// ── PARTICLES ──────────────────────────────────────────────
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let W, H, particles = [];

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.size = Math.random() * 2 + 1;
    this.speedY = -(Math.random() * 0.4 + 0.1);
    this.speedX = (Math.random() - 0.5) * 0.2;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.7 ? '#7fff00' : '#3a8a00';
  }
  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    if (this.y < -10) this.reset();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.restore();
  }
}

for (let i = 0; i < 80; i++) particles.push(new Particle());

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ── XP BAR ANIMATION ────────────────────────────────────────
const xpFill = document.getElementById('xpFill');
const xpText = document.getElementById('xpText');

setTimeout(() => {
  if (xpFill) { xpFill.style.width = '73%'; }
}, 600);

// Animate XP bar demo (slowly fill then reset)
let xpDemo = 73;
setInterval(() => {
  if (!xpFill) return;
  xpDemo += Math.random() * 2;
  if (xpDemo >= 100) {
    xpDemo = 0;
    if (xpText) xpText.textContent = 'Level 8 · 0 XP';
    xpFill.style.transition = 'width 0.1s';
    setTimeout(() => { xpFill.style.transition = 'width 0.6s'; }, 150);
  } else {
    const level = 7 + (xpDemo >= 100 ? 1 : 0);
    const xp = Math.round(xpDemo * 50);
    if (xpText) xpText.textContent = `Level ${level} · ${xp.toLocaleString()} XP`;
  }
  xpFill.style.width = xpDemo + '%';
}, 400);

// ── XP POPUP DEMO ────────────────────────────────────────────
const xpPopup = document.getElementById('xpPopup');
function showXPPopup() {
  if (!xpPopup) return;
  const labels = ['+1 XP', '+2 XP', '+5 XP', '+10 XP'];
  xpPopup.textContent = labels[Math.floor(Math.random() * labels.length)];
  xpPopup.style.animation = 'none';
  xpPopup.style.opacity = '1';
  void xpPopup.offsetWidth;
  xpPopup.style.animation = 'float-up 1.4s ease-out forwards';
}
setInterval(showXPPopup, 1800);

// ── KILL FEED DEMO ───────────────────────────────────────────
const killfeed = document.getElementById('killfeed');
const apps = ['Figma', 'Slack', 'Discord', 'VS Code', 'Safari', 'Terminal', 'Xcode', 'Notion', 'Linear', 'Spotify'];
const phrases = ['was slain', 'eliminated', 'has fallen', 'got rekt', 'is no more', 'defeated'];

setInterval(() => {
  if (!killfeed) return;
  const app = apps[Math.floor(Math.random() * apps.length)];
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];
  const item = document.createElement('div');
  item.className = 'kf-item';
  item.textContent = `${app} ${phrase}`;
  item.style.opacity = '0';
  item.style.transition = 'opacity 0.3s';
  killfeed.prepend(item);
  setTimeout(() => item.style.opacity = '0.9', 30);

  // Remove old items
  const items = killfeed.querySelectorAll('.kf-item');
  if (items.length > 4) {
    const last = items[items.length - 1];
    last.style.opacity = '0';
    setTimeout(() => last.remove(), 300);
  }
}, 2800);

// ── HEART PULSE ──────────────────────────────────────────────
const halfHeart = document.querySelector('.h.half');
const offHeart = document.querySelector('.h.off');
setInterval(() => {
  [halfHeart, offHeart].forEach(h => {
    if (!h) return;
    h.style.transition = 'opacity 0.25s';
    h.style.opacity = h.style.opacity === '0.25' ? '1' : '0.25';
  });
}, 700);

// ── SUPABASE ─────────────────────────────────────────────────
const _sb = supabase.createClient(
  'https://eczgwwpesnjlvwqrelzz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjemd3d3Blc25qbHZ3cXJlbHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NzcxNzUsImV4cCI6MjA4OTI1MzE3NX0.YJZD6nwYBD-1u4DiKATIel2F5zvGa-E1h9nJbeJzB9o'
);

// ── NOTIFY FORM ──────────────────────────────────────────────
async function handleNotify(e) {
  e.preventDefault();
  const email = document.getElementById('notifyEmail').value.trim();
  if (!email) return;

  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = '...';
  btn.disabled = true;

  const { error } = await _sb.from('email_signups').insert({ email, platform: 'all' });

  if (error && error.code !== '23505') { // 23505 = unique violation (already signed up)
    btn.textContent = 'Notify Me';
    btn.disabled = false;
    alert('Something went wrong. Please try again.');
    return;
  }

  document.getElementById('notifyConfirm').style.display = 'block';
  e.target.reset();
  btn.textContent = 'Notify Me';
  btn.disabled = false;
}

// ── NAV SCROLL SHADOW ────────────────────────────────────────
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.style.borderBottomColor = 'rgba(127,255,0,0.25)';
  } else {
    nav.style.borderBottomColor = 'rgba(127,255,0,0.15)';
  }
});

// ── SCROLL REVEAL ────────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .step, .sound-card, .pricing-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

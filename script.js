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

// ── INTERACTIVE SOUND DEMO ───────────────────────────────────
let _audioCtx = null;
let _audioUnlocked = false;

function ensureAudio() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  _audioUnlocked = true;
}
document.addEventListener('click', ensureAudio, { once: true });

function noise(dur, freq, q, vol) {
  if (!_audioUnlocked) return;
  const ctx = _audioCtx;
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.exp(-i/(d.length*0.5));
  const src = ctx.createBufferSource(); src.buffer = buf;
  const filt = ctx.createBiquadFilter(); filt.type = 'bandpass';
  filt.frequency.value = freq; filt.Q.value = q;
  const g = ctx.createGain(); g.gain.value = vol;
  src.connect(filt); filt.connect(g); g.connect(ctx.destination);
  src.start();
}

function tone(freqs, dur, type, vol) {
  if (!_audioUnlocked) return;
  const ctx = _audioCtx;
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const t = ctx.currentTime + i * (dur * 0.55);
    osc.type = type; osc.frequency.value = f;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t); osc.stop(t + dur + 0.02);
  });
}

const demoSounds = {
  dirt:    () => noise(0.055, 520, 0.9, 0.38),
  gravel:  () => noise(0.13, 200, 1.8, 0.5),
  xp:      () => tone([660, 990], 0.13, 'sine', 0.2),
  levelup: () => tone([330, 415, 494, 659, 880], 0.17, 'square', 0.13),
  cow:     () => tone([130, 105], 0.28, 'sawtooth', 0.22),
  pig:     () => tone([380, 300, 380], 0.075, 'sine', 0.22),
  dog:     () => tone([290, 260, 230], 0.065, 'square', 0.18),
};

const demoKeyboard = document.getElementById('demoKeyboard');
const demoSoundLabel = document.getElementById('demoSoundLabel');
const demoXpPop = document.getElementById('demoXpPop');
const demoMobLane = document.getElementById('demoMobLane');

function pressKeyEl(el) {
  if (!el) return;
  el.classList.add('pressed');
  setTimeout(() => el.classList.remove('pressed'), 210);
}

function flashLabel(text) {
  if (!demoSoundLabel) return;
  demoSoundLabel.textContent = text;
  demoSoundLabel.classList.remove('flash');
  void demoSoundLabel.offsetWidth;
  demoSoundLabel.classList.add('flash');
}

function spawnMob(emoji) {
  if (!demoMobLane) return;
  const mob = document.createElement('div');
  mob.className = 'demo-mob';
  mob.innerHTML = `<span class="demo-mob-inner">${emoji}</span>`;
  demoMobLane.appendChild(mob);
  mob.addEventListener('animationend', () => mob.remove());
}

function showDemoXPPop() {
  if (!demoXpPop) return;
  demoXpPop.className = 'demo-xp-pop';
  void demoXpPop.offsetWidth;
  demoXpPop.className = 'demo-xp-pop show';
}

// Manual click on single keys
if (demoKeyboard) {
  demoKeyboard.querySelectorAll('.demo-key[data-sound]').forEach(key => {
    key.addEventListener('click', () => {
      ensureAudio();
      pressKeyEl(key);
      demoSounds[key.dataset.sound]?.();
      flashLabel(key.dataset.label || key.dataset.sound);
    });
  });
  demoKeyboard.querySelectorAll('.demo-key-combo').forEach(combo => {
    combo.addEventListener('click', () => {
      ensureAudio();
      const snd = combo.dataset.sound;
      combo.classList.add('pressed');
      setTimeout(() => combo.classList.remove('pressed'), 250);
      demoSounds[snd]?.();
      flashLabel(combo.dataset.label || snd);
      if (snd === 'cow') spawnMob('🐄');
      if (snd === 'pig') spawnMob('🐷');
      if (snd === 'xp') showDemoXPPop();
    });
  });
}

// Auto-demo sequence
const _dirtKeys = demoKeyboard ? demoKeyboard.querySelectorAll('.demo-key[data-sound="dirt"]') : [];
const _delKey   = demoKeyboard ? demoKeyboard.querySelector('.demo-key[data-sound="gravel"]') : null;
const _comboXP  = demoKeyboard ? demoKeyboard.querySelector('.demo-key-combo[data-sound="xp"]') : null;
const _comboCow = demoKeyboard ? demoKeyboard.querySelector('.demo-key-combo[data-sound="cow"]') : null;
const _comboPig = demoKeyboard ? demoKeyboard.querySelector('.demo-key-combo[data-sound="pig"]') : null;
const _comboDog = demoKeyboard ? demoKeyboard.querySelector('.demo-key-combo[data-sound="dog"]') : null;
const _comboLvl = demoKeyboard ? demoKeyboard.querySelector('.demo-key-combo[data-sound="levelup"]') : null;

function pressCombo(el, snd, label, mob) {
  if (!el) return;
  el.classList.add('pressed');
  setTimeout(() => el.classList.remove('pressed'), 260);
  demoSounds[snd]?.();
  flashLabel(label);
  if (mob) spawnMob(mob);
  if (snd === 'xp') showDemoXPPop();
}

const autoSteps = [
  [() => { const k = _dirtKeys[0]; pressKeyEl(k); demoSounds.dirt?.(); flashLabel('Any Key → 🪨 Dirt block place'); }, 1300],
  [() => { const k = _dirtKeys[1]; pressKeyEl(k); demoSounds.dirt?.(); flashLabel('Any Key → 🪨 Dirt block place'); }, 1200],
  [() => { const k = _dirtKeys[2]; pressKeyEl(k); demoSounds.dirt?.(); flashLabel('Any Key → 🪨 Dirt block place'); }, 1200],
  [() => { pressKeyEl(_delKey); demoSounds.gravel?.(); flashLabel('Delete → Gravel break'); }, 1800],
  [() => { const k = _dirtKeys[3]; pressKeyEl(k); demoSounds.dirt?.(); flashLabel('Any Key → 🪨 Dirt block place'); }, 1200],
  [() => pressCombo(_comboXP, 'xp', 'Cmd + S → ✨ XP orb pickup'), 2000],
  [() => pressCombo(_comboCow, 'cow', 'Cmd + C → 🐄 Cow moo!', '🐄'), 3500],
  [() => { const k = _dirtKeys[0]; pressKeyEl(k); demoSounds.dirt?.(); flashLabel('Any Key → 🪨 Dirt block place'); }, 1200],
  [() => pressCombo(_comboPig, 'pig', 'Cmd + V → 🐷 Pig oink!', '🐷'), 3500],
  [() => pressCombo(_comboDog, 'dog', 'Cmd + Z → 🐕 Dog bark!'), 2000],
  [() => { const k = _dirtKeys[1]; pressKeyEl(k); demoSounds.dirt?.(); flashLabel('Any Key → 🪨 Dirt block place'); }, 1200],
  [() => pressCombo(_comboLvl, 'levelup', 'Level Up → 🎵 Fanfare!'), 2200],
];

let _autoIdx = 0, _autoTimer = null, _autoRunning = false;

function runAutoStep() {
  if (!_autoRunning) return;
  const [fn, delay] = autoSteps[_autoIdx % autoSteps.length];
  fn();
  _autoIdx++;
  _autoTimer = setTimeout(runAutoStep, delay);
}

const demoSection = document.getElementById('sounds');
if (demoSection) {
  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !_autoRunning) {
        _autoRunning = true;
        _autoTimer = setTimeout(runAutoStep, 600);
      } else if (!e.isIntersecting) {
        _autoRunning = false;
        clearTimeout(_autoTimer);
      }
    });
  }, { threshold: 0.25 }).observe(demoSection);
}

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

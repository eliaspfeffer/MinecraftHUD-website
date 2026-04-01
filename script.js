// ── FRIEND SHARE ─────────────────────────────────────────────
function copyFriendLink() {
  const input = document.getElementById('friendLink');
  const btn = document.querySelector('.btn-copy');
  navigator.clipboard.writeText(input.value).then(() => {
    btn.textContent = 'COPIED!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'COPY'; btn.classList.remove('copied'); }, 2000);
  }).catch(() => {
    input.select();
    document.execCommand('copy');
  });
}

// ── OS DETECTION + TASKBAR ───────────────────────────────────
const OS = (() => {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'mac';
  if (/Macintosh|MacIntel|Mac OS X/.test(ua)) return 'mac';
  if (/Win32|Win64|Windows/.test(ua)) return 'windows';
  if (/Linux|X11|Ubuntu/.test(ua)) return 'linux';
  return 'mac';
})();

let DOCK_HEIGHT = 0;

const MAC_APPS = [
  {icon:'🗂️', label:'Finder'},
  {icon:'🌐', label:'Safari'},
  {icon:'💻', label:'VS Code', running:true},
  {icon:'📧', label:'Mail'},
  {icon:'📷', label:'Photos'},
  {icon:'🎵', label:'Music'},
  {icon:'📅', label:'Calendar'},
  {icon:'📝', label:'Notes'},
  {icon:'⚙️', label:'Settings'},
];
const WIN_APPS = [
  {icon:'🌐', label:'Edge'},
  {icon:'📁', label:'File Explorer'},
  {icon:'💻', label:'VS Code', running:true},
  {icon:'📧', label:'Mail'},
  {icon:'👥', label:'Teams'},
  {icon:'🎵', label:'Spotify'},
];
const LINUX_APPS = [
  {icon:'📁', label:'Files', running:true},
  {icon:'🌐', label:'Firefox'},
  {icon:'💻', label:'Terminal', running:true},
  {icon:'⚙️', label:'Settings'},
  {icon:'🎨', label:'GIMP'},
];

function buildDock() {
  const el = document.createElement('div');

  if (OS === 'mac') {
    DOCK_HEIGHT = 78;
    el.className = 'os-dock mac-dock';
    const inner = document.createElement('div');
    inner.className = 'dock-inner';
    MAC_APPS.forEach(a => {
      const app = document.createElement('div');
      app.className = 'dock-app' + (a.running ? ' running' : '');
      app.title = a.label;
      app.textContent = a.icon;
      app.addEventListener('click', () => { playSound('pop'); app.style.animation = 'dock-bounce 0.4s ease'; setTimeout(() => app.style.animation = '', 400); });
      inner.appendChild(app);
    });
    const sep = document.createElement('div'); sep.className = 'dock-sep'; inner.appendChild(sep);
    const trash = document.createElement('div'); trash.className = 'dock-app'; trash.title = 'Trash'; trash.textContent = '🗑️'; inner.appendChild(trash);
    el.appendChild(inner);

    // Magnification on mouse move
    el.addEventListener('mousemove', (e) => {
      const apps = inner.querySelectorAll('.dock-app');
      apps.forEach(app => {
        const r = app.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const dist = Math.abs(e.clientX - cx);
        const scale = dist < 110 ? 1 + (1 - dist / 110) * 0.65 : 1;
        const ty = dist < 110 ? -(1 - dist / 110) * 16 : 0;
        app.style.transform = `scale(${scale.toFixed(3)}) translateY(${ty.toFixed(1)}px)`;
      });
    });
    el.addEventListener('mouseleave', () => {
      inner.querySelectorAll('.dock-app').forEach(a => a.style.transform = '');
    });

  } else if (OS === 'windows') {
    DOCK_HEIGHT = 48;
    el.className = 'os-dock win-taskbar';
    el.innerHTML = `
      <div class="win-start" title="Start">⊞</div>
      <div class="win-apps">
        ${WIN_APPS.map(a => `<div class="win-app${a.running?' running':''}" title="${a.label}">${a.icon}</div>`).join('')}
      </div>
      <div class="win-tray">
        <span title="Volume">🔊</span>
        <span title="Network">🌐</span>
        <span title="Battery">🔋</span>
        <span class="win-clock" id="osClock"></span>
      </div>`;

  } else {
    // Linux GNOME
    DOCK_HEIGHT = 48;
    el.className = 'os-dock linux-taskbar';
    el.innerHTML = `
      <div class="linux-left">
        <div class="linux-activities">Activities</div>
      </div>
      <div class="linux-center">
        ${LINUX_APPS.map(a => `<div class="linux-app${a.running?' running':''}" title="${a.label}">${a.icon}</div>`).join('')}
      </div>
      <div class="linux-right">
        <span class="linux-indicators">🔊 🌐 🔋</span>
        <span class="linux-clock" id="osClock"></span>
      </div>`;
  }

  document.body.appendChild(el);
  document.documentElement.style.setProperty('--dock-height', DOCK_HEIGHT + 'px');
}

buildDock();

// ── CANVAS BACKGROUND ────────────────────────────────────────
const bgCanvas = document.getElementById('bg');
const bgCtx = bgCanvas.getContext('2d');
bgCtx.imageSmoothingEnabled = false;

let BW, BH, groundY;
let bgTick = 0, mtnScroll = 0, treeScroll = 0;

function initBg() {
  BW = bgCanvas.width  = window.innerWidth;
  BH = bgCanvas.height = window.innerHeight;
  groundY = BH - 72 - DOCK_HEIGHT;
}
initBg();
window.addEventListener('resize', () => { initBg(); initClouds(); });

// ── Color helpers ──
function lerpColor(a, b, t) {
  const ah = parseInt(a.slice(1), 16), bh = parseInt(b.slice(1), 16);
  const ar = (ah>>16)&255, ag = (ah>>8)&255, ab = ah&255;
  const br = (bh>>16)&255, bg = (bh>>8)&255, bb = bh&255;
  return `rgb(${Math.round(ar+(br-ar)*t)},${Math.round(ag+(bg-ag)*t)},${Math.round(ab+(bb-ab)*t)})`;
}

// Sky color keyframes [dayProgress, topColor, bottomColor]
const SKY = [
  [0.00, '#050512', '#0C0C26'],
  [0.20, '#050512', '#0C0C26'],
  [0.25, '#C85000', '#FF8C30'],
  [0.33, '#56AADC', '#A2D8FF'],
  [0.50, '#3688C0', '#6BBEE0'],
  [0.67, '#56AADC', '#A2D8FF'],
  [0.75, '#C44000', '#FF7524'],
  [0.83, '#180628', '#330C44'],
  [0.90, '#050512', '#0C0C26'],
  [1.00, '#050512', '#0C0C26'],
];

function getSkyColors(dp) {
  for (let i = 0; i < SKY.length - 1; i++) {
    if (dp >= SKY[i][0] && dp < SKY[i+1][0]) {
      const t = (dp - SKY[i][0]) / (SKY[i+1][0] - SKY[i][0]);
      return [lerpColor(SKY[i][1], SKY[i+1][1], t), lerpColor(SKY[i][2], SKY[i+1][2], t)];
    }
  }
  return [SKY[0][1], SKY[0][2]];
}

function getNightAlpha(dp) {
  if (dp < 0.22) return 1;
  if (dp < 0.30) return 1 - (dp - 0.22) / 0.08;
  if (dp > 0.78) return (dp - 0.78) / 0.07;
  if (dp > 0.70) return 0;
  return 0;
}

function getDayProgress() {
  const n = new Date();
  return (n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds() + n.getMilliseconds() / 1000) / 86400;
}

// ── Stars ──
const STARS = Array.from({length: 70}, (_, i) => ({
  x:  (Math.sin(i * 137.508 * Math.PI / 180) * 0.5 + 0.5),
  y:  (Math.cos(i * 83.23  * Math.PI / 180) * 0.5 + 0.5) * 0.66,
  s:  (i % 7 === 0) ? 3 : 2,
  tw: i % 4,
}));

function drawStars(dp) {
  const na = getNightAlpha(dp);
  if (na < 0.02) return;
  STARS.forEach(({x, y, s, tw}) => {
    const fl = tw === 0 ? (0.6 + Math.sin(bgTick * 0.07 + x * 12) * 0.4) : 1;
    bgCtx.fillStyle = `rgba(255,255,220,${na * 0.85 * fl})`;
    bgCtx.fillRect(Math.round(x * BW), Math.round(y * BH), s, s);
  });
}

// ── Moon ──
function drawMoon(dp) {
  const na = getNightAlpha(dp);
  if (na < 0.02) return;
  const moonDp = (dp + 0.5) % 1;
  if (moonDp < 0.22 || moonDp > 0.78) return;
  const t  = (moonDp - 0.22) / 0.56;
  const cx = Math.round(BW * (1 - t));
  const cy = Math.round(groundY * 0.10 + (1 - Math.sin(t * Math.PI)) * groundY * 0.44);
  bgCtx.fillStyle = `rgba(215,215,255,${na})`;
  bgCtx.fillRect(cx - 18, cy - 18, 36, 36);
  bgCtx.fillStyle = `rgba(155,155,200,${na * 0.5})`;
  bgCtx.fillRect(cx + 4,  cy - 9, 8, 8);
  bgCtx.fillRect(cx - 12, cy + 4, 7, 7);
}

// ── Sun ──
function drawSun(dp) {
  if (dp < 0.22 || dp > 0.78) return;
  const t  = (dp - 0.22) / 0.56;
  const cx = Math.round(BW * (1 - t));
  const cy = Math.round(groundY * 0.10 + (1 - Math.sin(t * Math.PI)) * groundY * 0.55);
  bgCtx.fillStyle = '#FFD700';
  bgCtx.fillRect(cx - 22, cy - 22, 44, 44);
  bgCtx.fillStyle = '#FFF060';
  [[-36,-8],[-8,-38],[18,-38],[32,-8],[32,16],[18,28],[-8,28],[-36,16]].forEach(([rx, ry]) => {
    bgCtx.fillRect(cx + rx, cy + ry, 10, 10);
  });
}

// ── Clouds ──
const CLOUD_SHAPES = [
  [[1,1],[2,1],[3,1],[4,1],[2,0],[3,0]],
  [[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[1,0],[2,0],[3,0],[4,0],[2,-1],[3,-1]],
  [[0,0],[1,0],[2,0],[1,-1],[1,1],[2,1]],
];
let clouds = [];
function initClouds() {
  clouds = Array.from({length: 8}, (_, i) => ({
    x:     Math.random() * BW,
    y:     BH * (0.06 + i * 0.025 + Math.random() * 0.02),
    speed: 0.10 + Math.random() * 0.20,
    bs:    14 + Math.floor(Math.random() * 14),
    shape: i % 3,
    alpha: 0.76 + Math.random() * 0.20,
  }));
}
initClouds();

function drawClouds(dp) {
  const dim = (dp > 0.3 && dp < 0.7) ? 1.0 : 0.42;
  clouds.forEach(c => {
    c.x -= c.speed;
    if (c.x < -c.bs * 8) c.x = BW + 24;
    bgCtx.fillStyle = `rgba(255,255,255,${c.alpha * dim})`;
    CLOUD_SHAPES[c.shape].forEach(([bx, by]) => {
      bgCtx.fillRect(Math.round(c.x + bx * c.bs), Math.round(c.y + by * c.bs), c.bs, c.bs);
    });
  });
}

// ── Mountains ──
const MTNS = [
  {xf:0.04, hf:0.18, wf:0.08}, {xf:0.14, hf:0.24, wf:0.10},
  {xf:0.26, hf:0.15, wf:0.07}, {xf:0.38, hf:0.22, wf:0.09},
  {xf:0.50, hf:0.20, wf:0.08}, {xf:0.63, hf:0.27, wf:0.11},
  {xf:0.75, hf:0.17, wf:0.07}, {xf:0.86, hf:0.23, wf:0.09},
  {xf:0.96, hf:0.19, wf:0.08}, {xf:1.07, hf:0.21, wf:0.09},
  {xf:1.20, hf:0.16, wf:0.07},
];

function drawMountains() {
  bgCtx.fillStyle = '#1A3A1A';
  bgCtx.beginPath();
  bgCtx.moveTo(0, groundY);
  MTNS.forEach(p => {
    const px = ((p.xf * BW - mtnScroll * 0.22) % (BW * 1.3) + BW * 1.3) % (BW * 1.3) - BW * 0.15;
    const ph = groundY - p.hf * BH;
    const hw = p.wf * BW * 0.5;
    bgCtx.lineTo(px - hw, groundY);
    bgCtx.lineTo(px, ph);
    bgCtx.lineTo(px + hw, groundY);
  });
  bgCtx.lineTo(BW, groundY);
  bgCtx.closePath();
  bgCtx.fill();
}

// ── Trees ──
const TREE_XFS = [0.03, 0.11, 0.20, 0.30, 0.40, 0.51, 0.61, 0.70, 0.79, 0.88, 0.97];

function drawTree(x, gY, bs) {
  x = Math.round(x);
  bgCtx.fillStyle = '#3A2010';
  bgCtx.fillRect(x, gY - 4 * bs, bs, 4 * bs);
  bgCtx.fillStyle = '#164616';
  bgCtx.fillRect(x - 2*bs, gY - 6*bs, 5*bs, 2*bs);
  bgCtx.fillStyle = '#1C5E1C';
  bgCtx.fillRect(x - 2*bs, gY - 7*bs, 5*bs, bs);
  bgCtx.fillRect(x - bs,   gY - 8*bs, 3*bs, bs);
  bgCtx.fillStyle = '#24801A';
  bgCtx.fillRect(x - bs,   gY - 9*bs,  3*bs, bs);
  bgCtx.fillRect(x,         gY - 10*bs, bs,   bs);
}

function drawTrees() {
  const bs = Math.max(7, Math.floor(BW / 90));
  TREE_XFS.forEach(xf => {
    const tx = ((xf * BW - treeScroll * 0.5) % (BW * 1.12) + BW * 1.12) % (BW * 1.12) - BW * 0.06;
    drawTree(tx, groundY, bs);
  });
}

// ── Ground ──
function drawGround() {
  bgCtx.fillStyle = '#367014';
  bgCtx.fillRect(0, groundY, BW, 20);
  bgCtx.fillStyle = '#52A020';
  bgCtx.fillRect(0, groundY, BW, 7);
  bgCtx.fillStyle = '#724A20';
  bgCtx.fillRect(0, groundY + 20, BW, BH);
  bgCtx.fillStyle = 'rgba(255,255,255,0.035)';
  for (let gx = 0; gx < BW; gx += 28) bgCtx.fillRect(gx, groundY, 14, 7);
}

// ── Birds ──
const BIRDS = Array.from({length: 4}, (_, i) => ({
  x: Math.random() * BW,
  y: BH * (0.15 + i * 0.05 + Math.random() * 0.04),
  speed: 0.45 + Math.random() * 0.6,
}));

function drawBirds(dp) {
  if (dp < 0.33 || dp > 0.67) return;
  bgCtx.fillStyle = 'rgba(8,16,8,0.78)';
  const flap = bgTick % 10 < 5;
  BIRDS.forEach(b => {
    b.x -= b.speed;
    if (b.x < -15) { b.x = BW + 12; b.y = BH * (0.10 + Math.random() * 0.28); }
    const bx = Math.round(b.x), by = Math.round(b.y);
    const dy = flap ? -3 : 3;
    bgCtx.fillRect(bx - 7, by + dy, 5, 2);
    bgCtx.fillRect(bx - 1, by,      4, 3);
    bgCtx.fillRect(bx + 4, by + dy, 5, 2);
  });
}

// ── Render loop ──
function renderBackground() {
  bgTick++;
  mtnScroll  += 0.35;
  treeScroll += 0.70;

  const dp = getDayProgress();
  const [skyTop, skyBot] = getSkyColors(dp);
  const grad = bgCtx.createLinearGradient(0, 0, 0, BH);
  grad.addColorStop(0, skyTop);
  grad.addColorStop(1, skyBot);
  bgCtx.fillStyle = grad;
  bgCtx.fillRect(0, 0, BW, BH);

  drawStars(dp);
  drawMoon(dp);
  drawSun(dp);
  drawClouds(dp);
  drawMountains();
  drawTrees();
  drawGround();
  drawBirds(dp);
}
setInterval(renderBackground, 1000 / 30);

// ── MENU BAR CLOCK ────────────────────────────────────────────
const menubarTime = document.getElementById('menubarTime');
function updateClock() {
  if (!menubarTime) return;
  const n = new Date();
  menubarTime.textContent =
    `${n.getHours().toString().padStart(2,'0')}:${n.getMinutes().toString().padStart(2,'0')}`;
}
updateClock();
setInterval(updateClock, 10000);

// Dock/taskbar clock (Windows + Linux)
const osClock = document.getElementById('osClock');
function updateOsClock() {
  if (!osClock) return;
  const n = new Date();
  const h = n.getHours(), m = n.getMinutes();
  const time = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
  if (OS === 'windows') {
    const date = n.toLocaleDateString('en-GB', {day:'2-digit', month:'2-digit', year:'numeric'});
    osClock.innerHTML = `<span>${time}</span><span>${date}</span>`;
  } else {
    osClock.textContent = time;
  }
}
updateOsClock();
setInterval(updateOsClock, 10000);

// ── KILL FEED ─────────────────────────────────────────────────
const killfeed = document.getElementById('killfeed');
const kfApps    = ['Figma','Slack','Discord','VS Code','Safari','Terminal','Xcode','Notion','Linear','Spotify','Zoom','Chrome','Firefox'];
const kfPhrases = ['was slain','eliminated','has fallen','got rekt','is no more','defeated'];

setInterval(() => {
  if (!killfeed) return;
  const app    = kfApps[Math.floor(Math.random() * kfApps.length)];
  const phrase = kfPhrases[Math.floor(Math.random() * kfPhrases.length)];
  const item   = document.createElement('div');
  item.className = 'kf-item';
  item.textContent = `${app} ${phrase}`;
  item.style.opacity = '0';
  item.style.transition = 'opacity 0.3s';
  killfeed.prepend(item);
  setTimeout(() => item.style.opacity = '0.9', 30);
  const items = killfeed.querySelectorAll('.kf-item');
  if (items.length > 4) {
    const last = items[items.length - 1];
    last.style.opacity = '0';
    setTimeout(() => last.remove(), 300);
  }
}, 3000);

// ── XP BAR ────────────────────────────────────────────────────
const xpFill  = document.getElementById('xpFill');
const xpText  = document.getElementById('xpText');
const xpPopup = document.getElementById('xpPopup');

setTimeout(() => { if (xpFill) xpFill.style.width = '62%'; }, 500);

let xpVal = 62;
setInterval(() => {
  if (!xpFill) return;
  xpVal += Math.random() * 2.2;
  if (xpVal >= 100) {
    xpVal = 0;
    if (xpText) xpText.textContent = 'Level 8 · 0 XP';
    xpFill.style.transition = 'width 0.1s';
    setTimeout(() => { xpFill.style.transition = 'width 1.5s cubic-bezier(0.16,1,0.3,1)'; }, 150);
    playSound('level_up');
  } else {
    if (xpText) xpText.textContent = `Level 7 · ${Math.round(xpVal * 50).toLocaleString()} XP`;
  }
  xpFill.style.width = xpVal + '%';
}, 450);

function showXPPopup() {
  if (!xpPopup) return;
  xpPopup.textContent = ['+1 XP', '+2 XP', '+5 XP'][Math.floor(Math.random() * 3)];
  xpPopup.style.animation = 'none';
  xpPopup.style.opacity   = '1';
  void xpPopup.offsetWidth;
  xpPopup.style.animation = 'float-up 1.4s ease-out forwards';
}
setInterval(showXPPopup, 2200);

// ── HEART PULSE ───────────────────────────────────────────────
const halfHeart = document.querySelector('.h.half');
const offHeart  = document.querySelector('.h.off');
setInterval(() => {
  [halfHeart, offHeart].forEach(h => {
    if (!h) return;
    h.style.transition = 'opacity 0.25s';
    h.style.opacity = h.style.opacity === '0.25' ? '1' : '0.25';
  });
}, 700);

// ── AUDIO ─────────────────────────────────────────────────────
let _audioUnlocked = false;
const _audioCache  = {};

function ensureAudio() {
  _audioUnlocked = true;
  const hint = document.getElementById('soundHint');
  if (hint) hint.style.display = 'none';
}
document.addEventListener('click', ensureAudio, { once: true });

function playSound(name) {
  if (!_audioUnlocked) return;
  try {
    if (!_audioCache[name]) {
      const a = new Audio(`sounds/${name}.mp3`);
      a.volume = 0.75;
      _audioCache[name] = a;
    }
    const snd = _audioCache[name].cloneNode();
    snd.volume = 0.75;
    snd.play().catch(() => {});
  } catch (e) {}
}

function playCow()  { playSound(`cow${Math.ceil(Math.random() * 4)}`); }
function playPig()  { playSound(`pig${Math.ceil(Math.random() * 3)}`); }

// ── MOBS ──────────────────────────────────────────────────────
const mobLayer = document.getElementById('mobLayer');

// Preload sprites
const cowSprites = [new Image(), new Image()];
cowSprites[0].src = 'sprites/cow_walk1.png';
cowSprites[1].src = 'sprites/cow_walk2.png';
const pigSprites = [new Image(), new Image()];
pigSprites[0].src = 'sprites/pig_walk1.png';
pigSprites[1].src = 'sprites/pig_walk2.png';

function spawnMob() {
  if (!mobLayer) return;
  const isCow   = Math.random() < 0.58;
  const sprites  = isCow ? cowSprites : pigSprites;
  const fromRight = Math.random() < 0.72;
  const dur       = 9 + Math.random() * 9;
  const W         = window.innerWidth;
  const bottomPx  = DOCK_HEIGHT + 74 + Math.random() * 18;
  const scale     = 0.9 + Math.random() * 0.5;

  // Walking animation: swap sprites every ~300ms
  const mob = document.createElement('div');
  mob.className = 'mob ' + (fromRight ? 'rtl' : 'ltr');
  mob.style.bottom = bottomPx + 'px';
  mob.style.left   = (fromRight ? W + 70 : -90) + 'px';
  mob.style.transition = `left ${dur}s linear`;

  const inner = document.createElement('div');
  inner.className = 'mob-inner';

  const img = document.createElement('img');
  img.className = 'mob-sprite';
  img.src   = sprites[0].src;
  img.style.width = Math.round(56 * scale) + 'px';
  inner.appendChild(img);
  mob.appendChild(inner);
  mobLayer.appendChild(mob);

  // Walk cycle: swap sprite frame
  let frame = 0;
  const walkTimer = setInterval(() => {
    frame = 1 - frame;
    img.src = sprites[frame].src;
  }, 280);

  // Play sound
  if (isCow) playCow(); else playPig();

  // Start walking
  requestAnimationFrame(() => requestAnimationFrame(() => {
    mob.style.left = (fromRight ? -100 : W + 80) + 'px';
  }));

  setTimeout(() => {
    clearInterval(walkTimer);
    mob.remove();
  }, (dur + 1) * 1000);
}

// Spawn schedule
setTimeout(spawnMob, 1200);
setTimeout(spawnMob, 4000);
setInterval(() => { if (Math.random() < 0.75) spawnMob(); }, 5500);

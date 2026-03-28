// Animate XP bar on load
window.addEventListener('load', () => {
  const bar = document.getElementById('xpBar');
  if (bar) {
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.transition = 'width 1.2s ease-out';
      bar.style.width = '73%';
    }, 500);
  }
});

// Notify form
function handleNotify(e) {
  e.preventDefault();
  document.getElementById('notifyConfirm').style.display = 'block';
  e.target.reset();
}

// Randomly flicker kill feed items for fun
document.addEventListener('DOMContentLoaded', () => {
  const killItems = document.querySelectorAll('.kill-item');
  setInterval(() => {
    killItems.forEach(item => {
      const current = parseFloat(item.style.opacity || 1);
      if (Math.random() > 0.85) {
        item.style.transition = 'opacity 0.3s';
        item.style.opacity = Math.max(0.1, current - 0.08);
      }
    });
  }, 800);

  // Add new "kill" items occasionally for demo
  const killfeed = document.querySelector('.killfeed');
  const apps = ['Figma', 'Slack', 'Discord', 'VS Code', 'Safari', 'Terminal', 'Finder', 'Xcode'];
  const phrases = ['was slain', 'eliminated', 'has fallen', 'got rekt', 'is no more'];
  let killCount = 0;
  setInterval(() => {
    if (!killfeed || killCount > 6) return;
    const app = apps[Math.floor(Math.random() * apps.length)];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    const item = document.createElement('div');
    item.className = 'kill-item';
    item.textContent = `${app} ${phrase}`;
    item.style.opacity = '0';
    item.style.transition = 'opacity 0.4s';
    killfeed.prepend(item);
    setTimeout(() => item.style.opacity = '1', 50);
    killCount++;
    // Remove oldest if more than 4
    const allItems = killfeed.querySelectorAll('.kill-item');
    if (allItems.length > 4) {
      const last = allItems[allItems.length - 1];
      last.style.opacity = '0';
      setTimeout(() => last.remove(), 400);
    }
  }, 3500);

  // Pulse hearts when battery is "low" (demo: just animate last 2 hearts)
  const hearts = document.querySelectorAll('.heart.half, .heart.empty');
  setInterval(() => {
    hearts.forEach(h => {
      h.style.transition = 'opacity 0.3s';
      h.style.opacity = h.style.opacity === '0.3' ? '1' : '0.3';
    });
  }, 900);
});

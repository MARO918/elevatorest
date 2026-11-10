

(() => {
  const doorLeft = document.getElementById('doorLeft');
  const doorRight = document.getElementById('doorRight');
  const doorValue = document.getElementById('doorValue');
  const openBtn = document.getElementById('openBtn');
  const shaft = document.getElementById('shaft');
  const gapGlow = document.getElementById('gapGlow');
  const overlayMsg = document.getElementById('overlayMsg');
  const resultText = document.getElementById('resultText');
  const bestText = document.getElementById('bestText');
  const restartBtn = document.getElementById('restartBtn');
  const timeStat = document.getElementById('timeStat');
  const pressStat = document.getElementById('pressStat');
  const bestStat = document.getElementById('bestStat');

  const MAX_WIDTH = 50; // % width each door occupies when fully closed
  const CLOSE_RATE_PER_SEC = 6; // % per second doors close on their own
  const PUSH_PER_PRESS = 3.2; // % opened back per button press

  let openness = 100; // 100 = fully open, 0 = fully closed
  let doorPct = () => (100 - openness) / 100 * MAX_WIDTH;

  let running = false;
  let startTime = 0;
  let elapsed = 0;
  let presses = 0;
  let best = parseFloat(localStorage.getItem('elevatorBest') || '0');
  let lastFrame = 0;
  let rafId = null;

  bestStat.textContent = best.toFixed(1);

  function render() {
    const pct = doorPct();
    doorLeft.style.width = pct + '%';
    doorRight.style.width = pct + '%';
    const openPctDisplay = Math.max(0, Math.round(openness));
    doorValue.textContent = (openPctDisplay <= 15 ? 'DANGER ' : 'OPEN ') + openPctDisplay + '%';
    doorValue.classList.toggle('danger', openPctDisplay <= 25);
    const gapWidth = Math.max(0, (100 - pct * 2));
    gapGlow.style.opacity = openness < 40 ? (1 - openness/40) * 0.8 : 0;
  }

  function tick(ts) {
    if (!running) return;
    if (!lastFrame) lastFrame = ts;
    const dt = (ts - lastFrame) / 1000;
    lastFrame = ts;

    openness -= CLOSE_RATE_PER_SEC * dt;
    elapsed = (ts - startTime) / 1000;
    timeStat.textContent = elapsed.toFixed(1);

    if (openness <= 0) {
      openness = 0;
      render();
      endGame();
      return;
    }

    render();
    rafId = requestAnimationFrame(tick);
  }

  function startGame() {
    openness = 100;
    presses = 0;
    elapsed = 0;
    lastFrame = 0;
    running = true;
    overlayMsg.classList.remove('show');
    openBtn.disabled = false;
    pressStat.textContent = '0';
    timeStat.textContent = '0.0';
    render();
    startTime = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function endGame() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    openBtn.disabled = true;
    shaft.classList.add('shake');
    setTimeout(() => shaft.classList.remove('shake'), 250);

    if (elapsed > best) {
      best = elapsed;
      localStorage.setItem('elevatorBest', best.toFixed(2));
    }
    bestStat.textContent = best.toFixed(1);
    resultText.textContent = `生存時間: ${elapsed.toFixed(1)}秒 / 連打数: ${presses}`;
    bestText.textContent = `ベスト: ${best.toFixed(1)}秒`;
    overlayMsg.classList.add('show');
  }

  function press() {
    if (!running) return;
    openness = Math.min(100, openness + PUSH_PER_PRESS);
    presses++;
    pressStat.textContent = presses;
    render();
  }

  openBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    press();
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.key === 'Enter') {
      e.preventDefault();
      press();
    }
  });

  restartBtn.addEventListener('click', startGame);

  render();
  startGame();
})();

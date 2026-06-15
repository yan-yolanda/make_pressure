/**
 * Shared 2-minute session timer for timed tasks.
 */
const SessionTimer = (() => {
  const SESSION_TIME = 120000;

  function formatTime(ms) {
    const totalSec = Math.ceil(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  function create({ barEl, labelEl, onEnd }) {
    let timerId = null;
    let rafId = null;
    let startAt = 0;

    function clear() {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    function updateUI(elapsed) {
      const remaining = Math.max(0, SESSION_TIME - elapsed);
      const ratio = remaining / SESSION_TIME;
      barEl.style.transform = `scaleX(${ratio})`;
      labelEl.textContent = formatTime(remaining);
      barEl.classList.toggle("urgent", ratio < 0.1);
    }

    function resetUI() {
      barEl.style.transform = "scaleX(1)";
      labelEl.textContent = formatTime(SESSION_TIME);
      barEl.classList.remove("urgent");
    }

    function tick() {
      const elapsed = performance.now() - startAt;
      updateUI(elapsed);
      if (elapsed < SESSION_TIME) {
        rafId = requestAnimationFrame(tick);
      }
    }

    function start() {
      clear();
      startAt = performance.now();
      updateUI(0);
      rafId = requestAnimationFrame(tick);
      timerId = setTimeout(onEnd, SESSION_TIME);
    }

    return { start, clear, resetUI };
  }

  return { create, SESSION_TIME, formatTime };
})();

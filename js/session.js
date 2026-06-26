/**
 * Shared session timer for timed tasks.
 */
const SessionTimer = (() => {
  const DEFAULT_SESSION_TIME = 120000;

  function formatTime(ms) {
    const totalSec = Math.ceil(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  function create({ barEl, labelEl, onEnd, duration = DEFAULT_SESSION_TIME }) {
    let timerId = null;
    let rafId = null;
    let startAt = 0;
    let sessionTime = duration;

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
      const remaining = Math.max(0, sessionTime - elapsed);
      const ratio = remaining / sessionTime;
      barEl.style.transform = `scaleX(${ratio})`;
      labelEl.textContent = formatTime(remaining);
      barEl.classList.toggle("urgent", ratio < 0.1);
    }

    function resetUI() {
      barEl.style.transform = "scaleX(1)";
      labelEl.textContent = formatTime(sessionTime);
      barEl.classList.remove("urgent");
    }

    function tick() {
      const elapsed = performance.now() - startAt;
      updateUI(elapsed);
      if (elapsed < sessionTime) {
        rafId = requestAnimationFrame(tick);
      }
    }

    function start() {
      clear();
      startAt = performance.now();
      updateUI(0);
      rafId = requestAnimationFrame(tick);
      timerId = setTimeout(onEnd, sessionTime);
    }

    function setDuration(newDuration) {
      sessionTime = newDuration;
      resetUI();
    }

    return { start, clear, resetUI, setDuration };
  }

  return { create, DEFAULT_SESSION_TIME, formatTime };
})();

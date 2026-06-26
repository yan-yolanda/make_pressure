/**
 * Shared session timer for timed tasks.
 */
const SessionTimer = (() => {
  const DEFAULT_SESSION_TIME = 120000;

  function formatTime(ms) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  function create({ labelEl, onEnd, duration = DEFAULT_SESSION_TIME }) {
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
      labelEl.textContent = formatTime(remaining);
      labelEl.classList.toggle("urgent", ratio < 0.1);
    }

    function resetUI() {
      labelEl.textContent = formatTime(sessionTime);
      labelEl.classList.remove("urgent");
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

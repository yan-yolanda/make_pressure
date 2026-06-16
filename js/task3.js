/**
 * Task 3: Expression Imitation (2-minute session)
 */
const Task3 = (() => {
  const SESSION_TIME = 120000;

  let state = "idle"; // idle | playing | done
  let sessionTimer = null;
  let doneTimer = null;
  let rafId = null;
  let timerStart = 0;

  const els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function cacheElements() {
    els.timerBar = $("t3-timer-bar");
    els.timerLabel = $("t3-timer-label");
    els.startPanel = $("t3-start-panel");
    els.startBtn = $("t3-start");
    els.overlay = $("t3-overlay");
  }

  function formatTime(ms) {
    const totalSec = Math.ceil(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  function clearSessionTimer() {
    if (sessionTimer !== null) {
      clearTimeout(sessionTimer);
      sessionTimer = null;
    }
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function clearDoneTimer() {
    if (doneTimer !== null) {
      clearTimeout(doneTimer);
      doneTimer = null;
    }
  }

  function updateTimerUI(elapsed) {
    const remaining = Math.max(0, SESSION_TIME - elapsed);
    const ratio = remaining / SESSION_TIME;
    els.timerBar.style.transform = `scaleX(${ratio})`;
    els.timerLabel.textContent = formatTime(remaining);
    els.timerBar.classList.toggle("urgent", ratio < 0.1);
  }

  function resetTimerUI() {
    els.timerBar.style.transform = "scaleX(1)";
    els.timerLabel.textContent = formatTime(SESSION_TIME);
    els.timerBar.classList.remove("urgent");
  }

  function tickTimer() {
    const elapsed = performance.now() - timerStart;
    updateTimerUI(elapsed);
    if (elapsed < SESSION_TIME) {
      rafId = requestAnimationFrame(tickTimer);
    }
  }

  function startSessionTimer() {
    clearSessionTimer();
    timerStart = performance.now();
    updateTimerUI(0);
    rafId = requestAnimationFrame(tickTimer);
    sessionTimer = setTimeout(onSessionEnd, SESSION_TIME);
  }

  function showStartPanel(show) {
    els.startPanel.classList.toggle("hidden", !show);
  }

  function showOverlay(show) {
    els.overlay.classList.toggle("hidden", !show);
    els.overlay.setAttribute("aria-hidden", String(!show));
  }

  function onSessionEnd() {
    if (state !== "playing") return;
    state = "done";
    clearSessionTimer();
    updateTimerUI(SESSION_TIME);
    els.timerLabel.textContent = "0:00";
    showOverlay(true);

    clearDoneTimer();
    doneTimer = setTimeout(() => {
      doneTimer = null;
      showOverlay(false);
      Questionnaire.show("t1", () => {
        state = "idle";
        resetTimerUI();
        showStartPanel(true);
      });
    }, 2000);
  }

  function play() {
    if (state !== "idle") return;
    state = "playing";
    showStartPanel(false);
    showOverlay(false);
    startSessionTimer();
  }

  function bindEvents() {
    els.startBtn.addEventListener("click", play);
  }

  function init() {
    cacheElements();
    bindEvents();
    resetTimerUI();
    showStartPanel(true);
    showOverlay(false);
  }

  function stop() {
    clearSessionTimer();
    clearDoneTimer();
    state = "idle";
    resetTimerUI();
    showOverlay(false);
    showStartPanel(true);
  }

  return { init, stop };
})();

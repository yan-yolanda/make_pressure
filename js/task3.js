/**
 * Task 3: Expression Imitation (configurable session)
 */
const Task3 = (() => {
  const DEFAULT_SESSION_MINUTES = 2;

  let state = "idle"; // idle | playing | done
  let sessionTime = DEFAULT_SESSION_MINUTES * 60000;
  let sessionTimer = null;
  let doneTimer = null;
  let rafId = null;
  let timerStart = 0;

  const els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function cacheElements() {
    els.timerLabel = $("t3-timer-label");
    els.startPanel = $("t3-start-panel");
    els.startBtn = $("t3-start");
    els.durationInput = $("t3-duration");
    els.overlay = $("t3-overlay");
  }

  function formatTime(ms) {
    return SessionTimer.formatTime(ms);
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
    const remaining = Math.max(0, sessionTime - elapsed);
    const ratio = remaining / sessionTime;
    els.timerLabel.textContent = formatTime(remaining);
    els.timerLabel.classList.toggle("urgent", ratio < 0.1);
  }

  function resetTimerUI() {
    els.timerLabel.textContent = formatTime(sessionTime);
    els.timerLabel.classList.remove("urgent");
  }

  function setSessionDuration(minutes) {
    sessionTime = minutes * 60000;
    resetTimerUI();
  }

  function tickTimer() {
    const elapsed = performance.now() - timerStart;
    updateTimerUI(elapsed);
    if (elapsed < sessionTime) {
      rafId = requestAnimationFrame(tickTimer);
    }
  }

  function startSessionTimer() {
    clearSessionTimer();
    timerStart = performance.now();
    updateTimerUI(0);
    rafId = requestAnimationFrame(tickTimer);
    sessionTimer = setTimeout(onSessionEnd, sessionTime);
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

    const minutes = DurationSetting.readMinutes(
      els.durationInput,
      DEFAULT_SESSION_MINUTES
    );
    if (minutes === null) {
      els.durationInput.focus();
      return;
    }

    setSessionDuration(minutes);
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

/**
 * Task 1: Mental Arithmetic (subtract 13)
 */
const Task1 = (() => {
  const ANSWER_TIME = 5000;
  const PUNISH_TIME = 5000;
  const DEFAULT_SESSION_MINUTES = 5;
  const DEFAULT_FIXED_START = 1022;
  const SUBTRACT = 13;

  let currentNumber = 0;
  let answerTimer = null;
  let punishTimer = null;
  let rafId = null;
  let timerStart = 0;
  let state = "idle"; // idle | playing | punishment | finished
  let correctCount = 0;
  let wrongCount = 0;
  let session = null;
  let numberMode = "random"; // random | fixed
  let fixedStartNumber = DEFAULT_FIXED_START;

  const els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function cacheElements() {
    els.number = $("t1-number");
    els.timerBar = $("t1-timer-bar");
    els.timerLabel = $("t1-timer-label");
    els.sessionLabel = $("t1-session-label");
    els.input = $("t1-input");
    els.confirm = $("t1-confirm");
    els.overlay = $("t1-overlay");
    els.startPanel = $("t1-start-panel");
    els.startBtn = $("t1-start");
    els.durationInput = $("t1-duration");
    els.modeRandom = $("t1-mode-random");
    els.modeFixed = $("t1-mode-fixed");
    els.fixedSetting = $("t1-fixed-setting");
    els.fixedStartInput = $("t1-fixed-start");
    els.correct = $("t1-correct");
    els.wrong = $("t1-wrong");
    els.summary = $("t1-summary");
    els.summaryCorrect = $("t1-summary-correct");
    els.summaryWrong = $("t1-summary-wrong");
    els.summaryBtn = $("t1-summary-btn");
  }

  function randomFourDigit() {
    return Math.floor(Math.random() * 9000) + 1000;
  }

  function readNumberMode() {
    return els.modeFixed.checked ? "fixed" : "random";
  }

  function readFixedStartNumber() {
    const raw = String(els.fixedStartInput.value).trim();
    if (raw === "") return DEFAULT_FIXED_START;

    const number = parseInt(raw, 10);
    if (!Number.isFinite(number) || number < 1000 || number > 9999) return null;
    return number;
  }

  function updateModeUI() {
    const isFixed = readNumberMode() === "fixed";
    els.fixedStartInput.disabled = !isFixed;
    els.fixedSetting.classList.toggle("is-disabled", !isFixed);
  }

  function nextStartNumber() {
    return numberMode === "fixed" ? fixedStartNumber : randomFourDigit();
  }

  function clearAnswerTimer() {
    if (answerTimer !== null) {
      clearTimeout(answerTimer);
      answerTimer = null;
    }
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function clearPunishTimer() {
    if (punishTimer !== null) {
      clearTimeout(punishTimer);
      punishTimer = null;
    }
  }

  function clearGameplayTimers() {
    clearAnswerTimer();
    clearPunishTimer();
  }

  function updateTimerUI(elapsed) {
    const remaining = Math.max(0, ANSWER_TIME - elapsed);
    const ratio = remaining / ANSWER_TIME;
    els.timerBar.style.transform = `scaleX(${ratio})`;
    els.timerLabel.textContent = (remaining / 1000).toFixed(1) + "s";
    els.timerBar.classList.toggle("urgent", ratio < 0.3);
  }

  function resetTimerUI() {
    els.timerBar.style.transform = "scaleX(1)";
    els.timerLabel.textContent = (ANSWER_TIME / 1000).toFixed(1) + "s";
    els.timerBar.classList.remove("urgent");
  }

  function tickTimer() {
    const elapsed = performance.now() - timerStart;
    updateTimerUI(elapsed);
    if (elapsed < ANSWER_TIME) {
      rafId = requestAnimationFrame(tickTimer);
    }
  }

  function startAnswerTimer() {
    clearAnswerTimer();
    timerStart = performance.now();
    updateTimerUI(0);
    rafId = requestAnimationFrame(tickTimer);
    answerTimer = setTimeout(() => onFail("timeout"), ANSWER_TIME);
  }

  function setInputEnabled(enabled) {
    els.input.disabled = !enabled;
    els.confirm.disabled = !enabled;
    if (enabled) {
      els.input.focus();
    }
  }

  function showOverlay(show) {
    els.overlay.classList.toggle("hidden", !show);
    els.overlay.setAttribute("aria-hidden", String(!show));
  }

  function showStartPanel(show) {
    els.startPanel.classList.toggle("hidden", !show);
  }

  function showSummary(show) {
    els.summary.classList.toggle("hidden", !show);
    els.summary.setAttribute("aria-hidden", String(!show));
  }

  function resetStats() {
    correctCount = 0;
    wrongCount = 0;
    els.correct.textContent = "0";
    els.wrong.textContent = "0";
  }

  function resetDisplay() {
    els.number.textContent = "----";
    els.input.value = "";
    resetTimerUI();
    setInputEnabled(false);
    showOverlay(false);
    showSummary(false);
  }

  function beginRound() {
    if (state === "finished") return;
    state = "playing";
    currentNumber = nextStartNumber();
    els.number.textContent = currentNumber;
    els.input.value = "";
    setInputEnabled(true);
    showOverlay(false);
    startAnswerTimer();
  }

  function onFail() {
    if (state !== "playing") return;
    state = "punishment";
    wrongCount++;
    els.wrong.textContent = wrongCount;
    clearAnswerTimer();
    setInputEnabled(false);
    showOverlay(true);
    Sfx.playError();

    clearPunishTimer();
    punishTimer = setTimeout(dismissPunishment, PUNISH_TIME);
  }

  function dismissPunishment() {
    if (state !== "punishment") return;
    clearPunishTimer();
    beginRound();
  }

  function onPunishmentKeyDown(e) {
    if (state !== "punishment" || e.code !== "Space") return;
    e.preventDefault();
    dismissPunishment();
  }

  function onSubmit() {
    if (state !== "playing") return;

    const raw = els.input.value.trim();
    if (raw === "") return;

    const answer = parseInt(raw, 10);
    const expected = currentNumber - SUBTRACT;

    if (answer === expected) {
      correctCount++;
      els.correct.textContent = correctCount;
      currentNumber = answer;
      els.number.textContent = currentNumber;
      els.input.value = "";
      clearAnswerTimer();
      startAnswerTimer();
    } else {
      onFail();
    }
  }

  function endSession() {
    state = "finished";
    clearGameplayTimers();
    session.clear();
    setInputEnabled(false);
    showOverlay(false);

    els.summaryCorrect.textContent = correctCount;
    els.summaryWrong.textContent = wrongCount;
    showSummary(true);
  }

  function dismissSummary() {
    state = "idle";
    showSummary(false);
    resetDisplay();
    syncDurationPreview();
    showStartPanel(true);
  }

  function syncDurationPreview() {
    const minutes = DurationSetting.readMinutes(
      els.durationInput,
      DEFAULT_SESSION_MINUTES
    );
    if (minutes !== null && session) {
      session.setDuration(DurationSetting.toMs(minutes));
    }
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

    numberMode = readNumberMode();
    if (numberMode === "fixed") {
      const fixedStart = readFixedStartNumber();
      if (fixedStart === null) {
        els.fixedStartInput.focus();
        return;
      }
      fixedStartNumber = fixedStart;
    }

    Sfx.warmUp();
    resetStats();
    showSummary(false);
    showStartPanel(false);
    session.start(DurationSetting.toMs(minutes));
    beginRound();
  }

  function bindEvents() {
    els.startBtn.addEventListener("click", play);
    els.confirm.addEventListener("click", onSubmit);
    els.summaryBtn.addEventListener("click", dismissSummary);
    els.modeRandom.addEventListener("change", updateModeUI);
    els.modeFixed.addEventListener("change", updateModeUI);
    els.durationInput.addEventListener("input", () => {
      if (state === "idle") syncDurationPreview();
    });
    els.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onSubmit();
      }
    });
    document.addEventListener("keydown", onPunishmentKeyDown);
  }

  function init() {
    cacheElements();
    session = SessionTimer.create({
      labelEl: els.sessionLabel,
      onEnd: endSession,
      duration: DEFAULT_SESSION_MINUTES * 60000,
    });
    bindEvents();
    updateModeUI();
    syncDurationPreview();
    resetDisplay();
    session.resetUI();
    showStartPanel(true);
  }

  function stop() {
    clearGameplayTimers();
    if (session) session.clear();
    state = "idle";
    resetDisplay();
    syncDurationPreview();
    showStartPanel(true);
  }

  return { init, stop };
})();

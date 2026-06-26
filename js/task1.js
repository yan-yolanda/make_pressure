/**
 * Task 1: Mental Arithmetic (subtract 13)
 */
const Task1 = (() => {
  const ANSWER_TIME = 5000;
  const PUNISH_TIME = 5000;
  const DEFAULT_SESSION_MINUTES = 5;
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

  const els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function cacheElements() {
    els.number = $("t1-number");
    els.timerBar = $("t1-timer-bar");
    els.timerLabel = $("t1-timer-label");
    els.sessionBar = $("t1-session-bar");
    els.sessionLabel = $("t1-session-label");
    els.input = $("t1-input");
    els.confirm = $("t1-confirm");
    els.overlay = $("t1-overlay");
    els.startPanel = $("t1-start-panel");
    els.startBtn = $("t1-start");
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
    currentNumber = randomFourDigit();
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
    session.resetUI();
    showStartPanel(true);
  }

  function play() {
    if (state !== "idle") return;
    Sfx.warmUp();
    resetStats();
    showSummary(false);
    showStartPanel(false);
    session.start();
    beginRound();
  }

  function bindEvents() {
    els.startBtn.addEventListener("click", play);
    els.confirm.addEventListener("click", onSubmit);
    els.summaryBtn.addEventListener("click", dismissSummary);
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
      barEl: els.sessionBar,
      labelEl: els.sessionLabel,
      onEnd: endSession,
      duration: DEFAULT_SESSION_MINUTES * 60000,
    });
    bindEvents();
    DurationSetting.bind({
      inputEl: document.getElementById("t1-duration"),
      applyBtnEl: document.getElementById("t1-duration-apply"),
      getCanApply: () => state === "idle",
      onApply: (minutes) => session.setDuration(minutes * 60000),
    });
    resetDisplay();
    session.resetUI();
    showStartPanel(true);
  }

  function stop() {
    clearGameplayTimers();
    if (session) session.clear();
    state = "idle";
    resetDisplay();
    if (session) session.resetUI();
    showStartPanel(true);
  }

  return { init, stop };
})();

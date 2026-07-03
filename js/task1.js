/**
 * Task 1: Mental Arithmetic (subtract 13)
 */
const Task1 = (() => {
  const ANSWER_TIME = 5000;
  const ANSWER_SOUND_TIME = 3000;
  const PUNISH_TIME = 5000;
  const DEFAULT_SESSION_MINUTES = 5;
  const DEFAULT_FIXED_START = 1022;
  const DEFAULT_GOAL_STREAK = 15;
  const GOAL_INCREMENT = 5;
  const SUBTRACT = 13;

  let currentNumber = 0;
  let answerTimer = null;
  let punishTimer = null;
  let rafId = null;
  let timerStart = 0;
  let state = "idle"; // idle | briefing | playing | punishment | finished
  let correctCount = 0;
  let wrongCount = 0;
  let currentStreak = 0;
  let maxStreak = 0;
  let goalTarget = DEFAULT_GOAL_STREAK;
  let pendingSessionMinutes = DEFAULT_SESSION_MINUTES;
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
    els.goalInitialInput = $("t1-goal-initial");
    els.goalTarget = $("t1-goal-target");
    els.maxStreak = $("t1-max-streak");
    els.correct = $("t1-correct");
    els.wrong = $("t1-wrong");
    els.summary = $("t1-summary");
    els.summaryCorrect = $("t1-summary-correct");
    els.summaryWrong = $("t1-summary-wrong");
    els.summaryMaxStreak = $("t1-summary-max-streak");
    els.summaryBtn = $("t1-summary-btn");
    els.briefing = $("t1-briefing");
    els.briefingDuration = $("t1-briefing-duration");
    els.briefingMode = $("t1-briefing-mode");
    els.briefingBtn = $("t1-briefing-btn");
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

  function readInitialGoal() {
    const raw = String(els.goalInitialInput.value).trim();
    if (raw === "") return DEFAULT_GOAL_STREAK;

    const goal = parseInt(raw, 10);
    if (!Number.isFinite(goal) || goal < 1) return null;
    return goal;
  }

  function updateGoalUI() {
    els.goalTarget.textContent = goalTarget;
    els.maxStreak.textContent = maxStreak;
  }

  function resetGoalProgress(initialGoal) {
    goalTarget = initialGoal;
    currentStreak = 0;
    maxStreak = 0;
    updateGoalUI();
  }

  function recordCorrectStreak() {
    currentStreak++;
    if (currentStreak > maxStreak) {
      maxStreak = currentStreak;
    }
    while (currentStreak >= goalTarget) {
      goalTarget += GOAL_INCREMENT;
    }
    updateGoalUI();
  }

  function resetCurrentStreak() {
    currentStreak = 0;
    updateGoalUI();
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
    Sfx.stopAnswerCountdown();
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
    Sfx.startAnswerCountdown(ANSWER_TIME, ANSWER_SOUND_TIME);
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

  function showBriefing(show) {
    els.briefing.classList.toggle("hidden", !show);
    els.briefing.setAttribute("aria-hidden", String(!show));
  }

  function updateBriefingContent(minutes) {
    els.briefingDuration.textContent = minutes;
    if (numberMode === "fixed") {
      els.briefingMode.textContent = `固定四位数（起始 ${fixedStartNumber}）`;
    } else {
      els.briefingMode.textContent = "随机四位数";
    }
  }

  function confirmBriefing() {
    if (state !== "briefing") return;

    showBriefing(false);
    session.start(DurationSetting.toMs(pendingSessionMinutes));
    beginRound();
  }

  function resetStats() {
    correctCount = 0;
    wrongCount = 0;
    els.correct.textContent = "0";
    els.wrong.textContent = "0";
  }

  function resetGoalPreview() {
    const initialGoal = readInitialGoal();
    if (initialGoal !== null) {
      goalTarget = initialGoal;
      currentStreak = 0;
      maxStreak = 0;
      updateGoalUI();
    }
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
    resetCurrentStreak();
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
      recordCorrectStreak();
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
    els.summaryMaxStreak.textContent = maxStreak;
    showSummary(true);
  }

  function dismissSummary() {
    state = "idle";
    showSummary(false);
    resetDisplay();
    resetGoalPreview();
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

    const initialGoal = readInitialGoal();
    if (initialGoal === null) {
      els.goalInitialInput.focus();
      return;
    }

    Sfx.warmUp();
    resetStats();
    resetGoalProgress(initialGoal);
    pendingSessionMinutes = minutes;
    updateBriefingContent(minutes);
    showSummary(false);
    showStartPanel(false);
    showBriefing(true);
    state = "briefing";
  }

  function bindEvents() {
    els.startBtn.addEventListener("click", play);
    els.briefingBtn.addEventListener("click", confirmBriefing);
    els.confirm.addEventListener("click", onSubmit);
    els.summaryBtn.addEventListener("click", dismissSummary);
    els.modeRandom.addEventListener("change", updateModeUI);
    els.modeFixed.addEventListener("change", updateModeUI);
    els.durationInput.addEventListener("input", () => {
      if (state === "idle") syncDurationPreview();
    });
    els.goalInitialInput.addEventListener("input", () => {
      if (state === "idle") resetGoalPreview();
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
    resetGoalPreview();
    resetDisplay();
    session.resetUI();
    showBriefing(false);
    showStartPanel(true);
  }

  function stop() {
    clearGameplayTimers();
    if (session) session.clear();
    showBriefing(false);
    state = "idle";
    resetDisplay();
    resetGoalPreview();
    syncDurationPreview();
    showStartPanel(true);
  }

  return { init, stop };
})();

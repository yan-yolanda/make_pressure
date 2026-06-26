/**
 * Task 2: Dual-Task 2-back
 * Letter 2-back (Space) + odd/even digit (3/2)
 */
const Task2 = (() => {
  const ROUND_TIME = 3000;
  const PUNISH_TIME = 5000;
  const TWO_BACK_PROB = 0.3;
  const DEFAULT_SESSION_MINUTES = 2;
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let state = "idle"; // idle | playing | punishment | finished
  let roundTimer = null;
  let punishTimer = null;
  let rafId = null;
  let timerStart = 0;
  let session = null;

  let letterHistory = [];
  let currentLetter = "";
  let currentDigit = 0;
  let roundIndex = 0;

  let pressedSpace = false;
  let pressedDigit = null; // null | '2' | '3'

  let correctCount = 0;
  let wrongCount = 0;

  const els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function cacheElements() {
    els.letter = $("t2-letter");
    els.digit = $("t2-digit");
    els.timerBar = $("t2-timer-bar");
    els.timerLabel = $("t2-timer-label");
    els.sessionLabel = $("t2-session-label");
    els.overlay = $("t2-overlay");
    els.startPanel = $("t2-start-panel");
    els.startBtn = $("t2-start");
    els.durationInput = $("t2-duration");
    els.correct = $("t2-correct");
    els.wrong = $("t2-wrong");
    els.summary = $("t2-summary");
    els.summaryCorrect = $("t2-summary-correct");
    els.summaryWrong = $("t2-summary-wrong");
    els.summaryBtn = $("t2-summary-btn");
  }

  function randomLetter() {
    return LETTERS[Math.floor(Math.random() * LETTERS.length)];
  }

  function nextLetter() {
    if (roundIndex < 2) {
      return randomLetter();
    }
    const target = letterHistory[roundIndex - 2];
    if (Math.random() < TWO_BACK_PROB) {
      return target;
    }
    const others = LETTERS.split("").filter((l) => l !== target);
    return others[Math.floor(Math.random() * others.length)];
  }

  function randomDigit() {
    return Math.floor(Math.random() * 9) + 1;
  }

  function clearRoundTimer() {
    if (roundTimer !== null) {
      clearTimeout(roundTimer);
      roundTimer = null;
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
    clearRoundTimer();
    clearPunishTimer();
  }

  function updateTimerUI(elapsed) {
    const remaining = Math.max(0, ROUND_TIME - elapsed);
    const ratio = remaining / ROUND_TIME;
    els.timerBar.style.transform = `scaleX(${ratio})`;
    els.timerLabel.textContent = (remaining / 1000).toFixed(1) + "s";
    els.timerBar.classList.toggle("urgent", ratio < 0.25);
  }

  function resetTimerUI() {
    els.timerBar.style.transform = "scaleX(1)";
    els.timerLabel.textContent = (ROUND_TIME / 1000).toFixed(1) + "s";
    els.timerBar.classList.remove("urgent");
  }

  function tickTimer() {
    const elapsed = performance.now() - timerStart;
    updateTimerUI(elapsed);
    if (elapsed < ROUND_TIME) {
      rafId = requestAnimationFrame(tickTimer);
    }
  }

  function startRoundTimer() {
    clearRoundTimer();
    timerStart = performance.now();
    updateTimerUI(0);
    rafId = requestAnimationFrame(tickTimer);
    roundTimer = setTimeout(onRoundEnd, ROUND_TIME);
  }

  function resetInputState() {
    pressedSpace = false;
    pressedDigit = null;
  }

  function getExpectations() {
    const needSpace =
      letterHistory.length >= 3 &&
      currentLetter === letterHistory[letterHistory.length - 3];
    const needDigit = currentDigit % 2 === 1 ? "3" : "2";
    return { needSpace, needDigit };
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
    letterHistory = [];
    roundIndex = 0;
    resetInputState();
    els.letter.textContent = "—";
    els.digit.textContent = "—";
    resetTimerUI();
    showOverlay(false);
    showSummary(false);
  }

  function evaluateRound() {
    const { needSpace, needDigit } = getExpectations();
    const noInput = !pressedSpace && pressedDigit === null;

    if (noInput) return false;

    if (needSpace && !pressedSpace) return false;
    if (!needSpace && pressedSpace) return false;
    if (pressedDigit !== needDigit) return false;

    return true;
  }

  function onRoundEnd() {
    if (state !== "playing") return;

    const passed = evaluateRound();
    if (!passed) {
      triggerPunishment();
      return;
    }

    correctCount++;
    els.correct.textContent = correctCount;
    advanceStimulus();
  }

  function advanceStimulus() {
    if (state === "finished") return;
    resetInputState();
    currentLetter = nextLetter();
    currentDigit = randomDigit();
    letterHistory.push(currentLetter);
    roundIndex++;

    els.letter.textContent = currentLetter;
    els.digit.textContent = currentDigit;
    startRoundTimer();
  }

  function triggerPunishment() {
    if (state !== "playing") return;
    state = "punishment";
    wrongCount++;
    els.wrong.textContent = wrongCount;
    clearRoundTimer();
    showOverlay(true);
    Sfx.playError();

    clearPunishTimer();
    punishTimer = setTimeout(() => {
      punishTimer = null;
      if (state === "punishment") {
        resetSequence();
      }
    }, PUNISH_TIME);
  }

  function resetSequence() {
    if (state === "finished") return;
    letterHistory = [];
    roundIndex = 0;
    resetInputState();
    showOverlay(false);
    state = "playing";

    currentLetter = nextLetter();
    currentDigit = randomDigit();
    letterHistory.push(currentLetter);
    roundIndex = 1;

    els.letter.textContent = currentLetter;
    els.digit.textContent = currentDigit;
    startRoundTimer();
  }

  function onKeyDown(e) {
    if (state !== "playing") return;

    const { needSpace, needDigit } = getExpectations();

    if (e.code === "Space") {
      e.preventDefault();
      if (!needSpace) {
        triggerPunishment();
        return;
      }
      pressedSpace = true;
      return;
    }

    if (e.key === "2" || e.key === "3") {
      if (e.key !== needDigit || (pressedDigit !== null && pressedDigit !== e.key)) {
        triggerPunishment();
        return;
      }
      pressedDigit = e.key;
      return;
    }

    if (/^[0-9]$/.test(e.key)) {
      triggerPunishment();
    }
  }

  function endSession() {
    state = "finished";
    clearGameplayTimers();
    session.clear();
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

    Sfx.warmUp();
    resetStats();
    showSummary(false);
    showStartPanel(false);
    session.start(DurationSetting.toMs(minutes));
    resetSequence();
  }

  function bindEvents() {
    els.startBtn.addEventListener("click", play);
    els.summaryBtn.addEventListener("click", dismissSummary);
    els.durationInput.addEventListener("input", () => {
      if (state === "idle") syncDurationPreview();
    });
    document.addEventListener("keydown", onKeyDown);
  }

  function init() {
    cacheElements();
    session = SessionTimer.create({
      labelEl: els.sessionLabel,
      onEnd: endSession,
      duration: DEFAULT_SESSION_MINUTES * 60000,
    });
    bindEvents();
    syncDurationPreview();
    resetDisplay();
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

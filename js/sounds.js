/**
 * Short error buzz for red-cross punishment feedback.
 * Answer countdown ticks for task 1 urgency.
 */
const Sfx = (() => {
  let ctx = null;
  let countdownTimerIds = [];

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  }

  function warmUp() {
    getCtx();
  }

  function playError() {
    const audioCtx = getCtx();
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  function stopAnswerCountdown() {
    countdownTimerIds.forEach((id) => clearTimeout(id));
    countdownTimerIds = [];
  }

  function scheduleCountdown(delayMs, step, totalSteps) {
    const id = setTimeout(() => playCountdownTick(step, totalSteps), delayMs);
    countdownTimerIds.push(id);
  }

  function playCountdownTick(step, totalSteps) {
    const audioCtx = getCtx();
    const now = audioCtx.currentTime;
    const progress = totalSteps <= 1 ? 1 : step / (totalSteps - 1);
    const freq = 360 + progress * 840;
    const duration = 0.085 - progress * 0.035;
    const peakGain = 0.07 + progress * 0.18;
    const isFinal = step >= totalSteps - 1;

    const osc = audioCtx.createOscillator();
    const accent = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const accentGain = audioCtx.createGain();

    osc.type = isFinal ? "square" : "triangle";
    osc.frequency.setValueAtTime(freq, now);
    if (progress > 0.5) {
      osc.frequency.exponentialRampToValueAtTime(freq * 1.12, now + duration * 0.45);
    }

    accent.type = "sine";
    accent.frequency.setValueAtTime(freq * 1.5, now);
    accentGain.gain.setValueAtTime(0.0001, now);
    accentGain.gain.exponentialRampToValueAtTime(peakGain * 0.35, now + 0.006);
    accentGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.7);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    accent.connect(accentGain);
    gain.connect(audioCtx.destination);
    accentGain.connect(audioCtx.destination);
    osc.start(now);
    accent.start(now);
    osc.stop(now + duration + 0.02);
    accent.stop(now + duration + 0.02);
  }

  function startAnswerCountdown(durationMs = 5000) {
    stopAnswerCountdown();

    const totalSec = Math.round(durationMs / 1000);
    if (totalSec < 1) return;

    for (let i = 0; i < totalSec; i++) {
      scheduleCountdown(i * 1000, i, totalSec);
    }

    const finalSecondStart = (totalSec - 1) * 1000;
    scheduleCountdown(finalSecondStart + 340, totalSec - 0.35, totalSec);
    scheduleCountdown(finalSecondStart + 680, totalSec - 0.15, totalSec);
  }

  return { warmUp, playError, startAnswerCountdown, stopAnswerCountdown };
})();

/**
 * Short error buzz for red-cross punishment feedback.
 * Answer countdown audio for task 1.
 */
const Sfx = (() => {
  const COUNTDOWN_SRC = "倒计时音效.mp3";

  let ctx = null;
  let countdownAudio = null;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  }

  function getCountdownAudio() {
    if (!countdownAudio) {
      countdownAudio = new Audio(COUNTDOWN_SRC);
      countdownAudio.preload = "auto";
    }
    return countdownAudio;
  }

  function warmUp() {
    getCtx();
    getCountdownAudio().load();
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
    if (!countdownAudio) return;
    countdownAudio.pause();
    countdownAudio.currentTime = 0;
  }

  function startAnswerCountdown() {
    stopAnswerCountdown();
    const audio = getCountdownAudio();
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  return { warmUp, playError, startAnswerCountdown, stopAnswerCountdown };
})();

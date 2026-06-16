/**
 * Questionnaire modals (baseline on load, T1 after task 3).
 */
const Questionnaire = (() => {
  const PRESETS = {
    baseline: {
      title: "基线问卷",
      text: "请先扫码填写问卷，再开始后续任务。",
      image: "questionnaire/baseline.png",
      alt: "基线问卷二维码",
    },
    t1: {
      title: "T1 问卷",
      text: "任务已完成，请扫码填写问卷。",
      image: "questionnaire/t1.png",
      alt: "T1 问卷二维码",
    },
  };

  let modal;
  let titleEl;
  let textEl;
  let imageEl;
  let closeBtn;
  let onCloseCallback = null;

  function cacheElements() {
    modal = document.getElementById("questionnaire-modal");
    titleEl = document.getElementById("questionnaire-title");
    textEl = document.getElementById("questionnaire-text");
    imageEl = document.getElementById("questionnaire-image");
    closeBtn = document.getElementById("questionnaire-close");
  }

  function show(preset, onClose) {
    const config = PRESETS[preset];
    if (!config || !modal) return;

    titleEl.textContent = config.title;
    textEl.textContent = config.text;
    imageEl.src = config.image;
    imageEl.alt = config.alt;
    onCloseCallback = onClose || null;

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  }

  function close() {
    if (!modal) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    if (onCloseCallback) {
      onCloseCallback();
      onCloseCallback = null;
    }
  }

  function init() {
    cacheElements();
    if (!closeBtn) return;
    closeBtn.addEventListener("click", close);
    show("baseline");
  }

  return { init, show, close };
})();

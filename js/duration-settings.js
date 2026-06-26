/**
 * Bind minute-based task duration controls on start panels.
 */
const DurationSetting = {
  bind({ inputEl, applyBtnEl, getCanApply, onApply }) {
    applyBtnEl.addEventListener("click", () => {
      if (getCanApply && !getCanApply()) return;

      const minutes = parseInt(inputEl.value, 10);
      if (!Number.isFinite(minutes) || minutes < 1) {
        inputEl.focus();
        return;
      }

      onApply(minutes);
    });
  },
};

/**
 * Read task duration in minutes from start panel input.
 */
const DurationSetting = {
  readMinutes(inputEl, defaultMinutes) {
    if (!inputEl) return defaultMinutes;
    const minutes = parseInt(inputEl.value, 10);
    if (!Number.isFinite(minutes) || minutes < 1) return null;
    return minutes;
  },
};

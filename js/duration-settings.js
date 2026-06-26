/**
 * Read task duration in minutes from start panel input.
 */
const DurationSetting = {
  readMinutes(inputEl, defaultMinutes) {
    if (!inputEl) return defaultMinutes;

    const raw = String(inputEl.value).trim();
    if (raw === "") return defaultMinutes;

    const minutes = Number(raw);
    if (!Number.isFinite(minutes) || minutes < 1) return null;

    return Math.floor(minutes);
  },

  toMs(minutes) {
    return minutes * 60000;
  },
};

/**
 * Help modal for task instructions.
 */
(() => {
  const modal = document.getElementById("help-modal");
  const openBtn = document.getElementById("help-btn");
  const closeBtn = document.getElementById("help-close");
  const backdrop = document.getElementById("help-backdrop");

  function open() {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    closeBtn.focus();
  }

  function close() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    openBtn.focus();
  }

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      close();
    }
  });
})();

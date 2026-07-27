/**
 * Pagination & task lifecycle
 */
(() => {
  const pageBtns = document.querySelectorAll(".page-btn");
  const restFixation = document.getElementById("rest-fixation");
  const restFixationImage = document.getElementById("rest-fixation-image");
  const restFullscreenBtn = document.getElementById("rest-fullscreen-btn");
  const taskPages = {
    1: document.getElementById("task1"),
    2: document.getElementById("task2"),
    3: document.getElementById("task3"),
    rest: document.getElementById("rest-view"),
  };

  const tasks = {
    1: Task1,
    2: Task2,
    3: Task3,
  };

  let activePage = 1;
  function stopTask(page) {
    if (tasks[page]) {
      tasks[page].stop();
    }
  }

  function switchPage(page) {
    if (page === activePage) return;

    stopTask(activePage);
    activePage = page;

    pageBtns.forEach((btn) => {
      const isActive = btn.dataset.page === String(page);
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
    });

    Object.entries(taskPages).forEach(([num, el]) => {
      const isActive = num === String(page);
      el.classList.toggle("active", isActive);
      el.hidden = !isActive;
    });
  }

  pageBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      switchPage(btn.dataset.page);
    });
  });

  async function toggleRestFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    if (restFixation.requestFullscreen) {
      await restFixation.requestFullscreen();
    }
  }

  restFullscreenBtn.addEventListener("click", toggleRestFullscreen);
  restFixationImage.addEventListener("click", toggleRestFullscreen);

  document.addEventListener("fullscreenchange", () => {
    restFullscreenBtn.textContent = document.fullscreenElement ? "退出全屏" : "全屏显示";
  });

  Task1.init();
  Task2.init();
  Task3.init();
  Questionnaire.init();
})();

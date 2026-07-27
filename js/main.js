/**
 * Pagination & task lifecycle
 */
(() => {
  const mainTabBtns = document.querySelectorAll(".main-tab-btn");
  const taskView = document.getElementById("task-view");
  const restView = document.getElementById("rest-view");
  const pageBtns = document.querySelectorAll(".page-btn");
  const taskPages = {
    1: document.getElementById("task1"),
    2: document.getElementById("task2"),
    3: document.getElementById("task3"),
  };

  const tasks = {
    1: Task1,
    2: Task2,
    3: Task3,
  };

  let activePage = 1;
  let activeView = "task";

  function stopTask(page) {
    tasks[page].stop();
  }

  function switchPage(page) {
    if (page === activePage) return;

    stopTask(activePage);
    activePage = page;

    pageBtns.forEach((btn) => {
      const isActive = Number(btn.dataset.page) === page;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
    });

    Object.entries(taskPages).forEach(([num, el]) => {
      const isActive = Number(num) === page;
      el.classList.toggle("active", isActive);
      el.hidden = !isActive;
    });
  }

  function switchView(view) {
    if (view === activeView) return;

    if (activeView === "task") {
      stopTask(activePage);
    }

    activeView = view;
    const isTaskView = view === "task";

    mainTabBtns.forEach((btn) => {
      const isActive = btn.dataset.view === view;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
      btn.tabIndex = isActive ? 0 : -1;
    });

    taskView.hidden = !isTaskView;
    restView.hidden = isTaskView;

    Object.entries(taskPages).forEach(([num, el]) => {
      const isActive = isTaskView && Number(num) === activePage;
      el.classList.toggle("active", isActive);
      el.hidden = !isActive;
    });
  }

  mainTabBtns.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      switchView(btn.dataset.view);
    });

    btn.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (index + direction + mainTabBtns.length) % mainTabBtns.length;
      mainTabBtns[nextIndex].focus();
      switchView(mainTabBtns[nextIndex].dataset.view);
    });
  });

  pageBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      switchPage(Number(btn.dataset.page));
    });
  });

  Task1.init();
  Task2.init();
  Task3.init();
  Questionnaire.init();
})();

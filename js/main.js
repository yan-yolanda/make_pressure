/**
 * Pagination & task lifecycle
 */
(() => {
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

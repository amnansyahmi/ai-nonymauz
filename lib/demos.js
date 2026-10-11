import { demoBody, expenseRows, money } from "./demo-views.js";
import { initialExpenses, parseExpense, totalExpenses } from "./demo-state.js";
import { icon } from "./ui.js";
export function initialiseDemos(root = document) {
  root.querySelectorAll("[data-demo]").forEach((app) => {
    if (app.dataset.initialised) return;
    app.dataset.initialised = "true";
    let expenses = initialExpenses();
    const announce = (text) => {
      app.querySelector(".demo-feedback").textContent = text;
    };
    const updateCounts = () =>
      app.querySelectorAll("[data-stage]").forEach((column) => {
        const count = column.querySelectorAll(".task").length;
        column.querySelector("[data-task-count]").textContent = count;
        const empty = column.querySelector(".empty-stage");
        if (empty) empty.hidden = count > 0;
      });
    const moveTask = (task, target) => {
      const current = Number(task.parentElement.dataset.stage);
      if (!target || Number(target.dataset.stage) === current) return;
      target.append(task);
      const btn = task.querySelector("[data-move]");
      const stage = Number(target.dataset.stage);
      btn.disabled = stage === 2;
      btn.innerHTML =
        stage === 2
          ? `${icon("check")} Ready for review`
          : stage === 1
            ? `Send for review ${icon("arrow-right")}`
            : `Start task ${icon("arrow-right")}`;
      updateCounts();
      announce(
        `${task.querySelector("h5").textContent} moved to ${["To plan", "In progress", "For review"][stage]}.`,
      );
    };
    app.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      if (button.hasAttribute("data-reset")) {
        app.querySelector(".demo-body").innerHTML = demoBody(app.dataset.demo);
        expenses = initialExpenses();
        announce("Demo reset.");
        return;
      }
      if (button.hasAttribute("data-approve")) {
        button.disabled = true;
        button.innerHTML = `${icon("check")} Approved`;
        button.classList.add("is-approved");
        app.querySelector("[data-pending-count]").textContent =
          app.querySelectorAll("[data-approve]:not(:disabled)").length;
        announce(
          `${button.closest(".request-row").querySelector("strong").textContent}'s request approved in this demo.`,
        );
      }
      if (button.hasAttribute("data-move")) {
        const task = button.closest(".task");
        moveTask(
          task,
          app.querySelector(
            `[data-stage="${Number(task.parentElement.dataset.stage) + 1}"]`,
          ),
        );
      }
      if (button.hasAttribute("data-operation")) {
        const i = Number(button.dataset.operation);
        app
          .querySelectorAll("[data-operation]")
          .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
        app.querySelector(".operation-panel .overline").textContent = [
          "PROJECTS",
          "TEAM",
          "FINANCE",
        ][i];
        app.querySelector(".operation-panel h4").textContent = [
          "Give the work a home.",
          "Keep the team in view.",
          "Organise the financial picture.",
        ][i];
        announce(`${["Projects", "Team", "Finance"][i]} concept selected.`);
      }
      if (button.hasAttribute("data-prompt")) {
        const response = app.querySelector(".sample-response");
        response.replaceChildren();
        const query = document.createElement("p");
        query.className = "user-line";
        query.textContent = button.textContent;
        const answer = document.createElement("p");
        answer.className = "assistant-line";
        answer.textContent =
          button.dataset.prompt === "plan"
            ? "Start with the goal, the people involved, and the first useful milestone. What would a successful first version do?"
            : "List the goal, constraints, and trade-offs of each option. Compare them against the same requirements before choosing.";
        response.append(query, answer);
      }
      if (button.hasAttribute("data-security")) {
        const steps = app.querySelector(".security-steps");
        steps.hidden = !steps.hidden;
        button.setAttribute("aria-expanded", String(!steps.hidden));
      }
    });
    app.addEventListener("submit", (event) => {
      if (!event.target.matches(".expense-form")) return;
      event.preventDefault();
      const form = event.target;
      const error = form.querySelector(".form-error");
      error.textContent = "";
      try {
        if (expenses.length >= 12)
          throw new Error(
            "This demo holds up to 12 expenses. Reset it to try again.",
          );
        const expense = parseExpense(
          form.elements.expenseName.value,
          form.elements.expenseAmount.value,
        );
        expenses.push(expense);
        const total = totalExpenses(expenses);
        const balance = 5000 - total;
        const percent = Math.min(100, (total / 5000) * 100);
        app.querySelector(".expense-list").innerHTML = expenseRows(expenses);
        app.querySelector("[data-expense-total]").textContent = money(total);
        app.querySelector("[data-balance]").textContent = money(
          Math.abs(balance),
        );
        app.querySelector("[data-balance-label]").textContent =
          balance < 0 ? "Over budget" : "Available";
        app
          .querySelector("[data-balance]")
          .classList.toggle("over-budget", balance < 0);
        const meter = app.querySelector(".spending-meter");
        meter.setAttribute("aria-valuenow", String(Math.round(percent)));
        meter.querySelector("span").style.width = `${percent}%`;
        form.reset();
        form.elements.expenseName.focus();
        announce(
          `${expense.name} added. ${money(Math.abs(balance))} ${balance < 0 ? "over budget" : "available"}.`,
        );
      } catch (err) {
        error.textContent = err.message;
      }
    });
    app.addEventListener("change", (event) => {
      if (event.target.matches(".wedding-checks input"))
        app.querySelector(".checklist-progress").textContent =
          `${app.querySelectorAll(".wedding-checks input:checked").length} of 3 steps complete`;
    });
    let dragged = null;
    app.addEventListener("dragstart", (event) => {
      dragged = event.target.closest(".task");
      if (dragged) {
        event.dataTransfer.setData("text/plain", dragged.dataset.task);
        event.dataTransfer.effectAllowed = "move";
      }
    });
    app.addEventListener("dragover", (event) => {
      if (dragged && event.target.closest("[data-stage]"))
        event.preventDefault();
    });
    app.addEventListener("drop", (event) => {
      const target = event.target.closest("[data-stage]");
      if (dragged && target) {
        event.preventDefault();
        moveTask(dragged, target);
      }
      dragged = null;
    });
    app.addEventListener("dragend", () => {
      dragged = null;
    });
  });
}

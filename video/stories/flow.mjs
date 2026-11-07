// FlowTrack walkthrough: read the month, add a commitment, see the balance update, reset.
import { demoShell, expenseRows, money } from "../../lib/demo-views.js";
import { initialExpenses, totalExpenses } from "../../lib/demo-state.js";

const income = 5000;
const before = initialExpenses();
const added = { name: "Groceries", amount: 450 };
const after = [...before, added];
const committed = [totalExpenses(before), totalExpenses(after)];
const share = committed.map((total) => `${((total / income) * 100).toFixed(1)}%`);
// Every string comes from the site's own formatters, so the video matches the live demo.
const text = {
  committed: committed.map(money),
  available: committed.map((total) => money(income - total)),
  row: expenseRows(after).match(/<div class="expense-row">(?:(?!<div class="expense-row">).)*$/s)[0],
  added: `${added.name} added. ${money(income - committed[1])} available.`,
};

export const flow = {
  id: "flow",
  duration: 10,
  chapters: [
    { title: "See the monthly picture", start: 0 },
    { title: "Add a commitment", start: 2.8 },
    { title: "Review the balance", start: 6.6 },
  ],
  markup: () => demoShell("flow"),
  script: `
    const text = ${JSON.stringify(text)};
    const share = ${JSON.stringify(share)};
    const committed = Walkthrough.stack(document.querySelector("[data-expense-total]"), text.committed);
    const available = Walkthrough.stack(document.querySelector("[data-balance]"), text.available);
    const feedback = Walkthrough.stack(document.querySelector(".demo-feedback"), ["\\u00a0", text.added, "Demo reset."]);
    const meter = document.querySelector(".spending-meter span");
    gsap.set(meter, { width: share[0] });
    // The new row is in place from the start at zero height, so adding it is a seekable tween.
    const grow = document.createElement("div");
    grow.className = "fx-grow";
    grow.innerHTML = text.row;
    document.querySelector(".expense-list").append(grow);
    const rowHeight = grow.scrollHeight;
    gsap.set(grow, { height: 0 });

    const touch = wt.pointer.className === "fx-touch";
    const zoom = touch ? 1.06 : 1.3, overview = touch ? 1.04 : 1.22;
    const name = document.querySelector('[name="expenseName"]'), amount = document.querySelector('[name="expenseAmount"]');
    const add = document.querySelector(".expense-form .small-button");

    // 1. See the monthly picture
    wt.focus(tl, wt.union(".demo-metrics", ".spending-meter"), overview, 0.5, 1.4);
    if (!touch) wt.show(tl, 0.9);
    wt.move(tl, "[data-balance]", 0.9, 1.0);
    wt.highlight(tl, ".demo-metrics > div:last-child", 1.7, 0.9, 8);

    // 2. Add a commitment
    wt.focus(tl, wt.union(".expense-list", ".expense-form"), zoom, 2.7, 1.1);
    wt.move(tl, name, 3.0, 0.7);
    wt.press(tl, name, 3.75);
    const typedName = wt.type(tl, name, "${added.name}", 3.85);
    wt.move(tl, amount, typedName.end + 0.1, 0.45);
    typedName.blur(typedName.end + 0.6);
    wt.press(tl, amount, typedName.end + 0.6);
    const typedAmount = wt.type(tl, amount, "${added.amount}", typedName.end + 0.7, 10);
    wt.move(tl, add, typedAmount.end + 0.1, 0.45);
    wt.press(tl, add, 6.0);
    tl.to([typedName.field, typedAmount.field], { opacity: 0, duration: 0.15 }, 6.08);
    tl.to(grow, { height: rowHeight, duration: 0.35, ease: "power2.out" }, 6.08);
    wt.swap(tl, feedback[0], feedback[1], 6.15, 0.3);

    // 3. Review the balance
    // The totals update on Add, as in the live demo; chapter 3 brings them into view.
    wt.swap(tl, committed[0], committed[1], 6.1, 0.3);
    wt.swap(tl, available[0], available[1], 6.1, 0.3);
    tl.to(meter, { width: share[1], duration: 0.6, ease: "power2.out" }, 6.1);
    wt.focus(tl, wt.union(".demo-metrics", ".spending-meter"), overview + 0.08, 6.5, 0.9);
    wt.move(tl, "[data-balance]", 6.7, 0.6);
    wt.highlight(tl, ".demo-metrics > div:last-child", 7.3, 0.8, 8);
    wt.focus(tl, null, 1, 8.0, 0.9);

    // Reset, so the loop returns to its first frame.
    wt.move(tl, ".demo-reset", 8.4, 0.65);
    wt.press(tl, ".demo-reset", 9.2);
    tl.to(grow, { height: 0, duration: 0.3, ease: "power2.inOut" }, 9.25);
    tl.to(meter, { width: share[0], duration: 0.3 }, 9.25);
    wt.swap(tl, committed[1], committed[0], 9.25, 0.3);
    wt.swap(tl, available[1], available[0], 9.25, 0.3);
    wt.swap(tl, feedback[1], feedback[2], 9.25, 0.2);
    wt.swap(tl, feedback[2], feedback[0], 9.7, 0.25);
    wt.show(tl, 9.55, false, 0.3);
  `,
};

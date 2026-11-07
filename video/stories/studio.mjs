// Creative Workspace walkthrough: start from the brief, send artwork for review, start the
// brief, reset. Cards glide between columns with transforms so the layout never reflows.
import { demoShell } from "../../lib/demo-views.js";
import { icon } from "../../lib/ui.js";

// Button labels exactly as the live demo writes them after each move.
const labels = {
  start: `Start task ${icon("arrow-right")}`,
  review: `Send for review ${icon("arrow-right")}`,
  done: `${icon("check")} Ready for review`,
};

export const studio = {
  id: "studio",
  duration: 10,
  chapters: [
    { title: "Bring the brief together", start: 0 },
    { title: "Send for review", start: 2.8 },
    { title: "Move work forward", start: 6.0 },
  ],
  markup: () => demoShell("studio"),
  script: `
    const labels = ${JSON.stringify(labels)};
    const columns = [...document.querySelectorAll(".kanban > section")];
    const brief = document.querySelector('[data-task="brief"]'), launch = document.querySelector('[data-task="launch"]');
    // Keep the review column as tall as a column holding a card, so a card can land in it.
    columns[2].style.minHeight = columns[1].offsetHeight + "px";
    for (const task of [brief, launch]) { task.style.position = "relative"; task.style.zIndex = "2"; }
    const counts = columns.map((column, i) => Walkthrough.stack(column.querySelector("[data-task-count]"),
      i === 2 ? ["0", "1"] : ["1", "0", "1"]));
    const launchButton = Walkthrough.stack(launch.querySelector("[data-move]"), [{ html: labels.review }, { html: labels.done }]);
    launchButton[1].classList.add("fx-done");
    const briefButton = Walkthrough.stack(brief.querySelector("[data-move]"), [{ html: labels.start }, { html: labels.review }]);
    const empty = columns[2].querySelector(".empty-stage");
    const feedback = Walkthrough.stack(document.querySelector(".demo-feedback"), [
      "\\u00a0", "Launch artwork moved to For review.", "Brand discovery moved to In progress.", "Demo reset.",
    ]);
    // Where a card lands: the same offset inside the target column as inside its own.
    const shift = (task, from, to) => {
      const t = wt.box(task), a = wt.box(from), b = wt.box(to);
      return { x: b.x - a.x, y: b.y - a.y };
    };
    const launchTo = shift(launch, columns[1], columns[2]);
    const briefTo = shift(brief, columns[0], columns[1]);
    const glide = (task, to, at) => {
      tl.to(task, { scale: 1.03, duration: 0.15, ease: "power2.out" }, at)
        .to(task, { x: to.x, y: to.y, duration: 0.6, ease: "power2.inOut" }, at + 0.05)
        .to(task, { scale: 1, duration: 0.2, ease: "power2.out" }, at + 0.6);
    };
    const touch = wt.pointer.className === "fx-touch";
    // On desktop the board spans the card, so frame the whole board rather than crop a column.
    const zoom = touch ? 1.06 : 1.14, overview = touch ? 1.04 : 1.18;
    const board = (...cols) => touch ? wt.union(...cols) : wt.union(".kanban", ".demo-section-title");

    // 1. Bring the brief together
    wt.focus(tl, wt.union(".demo-section-title", columns[0]), overview, 0.5, 1.4);
    if (!touch) wt.show(tl, 0.9);
    wt.move(tl, brief.querySelector("h5"), 0.9, 1.0);
    wt.highlight(tl, brief, 1.7, 0.9, 5);

    // 2. Send for review
    wt.focus(tl, board(columns[1], columns[2]), zoom, 2.7, 1.1);
    wt.move(tl, launch.querySelector("[data-move]"), 3.0, 0.8);
    wt.press(tl, launch.querySelector("[data-move]"), 3.9);
    glide(launch, launchTo, 4.0);
    tl.to(empty, { opacity: 0, duration: 0.2 }, 4.15);
    wt.swap(tl, counts[1][0], counts[1][1], 4.05);
    wt.swap(tl, counts[2][0], counts[2][1], 4.6);
    wt.swap(tl, launchButton[0], launchButton[1], 4.6, 0.25);
    wt.swap(tl, feedback[0], feedback[1], 4.65, 0.3);

    // 3. Move work forward
    wt.focus(tl, board(columns[0], columns[1]), zoom, 5.9, 1.0);
    wt.move(tl, brief.querySelector("[data-move]"), 6.1, 0.8);
    wt.press(tl, brief.querySelector("[data-move]"), 7.0);
    glide(brief, briefTo, 7.1);
    wt.swap(tl, counts[0][0], counts[0][1], 7.15);
    wt.swap(tl, counts[1][1], counts[1][2], 7.7);
    wt.swap(tl, briefButton[0], briefButton[1], 7.7, 0.25);
    wt.swap(tl, feedback[1], feedback[2], 7.75, 0.3);
    wt.focus(tl, null, 1, 8.0, 0.8);

    // Reset: the cards fade back to where they started, so the loop returns to frame one.
    wt.move(tl, ".demo-reset", 8.5, 0.6);
    wt.press(tl, ".demo-reset", 9.15);
    tl.to([brief, launch], { opacity: 0, duration: 0.15 }, 9.2)
      .set([brief, launch], { x: 0, y: 0 }, 9.36)
      .to([brief, launch], { opacity: 1, duration: 0.25 }, 9.37);
    tl.to(empty, { opacity: 1, duration: 0.25 }, 9.37);
    wt.swap(tl, launchButton[1], launchButton[0], 9.36, 0.01);
    wt.swap(tl, briefButton[1], briefButton[0], 9.36, 0.01);
    wt.swap(tl, counts[0][1], counts[0][0], 9.3, 0.2);
    wt.swap(tl, counts[1][2], counts[1][0], 9.3, 0.2);
    wt.swap(tl, counts[2][1], counts[2][0], 9.3, 0.2);
    wt.swap(tl, feedback[2], feedback[3], 9.25, 0.2);
    wt.swap(tl, feedback[3], feedback[0], 9.7, 0.25);
    wt.show(tl, 9.55, false, 0.3);
  `,
};

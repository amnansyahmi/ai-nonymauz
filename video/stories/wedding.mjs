// Wedding Planner walkthrough: open the checklist, tick the next two steps, see progress, reset.
import { demoShell } from "../../lib/demo-views.js";

export const wedding = {
  id: "wedding",
  duration: 10,
  chapters: [
    { title: "Start with a checklist", start: 0 },
    { title: "Tick the next step", start: 2.8 },
    { title: "Track your progress", start: 6.2 },
  ],
  markup: () => demoShell("wedding"),
  script: `
    const labels = [...document.querySelectorAll(".wedding-checks label")];
    // Each unticked box gets a ticked twin stacked on top of it.
    const boxes = labels.map((label) => {
      const box = label.querySelector("input");
      const ticked = box.cloneNode();
      ticked.checked = true;
      ticked.setAttribute("checked", "");
      const slot = document.createElement("span");
      slot.className = "fx-stack";
      box.replaceWith(slot);
      slot.append(box, ticked);
      box.classList.add("fx-layer"); ticked.classList.add("fx-layer");
      gsap.set(ticked, { opacity: box.checked ? 1 : 0 });
      return { box, ticked, slot, label };
    });
    const progress = Walkthrough.stack(document.querySelector(".checklist-progress"),
      ["1 of 3 steps complete", "2 of 3 steps complete", "3 of 3 steps complete"]);
    const feedback = Walkthrough.stack(document.querySelector(".demo-feedback"), ["\\u00a0", "Demo reset."]);
    const touch = wt.pointer.className === "fx-touch";
    const zoom = touch ? 1.06 : 1.3, overview = touch ? 1.04 : 1.12;

    // 1. Start with a checklist
    wt.focus(tl, wt.union(".wedding-date", ".wedding-checks"), overview, 0.5, 1.4);
    if (!touch) wt.show(tl, 0.9);
    wt.move(tl, boxes[0].label, 0.9, 1.0);
    wt.highlight(tl, ".wedding-checks", 1.7, 0.9, 8);

    // 2. Tick the next step (and the one after)
    wt.focus(tl, wt.union(".wedding-checks", ".checklist-progress"), zoom, 2.7, 1.1);
    wt.move(tl, boxes[1].slot, 3.0, 0.8);
    wt.press(tl, boxes[1].slot, 3.95);
    wt.swap(tl, boxes[1].box, boxes[1].ticked, 4.0, 0.15);
    wt.swap(tl, progress[0], progress[1], 4.05, 0.25);
    wt.move(tl, boxes[2].slot, 4.7, 0.6);
    wt.press(tl, boxes[2].slot, 5.45);
    wt.swap(tl, boxes[2].box, boxes[2].ticked, 5.5, 0.15);
    wt.swap(tl, progress[1], progress[2], 5.55, 0.25);

    // 3. Track your progress
    wt.move(tl, ".checklist-progress", 6.2, 0.6);
    wt.highlight(tl, ".checklist-progress", 6.6, 1.0, 6);
    wt.focus(tl, null, 1, 7.6, 1.0);

    // Reset, so the loop returns to its first frame.
    wt.move(tl, ".demo-reset", 8.4, 0.65);
    wt.press(tl, ".demo-reset", 9.2);
    for (const i of [1, 2]) wt.swap(tl, boxes[i].ticked, boxes[i].box, 9.25, 0.2);
    wt.swap(tl, progress[2], progress[0], 9.25, 0.3);
    wt.swap(tl, feedback[0], feedback[1], 9.25, 0.2);
    wt.swap(tl, feedback[1], feedback[0], 9.7, 0.25);
    wt.show(tl, 9.55, false, 0.3);
  `,
};

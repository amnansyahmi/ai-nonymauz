// HRMS walkthrough: review the inbox, approve one request, clear the queue, reset.
// The markup comes from the site's own demo, so the video always matches the live demo.
import { demoShell } from "../../lib/demo-views.js";

export const people = {
  id: "people",
  duration: 10,
  // Chapter start times in seconds; the site's chapter buttons seek to these.
  chapters: [
    { title: "Review the inbox", start: 0 },
    { title: "Approve a request", start: 2.8 },
    { title: "Clear the queue", start: 5.6 },
  ],
  markup: () => demoShell("people"),
  // Runs in the composition page. `wt` is the Walkthrough helper, `tl` the paused timeline.
  script: `
    const rows = [...document.querySelectorAll(".request-row")];
    const count = Walkthrough.stack(document.querySelector("[data-pending-count]"), ["2", "1", "0"]);
    const feedback = Walkthrough.stack(document.querySelector(".demo-feedback"), [
      "\\u00a0",
      "Nur Aisyah's request approved in this demo.",
      "Daniel Koh's request approved in this demo.",
      "Demo reset.",
    ]);
    // Each Approve button gets an "Approved" twin stacked on top of it.
    const approved = rows.map((row) => {
      const button = row.querySelector(".approve-button");
      const twin = button.cloneNode(true);
      twin.classList.add("is-approved");
      twin.removeAttribute("data-approve");
      twin.lastChild.textContent = " Approved";
      const slot = document.createElement("span");
      slot.className = "fx-stack approve-slot";
      button.replaceWith(slot);
      slot.append(button, twin);
      button.classList.add("fx-layer"); twin.classList.add("fx-layer");
      gsap.set(twin, { opacity: 0 });
      return { button, twin, slot };
    });
    const touch = wt.pointer.className === "fx-touch";
    // The phone card already fills the screen width, so only push in far enough to add life.
    const zoom = touch ? 1.06 : 1.3, overview = touch ? 1.04 : 1.2;

    // 1. Review the inbox
    wt.focus(tl, wt.box(".demo-metrics"), overview, 0.5, 1.4);
    if (!touch) wt.show(tl, 0.9);
    wt.move(tl, ".demo-metrics > div:last-child", 0.9, 1.0);
    wt.highlight(tl, ".demo-metrics > div:last-child", 1.7, 0.9, 8);

    // 2. Approve a request
    wt.focus(tl, wt.union(".demo-metrics", ".requests"), zoom, 2.7, 1.1);
    wt.move(tl, approved[0].slot, 3.0, 0.9);
    wt.press(tl, approved[0].slot, 4.0);
    wt.swap(tl, approved[0].button, approved[0].twin, 4.08);
    wt.swap(tl, count[0], count[1], 4.12);
    wt.swap(tl, feedback[0], feedback[1], 4.2, 0.3);

    // 3. Clear the queue
    wt.move(tl, approved[1].slot, 5.6, 0.75);
    wt.press(tl, approved[1].slot, 6.45);
    wt.swap(tl, approved[1].button, approved[1].twin, 6.53);
    wt.swap(tl, count[1], count[2], 6.57);
    wt.swap(tl, feedback[1], feedback[2], 6.62, 0.3);
    wt.focus(tl, null, 1, 7.2, 1.1);
    wt.highlight(tl, ".demo-metrics > div:last-child", 7.9, 0.8, 8);

    // Reset, so the loop returns to its first frame.
    wt.move(tl, ".demo-reset", 8.6, 0.6);
    wt.press(tl, ".demo-reset", 9.25);
    for (const { button, twin } of approved) wt.swap(tl, twin, button, 9.3, 0.3);
    wt.swap(tl, count[2], count[0], 9.3, 0.3);
    wt.swap(tl, feedback[2], feedback[3], 9.3, 0.2);
    wt.swap(tl, feedback[3], feedback[0], 9.7, 0.25);
    wt.show(tl, 9.6, false, 0.3);
  `,
};

import { products, productPages, productPath } from "./products.js";
import { icon, escapeHTML as e } from "./lib/ui.js";
import { initialiseShowcase } from "./lib/showcase.js";
import { initialiseCaptures } from "./lib/captures.js";
import { initialiseTransitions, transitionIn } from "./lib/transitions.js";
import { initialiseDemos } from "./lib/demos.js";
import { finderChoices, recommendSystem } from "./lib/demo-state.js";

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
let paused = false;
const oldProduct = new URL(location.href).searchParams.get("system");
if (products.some((p) => p.id === oldProduct))
  location.replace(productPath(oldProduct));
initialiseDemos();
initialiseTransitions();
initialiseCaptures();

const menuButton = document.querySelector(".menu-button");
const menu = document.querySelector("#mobile-nav");
function closeMenu() {
  menu.hidden = true;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open menu");
  menuButton.innerHTML = icon("menu");
}
menuButton.addEventListener("click", () => {
  const open = menu.hidden;
  menu.hidden = !open;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menuButton.innerHTML = icon(open ? "x" : "menu");
});
menu.addEventListener("click", (event) => {
  if (event.target.closest("a,button")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !menu.hidden) {
    closeMenu();
    menuButton.focus();
  }
});
matchMedia("(min-width:851px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

const dialogTriggers = new WeakMap();
let savedScroll = 0;
function openDialog(dialog, trigger) {
  if (dialog.open) return;
  savedScroll = window.scrollY;
  dialogTriggers.set(dialog, trigger);
  document.body.classList.add("dialog-open");
  document.body.style.position = "fixed";
  document.body.style.top = `-${savedScroll}px`;
  document.body.style.width = "100%";
  dialog.showModal();
  transitionIn(dialog);
  document.dispatchEvent(new CustomEvent("dialog-state", { detail: true }));
}
function closeDialog(dialog) {
  dialog.close();
}
for (const dialog of document.querySelectorAll("dialog")) {
  dialog
    .querySelector(".dialog-close")
    .addEventListener("click", () => closeDialog(dialog));
  dialog.addEventListener("click", (event) => {
    const r = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom)
    )
      closeDialog(dialog);
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo({ top: savedScroll, behavior: "instant" });
    dialogTriggers.get(dialog)?.focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent("dialog-state", { detail: false }));
  });
  const handle = dialog.querySelector(".sheet-handle");
  let startY = null;
  handle?.addEventListener("pointerdown", (event) => {
    startY = event.clientY;
    handle.setPointerCapture(event.pointerId);
  });
  handle?.addEventListener("pointerup", (event) => {
    if (startY !== null && event.clientY - startY > 65) closeDialog(dialog);
    startY = null;
  });
  handle?.addEventListener("pointercancel", () => {
    startY = null;
  });
}
const finder = document.querySelector("#finder-dialog");
const finderContent = document.querySelector("#finder-content");
let finderArea = "";
const progress = (step) =>
  `<div class="finder-progress" aria-label="Step ${step} of 3">${[1, 2, 3].map((i) => `<span class="${i <= step ? "complete" : ""}"></span>`).join("")}</div>`;
const option = (id, title, description, iconName, attr) =>
  `<button type="button" class="finder-option" ${attr}="${id}">${icon(iconName)}<span>${e(title)}${description ? `<small>${e(description)}</small>` : ""}</span>${icon("arrow-right")}</button>`;
function focusFinderHeading() {
  const title = finderContent.querySelector("h2");
  title.setAttribute("tabindex", "-1");
  if (finder.open) title.focus({ preventScroll: true });
}
function finderStart() {
  finderArea = "";
  finderContent.innerHTML = `${progress(1)}<p class="overline">FIND YOUR EVERYDAY ADVANTAGE</p><h2 id="finder-title">What brings you here?</h2><p class="dialog-description">Two quick questions. A useful starting point.</p><div class="finder-options">${option("work", "Work & business", "Teams, clients, projects, and operations", "briefcase", "data-area")}${option("life", "Everyday life", "Your money and your next chapter", "heart", "data-area")}${option("tools", "AI & development", "Conversations, models, and integrations", "spark", "data-area")}</div><p class="form-note">No account needed. Your choices stay on this page.</p>`;
  focusFinderHeading();
}
function finderGoal(area) {
  if (!finderChoices[area]) return;
  finderArea = area;
  finderContent.innerHTML = `${progress(2)}<p class="overline">LET’S MAKE IT SPECIFIC</p><h2 id="finder-title">What would you like<br>to make easier?</h2><div class="finder-options">${finderChoices[area].map(([id, title]) => option(id, title, "", products.find((p) => p.id === id).icon, "data-goal")).join("")}</div><button type="button" class="finder-back" data-finder-back="start">${icon("arrow-right")} Back</button>`;
  focusFinderHeading();
}
function finderResult(goal) {
  const id = recommendSystem(finderArea, goal);
  if (!id) return;
  const p = products.find((x) => x.id === id);
  const selected = finderChoices[finderArea]
    .find(([x]) => x === id)[1]
    .toLowerCase();
  finderContent.innerHTML = `${progress(3)}<p class="overline">A GOOD PLACE TO START</p><div class="finder-result-icon tone-${p.tone}"><span class="system-icon">${icon(p.icon)}</span></div><h2 id="finder-title">Meet ${e(p.short)}.</h2><p class="finder-result-reason">You want to ${e(selected)}. ${e(productPages[id].summary)}</p><ul class="finder-result-features">${p.features
    .slice(0, 3)
    .map((f) => `<li>${icon("check")}${e(f)}</li>`)
    .join(
      "",
    )}</ul><div class="finder-result-actions"><a class="button button-primary" href="${productPath(id)}">Explore ${e(p.short)} ${icon("arrow-right")}</a><a class="text-link" href="${p.url}" target="_blank" rel="noopener noreferrer">${p.action} ${icon("arrow-up-right")}</a></div><p class="finder-result-note">${e(p.note)}</p><button type="button" class="finder-back" data-finder-back="goal">${icon("arrow-right")} Change my answer</button>`;
  focusFinderHeading();
}
finderContent.addEventListener("click", (event) => {
  const b = event.target.closest("button");
  if (!b) return;
  if (b.dataset.area) finderGoal(b.dataset.area);
  if (b.dataset.goal) finderResult(b.dataset.goal);
  if (b.dataset.finderBack === "start") finderStart();
  if (b.dataset.finderBack === "goal") finderGoal(finderArea);
});
const brief = document.querySelector("#brief-dialog");
document.addEventListener("click", (event) => {
  const finderTrigger = event.target.closest("[data-open-finder]");
  if (finderTrigger) {
    finderStart();
    openDialog(finder, finderTrigger);
    focusFinderHeading();
  }
  const briefTrigger = event.target.closest("[data-open-brief]");
  if (briefTrigger) openDialog(brief, briefTrigger);
  const imageTrigger = event.target.closest("[data-image]");
  if (imageTrigger) {
    const dialog = document.querySelector("#image-dialog");
    const img = dialog.querySelector("img");
    img.src = imageTrigger.dataset.image;
    img.alt = imageTrigger.dataset.alt;
    openDialog(dialog, imageTrigger);
  }
});
document.querySelector("#brief-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  const goal = String(data.get("goal")).trim();
  const team = String(data.get("team")).trim();
  const error = form.querySelector(".form-error");
  error.textContent = "";
  if (!goal || !team) {
    error.textContent =
      "Add the problem you want to solve and who will use the system.";
    form.elements[!goal ? "goal" : "team"].focus();
    return;
  }
  const text = `# AI-Nonymauz project brief\n\nDate: ${new Date().toLocaleDateString("en-MY")}\n\n## Starting point\n${data.get("system")}\n\n## The problem to solve\n${goal}\n\n## Who will use it\n${team}\n\n## Timeline\n${data.get("timeline")}\n\n## Budget\n${String(data.get("budget")).trim() || "To discuss"}\n\n## Discuss next\n- Current workflow and tools\n- Features needed first\n- Data and access requirements\n\nPrepared locally at AI-Nonymauz. This brief has not been submitted.\n`;
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/markdown;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "ai-nonymauz-project-brief.md";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  document.querySelector("#brief-result").textContent =
    "Your brief is ready. Check your downloads, then share it when you’re ready.";
});

document.querySelectorAll("[data-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    let count = 0;
    document
      .querySelectorAll("[data-filter]")
      .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    document.querySelectorAll("[data-category]").forEach((row) => {
      row.hidden = filter !== "all" && row.dataset.category !== filter;
      if (!row.hidden) count++;
    });
    document.querySelector("#filter-status").textContent =
      `Showing ${count} systems.`;
  }),
);
const showcaseController = initialiseShowcase();
const motionButtons = [...document.querySelectorAll(".motion-toggle")];
function updateMotion() {
  document.documentElement.classList.toggle("motion-paused", paused);
  motionButtons.forEach((b) => {
    b.hidden = reduceMotion.matches;
    b.setAttribute("aria-pressed", String(paused));
    b.querySelector("span").textContent = paused
      ? "Resume motion"
      : "Pause motion";
  });
  document.dispatchEvent(
    new CustomEvent("motion-state", { detail: paused || reduceMotion.matches }),
  );
  updateScroll();
}
motionButtons.forEach((b) =>
  b.addEventListener("click", () => {
    paused = !paused;
    updateMotion();
  }),
);
reduceMotion.addEventListener("change", updateMotion);
const stories = [...document.querySelectorAll("[data-story]")];
const showcase = document.querySelector(".hero-showcase");
let scrollFrame = 0;
function updateScroll() {
  scrollFrame = 0;
  const disabled = paused || reduceMotion.matches || innerWidth <= 600;
  if (showcase) {
    const rect = showcase.getBoundingClientRect();
    const progress = disabled
      ? 1
      : Math.max(
          0,
          Math.min(
            1,
            (innerHeight - rect.top) / Math.max(1, innerHeight * 0.8),
          ),
        );
    document.documentElement.style.setProperty("--stage-progress", progress);
  }
  stories.forEach((section) => {
    const r = section.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const progress = disabled
      ? 1
      : Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight * 0.7)));
    section.style.setProperty("--scene-progress", progress);
  });
}
window.addEventListener(
  "scroll",
  () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  },
  { passive: true },
);
window.addEventListener(
  "resize",
  () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  },
  { passive: true },
);
updateMotion();
// Load the decorative renderer after the content and interactions are available.
if (document.querySelector("#ribbon-canvas")) {
  const load = () =>
    import("./background.js")
      .then((m) =>
        m.startRibbon({
          paused: paused || reduceMotion.matches,
          product: showcaseController.activeProduct,
        }),
      )
      .catch(() => {});
  if ("requestIdleCallback" in window)
    requestIdleCallback(load, { timeout: 1600 });
  else setTimeout(load, 100);
}

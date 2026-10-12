import { products, productPages, productPath } from "../products.js";
import { icon, escapeHTML as e } from "./ui.js";
import { demoShell } from "./demo-views.js";
import { initialiseDemos } from "./demos.js";
import { transitionIn } from "./transitions.js";
import { neighbour, swipeDirection, workflows, workflowFrame } from "./workflows.js";

export function showcaseControls() {
  return `<div class="showcase-controls"><div class="showcase-modes" role="group" aria-label="Choose showcase mode"><button type="button" data-showcase-mode="try" aria-pressed="true" aria-controls="hero-preview">Try it yourself</button><button type="button" data-showcase-mode="tour" aria-pressed="false" aria-controls="walkthrough-view">Watch a workflow</button></div><div class="showcase-navigation"><button type="button" class="icon-button" data-showcase-direction="-1" aria-label="Previous system">${icon("arrow-left")}</button><button type="button" class="icon-button" data-showcase-direction="1" aria-label="Next system">${icon("arrow-right")}</button></div></div>`;
}
export function walkthroughShell() {
  return `<div id="walkthrough-view" hidden><ol class="tour-steps" aria-label="Sample workflow steps">${workflows.people.steps.map((s, i) => `<li><button type="button" data-tour-step="${i}" aria-current="${i === 0 ? "step" : "false"}"><span>0${i + 1}</span><strong>${e(s)}</strong></button></li>`).join("")}</ol><div id="tour-frame">${workflowFrame("people", 0)}</div><div class="tour-caption"><p data-tour-description>${workflows.people.descriptions[0]}</p><div class="tour-controls"><button type="button" class="text-link" data-tour-play aria-pressed="false">${icon("play")}<span>Play walkthrough</span></button><div><button type="button" class="icon-button" data-tour-direction="-1" aria-label="Previous workflow step" disabled>${icon("arrow-left")}</button><button type="button" class="icon-button" data-tour-direction="1" aria-label="Next workflow step">${icon("arrow-right")}</button></div></div></div><p class="tour-playback-note" data-playback-note hidden>Motion is paused. Explore the steps manually.</p><p class="sr-only" id="tour-status" role="status"></p></div>`;
}
export function initialiseShowcase() {
  const showcase = document.querySelector(".hero-showcase");
  if (!showcase) return { get activeProduct() { return "people"; } };
  const preview = showcase.querySelector("#hero-preview");
  const tour = showcase.querySelector("#walkthrough-view");
  const cache = new Map([["people", preview.firstElementChild]]);
  let activeProduct = "people", mode = "try", step = 0, playing = false, timer = null;
  let blocked = false, visible = true, dialogOpen = false, pointer = null;
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const canPlay = () => mode === "tour" && !blocked && !media.matches && !document.hidden && !dialogOpen && visible;
  function stop() {
    clearTimeout(timer); timer = null; playing = false;
    const button = tour.querySelector("[data-tour-play]");
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = `${icon("play")}<span>Play walkthrough</span>`;
  }
  function playbackAvailability() {
    const disabled = blocked || media.matches;
    tour.querySelector("[data-tour-play]").disabled = disabled;
    tour.querySelector("[data-playback-note]").hidden = !disabled;
  }
  function renderStep() {
    const w = workflows[activeProduct];
    const frame = tour.querySelector("#tour-frame");
    frame.innerHTML = workflowFrame(activeProduct, step);
    tour.querySelectorAll("[data-tour-step]").forEach((b, i) => {
      b.setAttribute("aria-current", i === step ? "step" : "false");
      b.querySelector("strong").textContent = w.steps[i];
    });
    tour.querySelector("[data-tour-description]").textContent = w.descriptions[step];
    tour.querySelector('[data-tour-direction="-1"]').disabled = step === 0;
    tour.querySelector('[data-tour-direction="1"]').disabled = step === 2;
    tour.querySelector("#tour-status").textContent = `Step ${step + 1} of 3: ${w.steps[step]}. ${w.descriptions[step]}`;
    if (mode === "tour") transitionIn(frame.firstElementChild);
  }
  function schedule() {
    if (!playing || !canPlay()) { stop(); return; }
    timer = setTimeout(() => {
      timer = null;
      if (!canPlay()) { stop(); return; }
      step++; renderStep();
      if (step === 2) stop(); else schedule();
    }, 2800);
  }
  function updateAside() {
    showcase.querySelector(".workbench-aside .overline").textContent = mode === "tour" ? "WATCH THE WORKFLOW" : "TRY IT YOURSELF";
    showcase.querySelector(".workbench-aside small").innerHTML = mode === "tour" ? "Sample data.<br>Guided walkthrough." : "Sample data.<br>Real interactions.";
    showcase.querySelector("[data-preview-description]").innerHTML = mode === "tour" ? e(workflows[activeProduct].title) : {
      people: "Two requests.<br>One clear next step.", flow: "Your month.<br>A clearer picture.", kretiv: "Good ideas.<br>Moving forward.",
    }[activeProduct];
  }
  function selectProduct(id, direction = 1) {
    if (!workflows[id] || id === activeProduct) return;
    stop(); activeProduct = id; step = 0;
    if (!cache.has(id)) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = demoShell(id, { compact: true });
      cache.set(id, wrapper.firstElementChild);
    }
    preview.replaceChildren(cache.get(id)); initialiseDemos(preview);
    showcase.querySelectorAll("[data-preview]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.preview === id)));
    const p = products.find((x) => x.id === id);
    const link = showcase.querySelector("[data-preview-link]");
    link.href = productPath(id); link.innerHTML = `Meet ${e(p.short)} ${icon("arrow-up-right")}`;
    updateAside();
    showcase.querySelector(".workbench-number").textContent = productPages[id].number;
    document.querySelector(".hero-art").dataset.tone = id;
    showcase.querySelector("[data-showcase-status]").textContent = `${p.short} selected. ${mode === "try" ? "Interactive demo" : "Sample workflow"}.`;
    document.dispatchEvent(new CustomEvent("product-change", { detail: id }));
    renderStep();
    if (mode === "try") transitionIn(preview.firstElementChild, { direction });
  }
  function selectMode(value) {
    if (!["try", "tour"].includes(value) || value === mode) return;
    stop(); mode = value;
    updateAside();
    preview.hidden = mode !== "try"; tour.hidden = mode !== "tour";
    showcase.querySelectorAll("[data-showcase-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.showcaseMode === mode)));
    showcase.querySelector("[data-showcase-status]").textContent = mode === "tour" ? "Sample workflow selected. Use the step buttons or play the walkthrough." : "Interactive demo selected. Your earlier changes are preserved.";
    if (mode === "tour") renderStep(); else transitionIn(preview.firstElementChild);
  }
  showcase.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.preview) selectProduct(button.dataset.preview);
    if (button.hasAttribute("data-showcase-direction")) selectProduct(neighbour(activeProduct, Number(button.dataset.showcaseDirection)), Number(button.dataset.showcaseDirection));
    if (button.dataset.showcaseMode) selectMode(button.dataset.showcaseMode);
    if (button.hasAttribute("data-tour-step")) { stop(); step = Number(button.dataset.tourStep); renderStep(); }
    if (button.hasAttribute("data-tour-direction") && !button.disabled) { stop(); step = Math.max(0, Math.min(2, step + Number(button.dataset.tourDirection))); renderStep(); }
    if (button.hasAttribute("data-tour-play")) {
      if (playing) stop();
      else if (canPlay()) {
        step = 0; renderStep(); playing = true;
        button.setAttribute("aria-pressed", "true"); button.innerHTML = `${icon("pause")}<span>Stop walkthrough</span>`;
        schedule();
      } else tour.querySelector("#tour-status").textContent = "Automatic playback is paused. Use the step buttons to explore the workflow.";
    }
  });
  // Do not claim a gesture until horizontal intent is clear. Vertical page
  // scrolling, demo forms, buttons, and task dragging retain their own events.
  const gestureSurface = showcase.querySelector(".hero-workbench");
  gestureSurface.addEventListener("pointerdown", (event) => {
    pointer = null;
    if (event.isPrimary === false || event.button > 0 || event.target.closest("button,a,input,textarea,select,[draggable='true']")) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  gestureSurface.addEventListener("pointerup", (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const direction = swipeDirection(event.clientX - pointer.x, event.clientY - pointer.y);
    pointer = null;
    if (direction) selectProduct(neighbour(activeProduct, direction), direction);
  });
  gestureSurface.addEventListener("pointercancel", () => { pointer = null; });
  gestureSurface.addEventListener("pointerleave", (event) => { if (event.pointerType === "mouse") pointer = null; });
  document.addEventListener("motion-state", (event) => { blocked = event.detail; if (blocked) stop(); playbackAvailability(); });
  media.addEventListener("change", () => { if (media.matches) stop(); playbackAvailability(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
  document.addEventListener("dialog-state", (event) => { dialogOpen = event.detail; if (dialogOpen) stop(); });
  let observer;
  if (typeof IntersectionObserver !== "undefined") {
    observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) stop(); });
    observer.observe(showcase);
  }
  window.addEventListener("pagehide", () => { stop(); observer?.disconnect(); }, { once: true });
  playbackAvailability();
  return { get activeProduct() { return activeProduct; } };
}

import { animate } from "motion/mini";

const active = new Set();
const owners = new WeakMap();
let paused = false;
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const supported = () => typeof Element !== "undefined" && typeof Element.prototype.animate === "function";

function finishAll() {
  for (const item of [...active]) {
    item.animation.complete();
  }
}
export function transitionIn(element, { direction = 1 } = {}) {
  if (!element || paused || reduced() || !supported()) return;
  // Animate the child only: the parent owns the existing scroll transform.
  for (const item of [...active]) {
    if (item.element === element) item.animation.complete();
  }
  const previous = { opacity: element.style.opacity, transform: element.style.transform };
  const animation = animate(element, {
    opacity: [.5, 1],
    transform: [`translateY(${direction * 12}px)`, "translateY(0px)"],
  }, { duration: .32, ease: [0.22, 1, 0.36, 1] });
  const item = { element, animation, restore() {
    if (owners.get(element) === item) {
      element.style.opacity = previous.opacity;
      element.style.transform = previous.transform;
      owners.delete(element);
    }
    active.delete(item);
  } };
  active.add(item);
  owners.set(element, item);
  Promise.resolve(animation).then(item.restore, item.restore);
}
export function initialiseTransitions() {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  document.addEventListener("motion-state", (event) => {
    paused = event.detail;
    if (paused) finishAll();
  });
  motion.addEventListener("change", () => { if (motion.matches) finishAll(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) finishAll(); });
  if (!supported() || reduced()) return;
  // No CSS hides content in advance: no JS or observer still gives a full page.
  if (typeof IntersectionObserver === "undefined") return;
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) {
      transitionIn(entry.target);
      observer.unobserve(entry.target);
    }
  }, { threshold: .15 });
  document.querySelectorAll(".section-heading, .story-copy, .life-copy, .product-hero-grid > div:first-child")
    .forEach((element) => observer.observe(element));
  window.addEventListener("pagehide", (event) => { finishAll(); if (!event.persisted) observer.disconnect(); });
}

// CSS owns the decorative motion so it also starts on touch-only devices.
// JS only suspends offscreen work and adds a small optional desktop tilt.
export function startRibbon({ paused = false } = {}) {
  const host = document.querySelector(".hero-art");
  if (!host) return () => {};
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  let visible = true, dialogOpen = Boolean(document.querySelector("dialog[open]"));
  let pageHidden = false;
  const cleanup = [];
  const listen = (target, name, callback, options) => {
    target.addEventListener(name, callback, options);
    cleanup.push(() => target.removeEventListener(name, callback, options));
  };
  const update = () => host.classList.toggle("motion-idle", paused || motion.matches || !visible || document.hidden || pageHidden || dialogOpen);
  const resetTilt = () => {
    host.style.removeProperty("--pointer-x");
    host.style.removeProperty("--pointer-y");
  };
  const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    update();
  });
  observer?.observe(host);
  listen(host, "pointermove", (event) => {
    if (event.pointerType !== "mouse" || !finePointer.matches || host.classList.contains("motion-idle")) return;
    const r = host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const x = Math.max(-1, Math.min(1, (event.clientX - r.left) / r.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - r.top) / r.height * 2 - 1));
    host.style.setProperty("--pointer-x", `${x * 8}deg`);
    host.style.setProperty("--pointer-y", `${-y * 6}deg`);
  });
  listen(host, "pointerleave", resetTilt);
  listen(document, "motion-state", (event) => { paused = event.detail; resetTilt(); update(); });
  listen(document, "dialog-state", (event) => { dialogOpen = event.detail; update(); });
  listen(document, "visibilitychange", update);
  listen(motion, "change", () => { resetTilt(); update(); });
  function dispose() {
    observer?.disconnect();
    cleanup.forEach((remove) => remove());
    resetTilt();
    host.classList.remove("motion-idle");
  }
  listen(window, "pagehide", (event) => {
    pageHidden = true;
    update();
    if (!event.persisted) dispose();
  });
  listen(window, "pageshow", () => { pageHidden = false; update(); });
  update();
  return dispose;
}

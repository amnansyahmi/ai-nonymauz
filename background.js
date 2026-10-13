// A time-based loop starts on touch devices without hover or a first tap.
// CSS remains the fallback when requestAnimationFrame is unavailable.
export function startRibbon({ paused = false } = {}) {
  const host = document.querySelector(".hero-art");
  if (!host) return () => {};
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  let visible = true, dialogOpen = Boolean(document.querySelector("dialog[open]"));
  let pageHidden = false;
  const turn = host.querySelector(".hero-emblem-turn");
  const animated = turn && typeof requestAnimationFrame === "function" && typeof cancelAnimationFrame === "function";
  let frame = null, lastTime = null, elapsed = 0;
  const draw = () => {
    turn.style.transform = `translateY(${Math.sin(elapsed / 950) * 6}px) rotateY(${elapsed * .03}deg) rotateZ(-3deg)`;
  };
  function tick(time) {
    frame = null;
    if (lastTime !== null) elapsed += Math.min(time - lastTime, 64);
    lastTime = time;
    draw();
    frame = requestAnimationFrame(tick);
  }
  if (animated) { host.classList.add("hero-js-motion"); draw(); }
  const cleanup = [];
  const listen = (target, name, callback, options) => {
    target.addEventListener(name, callback, options);
    cleanup.push(() => target.removeEventListener(name, callback, options));
  };
  const update = () => {
    const idle = paused || motion.matches || !visible || document.hidden || pageHidden || dialogOpen;
    host.classList.toggle("motion-idle", idle);
    if (!animated) return;
    if (idle) {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null; lastTime = null;
      if (motion.matches) turn.style.transform = "none";
    } else if (frame === null) frame = requestAnimationFrame(tick);
  };
  const resetTilt = () => {
    host.style.removeProperty("--pointer-x");
    host.style.removeProperty("--pointer-y");
  };
  const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver((entries) => {
    // Several crossings can be delivered together after a mobile scroll.
    for (const entry of entries) if (entry.target === host) visible = entry.isIntersecting;
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
    if (animated && frame !== null) cancelAnimationFrame(frame);
    frame = null; lastTime = null;
    turn?.style.removeProperty("transform");
    host.classList.remove("hero-js-motion");
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

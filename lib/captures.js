import { icon, escapeHTML as e } from "./ui.js";
import { transitionIn } from "./transitions.js";

const SLIDE_DURATION_MS = 4000;

export const peopleCaptures = [
  {
    id: "overview", label: "Your workday, at a glance",
    desktop: { src: "/assets/products/people-overview-desktop.webp", width: 1440, height: 2688, alt: "People dashboard in a sample workspace, desktop capture" },
    mobile: { src: "/assets/products/people-overview-mobile.webp", width: 320, height: 640, alt: "People dashboard in a sample workspace, phone capture" },
  },
  {
    id: "directory", label: "Your people, together",
    desktop: { src: "/assets/products/people-desktop.webp", width: 1440, height: 1000, alt: "People employee directory in a sample workspace, desktop capture" },
    mobile: { src: "/assets/products/people-directory-mobile.webp", width: 390, height: 844, alt: "People employee directory in a sample workspace, phone capture" },
  },
  {
    id: "leave", label: "A little time away",
    mobile: { src: "/assets/products/people-mobile.webp", width: 390, height: 844, alt: "People leave planner in a sample workspace, phone capture" },
  },
];
export function swipeDirection(dx, dy) {
  return Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.5 ? (dx < 0 ? 1 : -1) : 0;
}
const image = (shot, kind) => `<img class="device-${kind}-capture" src="${shot.src}" alt="${e(shot.alt)}" width="${shot.width}" height="${shot.height}" loading="lazy" decoding="async" draggable="false">`;
export function deviceShowcase(prefix) {
  const first = peopleCaptures[0];
  return `<div class="device-showcase" data-device-preview role="region" aria-roledescription="carousel" aria-label="People interface previews">
    <div class="device-stage" data-layout="both" role="group" aria-roledescription="slide" aria-label="1 of 3: ${e(first.label)}">
      <div class="mockup-laptop"><div class="laptop-lid"><span class="laptop-camera" aria-hidden="true"></span><div class="laptop-screen">${image(first.desktop, "desktop")}</div></div><div class="laptop-base" aria-hidden="true"><span></span></div></div>
      <div class="mockup-phone"><span class="phone-camera" aria-hidden="true"></span><div class="phone-screen">${image(first.mobile, "mobile")}</div><span class="phone-homebar" aria-hidden="true"></span></div>
    </div>
    <div class="device-caption"><div><span class="overline">PEOPLE / INTERFACE PREVIEW</span><h3 id="${prefix}-caption" data-device-caption>${e(first.label)}</h3></div><span class="device-counter" data-device-counter>01 / 03</span></div>
    <div class="device-controls"><div class="device-arrows"><button type="button" class="icon-button" data-device-direction="-1" aria-label="Previous People preview">${icon("arrow-left")}</button><button type="button" class="icon-button" data-device-direction="1" aria-label="Next People preview">${icon("arrow-right")}</button></div>
      <div class="device-dots" role="group" aria-label="Choose a People preview">${peopleCaptures.map((scene, i) => `<button type="button" data-device-slide="${i}" aria-label="Show preview ${i + 1}: ${e(scene.label)}" aria-pressed="${i === 0}"><span></span></button>`).join("")}</div>
      <button type="button" class="device-play" data-device-play aria-pressed="false" aria-label="Play People slideshow">${icon("play")}<span>Play slideshow</span></button>
    </div><div class="device-progress" aria-hidden="true"><span></span></div><p class="device-footnote">Sample workspace. Swipe or use the arrows to explore.</p><p class="sr-only" data-device-status role="status" aria-live="polite"></p>
  </div>`;
}
export function initialiseDevicePreviews(root = document) {
  root.querySelectorAll("[data-device-preview]").forEach((gallery) => {
    const stage = gallery.querySelector(".device-stage");
    const laptop = gallery.querySelector(".mockup-laptop");
    const desktop = gallery.querySelector(".device-desktop-capture");
    const phone = gallery.querySelector(".device-mobile-capture");
    const play = gallery.querySelector("[data-device-play]");
    const footnote = gallery.querySelector(".device-footnote");
    gallery.style.setProperty("--slide-duration", `${SLIDE_DURATION_MS}ms`);
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let index = 0, timer = null, playing = false, paused = false, visible = true, dialogOpen = false, pointer = null;
    const canPlay = () => !paused && !media.matches && !document.hidden && visible && !dialogOpen;
    function stop() {
      const wasPlaying = playing;
      const held = playing && typeof getComputedStyle === "function" ? getComputedStyle(desktop).transform : null;
      clearTimeout(timer); timer = null; playing = false;
      gallery.classList.remove("is-playing");
      if (held && held !== "none") desktop.style.transform = held;
      play.setAttribute("aria-pressed", "false");
      play.setAttribute("aria-label", "Play People slideshow");
      play.innerHTML = `${icon("play")}<span>Play slideshow</span>`;
      if (wasPlaying) footnote.textContent = "Sample workspace · slideshow paused. Swipe or use the arrows.";
    }
    function availability() {
      play.disabled = paused || media.matches;
      play.title = play.disabled ? "Motion is paused. Use the arrows to explore." : "Play the interface slideshow";
    }
    function sizePan() {
      const shot = peopleCaptures[index].desktop;
      if (!shot) return;
      const screen = gallery.querySelector(".laptop-screen");
      const r = screen.getBoundingClientRect();
      const overflow = Math.min(0, r.height - r.width * shot.height / shot.width);
      desktop.style.setProperty("--preview-pan", `${overflow}px`);
    }
    function update(announce = true) {
      const scene = peopleCaptures[index];
      desktop.style.transform = "";
      stage.dataset.layout = scene.desktop ? "both" : "phone";
      laptop.hidden = !scene.desktop;
      if (scene.desktop) {
        desktop.src = scene.desktop.src; desktop.alt = scene.desktop.alt;
        desktop.width = scene.desktop.width; desktop.height = scene.desktop.height;
      }
      phone.src = scene.mobile.src; phone.alt = scene.mobile.alt;
      phone.width = scene.mobile.width; phone.height = scene.mobile.height;
      stage.setAttribute("aria-label", `${index + 1} of ${peopleCaptures.length}: ${scene.label}`);
      gallery.querySelector("[data-device-caption]").textContent = scene.label;
      gallery.querySelector("[data-device-counter]").textContent = `0${index + 1} / 0${peopleCaptures.length}`;
      gallery.querySelectorAll("[data-device-slide]").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.deviceSlide) === index)));
      // Do not interrupt a screen reader with announcements during playback.
      gallery.querySelector("[data-device-status]").textContent = announce ? `Preview ${index + 1} of ${peopleCaptures.length}: ${scene.label}.` : "";
      sizePan(); transitionIn(stage);
    }
    function schedule() {
      clearTimeout(timer);
      if (!playing || !canPlay()) { stop(); return; }
      timer = setTimeout(() => {
        timer = null;
        if (!canPlay()) { stop(); return; }
        index = (index + 1) % peopleCaptures.length;
        // Restart the scan for the next actual desktop capture.
        gallery.classList.remove("is-playing");
        update(false);
        void stage.offsetWidth;
        gallery.classList.add("is-playing");
        schedule();
      }, SLIDE_DURATION_MS);
    }
    function select(next) {
      stop();
      index = (next + peopleCaptures.length) % peopleCaptures.length;
      update();
    }
    gallery.addEventListener("click", (event) => {
      const direction = event.target.closest("[data-device-direction]");
      const dot = event.target.closest("[data-device-slide]");
      const button = event.target.closest("[data-device-play]");
      if (direction) select(index + Number(direction.dataset.deviceDirection));
      if (dot) select(Number(dot.dataset.deviceSlide));
      if (button && !button.disabled) {
        if (playing) stop();
        else if (canPlay()) {
          // Confirm the action with a screen change immediately, especially
          // on phones where the desktop-only scan is mostly obscured.
          index = (index + 1) % peopleCaptures.length;
          update(false);
          desktop.style.transform = "";
          playing = true; gallery.classList.add("is-playing");
          play.setAttribute("aria-pressed", "true");
          play.setAttribute("aria-label", "Pause People slideshow");
          play.innerHTML = `${icon("pause")}<span>Pause slideshow</span>`;
          footnote.textContent = "Sample workspace · slideshow playing. Screens change every 4 seconds.";
          schedule();
        }
      }
    });
    gallery.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault(); select(index + (event.key === "ArrowRight" ? 1 : -1));
      }
    });
    gallery.addEventListener("focusin", (event) => {
      // Safari can focus the pressed toggle after its click. That focus must
      // not immediately undo an explicit playback request.
      if (!event.target.closest("[data-device-play]")) stop();
    });
    stage.addEventListener("pointerdown", (event) => {
      stop();
      pointer = null;
      if (event.isPrimary === false || event.button > 0) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    });
    stage.addEventListener("pointerup", (event) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const direction = swipeDirection(event.clientX - pointer.x, event.clientY - pointer.y);
      pointer = null;
      if (direction) select(index + direction);
    });
    stage.addEventListener("pointercancel", () => { pointer = null; });
    desktop.addEventListener("load", sizePan);
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) stop(); });
    observer?.observe(gallery);
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(sizePan);
    resize?.observe(stage);
    document.addEventListener("motion-state", (event) => { paused = event.detail; if (paused) stop(); availability(); });
    media.addEventListener("change", () => { if (media.matches) stop(); availability(); });
    document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
    document.addEventListener("dialog-state", (event) => { dialogOpen = event.detail; if (dialogOpen) stop(); });
    window.addEventListener("pagehide", (event) => { stop(); if (!event.persisted) { observer?.disconnect(); resize?.disconnect(); } });
    availability(); sizePan();
  });
}

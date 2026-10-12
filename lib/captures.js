import { icon, escapeHTML as e } from "./ui.js";
import { transitionIn } from "./transitions.js";

export const peopleCaptures = [
  {
    id: "overview", label: "Overview",
    desktop: { src: "/assets/products/people-overview-desktop.webp", width: 1440, height: 2688, alt: "People dashboard in a sample workspace, desktop capture" },
    mobile: { src: "/assets/products/people-overview-mobile.webp", width: 320, height: 640, alt: "People dashboard in a sample workspace, phone capture" },
  },
  {
    id: "directory", label: "Employee directory",
    desktop: { src: "/assets/products/people-desktop.webp", width: 1440, height: 1000, alt: "People employee directory in a sample workspace, desktop capture" },
    mobile: { src: "/assets/products/people-directory-mobile.webp", width: 390, height: 844, alt: "People employee directory in a sample workspace, phone capture" },
  },
  {
    id: "leave", label: "Leave planner",
    mobile: { src: "/assets/products/people-mobile.webp", width: 390, height: 844, alt: "People leave planner in a sample workspace, phone capture" },
  },
];
export function captureGallery(prefix) {
  const scene = peopleCaptures[0], shot = scene.desktop;
  return `<div class="capture-gallery" data-capture-gallery>
    <div class="capture-toolbar"><div class="capture-scenes" role="group" aria-label="Choose a People screen">${peopleCaptures.map((s, i) => `<button type="button" data-capture-scene="${s.id}" aria-pressed="${i === 0}">${e(s.label)}</button>`).join("")}</div>
    <div class="capture-devices" role="group" aria-label="Choose screenshot device"><button type="button" data-capture-device="desktop" aria-pressed="true">${icon("monitor")}<span>Desktop</span></button><button type="button" data-capture-device="mobile" aria-pressed="false">${icon("smartphone")}<span>Phone</span></button></div></div>
    <figure class="capture-stage" data-device="desktop"><button type="button" class="capture-enlarge" data-image="${shot.src}" data-alt="${e(shot.alt)}" aria-label="Enlarge People overview screenshot" aria-describedby="${prefix}-caption"><img src="${shot.src}" alt="${e(shot.alt)}" width="${shot.width}" height="${shot.height}" loading="lazy" decoding="async"></button>
    <figcaption id="${prefix}-caption"><span data-capture-caption>People / Overview · Desktop</span><span>${icon("expand")} View full capture</span></figcaption></figure>
    <p class="capture-note">People interface captures · sample workspace. Each device shows a separate demo session.</p><p class="sr-only" data-capture-status role="status"></p>
  </div>`;
}
export function initialiseCaptures(root = document) {
  root.querySelectorAll("[data-capture-gallery]").forEach((gallery) => {
    let scene = peopleCaptures[0], preferred = matchMedia("(max-width: 650px)").matches ? "mobile" : "desktop";
    function update() {
      const device = scene[preferred] ? preferred : "mobile";
      const shot = scene[device];
      const button = gallery.querySelector(".capture-enlarge");
      const img = button.querySelector("img");
      img.src = shot.src; img.alt = shot.alt; img.width = shot.width; img.height = shot.height;
      button.dataset.image = shot.src; button.dataset.alt = shot.alt;
      button.setAttribute("aria-label", `Enlarge People ${scene.label.toLowerCase()} ${device} screenshot`);
      gallery.querySelector(".capture-stage").dataset.device = device;
      gallery.querySelector("[data-capture-caption]").textContent = `People / ${scene.label} · ${device === "desktop" ? "Desktop" : "Phone"}`;
      gallery.querySelectorAll("[data-capture-scene]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.captureScene === scene.id)));
      gallery.querySelectorAll("[data-capture-device]").forEach((b) => {
        b.disabled = !scene[b.dataset.captureDevice];
        b.setAttribute("aria-pressed", String(b.dataset.captureDevice === device));
      });
      gallery.querySelector("[data-capture-status]").textContent = `${scene.label}, ${device === "desktop" ? "desktop" : "phone"} capture selected.`;
    }
    gallery.addEventListener("click", (event) => {
      const screen = event.target.closest("[data-capture-scene]");
      const device = event.target.closest("[data-capture-device]");
      if (screen) scene = peopleCaptures.find((s) => s.id === screen.dataset.captureScene) || scene;
      if (device && !device.disabled) preferred = device.dataset.captureDevice;
      if (screen || device) update();
    });
    gallery.querySelector("img").addEventListener("load", (event) => transitionIn(event.target));
    update();
  });
}

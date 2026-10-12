const paths = {
  "arrow-left": '<path d="M20 12H4m6-6-6 6 6 6"/>',
  play: '<path d="m8 4 12 8-12 8Z"/>',
  pause: '<path d="M8 4v16M16 4v16"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M12 17v4m-4 0h8"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  "arrow-right": '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  "arrow-up-right": '<path d="M6 18 18 6M6 6h12v12"/>',
  "arrow-down": '<path d="M12 4v16m-6-6 6 6 6-6"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>',
  layers: '<path d="m12 3 10 6-10 6L2 9Zm-10 12 10 6 10-6M2 12l10 6 10-6"/>',
  wallet:
    '<path d="M20 8V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v12H5a3 3 0 0 1-3-3V6m18 7h-5v4h5"/>',
  heart:
    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  briefcase:
    '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12a24 24 0 0 0 18 0m-9 0v3"/>',
  spark:
    '<path d="m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6ZM20 2v4m-2-2h4"/>',
  shield: '<path d="m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6Zm-4 10 3 3 5-6"/>',
  "map-pin":
    '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  "mouse-pointer": '<path d="m3 3 7 18 3-8 8-3ZM13 13l7 7"/>',
  smartphone:
    '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 18h4"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="m6 6 12 12M6 18 18 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18m-12 4h2m3 0h2"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  pen: '<path d="m16 3 5 5-12 12-6 1 1-6Zm-2 2 5 5"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
};
export const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.layers}</svg>`;
export function hydrateIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = icon(el.dataset.icon);
  });
}

export const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"\']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "\'": "&#39;",
      })[c],
  );

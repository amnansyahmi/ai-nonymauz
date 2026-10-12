import {
  AmbientLight, Color, DirectionalLight, ExtrudeGeometry, Group, Mesh,
  MeshStandardMaterial, Path, PerspectiveCamera, Scene, Shape, WebGLRenderer,
} from "three";

const palettes = { people: "#3157df", flow: "#247c65", kretiv: "#7758bd" };

// The N + crossbar from assets/mark.svg, as one solid bevelled piece.
export function logoGeometry() {
  const shape = new Shape();
  const outline = [
    [-1, -1], [-.68, -1], [-.68, -.18], [-.22, -.18], [.68, -1],
    [1, -1], [1, 1], [.68, 1], [.68, .18], [.22, .18], [-.68, 1], [-1, 1],
  ];
  outline.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
  shape.closePath();
  for (const points of [
    [[-.68, .18], [-.22, .18], [-.68, .60]],
    [[.68, -.18], [.22, -.18], [.68, -.60]],
  ]) {
    const hole = new Path();
    points.forEach(([x, y], i) => i ? hole.lineTo(x, y) : hole.moveTo(x, y));
    hole.closePath();
    shape.holes.push(hole);
  }
  const geometry = new ExtrudeGeometry(shape, {
    depth: .38, steps: 1, bevelEnabled: true,
    bevelThickness: .055, bevelSize: .045, bevelSegments: 4,
  });
  geometry.translate(0, 0, -.19);
  geometry.computeBoundingSphere();
  return geometry;
}

export function startRibbon({ paused = false, product = "people" } = {}) {
  const canvas = document.querySelector("#ribbon-canvas");
  if (!canvas) return;
  const host = canvas.parentElement;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const cleanup = [];
  const listen = (target, name, callback, options) => {
    target.addEventListener(name, callback, options);
    cleanup.push(() => target.removeEventListener(name, callback, options));
  };
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  } catch {
    return; // The locally served SVG is already visible.
  }
  renderer.setClearColor(0x000000, 0);
  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, .1, 30);
  camera.position.set(0, 0, 6.6);
  const material = new MeshStandardMaterial({ color: palettes[product] || palettes.people, roughness: .26, metalness: .32 });
  const geometry = logoGeometry();
  const logo = new Group();
  logo.add(new Mesh(geometry, material));
  scene.add(logo);
  scene.add(new AmbientLight(0xffffff, 2));
  const key = new DirectionalLight(0xffffff, 4);
  key.position.set(-3, 4, 5);
  scene.add(key);
  const rim = new DirectionalLight(0x9eb9ff, 3);
  rim.position.set(3, 1, -4);
  scene.add(rim);
  const fill = new DirectionalLight(0xffffff, 1.5);
  fill.position.set(1, -3, 3);
  scene.add(fill);
  const targetColor = new Color(palettes[product] || palettes.people);
  let visible = true, dialogOpen = Boolean(document.querySelector("dialog[open]"));
  let lost = false, disposed = false, frame = 0, last = 0, elapsed = 0;
  let painted = 0, width = 0, height = 0, px = 0, py = 0, targetX = 0, targetY = 0;

  function draw() {
    if (!width || !height || lost || disposed) return;
    const stop = paused || motion.matches;
    // One complete turn every 24 seconds. Pausing holds the current pose.
    px += (targetX - px) * .08;
    py += (targetY - py) * .08;
    logo.rotation.set(.10 + (stop ? 0 : py * .10), -.30 + elapsed * Math.PI * 2 / 24000 + (stop ? 0 : px * .20), -.08);
    logo.position.y = stop ? 0 : Math.sin(elapsed / 1600) * .045;
    material.color.lerp(targetColor, stop ? 1 : .08);
    try {
      renderer.render(scene, camera);
      // Rendering can fail without throwing (e.g. shader compilation). Never
      // hide the fallback until a healthy frame actually draws the logo.
      const gl = renderer.getContext();
      if (!gl.isContextLost() && gl.getError() === gl.NO_ERROR && renderer.info.render.triangles > 0) {
        host.classList.add("webgl-ready");
      } else {
        host.classList.remove("webgl-ready");
        lost = true;
      }
    } catch {
      lost = true;
      host.classList.remove("webgl-ready");
    }
  }
  const canAnimate = () => visible && !paused && !motion.matches && !document.hidden && !dialogOpen && !lost && !disposed;
  function tick(time) {
    frame = 0;
    if (!canAnimate()) { last = 0; return; }
    if (last) elapsed += Math.min(time - last, 70);
    last = time;
    if (time - painted >= 1000 / 30) { draw(); painted = time; }
    if (canAnimate()) frame = requestAnimationFrame(tick);
  }
  function update() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    host.classList.toggle("logo-idle", !canAnimate());
    if (canAnimate()) frame = requestAnimationFrame(tick);
    if (paused || motion.matches) draw();
  }
  function resize() {
    const r = host.getBoundingClientRect();
    width = r.width; height = r.height;
    if (!width || !height || disposed || lost) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, width < 600 ? 1.25 : 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Keep the entire logo within narrow phone containers through every turn.
    camera.position.z = Math.max(6.6, 4.5 / camera.aspect);
    camera.updateProjectionMatrix();
    draw(); update();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
  observer.observe(host);
  listen(host, "pointermove", (event) => {
    if (event.pointerType !== "mouse" || paused || motion.matches) return;
    const r = host.getBoundingClientRect();
    targetX = ((event.clientX - r.left) / r.width) * 2 - 1;
    targetY = ((event.clientY - r.top) / r.height) * 2 - 1;
  });
  listen(host, "pointerleave", () => { targetX = 0; targetY = 0; });
  listen(document, "product-change", (event) => {
    targetColor.set(palettes[event.detail] || palettes.people);
    draw(); update();
  });
  listen(document, "motion-state", (event) => { paused = event.detail; update(); });
  listen(document, "dialog-state", (event) => { dialogOpen = event.detail; update(); });
  listen(document, "visibilitychange", update);
  listen(motion, "change", update);
  listen(canvas, "webglcontextlost", (event) => {
    event.preventDefault(); lost = true;
    host.classList.remove("webgl-ready"); update();
  });
  // Three.js rebuilds its resources on restoration before this handler runs.
  listen(canvas, "webglcontextrestored", () => { lost = false; resize(); });
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver.disconnect(); observer.disconnect();
    cleanup.forEach((remove) => remove());
    geometry.dispose(); material.dispose(); renderer.dispose();
    host.classList.remove("webgl-ready", "logo-idle");
  }
  listen(window, "pagehide", (event) => {
    if (event.persisted) { visible = false; update(); }
    else dispose();
  });
  listen(window, "pageshow", (event) => { if (event.persisted) { visible = true; resize(); } });
  resize();
  return dispose;
}

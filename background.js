// Small, dependency-free 3D scenes. Geometry is rotated in 3D, then projected
// onto a decorative canvas; no WebGL context or downloaded model is required.
const TAU = Math.PI * 2;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const button = document.querySelector('.motion-toggle');
let paused = false;
let frame = 0;
let elapsed = 0;
let lastTime = 0;
let lastPaint = 0;

function rotate([x, y, z], ax, ay, az) {
  let a = y * Math.cos(ax) - z * Math.sin(ax);
  z = y * Math.sin(ax) + z * Math.cos(ax); y = a;
  a = x * Math.cos(ay) + z * Math.sin(ay);
  z = -x * Math.sin(ay) + z * Math.cos(ay); x = a;
  return [x * Math.cos(az) - y * Math.sin(az), x * Math.sin(az) + y * Math.cos(az), z];
}

function project(point, size, cx, cy, angles) {
  const [x, y, z] = rotate(point, ...angles);
  const depth = 3.8 / (3.8 - z);
  return { x: cx + x * size * depth, y: cy + y * size * depth, z };
}

function sphere(compact) {
  const curves = [];
  const samples = compact ? 36 : 56;
  for (let i = 0; i < (compact ? 5 : 8); i++) {
    const longitude = i * Math.PI / (compact ? 5 : 8);
    curves.push(Array.from({ length: samples + 1 }, (_, j) => {
      const a = j / samples * TAU;
      return [Math.cos(a) * Math.cos(longitude), Math.sin(a), Math.cos(a) * Math.sin(longitude)];
    }));
  }
  for (let i = -2; i <= 2; i++) {
    const y = i * .3; const r = Math.sqrt(1 - y * y);
    curves.push(Array.from({ length: samples + 1 }, (_, j) => {
      const a = j / samples * TAU;
      return [r * Math.cos(a), y, r * Math.sin(a)];
    }));
  }
  return curves;
}

function torus(compact) {
  const curves = [];
  const count = compact ? 16 : 24;
  const samples = compact ? 40 : 64;
  const point = (a, b) => [(1 + .21 * Math.cos(b)) * Math.cos(a), .21 * Math.sin(b), (1 + .21 * Math.cos(b)) * Math.sin(a)];
  for (let i = 0; i < 6; i++) {
    curves.push(Array.from({ length: samples + 1 }, (_, j) => point(j / samples * TAU, i / 6 * TAU)));
  }
  for (let i = 0; i < count; i++) {
    curves.push(Array.from({ length: 17 }, (_, j) => point(i / count * TAU, j / 16 * TAU)));
  }
  return curves;
}

function wire(ctx, curves, size, cx, cy, angles, rgb, opacity) {
  // Two depth passes keep the back of the object lighter than its front.
  for (const front of [false, true]) {
    ctx.strokeStyle = `rgba(${rgb},${opacity * (front ? 1 : .3)})`;
    ctx.lineWidth = front ? 1 : .7;
    ctx.beginPath();
    for (const points of curves) {
      const projected = points.map(point => project(point, size, cx, cy, angles));
      for (let i = 1; i < projected.length; i++) {
        const a = projected[i - 1], b = projected[i];
        if ((a.z + b.z >= 0) !== front) continue;
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      }
    }
    ctx.stroke();
  }
}

const cubeVertices = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
const cubeFaces = [[0,1,2,3],[4,5,6,7],[0,1,5,4],[2,3,7,6],[0,3,7,4],[1,2,6,5]];
function cube(ctx, size, cx, cy, angles) {
  const points = cubeVertices.map(point => project(point.map(v => v * .6), size, cx, cy, angles));
  const faces = cubeFaces.map(indices => ({ indices, z: indices.reduce((z, i) => z + points[i].z, 0) / 4 })).sort((a,b) => a.z - b.z);
  for (const face of faces) {
    ctx.beginPath();
    face.indices.forEach((index, i) => { const p = points[index]; if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
    ctx.closePath();
    ctx.fillStyle = `rgba(71,116,205,${.04 + (face.z + 1) * .055})`;
    ctx.strokeStyle = 'rgba(73,116,194,.32)'; ctx.lineWidth = 1;
    ctx.fill(); ctx.stroke();
  }
}

const scenes = [...document.querySelectorAll('[data-scene]')].flatMap(canvas => {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return [];
  canvas.parentElement.classList.add('has-3d');
  return [{ canvas, ctx, type: canvas.dataset.scene, visible: false, w: 0, h: 0, compact: false, curves: [] }];
});

function draw(scene) {
  const { ctx, w, h, type, curves } = scene;
  if (!w || !h) return;
  ctx.clearRect(0, 0, w, h);
  const t = elapsed * .00013;
  if (type === 'hero') {
    wire(ctx, curves, Math.min(w, h) * .32, w * .8, h * .2,
      [.38, t, -.28], '72,116,187', .34);
    cube(ctx, Math.min(w, h) * .115, w * .12, h * .84 + Math.sin(t * 1.3) * 5,
      [t * .6 + .35, t * .7 + .5, -.2]);
  } else {
    const dark = type === 'endcap';
    wire(ctx, curves, Math.min(w, h) * (dark ? .36 : .32), w * .5, h * .5,
      [.83 + Math.sin(t * .6) * .12, t * .6, -.25], dark ? '151,183,231' : '88,131,194', dark ? .47 : .38);
  }
}

function resize(scene) {
  const { width, height } = scene.canvas.getBoundingClientRect();
  const ratio = Math.min(devicePixelRatio || 1, width < 540 ? 1.25 : 1.5);
  scene.w = width; scene.h = height; scene.compact = width < 540;
  scene.canvas.width = Math.round(width * ratio); scene.canvas.height = Math.round(height * ratio);
  scene.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  scene.curves = scene.type === 'hero' ? sphere(scene.compact) : torus(scene.compact);
  draw(scene);
}

function canAnimate() {
  return !paused && !motion.matches && !document.hidden && !document.querySelector('dialog[open]') && scenes.some(scene => scene.visible && scene.w && scene.h);
}

function tick(time) {
  frame = 0;
  if (!canAnimate()) { lastTime = 0; return; }
  if (lastTime) elapsed += Math.min(time - lastTime, 80);
  lastTime = time;
  if (time - lastPaint >= 1000 / 30) {
    scenes.filter(scene => scene.visible).forEach(draw);
    lastPaint = time;
  }
  frame = requestAnimationFrame(tick);
}

function update() {
  if (button) {
    button.hidden = motion.matches || scenes.length === 0;
    button.setAttribute('aria-pressed', String(paused));
    button.querySelector('span').textContent = paused ? 'Resume background animation' : 'Pause background animation';
    button.querySelector('path').setAttribute('d', paused ? 'm8 5 10 7-10 7Z' : 'M8 5v14M16 5v14');
  }
  if (canAnimate() && !frame) { lastTime = 0; frame = requestAnimationFrame(tick); }
  if (!canAnimate() && frame) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
  if (motion.matches) { elapsed = 0; scenes.forEach(draw); }
}

const visibility = new IntersectionObserver(entries => {
  entries.forEach(entry => { const scene = scenes.find(s => s.canvas === entry.target); if (scene) scene.visible = entry.isIntersecting; });
  update();
});
const sizing = new ResizeObserver(entries => {
  entries.forEach(entry => { const scene = scenes.find(s => s.canvas === entry.target); if (scene) resize(scene); });
  update();
});
scenes.forEach(scene => { resize(scene); sizing.observe(scene.canvas); visibility.observe(scene.canvas); });
button?.addEventListener('click', () => { paused = !paused; update(); });
motion.addEventListener('change', update);
document.addEventListener('visibilitychange', update);
// Stop ambient rendering while a modal is open, in addition to page scroll lock.
const dialogs = new MutationObserver(() => {
  const open = !!document.querySelector('dialog[open]');
  if (open && frame) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
  else if (!open) update();
});
document.querySelectorAll('dialog').forEach(dialog => dialogs.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
update();

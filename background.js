// A locally rendered, bevelled ribbon monogram. No model download or WebGL library.
const palettes = {
  people: [0.16, 0.3, 0.85],
  flow: [0.12, 0.48, 0.36],
  kretiv: [0.43, 0.26, 0.7],
};
export function ribbonGeometry() {
  const vertices = [];
  const normal = (a, b, c) => {
    const u = b.map((v, i) => v - a[i]);
    const v = c.map((n, i) => n - a[i]);
    const n = [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0],
    ];
    const l = Math.hypot(...n) || 1;
    return n.map((x) => x / l);
  };
  const tri = (a, b, c) => {
    const n = normal(a, b, c);
    for (const p of [a, b, c]) vertices.push(...p, ...n);
  };
  const quad = (a, b, c, d) => {
    tri(a, b, c);
    tri(a, c, d);
  };
  // A rectangular ribbon with bevelled corners, swept along the lowercase n arch.
  const path = [];
  for (let i = 0; i <= 10; i++) path.push([-0.83, -1.02 + i * 0.13, 0]);
  for (let i = 1; i <= 36; i++) {
    const a = Math.PI - (i / 36) * Math.PI;
    path.push([
      -0.04 + 0.79 * Math.cos(a),
      0.28 + 0.82 * Math.sin(a),
      0.055 * Math.sin(a),
    ]);
  }
  for (let i = 1; i <= 10; i++) path.push([0.75, 0.28 - i * 0.13, 0]);
  const cross = [
    [-0.19, -0.19],
    [0.19, -0.19],
    [0.25, -0.13],
    [0.25, 0.13],
    [0.19, 0.19],
    [-0.19, 0.19],
    [-0.25, 0.13],
    [-0.25, -0.13],
  ];
  const rings = path.map((p, i) => {
    const a = path[Math.max(0, i - 1)];
    const b = path[Math.min(path.length - 1, i + 1)];
    const dx = b[0] - a[0],
      dy = b[1] - a[1],
      len = Math.hypot(dx, dy) || 1;
    return cross.map(([w, z]) => [
      p[0] - (dy / len) * w,
      p[1] + (dx / len) * w,
      p[2] + z,
    ]);
  });
  for (let i = 0; i < rings.length - 1; i++)
    for (let j = 0; j < 8; j++)
      quad(
        rings[i][j],
        rings[i + 1][j],
        rings[i + 1][(j + 1) % 8],
        rings[i][(j + 1) % 8],
      );
  for (let j = 1; j < 7; j++) {
    tri(rings[0][0], rings[0][j + 1], rings[0][j]);
    const end = rings.at(-1);
    tri(end[0], end[j], end[j + 1]);
  }
  // A small bevelled dot completes the mark.
  const cx = 1.33,
    cy = -0.78,
    r = 0.235;
  for (let a = 0; a < 24; a++)
    for (let b = 0; b < 12; b++) {
      const point = (u, v) => {
        const longitude = (u / 24) * Math.PI * 2,
          latitude = (v / 12) * Math.PI;
        return [
          cx + r * Math.sin(latitude) * Math.cos(longitude),
          cy + r * Math.cos(latitude),
          r * Math.sin(latitude) * Math.sin(longitude),
        ];
      };
      quad(point(a, b), point(a + 1, b), point(a + 1, b + 1), point(a, b + 1));
    }
  return new Float32Array(vertices);
}
export function startRibbon({ paused = false, product = "people" } = {}) {
  const canvas = document.querySelector("#ribbon-canvas");
  if (!canvas) return;
  const host = canvas.parentElement;
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
    premultipliedAlpha: false,
  });
  if (!gl) return;
  const vertex = `attribute vec3 position;attribute vec3 normal;uniform mat4 matrix;uniform mat4 rotation;varying vec3 vNormal;varying vec3 vPosition;void main(){vec4 p=rotation*vec4(position,1.0);vNormal=mat3(rotation)*normal;vPosition=p.xyz;gl_Position=matrix*p;}`;
  const fragment = `precision mediump float;varying vec3 vNormal;varying vec3 vPosition;uniform vec3 color;void main(){vec3 n=normalize(vNormal);if(!gl_FrontFacing)n=-n;vec3 light=normalize(vec3(-1.0,2.0,3.5));vec3 view=normalize(vec3(0.0,0.0,6.0)-vPosition);float diffuse=max(dot(n,light),0.0);float spec=pow(max(dot(n,normalize(light+view)),0.0),56.0);float rim=pow(1.0-max(dot(n,view),0.0),3.0);vec3 shaded=color*(0.38+diffuse*0.87)+vec3(.55,.65,.90)*spec*.72+vec3(.24,.32,.50)*rim*.35;gl_FragColor=vec4(shaded,1.0);}`;
  const shader = (type, source) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      return null;
    }
    return s;
  };
  const vs = shader(gl.VERTEX_SHADER, vertex),
    fs = shader(gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) return;
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);
  const geometry = ribbonGeometry();
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, geometry, gl.STATIC_DRAW);
  for (const [name, offset] of [
    ["position", 0],
    ["normal", 12],
  ]) {
    const loc = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 24, offset);
  }
  const uniforms = Object.fromEntries(
    ["matrix", "rotation", "color"].map((name) => [
      name,
      gl.getUniformLocation(program, name),
    ]),
  );
  let width = 0,
    height = 0,
    visible = true,
    dialogOpen = Boolean(document.querySelector("dialog[open]")),
    lost = false,
    frame = 0,
    last = 0,
    elapsed = 0,
    painted = 0;
  let targetX = 0,
    targetY = 0,
    px = 0,
    py = 0;
  let targetColor = palettes[product] || palettes.people;
  let color = [...targetColor];
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const multiply = (a, b) => {
    const out = new Float32Array(16);
    for (let c = 0; c < 4; c++)
      for (let r = 0; r < 4; r++)
        for (let k = 0; k < 4; k++)
          out[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
    return out;
  };
  function draw() {
    if (!width || !height || lost) return;
    const stop = paused || motion.matches;
    const t = stop ? 0 : elapsed * 0.00035;
    px += (targetX - px) * 0.06;
    py += (targetY - py) * 0.06;
    const ax = 0.12 + (stop ? 0 : py * 0.09),
      ay = -0.38 + Math.sin(t) * 0.12 + (stop ? 0 : px * 0.16),
      az = -0.11;
    const rx = [
      1,
      0,
      0,
      0,
      0,
      Math.cos(ax),
      Math.sin(ax),
      0,
      0,
      -Math.sin(ax),
      Math.cos(ax),
      0,
      0,
      0,
      0,
      1,
    ];
    const ry = [
      Math.cos(ay),
      0,
      -Math.sin(ay),
      0,
      0,
      1,
      0,
      0,
      Math.sin(ay),
      0,
      Math.cos(ay),
      0,
      0,
      0,
      0,
      1,
    ];
    const rz = [
      Math.cos(az),
      Math.sin(az),
      0,
      0,
      -Math.sin(az),
      Math.cos(az),
      0,
      0,
      0,
      1,
      0,
      0,
      Math.sin(t) * 0.025,
      0,
      1,
    ];
    const rotation = multiply(rz, multiply(ry, rx));
    const aspect = width / height,
      f = 1 / Math.tan(0.62 / 2),
      near = 0.1,
      far = 30,
      z = -5.8;
    const perspective = new Float32Array([
      f / aspect,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (far + near) / (near - far),
      -1,
      0,
      0,
      (2 * far * near) / (near - far),
      0,
    ]);
    const view = new Float32Array([
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      -0.12,
      -0.02,
      z,
      1,
    ]);
    const matrix = multiply(perspective, view);
    color = color.map((c, i) =>
      stop ? targetColor[i] : c + (targetColor[i] - c) * 0.08,
    );
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(uniforms.matrix, false, matrix);
    gl.uniformMatrix4fv(uniforms.rotation, false, rotation);
    gl.uniform3fv(uniforms.color, color);
    gl.drawArrays(gl.TRIANGLES, 0, geometry.length / 6);
    host.classList.add("webgl-ready");
  }
  function canAnimate() {
    return (
      visible &&
      !paused &&
      !motion.matches &&
      !document.hidden &&
      !dialogOpen &&
      !lost
    );
  }
  function tick(time) {
    frame = 0;
    if (!canAnimate()) {
      last = 0;
      return;
    }
    if (last) elapsed += Math.min(time - last, 70);
    last = time;
    if (time - painted >= 1000 / 30) {
      draw();
      painted = time;
    }
    frame = requestAnimationFrame(tick);
  }
  function update() {
    if (canAnimate() && !frame) {
      last = 0;
      frame = requestAnimationFrame(tick);
    } else if (!canAnimate() && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    }
    if (paused || motion.matches) draw();
  }
  function resize() {
    const r = host.getBoundingClientRect();
    width = r.width;
    height = r.height;
    const ratio = Math.min(devicePixelRatio || 1, width < 600 ? 1.25 : 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    draw();
    update();
  }
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    update();
  }).observe(host);
  host.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    const r = host.getBoundingClientRect();
    targetX = ((event.clientX - r.left) / r.width) * 2 - 1;
    targetY = ((event.clientY - r.top) / r.height) * 2 - 1;
  });
  host.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
  });
  document.addEventListener("product-change", (event) => {
    targetColor = palettes[event.detail] || palettes.people;
    draw();
    update();
  });
  document.addEventListener("motion-state", (event) => {
    paused = event.detail;
    update();
  });
  document.addEventListener("dialog-state", (event) => {
    dialogOpen = event.detail;
    update();
  });
  document.addEventListener("visibilitychange", update);
  motion.addEventListener("change", update);
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    lost = true;
    host.classList.remove("webgl-ready");
    update();
  });
  // Keep the SVG visible after context loss; interaction and content remain available.
  resize();
}

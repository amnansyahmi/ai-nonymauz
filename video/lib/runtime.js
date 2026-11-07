// Browser-side helpers inlined into every walkthrough composition.
// Everything here is seek-safe: the DOM is prepared once at load, and all motion is a
// paused GSAP timeline that HyperFrames scrubs frame by frame.
(function () {
  function create({ scale, width, height, input }) {
    const cam = document.querySelector("[data-cam]");
    const layer = document.querySelector("[data-fx]");
    const frame = document.querySelector(".frame"), card = frame.firstElementChild;
    // Pin the card's top edge: centred when it fits, 16px from the top when it is taller
    // than the screen. Anything that grows later then extends downwards only.
    frame.style.paddingTop = `${Math.max(16, Math.round((height / scale - card.offsetHeight) / 2))}px`;
    // Effects sit outside the card, so give them the product's accent colour.
    layer.style.setProperty("--demo-accent", getComputedStyle(card).getPropertyValue("--demo-accent").trim() || "#3455db");
    gsap.set(cam, { x: 0, y: 0, scale, transformOrigin: "0 0" });
    const camBox = cam.getBoundingClientRect();

    // Element bounds in the camera's unscaled coordinate space.
    function box(target) {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      if (!el) throw new Error(`Walkthrough target not found: ${target}`);
      const r = el.getBoundingClientRect();
      const x = (r.left - camBox.left) / scale, y = (r.top - camBox.top) / scale;
      const w = r.width / scale, h = r.height / scale;
      return { el, x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
    }

    // Smallest box that contains every target, for framing a group of elements.
    function union(...targets) {
      const boxes = targets.map(box);
      const x = Math.min(...boxes.map(b => b.x)), y = Math.min(...boxes.map(b => b.y));
      const r = Math.max(...boxes.map(b => b.x + b.w)), btm = Math.max(...boxes.map(b => b.y + b.h));
      return { x, y, w: r - x, h: btm - y, cx: (x + r) / 2, cy: (y + btm) / 2 };
    }

    // Camera: zoom 1 with no point shows the screen as composed; otherwise it centres on the
    // point without showing past the screen or (for a tall card) past the card plus a margin.
    const cardBox = box(card);
    const extent = {
      left: 0, top: 0, right: width / scale,
      bottom: Math.max(height / scale, cardBox.y + cardBox.h + 16),
    };
    function focus(tl, point, zoom, at, duration = 1, ease = "power3.inOut") {
      const s = scale * zoom;
      const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
      const x = point ? clamp(width / 2 - point.cx * s, width - extent.right * s, -extent.left * s) : 0;
      const y = point ? clamp(height / 2 - point.cy * s, height - extent.bottom * s, -extent.top * s) : 0;
      tl.to(cam, { x, y, scale: s, duration, ease }, at);
    }

    const pointer = document.createElement("div");
    pointer.className = input === "touch" ? "fx-touch" : "fx-pointer";
    pointer.innerHTML = input === "touch" ? "" :
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.2v16.1l4.4-4.1 2.7 6.1 2.9-1.3-2.7-6h6.1z"/></svg>';
    layer.append(pointer);
    gsap.set(pointer, { x: width / scale * 0.82, y: height / scale * 0.96, opacity: 0 });

    // Pointer glides between targets; on touch, the indicator appears where the finger lands.
    function move(tl, target, at, duration = 0.8) {
      const b = box(target);
      const x = input === "touch" ? b.cx : b.x + b.w * 0.62;
      const y = input === "touch" ? b.cy : b.y + b.h * 0.58;
      if (input === "touch") tl.set(pointer, { x, y }, at);
      else tl.to(pointer, { x, y, duration, ease: "power2.inOut" }, at);
    }
    function show(tl, at, visible = true, duration = 0.25) {
      tl.to(pointer, { opacity: visible ? 1 : 0, duration, ease: "power1.out" }, at);
    }
    function press(tl, target, at) {
      const b = box(target);
      const ripple = document.createElement("div");
      ripple.className = "fx-ripple";
      layer.append(ripple);
      gsap.set(ripple, { x: b.cx, y: b.cy, xPercent: -50, yPercent: -50, scale: 0.2, opacity: 0 });
      if (input === "touch") tl.to(pointer, { opacity: 1, scale: 1, duration: 0.12 }, at - 0.18);
      tl.to(pointer, { scale: 0.82, duration: 0.1, ease: "power2.out" }, at)
        .to(pointer, { scale: 1, duration: 0.18, ease: "power2.out" }, at + 0.1)
        .to(b.el, { scale: 0.95, duration: 0.1, ease: "power2.out" }, at)
        .to(b.el, { scale: 1, duration: 0.2, ease: "power2.out" }, at + 0.1)
        .set(ripple, { opacity: 0.32 }, at + 0.04)
        .to(ripple, { scale: 1.6, opacity: 0, duration: 0.55, ease: "power2.out" }, at + 0.04);
      if (input === "touch") tl.to(pointer, { opacity: 0, duration: 0.2 }, at + 0.2);
    }

    // A soft outline that draws attention to an area without covering it.
    function highlight(tl, target, at, duration = 1.2, pad = 6) {
      const b = box(target);
      const ring = document.createElement("div");
      ring.className = "fx-ring";
      layer.append(ring);
      gsap.set(ring, { x: b.x - pad, y: b.y - pad, width: b.w + pad * 2, height: b.h + pad * 2, opacity: 0 });
      tl.to(ring, { opacity: 1, duration: 0.3 }, at).to(ring, { opacity: 0, duration: 0.4 }, at + duration);
    }

    // Typing into a field: a focused overlay over the input shows the text growing letter by
    // letter with a caret. Returns the time typing finishes and the overlay, for clearing later.
    function type(tl, target, text, at, perSecond = 16) {
      const b = box(target), style = getComputedStyle(b.el);
      const field = document.createElement("div");
      field.className = "fx-field";
      Object.assign(field.style, {
        width: `${b.w}px`, height: `${b.h}px`, fontSize: style.fontSize, color: style.color,
        paddingLeft: style.paddingLeft, borderRadius: style.borderRadius, borderColor: style.borderTopColor,
      });
      const ring = document.createElement("span");
      ring.className = "fx-focus";
      field.append(ring);
      layer.append(field);
      gsap.set(field, { x: b.x, y: b.y, opacity: 0 });
      const steps = [...text].map((_, i) => {
        const step = document.createElement("span");
        step.className = "fx-typed";
        step.textContent = text.slice(0, i + 1);
        field.append(step);
        gsap.set(step, { opacity: 0 });
        return step;
      });
      const caret = document.createElement("i");
      caret.className = "fx-caret";
      tl.set(field, { opacity: 1 }, at);
      steps.forEach((step, i) => {
        const t = at + (i + 1) / perSecond;
        tl.set(step, { opacity: 1 }, t);
        if (i) tl.set(steps[i - 1], { opacity: 0 }, t);
      });
      const end = at + text.length / perSecond;
      const carets = steps.map(step => step.appendChild(caret.cloneNode()));
      // Leaving the field keeps its text and drops the focus ring and caret.
      const blur = (when) => tl.to([ring, ...carets], { opacity: 0, duration: 0.15 }, when);
      return { end, field, steps, blur };
    }

    // Two stacked states of one element; `to` fades over `from` without changing layout.
    function swap(tl, from, to, at, duration = 0.22) {
      tl.to(to, { opacity: 1, duration }, at).to(from, { opacity: 0, duration }, at);
    }
    return { box, union, focus, move, show, press, highlight, swap, type, pointer, card };
  }

  // Stack alternative contents in one grid cell so state changes never reflow the page.
  function stack(host, contents) {
    host.classList.add("fx-stack");
    host.replaceChildren(...contents.map((content, i) => {
      const layer = document.createElement("span");
      layer.className = "fx-layer";
      if (typeof content === "string") layer.textContent = content;
      else if (content && typeof content.html === "string") layer.innerHTML = content.html;
      else layer.append(content);
      layer.style.opacity = i === 0 ? "1" : "0";
      return layer;
    }));
    return [...host.children];
  }
  window.Walkthrough = { create, stack };
})();

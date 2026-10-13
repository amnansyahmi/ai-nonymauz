import test from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { startRibbon } from "../background.js";

test("touch hero motion starts without WebGL, idle callbacks or mouse events", () => {
  const { window, document } = parseHTML('<html><body><div class="hero-art"><div class="hero-emblem"><div class="hero-emblem-turn"></div></div></div></body></html>');
  const frames = new Map();
  let frameId = 0;
  const step = (time) => {
    const callbacks = [...frames.values()]; frames.clear();
    callbacks.forEach((callback) => callback(time));
  };
  const media = new Map();
  let observer;
  class Observer {
    constructor(callback) { this.callback = callback; observer = this; }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
    emit(isIntersecting) { this.callback([{ target: this.target, isIntersecting }]); }
  }
  Object.assign(globalThis, {
    document, window, IntersectionObserver: Observer,
    requestAnimationFrame: (callback) => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: (id) => frames.delete(id),
    matchMedia: (query) => {
      if (!media.has(query)) {
        const target = new window.EventTarget();
        target.matches = false;
        media.set(query, target);
      }
      return media.get(query);
    },
  });
  const host = document.querySelector('.hero-art');
  const dispose = startRibbon();
  const turn = host.querySelector('.hero-emblem-turn');
  const initial = turn.style.transform;
  step(0); step(32);
  assert.notEqual(turn.style.transform, initial, 'logo transform advances without a touch or hover');
  assert.equal(frames.size, 1, 'only one render loop runs');
  assert.ok(!host.classList.contains('motion-idle'));
  observer.callback([
    { target: host, isIntersecting: false },
    { target: host, isIntersecting: true },
  ]);
  assert.ok(!host.classList.contains('motion-idle'), 'latest visibility entry wins after rapid scrolling');
  observer.emit(false);
  assert.equal(frames.size, 0, 'offscreen rendering stops');
  assert.ok(host.classList.contains('motion-idle'));
  observer.emit(true);
  assert.equal(frames.size, 1, 'visible logo resumes');
  assert.ok(!host.classList.contains('motion-idle'));
  document.dispatchEvent(new window.CustomEvent('motion-state', { detail: true }));
  observer.emit(false); observer.emit(true);
  assert.ok(host.classList.contains('motion-idle'), 'offscreen round trip preserves explicit pause');
  document.dispatchEvent(new window.CustomEvent('motion-state', { detail: false }));
  assert.ok(!host.classList.contains('motion-idle'));
  document.dispatchEvent(new window.CustomEvent('dialog-state', { detail: true }));
  assert.ok(host.classList.contains('motion-idle'));
  document.dispatchEvent(new window.CustomEvent('dialog-state', { detail: false }));
  const reduce = media.get('(prefers-reduced-motion: reduce)');
  reduce.matches = true;
  reduce.dispatchEvent(new window.Event('change'));
  assert.equal(frames.size, 0);
  assert.equal(turn.style.transform, 'none', 'reduced motion shows a face-on logo');
  assert.ok(host.classList.contains('motion-idle'));
  reduce.matches = false;
  reduce.dispatchEvent(new window.Event('change'));
  const hide = new window.Event('pagehide'); hide.persisted = true;
  window.dispatchEvent(hide);
  assert.ok(host.classList.contains('motion-idle'));
  window.dispatchEvent(new window.Event('pageshow'));
  assert.ok(!host.classList.contains('motion-idle'), 'back navigation resumes visible motion');
  dispose();
  assert.equal(frames.size, 0, 'disposal cancels animation work');
  assert.ok(observer.disconnected);
});

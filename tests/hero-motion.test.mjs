import test from "node:test";
import assert from "node:assert/strict";
import { parseHTML } from "linkedom";
import { startRibbon } from "../background.js";

test("touch hero motion starts without WebGL, idle callbacks or mouse events", () => {
  const { window, document } = parseHTML('<html><body><div class="hero-art"><div class="hero-emblem"></div></div></body></html>');
  const media = new Map();
  let observer;
  class Observer {
    constructor(callback) { this.callback = callback; observer = this; }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
    emit(isIntersecting) { this.callback([{ isIntersecting }]); }
  }
  Object.assign(globalThis, {
    document, window, IntersectionObserver: Observer,
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
  assert.ok(!host.classList.contains('motion-idle'));
  observer.emit(false);
  assert.ok(host.classList.contains('motion-idle'));
  observer.emit(true);
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
  assert.ok(host.classList.contains('motion-idle'));
  reduce.matches = false;
  reduce.dispatchEvent(new window.Event('change'));
  const hide = new window.Event('pagehide'); hide.persisted = true;
  window.dispatchEvent(hide);
  assert.ok(host.classList.contains('motion-idle'));
  window.dispatchEvent(new window.Event('pageshow'));
  assert.ok(!host.classList.contains('motion-idle'), 'back navigation resumes visible motion');
  dispose();
  assert.ok(observer.disconnected);
});

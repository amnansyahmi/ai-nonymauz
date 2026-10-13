import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseHTML } from "linkedom";
// DOM interaction checks; these do not replace a real browser layout/WebGL check.
const { window } = parseHTML(
  await readFile(new URL("../dist/index.html", import.meta.url), "utf8"),
);
const { document } = window;
for (const id of ["people", "flow", "studio", "people"]) {
  const route = parseHTML(await readFile(new URL(`../dist/systems/${id}/index.html`, import.meta.url), "utf8"));
  const wrapper = document.createElement("section");
  wrapper.className = `test-${id}${document.querySelector(`.test-${id}`) ? "-second" : ""}`;
  wrapper.innerHTML = route.document.querySelector("[data-demo]").outerHTML;
  document.body.append(wrapper);
}

const previewObservers = [];
class FakeIntersectionObserver {
  constructor(callback) { this.callback = callback; previewObservers.push(this); }
  observe(target) { this.target = target; }
  disconnect() { this.disconnected = true; }
  emit(isIntersecting) { this.callback([{ target: this.target, isIntersecting }]); }
}
const previewVisibility = (value) => previewObservers.find((observer) => observer.target?.matches("[data-device-preview]")).emit(value);
const mediaQueries = new Map();
const mediaQuery = (query) => {
  if (!mediaQueries.has(query)) mediaQueries.set(query, { matches: false, listeners: [], addEventListener(_name, callback) { this.listeners.push(callback); } });
  return mediaQueries.get(query);
};
Object.assign(globalThis, {
  window,
  document,
  CustomEvent: window.CustomEvent,
  location: { href: "https://ai-nonymauz.my/", replace() {} },
  innerHeight: 900,
  innerWidth: 1440,
  requestAnimationFrame: () => 1,
  requestIdleCallback: () => 1,
  matchMedia: mediaQuery,
  IntersectionObserver: FakeIntersectionObserver,
});
window.requestIdleCallback = () => 1;
window.scrollY = 120;
window.scrollTo = ({ top }) => {
  window.scrollY = top;
};
window.HTMLElement.prototype.getBoundingClientRect = () => ({
  top: 400,
  bottom: 900,
  left: 0,
  right: 1000,
  width: 1000,
  height: 500,
});
window.HTMLElement.prototype.focus = function () {
  document._testFocus = this;
};
Object.defineProperty(window.HTMLElement.prototype, "elements", {
  get() {
    return Object.fromEntries(
      [...this.querySelectorAll("[name]")].map((el) => [
        el.getAttribute("name"),
        el,
      ]),
    );
  },
});
window.HTMLElement.prototype.reset = function () {
  this.querySelectorAll("input").forEach((input) => {
    input.value = "";
  });
};
for (const dialog of document.querySelectorAll("dialog")) {
  Object.defineProperty(dialog, "open", {
    get() {
      return this.hasAttribute("open");
    },
  });
  dialog.showModal = function () {
    this.setAttribute("open", "");
  };
  dialog.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new window.Event("close"));
  };
}
const click = (element) => {
  assert.ok(element, "click target exists");
  element.dispatchEvent(new window.Event("click", { bubbles: true }));
};
const submit = (form) =>
  form.dispatchEvent(
    new window.Event("submit", { bubbles: true, cancelable: true }),
  );
// Exercise the shipped bundle, including locally resolved Motion imports.
await import("../dist/app.js");

test("product experience interactions", async (t) => {
  await t.test("product approval updates only its own instance and reset restores it", () => {
    const first = document.querySelector(".test-people [data-demo]");
    const second = document.querySelector(".test-people-second [data-demo]");
    click(first.querySelector("[data-approve]"));
    assert.equal(first.querySelector("[data-pending-count]").textContent, "1");
    assert.equal(second.querySelector("[data-pending-count]").textContent, "2");
    click(first.querySelector("[data-reset]"));
    assert.equal(first.querySelector("[data-pending-count]").textContent, "2");
  });
  await t.test("landing page has one device presentation and no oversized gallery or hero demo", () => {
    assert.equal(document.querySelectorAll("[data-device-preview]").length, 1);
    assert.equal(document.querySelector(".hero-showcase"), null);
    assert.equal(document.querySelector(".real-captures-section"), null);
    assert.equal(document.querySelector("[data-capture-gallery]"), null);
    assert.ok(!document.body.textContent.includes("A LITTLE LOOK INSIDE"));
    assert.ok(document.querySelector(".mockup-laptop .device-desktop-capture"));
    assert.ok(document.querySelector(".mockup-phone .device-mobile-capture"));
  });
  await t.test("device arrows wrap and phone-only slide hides the laptop rather than inventing a screen", () => {
    const gallery = document.querySelector("[data-device-preview]");
    click(gallery.querySelector('[data-device-direction="-1"]'));
    assert.equal(gallery.querySelector(".device-stage").dataset.layout, "phone");
    assert.ok(gallery.querySelector(".mockup-laptop").hidden);
    assert.ok(gallery.querySelector(".device-mobile-capture").getAttribute("src").endsWith("people-mobile.webp"));
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "03 / 03");
    click(gallery.querySelector('[data-device-direction="1"]'));
    assert.equal(gallery.querySelector(".device-stage").dataset.layout, "both");
    assert.ok(!gallery.querySelector(".mockup-laptop").hidden);
    click(gallery.querySelector('[data-device-slide="1"]'));
    assert.equal(gallery.querySelector('[data-device-slide="1"]').getAttribute("aria-pressed"), "true");
    assert.ok(gallery.querySelector(".device-mobile-capture").getAttribute("src").endsWith("people-directory-mobile.webp"));
    click(gallery.querySelector('[data-device-slide="0"]'));
  });
  await t.test("slideshow autoplays on entering view, suspends offscreen and respects explicit pause", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const gallery = document.querySelector("[data-device-preview]");
    const play = gallery.querySelector("[data-device-play]");
    t.mock.timers.tick(10000);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "01 / 03");
    assert.equal(play.getAttribute("aria-pressed"), "false");
    previewVisibility(true);
    assert.equal(play.getAttribute("aria-pressed"), "true");
    assert.ok(play.textContent.includes("Pause slideshow"));
    assert.ok(gallery.classList.contains("is-playing"));
    assert.ok(gallery.querySelector(".device-progress > span"));
    t.mock.timers.tick(3999);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "01 / 03");
    t.mock.timers.tick(1);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "02 / 03");
    previewVisibility(false);
    assert.equal(play.getAttribute("aria-pressed"), "false");
    t.mock.timers.tick(13000);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "02 / 03");
    previewVisibility(true);
    assert.equal(play.getAttribute("aria-pressed"), "true");
    t.mock.timers.tick(4000);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "03 / 03");
    click(play);
    assert.equal(play.getAttribute("aria-pressed"), "false");
    previewVisibility(false); previewVisibility(true);
    assert.equal(play.getAttribute("aria-pressed"), "false");
    t.mock.timers.tick(13000);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "03 / 03");
    click(gallery.querySelector('[data-device-slide="0"]'));
  });
  await t.test("late toggle focus and moving the mouse over the mockup do not undo playback", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const gallery = document.querySelector("[data-device-preview]");
    const play = gallery.querySelector("[data-device-play]");
    click(play);
    play.dispatchEvent(new window.Event("focusin", { bubbles: true }));
    const enter = new window.Event("pointerenter");
    enter.pointerType = "mouse";
    gallery.querySelector(".device-stage").dispatchEvent(enter);
    assert.equal(play.getAttribute("aria-pressed"), "true");
    t.mock.timers.tick(4000);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "03 / 03");
    click(play);
    click(gallery.querySelector('[data-device-slide="0"]'));
  });
  await t.test("a secondary touch does not strand autoplay after the primary gesture ends", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const gallery = document.querySelector("[data-device-preview]");
    const play = gallery.querySelector("[data-device-play]");
    const stage = gallery.querySelector(".device-stage");
    const pointer = (name, id, primary) => {
      const event = new window.Event(name, { bubbles: true });
      Object.assign(event, { clientX: 200, clientY: 200, pointerId: id, pointerType: "touch", button: 0, isPrimary: primary });
      stage.dispatchEvent(event);
    };
    click(play);
    pointer("pointerdown", 1, true);
    assert.equal(play.getAttribute("aria-pressed"), "false");
    pointer("pointerdown", 2, false);
    pointer("pointerup", 2, false);
    pointer("pointerup", 1, true);
    assert.equal(play.getAttribute("aria-pressed"), "true");
    t.mock.timers.tick(4000);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "03 / 03");
    click(play);
    click(gallery.querySelector('[data-device-slide="0"]'));
  });
  await t.test("global pause, reduced motion and hidden tabs suspend and resume automatic playback", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const gallery = document.querySelector("[data-device-preview]");
    const play = gallery.querySelector("[data-device-play]");
    click(play);
    click(document.querySelector(".motion-toggle"));
    assert.ok(play.disabled);
    t.mock.timers.tick(7000);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "02 / 03");
    click(gallery.querySelector('[data-device-direction="1"]'));
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "03 / 03");
    click(document.querySelector(".motion-toggle"));
    assert.equal(play.getAttribute("aria-pressed"), "true");
    t.mock.timers.tick(4000);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "01 / 03");
    const reduce = mediaQuery("(prefers-reduced-motion: reduce)");
    const change = (matches) => { reduce.matches = matches; reduce.listeners.forEach((listener) => listener({ matches })); };
    change(true);
    assert.ok(play.disabled);
    assert.equal(play.getAttribute("aria-pressed"), "false");
    t.mock.timers.tick(7000);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "01 / 03");
    change(false);
    assert.equal(play.getAttribute("aria-pressed"), "true");
    Object.defineProperty(document, "hidden", { configurable: true, writable: true, value: true });
    document.dispatchEvent(new window.Event("visibilitychange"));
    assert.equal(play.getAttribute("aria-pressed"), "false");
    t.mock.timers.tick(7000);
    document.hidden = false;
    document.dispatchEvent(new window.Event("visibilitychange"));
    assert.equal(play.getAttribute("aria-pressed"), "true");
    t.mock.timers.tick(4000);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "02 / 03");
    click(play);
    document.hidden = true; document.dispatchEvent(new window.Event("visibilitychange"));
    document.hidden = false; document.dispatchEvent(new window.Event("visibilitychange"));
    change(true); change(false);
    assert.equal(play.getAttribute("aria-pressed"), "false", "explicit pause survives temporary suspension");
    click(gallery.querySelector('[data-device-slide="0"]'));
  });
  await t.test("focus and dialogs suspend autoplay; manual navigation resets the slide interval", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const gallery = document.querySelector("[data-device-preview]");
    const play = gallery.querySelector("[data-device-play]");
    click(play);
    const next = gallery.querySelector('[data-device-direction="1"]');
    document.dispatchEvent(new window.Event("keydown"));
    next.dispatchEvent(new window.Event("focusin", { bubbles: true }));
    assert.equal(play.getAttribute("aria-pressed"), "false");
    next.dispatchEvent(new window.Event("focusout", { bubbles: true }));
    assert.equal(play.getAttribute("aria-pressed"), "true");
    t.mock.timers.tick(3000);
    click(gallery.querySelector('[data-device-slide="1"]'));
    assert.equal(play.getAttribute("aria-pressed"), "true");
    t.mock.timers.tick(3999);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "02 / 03");
    t.mock.timers.tick(1);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "03 / 03");
    const key = new window.Event("keydown", { bubbles: true, cancelable: true });
    key.key = "ArrowRight"; next.dispatchEvent(key);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "01 / 03");
    click(document.querySelector("[data-open-finder]"));
    assert.equal(play.getAttribute("aria-pressed"), "false");
    t.mock.timers.tick(10000);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "01 / 03");
    click(document.querySelector("#finder-dialog .dialog-close"));
    assert.equal(play.getAttribute("aria-pressed"), "true");
    t.mock.timers.tick(4000);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "02 / 03");
    click(play);
    click(gallery.querySelector('[data-device-slide="0"]'));
  });
  await t.test("touch focus on arrows does not freeze the slideshow", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const gallery = document.querySelector("[data-device-preview]");
    const next = gallery.querySelector('[data-device-direction="1"]');
    const play = gallery.querySelector('[data-device-play]');
    click(play);
    next.dispatchEvent(new window.Event("pointerdown", { bubbles: true }));
    click(next);
    next.dispatchEvent(new window.Event("focusin", { bubbles: true }));
    assert.equal(play.getAttribute("aria-pressed"), "true");
    t.mock.timers.tick(4000);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "01 / 03");
    click(play);
    next.dispatchEvent(new window.Event("focusout", { bubbles: true }));
  });
  await t.test("releasing a gesture outside the stage resumes autoplay", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const gallery = document.querySelector("[data-device-preview]");
    const stage = gallery.querySelector('.device-stage');
    const play = gallery.querySelector('[data-device-play]');
    const pointer = (target, name, y) => {
      const event = new window.Event(name, { bubbles: true });
      Object.assign(event, { clientX: 100, clientY: y, pointerId: 9, pointerType: "touch", button: 0, isPrimary: true });
      target.dispatchEvent(event);
    };
    click(play);
    pointer(stage, "pointerdown", 200);
    assert.equal(play.getAttribute("aria-pressed"), "false");
    pointer(document.body, "pointerup", 10);
    assert.equal(play.getAttribute("aria-pressed"), "true");
    t.mock.timers.tick(4000);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "03 / 03");
    click(play);
    click(gallery.querySelector('[data-device-slide="0"]'));
  });
  await t.test("batched mobile visibility changes use the latest state", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const gallery = document.querySelector("[data-device-preview]");
    const play = gallery.querySelector('[data-device-play]');
    const observer = previewObservers.find((item) => item.target === gallery);
    click(play);
    observer.callback([{ target: gallery, isIntersecting: false }, { target: gallery, isIntersecting: true }]);
    assert.equal(play.getAttribute("aria-pressed"), "true");
    const counter = gallery.querySelector('[data-device-counter]');
    const before = counter.textContent;
    t.mock.timers.tick(4000);
    assert.notEqual(counter.textContent, before);
    observer.callback([{ target: gallery, isIntersecting: true }, { target: gallery, isIntersecting: false }]);
    assert.equal(play.getAttribute("aria-pressed"), "false");
    const offscreen = counter.textContent;
    t.mock.timers.tick(8000);
    assert.equal(counter.textContent, offscreen);
    previewVisibility(true);
    click(play);
    click(gallery.querySelector('[data-device-slide="0"]'));
  });
  await t.test("lost touch capture and cached back navigation recover autoplay", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const gallery = document.querySelector("[data-device-preview]");
    const stage = gallery.querySelector('.device-stage');
    const play = gallery.querySelector('[data-device-play]');
    click(play);
    const down = new window.Event("pointerdown", { bubbles: true });
    Object.assign(down, { pointerId: 7, clientX: 100, clientY: 100, button: 0 });
    stage.dispatchEvent(down);
    assert.equal(play.getAttribute("aria-pressed"), "false");
    const lost = new window.Event("lostpointercapture"); lost.pointerId = 7;
    stage.dispatchEvent(lost);
    assert.equal(play.getAttribute("aria-pressed"), "true");
    const hide = new window.Event("pagehide"); hide.persisted = true;
    window.dispatchEvent(hide);
    // A queued observer notification must not restart a suspended page.
    previewVisibility(true);
    assert.equal(play.getAttribute("aria-pressed"), "false");
    const before = gallery.querySelector('[data-device-counter]').textContent;
    t.mock.timers.tick(8000);
    assert.equal(gallery.querySelector('[data-device-counter]').textContent, before);
    const show = new window.Event("pageshow"); show.persisted = true;
    window.dispatchEvent(show);
    assert.equal(play.getAttribute("aria-pressed"), "true");
    t.mock.timers.tick(4000);
    assert.notEqual(gallery.querySelector('[data-device-counter]').textContent, before);
    click(play);
    click(gallery.querySelector('[data-device-slide="0"]'));
  });
  await t.test("horizontal device swipes advance but vertical and cancelled gestures do not", () => {
    const gallery = document.querySelector("[data-device-preview]");
    const stage = gallery.querySelector(".device-stage");
    const pointer = (name, x, y) => {
      const event = new window.Event(name, { bubbles: true });
      Object.assign(event, { clientX: x, clientY: y, pointerId: 1, pointerType: "touch", button: 0, isPrimary: true });
      stage.dispatchEvent(event);
    };
    pointer("pointerdown", 200, 200); pointer("pointerup", 80, 205);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "02 / 03");
    pointer("pointerdown", 200, 200); pointer("pointerup", 190, 80);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "02 / 03");
    pointer("pointerdown", 200, 200); pointer("pointercancel", 200, 200); pointer("pointerup", 80, 205);
    assert.equal(gallery.querySelector("[data-device-counter]").textContent, "02 / 03");
    click(gallery.querySelector('[data-device-slide="0"]'));
  });
  await t.test(
    "expense form updates balance, escapes text, and handles over-budget state",
    () => {
      const app = document.querySelector(".test-flow [data-demo]");
      const form = app.querySelector("form");
      form.elements.expenseName.value = "<img src=x>";
      form.elements.expenseAmount.value = "2000.50";
      submit(form);
      assert.equal(
        app
          .querySelector("[data-expense-total]")
          .textContent.replace(/\s/g, " "),
        "RM 5,200.50",
      );
      assert.equal(
        app.querySelector("[data-balance-label]").textContent,
        "Over budget",
      );
      assert.equal(
        app.querySelector("[data-balance]").textContent.replace(/\s/g, " "),
        "RM 200.50",
      );
      assert.equal(app.querySelectorAll(".expense-list img").length, 0);
      assert.ok(
        app.querySelector(".expense-list").textContent.includes("<img src=x>"),
      );
      assert.equal(
        app.querySelector(".spending-meter").getAttribute("aria-valuenow"),
        "100",
      );
      form.elements.expenseName.value = "Bad amount";
      form.elements.expenseAmount.value = "-3";
      submit(form);
      assert.ok(
        form.querySelector(".form-error").textContent.includes("between"),
      );
      click(app.querySelector("[data-reset]"));
      assert.equal(app.querySelector("[data-balance]").textContent, "RM 1,800");
    },
  );
  await t.test(
    "tasks move across the board with counts and final state updated",
    () => {
      const app = document.querySelector(".test-studio [data-demo]");
      const task = app.querySelector('[data-task="brief"]');
      click(task.querySelector("button"));
      assert.equal(task.parentElement.dataset.stage, "1");
      assert.equal(
        app.querySelector('[data-stage="1"] [data-task-count]').textContent,
        "2",
      );
      click(task.querySelector("button"));
      assert.equal(task.parentElement.dataset.stage, "2");
      assert.ok(task.querySelector("button").disabled);
      assert.ok(app.querySelector(".empty-stage").hidden);
      click(app.querySelector("[data-reset]"));
      assert.equal(
        app.querySelector('[data-task="brief"]').parentElement.dataset.stage,
        "0",
      );
    },
  );
  await t.test(
    "finder covers all eleven recommendations and restores scroll on close",
    () => {
      const goals = {
        work: ["people", "studio", "power", "marketplace"],
        life: ["wedding", "flow"],
        tools: ["cloud", "secure", "potong"],
        games: ["openworld", "tiny-tots"],
      };
      for (const [area, ids] of Object.entries(goals))
        for (const id of ids) {
          click(document.querySelector("[data-open-finder]"));
          assert.ok(document.querySelector("#finder-dialog").open);
          click(document.querySelector(`[data-area="${area}"]`));
          click(document.querySelector(`[data-goal="${id}"]`));
          assert.equal(
            document
              .querySelector(".finder-result-actions a")
              .getAttribute("href"),
            `/systems/${id}/`,
          );
          click(document.querySelector('[data-finder-back="goal"]'));
          assert.ok(document.querySelector(`[data-goal="${id}"]`));
          click(document.querySelector("#finder-dialog .dialog-close"));
          assert.equal(document.body.style.position, "");
          assert.equal(window.scrollY, 120);
        }
    },
  );
  await t.test(
    "catalogue filters and mobile menu expose correct states",
    () => {
      click(document.querySelector('[data-filter="life"]'));
      assert.equal(
        [...document.querySelectorAll("[data-category]")].filter(
          (x) => !x.hidden,
        ).length,
        2,
      );
      assert.equal(
        document.querySelector("#filter-status").textContent,
        "Showing 2 systems.",
      );
      click(document.querySelector('[data-filter="all"]'));
      assert.equal(
        [...document.querySelectorAll("[data-category]")].filter(
          (x) => !x.hidden,
        ).length,
        11,
      );
      click(document.querySelector(".menu-button"));
      assert.equal(
        document.querySelector(".menu-button").getAttribute("aria-expanded"),
        "true",
      );
      click(document.querySelector("#mobile-nav a"));
      assert.ok(document.querySelector("#mobile-nav").hidden);
    },
  );
  await t.test("pause control stops the shared motion state", () => {
    click(document.querySelector(".motion-toggle"));
    assert.ok(document.documentElement.classList.contains("motion-paused"));
    assert.equal(
      document.querySelector(".motion-toggle").getAttribute("aria-pressed"),
      "true",
    );
    click(document.querySelector(".motion-toggle"));
    assert.ok(!document.documentElement.classList.contains("motion-paused"));
  });
});

test("brief validates whitespace and downloads all entered details", async (t) => {
  let downloaded;
  t.mock.method(URL, "createObjectURL", (blob) => {
    downloaded = blob;
    return "blob:example";
  });
  t.mock.method(globalThis, "setTimeout", () => 0);
  const originalFormData = globalThis.FormData;
  globalThis.FormData = class {
    constructor(form) {
      this.form = form;
    }
    get(name) {
      return this.form.elements[name].value;
    }
  };
  try {
    click(document.querySelector("[data-open-brief]"));
    const form = document.querySelector("#brief-form");
    form.elements.goal.value = " ";
    form.elements.team.value = "HR";
    submit(form);
    assert.ok(
      form.querySelector(".form-error").textContent.includes("problem"),
    );
    form.elements.goal.value = "Organise leave approvals";
    form.elements.team.value = "25 employees";
    form.elements.budget.value = "RM 5,000";
    submit(form);
    assert.ok(downloaded instanceof Blob);
    const contents = await downloaded.text();
    assert.ok(contents.includes("Organise leave approvals"));
    assert.ok(contents.includes("25 employees"));
    assert.ok(contents.includes("RM 5,000"));
    assert.ok(contents.includes("has not been submitted"));
    assert.ok(
      document.querySelector("#brief-result").textContent.includes("ready"),
    );
    click(document.querySelector("#brief-dialog .dialog-close"));
  } finally {
    globalThis.FormData = originalFormData;
  }
});

test("additional product demos respond and reset", async () => {
  const { demoShell } = await import("../lib/demo-views.js");
  const { initialiseDemos } = await import("../lib/demos.js");
  const root = document.createElement("div");
  root.innerHTML = ["wedding", "power", "cloud", "secure"]
    .map((id) => demoShell(id))
    .join("");
  document.body.append(root);
  initialiseDemos(root);
  const wedding = root.querySelector('[data-demo="wedding"]');
  const check = wedding.querySelectorAll("input")[1];
  check.checked = true;
  check.setAttribute("checked", "");
  check.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert.equal(
    wedding.querySelector(".checklist-progress").textContent,
    "2 of 3 steps complete",
  );
  const power = root.querySelector('[data-demo="power"]');
  click(power.querySelector('[data-operation="2"]'));
  assert.equal(
    power.querySelector(".operation-panel .overline").textContent,
    "FINANCE",
  );
  const cloud = root.querySelector('[data-demo="cloud"]');
  click(cloud.querySelector('[data-prompt="plan"]'));
  assert.ok(
    cloud
      .querySelector(".sample-response")
      .textContent.includes("first useful milestone"),
  );
  const secure = root.querySelector('[data-demo="secure"]');
  click(secure.querySelector("[data-security]"));
  assert.equal(secure.querySelector(".security-steps").hidden, false);
  for (const app of root.querySelectorAll("[data-demo]")) {
    click(app.querySelector("[data-reset]"));
    assert.equal(
      app.querySelector(".demo-feedback").textContent,
      "Demo reset.",
    );
  }
  root.remove();
});

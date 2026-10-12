import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseHTML } from "linkedom";
// DOM interaction checks; these do not replace a real browser layout/WebGL check.
const { window } = parseHTML(
  await readFile(new URL("../dist/index.html", import.meta.url), "utf8"),
);
const { document } = window;
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
  await t.test(
    "approval updates only its own demo and reset restores it",
    () => {
      const hero = document.querySelector("#hero-preview [data-demo]");
      const separate = document.querySelector(".story-people [data-demo]");
      click(hero.querySelector("[data-approve]"));
      assert.equal(hero.querySelector("[data-pending-count]").textContent, "1");
      assert.equal(
        separate.querySelector("[data-pending-count]").textContent,
        "2",
      );
      assert.ok(
        hero.querySelector(".demo-feedback").textContent.includes("approved"),
      );
      click(hero.querySelector("[data-reset]"));
      assert.equal(hero.querySelector("[data-pending-count]").textContent, "2");
    },
  );
  await t.test("switching previews preserves in-progress demo state", () => {
    click(document.querySelector("#hero-preview [data-approve]"));
    click(document.querySelector('[data-preview="flow"]'));
    assert.equal(
      document.querySelector("[data-preview-link]").getAttribute("href"),
      "/systems/flow/",
    );
    click(document.querySelector('[data-preview="people"]'));
    assert.equal(
      document.querySelector("#hero-preview [data-pending-count]").textContent,
      "1",
    );
  });
  await t.test("workflow mode preserves interactive state and supports direct steps", () => {
    const hero = document.querySelector("#hero-preview [data-demo]");
    const pending = hero.querySelector("[data-pending-count]").textContent;
    click(document.querySelector('[data-showcase-mode="tour"]'));
    assert.ok(document.querySelector("#hero-preview").hidden);
    assert.ok(!document.querySelector("#walkthrough-view").hidden);
    click(document.querySelector('[data-tour-step="2"]'));
    assert.ok(document.querySelector("#tour-frame").textContent.includes("Approved"));
    assert.ok(document.querySelector("#tour-frame").textContent.includes("16 days"));
    assert.ok(document.querySelector('[data-tour-direction="1"]').disabled);
    assert.equal(document.querySelector('[data-tour-step="2"]').getAttribute("aria-current"), "step");
    click(document.querySelector('[data-showcase-mode="try"]'));
    assert.ok(!document.querySelector("#hero-preview").hidden);
    assert.equal(document.querySelector("#hero-preview [data-pending-count]").textContent, pending);
  });
  await t.test("walkthrough playback advances once and stops at the final step", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    click(document.querySelector('[data-showcase-mode="tour"]'));
    click(document.querySelector("[data-tour-play]"));
    assert.equal(document.querySelector("[data-tour-play]").getAttribute("aria-pressed"), "true");
    t.mock.timers.tick(2800);
    assert.equal(document.querySelector('[data-tour-step="1"]').getAttribute("aria-current"), "step");
    t.mock.timers.tick(2800);
    assert.equal(document.querySelector('[data-tour-step="2"]').getAttribute("aria-current"), "step");
    assert.equal(document.querySelector("[data-tour-play]").getAttribute("aria-pressed"), "false");
    t.mock.timers.tick(10000);
    assert.equal(document.querySelector('[data-tour-step="2"]').getAttribute("aria-current"), "step");
    click(document.querySelector('[data-showcase-mode="try"]'));
  });
  await t.test("changing products cancels playback and keeps each workflow independent", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    click(document.querySelector('[data-showcase-mode="tour"]'));
    click(document.querySelector("[data-tour-play]"));
    click(document.querySelector('[data-preview="flow"]'));
    assert.equal(document.querySelector("[data-tour-play]").getAttribute("aria-pressed"), "false");
    t.mock.timers.tick(10000);
    assert.equal(document.querySelector('[data-tour-step="0"]').getAttribute("aria-current"), "step");
    click(document.querySelector('[data-tour-step="2"]'));
    assert.ok(document.querySelector("#tour-frame").textContent.includes("RM 1,680"));
    click(document.querySelector('[data-preview="kretiv"]'));
    click(document.querySelector('[data-tour-step="2"]'));
    assert.ok(document.querySelector("#tour-frame").textContent.includes("For review"));
    click(document.querySelector('[data-preview="people"]'));
    assert.equal(document.querySelector('[data-tour-step="0"]').getAttribute("aria-current"), "step");
    click(document.querySelector('[data-showcase-mode="try"]'));
  });
  await t.test("motion pause and dialogs cancel playback; manual steps remain usable", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    click(document.querySelector('[data-showcase-mode="tour"]'));
    click(document.querySelector("[data-tour-play]"));
    click(document.querySelector(".motion-toggle"));
    assert.ok(document.querySelector("[data-tour-play]").disabled);
    assert.ok(!document.querySelector("[data-playback-note]").hidden);
    t.mock.timers.tick(6000);
    assert.equal(document.querySelector('[data-tour-step="0"]').getAttribute("aria-current"), "step");
    click(document.querySelector('[data-tour-step="1"]'));
    assert.equal(document.querySelector('[data-tour-step="1"]').getAttribute("aria-current"), "step");
    click(document.querySelector(".motion-toggle"));
    assert.ok(!document.querySelector("[data-tour-play]").disabled);
    click(document.querySelector("[data-tour-play]"));
    click(document.querySelector("[data-open-finder]"));
    assert.equal(document.querySelector("[data-tour-play]").getAttribute("aria-pressed"), "false");
    click(document.querySelector("#finder-dialog .dialog-close"));
    t.mock.timers.tick(6000);
    assert.equal(document.querySelector('[data-tour-step="0"]').getAttribute("aria-current"), "step");
    click(document.querySelector('[data-showcase-mode="try"]'));
  });
  await t.test("reduced motion and hidden tabs cancel playback without restarting it", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const reduce = mediaQuery("(prefers-reduced-motion: reduce)");
    const change = (matches) => { reduce.matches = matches; reduce.listeners.forEach((listener) => listener({ matches })); };
    click(document.querySelector('[data-showcase-mode="tour"]'));
    click(document.querySelector("[data-tour-play]"));
    change(true);
    assert.ok(document.querySelector("[data-tour-play]").disabled);
    t.mock.timers.tick(6000);
    assert.equal(document.querySelector('[data-tour-step="0"]').getAttribute("aria-current"), "step");
    click(document.querySelector('[data-tour-step="2"]'));
    assert.equal(document.querySelector('[data-tour-step="2"]').getAttribute("aria-current"), "step");
    change(false);
    click(document.querySelector("[data-tour-play]"));
    Object.defineProperty(document, "hidden", { configurable: true, writable: true, value: true });
    document.dispatchEvent(new window.Event("visibilitychange"));
    assert.equal(document.querySelector("[data-tour-play]").getAttribute("aria-pressed"), "false");
    document.hidden = false;
    document.dispatchEvent(new window.Event("visibilitychange"));
    t.mock.timers.tick(6000);
    assert.equal(document.querySelector('[data-tour-step="0"]').getAttribute("aria-current"), "step");
    click(document.querySelector('[data-showcase-mode="try"]'));
  });
  await t.test("horizontal surface swipes switch systems without stealing form or vertical gestures", () => {
    const surface = document.querySelector(".hero-workbench");
    const pointer = (target, name, x, y) => {
      const event = new window.Event(name, { bubbles: true });
      Object.assign(event, { clientX: x, clientY: y, pointerId: 1, pointerType: "touch", button: 0, isPrimary: true });
      target.dispatchEvent(event);
    };
    pointer(surface, "pointerdown", 200, 200);
    pointer(surface, "pointerup", 80, 210);
    assert.equal(document.querySelector('[data-preview="kretiv"]').getAttribute("aria-pressed"), "true");
    pointer(surface, "pointerdown", 200, 200);
    pointer(surface, "pointerup", 190, 80);
    assert.equal(document.querySelector('[data-preview="kretiv"]').getAttribute("aria-pressed"), "true");
    click(document.querySelector('[data-preview="flow"]'));
    const input = document.querySelector("#hero-preview input");
    pointer(input, "pointerdown", 200, 200);
    pointer(input, "pointerup", 80, 210);
    assert.equal(document.querySelector('[data-preview="flow"]').getAttribute("aria-pressed"), "true");
    click(document.querySelector('[data-showcase-direction="1"]'));
    assert.equal(document.querySelector('[data-preview="people"]').getAttribute("aria-pressed"), "true");
  });
  await t.test("capture switches update full-size image and restore preferred device after phone-only screen", () => {
    const gallery = document.querySelector("[data-capture-gallery]");
    click(gallery.querySelector('[data-capture-device="mobile"]'));
    assert.ok(gallery.querySelector("img").getAttribute("src").includes("overview-mobile"));
    click(gallery.querySelector('[data-capture-scene="directory"]'));
    assert.ok(gallery.querySelector("img").getAttribute("src").includes("directory-mobile"));
    assert.equal(gallery.querySelector(".capture-enlarge").dataset.image, gallery.querySelector("img").getAttribute("src"));
    click(gallery.querySelector('[data-capture-device="desktop"]'));
    click(gallery.querySelector('[data-capture-scene="leave"]'));
    assert.ok(gallery.querySelector('[data-capture-device="desktop"]').disabled);
    assert.equal(gallery.querySelector(".capture-stage").dataset.device, "mobile");
    click(gallery.querySelector('[data-capture-scene="directory"]'));
    assert.equal(gallery.querySelector(".capture-stage").dataset.device, "desktop");
    click(gallery.querySelector(".capture-enlarge"));
    const dialog = document.querySelector("#image-dialog");
    assert.ok(dialog.open);
    assert.equal(dialog.querySelector("img").getAttribute("src"), "/assets/products/people-desktop.webp");
    click(dialog.querySelector(".dialog-close"));
    assert.equal(document._testFocus, gallery.querySelector(".capture-enlarge"));
  });
  await t.test(
    "expense form updates balance, escapes text, and handles over-budget state",
    () => {
      const app = document.querySelector(".story-flow [data-demo]");
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
      const app = document.querySelector(".story-kretiv [data-demo]");
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
    "finder covers all seven recommendations and restores scroll on close",
    () => {
      const goals = {
        work: ["people", "kretiv", "power"],
        life: ["restu", "flow"],
        tools: ["cloud", "secure"],
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
        7,
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
  root.innerHTML = ["restu", "power", "cloud", "secure"]
    .map((id) => demoShell(id))
    .join("");
  document.body.append(root);
  initialiseDemos(root);
  const restu = root.querySelector('[data-demo="restu"]');
  const check = restu.querySelectorAll("input")[1];
  check.checked = true;
  check.setAttribute("checked", "");
  check.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert.equal(
    restu.querySelector(".checklist-progress").textContent,
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

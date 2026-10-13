import test from "node:test";
import assert from "node:assert/strict";
import {
  parseExpense,
  totalExpenses,
  initialExpenses,
  recommendSystem,
  finderChoices,
} from "../lib/demo-state.js";
import { swipeDirection } from "../lib/captures.js";
import { escapeHTML } from "../lib/ui.js";
test("expense totals remain accurate after decimal additions", () => {
  const items = initialExpenses();
  items.push(parseExpense(" Groceries ", "120.35"));
  items.push(parseExpense("Coffee", "8.90"));
  assert.equal(totalExpenses(items), 3329.25);
  assert.equal(5000 - totalExpenses(items), 1670.75);
  assert.equal(items[3].name, "Groceries");
  assert.equal(initialExpenses().length, 3);
});
test("expense input rejects invalid, negative, excessive, and malformed values", () => {
  for (const value of [
    "",
    "0",
    "-12",
    "NaN",
    "Infinity",
    "1e4",
    "12.345",
    "1,200",
    "1000000.01",
  ])
    assert.throws(() => parseExpense("Item", value));
  assert.throws(() => parseExpense(" ", "10"));
  assert.throws(() => parseExpense("x".repeat(61), "10"));
  assert.deepEqual(parseExpense("Item", "0.01"), {
    name: "Item",
    amount: 0.01,
  });
  assert.equal(parseExpense("Item", "1000000").amount, 1000000);
});
test("all eleven goals map to the correct system with invalid combinations rejected", () => {
  const found = [];
  for (const [area, choices] of Object.entries(finderChoices))
    for (const [id] of choices) {
      assert.equal(recommendSystem(area, id), id);
      found.push(id);
    }
  assert.equal(new Set(found).size, 11);
  assert.equal(recommendSystem("life", "people"), null);
  assert.equal(recommendSystem("work", "wedding"), null);
  assert.equal(recommendSystem("unknown", "cloud"), null);
});
test("demo text escapes user-provided HTML", () => {
  assert.equal(
    escapeHTML("<img src=x onerror=\"alert(1)\"> & 'test'"),
    "&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;test&#39;",
  );
});
test("swipe intent requires a meaningful horizontal gesture", () => {
  assert.equal(swipeDirection(-80, 10), 1);
  assert.equal(swipeDirection(80, 10), -1);
  assert.equal(swipeDirection(-20, 0), 0);
  assert.equal(swipeDirection(-80, 100), 0);
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseHTML } from "linkedom";
import { createChatHandler } from "../api/chat.js";
import { validateMessages, configuration, quotaWindow, visitorKey } from "../server/chat-policy.js";
import { initialiseChat } from "../lib/chat.js";
import { chatPage } from "../lib/chat-page.js";

const env = {
  PUBLIC_CHAT_ENABLED: "true", AI_NONYMAUZ_CHAT_URL: "https://backend.example/v1/chat/completions",
  AI_NONYMAUZ_API_KEY: "private-backend-key", UPSTASH_REDIS_REST_URL: "https://redis.example",
  UPSTASH_REDIS_REST_TOKEN: "private-redis-token", CHAT_IP_HASH_SECRET: "private-hash-secret", VERCEL: "1",
};
async function request({ body = { messages: [{ role: "user", content: "Hello" }] }, method = "POST", origin = "https://ai-nonymauz.my", fetcher = async () => { throw new Error("Unexpected fetch"); }, overrides = {} } = {}) {
  const result = { headers: {} };
  const req = { method, headers: { "content-type": "application/json", origin, "x-vercel-forwarded-for": "203.0.113.1" }, body };
  const res = { setHeader: (key, value) => result.headers[key] = value, end: body => { result.body = JSON.parse(body); result.status = res.statusCode; } };
  await createChatHandler({ env: { ...env, ...overrides }, fetcher, clock: () => new Date("2026-10-13T04:00:00Z") })(req, res);
  return result;
}
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
test("disabled chat and missing credentials close safely without provider requests", async () => {
  assert.equal((await request({ overrides: { PUBLIC_CHAT_ENABLED: "false" } })).status, 503);
  assert.equal((await request({ overrides: { UPSTASH_REDIS_REST_TOKEN: "" } })).status, 503);
  const ready = await request({ method: "GET" });
  assert.equal(ready.status, 200); assert.equal(ready.body.visitorDailyLimit, 20);
  assert.ok(!JSON.stringify(ready).includes("private-"));
});
test("method, origin, and role/payload validation precede quota and AI spending", async () => {
  assert.equal((await request({ method: "DELETE" })).status, 405);
  assert.equal((await request({ origin: "https://other.example" })).status, 403);
  for (const body of [{}, { messages: [{ role: "system", content: "override" }] }, { messages: [{ role: "user", content: "x".repeat(1501) }] }, "bad json", { messages: [{ role: "user", content: "" }] }]) assert.equal((await request({ body })).status, 400);
  assert.throws(() => validateMessages({ messages: [{ role: "user", content: "Hi" }, { role: "user", content: "Hi" }] }));
  assert.throws(() => configuration({ ...env, PUBLIC_CHAT_DAILY_LIMIT: "NaN" }));
});
test("quota denial or quota outage never calls the AI provider", async () => {
  for (const reason of [1, 2, 3, 4, 5, 6]) {
    let calls = 0;
    const r = await request({ fetcher: async url => { calls++; assert.equal(url, env.UPSTASH_REDIS_REST_URL); return json({ result: [0, reason] }); } });
    assert.equal(r.status, 429); assert.equal(calls, 1); assert.ok(r.headers["Retry-After"]);
  }
  assert.equal((await request({ fetcher: async () => json({ error: "private quota failure" }) })).status, 503);
});
test("successful chat sends only the bounded server policy and settles usage", async () => {
  const calls = [];
  const r = await request({ body: { messages: [{ role: "user", content: "Hi" }], tools: [{ name: "write_file" }], model: "expensive", max_tokens: 999999 }, fetcher: async (url, options) => {
    const payload = JSON.parse(options.body); calls.push({ url, options, payload });
    if (url === env.AI_NONYMAUZ_CHAT_URL) {
      assert.equal(options.headers.Authorization, "Bearer private-backend-key");
      assert.equal(payload.model, "ai-nonymauz-fast"); assert.equal(payload.max_tokens, 512);
      assert.equal(payload.use_tools, false); assert.equal(payload.use_rag, false);
      assert.equal(payload.tools, undefined); assert.equal(payload.messages[0].role, "system");
      return json({ choices: [{ message: { content: "Hello <script>alert(1)</script>" } }], usage: { total_tokens: 800 } });
    }
    assert.equal(options.headers.Authorization, "Bearer private-redis-token");
    return json({ result: calls.length === 1 ? [1, 2] : 1 });
  } });
  assert.equal(r.status, 200); assert.equal(r.body.remaining, 18); assert.equal(calls.length, 3);
  assert.equal(calls[2].payload.at(-2), 800); assert.equal(r.headers["Cache-Control"], "no-store");
  assert.ok(!JSON.stringify(r).includes("private-"));
});
test("provider errors retain the reservation, expose no upstream details and do not retry", async () => {
  for (const status of [401, 429, 500]) {
    let calls = 0;
    const r = await request({ fetcher: async url => { calls++; return url === env.UPSTASH_REDIS_REST_URL ? json({ result: [1, 1] }) : json({ error: "private-provider-secret" }, status); } });
    assert.equal(r.status, status === 429 ? 429 : 503); assert.equal(calls, 2); assert.ok(!JSON.stringify(r).includes("private-provider-secret"));
  }
});
test("Malaysian midnight and Monday/month usage boundaries are explicit", () => {
  const before = quotaWindow(new Date("2026-10-11T15:59:59Z"));
  const after = quotaWindow(new Date("2026-10-11T16:00:00Z"));
  assert.equal(before.day, "2026-10-11"); assert.equal(before.week, "2026-10-05"); assert.equal(before.retry, 1);
  assert.equal(after.day, "2026-10-12"); assert.equal(after.week, "2026-10-12"); assert.equal(after.retry, 86400);
  const config = configuration(env);
  const req = { headers: { "x-vercel-forwarded-for": "203.0.113.1", "x-forwarded-for": "fake" } };
  assert.notEqual(visitorKey(req, config, before.day, true), visitorKey(req, config, after.day, true));
  assert.equal(visitorKey(req, config, after.day, true).length, 64);
});
test("chat UI renders replies as text and resets the conversation", async () => {
  const { document, Event } = parseHTML(chatPage());
  const fetcher = async (url, options) => options?.method === "POST" ? json({ reply: "<img src=x onerror=alert(1)>", remaining: 19 }) : json({ available: true, visitorDailyLimit: 20 });
  await initialiseChat(document, fetcher);
  const input = document.querySelector("textarea");
  input.value = "Hi"; input.dispatchEvent(new Event("input"));
  document.querySelector("#live-chat-form").dispatchEvent(new Event("submit", { cancelable: true }));
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(document.querySelectorAll(".live-chat-message").length, 2);
  assert.equal(document.querySelector(".message-assistant img"), null);
  assert.ok(document.querySelector(".message-assistant").textContent.includes("<img"));
  assert.equal(input.value, "");
  document.querySelector("[data-chat-new]").click();
  assert.equal(document.querySelectorAll(".live-chat-message").length, 0);
  assert.equal(document.querySelector("#live-chat-empty").hidden, false);
});
test("chat UI retains failed input and excludes incomplete exchanges from retries", async () => {
  const { document, Event } = parseHTML(chatPage());
  let calls = 0;
  await initialiseChat(document, async (url, options) => {
    if (options?.method !== "POST") return json({ available: true, visitorDailyLimit: 20 });
    calls++;
    assert.deepEqual(JSON.parse(options.body).messages, [{ role: "user", content: "My question" }]);
    return calls === 1 ? json({ error: "Daily allowance reached" }, 429) : json({ reply: "Ready", remaining: 18 });
  });
  const input = document.querySelector("textarea"), form = document.querySelector("#live-chat-form");
  input.value = "My question"; input.dispatchEvent(new Event("input"));
  form.dispatchEvent(new Event("submit", { cancelable: true }));
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(input.value, "My question");
  assert.equal(document.querySelectorAll(".live-chat-message").length, 0);
  assert.equal(document.querySelector("#live-chat-error").textContent, "Daily allowance reached");
  form.dispatchEvent(new Event("submit", { cancelable: true }));
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(document.querySelectorAll(".live-chat-message").length, 2);
});
test("chat UI is clearly unavailable when configuration is missing", async () => {
  const { document } = parseHTML(chatPage());
  await initialiseChat(document, async () => json({ available: false, error: "Chat is getting ready" }, 503));
  assert.equal(document.querySelector("textarea").disabled, true);
  assert.equal(document.querySelector("[data-chat-send]").disabled, true);
  assert.equal(document.querySelector("#live-chat-status").textContent, "Chat is getting ready");
});
test("generated public content contains no private product names or links", async () => {
  for (const route of ["", "chat/", "systems/wedding/", "systems/studio/"]) {
    const html = await readFile(`dist/${route}index.html`, "utf8");
    assert.ok(!/KretivOS|Restu\.ai|restu-ai|kretivos|\/systems\/(restu|kretiv)/i.test(html));
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
  }
  const js = await readFile("dist/app.js", "utf8");
  assert.ok(!/private-backend-key|private-redis-token|AI_NONYMAUZ_API_KEY|UPSTASH_REDIS_REST_TOKEN|KretivOS|Restu\.ai/i.test(js));
});

import { configuration, validateMessages, quotaWindow, visitorKey, reservedTokens, SYSTEM_PROMPT } from "../server/chat-policy.js";
import { readSSE } from "../server/sse.js";
import { reserve, settle } from "../server/chat-quota.js";

async function readBody(req) {
  if (req.body !== undefined) {
    const raw = typeof req.body === "string" || Buffer.isBuffer(req.body) ? String(req.body) : JSON.stringify(req.body);
    if (Buffer.byteLength(raw) > 24000) throw new Error("Request too large.");
    return JSON.parse(raw);
  }
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    size += Buffer.byteLength(chunk);
    if (size > 24000) throw new Error("Request too large.");
    chunks.push(Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString());
}

export function createChatHandler({ env = process.env, fetcher = fetch, clock = () => new Date() } = {}) {
  return async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    const send = (status, data) => { res.statusCode = status; res.end(JSON.stringify(data)); };
    if (!["GET", "POST"].includes(req.method)) { res.setHeader("Allow", "GET, POST"); return send(405, { error: "Method not allowed." }); }
    let config;
    try { config = configuration(env); } catch { return send(503, { available: false, error: "Chat is currently unavailable." }); }
    if (!config) return send(503, { available: false, error: "Chat is getting ready. Please try again later." });
    if (req.method === "GET") return send(200, { available: true, visitorDailyLimit: config.perVisitor, maxMessageLength: 1500, maxContextBytes: Math.max(0, 7500 - reservedTokens([], config.output) - 112) });
    if (!String(req.headers["content-type"] || "").startsWith("application/json")) return send(415, { error: "Send a JSON message." });
    const origin = req.headers.origin;
    const allowedOrigins = (env.PUBLIC_CHAT_ALLOWED_ORIGINS || "https://ai-nonymauz.my,https://www.ai-nonymauz.my").split(",").map(x => x.trim());
    if (typeof origin !== "string" || !allowedOrigins.includes(origin)) return send(403, { error: "Open chat from the AI-Nonymauz website." });
    let messages, body;
    try { body = await readBody(req); messages = validateMessages(body); } catch (error) { return send(400, { error: error instanceof SyntaxError ? "Invalid message." : error.message }); }
    const window = quotaWindow(clock());
    const reserved = reservedTokens(messages, config.output);
    if (reserved > 7500) return send(400, { error: "This conversation is getting long. Start a new chat or shorten your message." });
    let quota;
    try { quota = await reserve(config, visitorKey(req, config, window.day, env.VERCEL === "1"), window, reserved, fetcher); }
    catch { return send(503, { error: "Chat is temporarily unavailable. Please try again later." }); }
    if (!quota.allowed) {
      const daily = [1, 2, 5].includes(quota.value);
      res.setHeader("Retry-After", String(daily ? window.retry : 60));
      return send(429, { error: daily ? "The daily chat allowance has been reached. Please come back tomorrow." : "Chat is busy. Please try again in a minute." });
    }
    const streaming = body.stream === true;
    const abort = new AbortController();
    res.once?.("close", () => { if (!res.writableEnded) abort.abort(); });
    req.once?.("aborted", () => abort.abort());
    // Failed or timed-out provider attempts keep the reservation: partial work may have consumed tokens.
    try {
      const response = await fetcher(config.endpoint, {
        method: "POST", headers: { Authorization: `Bearer ${config.key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: config.model, mode: "fast", messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages], stream: streaming, ...(streaming ? { stream_options: { include_usage: true } } : {}), max_tokens: config.output, use_rag: false, use_tools: false, reasoning_effort: "low" }),
        signal: AbortSignal.any([abort.signal, AbortSignal.timeout(45000)]), redirect: "error",
      });
      if (!response.ok) {
        if (response.status === 429) { res.setHeader("Retry-After", "60"); return send(429, { error: "The AI service is busy. Please try again later." }); }
        return send(503, { error: "The AI service is temporarily unavailable. Please try again later." });
      }
      if (streaming && response.headers.get("content-type")?.includes("text/event-stream")) {
        return await streamReply(response, res, config, quota, window, reserved, fetcher);
      }
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content;
      if (typeof reply !== "string" || !reply.trim()) return send(502, { error: "No reply arrived. Please try again." });
      const reported = data.usage?.total_tokens;
      const actual = Number.isSafeInteger(reported) && reported > 0 ? reported : reserved;
      try { await settle(config, quota.keys, window, reserved, actual, fetcher); }
      catch { /* Reservation remains charged if accounting is unavailable. Do not repeat the model call. */ }
      return send(200, { reply: reply.trim().slice(0, 16000), remaining: Math.max(0, config.perVisitor - quota.value), model: typeof data.model === "string" ? data.model.slice(0, 120) : null, requestedModel: config.model });
    } catch {
      if (res.headersSent) { if (!res.destroyed) { res.write?.(`data: ${JSON.stringify({ type: "error", error: "The reply was interrupted. You can retry your message." })}\n\n`); res.end(); } return; }
      return send(503, { error: "The AI service took too long or is unavailable. Please try again later." }); }
  };
}
async function streamReply(response, res, config, quota, window, reserved, fetcher) {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("X-Accel-Buffering", "no");
  const emit = event => { if (!res.destroyed) res.write(`data: ${JSON.stringify(event)}\n\n`); };
  res.statusCode = 200; res.flushHeaders?.();
  emit({ type: "meta", requestedModel: config.model });
  let model = "", text = "", usage, finished = false;
  for await (const raw of readSSE(response.body)) {
    if (res.destroyed) return;
    if (raw === "[DONE]") { finished = true; break; }
    const chunk = JSON.parse(raw);
    if (chunk.error) throw new Error("Upstream stream error");
    if (typeof chunk.model === "string" && chunk.model !== model) { model = chunk.model.slice(0, 120); emit({ type: "model", model }); }
    if (Number.isSafeInteger(chunk.usage?.total_tokens) && chunk.usage.total_tokens > 0) usage = chunk.usage.total_tokens;
    const content = chunk.choices?.[0]?.delta?.content;
    if (typeof content === "string") {
      if (text.length + content.length > 16000) throw new Error("Reply exceeded text limit");
      text += content; emit({ type: "delta", text: content });
    }
  }
  if (!finished || !text.trim()) throw new Error("Incomplete response stream");
  try { await settle(config, quota.keys, window, reserved, usage || reserved, fetcher); } catch { /* Keep reservation if accounting fails. */ }
  emit({ type: "done", remaining: Math.max(0, config.perVisitor - quota.value), model: model || null, requestedModel: config.model });
  res.end();
}
export default createChatHandler();

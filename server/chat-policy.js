import { createHmac } from "node:crypto";
import { products } from "../products.js";

export const SYSTEM_PROMPT = `You are AI-Nonymauz, a helpful public assistant. Reply in the user's language; use Malaysian Malay for Malay questions. Keep answers concise and honest. You have no access to accounts, files, live web search, or private product details. Do not claim to perform actions or invent product features. Use only the public catalog when describing our products. Some projects use descriptive public names; do not guess or disclose alternative internal product names. Public catalog: ${products.map(p => `${p.name}: ${p.description} ${p.note}`).join("\n")}`;

export function configuration(env = process.env) {
  const limit = (name, fallback, max) => {
    const n = Number(env[name] ?? fallback);
    if (!Number.isInteger(n) || n < 1 || n > max) throw new Error("Invalid chat configuration");
    return n;
  };
  const endpoint = env.AI_NONYMAUZ_CHAT_URL;
  const redis = env.UPSTASH_REDIS_REST_URL;
  if (env.PUBLIC_CHAT_ENABLED !== "true" || !endpoint || !redis || !env.AI_NONYMAUZ_API_KEY || !env.UPSTASH_REDIS_REST_TOKEN || !env.CHAT_IP_HASH_SECRET) return null;
  for (const value of [endpoint, redis]) {
    const u = new URL(value);
    if (u.protocol !== "https:" || u.username || u.password || u.search || u.hash) throw new Error("Invalid chat endpoint");
  }
  return {
    endpoint, redis, key: env.AI_NONYMAUZ_API_KEY, redisToken: env.UPSTASH_REDIS_REST_TOKEN,
    hashSecret: env.CHAT_IP_HASH_SECRET, model: env.PUBLIC_CHAT_MODEL || "ai-nonymauz-fast",
    daily: limit("PUBLIC_CHAT_DAILY_LIMIT", 1000, 100000),
    tokens: limit("PUBLIC_CHAT_DAILY_TOKEN_BUDGET", 100000, 100000000),
    perVisitor: limit("PUBLIC_CHAT_VISITOR_DAILY_LIMIT", 20, 1000),
    output: limit("PUBLIC_CHAT_MAX_OUTPUT_TOKENS", 512, 1024),
  };
}

export function validateMessages(body) {
  if (!body || !Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > 7) throw new Error("Send a message with up to three earlier exchanges.");
  const messages = body.messages.map((m, i) => {
    if (!m || m.role !== (i % 2 === 0 ? "user" : "assistant") || typeof m.content !== "string" || !m.content.trim() || m.content.length > 4000) throw new Error("Invalid conversation. Start a new chat or shorten your message.");
    return { role: m.role, content: m.content.trim() };
  });
  if (messages.at(-1).role !== "user" || messages.at(-1).content.length > 1500 || messages.reduce((n, m) => n + Buffer.byteLength(m.content), 0) > 6000) throw new Error("Shorten your message or start a new chat.");
  return messages;
}

export function quotaWindow(now = new Date()) {
  // Fixed UTC+8 calendar boundaries, independent of the function's timezone.
  const local = new Date(now.getTime() + 8 * 3600000);
  const day = local.toISOString().slice(0, 10);
  const month = day.slice(0, 7);
  const monday = new Date(local);
  monday.setUTCDate(local.getUTCDate() - (local.getUTCDay() + 6) % 7);
  const reset = Date.parse(`${day}T00:00:00+08:00`) + 86400000;
  return { day, month, week: monday.toISOString().slice(0, 10), minute: Math.floor(now.getTime() / 60000), retry: Math.max(1, Math.ceil((reset - now.getTime()) / 1000)) };
}

export function visitorKey(req, config, day, vercel = process.env.VERCEL === "1") {
  // Only Vercel's overwritten proxy header is trusted in production. No browser ID bypass.
  const ip = vercel ? req.headers["x-vercel-forwarded-for"] : req.socket?.remoteAddress;
  if (typeof ip !== "string" || !ip.trim()) throw new Error("Missing trusted visitor address");
  return createHmac("sha256", config.hashSecret).update(`${day}:${ip.split(",")[0].trim()}`).digest("hex");
}

export function reservedTokens(messages, output) {
  // Conservative byte bound plus backend system-prompt headroom; not a tokenizer.
  return messages.reduce((n, m) => n + Buffer.byteLength(m.content) + 16, 0) + Buffer.byteLength(SYSTEM_PROMPT) + 2000 + output;
}

// All checks and reservations happen in one atomic Redis script across instances.
export const RESERVE = `
for i=1,6 do
  local value = tonumber(redis.call('GET', KEYS[i]) or '0')
  local increment = i > 4 and tonumber(ARGV[7]) or 1
  if value + increment > tonumber(ARGV[i]) then return {0,i} end
end
for i=1,6 do
  local increment = i > 4 and tonumber(ARGV[7]) or 1
  redis.call('INCRBY', KEYS[i], increment)
  redis.call('EXPIRE', KEYS[i], (i == 3 or i == 4 or i == 6) and 120 or 172800)
end
return {1, tonumber(redis.call('GET', KEYS[2]))}
`;
export const SETTLE = `
local delta = tonumber(ARGV[1]) - tonumber(ARGV[2])
for i=1,2 do
  if redis.call('EXISTS', KEYS[i]) == 1 then redis.call('INCRBY', KEYS[i], delta) end
end
for i=3,5 do
  redis.call('HINCRBY', KEYS[i], 'replies', 1)
  redis.call('HINCRBY', KEYS[i], 'tokens', ARGV[1])
  redis.call('EXPIRE', KEYS[i], 3456000)
end
return 1
`;
export async function redisCommand(config, command, fetcher = fetch) {
  const response = await fetcher(config.redis, {
    method: "POST", headers: { Authorization: `Bearer ${config.redisToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(command), signal: AbortSignal.timeout(5000), redirect: "error",
  });
  if (!response.ok) throw new Error("Quota service unavailable");
  const data = await response.json();
  if (data.error || data.result === undefined) throw new Error("Quota service unavailable");
  return data.result;
}
export async function reserve(config, visitor, window, tokens, fetcher) {
  const prefix = "public-chat:v1";
  const keys = [`${prefix}:day:${window.day}`, `${prefix}:visitor:${visitor}`, `${prefix}:visitor-minute:${visitor}:${window.minute}`, `${prefix}:minute:${window.minute}`, `${prefix}:tokens:${window.day}`, `${prefix}:minute-tokens:${window.minute}`];
  const result = await redisCommand(config, ["EVAL", RESERVE, 6, ...keys, config.daily, config.perVisitor, 3, 10, config.tokens, 7500, tokens], fetcher);
  if (!Array.isArray(result) || result.length !== 2 || ![0, 1].includes(Number(result[0]))) throw new Error("Invalid quota response");
  return { allowed: Number(result[0]) === 1, value: Number(result[1]), keys };
}
export async function settle(config, keys, window, reserved, actual, fetcher) {
  const usageKeys = [window.day, `week:${window.week}`, `month:${window.month}`].map(x => `public-chat:v1:usage:${x}`);
  await redisCommand(config, ["EVAL", SETTLE, 5, keys[4], keys[5], ...usageKeys, actual, reserved], fetcher);
}

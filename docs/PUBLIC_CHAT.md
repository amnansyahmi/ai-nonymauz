# Public chat setup and capacity

The chat page at `/chat/` calls the same-origin Node function `/api/chat`. The function validates a bounded conversation, reserves quota atomically in Redis, calls the existing backend’s `/v1/chat/completions`, and returns a text reply. Credentials never enter the static build. No new AI SDK or frontend framework is needed for this text-only API integration.

## Enable on Vercel

Set these environment variables on the **ai-nonymauz landing-page project**, using separate Redis databases for preview and production:

| Variable | Value |
| --- | --- |
| `AI_NONYMAUZ_CHAT_URL` | The real backend HTTPS URL ending in `/v1/chat/completions` |
| `AI_NONYMAUZ_API_KEY` | The backend bearer credential (currently `LITELLM_MASTER_KEY`) |
| `UPSTASH_REDIS_REST_URL` | Durable Upstash Redis HTTPS REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Redis write token |
| `CHAT_IP_HASH_SECRET` | A random server-only secret, e.g. `openssl rand -hex 32` |
| `PUBLIC_CHAT_ALLOWED_ORIGINS` | Comma-separated exact allowed origins; production defaults to the apex and www domains |
| `PUBLIC_CHAT_ENABLED` | `true` after the settings above are ready |

Redeploy after setting variables. Missing settings or unavailable quota storage close chat safely; there is no in-memory fallback that resets on cold starts. GET `/api/chat` checks configuration readiness only; a successful real chat is needed to prove Redis and provider credentials work. Production settings could not be inspected or installed during implementation: Vercel denied access to the project scope.

For local development use `node --env-file=.env.local scripts/serve.mjs dist` after building, and explicitly include `http://localhost:4173` in allowed origins. The static development server also runs the real handler. A preview needs its own exact origin added to its environment; it must not share production counters.

## Default controls

| Control | Default |
| --- | --- |
| Site-wide admitted messages/day | 1,000 ceiling |
| Site-wide daily token accounting budget | 100,000 |
| Per visitor IP/day | 20 messages |
| Per visitor IP/minute | 3 messages |
| Site-wide messages/minute | 10 |
| Site-wide reserved tokens/minute | 7,500 |
| Output tokens/request | 512 |
| Latest user message | 1,500 characters |
| Conversation submitted | Up to 3 earlier exchanges; bounded text only |
| Calendar reset | Midnight Asia/Kuala_Lumpur |

The request ceiling and token budget are independent: whichever limit is reached first stops further admissions. The token budget can be changed with `PUBLIC_CHAT_DAILY_TOKEN_BUDGET`; the ceiling is `PUBLIC_CHAT_DAILY_LIMIT`.

Reservations use a conservative UTF-8 byte bound plus backend prompt headroom and the output cap. Successful responses settle against reported `usage.total_tokens` (including reasoning when reported). Missing usage or failed/aborted upstream work retains the reservation because it may have consumed tokens. If settlement fails, do not retry the provider. Token accounting is an application budget, not a measurement of all backend/provider calls: optional verifier passes, fallbacks, other apps and provider-specific accounting can consume more. Provider rate limits remain authoritative. Disable costly verifier passes in a dedicated public-chat backend if hard isolation is needed.

Daily counters persist across deployments. Only keyed, daily-rotating IP hashes are stored, with no message text. Shared networks share a visitor allowance; IP limits do not identify people or prevent distributed abuse. Add the host's bot/rate controls if traffic warrants it. The UI retains conversation text in memory only. Text is sent to the backend and configured providers; their logging/retention settings are separate.

Aggregated successful reply/token counts are recorded in Redis hashes:

- `public-chat:v1:usage:YYYY-MM-DD`
- `public-chat:v1:usage:week:YYYY-MM-DD` (Monday start)
- `public-chat:v1:usage:month:YYYY-MM`

Fields: `replies`, `tokens`; retained for 40 days. These exclude failed attempts and are not complete provider invoices. Read them in the private Redis console; no public admin endpoint exposes usage or credentials.

## Capacity assessment — 13 October 2026

Current backend `main` selects `ai-nonymauz-fast`, mapped to Groq `openai/gpt-oss-20b`. Code also includes `gpt-oss-120b`, Gemini and optional providers/fallbacks. A configured model is not proof that its credentials or feature flag are active in production. The repository's `rpm: 28` is a routing setting, not an entitlement or a daily token quota. The public chat pins the fast alias, disables RAG/tools, and limits output; backend fallback and verifier policy still apply.

[Groq's official rate-limit table](https://console.groq.com/docs/rate-limits) lists for **each** GPT-OSS model on the free tier: 30 RPM, 1,000 RPD, 8,000 TPM, 200,000 TPD. Actual limits are shown in the account dashboard. Creating additional aliases for the same model does not create independent provider quota.

Illustrative sustainable volume from **one 200K-token daily allowance**, assuming it is unused elsewhere and traffic is spread out:

| Average total tokens per reply | Replies/day | Replies/7 days | Replies/30 days |
| --- | ---: | ---: | ---: |
| 500 | 400 | 2,800 | 12,000 |
| 1,000 | 200 | 1,400 | 6,000 |
| 2,000 | 100 | 700 | 3,000 |

Weekly/monthly figures are arithmetic projections of daily limits, not separate guaranteed quotas. History and system prompts count again on every turn; reasoning, optional verification and fallback attempts may add consumption. Copilot, HRMS, other products and the viewer share any common provider account. A 1,000-reply day at 1K–2K tokens/reply needs approximately **1–2 million tokens/day**, **7–14 million/week**, **30–60 million/30 days**.

[Gemini](https://ai.google.dev/gemini-api/docs/rate-limits) applies limits per project, not key, and publishes active model/tier limits through AI Studio. RPD resets on Pacific midnight, not this site's Malaysian midnight. Do not add guessed Gemini capacity to Groq's numbers. [OpenRouter](https://openrouter.ai/docs/api-reference/limits) also has account-level free-model limits; the current fast fallback chain does not automatically include its vision-free alias.

Start with a 100K website budget and measure replies/latency/provider usage for a week. The 1,000-message ceiling is an adjustable admission control, not a promise of 1,000 available replies. Increase only after checking the real provider dashboards and the remaining allowance consumed by existing clients. Exact production capacity was not measurable with the available access.

## Verification

`npm run check`, `npm run build`, `npm test`. The test suite exercises input rejection, origin checks, credential isolation, quota denial/failure, provider failure, response accounting, and UI rendering with a stubbed upstream. Live Redis/provider smoke testing remains required after configuring the project.

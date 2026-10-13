export function initialiseChat(root = document, fetcher = fetch) {
  const form = root.querySelector("#live-chat-form");
  if (!form) return;
  const input = form.querySelector("textarea");
  const send = form.querySelector("[data-chat-send]");
  const stop = form.querySelector("[data-chat-stop]");
  const log = root.querySelector("#live-chat-log");
  const status = root.querySelector("#live-chat-status");
  const error = root.querySelector("#live-chat-error");
  const empty = root.querySelector("#live-chat-empty");
  const fresh = root.querySelector("[data-chat-new]");
  let history = [], ready = false, busy = false, controller;
  const controls = () => {
    send.disabled = !ready || busy || !input.value.trim();
    input.disabled = !ready || busy;
    stop.hidden = !busy;
    fresh.disabled = busy;
    log.setAttribute("aria-busy", String(busy));
  };
  function append(role, content) {
    const article = root.createElement("article");
    article.className = `live-chat-message message-${role}`;
    const label = root.createElement("span"); label.className = "chat-message-label";
    label.textContent = role === "user" ? "You" : "AI-Nonymauz";
    const text = root.createElement("div"); text.className = "chat-message-text";
    text.textContent = content; // Provider text is never interpreted as HTML.
    article.append(label, text); log.append(article); empty.hidden = true;
    article.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
    return article;
  }
  input.addEventListener("input", controls);
  input.addEventListener("keydown", event => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && !event.isComposing) { event.preventDefault(); form.requestSubmit(); }
  });
  root.querySelectorAll("[data-chat-suggestion]").forEach(button => button.addEventListener("click", () => {
    if (!ready || busy) return;
    input.value = button.textContent.trim(); controls(); input.focus();
  }));
  fresh.addEventListener("click", () => {
    if (busy) return;
    history = []; log.replaceChildren(); empty.hidden = false; input.value = ""; error.textContent = ""; controls(); input.focus();
  });
  stop.addEventListener("click", () => controller?.abort());
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const content = input.value.trim();
    if (!ready || busy || !content) return;
    if (content.length > 1500) { error.textContent = "Keep your message under 1,500 characters."; return; }
    error.textContent = ""; busy = true; controls();
    const sent = append("user", content);
    controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 65000);
    status.textContent = "Thinking…";
    try {
      // Preserve full replies on screen; resend only a bounded recent context.
      const pairs = history.slice(-6).map(m => ({ ...m, content: m.content.slice(0, 1000) }));
      while (pairs.length && new TextEncoder().encode(pairs.map(m => m.content).join("") + content).length > 3000) pairs.splice(0, 2);
      const response = await fetcher("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [...pairs, { role: "user", content }] }), signal: controller.signal });
      const data = await response.json();
      if (!response.ok || typeof data.reply !== "string") throw new Error(data.error || "Chat is temporarily unavailable.");
      append("assistant", data.reply);
      history.push({ role: "user", content }, { role: "assistant", content: data.reply });
      input.value = "";
      status.textContent = `${data.remaining} messages left in your daily allowance.`;
    } catch (failure) {
      sent.remove(); empty.hidden = log.children.length > 0;
      error.textContent = failure.name === "AbortError" ? "Reply stopped. Your message is ready to retry; it may still count toward today’s allowance." : failure.message;
      status.textContent = "Send a message when you’re ready.";
    } finally {
      clearTimeout(timer); busy = false; controls(); input.focus({ preventScroll: true });
    }
  });
  controls();
  return fetcher("/api/chat", { headers: { Accept: "application/json" } }).then(async response => {
    const data = await response.json();
    ready = response.ok && data.available === true;
    status.textContent = ready ? `Up to ${data.visitorDailyLimit} messages per visitor each day. Shared daily fair use applies.` : (data.error || "Chat is getting ready. Please try again later.");
    controls();
  }).catch(() => { status.textContent = "Chat is temporarily unavailable. Please try again later."; controls(); });
}

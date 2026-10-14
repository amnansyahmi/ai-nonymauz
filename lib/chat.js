import { renderMarkdown, copyText } from './markdown.js';
import { readSSE } from '../server/sse.js';
import { products, productPath } from '../products.js';

export function initialiseChat(root = document, fetcher = fetch) {
  const form = root.querySelector('#live-chat-form');
  if (!form) return;
  const input = form.querySelector('textarea'), send = form.querySelector('[data-chat-send]'), stop = form.querySelector('[data-chat-stop]');
  const log = root.querySelector('#live-chat-log'), status = root.querySelector('#live-chat-status'), error = root.querySelector('#live-chat-error');
  const empty = root.querySelector('#live-chat-empty'), fresh = root.querySelector('[data-chat-new]'), retry = root.querySelector('[data-chat-retry]');
  let history = [], ready = false, busy = false, controller, lastPrompt = '', lastPair = [], completeLast = false, contextBudget = 1400;
  const controls = () => {
    send.disabled = !ready || busy || !input.value.trim(); input.disabled = !ready || busy;
    stop.hidden = !busy; fresh.disabled = busy; if (retry) { retry.hidden = !lastPrompt; retry.disabled = !ready || busy; }
    // Streaming output is announced once at completion, not once per token.
    log.setAttribute('aria-busy', String(busy));
  };
  function append(role, content = '') {
    const article = root.createElement('article'); article.className = `live-chat-message message-${role}`;
    const label = root.createElement('span'); label.className = 'chat-message-label'; label.textContent = role === 'user' ? 'You' : 'AI-Nonymauz';
    const text = root.createElement('div'); text.className = 'chat-message-text';
    role === 'assistant' ? renderMarkdown(text, content, root) : text.textContent = content;
    article.append(label, text); log.append(article); empty.hidden = true;
    article.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
    return { article, text, label };
  }
  input.addEventListener('input', controls);
  input.addEventListener('keydown', event => { if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.isComposing) { event.preventDefault(); form.requestSubmit(); } });
  root.querySelectorAll('[data-chat-suggestion]').forEach(button => button.addEventListener('click', () => {
    if (!ready || busy) return; input.value = button.dataset.chatPrompt || button.textContent.trim(); controls(); input.focus();
  }));
  fresh.addEventListener('click', () => {
    if (busy) return; history = []; lastPrompt = ''; lastPair = []; completeLast = false;
    log.replaceChildren(); empty.hidden = false; input.value = ''; error.textContent = ''; controls(); input.focus();
  });
  stop.addEventListener('click', () => controller?.abort());
  retry?.addEventListener('click', () => {
    if (!ready || busy || !lastPrompt) return;
    if (completeLast) history.splice(-2);
    lastPair.forEach(el => el.remove()); input.value = lastPrompt; controls(); form.requestSubmit();
  });
  function replyActions(reply, element) {
    const actions = root.createElement('div'); actions.className = 'chat-reply-actions';
    const copy = root.createElement('button'); copy.type = 'button'; copy.textContent = 'Copy reply'; copy.addEventListener('click', () => copyText(reply, copy));
    const brief = root.createElement('button'); brief.type = 'button'; brief.textContent = 'Use in project brief';
    brief.addEventListener('click', () => { const goal = root.querySelector('#brief-form [name="goal"]'); if (goal) goal.value = reply.slice(0, 2000); root.dispatchEvent(new (root.defaultView?.CustomEvent || CustomEvent)('chat-brief', { detail: brief })); });
    actions.append(copy, brief); element.article.append(actions);
  }
  form.addEventListener('submit', async event => {
    event.preventDefault(); const content = input.value.trim(); if (!ready || busy || !content) return;
    if (new TextEncoder().encode(content).length > contextBudget) { error.textContent = 'Shorten your message to leave room for the AI context.'; return; }
    if (content.length > 1500) { error.textContent = 'Keep your message under 1,500 characters.'; return; }
    error.textContent = ''; busy = true; lastPrompt = content; completeLast = false; controls();
    const sent = append('user', content), answer = append('assistant'); lastPair = [sent.article, answer.article];
    let reply = '', model = '', done = false, remaining;
    controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 65000); status.textContent = 'Thinking…';
    try {
      const pairs = history.slice(-6).map(m => ({ ...m, content: m.content.slice(0, 500) }));
      while (pairs.length && new TextEncoder().encode(pairs.map(m => m.content).join('') + content).length > contextBudget) pairs.splice(0, 2);
      const response = await fetcher('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [...pairs, { role: 'user', content }], stream: true }), signal: controller.signal });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || 'Chat is temporarily unavailable.'); }
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        for await (const raw of readSSE(response.body)) {
          const chunk = JSON.parse(raw);
          if (chunk.type === 'error') throw new Error(chunk.error || 'The reply was interrupted.');
          if (typeof chunk.model === 'string') { model = chunk.model; answer.label.textContent = `AI-Nonymauz · ${model}`; }
          if (chunk.type === 'delta' && typeof chunk.text === 'string') { if (reply.length + chunk.text.length > 16000) throw new Error('Reply too long.'); reply += chunk.text; renderMarkdown(answer.text, reply, root); if (status.textContent !== 'Writing your reply…') status.textContent = 'Writing your reply…'; }
          if (chunk.type === 'done') { done = true; remaining = chunk.remaining; }
        }
      } else {
        const data = await response.json(); if (typeof data.reply !== 'string') throw new Error('No reply arrived.');
        reply = data.reply; model = data.model || ''; remaining = data.remaining; done = true; renderMarkdown(answer.text, reply, root);
        if (model) answer.label.textContent = `AI-Nonymauz · ${model}`;
      }
      if (!done || !reply.trim()) throw new Error('The reply was interrupted. Retry when you’re ready.');
      history.push({ role: 'user', content }, { role: 'assistant', content: reply }); completeLast = true; input.value = '';
      replyActions(reply, answer); status.textContent = `${remaining} messages left in your daily allowance.`;
    } catch (failure) {
      if (!reply) { sent.article.remove(); answer.article.remove(); lastPair = []; empty.hidden = log.children.length > 0; }
      else { answer.label.textContent += ' · Interrupted'; replyActions(reply, answer); }
      error.textContent = failure.name === 'AbortError' ? 'Reply stopped. Retry may count as another message.' : failure.message;
      status.textContent = 'Your message is ready to retry.';
    } finally { clearTimeout(timer); busy = false; controls(); input.focus({ preventScroll: true }); }
  });
  const compare = root.querySelector('#catalog-compare');
  compare?.addEventListener('submit', event => {
    event.preventDefault(); if (busy) return;
    const a = products.find(p => p.id === compare.querySelector('[name="first"]').value), b = products.find(p => p.id === compare.querySelector('[name="second"]').value);
    if (!a || !b || a.id === b.id) { root.querySelector('#compare-error').textContent = 'Choose two different systems.'; return; }
    root.querySelector('#compare-error').textContent = '';
    const content = `### ${a.name} and ${b.name}\n\n| | ${a.name} | ${b.name} |\n|---|---|---|\n| Focus | ${a.categoryLabel} | ${b.categoryLabel} |\n| Availability | ${a.availability.label} | ${b.availability.label} |\n| Features | ${a.features.join('; ')} | ${b.features.join('; ')} |\n\n[Explore ${a.name}](${productPath(a.id)}) · [Explore ${b.name}](${productPath(b.id)})\n\nThis comparison uses the public catalog and does not consume a chat message.`;
    const answer = append('assistant', content); answer.label.textContent = 'Public catalog comparison'; replyActions(content, answer);
  });
  controls();
  return fetcher('/api/chat', { headers: { Accept: 'application/json' } }).then(async response => {
    const data = await response.json(); ready = response.ok && data.available === true; if (Number.isInteger(data.maxContextBytes)) contextBudget = Math.max(1, data.maxContextBytes);
    status.textContent = ready ? `Up to ${data.visitorDailyLimit} messages per visitor each day. Shared daily fair use applies.` : (data.error || 'Chat is getting ready. Catalog tools are available below.'); controls();
  }).catch(() => { status.textContent = 'Chat is temporarily unavailable. You can still explore the catalog tools.'; controls(); });
}

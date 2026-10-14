import { marked } from 'marked';

// Render Markdown tokens into native nodes. AI text never passes through innerHTML.
export function renderMarkdown(container, text, doc = container.ownerDocument) {
  const make = (tag, content) => { const el = doc.createElement(tag); if (content !== undefined) el.textContent = content; return el; };
  const children = (parent, tokens, depth = 0) => {
    if (depth > 24) { parent.append(doc.createTextNode('[Content nesting limit]')); return; }
    for (const token of tokens || []) {
      let el;
      switch (token.type) {
        case 'space': case 'def': continue;
        case 'heading': el = make(`h${Math.min(6, Math.max(3, token.depth + 2))}`); break;
        case 'paragraph': el = make('p'); break;
        case 'strong': el = make('strong'); break;
        case 'em': el = make('em'); break;
        case 'del': el = make('del'); break;
        case 'blockquote': el = make('blockquote'); break;
        case 'hr': parent.append(make('hr')); continue;
        case 'br': parent.append(make('br')); continue;
        case 'codespan': parent.append(make('code', token.text)); continue;
        case 'code': {
          const block = make('div'); block.className = 'chat-code-block';
          const bar = make('div'); bar.className = 'chat-code-bar'; bar.append(make('span', token.lang || 'Code'));
          const copy = make('button', 'Copy code'); copy.type = 'button';
          copy.addEventListener('click', () => copyText(token.text, copy)); bar.append(copy);
          const pre = make('pre'); pre.append(make('code', token.text)); block.append(bar, pre); parent.append(block); continue;
        }
        case 'list':
          el = make(token.ordered ? 'ol' : 'ul');
          if (token.ordered && Number.isInteger(token.start)) el.setAttribute('start', String(token.start));
          for (const item of token.items) { const li = make('li'); if (item.task) li.append(doc.createTextNode(item.checked ? '[x] ' : '[ ] ')); children(li, item.tokens, depth + 1); el.append(li); }
          parent.append(el); continue;
        case 'table': {
          const wrap = make('div'); wrap.className = 'chat-table-scroll'; wrap.tabIndex = 0; wrap.setAttribute('aria-label', 'Scrollable table');
          const table = make('table'), head = make('thead'), tr = make('tr'), body = make('tbody');
          for (const cell of token.header) { const th = make('th'); th.scope = 'col'; children(th, cell.tokens, depth + 1); tr.append(th); }
          head.append(tr);
          for (const row of token.rows) { const tr = make('tr'); for (const cell of row) { const td = make('td'); children(td, cell.tokens, depth + 1); tr.append(td); } body.append(tr); }
          table.append(head, body); wrap.append(table); parent.append(wrap); continue;
        }
        case 'link': {
          el = make('span');
          try { const url = new URL(token.href, 'https://ai-nonymauz.my'); if (['https:', 'http:', 'mailto:'].includes(url.protocol)) { el = make('a'); el.href = url.href; el.rel = 'noopener noreferrer'; el.target = '_blank'; } } catch { /* Unsafe URLs stay plain text. */ }
          break;
        }
        case 'text': if (token.tokens) { children(parent, token.tokens, depth + 1); continue; } parent.append(doc.createTextNode(token.text)); continue;
        case 'image': parent.append(doc.createTextNode(token.text || '[Image]')); continue;
        default: parent.append(doc.createTextNode(token.text || token.raw || '')); continue;
      }
      children(el, token.tokens || marked.Lexer.lexInline(token.text || ''), depth + 1); parent.append(el);
    }
  };
  container.replaceChildren();
  children(container, marked.lexer(String(text).slice(0, 16000), { gfm: true }));
}
export async function copyText(text, button) {
  const clipboard = button.ownerDocument.defaultView?.navigator?.clipboard || globalThis.navigator?.clipboard;
  try { if (!clipboard?.writeText) throw new Error('Clipboard unavailable'); await clipboard.writeText(text); button.textContent = 'Copied'; }
  catch { button.textContent = 'Select text to copy'; }
}

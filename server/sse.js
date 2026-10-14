// Incremental SSE decoding for both upstream OpenAI chunks and the browser stream.
export async function* readSSE(body) {
  if (!body) throw new Error('Missing response stream');
  const reader = body.getReader(), decoder = new TextDecoder();
  let buffer = '', lines = [], complete = false, frameSize = 0;
  const event = () => { const data = lines.filter(x => x.startsWith('data:')).map(x => x.slice(5).replace(/^ /, '')).join('\n'); lines = []; frameSize = 0; return data; };
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      if (buffer.length > 128000) throw new Error('Stream frame too large');
      let end;
      while ((end = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, end).replace(/\r$/, ''); buffer = buffer.slice(end + 1);
        if (line) { frameSize += line.length; if (frameSize > 128000) throw new Error('Stream frame too large'); lines.push(line); } else { const data = event(); if (data) yield data; }
      }
      if (done) {
        if (buffer) lines.push(buffer.replace(/\r$/, ''));
        const data = event(); if (data) yield data;
        complete = true; break;
      }
    }
  } finally {
    if (!complete) await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

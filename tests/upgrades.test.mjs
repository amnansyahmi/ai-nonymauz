import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { parseHTML } from 'linkedom';
import { createChatHandler } from '../api/chat.js';
import { readSSE } from '../server/sse.js';
import { renderMarkdown } from '../lib/markdown.js';
import { initialiseChat } from '../lib/chat.js';
import { chatPage } from '../lib/chat-page.js';
import { walkthroughShowcase, initialiseWalkthroughs } from '../lib/walkthroughs.js';
import { readFile, stat } from 'node:fs/promises';

const env = { PUBLIC_CHAT_ENABLED:'true', AI_NONYMAUZ_CHAT_URL:'https://backend.example/v1/chat/completions', AI_NONYMAUZ_API_KEY:'secret', UPSTASH_REDIS_REST_URL:'https://redis.example', UPSTASH_REDIS_REST_TOKEN:'redis-secret', CHAT_IP_HASH_SECRET:'hash-secret', VERCEL:'1' };
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
const json = data => new Response(JSON.stringify(data), {headers:{'Content-Type':'application/json'}});
function bytesStream(text, step=13) {
 const bytes=new TextEncoder().encode(text); let offset=0;
 return new ReadableStream({pull(controller){ if(offset===bytes.length){controller.close();return;}controller.enqueue(bytes.slice(offset,offset+step));offset=Math.min(bytes.length,offset+step); }});
}
async function invokeStream(upstream) {
 const req=Object.assign(new EventEmitter(),{method:'POST', headers:{'content-type':'application/json',origin:'https://ai-nonymauz.my','x-vercel-forwarded-for':'203.0.113.8'},body:{messages:[{role:'user',content:'Hi'}],stream:true}});
 const res=Object.assign(new EventEmitter(),{headers:{}, chunks:[],setHeader(k,v){this.headers[k]=v},flushHeaders(){this.headersSent=true},write(text){this.chunks.push(text)},end(text){if(text)this.chunks.push(text);this.writableEnded=true}});
 const calls=[];
 const fetcher=async(url,opts)=>{ const payload=JSON.parse(opts.body);calls.push({url,payload}); if(url===env.AI_NONYMAUZ_CHAT_URL){assert.equal(payload.stream,true);assert.equal(payload.stream_options.include_usage,true);return new Response(bytesStream(upstream),{headers:{'Content-Type':'text/event-stream'}});}return json({result:calls.length===1?[1,1]:1});};
 await createChatHandler({env,fetcher})(req,res);
 return {res,calls,events:res.chunks.join('').split('\n\n').filter(Boolean).map(line=>JSON.parse(line.slice(6)))};
}
test('SSE decoder handles byte splits, UTF-8, CRLF, multiline data and trailing events',async()=>{
 const actual=[];for await(const data of readSSE(bytesStream(': comment\r\ndata: hai ü\r\ndata: next\r\n\r\ndata: final',1)))actual.push(data);
 assert.deepEqual(actual,['hai ü\nnext','final']);
});
test('streamed chat reports backend model, retains text chunks and settles terminal usage',async()=>{
 const upstream='data: '+JSON.stringify({model:'openai/gpt-oss-20b',choices:[{delta:{content:'Hai '}}]})+'\n\ndata: '+JSON.stringify({model:'openai/gpt-oss-20b',choices:[{delta:{content:'awak'}}]})+'\n\ndata: '+JSON.stringify({usage:{total_tokens:750},choices:[]})+'\n\ndata: [DONE]\n\n';
 const {res,calls,events}=await invokeStream(upstream);
 assert.equal(res.headers['Content-Type'],'text/event-stream; charset=utf-8');
 assert.equal(events.filter(x=>x.type==='delta').map(x=>x.text).join(''),'Hai awak');
 assert.equal(events.find(x=>x.type==='model').model,'openai/gpt-oss-20b');
 assert.equal(events.at(-1).type,'done');assert.equal(events.at(-1).remaining,19);assert.equal(calls.length,3);assert.equal(calls.at(-1).payload.at(-2),750);
});
test('truncated streams and provider error chunks do not claim success or refund tokens',async()=>{
 for(const tail of ['', 'data: {"error":{"message":"private upstream details"}}\n\n']){
  const {events,calls}=await invokeStream('data: {"choices":[{"delta":{"content":"Partial"}}]}\n\n'+tail);
  assert.equal(events.at(-1).type,'error');assert.equal(calls.length,2);assert.ok(!JSON.stringify(events).includes('private upstream details'));assert.ok(!events.some(x=>x.type==='done'));
 }
});
test('Markdown formats tables and code while HTML, images and dangerous URLs stay inert',()=>{
 const {document}=parseHTML('<div id="text"></div>'),el=document.querySelector('#text');
 renderMarkdown(el,'### Example\n\n**Useful**\n\n| A | B |\n|---|---|\n| x | y |\n\n```js\n<script>alert(1)</script>\n```\n\n<img src=x onerror=alert(1)>\n\n[bad](javascript:alert(1)) ![picture](https://evil.example/a.png) [good](https://example.com)',document);
 assert.ok(el.querySelector('table'));assert.ok(el.querySelector('strong'));assert.ok(el.querySelector('pre code').textContent.includes('<script>'));
 assert.equal(el.querySelector('script'),null);assert.equal(el.querySelector('img'),null);assert.ok([...el.querySelectorAll('a')].every(a=>a.href.startsWith('https://')));
});
test('catalog comparison works while live chat is unavailable and uses descriptive names',async()=>{
 const {document,Event}=parseHTML(chatPage());await initialiseChat(document,async()=>new Response(JSON.stringify({available:false,error:'Not configured'}),{status:503,headers:{'Content-Type':'application/json'}}));
 const form=document.querySelector('#catalog-compare');Object.defineProperty(form.querySelector('[name="first"]'),'value',{value:'studio'});Object.defineProperty(form.querySelector('[name="second"]'),'value',{value:'wedding'});form.dispatchEvent(new Event('submit',{cancelable:true}));
 assert.ok(document.querySelector('.message-assistant table'));assert.ok(document.querySelector('#live-chat-log').textContent.includes('Private preview'));assert.ok(!/KretivOS|Restu\.ai/i.test(document.querySelector('#live-chat-log').textContent));
});
test('browser processes streamed Markdown and retains interrupted text for explicit retry',async()=>{
 const {document,Event}=parseHTML(chatPage());let complete=false;
 await initialiseChat(document,async(url,options)=>options?.method==='POST'?new Response(bytesStream('data: {"type":"model","model":"reported-model"}\n\ndata: {"type":"delta","text":"**Partial** reply"}\n\n'+(complete?'data: {"type":"done","remaining":18,"model":"reported-model"}\n\n':'')),{headers:{'Content-Type':'text/event-stream'}}):json({available:true,visitorDailyLimit:20}));
 document.querySelector('textarea').value='My question';document.querySelector('#live-chat-form').dispatchEvent(new Event('submit',{cancelable:true}));await tick();
 assert.equal(document.querySelector('.message-assistant strong').textContent,'Partial');assert.ok(document.querySelector('.chat-message-label').textContent==='You');assert.ok(document.querySelector('#live-chat-error').textContent.includes('interrupted'));
 complete=true;const form=document.querySelector('#live-chat-form');form.requestSubmit=()=>form.dispatchEvent(new Event('submit',{cancelable:true}));document.querySelector('[data-chat-retry]').click();await tick();
 assert.equal(document.querySelectorAll('.message-assistant').length,1);assert.equal(document.querySelector('#live-chat-error').textContent,'');assert.equal(document.querySelector('.message-assistant .chat-message-label').textContent,'AI-Nonymauz · reported-model');
});
test('walkthrough playback is inline, pauses offscreen and preserves manual pause',async()=>{
 const {document,window}=parseHTML(walkthroughShowcase());let callback;const media={matches:false,addEventListener(){}};
 Object.assign(globalThis,{document,window,matchMedia:()=>media,IntersectionObserver:class{constructor(fn){callback=fn}observe(){}disconnect(){}}});
 const videos=[...document.querySelectorAll('video')];for(const video of videos){video._paused=true;video.play=async()=>{video._paused=false};video.pause=()=>{video._paused=true};video.load=()=>{};}
 initialiseWalkthroughs(document);assert.ok(videos.every(video=>video.hasAttribute('muted')&&video.hasAttribute('playsinline')&&!video.getAttribute('src')));
 callback([{isIntersecting:true}]);await tick();assert.ok(videos.every(video=>!video._paused));
 const toggle=document.querySelector('[data-walkthrough-toggle]');toggle.click();callback([{isIntersecting:false}]);callback([{isIntersecting:true}]);await tick();assert.ok(videos.every(video=>video._paused));
 toggle.click();await tick();assert.ok(videos.every(video=>!video._paused));document.dispatchEvent(new window.CustomEvent('motion-state',{detail:true}));assert.ok(videos.every(video=>video._paused));
 document.dispatchEvent(new window.CustomEvent('motion-state',{detail:false}));await tick();assert.ok(videos.every(video=>!video._paused));
 document.querySelector('[data-walkthrough-product="flow"]').click();await tick();assert.ok(videos.every(video=>video.src.includes('/flow-')));
});
test('all demo recordings are small local MP4 files and posters exist',async()=>{
 for(const id of ['people','flow','wedding','studio'])for(const kind of ['desktop','mobile']){
  const p=`assets/walkthroughs/${id}-${kind}.mp4`,data=await readFile(p);assert.ok(data.subarray(0,24).includes(Buffer.from('ftyp')));assert.ok((await stat(p)).size<100000);assert.ok((await stat(`assets/walkthroughs/${id}-${kind}.webp`)).size>1000);
 }
});

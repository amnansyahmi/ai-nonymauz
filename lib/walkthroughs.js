import { icon, escapeHTML as e } from './ui.js';
import { products, productPath } from '../products.js';
export const walkthroughs = [
  { id: 'people', label: 'HRMS', chapters: ['Review the inbox', 'Approve a request', 'Clear the queue'] },
  { id: 'flow', label: 'FlowTrack', chapters: ['See the monthly picture', 'Add a commitment', 'Review the balance'] },
  { id: 'wedding', label: 'Wedding Planner', chapters: ['Start with a checklist', 'Tick the next step', 'Track your progress'] },
  { id: 'studio', label: 'Creative Workspace', chapters: ['Bring the brief together', 'Move work forward', 'Send for review'] },
];
export function walkthroughShowcase(selected = 'people', prefix = 'home') {
  const entry = walkthroughs.find(x => x.id === selected) || walkthroughs[0];
  return `<div class="walkthrough" data-walkthrough="${entry.id}" role="region" aria-label="Product demo recordings"><div class="walkthrough-tabs" role="group" aria-label="Choose a product walkthrough">${walkthroughs.map(x => `<button type="button" data-walkthrough-product="${x.id}" aria-pressed="${entry.id === x.id}">${e(x.label)}</button>`).join('')}</div><div class="walkthrough-device-stage"><div class="walkthrough-laptop"><div class="walkthrough-laptop-screen"><video muted loop playsinline preload="none" data-walkthrough-video="desktop" poster="/assets/walkthroughs/${entry.id}-desktop.webp" aria-label="${e(entry.label)} desktop demo recording"></video></div><div class="walkthrough-laptop-base" aria-hidden="true"></div></div><div class="walkthrough-phone"><div class="walkthrough-phone-camera" aria-hidden="true"></div><video muted loop playsinline preload="none" data-walkthrough-video="mobile" poster="/assets/walkthroughs/${entry.id}-mobile.webp" aria-label="${e(entry.label)} mobile demo recording"></video></div></div><div class="walkthrough-caption"><div><span class="overline" data-walkthrough-label>${e(entry.label)} / DEMO RECORDING</span><h3 id="${prefix}-walkthrough-caption" data-walkthrough-caption>${e(entry.chapters[0])}</h3></div><button type="button" class="text-link" data-walkthrough-toggle aria-pressed="false" aria-label="Play walkthrough">${icon('play')}<span>Play</span></button></div><div class="walkthrough-chapters" role="group" aria-label="Walkthrough chapters">${entry.chapters.map((title, i) => `<button type="button" data-walkthrough-chapter="${i}" aria-pressed="${i === 0}"><span>0${i + 1}</span><span data-chapter-title>${e(title)}</span></button>`).join('')}</div><div class="walkthrough-bottom"><p>Recorded from the interactive demos with fictional data. No account is connected.</p><a class="text-link" data-walkthrough-link href="${productPath(entry.id)}">Explore ${e(entry.label)} ${icon('arrow-up-right')}</a></div><p class="sr-only" data-walkthrough-status role="status"></p></div>`;
}
export function initialiseWalkthroughs(root = document) {
  root.querySelectorAll('[data-walkthrough]').forEach(widget => {
    const videos = [...widget.querySelectorAll('video')], toggle = widget.querySelector('[data-walkthrough-toggle]');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let entry = walkthroughs.find(x => x.id === widget.dataset.walkthrough), visible = false, wanted = !globalThis.navigator?.connection?.saveData, paused = false, dialog = false, pageHidden = false, version = 0;
    const allowed = () => visible && wanted && !paused && !dialog && !pageHidden && !document.hidden && !reduced.matches;
    const setState = playing => { toggle.setAttribute('aria-pressed', String(playing)); toggle.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} walkthrough`); toggle.innerHTML = `${icon(playing ? 'pause' : 'play')}<span>${playing ? 'Pause' : 'Play'}</span>`; toggle.disabled = paused || reduced.matches; };
    function stop() { version++; videos.forEach(video => video.pause()); setState(false); }
    async function sync() {
      if (!allowed()) { stop(); return; }
      const own = ++version;
      for (const video of videos) {
        if (!video.getAttribute('src')) video.src = `/assets/walkthroughs/${entry.id}-${video.dataset.walkthroughVideo}.mp4`;
        video.muted = true;
      }
      const results = await Promise.allSettled(videos.map(video => video.play()));
      if (own !== version) { if (!allowed()) videos.forEach(video => video.pause()); return; }
      if (!allowed()) { stop(); return; }
      setState(results.some(result => result.status === 'fulfilled'));
      if (results.every(result => result.status === 'rejected')) widget.querySelector('[data-walkthrough-status]').textContent = 'Tap Play to start the walkthrough.';
    }
    function select(id) {
      const next = walkthroughs.find(x => x.id === id); if (!next) return;
      stop(); entry = next; widget.dataset.walkthrough = id;
      videos.forEach(video => { video.removeAttribute('src'); video.poster = `/assets/walkthroughs/${id}-${video.dataset.walkthroughVideo}.webp`; video.setAttribute('aria-label', `${entry.label} ${video.dataset.walkthroughVideo} demo recording`); video.load(); });
      widget.querySelectorAll('[data-walkthrough-product]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.walkthroughProduct === id)));
      widget.querySelector('[data-walkthrough-label]').textContent = `${entry.label} / DEMO RECORDING`;
      widget.querySelector('[data-walkthrough-caption]').textContent = entry.chapters[0];
      widget.querySelectorAll('[data-chapter-title]').forEach((el, i) => el.textContent = entry.chapters[i]);
      const link = widget.querySelector('[data-walkthrough-link]'); link.href = productPath(id); link.innerHTML = `Explore ${e(products.find(p => p.id === id).short)} ${icon('arrow-up-right')}`;
      void sync();
    }
    widget.querySelectorAll('[data-walkthrough-product]').forEach(button => button.addEventListener('click', () => select(button.dataset.walkthroughProduct)));
    toggle.addEventListener('click', () => { wanted = toggle.getAttribute("aria-pressed") !== "true"; void sync(); });
    widget.querySelectorAll('[data-walkthrough-chapter]').forEach(button => button.addEventListener('click', () => {
      const i = Number(button.dataset.walkthroughChapter);
      videos.forEach(video => { if (Number.isFinite(video.duration)) video.currentTime = video.duration * i / 3; });
      widget.querySelector('[data-walkthrough-caption]').textContent = entry.chapters[i];
    }));
    videos.find(video => video.dataset.walkthroughVideo === 'mobile').addEventListener('timeupdate', event => {
      const video = event.target, chapter = Number.isFinite(video.duration) && video.duration > 0 ? Math.min(2, Math.floor(video.currentTime / video.duration * 3)) : 0;
      widget.querySelector('[data-walkthrough-caption]').textContent = entry.chapters[chapter];
      widget.querySelectorAll('[data-walkthrough-chapter]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.walkthroughChapter) === chapter)));
    });
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      visible = entries.at(-1).isIntersecting; void sync();
    }, { threshold: .15 });
    if (observer) observer.observe(widget); else { visible = true; void sync(); }
    document.addEventListener('visibilitychange', () => void sync());
    document.addEventListener('motion-state', event => { paused = event.detail; void sync(); });
    document.addEventListener('dialog-state', event => { dialog = event.detail; void sync(); });
    reduced.addEventListener('change', () => void sync());
    window.addEventListener('pagehide', event => { pageHidden = true; stop(); if (!event.persisted) observer?.disconnect(); });
    window.addEventListener('pageshow', () => { pageHidden = false; void sync(); });
    setState(false);
  });
}

import { products } from './products.js';
import './background.js';

const paths = {
  'arrow-right': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  'arrow-up-right': '<path d="M6 18 18 6M6 6h12v12"/>',
  'arrow-down': '<path d="M12 4v16m-6-6 6 6 6-6"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>',
  layers: '<path d="m12 3 10 6-10 6L2 9Zm-10 12 10 6 10-6M2 12l10 6 10-6"/>',
  wallet: '<path d="M20 8V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v12H5a3 3 0 0 1-3-3V6m18 7h-5v4h5"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  briefcase: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12a24 24 0 0 0 18 0m-9 0v3"/>',
  spark: '<path d="m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6ZM20 2v4m-2-2h4"/>',
  shield: '<path d="m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6Zm-4 10 3 3 5-6"/>',
  'map-pin': '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  'mouse-pointer': '<path d="m3 3 7 18 3-8 8-3ZM13 13l7 7"/>',
  smartphone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 18h4"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', x: '<path d="m6 6 12 12M6 18 18 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', check: '<path d="m5 12 4 4L19 6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18m-12 4h2m3 0h2"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  pen: '<path d="m16 3 5 5-12 12-6 1 1-6Zm-2 2 5 5"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.layers}</svg>`;
function hydrateIcons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); }); }

const previews = {
  people: `<div class="preview-top"><span class="preview-brand">${icon('users')} People</span><span class="preview-top-right">Your workspace <span class="avatar">AS</span></span></div><div class="preview-content"><div class="mock-sidebar"><span class="mock-nav selected">${icon('layers')} Overview</span><span class="mock-nav">${icon('users')} Employees</span><span class="mock-nav">${icon('clock')} Attendance</span><span class="mock-nav">${icon('calendar')} Leave</span><span class="mock-nav">${icon('wallet')} Payroll</span><div class="mock-sidebar-bottom">Nonymauz People</div></div><div class="mock-main"><div class="mock-greeting"><div><span class="mock-date">Monday, 12 October</span><h3>A good day to get organised.</h3></div>${icon('search')}</div><div class="mock-stats"><div><span>Team members</span><strong>24</strong></div><div><span>At work today</span><strong>21<span class="small-unit"> / 24</span></strong></div><div><span>To review</span><strong>3<span class="stat-dot"></span></strong></div></div><div class="mock-list-heading"><strong>Approval inbox</strong><span>3 requests</span></div><div class="approval-row"><span class="person-avatar avatar-pink">NA</span><div><strong>Nur Aisyah</strong><span>Annual leave · 14–15 Oct</span></div><span class="status-pill">For review</span></div><div class="approval-row"><span class="person-avatar avatar-purple">DK</span><div><strong>Daniel Koh</strong><span>Expense claim · Travel</span></div><span class="status-pill">For review</span></div><div class="mock-ai">${icon('spark')}<div><strong>A helping hand for HR.</strong><span>Draft a letter, find a policy, or review a resume.</span></div></div></div></div>`,
  kretiv: `<div class="preview-top"><span class="preview-brand">${icon('layers')} KretivOS</span><span class="preview-top-right">Studio workspace <span class="avatar">KC</span></span></div><div class="preview-content"><div class="mock-sidebar"><span class="mock-nav selected">${icon('layers')} Projects</span><span class="mock-nav">${icon('briefcase')} Clients</span><span class="mock-nav">${icon('calendar')} Content</span><span class="mock-nav">${icon('users')} Team</span><div class="mock-sidebar-bottom">Your creative workspace</div></div><div class="mock-main"><div class="mock-greeting"><div><span class="mock-date">Project workspace</span><h3>Good ideas, moving forward.</h3></div>${icon('search')}</div><div class="project-board"><div><span>To plan</span><article><span class="board-tag">Strategy</span><strong>Brand discovery</strong><small>Client workshop</small></article><article><span class="board-tag">Content</span><strong>November ideas</strong><small>Content plan</small></article></div><div><span>In progress</span><article><span class="board-tag blue-tag">Design</span><strong>Launch campaign</strong><small>Artwork & copy</small></article></div><div><span>For review</span><article><span class="board-tag green-tag">Delivery</span><strong>Website direction</strong><small>Client feedback</small></article></div></div><div class="mock-ai">${icon('check')}<div><strong>Keep everyone on the same page.</strong><span>From first brief to final delivery.</span></div></div></div></div>`,
  flow: `<div class="preview-top"><span class="preview-brand">${icon('wallet')} FlowTrack</span><span class="preview-top-right">Personal workspace <span class="avatar">AS</span></span></div><div class="preview-content"><div class="mock-sidebar"><span class="mock-nav selected">${icon('layers')} Overview</span><span class="mock-nav">${icon('wallet')} Expenses</span><span class="mock-nav">${icon('calendar')} Recurring</span><span class="mock-nav">${icon('briefcase')} Debts</span><div class="mock-sidebar-bottom">A clearer month ahead</div></div><div class="mock-main"><div class="mock-greeting"><div><span class="mock-date">October overview</span><h3>Your money, in perspective.</h3></div>${icon('search')}</div><div class="mock-stats"><div><span>Income</span><strong><span class="currency">RM </span>5,000</strong></div><div><span>Committed</span><strong><span class="currency">RM </span>3,200</strong></div><div><span>Available</span><strong><span class="currency">RM </span>1,800</strong></div></div><div class="budget-bar" aria-hidden="true"><span></span><span></span><span></span></div><div class="mock-list-heading"><strong>This month’s commitments</strong><span>Monthly</span></div><div class="expense-row"><span>${icon('briefcase')}</span><strong>Home & utilities</strong><b>RM 1,500</b></div><div class="expense-row"><span>${icon('wallet')}</span><strong>Transport</strong><b>RM 900</b></div><div class="expense-row"><span>${icon('calendar')}</span><strong>Other commitments</strong><b>RM 800</b></div><div class="mock-ai">${icon('check')}<div><strong>Make space for what matters.</strong><span>One view of your monthly commitments.</span></div></div></div></div>`,
};

function visual(product) {
  switch (product.visual) {
    case 'people': return `<div class="card-people"><div class="card-mini-title">Your team, together <span>${icon('users')}</span></div><div class="avatar-group"><span>NA</span><span>DK</span><span>SM</span><span>AL</span><span>+20</span></div><div class="card-people-line"><span>${icon('calendar')} Leave request</span><span class="mini-approved">${icon('check')} Reviewed</span></div><div class="card-people-line"><span>${icon('wallet')} Monthly payroll</span><span class="mini-approved">Ready to review</span></div></div>`;
    case 'restu': return `<div class="card-restu"><svg class="ring-art" viewBox="0 0 200 150" aria-hidden="true"><ellipse cx="84" cy="87" rx="39" ry="43" transform="rotate(-22 84 87)"/><ellipse cx="118" cy="90" rx="35" ry="40" transform="rotate(25 118 90)"/><path d="m60 41 9-15 19-2 12 12-16 18Zm9-15 15 28 4-30M60 41l40-5"/></svg><div class="wedding-note">Our next chapter<span>${icon('check')} One plan, together</span></div></div>`;
    case 'kretiv': return `<div class="mini-board"><div><span>Plan</span><b>Brand discovery</b><b>Content ideas</b></div><div><span>Create</span><b class="board-accent">Launch artwork</b></div><div><span>Review</span><b>Website concept</b></div></div>`;
    case 'flow': return `<div class="mini-money"><div><span>Your monthly picture</span><strong>Room to breathe.</strong></div><div class="mini-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="money-legend"><span>Commitments</span><span>Everyday spending</span></div></div>`;
    case 'power': return `<div class="mini-operations"><span>${icon('briefcase')} Business workspace</span><div><span>${icon('layers')} Projects</span><span>${icon('users')} Team</span><span>${icon('wallet')} Finance</span><span>${icon('spark')} AI tools</span></div></div>`;
    case 'cloud': return `<div class="mini-chat"><span class="chat-person">Help me turn this idea into a plan.</span><div>${icon('spark')}<p>Let’s start with the goal.<br>What would you like to build?</p></div><span class="chat-composer">A place to think things through ${icon('arrow-up-right')}</span></div>`;
    default: return `<div class="mini-security"><div class="security-shield">${icon('shield')}</div><div><strong>A foundation for safer systems.</strong><span>Integrate. Detect. Review.</span></div></div>`;
  }
}

let activeFilter = 'all';
const grid = document.querySelector('#product-grid');
function renderProducts() {
  const list = products.filter(p => activeFilter === 'all' || p.category === activeFilter);
  grid.classList.toggle('filtered-grid', activeFilter !== 'all');
  grid.innerHTML = list.map(p => `<article class="product-card tone-${p.tone}"><div class="card-visual" aria-hidden="true">${visual(p)}</div><div class="product-body"><div class="product-name"><span class="product-icon">${icon(p.icon)}</span><h3>${p.name}</h3><span class="product-category">${p.categoryLabel}</span></div><h4>${p.headline}</h4><p>${p.description}</p><button type="button" class="product-explore" data-product="${p.id}" aria-label="Explore ${p.name}">Explore system ${icon('arrow-up-right')}</button></div></article>`).join('');
  document.querySelector('#filter-status').textContent = `Showing ${list.length} systems.`;
}
renderProducts();
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(el => { const selected = el === button; el.classList.toggle('active', selected); el.setAttribute('aria-pressed', selected); });
  renderProducts();
}));

function showPreview(id) {
  document.querySelector('#product-preview').innerHTML = previews[id];
  document.querySelectorAll('[data-preview]').forEach(el => { const active = el.dataset.preview === id; el.classList.toggle('active', active); el.setAttribute('aria-pressed', active); });
}
showPreview('people');
document.querySelectorAll('[data-preview]').forEach(el => el.addEventListener('click', () => showPreview(el.dataset.preview)));

const productDialog = document.querySelector('#product-dialog');
let dialogTrigger;
function openDialog(dialog, trigger) { dialogTrigger = trigger; document.body.classList.add('dialog-open'); dialog.showModal(); }
function closeDialog(dialog) { dialog.close(); }
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.querySelector('.dialog-close').addEventListener('click', () => closeDialog(dialog));
  // Native dialogs trap keyboard focus; only clicks outside their bounds dismiss them.
  dialog.addEventListener('click', event => { const r = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) closeDialog(dialog); });
  dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); dialogTrigger?.focus({ preventScroll: true }); if (dialog === productDialog && new URL(location.href).searchParams.has('system')) { const url = new URL(location.href); url.searchParams.delete('system'); history.replaceState(null, '', url); } });
}
function openProduct(id, trigger) {
  const p = products.find(item => item.id === id);
  if (!p) return;
  document.querySelector('#dialog-content').innerHTML = `<div class="dialog-product-mark tone-${p.tone}">${icon(p.icon)}</div><p class="section-kicker">${p.categoryLabel}</p><h2 id="dialog-title">${p.name}</h2><p class="dialog-description">${p.detail}</p><h3>What you’ll find</h3><ul class="feature-list">${p.features.map(f => `<li>${icon('check')}${f}</li>`).join('')}</ul><p class="product-note">${p.note}</p><a class="button button-primary" href="${p.url}" target="_blank" rel="noopener noreferrer">${p.action} ${icon('arrow-up-right')}</a><span class="external-note">Opens in a new tab</span>`;
  const url = new URL(location.href); url.searchParams.set('system', id); history.replaceState(null, '', url);
  openDialog(productDialog, trigger);
}
grid.addEventListener('click', event => { const button = event.target.closest('[data-product]'); if (button) openProduct(button.dataset.product, button); });
const requestedProduct = new URL(location.href).searchParams.get('system');
if (requestedProduct) openProduct(requestedProduct, document.querySelector('a[href="#systems"]'));

const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() { mobileNav.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open menu'); menuButton.innerHTML = icon('menu'); }
menuButton.addEventListener('click', () => { const opening = mobileNav.hidden; mobileNav.hidden = !opening; menuButton.setAttribute('aria-expanded', opening); menuButton.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu'); menuButton.innerHTML = icon(opening ? 'x' : 'menu'); });
mobileNav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuButton.focus(); } });
matchMedia('(min-width: 801px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const briefDialog = document.querySelector('#brief-dialog');
document.querySelector('#open-brief').addEventListener('click', event => openDialog(briefDialog, event.currentTarget));
document.querySelector('#brief-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const goal = String(data.get('goal')).trim(); const team = String(data.get('team')).trim();
  document.querySelector('#brief-result').textContent = '';
  if (!goal || !team) { document.querySelector('#brief-error').textContent = 'Add your goal and who will use the system.'; form.querySelector(!goal ? '#brief-goal' : '#brief-team').focus(); return; }
  document.querySelector('#brief-error').textContent = '';
  const text = `# AI-Nonymauz project brief\n\nDate: ${new Date().toISOString().slice(0, 10)}\n\n## Starting point\n${data.get('system')}\n\n## The problem to solve\n${goal}\n\n## Who will use it\n${team}\n\n## Discuss next\n- Current workflow and tools\n- Features needed first\n- Data and access requirements\n- Timeline and budget\n\nPrepared locally at AI-Nonymauz. This brief has not been submitted.\n`;
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'ai-nonymauz-project-brief.md'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
  document.querySelector('#brief-result').textContent = 'Your brief is ready. Check your downloads, then share it when you’re ready.';
});
document.querySelector('#year').textContent = new Date().getFullYear();
hydrateIcons();

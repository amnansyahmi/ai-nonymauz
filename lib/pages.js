import { products, productPages, productPath } from "../products.js";
import { icon, escapeHTML as e } from "./ui.js";
import { demoShell } from "./demo-views.js";
import { deviceShowcase } from "./captures.js";
const arrow = icon("arrow-up-right");
export function header() {
  return `<a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="container header-inner"><a class="brand" href="/" aria-label="AI-Nonymauz home"><img src="/assets/brand/ai-emblem.svg" width="32" height="32" alt=""><span>ai-nonymauz<span>.</span></span></a><nav class="desktop-nav" aria-label="Main navigation"><a href="/#systems">Our systems</a><a href="/#in-action">In action</a><a href="/#approach">Our approach</a><a href="/chat/">Try AI</a></nav><div class="header-actions"><button type="button" class="button button-small button-outline header-cta" data-open-finder>Find your system ${arrow}</button><button type="button" class="icon-button menu-button" aria-label="Open menu" aria-controls="mobile-nav" aria-expanded="false">${icon("menu")}</button></div></div><nav class="mobile-nav container" id="mobile-nav" aria-label="Mobile navigation" hidden><a href="/#systems">Our systems</a><a href="/#in-action">In action</a><a href="/#approach">Our approach</a><a href="/chat/">Try AI</a><button type="button" data-open-finder>Find your system ${arrow}</button></nav></header>`;
}
export function footer() {
  return `<footer class="site-footer container"><div class="footer-top"><a class="brand" href="/"><img src="/assets/brand/ai-emblem.svg" width="30" height="30" alt=""><span>ai-nonymauz.</span></a><p>Independent ideas.<br>Useful systems.</p><div class="footer-links"><a href="/#systems">Our systems</a><button type="button" data-open-brief>Start a conversation</button><a href="https://github.com/amnansyahmi" target="_blank" rel="noopener noreferrer">GitHub ${arrow}</a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} AI-Nonymauz</span><span>Thoughtfully built in Malaysia.</span><button type="button" class="motion-toggle" aria-pressed="false">${icon("clock")}<span>Pause motion</span></button></div></footer><a class="chat-launcher" href="/chat/" aria-label="Chat with AI-Nonymauz">${icon("spark")}<span>Ask AI</span></a>`;
}
export function dialogs() {
  return `<dialog id="finder-dialog" aria-labelledby="finder-title"><div class="sheet-handle" aria-hidden="true"></div><button class="dialog-close icon-button" type="button" aria-label="Close system finder">${icon("x")}</button><div id="finder-content"></div></dialog><dialog id="brief-dialog" aria-labelledby="brief-title"><div class="sheet-handle" aria-hidden="true"></div><button class="dialog-close icon-button" type="button" aria-label="Close project brief">${icon("x")}</button><p class="overline">FROM IDEA TO BRIEF</p><h2 id="brief-title">What are you building?</h2><p class="dialog-description">Put the important details in one place. Download your brief to save and share.</p><form id="brief-form"><label>Starting point<select name="system">${["Custom system", ...products.map((p) => p.name)].map((s) => `<option>${e(s)}</option>`).join("")}</select></label><label>What problem would you like to solve?<textarea name="goal" rows="4" maxlength="2000" required placeholder="Our team tracks leave in spreadsheets. We need one place for requests and approvals."></textarea></label><label>Who will use it?<input name="team" maxlength="200" required placeholder="25 employees and 2 HR admins"></label><div class="form-split"><label>Timeline<select name="timeline"><option>Exploring for now</option><option>Within a month</option><option>1–3 months</option><option>3–6 months</option></select></label><label>Budget, if known<input name="budget" maxlength="100" placeholder="Optional"></label></div><p class="form-error" role="alert"></p><button type="submit" class="button button-primary">Download my brief ${icon("download")}</button><p class="form-note">Prepared on your device. Your answers are not submitted.</p><p id="brief-result" role="status"></p></form></dialog>`;
}
function ribbon() {
  return `<div class="hero-emblem" aria-hidden="true"><div class="hero-emblem-tilt"><div class="hero-emblem-turn"><img src="/assets/brand/ai-emblem.svg" width="640" height="520" alt="" fetchpriority="high" decoding="async"></div></div></div>`;
}
export function home() {
  return `<main id="main"><section class="hero container" aria-labelledby="hero-title"><div class="hero-copy"><p class="overline"><span class="live-dot"></span>INDEPENDENT IDEAS. USEFUL SYSTEMS.</p><h1 id="hero-title">Less busywork.<br>More <span class="serif-word">possibility.</span></h1><p class="hero-description">Thoughtful tools for the people you work with.<br class="desktop-break"> And the life you’re building.</p><div class="hero-actions"><a class="button button-primary" href="#systems">Explore our systems ${icon("arrow-right")}</a><button class="text-link" type="button" data-open-finder>Find your fit ${arrow}</button></div><div class="hero-note">${icon("map-pin")} Built in Malaysia. Made for real life.</div></div><div class="hero-art" data-tone="people"><div class="art-grid" aria-hidden="true"></div><div class="art-orbit" aria-hidden="true"></div>${ribbon()}<span class="art-caption">A family of systems.<br>A world of possibility.</span><div class="orbit-chip chip-work">${icon("briefcase")} Work, with clarity.</div><div class="orbit-chip chip-life">${icon("heart")} Life, a little lighter.</div><span class="art-index">01 — ${String(products.length).padStart(2, "0")}</span></div></section><section id="systems" class="systems-section container"><div class="section-heading"><div><p class="overline">THE AI-NONYMAUZ COLLECTION</p><h2>Find your<br><span class="serif-word">everyday advantage.</span></h2></div><p>From the working day to the big day.<br>Choose the system that fits your world.</p></div><div class="filter-bar" role="group" aria-label="Filter systems">${[
    ["all", "All systems"],
    ["work", "Work & business"],
    ["life", "Everyday life"],
    ["tools", "AI & development"],
    ["games", "Games"],
  ]
    .map(
      ([id, label], i) =>
        `<button type="button" data-filter="${id}" aria-pressed="${i === 0}">${label}${i === 0 ? `<span>${String(products.length).padStart(2, "0")}</span>` : ""}</button>`,
    )
    .join(
      "",
    )}</div><p class="sr-only" id="filter-status" role="status"></p><div class="system-directory">${products.map((p) => `<a class="system-row tone-${p.tone}" data-category="${p.category}" href="${productPath(p.id)}"><span class="system-number">${productPages[p.id].number}</span><span class="system-icon">${icon(p.icon)}</span><span class="system-name"><strong>${p.name}</strong><span>${p.categoryLabel}</span></span><span class="system-description">${e(p.description.split(". ")[0])}.</span><span class="system-arrow">${arrow}</span></a>`).join("")}</div></section><section id="in-action" class="device-preview-section container" aria-labelledby="device-preview-title"><div class="device-section-heading"><div><p class="overline">MEET HRMS</p><h2 id="device-preview-title">Work, wherever<br><span class="serif-word">you are.</span></h2></div><div><p>Your team, your workday.<br>At your desk or in your hand.</p><a class="text-link" href="/systems/people/">Explore HRMS ${arrow}</a></div></div>${deviceShowcase("home-people")}</section><section class="life-feature container"><div class="life-copy"><p class="overline">AND THE DAYS THAT MEAN EVERYTHING</p><h2>A little less stress.<br>A little more <span class="serif-word">joy.</span></h2><p>A wedding checklist, a shared budget, and your next chapter. Give the plans a home, so you can enjoy making them.</p><a class="text-link" href="/systems/wedding/">Discover Wedding Planner ${arrow}</a></div><div class="life-preview">${demoShell("wedding", { compact: true })}</div></section><section id="approach" class="approach-section"><div class="container approach-inner"><p class="overline">THE THREAD THAT CONNECTS IT ALL</p><h2>Good technology<br>makes room for <span class="serif-word">you.</span></h2><div class="approach-bottom"><p>We build around the things people actually do. Manage a team. Keep a project moving. Understand their money. Plan a meaningful day.</p><div class="principles"><div><span>01</span><h3>Clear on purpose.</h3><p>Familiar actions. Room to breathe.</p></div><div><span>02</span><h3>AI with a job to do.</h3><p>Useful help, where it belongs.</p></div><div><span>03</span><h3>Ready for your day.</h3><p>From your desk to your phone.</p></div></div></div></div></section><section class="faq-section container"><div><p class="overline">A LITTLE MORE CLARITY</p><h2>Before you<br><span class="serif-word">jump in.</span></h2></div><div class="faq-list">${[
    [
      "Are all the systems connected?",
      "They belong to the same product family, but each has its own workspace and setup. A shared account or automatic data sync is not currently offered.",
    ],
    [
      "Which system should I start with?",
      "Use the system finder to match your goal to a product. You can explore product pages and sample demos before opening an app.",
    ],
    [
      "Are these demos connected to my account?",
      "No. These are interactive demonstrations with fictional sample records. Demo changes stay on this page and reset when you reload.",
    ],
    [
      "Can I use the apps on my phone?",
      "The product family includes responsive web apps. Several support adding the app to your home screen; installation and offline behaviour depend on the individual system.",
    ],
    [
      "Can a system be adapted for my business?",
      "Create a project brief with your workflow, users, and goals. Download it to save and share when you are ready to discuss a custom system.",
    ],
  ]
    .map(
      ([q, a]) =>
        `<details><summary>${q}${icon("plus")}</summary><p>${a}</p></details>`,
    )
    .join(
      "",
    )}</div></section><section class="start-section container" id="start"><div class="start-panel"><span class="overline">YOUR NEXT CHAPTER</span><h2>What would you<br>like to make <span class="serif-word">easier?</span></h2><div class="start-bottom"><p>Find a system that fits.<br>Or give your own idea a starting point.</p><div><button type="button" class="button button-white" data-open-finder>Find your system ${arrow}</button><button type="button" class="text-link" data-open-brief>Create a project brief ${icon("pen")}</button></div></div><img class="endcap-mark" src="/assets/brand/ai-emblem.svg" width="768" height="768" alt="" aria-hidden="true" loading="lazy"></div></section></main>`;
}
export function productPage(p) {
  const d = productPages[p.id];
  return `<main id="main" class="product-page tone-${p.tone}"><section class="product-hero container"><a class="back-link" href="/#systems">${icon("arrow-right")} All systems</a><div class="product-hero-grid"><div><p class="overline"><span class="system-icon">${icon(p.icon)}</span>${e(p.name)} / ${d.number}</p><h1>${d.title}</h1><p class="product-intro">${e(d.summary)}</p><div class="hero-actions"><a class="button button-primary" href="${p.url}" target="_blank" rel="noopener noreferrer">${p.action} ${arrow}</a><a class="text-link" href="#product-demo">${d.demo ? "Try the demo" : "Explore the project"} ${icon("arrow-down")}</a></div><p class="product-audience">${e(d.audience)}</p></div><div class="product-cover"><span class="cover-word">${e(p.short)}</span><span class="cover-icon">${icon(p.icon)}</span><p>${e(d.eyebrow)}</p><span class="cover-index">AI-NONYMAUZ / ${d.number}</span></div></div></section><section class="product-workflow container"><div class="section-heading"><div><p class="overline">BUILT AROUND YOUR DAY</p><h2>A clearer way<br>to move forward.</h2></div><p>${e(p.detail)}</p></div><div class="workflow-steps">${d.steps.map(([title, body], i) => `<article><span>0${i + 1}</span><h3>${e(title)}</h3><p>${e(body)}</p></article>`).join("")}</div></section><section class="product-demo-section" id="product-demo"><div class="container"><div class="section-heading"><div><p class="overline">TAKE A CLOSER LOOK</p><h2>${d.demo ? `Try a little<br>of ${e(p.short)}.` : `Meet ${e(p.short)}.`}</h2></div><p>${d.demo ? "An illustrative workspace with sample data.<br>Your demo changes stay on this page." : e(p.note)}</p></div>${d.demo ? demoShell(d.demo) : projectOverview(p)}</div></section>${d.screenshot ? `<section class="screenshots-section container"><div class="section-heading"><div><p class="overline">INSIDE THE APP</p><h2>At your desk.<br>In your hand.</h2></div><p>Explore HRMS on a phone or laptop.<br>Sample workspace previews.</p></div>${deviceShowcase("product-people")}</section>` : `<section class="mobile-story container"><div><p class="overline">ROOM FOR YOUR EVERYDAY</p><h2>A workspace that<br>comes with you.</h2><p>Explore ${e(p.short)} from your phone or your desk. The app’s current configuration determines which features are available.</p></div><div class="mobile-preview">${d.demo ? demoShell(d.demo, { compact: true }) : projectOverview(p)}<span class="mobile-preview-caption">${d.demo ? "Illustrative mobile workspace" : "Project overview"}</span></div></section>`}<section class="product-details container"><div><p class="overline">WHAT YOU’LL FIND</p><h2>The useful details.</h2></div><div><ul class="feature-list">${p.features.map((f) => `<li>${icon("check")}${e(f)}</li>`).join("")}</ul><p class="product-note">${e(p.note)}</p><p class="form-note">${p.privatePreview ? "Shown under a descriptive public name. Create a brief to discuss access." : "Each project has its own setup. The linked app opens in a new tab."}</p></div></section><section class="product-next container"><div><p class="overline">YOUR NEXT STEP</p><h2>${e(d.eyebrow)}</h2></div><a class="button button-primary" href="${p.url}" target="_blank" rel="noopener noreferrer">${p.action} ${arrow}</a></section><nav class="related-products container" aria-label="Explore more systems"><h3>There’s more to explore.</h3>${products
    .filter((x) => x.id !== p.id)
    .slice(0, 3)
    .map(
      (x) =>
        `<a href="${productPath(x.id)}">${icon(x.icon)}<span>${x.name}</span>${arrow}</a>`,
    )
    .join(
      "",
    )}<button type="button" class="text-link" data-open-finder>Help me choose ${arrow}</button></nav></main>`;
}

function projectOverview(p) { return `<div class="project-overview"><span class="system-icon">${icon(p.icon)}</span><h3>${e(p.headline)}</h3><ul>${p.features.map(f => `<li>${icon("check")}${e(f)}</li>`).join("")}</ul><a class="text-link" href="${p.url}" target="_blank" rel="noopener noreferrer">${e(p.action)} ${arrow}</a></div>`; }

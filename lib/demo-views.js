import { icon, escapeHTML as e } from "./ui.js";
import { initialExpenses, totalExpenses } from "./demo-state.js";
export const money = (value) =>
  new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
const titles = {
  people: "HRMS",
  flow: "FlowTrack",
  studio: "Creative Business Workspace",
  wedding: "Wedding Planner",
  power: "PowerOS",
  cloud: "AI Cloud",
  secure: "SecureIntelligence",
};
export function demoShell(id, { compact = false } = {}) {
  return `<div class="demo-app demo-${id}${compact ? " demo-compact" : ""}" data-demo="${id}"><div class="demo-bar"><span class="demo-brand">${icon({ people: "users", flow: "wallet", studio: "layers", wedding: "heart", power: "briefcase", cloud: "spark", secure: "shield" }[id])}${titles[id]}</span><span class="demo-label">Interactive demo</span><button class="demo-reset" type="button" data-reset aria-label="Reset ${titles[id]} demo">Reset ${icon("clock")}</button></div><div class="demo-body">${demoBody(id)}</div><div class="demo-bottom"><span class="demo-led"></span>Sample workspace · changes stay in this demo<span class="demo-feedback" role="status" aria-live="polite"></span></div></div>`;
}
export function demoBody(id) {
  if (id === "people")
    return `<div class="demo-heading"><div><span class="overline">YOUR TEAM, TOGETHER</span><h3>One less thing to chase.</h3></div><span class="sample-avatar">AS</span></div><div class="demo-metrics"><div><span>Team members</span><strong>24</strong></div><div><span>At work today</span><strong>21<span class="unit"> / 24</span></strong></div><div><span>To review</span><strong data-pending-count>2</strong></div></div><div class="demo-section-title"><h4>Approval inbox</h4><span>Try approving a request</span></div><div class="requests">${[
      ["NA", "Nur Aisyah", "Annual leave", "14–15 Oct", "rose"],
      ["DK", "Daniel Koh", "Travel claim", "RM 180", "lilac"],
    ]
      .map(
        ([initials, name, type, date, tone], i) =>
          `<article class="request-row" data-request="${i}"><span class="sample-avatar ${tone}">${initials}</span><div class="request-person"><strong>${name}</strong><span>${type} · ${date}</span></div><button type="button" class="approve-button" data-approve="${i}" aria-label="Approve ${name}'s ${type.toLowerCase()}">${icon("check")} Approve</button></article>`,
      )
      .join(
        "",
      )}</div><div class="demo-insight">${icon("users")}<span>A little less admin.<br><strong>A little more time for your people.</strong></span></div>`;
  if (id === "flow")
    return `<div class="demo-heading"><div><span class="overline">YOUR MONTH, IN PERSPECTIVE</span><h3>A clearer picture.</h3></div>${icon("wallet")}</div><div class="demo-metrics flow-metrics"><div><span>Income</span><strong>RM 5,000</strong></div><div><span>Committed</span><strong data-expense-total>RM 3,200</strong></div><div><span data-balance-label>Available</span><strong data-balance>RM 1,800</strong></div></div><div class="spending-meter" role="meter" aria-label="Share of income committed" aria-valuemin="0" aria-valuemax="100" aria-valuenow="64"><span></span></div><div class="demo-section-title"><h4>Monthly commitments</h4><span>Sample budget</span></div><div class="expense-list">${expenseRows(initialExpenses())}</div><form class="expense-form"><label><span>Expense name</span><input name="expenseName" maxlength="60" required placeholder="e.g. Groceries" autocomplete="off"></label><label><span>Amount (RM)</span><input name="expenseAmount" inputmode="decimal" required placeholder="120.00" autocomplete="off"></label><button class="small-button" type="submit">${icon("plus")} Add</button><p class="form-error" role="alert"></p></form>`;
  if (id === "studio")
    return `<div class="demo-heading"><div><span class="overline">STUDIO WORKSPACE</span><h3>Good ideas, moving forward.</h3></div>${icon("layers")}</div><div class="demo-section-title"><h4>Launch campaign</h4><span>Move a task to the next stage</span></div><div class="kanban"><section data-stage="0"><h4><span></span>To plan <b data-task-count>1</b></h4><article class="task" data-task="brief" draggable="true"><span class="task-tag">Strategy</span><h5>Brand discovery</h5><p>A shared starting point.</p><button type="button" data-move>Start task ${icon("arrow-right")}</button></article></section><section data-stage="1"><h4><span></span>In progress <b data-task-count>1</b></h4><article class="task" data-task="launch" draggable="true"><span class="task-tag">Design</span><h5>Launch artwork</h5><p>The next big idea.</p><button type="button" data-move>Send for review ${icon("arrow-right")}</button></article></section><section data-stage="2"><h4><span></span>For review <b data-task-count>0</b></h4><p class="empty-stage">Good work lands here.</p></section></div><div class="demo-insight">${icon("check")}<span>One place for the brief,<br><strong>the work, and the next step.</strong></span></div>`;
  if (id === "wedding")
    return `<div class="demo-heading"><div><span class="overline">OUR NEXT CHAPTER</span><h3>A plan to come back to.</h3></div>${icon("heart")}</div><div class="wedding-date"><span>TOGETHER, ONE STEP AT A TIME</span><strong>The little things.<br>The big day.</strong><p>Your sample wedding checklist</p></div><div class="wedding-checks">${["Set a comfortable budget", "Shortlist the venue", "Plan the guest list"].map((s, i) => `<label><input type="checkbox" ${i === 0 ? "checked" : ""}>${s}</label>`).join("")}</div><p class="checklist-progress" role="status">1 of 3 steps complete</p>`;
  if (id === "power")
    return `<div class="demo-heading"><div><span class="overline">YOUR BUSINESS WORKSPACE</span><h3>See the whole picture.</h3></div>${icon("briefcase")}</div><div class="operations-tabs" role="group" aria-label="Explore workspace areas">${["Projects", "Team", "Finance"].map((s, i) => `<button type="button" data-operation="${i}" aria-pressed="${i === 0}">${icon(["layers", "users", "wallet"][i])}${s}</button>`).join("")}</div><div class="operation-panel"><span class="overline">PROJECTS</span><h4>Give the work a home.</h4><p>Explore a workspace for your business operations.</p><div class="illustration-lines"><i></i><i></i><i></i></div></div><p class="demo-disclaimer">Concept preview. Available tools depend on the current app and configuration.</p>`;
  if (id === "cloud")
    return `<div class="demo-heading"><div><span class="overline">A PLACE FOR YOUR NEXT IDEA</span><h3>Think it through.</h3></div>${icon("spark")}</div><div class="sample-chat"><p class="assistant-line">What would you like to explore?</p><div class="chat-options"><button type="button" data-prompt="plan">Plan a project</button><button type="button" data-prompt="compare">Compare two approaches</button></div><div class="sample-response" role="status"></div></div><p class="demo-disclaimer">Scripted demonstration. Open the app to connect your backend and use live AI.</p>`;
  return `<div class="demo-heading"><div><span class="overline">DEVELOPER WORKSPACE</span><h3>Review. Understand. Improve.</h3></div>${icon("shield")}</div><div class="security-demo"><span class="security-emblem">${icon("shield")}</span><h4>Start with the integration.</h4><p>Core components · API · configuration</p><button type="button" class="small-button" data-security>Explore the review steps ${icon("arrow-right")}</button><ol class="security-steps" hidden><li>Read the project documentation.</li><li>Configure and test in your application.</li><li>Review findings before production use.</li></ol></div><p class="demo-disclaimer">Illustrative workflow. This demo does not scan or assess a system.</p>`;
}
export const expenseRows = (items) =>
  items
    .map(
      (item, i) =>
        `<div class="expense-row"><span class="expense-icon">${icon(i === 0 ? "briefcase" : i === 1 ? "wallet" : "calendar")}</span><span>${e(item.name)}</span><strong>${money(item.amount)}</strong></div>`,
    )
    .join("");

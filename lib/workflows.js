import { icon, escapeHTML as e } from "./ui.js";

export const workflowIds = ["people", "kretiv", "flow"];
export const workflows = {
  people: {
    title: "Two days off. One clear process.",
    steps: ["Request leave", "Review the request", "Update the balance"],
    descriptions: [
      "Aisyah requests two days of annual leave. Her available balance is reserved while the request is reviewed.",
      "Her manager checks the dates and makes a decision from the approval inbox.",
      "The approved leave is added to the team calendar. Aisyah has 16 of her original 18 days available.",
    ],
  },
  flow: {
    title: "From a receipt to a clearer month.",
    steps: ["Record an expense", "Recalculate the budget", "See what remains"],
    descriptions: [
      "Add a RM 120 grocery expense to a sample monthly budget with RM 5,000 income.",
      "Committed spending increases from RM 3,200 to RM 3,320. The budget meter updates with it.",
      "RM 1,680 remains available. The new expense stays in the monthly list.",
    ],
  },
  kretiv: {
    title: "Give an idea its next step.",
    steps: ["Create the brief", "Start the work", "Send for review"],
    descriptions: [
      "A launch brief captures the goal, deliverable and owner in one place.",
      "Move the brief into progress so the team can see what is being worked on.",
      "Send the finished work for review with a clear next action.",
    ],
  },
};
export function neighbour(id, direction) {
  const i = workflowIds.indexOf(id);
  return workflowIds[(i + direction + workflowIds.length) % workflowIds.length];
}
// Swipe only on non-interactive surface, with clear horizontal intent.
export function swipeDirection(dx, dy) {
  return Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.5 ? (dx < 0 ? 1 : -1) : 0;
}
export function workflowFrame(id, step) {
  const w = workflows[id];
  const bar = `<div class="tour-app-bar"><span>${icon(id === "people" ? "users" : id === "flow" ? "wallet" : "layers")}${{ people: "People", flow: "FlowTrack", kretiv: "KretivOS" }[id]}</span><small>Sample workflow</small></div>`;
  let body;
  if (id === "people") {
    body = `<div class="tour-request"><span class="sample-avatar rose">NA</span><div><span class="overline">ANNUAL LEAVE</span><h3>Nur Aisyah</h3><p>14–15 October · 2 days</p></div><span class="tour-state">${step === 2 ? `${icon("check")} Approved` : step === 1 ? "Under review" : "Requested"}</span></div><dl class="tour-facts"><div><dt>Annual allowance</dt><dd>18 days</dd></div><div><dt>${step === 2 ? "Approved leave" : "Reserved for review"}</dt><dd>2 days</dd></div><div><dt>Available balance</dt><dd>16 days</dd></div></dl><div class="tour-outcome">${icon(step === 2 ? "calendar" : "users")}<span>${step === 2 ? "14–15 October added to the sample team calendar." : step === 1 ? "The dates and balance are together in the manager’s inbox." : "Request submitted. The manager is the next person to act."}</span></div>`;
  } else if (id === "flow") {
    body = `<div class="tour-budget"><span class="overline">OCTOBER / SAMPLE BUDGET</span><h3>${step === 0 ? "One new expense." : step === 1 ? "Your totals, updated." : "Room for the rest of the month."}</h3><div class="tour-money"><span><small>Income</small><strong>RM 5,000</strong></span><span><small>${step === 0 ? "Before this expense" : "Committed"}</small><strong>RM ${step === 0 ? "3,200" : "3,320"}</strong></span></div><div class="spending-meter" role="meter" aria-label="Sample income committed" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${step === 0 ? 64 : 66}"><span style="width:${step === 0 ? 64 : 66.4}%"></span></div><div class="tour-expense">${icon("wallet")}<span>Groceries<small>${step === 0 ? "Ready to add" : "Added to monthly commitments"}</small></span><strong>RM 120</strong></div><div class="tour-outcome">${icon("check")}<span>${step === 0 ? "A name and an amount. That’s the starting point." : step === 1 ? "RM 120 added to the committed total." : "RM 1,680 available after this expense."}</span></div></div>`;
  } else {
    body = `<div class="tour-project"><span class="overline">LAUNCH CAMPAIGN</span><h3>Brand discovery</h3><p>A shared starting point for the launch.</p><div class="tour-task"><span class="task-tag">Strategy</span><h4>A clear brief</h4><dl><div><dt>Deliverable</dt><dd>Launch direction</dd></div><div><dt>Owner</dt><dd>Creative team</dd></div></dl><span class="tour-state">${["To plan", "In progress", "For review"][step]}</span></div><div class="tour-outcome">${icon(step === 2 ? "check" : "layers")}<span>${["Goal and owner captured. Ready to start.", "The task is now visible in the team’s active work.", "Work submitted. The reviewer has a clear next step."][step]}</span></div></div>`;
  }
  return `<div class="tour-app tone-${id}" aria-label="${e(w.title)}">${bar}<div class="tour-app-body">${body}</div><p class="tour-disclaimer">Illustrative workflow with fictional data.</p></div>`;
}

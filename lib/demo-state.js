export const initialExpenses = () => [
  { name: "Home & utilities", amount: 1500 },
  { name: "Transport", amount: 900 },
  { name: "Other commitments", amount: 800 },
];
export function parseExpense(name, rawAmount) {
  const label = String(name).trim();
  const raw = String(rawAmount).trim();
  const amount = Number(raw);
  if (!label || label.length > 60)
    throw new Error("Enter a name with 1–60 characters.");
  if (
    !/^\d+(\.\d{1,2})?$/.test(raw) ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > 1000000
  )
    throw new Error(
      "Enter an amount between RM 0.01 and RM 1,000,000, with up to two decimal places.",
    );
  return { name: label, amount };
}
export const totalExpenses = (items) =>
  Math.round(items.reduce((sum, item) => sum + item.amount, 0) * 100) / 100;
export const finderChoices = {
  work: [
    ["people", "Manage employees & HR"],
    ["kretiv", "Manage creative projects & clients"],
    ["power", "Explore broader business operations"],
  ],
  life: [
    ["restu", "Plan a wedding"],
    ["flow", "Organise personal finances"],
  ],
  tools: [
    ["cloud", "Explore AI conversations & models"],
    ["secure", "Integrate security tooling"],
  ],
};
export function recommendSystem(area, goal) {
  if (!finderChoices[area]?.some(([id]) => id === goal)) return null;
  return goal;
}

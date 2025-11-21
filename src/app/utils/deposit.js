// src/app/utils/deposit.js
export function computeDepositCents(items, startDate, endDate) {
  const ms = 24 * 60 * 60 * 1000;
  const days = Math.max(
    1,
    Math.ceil((new Date(endDate) - new Date(startDate)) / ms)
  );
  let total = 0;

  for (const it of items) {
    const p = it.product;
    if (!p?.require_deposit) continue;
    const unit = Number(p.deposit_amount_cents || 0);
    const qty = Number(it.quantity || 1);
    total += p.deposit_type === "per_day" ? unit * days * qty : unit * qty;
  }
  return total;
}

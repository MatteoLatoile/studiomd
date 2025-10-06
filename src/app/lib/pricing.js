// Règles de calcul identiques front/back pour éviter les écarts.
export function daysInclusive(a, b) {
  try {
    const d1 = new Date(a + "T00:00:00");
    const d2 = new Date(b + "T00:00:00");
    const diff = Math.round((d2 - d1) / 86400000);
    return Math.max(1, diff + 1);
  } catch {
    return 1;
  }
}

export function computeCartTotals(cart = []) {
  // cart: [{ quantity, start_date, end_date, product:{price} }, ...]
  if (!Array.isArray(cart)) cart = [];
  if (!cart.length)
    return { days: 1, subtotal: 0, tva: 0, total: 0, amountCents: 0 };

  const s0 = cart[0]?.start_date,
    e0 = cart[0]?.end_date;
  const days = daysInclusive(s0, e0);

  const subtotal = cart.reduce((s, it) => {
    const unit = Number(it?.product?.price) || 0;
    return s + unit * days * (it.quantity || 0);
  }, 0);

  const tva = subtotal * 0.2; // même règle que le front
  const total = subtotal + tva;
  const amountCents = Math.round(total * 100);

  return {
    days,
    subtotal,
    tva,
    total,
    amountCents,
    startDate: s0,
    endDate: e0,
  };
}

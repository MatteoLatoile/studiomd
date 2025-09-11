// Appelle tes RPC existants sans toucher à ton UI
import { supabase } from "./supabase";

// Charge remaining/jour pour une fenêtre [from,to]
export async function fetchDailyRemaining(productId, fromISO, toISO) {
  const { data, error } = await supabase.rpc("product_daily_remaining", {
    p_product: productId,
    p_from: fromISO,
    p_to: toISO,
  });
  if (error) throw error;
  // map: 'YYYY-MM-DD' -> remaining int
  const map = {};
  (data || []).forEach((r) => (map[r.d] = r.remaining));
  return map;
}

// Bool de validation finale pour une plage
export async function checkRangeAvailable(productId, startISO, endISO) {
  const { data, error } = await supabase.rpc("product_is_available", {
    p_product: productId,
    p_start: startISO,
    p_end: endISO,
  });
  if (error) throw error;
  return !!data;
}

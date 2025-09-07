import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { stripe } from "@/app/lib/stripe";

export const dynamic = "force-dynamic";

function daysInclusive(a, b) {
  const d1 = new Date(a + "T00:00:00");
  const d2 = new Date(b + "T00:00:00");
  const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

export async function POST(req) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return new Response(JSON.stringify({ error: "Non authentifié" }), {
      status: 401,
    });

  const { session_id } = await req.json();
  if (!session_id)
    return new Response(JSON.stringify({ error: "session_id manquant" }), {
      status: 400,
    });

  // Récupère et vérifie la session
  const session = await stripe.checkout.sessions.retrieve(session_id);
  if (!session || session.payment_status !== "paid") {
    return new Response(JSON.stringify({ error: "Paiement non confirmé" }), {
      status: 400,
    });
  }

  // Métadonnées
  const meta = session.metadata || {};
  const startDate = meta.start_date;
  const endDate = meta.end_date;
  const delivery = meta.delivery || "pickup";
  const address = JSON.parse(meta.address_json || "{}");
  const days = daysInclusive(startDate, endDate);

  // Panier (join produits)
  const { data: cart } = await supabase
    .from("cart_items")
    .select(`id, quantity, product:products(id, name, price)`)
    .eq("user_id", user.id);

  // Crée la commande
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      session_id,
      start_date: startDate,
      end_date: endDate,
      delivery,
      address,
      payment_method: "card",
      total_amount_cents: session.amount_total || 0,
      status: "paid",
    })
    .select()
    .single();

  if (orderErr) {
    return new Response(JSON.stringify({ error: orderErr.message }), {
      status: 400,
    });
  }

  // Items de commande
  const rows = (cart || []).map((it) => ({
    order_id: order.id,
    product_id: it.product.id,
    name: it.product.name,
    unit_price_cents: Math.round(Number(it.product.price) * 100),
    quantity: (it.quantity || 1) * days,
  }));

  if (rows.length) {
    const { error: itemsErr } = await supabase.from("order_items").insert(rows);
    if (itemsErr) {
      return new Response(JSON.stringify({ error: itemsErr.message }), {
        status: 400,
      });
    }
  }

  // Vide le panier
  await supabase.from("cart_items").delete().eq("user_id", user.id);

  return new Response(JSON.stringify({ ok: true, order_id: order.id }), {
    status: 200,
  });
}

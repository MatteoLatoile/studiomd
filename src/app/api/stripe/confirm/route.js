export const dynamic = "force-dynamic";

import { stripe } from "@/app/lib/cawl";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/** nb de jours (inclusif) entre 2 dates ISO (YYYY-MM-DD) */
function daysInclusive(a, b) {
  const d1 = new Date(a + "T00:00:00");
  const d2 = new Date(b + "T00:00:00");
  const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

export async function POST(req) {
  const supabase = createRouteHandlerClient({ cookies });

  // Auth (admin/clients connectés)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return new Response(JSON.stringify({ error: "Non authentifié" }), {
      status: 401,
    });

  // Body
  const { session_id } = await req.json().catch(() => ({}));
  if (!session_id)
    return new Response(JSON.stringify({ error: "session_id manquant" }), {
      status: 400,
    });

  // Session Stripe
  const session = await stripe.checkout.sessions.retrieve(session_id);
  if (!session || session.payment_status !== "paid") {
    return new Response(JSON.stringify({ error: "Paiement non confirmé" }), {
      status: 400,
    });
  }

  // Métadonnées (posées lors de create-session)
  const meta = session.metadata || {};
  const startDate = meta.start_date;
  const endDate = meta.end_date;
  const delivery = meta.delivery || "pickup";
  const address = JSON.parse(meta.address_json || "{}");
  const days = daysInclusive(startDate, endDate);

  const customer_email =
    meta.email || session.customer_details?.email || user.email || null;
  const customer_first_name = meta.first_name || null;
  const customer_last_name = meta.last_name || null;
  const customer_phone = meta.phone || session.customer_details?.phone || null;

  // Panier (pour créer les lignes)
  const { data: cart, error: cartErr } = await supabase
    .from("cart_items")
    .select(
      `id, quantity, start_date, end_date, product:products(id, name, price)`
    )
    .eq("user_id", user.id);

  if (cartErr) {
    return new Response(JSON.stringify({ error: cartErr.message }), {
      status: 400,
    });
  }

  // (Option) on peut revalider que tous les items partagent bien le même créneau
  if (!cart || cart.length === 0) {
    return new Response(JSON.stringify({ error: "Panier vide" }), {
      status: 400,
    });
  }
  for (const it of cart) {
    if (it.start_date !== startDate || it.end_date !== endDate) {
      return new Response(
        JSON.stringify({
          error:
            "Incohérence des dates dans le panier au moment de la confirmation.",
        }),
        { status: 400 }
      );
    }
  }

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
      customer_email,
      customer_first_name,
      customer_last_name,
      customer_phone,
    })
    .select()
    .single();

  if (orderErr) {
    return new Response(JSON.stringify({ error: orderErr.message }), {
      status: 400,
    });
  }

  // Items de commande (qty = quantité * nb de jours)
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

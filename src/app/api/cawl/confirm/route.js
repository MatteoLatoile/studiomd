export const dynamic = "force-dynamic";

import { getHostedCheckoutStatus } from "@/app/lib/cawl";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

function daysInclusive(a, b) {
  const d1 = new Date(a + "T00:00:00");
  const d2 = new Date(b + "T00:00:00");
  const diff = Math.round((d2 - d1) / 86400000);
  return Math.max(1, diff + 1);
}

export async function POST(req) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Non authentifié" }), {
      status: 401,
    });
  }

  const { hostedCheckoutId } = await req.json().catch(() => ({}));
  if (!hostedCheckoutId) {
    return new Response(
      JSON.stringify({ error: "hostedCheckoutId manquant" }),
      { status: 400 }
    );
  }

  // 1) Statut Hosted Checkout
  let status;
  try {
    status = await getHostedCheckoutStatus(hostedCheckoutId);
  } catch (e) {
    console.error("[CAWL get status]", e.status, e.message);
    return new Response(
      JSON.stringify({ error: e.message || "Statut indisponible" }),
      { status: 400 }
    );
  }

  // 2) Vérifier succès (SALE captured = code 9)
  const payment = status?.createdPaymentOutput?.payment;
  const sc = payment?.statusOutput?.statusCode;
  const paymentId = payment?.id;
  const refs =
    payment?.paymentOutput?.references || status?.order?.references || {};
  const merchantReference =
    refs?.merchantReference || status?.merchantReference || null;

  if (Number(sc) !== 9) {
    const paymentStatus = payment?.status || "unknown";
    return new Response(
      JSON.stringify({
        error: `Paiement non confirmé (code=${sc} status=${paymentStatus})`,
      }),
      { status: 400 }
    );
  }

  // 3) Relire le panier
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
  if (!cart?.length) {
    return new Response(
      JSON.stringify({ error: "Panier vide au moment de confirmer" }),
      { status: 400 }
    );
  }

  const s0 = cart[0]?.start_date,
    e0 = cart[0]?.end_date;
  for (const it of cart) {
    if (it.start_date !== s0 || it.end_date !== e0) {
      return new Response(
        JSON.stringify({ error: "Incohérence des dates dans le panier." }),
        { status: 400 }
      );
    }
  }
  const days = daysInclusive(s0, e0);

  // 4) Montant total renvoyé par CAWL
  const amountCents =
    Number(payment?.paymentOutput?.amountOfMoney?.amount) || 0;

  // 5) Met à jour l'ordre (pending → paid)
  const { data: orderRow, error: updErr } = await supabase
    .from("orders")
    .update({
      payment_id: paymentId,
      status: "paid",
      total_amount_cents: amountCents || undefined,
    })
    .or(
      `session_id.eq.${hostedCheckoutId}${
        merchantReference ? `,merchant_reference.eq.${merchantReference}` : ""
      }`
    )
    .select()
    .maybeSingle();

  if (updErr || !orderRow) {
    return new Response(
      JSON.stringify({
        error:
          updErr?.message ||
          "Commande introuvable (session_id/merchant_reference)",
      }),
      { status: 400 }
    );
  }

  // 6) Lignes de commande
  const rows = cart.map((it) => ({
    order_id: orderRow.id,
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

  // 7) Vider le panier
  await supabase.from("cart_items").delete().eq("user_id", user.id);

  return new Response(JSON.stringify({ ok: true, order_id: orderRow.id }), {
    status: 200,
  });
}

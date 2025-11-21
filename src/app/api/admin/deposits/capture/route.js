// app/api/admin/deposits/capture/route.js
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: me } = await supabase.auth.getUser();
  if (!me?.user?.app_metadata?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { order_id, amount_cents } = await req.json();
  if (!order_id)
    return NextResponse.json({ error: "order_id requis" }, { status: 400 });

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, deposit_status, deposit_payment_id, deposit_required_cents, deposit_captured_cents"
    )
    .eq("id", order_id)
    .single();
  if (error || !order)
    return NextResponse.json(
      { error: "Commande introuvable" },
      { status: 404 }
    );
  if (!order.deposit_payment_id)
    return NextResponse.json(
      { error: "Aucune caution sur cette commande" },
      { status: 400 }
    );

  const capture = Math.max(0, parseInt(amount_cents, 10) || 0);
  if (capture <= 0)
    return NextResponse.json(
      { error: "amount_cents invalide" },
      { status: 400 }
    );

  // Stripe: deposit_payment_id = PaymentIntent ID (capture_method=manual)
  try {
    const pi = await stripe.paymentIntents.capture(order.deposit_payment_id, {
      amount_to_capture: capture,
    });

    const newCaptured = (order.deposit_captured_cents || 0) + capture;
    const status =
      newCaptured >= (order.deposit_required_cents || 0)
        ? "captured"
        : "partially_captured";

    await supabase
      .from("orders")
      .update({ deposit_status: status, deposit_captured_cents: newCaptured })
      .eq("id", order.id);

    await supabase.from("deposit_events").insert({
      order_id: order.id,
      event_type: "capture",
      amount_cents: capture,
      provider_id: pi.id,
      payload: pi,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    await supabase.from("deposit_events").insert({
      order_id: order.id,
      event_type: "fail",
      amount_cents: capture,
      provider_id: order.deposit_payment_id,
      payload: { message: e?.message || "Stripe capture error" },
    });
    return NextResponse.json(
      { error: e?.message || "Stripe capture error" },
      { status: 500 }
    );
  }
}

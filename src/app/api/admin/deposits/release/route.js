// app/api/admin/deposits/release/route.js
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

  const { order_id } = await req.json();
  if (!order_id)
    return NextResponse.json({ error: "order_id requis" }, { status: 400 });

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, deposit_status, deposit_payment_id, deposit_required_cents")
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

  try {
    const pi = await stripe.paymentIntents.cancel(order.deposit_payment_id, {
      cancellation_reason: "requested_by_customer",
    });

    await supabase
      .from("orders")
      .update({
        deposit_status: "released",
        deposit_released_cents: order.deposit_required_cents,
      })
      .eq("id", order.id);

    await supabase.from("deposit_events").insert({
      order_id: order.id,
      event_type: "release",
      amount_cents: order.deposit_required_cents,
      provider_id: pi.id,
      payload: pi,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    await supabase.from("deposit_events").insert({
      order_id: order.id,
      event_type: "fail",
      amount_cents: 0,
      provider_id: order.deposit_payment_id,
      payload: { message: e?.message || "Stripe release error" },
    });
    return NextResponse.json(
      { error: e?.message || "Stripe release error" },
      { status: 500 }
    );
  }
}

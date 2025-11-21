// app/api/stripe/webhook/route.js
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Service key server-side (sécurisé sur Vercel)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export const dynamic = "force-dynamic";

export async function POST(req) {
  const body = await req.text();
  const sig = headers().get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Utilise metadata.order_id sur le PaymentIntent ou sur le Charge
  const pi = event.data.object;

  const orderId =
    pi?.metadata?.order_id ||
    pi?.charges?.data?.[0]?.metadata?.order_id ||
    null;

  switch (event.type) {
    // L’autorisation est prête à être capturée
    case "payment_intent.amount_capturable_updated":
    case "payment_intent.requires_capture": {
      if (orderId) {
        await supabase
          .from("orders")
          .update({ deposit_status: "held" })
          .eq("id", orderId);
        await supabase.from("deposit_events").insert({
          order_id: orderId,
          event_type: "held",
          amount_cents: pi.amount_capturable || 0,
          provider_id: pi.id,
          payload: pi,
        });
      }
      break;
    }

    // Capture effectuée
    case "charge.captured": {
      const charge = event.data.object;
      const cap = charge.amount_captured || 0;
      if (orderId) {
        // récupère l'order pour additionner
        const { data: o } = await supabase
          .from("orders")
          .select("deposit_captured_cents, deposit_required_cents")
          .eq("id", orderId)
          .single();
        const newCaptured = (o?.deposit_captured_cents || 0) + cap;
        const status =
          newCaptured >= (o?.deposit_required_cents || 0)
            ? "captured"
            : "partially_captured";

        await supabase
          .from("orders")
          .update({
            deposit_status: status,
            deposit_captured_cents: newCaptured,
          })
          .eq("id", orderId);
        await supabase.from("deposit_events").insert({
          order_id: orderId,
          event_type: "capture",
          amount_cents: cap,
          provider_id: charge.payment_intent,
          payload: charge,
        });
      }
      break;
    }

    // Annulation/expiration d’autorisation (libération)
    case "payment_intent.canceled": {
      if (orderId) {
        await supabase
          .from("orders")
          .update({
            deposit_status: "released",
            deposit_released_cents: pi.amount || 0,
          })
          .eq("id", orderId);
        await supabase.from("deposit_events").insert({
          order_id: orderId,
          event_type: "release",
          amount_cents: pi.amount || 0,
          provider_id: pi.id,
          payload: pi,
        });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

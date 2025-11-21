export const dynamic = "force-dynamic";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { stripe } from "../../../lib/stripe";

export async function POST(req) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await req.json().catch(() => ({}));
  const order_id = body?.order_id;

  if (!order_id) {
    return new Response(JSON.stringify({ error: "order_id manquant" }), {
      status: 400,
    });
  }

  // Auth (client connecté – sinon rends cette route admin-only et utilise SRK)
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return new Response(JSON.stringify({ error: "Non authentifié" }), {
      status: 401,
    });
  }

  // Charge la commande
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select(
      "id, user_id, stripe_customer_id, deposit_required_cents, deposit_status, deposit_payment_id"
    )
    .eq("id", order_id)
    .single();

  if (orderErr || !order) {
    return new Response(
      JSON.stringify({ error: orderErr?.message || "Commande introuvable" }),
      { status: 404 }
    );
  }

  // Autorisation: propriétaire ou admin
  const isOwner = order.user_id === auth.user.id;
  const isAdmin = !!auth.user?.app_metadata?.is_admin;
  if (!isOwner && !isAdmin) {
    return new Response(JSON.stringify({ error: "Interdit" }), { status: 403 });
  }

  // Si aucune caution requise
  const deposit_required_cents = Number(order.deposit_required_cents || 0);
  if (deposit_required_cents <= 0) {
    await supabase
      .from("orders")
      .update({ deposit_status: "none" })
      .eq("id", order.id);
    return new Response(
      JSON.stringify({
        message: "Aucune caution requise.",
        amount_cents: 0,
        deposit_status: "none",
        deposit_payment_id: null,
      }),
      { status: 200 }
    );
  }

  // Besoin d’un Customer Stripe
  const customerId = order.stripe_customer_id;
  if (!customerId) {
    return new Response(
      JSON.stringify({
        error:
          "Aucun client Stripe associé à la commande (stripe_customer_id manquant).",
      }),
      { status: 400 }
    );
  }

  try {
    // Récupère un moyen de paiement réutilisable (carte) du customer
    const pms = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
      limit: 1,
    });

    const pm = pms.data?.[0];
    if (!pm) {
      return new Response(
        JSON.stringify({
          error: "Aucun moyen de paiement réutilisable trouvé pour ce client.",
          hint: "Le Checkout doit utiliser customer_creation:'always' et setup_future_usage:'off_session'.",
        }),
        { status: 400 }
      );
    }

    // Crée le PaymentIntent en mode empreinte et confirme-le
    const depositPI = await stripe.paymentIntents.create({
      amount: deposit_required_cents,
      currency: "eur",
      customer: customerId,
      payment_method: pm.id,
      capture_method: "manual",
      confirm: true,
      automatic_payment_methods: { enabled: false },
      metadata: {
        order_id: order.id,
        type: "deposit",
      },
    });

    await supabase
      .from("orders")
      .update({
        deposit_payment_id: depositPI.id,
        deposit_status:
          depositPI.status === "requires_capture" ? "held" : depositPI.status,
      })
      .eq("id", order.id);

    // Event log (optionnel)
    await supabase.from("deposit_events").insert({
      order_id: order.id,
      event_type: "hold_request",
      amount_cents: deposit_required_cents,
      provider_id: depositPI.id,
      payload: depositPI,
    });

    return new Response(
      JSON.stringify({
        message: "Caution placée",
        amount_cents: deposit_required_cents,
        deposit_status:
          depositPI.status === "requires_capture" ? "held" : depositPI.status,
        deposit_payment_id: depositPI.id,
      }),
      { status: 200 }
    );
  } catch (e) {
    await supabase.from("deposit_events").insert({
      order_id: order.id,
      event_type: "error",
      amount_cents: deposit_required_cents,
      error_message: e?.message || String(e),
    });

    return new Response(
      JSON.stringify({
        error: e?.message || "Erreur Stripe lors de la création de l’empreinte",
      }),
      { status: 400 }
    );
  }
}

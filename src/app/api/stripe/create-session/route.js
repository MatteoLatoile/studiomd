export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { stripe } from "@/app/lib/stripe";

/** nb de jours (inclusif) entre 2 dates ISO (YYYY-MM-DD) */
function daysInclusive(a, b) {
  const d1 = new Date(a + "T00:00:00");
  const d2 = new Date(b + "T00:00:00");
  const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

export async function POST(req) {
  const supabase = createRouteHandlerClient({ cookies });

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return new Response(JSON.stringify({ error: "Non authentifié" }), {
      status: 401,
    });

  // Données client & livraison (provenant de la page checkout)
  const body = await req.json().catch(() => ({}));
  const delivery = body?.delivery === "delivery" ? "delivery" : "pickup";
  const address =
    delivery === "delivery" && body?.address ? body.address : null;

  const customer_first_name = (body?.first_name || "").trim();
  const customer_last_name = (body?.last_name || "").trim();
  const customer_phone = (body?.phone || "").trim();
  const customer_email = user.email || (body?.email || "").trim() || undefined;

  // Récupération du panier (avec les plages de dates stockées par item)
  const { data: cart, error: cartErr } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      quantity,
      start_date,
      end_date,
      product:products(id, name, price, image_url)
    `
    )
    .eq("user_id", user.id);

  if (cartErr)
    return new Response(JSON.stringify({ error: cartErr.message }), {
      status: 400,
    });

  if (!cart || cart.length === 0)
    return new Response(JSON.stringify({ error: "Panier vide" }), {
      status: 400,
    });

  // Vérifier cohérence des dates (tous les items partagent le même créneau)
  const s0 = cart[0]?.start_date;
  const e0 = cart[0]?.end_date;
  if (!s0 || !e0) {
    return new Response(
      JSON.stringify({
        error:
          "Dates manquantes dans le panier. Reprends la sélection des dates.",
      }),
      { status: 400 }
    );
  }
  for (const it of cart) {
    if (it.start_date !== s0 || it.end_date !== e0) {
      return new Response(
        JSON.stringify({
          error:
            "Tous les articles doivent avoir le même créneau de réservation.",
        }),
        { status: 400 }
      );
    }
  }
  const startDate = s0;
  const endDate = e0;
  const days = daysInclusive(startDate, endDate);

  // Construit les line_items Stripe
  const line_items = cart.map((it) => ({
    quantity: (it.quantity || 1) * days,
    price_data: {
      currency: "eur",
      unit_amount: Math.round(Number(it?.product?.price || 0) * 100),
      product_data: {
        name: it?.product?.name || "Article",
        images: it?.product?.image_url ? [it.product.image_url] : undefined,
      },
    },
  }));

  const origin =
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  // Session Stripe
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items,
    allow_promotion_codes: true,
    success_url: `${origin}/panier/checkout/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/panier/checkout`,
    customer_email,
    metadata: {
      user_id: user.id,
      start_date: startDate,
      end_date: endDate,
      delivery,
      address_json: address ? JSON.stringify(address) : "{}",
      first_name: customer_first_name || "",
      last_name: customer_last_name || "",
      phone: customer_phone || "",
      email: customer_email || "",
    },
  });

  return new Response(JSON.stringify({ url: session.url }), { status: 200 });
}

import { stripe } from "@/app/lib/stripe";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

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
  if (!user) {
    return new Response(JSON.stringify({ error: "Non authentifié" }), {
      status: 401,
    });
  }

  const body = await req.json();
  const { startDate, endDate, delivery, address } = body || {};
  if (!startDate || !endDate) {
    return new Response(JSON.stringify({ error: "Dates manquantes" }), {
      status: 400,
    });
  }
  const days = daysInclusive(startDate, endDate);

  // Récupère le panier pour ce user
  const { data: cart, error: cartErr } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      quantity,
      product:products(id, name, price, image_url)
    `
    )
    .eq("user_id", user.id);

  if (cartErr) {
    return new Response(JSON.stringify({ error: cartErr.message }), {
      status: 400,
    });
  }
  if (!cart || cart.length === 0) {
    return new Response(JSON.stringify({ error: "Panier vide" }), {
      status: 400,
    });
  }

  // Construit les line_items (prix en cents, qty = quantité * nb de jours)
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

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items,
    allow_promotion_codes: true,
    success_url: `${origin}/panier/checkout/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/panier/checkout`,
    customer_email: user.email || undefined,
    metadata: {
      user_id: user.id,
      start_date: startDate,
      end_date: endDate,
      delivery: delivery || "pickup",
      address_json: address ? JSON.stringify(address) : "{}",
    },
  });

  return new Response(JSON.stringify({ url: session.url }), { status: 200 });
}

export const dynamic = "force-dynamic";

import { createHostedCheckout } from "@/app/lib/cawl";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/** nb de jours inclusifs entre 2 dates ISO (YYYY-MM-DD) */
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

  const body = await req.json().catch(() => ({}));

  const delivery = body?.delivery === "delivery" ? "delivery" : "pickup";
  const address = delivery === "delivery" ? body?.address || null : null;

  // Panier
  const { data: cart, error: cartErr } = await supabase
    .from("cart_items")
    .select(
      `
      id, quantity, start_date, end_date,
      product:products(id, name, price, image_url, category)
    `
    )
    .eq("user_id", user.id);

  if (cartErr) {
    return new Response(JSON.stringify({ error: cartErr.message }), {
      status: 400,
    });
  }
  if (!cart?.length) {
    return new Response(JSON.stringify({ error: "Panier vide" }), {
      status: 400,
    });
  }

  // Cohérence dates
  const s0 = cart[0].start_date,
    e0 = cart[0].end_date;
  if (!s0 || !e0) {
    return new Response(
      JSON.stringify({ error: "Dates manquantes dans le panier." }),
      { status: 400 }
    );
  }
  for (const it of cart) {
    if (it.start_date !== s0 || it.end_date !== e0) {
      return new Response(
        JSON.stringify({
          error: "Tous les articles doivent partager le même créneau.",
        }),
        { status: 400 }
      );
    }
  }

  // Totaux (mêmes règles que le front)
  const days = daysInclusive(s0, e0);
  const subtotal = cart.reduce((s, it) => {
    const unit = Number(it?.product?.price) || 0;
    return s + unit * days * (it.quantity || 0);
  }, 0);
  const tva = subtotal * 0.2;
  const total = subtotal + tva;
  const amountCents = Math.round(total * 100);

  const origin =
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const merchantReference = `RES-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`.toUpperCase();

  // 1) Crée la Hosted Checkout CAWL
  const payload = {
    hostedCheckoutSpecificInput: {
      returnUrl: `${origin}/panier/checkout/confirmation`,
      locale: process.env.CAWL_LOCALE || "fr_FR",
      showResultPage: false,
    },
    order: {
      amountOfMoney: { currencyCode: "EUR", amount: amountCents },
      references: { merchantReference },
      customer: {
        contactDetails: {
          emailAddress: user.email || body?.email || null,
          phoneNumber: body?.phone || null,
        },
        locale: process.env.CAWL_LOCALE || "fr_FR",
        billingAddress: address
          ? {
              street: address.line1 || "",
              additionalInfo: address.line2 || "",
              postalCode: address.postal_code || "",
              city: address.city || "",
              countryCode: "FR",
            }
          : undefined,
      },
      shipping:
        delivery === "delivery" && address
          ? {
              address: {
                street: address.line1 || "",
                additionalInfo: address.line2 || "",
                postalCode: address.postal_code || "",
                city: address.city || "",
                countryCode: "FR",
              },
            }
          : undefined,
    },
    cardPaymentMethodSpecificInput: {
      authorizationMode: "SALE", // capture immédiate
    },
  };

  try {
    const resp = await createHostedCheckout(payload);
    const hostedCheckoutId = resp?.hostedCheckoutId;
    const redirectUrl = resp?.redirectUrl;
    if (!hostedCheckoutId || !redirectUrl) {
      throw new Error("Réponse CAWL inattendue");
    }

    // 2) Crée/MAJ l'ordre en "pending" (idempotent via session_id unique)
    await supabase.from("orders").upsert(
      {
        user_id: user.id,
        session_id: hostedCheckoutId, // id de session CAWL
        merchant_reference: merchantReference,
        start_date: s0,
        end_date: e0,
        delivery,
        address,
        payment_method: "card",
        total_amount_cents: amountCents,
        status: "pending",
        customer_email: user.email || null,
        customer_first_name: body?.first_name || null,
        customer_last_name: body?.last_name || null,
        customer_phone: body?.phone || null,
      },
      { onConflict: "session_id" }
    );

    return new Response(JSON.stringify({ url: redirectUrl }), { status: 200 });
  } catch (e) {
    console.error("[CAWL create-session]", e.status, e.message, e.payload);
    return new Response(JSON.stringify({ error: e.message || "CAWL error" }), {
      status: 400,
    });
  }
}

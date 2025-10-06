export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function safeEqual(a, b) {
  const A = Buffer.from(a || "", "utf8");
  const B = Buffer.from(b || "", "utf8");
  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}

export async function POST(req) {
  // 1) Corps brut (pour signature)
  const raw = await req.text();

  // 2) Vérif signature (header exact à ajuster selon ton portail)
  const headerSig =
    req.headers.get("x-gcs-signature") ||
    req.headers.get("x-cawl-signature") ||
    req.headers.get("x-webhook-signature") ||
    "";

  const secret = process.env.CAWL_WEBHOOK_SECRET || process.env.CAWL_API_SECRET;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(raw, "utf8")
    .digest("base64");

  const verified = !!headerSig && safeEqual(headerSig, expected);
  if (!verified) {
    // On log quand même l’event (optionnel)
    try {
      await supabase.from("payment_events").insert({
        source: "cawl",
        event_type: "invalid_signature",
        payload: { raw },
        raw_signature: headerSig,
        verified: false,
      });
    } catch {}
    return new Response("invalid signature", { status: 401 });
  }

  // 3) Parse JSON
  let evt = null;
  try {
    evt = JSON.parse(raw);
  } catch {
    return new Response("bad json", { status: 400 });
  }

  // 4) Extraire infos clés
  const payment = evt?.payment || evt?.createdPaymentOutput?.payment || null;
  const statusCode = Number(payment?.statusOutput?.statusCode) || null;
  const paymentId = payment?.id || null;

  const refs =
    payment?.paymentOutput?.references || evt?.order?.references || {};
  const merchantReference =
    refs?.merchantReference || evt?.merchantReference || null;

  // 5) Mapper l'état
  let newStatus = null;
  if (statusCode === 9) newStatus = "paid"; // SALE captured
  else if (statusCode === 2) newStatus = "refused";
  else if (statusCode === 1) newStatus = "canceled";
  // Ajoute d’autres mappings si besoin (refund, chargeback…)

  // 6) Log event (optionnel)
  try {
    await supabase.from("payment_events").insert({
      source: "cawl",
      event_type: evt?.type || null,
      payment_id: paymentId,
      merchant_reference: merchantReference,
      payload: evt,
      raw_signature: headerSig || null,
      verified,
    });
  } catch {}

  // 7) Mettre à jour la commande (trouve par payment_id ou merchant_reference)
  if (newStatus) {
    if (paymentId) {
      const { data: got, error } = await supabase
        .from("orders")
        .update({ status: newStatus, payment_id: paymentId })
        .eq("payment_id", paymentId)
        .select();

      if (!got?.length || error) {
        await supabase
          .from("orders")
          .update({ status: newStatus, payment_id: paymentId })
          .eq("merchant_reference", merchantReference || "");
      }
    } else if (merchantReference) {
      await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("merchant_reference", merchantReference);
    }
  }

  // 8) Réponse rapide
  return new Response("ok", { status: 200 });
}

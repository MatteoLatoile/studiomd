export const dynamic = "force-dynamic";

import { getHostedCheckoutStatus } from "@/app/lib/cawl";

export async function GET() {
  // On demande volontairement le statut d’un hostedCheckout qui n’existe pas.
  // Si l’AUTH est OK ET l’accès au merchantId est bon => on obtient un 404 "UNKNOWN_HOSTED_CHECKOUT".
  // Sinon:
  //  - 403 ACCESS_TO_MERCHANT_NOT_ALLOWED => merchantId ↔ clé ne matchent pas (ou mauvais espace/env)
  //  - 401/UNAUTHORIZED/SIGNATURE => API key/secret incorrects (ou Content-Type/signature faux)
  const fakeId = "DOES-NOT-EXIST-" + Date.now();

  try {
    await getHostedCheckoutStatus(fakeId);
    // S’il répond "OK", ce serait surprenant; on renvoie un message neutre.
    return new Response(
      JSON.stringify({
        ok: true,
        note: "Réponse inattendue (aucune erreur renvoyée)",
      }),
      {
        status: 200,
        headers: { "content-type": "application/json; charset=utf-8" },
      }
    );
  } catch (e) {
    const msg = (e?.message || "").toString();
    const status = e?.status || 0;
    const payload = e?.payload || null;

    let diagnosis = "unknown";
    if (/UNKNOWN_HOSTED_CHECKOUT|NOT.*FOUND/i.test(msg) || status === 404) {
      diagnosis = "AUTH_OK_MERCHANT_OK"; // ✅ clés et merchantId matchent; l’ID n’existe juste pas (normal)
    } else if (/ACCESS_TO_MERCHANT_NOT_ALLOWED/i.test(msg) || status === 403) {
      diagnosis = "MERCHANT_NOT_ALLOWED"; // ❌ mauvais merchantId pour cette clé (ou mauvais environnement/app)
    } else if (
      /UNAUTHORIZED|NOT AUTHORIZED|SIGNATURE|HMAC/i.test(msg) ||
      status === 401
    ) {
      diagnosis = "AUTH_SIGNATURE_ERROR"; // ❌ clé/secret/signature incorrects
    }

    return new Response(
      JSON.stringify({ status, diagnosis, message: msg, payload }),
      {
        status: 200,
        headers: { "content-type": "application/json; charset=utf-8" },
      }
    );
  }
}

export const dynamic = "force-dynamic";
import { getHostedCheckoutStatus } from "@/app/lib/cawl";

export async function GET() {
  try {
    await getHostedCheckoutStatus("00000000-0000-0000-0000-000000000000");
    return Response.json(
      { ok: false, msg: "Réponse inattendue" },
      { status: 500 }
    );
  } catch (e) {
    const msg = e?.message || "";
    const status = e?.status || 500;

    if (/ACCESS_TO_MERCHANT_NOT_ALLOWED/i.test(msg))
      return Response.json(
        {
          ok: false,
          code: "ACCESS_TO_MERCHANT_NOT_ALLOWED",
          hint: "Key/Secret ≠ merchantId (ou mauvais environnement).",
        },
        { status }
      );

    if (/UNAUTHORIZED|NOT AUTHORIZED|SIGNATURE|HMAC|AUTHORIZATION/i.test(msg))
      return Response.json(
        {
          ok: false,
          code: "AUTH_SIGNATURE_ERROR",
          hint: "Signature HMAC/Date/Content-Type/resourcePath ou clés invalides.",
        },
        { status }
      );

    // "Unknown hosted checkout id" / "not found" => AUTH OK
    return Response.json(
      {
        ok: true,
        code: "AUTH_OK",
        hint: "Auth OK : merchantId + key + secret cohérents.",
      },
      { status: 200 }
    );
  }
}

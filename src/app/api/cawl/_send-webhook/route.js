export const dynamic = "force-dynamic";

import crypto from "crypto";

function hmac(secret, raw) {
  return crypto
    .createHmac("sha256", secret)
    .update(raw, "utf8")
    .digest("base64");
}

export async function POST() {
  const secret =
    process.env.CAWL_WEBHOOK_SECRET || process.env.CAWL_API_SECRET || "dev";
  const fake = {
    createdPaymentOutput: {
      payment: {
        id:
          "PAY-LOCAL-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
        statusOutput: { statusCode: 9, status: "CAPTURED" },
        paymentOutput: {
          amountOfMoney: { amount: 1234, currencyCode: "EUR" },
          references: { merchantReference: "RES-LOCAL-TEST" },
        },
      },
    },
  };
  const raw = JSON.stringify(fake);
  const sig = hmac(secret, raw);

  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    }/api/cawl/webhook`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-gcs-signature": sig,
      },
      body: raw,
    }
  );

  const txt = await res.text();
  return new Response(JSON.stringify({ status: res.status, body: txt }), {
    status: 200,
  });
}

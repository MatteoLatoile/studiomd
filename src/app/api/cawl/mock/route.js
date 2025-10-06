// src/app/api/cawl/mock/route.js
export const dynamic = "force-dynamic";

// On route POST /hostedcheckouts et GET /hostedcheckouts/{id} artificiellement.

export async function POST(req) {
  const url = new URL(req.url);
  if (!url.pathname.endsWith("/hostedcheckouts")) {
    return new Response("Not found", { status: 404 });
  }
  const hostedCheckoutId =
    "MOCK-HC-" + Math.random().toString(36).slice(2, 10).toUpperCase();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resp = {
    hostedCheckoutId,
    redirectUrl: `${origin}/panier/checkout/confirmation?hostedCheckoutId=${hostedCheckoutId}`,
  };
  return new Response(JSON.stringify(resp), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export async function GET(req) {
  const url = new URL(req.url);
  const m = url.pathname.match(/\/hostedcheckouts\/([^/]+)$/);
  if (!m) return new Response("Not found", { status: 404 });
  const id = m[1];
  const resp = {
    createdPaymentOutput: {
      payment: {
        id: "PAY-" + id,
        status: "CAPTURED",
        statusOutput: { statusCode: 9 },
        paymentOutput: {
          amountOfMoney: { amount: 1234, currencyCode: "EUR" },
          references: { merchantReference: "RES-MOCK-" + id.slice(-6) },
        },
      },
    },
  };
  return new Response(JSON.stringify(resp), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

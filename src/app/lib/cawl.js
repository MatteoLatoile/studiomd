// src/app/lib/cawl.js
import crypto from "crypto";

const ENV = process.env.CAWL_ENV || "preprod"; // "mock" | "preprod" | "live"

// Hôtes CAWL (ajuste au besoin si ton portail fournit un autre domaine)
const BASE_URLS = {
  mock: "http://localhost:3000/api/cawl/mock",
  preprod: "https://payment.preprod.cawl-solutions.fr",
  live: "https://payment.cawl-solutions.fr",
};

function cfg() {
  return {
    env: ENV,
    baseUrl: BASE_URLS[ENV] || BASE_URLS.preprod,
    merchantId: process.env.CAWL_MERCHANT_ID,
    apiKey: process.env.CAWL_API_KEY,
    apiSecret: process.env.CAWL_API_SECRET,
    locale: process.env.CAWL_LOCALE || "fr_FR",
  };
}

// Signature "GCS v1HMAC" — IMPORTANT: le Content-Type signé doit être EXACTEMENT celui envoyé
function sign({ method, contentType, date, resourcePath, apiSecret }) {
  const toHash = `${method.toUpperCase()}\n${
    contentType || ""
  }\n${date}\n${resourcePath}\n`;
  return crypto
    .createHmac("sha256", apiSecret)
    .update(toHash, "utf8")
    .digest("base64");
}

class CawlError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "CawlError";
    this.status = status;
    this.payload = payload;
  }
}

async function http({ method, path, body }) {
  const { baseUrl, merchantId, apiKey, apiSecret, env } = cfg();

  // --- MOCK local (sans HTTP externe) ---
  if (env === "mock") {
    // POST /v2/{merchantId}/hostedcheckouts
    if (method === "POST" && /\/hostedcheckouts$/.test(path)) {
      const hostedCheckoutId =
        "MOCK-HC-" + Math.random().toString(36).slice(2, 10).toUpperCase();
      const origin =
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      return {
        hostedCheckoutId,
        redirectUrl: `${origin}/panier/checkout/confirmation?hostedCheckoutId=${hostedCheckoutId}`,
      };
    }
    // GET /v2/{merchantId}/hostedcheckouts/{id}
    if (method === "GET" && /\/hostedcheckouts\//.test(path)) {
      const id = path.split("/hostedcheckouts/")[1];
      return {
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
    }
  }

  // --- Appel réel ---
  const url = `${baseUrl}${path}`;
  const date = new Date().toUTCString();

  const isPost = method.toUpperCase() === "POST";
  const contentType = isPost ? "application/json" : ""; // ⚠️ garde simple & EXACT
  const signature = sign({
    method,
    contentType,
    date,
    resourcePath: path,
    apiSecret,
  });

  const headers = {
    Date: date,
    Authorization: `GCS v1HMAC:${apiKey}:${signature}`,
  };
  if (isPost) headers["Content-Type"] = contentType;

  const res = await fetch(url, {
    method,
    headers,
    body: isPost ? JSON.stringify(body || {}) : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* keep raw text */
  }

  if (!res.ok) {
    const apiMsg =
      json?.errors?.[0]?.message ||
      json?.message ||
      json?.error ||
      text ||
      `HTTP ${res.status}`;
    // Log côté serveur (sans secrets)
    console.error("[CAWL HTTP ERROR]", {
      status: res.status,
      method,
      url,
      env,
      merchantId,
      payload: json || text,
    });
    throw new CawlError(apiMsg, res.status, json || text);
  }

  // Log succès minimal (optionnel)
  if (process.env.NODE_ENV !== "production") {
    console.log("[CAWL OK]", { method, path, env });
  }

  return json;
}

export async function createHostedCheckout(payload) {
  const { merchantId } = cfg();
  if (!merchantId) throw new CawlError("CAWL_MERCHANT_ID manquant", 500);
  return http({
    method: "POST",
    path: `/v2/${encodeURIComponent(merchantId)}/hostedcheckouts`,
    body: payload,
  });
}

export async function getHostedCheckoutStatus(hostedCheckoutId) {
  const { merchantId } = cfg();
  if (!merchantId) throw new CawlError("CAWL_MERCHANT_ID manquant", 500);
  return http({
    method: "GET",
    path: `/v2/${encodeURIComponent(
      merchantId
    )}/hostedcheckouts/${encodeURIComponent(hostedCheckoutId)}`,
  });
}

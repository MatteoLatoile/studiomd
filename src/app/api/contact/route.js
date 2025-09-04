import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

/**
 * POST /api/contact
 * Body JSON: { name, email, phone?, subject?, message, consent }
 */
export async function POST(req) {
  const supabase = createRouteHandlerClient({ cookies });

  // lire & valider le JSON
  let payload = {};
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps JSON invalide" }), {
      status: 400,
    });
  }

  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim();
  const phone = payload.phone ? String(payload.phone).trim() : null;
  const subject = payload.subject ? String(payload.subject).trim() : null;
  const message = String(payload.message || "").trim();
  const consent = Boolean(payload.consent);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !emailOk || !message || !consent) {
    return new Response(JSON.stringify({ error: "Champs invalides" }), {
      status: 400,
    });
  }

  // insertion (role public autorisé par ta policy)
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    phone,
    subject,
    message,
    consent,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 201 });
}

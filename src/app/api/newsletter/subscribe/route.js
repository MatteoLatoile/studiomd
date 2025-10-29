// app/api/newsletter/subscribe/route.js
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export async function POST(req) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { email } = await req.json().catch(() => ({}));
    const clean = String(email || "")
      .trim()
      .toLowerCase();

    if (!isValidEmail(clean)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    // upsert-like: si déjà présent, on ne double pas
    const { data: existing, error: exErr } = await supabase
      .from("subscribers")
      .select("id")
      .eq("email", clean)
      .maybeSingle();
    if (exErr) throw exErr;

    if (existing) {
      return NextResponse.json(
        { ok: true, message: "Déjà inscrit" },
        { status: 200 }
      );
    }

    const { data, error } = await supabase
      .from("subscribers")
      .insert({ email: clean })
      .select("id, email, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json(
      { ok: true, data, message: "Merci pour votre inscription !" },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

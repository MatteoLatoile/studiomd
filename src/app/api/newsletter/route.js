import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    // vérifie si l’email existe déjà
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { message: "Déjà abonné(e) ❤️" },
        { status: 200 }
      );
    }

    const { error } = await supabase.from("subscribers").insert([{ email }]);

    if (error) throw error;

    return NextResponse.json(
      { message: "Merci ! Vous êtes abonné(e) 🎉" },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

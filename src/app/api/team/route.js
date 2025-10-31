// GET (liste) / POST (créer avec upload avatar)
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

function sanitizeFilename(name = "") {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "_")
    .slice(0, 80);
}

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase
    .from("team_members")
    .select(
      "id, first_name, last_name, role, avatar_url, avatar_path, created_at"
    )
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 200 });
}

export async function POST(req) {
  const supabase = createRouteHandlerClient({ cookies });

  // auth + admin
  const { data: session } = await supabase.auth.getUser();
  const user = session?.user || null;
  if (!user)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!user.app_metadata?.is_admin)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  try {
    const form = await req.formData();
    const first_name = String(form.get("first_name") || "").trim();
    const last_name = String(form.get("last_name") || "").trim();
    const role = String(form.get("role") || "").trim();
    const avatarFile = form.get("avatar");

    if (!first_name || !last_name || !role) {
      return NextResponse.json(
        { error: "Champs requis manquants" },
        { status: 400 }
      );
    }

    let avatar_url = null;
    let avatar_path = null;

    if (avatarFile && avatarFile.name) {
      const bucket = "team";
      const ext = avatarFile.name.split(".").pop() || "jpg";
      const base = sanitizeFilename(`${first_name}-${last_name}`);
      const filename = `${Date.now()}_${base}.${ext}`;
      const path = `avatars/${filename}`;

      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, avatarFile, {
          upsert: false,
          cacheControl: "3600",
          contentType: avatarFile.type || "image/jpeg",
        });

      if (upErr) {
        return NextResponse.json(
          { error: `Échec upload avatar: ${upErr.message}` },
          { status: 500 }
        );
      }

      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      avatar_url = pub?.publicUrl || null;
      avatar_path = `${bucket}/${path}`;
    }

    const { data, error } = await supabase
      .from("team_members")
      .insert({ first_name, last_name, role, avatar_url, avatar_path })
      .select(
        "id, first_name, last_name, role, avatar_url, avatar_path, created_at"
      )
      .single();

    if (error) {
      // rollback image si besoin
      if (avatar_path) {
        const toRemove = avatar_path.replace("team/", "");
        await supabase.storage
          .from("team")
          .remove([toRemove])
          .catch(() => {});
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

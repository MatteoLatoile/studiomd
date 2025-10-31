// DELETE (supprimer membre + avatar)
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE(_req, { params }) {
  const supabase = createRouteHandlerClient({ cookies });

  // auth + admin
  const { data: session } = await supabase.auth.getUser();
  const user = session?.user || null;
  if (!user)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!user.app_metadata?.is_admin)
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const id = params?.id;
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  // On récupère d’abord l’avatar_path pour supprimer le fichier storage après
  const { data: current, error: curErr } = await supabase
    .from("team_members")
    .select("avatar_path")
    .eq("id", id)
    .single();

  if (curErr) {
    return NextResponse.json(
      { error: curErr.message || "Membre introuvable" },
      { status: 404 }
    );
  }

  const { error: delErr } = await supabase
    .from("team_members")
    .delete()
    .eq("id", id);
  if (delErr)
    return NextResponse.json({ error: delErr.message }, { status: 500 });

  // suppression storage (best effort)
  if (current?.avatar_path) {
    const toRemove = current.avatar_path.replace("team/", "");
    await supabase.storage
      .from("team")
      .remove([toRemove])
      .catch(() => {});
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

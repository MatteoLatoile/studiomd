import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function DELETE(_req, { params }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { id } = params || {};

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return new Response(JSON.stringify({ error: "Non authentifié" }), {
      status: 401,
    });
  }
  if (!user.app_metadata?.is_admin) {
    return new Response(JSON.stringify({ error: "Interdit" }), { status: 403 });
  }
  if (!id) {
    return new Response(JSON.stringify({ error: "id manquant" }), {
      status: 400,
    });
  }

  // Supprime d’abord les items (si cascade non définie)
  const { error: delItemsErr } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", id);
  if (delItemsErr) {
    return new Response(JSON.stringify({ error: delItemsErr.message }), {
      status: 400,
    });
  }

  // Puis la commande
  const { error: delOrderErr } = await supabase
    .from("orders")
    .delete()
    .eq("id", id);
  if (delOrderErr) {
    return new Response(JSON.stringify({ error: delOrderErr.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}

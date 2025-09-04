import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function DELETE(_req, { params }) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Non authentifié" }), {
      status: 401,
    });
  }
  if (!user.app_metadata?.is_admin) {
    return new Response(JSON.stringify({ error: "Non autorisé" }), {
      status: 403,
    });
  }

  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", params.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}

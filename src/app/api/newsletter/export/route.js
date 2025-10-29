// app/api/newsletter/export/route.js
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function toCSV(rows) {
  const header = ["id", "email", "created_at"];
  const lines = [header.join(",")];
  for (const r of rows) {
    const id = `"${(r.id || "").replace(/"/g, '""')}"`;
    const email = `"${(r.email || "").replace(/"/g, '""')}"`;
    const created = `"${(r.created_at || "").replace(/"/g, '""')}"`;
    lines.push([id, email, created].join(","));
  }
  return lines.join("\n");
}

export async function GET(req) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Non authentifié", { status: 401 });
  if (!user.app_metadata?.is_admin)
    return new Response("Accès refusé", { status: 403 });

  // (optionnel) recherche
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  let query = supabase
    .from("subscribers")
    .select("id, email, created_at")
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("email", `%${q}%`);

  const { data, error } = await query;
  if (error) return new Response(error.message, { status: 500 });

  const csv = toCSV(data || []);
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

// app/api/newsletter/list/route.js
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const supabase = createRouteHandlerClient({ cookies });

  // Auth admin
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!user.app_metadata?.is_admin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    200,
    Math.max(1, parseInt(searchParams.get("pageSize") || "50", 10))
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("subscribers")
    .select("id, email, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    // filtrage côté serveur : email ilike %q%
    query = query.ilike("email", `%${q}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { data, page, pageSize, total: count || 0 },
    { status: 200 }
  );
}

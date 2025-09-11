// app/api/products/route.js
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const supabase = createRouteHandlerClient({ cookies });

  // Auth + admin
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

  const form = await req.formData();
  const name = (form.get("name") || "").toString().trim();
  const description = (form.get("description") || "").toString().trim();
  const price = Number(form.get("price"));
  const category = (form.get("category") || "").toString().trim();
  const stockRaw = form.get("stock");
  const stock = Math.max(
    1,
    parseInt(stockRaw != null ? String(stockRaw) : "1", 10)
  );
  const file = form.get("image");

  if (!name || !description || !category || Number.isNaN(price)) {
    return new Response(
      JSON.stringify({ error: "Champs manquants ou invalides" }),
      {
        status: 400,
      }
    );
  }
  if (!(file instanceof File) || file.size === 0) {
    return new Response(JSON.stringify({ error: "Image requise" }), {
      status: 400,
    });
  }

  // Chemin Storage (bucket 'products', comme ton implémentation existante)
  const ext = (file.name?.split(".").pop() || "jpg").toLowerCase();
  const safeName = (file.name || "image.jpg").replace(/[^\w.-]/g, "_");
  const image_path = `uploads/${crypto.randomUUID()}-${safeName}`;

  const buf = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage
    .from("products")
    .upload(image_path, buf, {
      contentType: file.type || `image/${ext}`,
      cacheControl: "3600",
      upsert: false,
    });

  if (upErr) {
    return new Response(
      JSON.stringify({ error: `Upload échoué: ${upErr.message}` }),
      {
        status: 400,
      }
    );
  }

  const { data: pub } = supabase.storage
    .from("products")
    .getPublicUrl(image_path);
  const image_url = pub.publicUrl;

  const { data: inserted, error: insErr } = await supabase
    .from("products")
    .insert({
      name,
      description,
      price,
      category,
      image_url,
      image_path,
      stock,
    })
    .select()
    .single();

  if (insErr) {
    // rollback storage
    await supabase.storage.from("products").remove([image_path]);
    return new Response(
      JSON.stringify({ error: `Insert échoué: ${insErr.message}` }),
      {
        status: 400,
      }
    );
  }

  return new Response(JSON.stringify({ data: inserted }), { status: 201 });
}

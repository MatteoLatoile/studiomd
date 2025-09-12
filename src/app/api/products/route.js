// app/api/products/route.js
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Utils
function safeNumber(v, def = 0) {
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : def;
}
function sanitizeFilename(name = "") {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "_")
    .slice(0, 80);
}
function parseTags(raw) {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .map((t) => String(t).trim())
      .filter(Boolean)
      .slice(0, 50);
  } catch {
    return [];
  }
}

// (optionnel) GET: pratique pour tester vite fait en local
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, description, price, category, stock, tags, image_url, image_path"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data }, { status: 200 });
}

export async function POST(req) {
  const supabase = createRouteHandlerClient({ cookies });

  // Auth (admin uniquement si tu as ce flag)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (!user.app_metadata?.is_admin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const form = await req.formData();

    // Champs de base
    const name = String(form.get("name") || "").trim();
    const description = String(form.get("description") || "").trim();
    const price = safeNumber(form.get("price"), 0);
    const category = String(form.get("category") || "").trim();

    // Stock >= 0
    const stock = Math.max(
      0,
      parseInt(String(form.get("stock") ?? "0"), 10) || 0
    );

    // Tags
    const tags = parseTags(form.get("tags"));

    // Fichier image
    const imageFile = form.get("image");
    if (!(imageFile && imageFile.name)) {
      return NextResponse.json({ error: "Image requise" }, { status: 400 });
    }

    // Upload Storage
    const bucket = "products";
    const ext = imageFile.name.split(".").pop() || "jpg";
    const base = sanitizeFilename(
      name || imageFile.name.replace(/\.[^.]+$/, "")
    );
    const filename = `${Date.now()}_${base}.${ext}`;
    const path = `uploads/${filename}`;

    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, imageFile, {
        upsert: false,
        cacheControl: "3600",
        contentType: imageFile.type || "image/jpeg",
      });

    if (upErr) {
      return NextResponse.json(
        { error: `Échec upload image: ${upErr.message}` },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    // Insert DB
    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        description,
        price,
        category,
        stock,
        tags, // text[] ou jsonb selon ton schéma
        image_url: publicUrl,
        image_path: `${bucket}/${path}`,
      })
      .select(
        "id, name, description, price, category, stock, tags, image_url, image_path"
      )
      .single();

    if (error) {
      // rollback image (optionnel)
      await supabase.storage
        .from(bucket)
        .remove([path])
        .catch(() => {});
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

// app/api/products/[id]/route.js
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

export async function PUT(req, { params }) {
  const supabase = createRouteHandlerClient({ cookies });

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (!user.app_metadata?.is_admin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const id = params?.id;
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  try {
    // lire le produit existant (pour connaître l’ancienne image)
    const { data: current, error: curErr } = await supabase
      .from("products")
      .select("id, image_path, image_url")
      .eq("id", id)
      .single();
    if (curErr || !current) {
      return NextResponse.json(
        { error: curErr?.message || "Produit introuvable" },
        { status: 404 }
      );
    }

    const form = await req.formData();
    const update = {};

    const name = form.get("name");
    if (name !== null) update.name = String(name).trim();

    const description = form.get("description");
    if (description !== null) update.description = String(description).trim();

    const price = form.get("price");
    if (price !== null) update.price = safeNumber(price, 0);

    const category = form.get("category");
    if (category !== null) update.category = String(category).trim();

    // ✅ bloc STOCK (celui que tu as demandé)
    const rawStock = form.get("stock");
    if (rawStock !== null) {
      const s = String(rawStock).trim();
      if (s !== "") {
        const n = parseInt(s, 10);
        if (!Number.isNaN(n)) update.stock = Math.max(0, n);
      }
    }

    // Tags
    const tags = parseTags(form.get("tags"));
    if (tags) update.tags = tags;

    // si une nouvelle image est fournie → upload + nettoyer l’ancienne
    const imageFile = form.get("image");
    if (imageFile && imageFile.name) {
      const bucket = "products";
      const ext = imageFile.name.split(".").pop() || "jpg";
      const base = sanitizeFilename(
        update.name || current.image_path?.split("/").pop() || "image"
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

      update.image_url = publicUrl;
      update.image_path = `${bucket}/${path}`;

      // supprimer l’ancienne image si on en avait une
      if (current.image_path) {
        const toRemove = current.image_path.replace(`${bucket}/`, "");
        await supabase.storage
          .from(bucket)
          .remove([toRemove])
          .catch(() => {});
      }
    }

    const { data, error } = await supabase
      .from("products")
      .update(update)
      .eq("id", id)
      .select(
        "id, name, description, price, category, stock, tags, image_url, image_path"
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req, { params }) {
  const supabase = createRouteHandlerClient({ cookies });

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (!user.app_metadata?.is_admin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const id = params?.id;
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  try {
    // OPTION B : restreindre la suppression si le produit est référencé
    const { data: refs, error: refsErr } = await supabase
      .from("order_items")
      .select("id", { count: "exact", head: true })
      .eq("product_id", id);

    if (refsErr) {
      return NextResponse.json({ error: refsErr.message }, { status: 500 });
    }
    if ((refs?.length ?? 0) > 0) {
      return NextResponse.json(
        {
          error:
            "Suppression impossible : ce produit est présent dans au moins une commande.",
        },
        { status: 409 }
      );
    }

    // récupérer le chemin image pour la supprimer après
    const { data: current, error: curErr } = await supabase
      .from("products")
      .select("image_path")
      .eq("id", id)
      .single();
    if (curErr) {
      return NextResponse.json(
        { error: curErr.message || "Produit introuvable" },
        { status: 404 }
      );
    }

    // suppression DB
    const { error: delErr } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    // suppression image (best effort)
    if (current?.image_path) {
      const bucket = "products";
      const toRemove = current.image_path.replace(`${bucket}/`, "");
      await supabase.storage
        .from(bucket)
        .remove([toRemove])
        .catch(() => {});
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

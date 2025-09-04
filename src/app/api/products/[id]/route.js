import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function PUT(req, { params }) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return new Response(JSON.stringify({ error: "Non authentifié" }), {
      status: 401,
    });
  if (!user.app_metadata?.is_admin)
    return new Response(JSON.stringify({ error: "Non autorisé" }), {
      status: 403,
    });

  const id = params.id;

  // récupérer l'existant (pour old image_path)
  const { data: current, error: curErr } = await supabase
    .from("products")
    .select("id, name, description, price, category, image_url, image_path")
    .eq("id", id)
    .single();

  if (curErr || !current) {
    return new Response(JSON.stringify({ error: "Produit introuvable" }), {
      status: 404,
    });
  }

  const form = await req.formData();
  const name = (form.get("name") || current.name).toString().trim();
  const description = (form.get("description") || current.description)
    .toString()
    .trim();
  const price =
    form.get("price") != null
      ? Number(form.get("price"))
      : Number(current.price);
  const category = (form.get("category") || current.category).toString().trim();
  const file = form.get("image"); // optionnel

  if (!name || !description || !category || Number.isNaN(price)) {
    return new Response(JSON.stringify({ error: "Champs invalides" }), {
      status: 400,
    });
  }

  let nextImagePath = current.image_path;
  let nextImageUrl = current.image_url;
  let uploadedNew = false;

  // si une nouvelle image a été fournie
  if (file instanceof File && file.size > 0) {
    const safeName = (file.name || "image.jpg").replace(/[^\w.-]/g, "_");
    const ext = (safeName.split(".").pop() || "jpg").toLowerCase();
    nextImagePath = `uploads/${crypto.randomUUID()}-${safeName}`;
    const buf = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await supabase.storage
      .from("products")
      .upload(nextImagePath, buf, {
        contentType: file.type || `image/${ext}`,
        cacheControl: "3600",
        upsert: false,
      });

    if (upErr) {
      return new Response(
        JSON.stringify({ error: `Upload échoué: ${upErr.message}` }),
        { status: 400 }
      );
    }

    const { data: pub } = supabase.storage
      .from("products")
      .getPublicUrl(nextImagePath);
    nextImageUrl = pub.publicUrl;
    uploadedNew = true;
  }

  // update DB
  const { data: updated, error: updErr } = await supabase
    .from("products")
    .update({
      name,
      description,
      price,
      category,
      image_url: nextImageUrl,
      image_path: nextImagePath,
    })
    .eq("id", id)
    .select()
    .single();

  if (updErr) {
    // rollback si on avait uploadé une nouvelle image
    if (uploadedNew) {
      await supabase.storage.from("products").remove([nextImagePath]);
    }
    return new Response(
      JSON.stringify({ error: `Update échoué: ${updErr.message}` }),
      { status: 400 }
    );
  }

  // si nouvelle image ok → supprimer l’ancienne
  if (
    uploadedNew &&
    current.image_path &&
    current.image_path !== nextImagePath
  ) {
    await supabase.storage.from("products").remove([current.image_path]);
  }

  return new Response(JSON.stringify({ data: updated }), { status: 200 });
}

export async function DELETE(req, { params }) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return new Response(JSON.stringify({ error: "Non authentifié" }), {
      status: 401,
    });
  if (!user.app_metadata?.is_admin)
    return new Response(JSON.stringify({ error: "Non autorisé" }), {
      status: 403,
    });

  const { data: product, error: getErr } = await supabase
    .from("products")
    .select("id, image_path")
    .eq("id", params.id)
    .single();

  if (getErr || !product) {
    return new Response(JSON.stringify({ error: "Produit introuvable" }), {
      status: 404,
    });
  }

  if (product.image_path) {
    await supabase.storage.from("products").remove([product.image_path]);
  }

  const { error: delErr } = await supabase
    .from("products")
    .delete()
    .eq("id", params.id);
  if (delErr)
    return new Response(JSON.stringify({ error: delErr.message }), {
      status: 400,
    });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

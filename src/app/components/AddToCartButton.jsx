"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiCheck, FiShoppingCart } from "react-icons/fi";
import { supabase } from "../lib/supabase";

export default function AddToCartButton({ productId }) {
  const [adding, setAdding] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleAdd() {
    setAdding(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      // pas connecté → redirige vers la connexion
      window.location.href = "/connexion?next=/services/location";
      return;
    }

    // existe déjà ?
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single();

    if (existing) {
      await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + 1 })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("cart_items")
        .insert({ user_id: user.id, product_id: productId, quantity: 1 });
    }

    setAdding(false);
    setDone(true);
    setTimeout(() => setDone(false), 1200);

    // optionnel : rafraîchir un badge panier dans un header, etc.
    try {
      router.refresh();
    } catch {}
  }

  return (
    <button
      onClick={handleAdd}
      disabled={adding}
      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-noir shadow-md text-sm hover:opacity-90 transition cursor-pointer"
      style={{ background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)" }}
      aria-label="Ajouter au panier"
    >
      {done ? (
        <>
          Ajouté <FiCheck />
        </>
      ) : adding ? (
        <>
          Ajout... <span className="animate-pulse">•</span>
        </>
      ) : (
        <>
          Ajouter <FiShoppingCart />
        </>
      )}
    </button>
  );
}

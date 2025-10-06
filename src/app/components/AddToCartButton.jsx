// app/components/AddToCartButton.jsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiCheck, FiShoppingCart } from "react-icons/fi";
import { supabase } from "../lib/supabase";
import DateRangeModal from "./DateRangeModal";

export default function AddToCartButton({ productId }) {
  const [adding, setAdding] = useState(false);
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function proceedAdd({ start, end }) {
    setAdding(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/connexion?next=/location";
      return;
    }

    // upsert par (user, product, start, end)
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .eq("start_date", start)
      .eq("end_date", end)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("cart_items")
        .update({ quantity: (existing.quantity || 1) + 1 })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: productId,
        quantity: 1,
        start_date: start,
        end_date: end,
      });
    }

    setAdding(false);
    setDone(true);
    setTimeout(() => setDone(false), 1200);
    try {
      router.refresh();
    } catch {}
    try {
      window.dispatchEvent(new Event("cart:changed"));
    } catch {}
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={adding}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-black shadow-md text-sm hover:opacity-90 transition cursor-pointer"
        style={{
          background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
        }}
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

      <DateRangeModal
        open={open}
        onClose={() => setOpen(false)}
        productId={productId}
        onConfirm={async ({ start, end }) => {
          // Dernière vérif serveur “pare-balle”
          const { data, error } = await supabase.rpc("product_is_available", {
            p_product: productId,
            p_start: start,
            p_end: end,
          });
          if (error || !data) return; // indispo => rien faire (la modal montre déjà l’état)
          await proceedAdd({ start, end });
          setOpen(false);
        }}
      />
    </>
  );
}

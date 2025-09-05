"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiFileText,
  FiMinus,
  FiPlus,
  FiShield,
  FiTrash2,
} from "react-icons/fi";
import { supabase } from "../lib/supabase";

function euro(n) {
  const v = Number(n || 0);
  return v.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default function PanierPage() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]); // {id, quantity, product:{ id,name,price,image_url,category }}
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user || null);

      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("cart_items")
        .select(
          `
          id,
          quantity,
          product:products(
            id, name, price, image_url, category
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;
      if (error) {
        console.error(error);
        setItems([]);
      } else {
        setItems(data || []);
      }
      setLoading(false);
    }

    load();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      setUser(session?.user || null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (s, it) => s + (Number(it?.product?.price) || 0) * it.quantity,
        0
      ),
    [items]
  );
  const tva = subtotal * 0.2;
  const total = subtotal + tva;

  async function updateQty(id, next) {
    if (next <= 0) return removeItem(id);
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: next })
      .eq("id", id);
    if (!error)
      setItems((prev) =>
        prev.map((x) => (x.id === id ? { ...x, quantity: next } : x))
      );
  }

  async function removeItem(id) {
    const { error } = await supabase.from("cart_items").delete().eq("id", id);
    if (!error) setItems((prev) => prev.filter((x) => x.id !== id));
  }

  if (loading) {
    return (
      <main className="bg-[#FFF5D7] min-h-screen py-30 px-4 md:px-8">
        <h1 className="text-3xl font-bold text-noir">Mon panier</h1>
        <div className="mt-6 grid md:grid-cols-[1fr_360px] gap-6">
          <div className="rounded-2xl bg-white/60 animate-pulse h-64" />
          <div className="rounded-2xl bg-white/60 animate-pulse h-64" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="bg-[#FFF5D7] min-h-screen py-30 px-4 md:px-8">
        <h1 className="text-3xl font-bold text-noir">Mon panier</h1>
        <div className="mt-6 rounded-2xl bg-[#ffffffb3] ring-1 ring-black/5 p-6 max-w-xl">
          <p className="text-noir">
            Connecte-toi pour voir et retrouver ton panier.
          </p>
          <Link
            href="/connexion?next=/panier"
            className="inline-flex mt-4 items-center rounded-2xl px-6 py-3 text-sm font-semibold text-noir shadow hover:opacity-90 transition"
            style={{
              background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
            }}
          >
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#FFF5D7] min-h-screen py-30 px-4 md:px-8">
      <h1 className="text-3xl font-bold text-noir">Mon panier</h1>

      <div className="mt-6 grid md:grid-cols-[1fr_360px] gap-6">
        {/* Liste des items */}
        <section className="rounded-2xl bg-[#ffffffb3] ring-1 ring-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 sm:p-5">
          {items.length === 0 ? (
            <EmptyCart />
          ) : (
            <ul className="space-y-4">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="grid grid-cols-[84px_1fr_auto] gap-3 sm:gap-4 items-center rounded-xl bg-white p-3 ring-1 ring-black/5"
                >
                  <div className="h-20 w-20 rounded-lg overflow-hidden ring-1 ring-black/10 bg-white">
                    {it.product?.image_url ? (
                      <img
                        src={it.product.image_url}
                        alt={it.product.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-100" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-noir truncate">
                      {it.product?.name || "—"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {it.product?.category || "—"}
                    </p>
                    <p className="text-sm text-noir mt-1">
                      {Number(it?.product?.price).toFixed(2)}€{" "}
                      <span className="text-[#FFB700]">/jour</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* stepper quantité */}
                    <div className="inline-flex items-center rounded-full ring-1 ring-black/10 overflow-hidden bg-white">
                      <button
                        className="px-2 py-1 hover:bg-black/5 cursor-pointer"
                        onClick={() => updateQty(it.id, it.quantity - 1)}
                        aria-label="Diminuer la quantité"
                      >
                        <FiMinus />
                      </button>
                      <span className="px-3 select-none text-sm">
                        {it.quantity}
                      </span>
                      <button
                        className="px-2 py-1 hover:bg-black/5 cursor-pointer"
                        onClick={() => updateQty(it.id, it.quantity + 1)}
                        aria-label="Augmenter la quantité"
                      >
                        <FiPlus />
                      </button>
                    </div>

                    {/* supprimer */}
                    <button
                      className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-[#FFF3C4] text-black ring-1 ring-[#FFD978] hover:bg-[#FFE48A] cursor-pointer"
                      onClick={() => removeItem(it.id)}
                      aria-label="Retirer du panier"
                      title="Retirer"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5">
            <Link
              href="/services/location"
              className="inline-flex items-center rounded-2xl px-6 py-3 text-sm font-semibold text-noir shadow hover:opacity-90 transition"
              style={{
                background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
              }}
            >
              Continuer mes achats
            </Link>
          </div>
        </section>

        {/* Récapitulatif */}
        <aside className="rounded-2xl bg-[#ffffffb3] ring-1 ring-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 sm:p-6 h-fit">
          <h2 className="text-lg font-semibold text-noir">
            Résumé de la commande
          </h2>

          <div className="mt-4 space-y-2 text-sm">
            <Row label="Subtotal" value={euro(subtotal)} />
            <Row label="TVA 20%" value={euro(tva)} />
            <div className="h-[1px] bg-black/10 my-3" />
            <Row label="Total TTC" value={euro(total)} strong />
          </div>

          <button
            disabled={items.length === 0}
            className="mt-5 w-full rounded-xl px-5 py-3 font-semibold text-noir shadow disabled:opacity-60"
            style={{
              background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
            }}
          >
            Procéder à la réservation
          </button>

          <ul className="mt-5 space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <FiShield /> Paiement sécurisé
            </li>
            <li className="flex items-center gap-2">
              <FiFileText /> Contrat clair
            </li>
            <li className="flex items-center gap-2">
              <FiCheckCircle /> Support 24/7
            </li>
          </ul>
        </aside>
      </div>
    </main>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? "font-semibold" : ""}>{label}</span>
      <span className={strong ? "font-semibold" : "text-noir"}>{value}</span>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="rounded-xl bg-white ring-1 ring-black/5 p-6 text-center">
      <p className="text-noir">Votre panier est vide.</p>
      <Link
        href="/services/location"
        className="inline-flex mt-4 items-center rounded-2xl px-6 py-3 text-sm font-semibold text-noir shadow hover:opacity-90 transition"
        style={{
          background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
        }}
      >
        Découvrir nos équipements
      </Link>
    </div>
  );
}

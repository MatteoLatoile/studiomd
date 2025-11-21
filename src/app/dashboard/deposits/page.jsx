// app/dashboard/deposits/page.jsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function DepositsPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    let query = supabase
      .from("orders")
      .select(
        "id,customer_email,created_at,deposit_status,deposit_required_cents,deposit_captured_cents,deposit_payment_id"
      )
      .neq("deposit_status", "none")
      .order("created_at", { ascending: false })
      .limit(100);
    if (q) query = query.ilike("customer_email", `%${q}%`);
    const { data, error } = await query;
    setItems(error ? [] : data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []); // eslint-disable-line

  return (
    <main className="min-h-screen bg-[#0A0A0D] text-white">
      <div className="mx-auto max-w-7xl px-4 md:px-8 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Cautions — toutes</h1>
            <p className="text-white/60 text-sm">Filtre par email client</p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15"
          >
            ← Dashboard
          </Link>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="flex gap-2 mb-4"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Email client…"
            className="flex-1 rounded-xl bg-[#0B0B10] border border-white/10 px-4 py-3 text-white outline-none"
          />
          <button
            className="rounded-xl px-4 py-3 text-sm font-semibold text-black shadow"
            style={{
              background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
            }}
          >
            Rechercher
          </button>
        </form>

        <div className="rounded-2xl overflow-hidden ring-1 ring-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr className="text-left">
                <th className="px-4 py-3">Commande</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Exigée</th>
                <th className="px-4 py-3">Capturée</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-white/60">
                    Chargement…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-white/60">
                    Aucune caution
                  </td>
                </tr>
              ) : (
                items.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3">{o.id}</td>
                    <td className="px-4 py-3">{o.customer_email || "—"}</td>
                    <td className="px-4 py-3">
                      {new Date(o.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {(o.deposit_required_cents / 100).toFixed(2)} €
                    </td>
                    <td className="px-4 py-3">
                      {(o.deposit_captured_cents / 100).toFixed(2)} €
                    </td>
                    <td className="px-4 py-3">
                      <span className="uppercase text-xs px-2 py-1 rounded bg-white/10">
                        {o.deposit_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

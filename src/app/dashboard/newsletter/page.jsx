// app/dashboard/newsletter/page.jsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function TableSkeleton() {
  return (
    <tbody className="divide-y divide-white/10 animate-pulse">
      {Array.from({ length: 10 }).map((_, i) => (
        <tr key={i}>
          <td className="px-4 py-3">
            <div className="h-4 w-56 bg-white/10 rounded" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-40 bg-white/10 rounded" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-24 bg-white/10 rounded" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

export default function NewsletterAdminPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (q) params.set("q", q);
      const res = await fetch(`/api/newsletter/list?${params.toString()}`, {
        cache: "no-store",
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || `HTTP ${res.status}`);
      setItems(payload.data || []);
      setTotal(payload.total || 0);
    } catch (e) {
      setErr(e.message || "Erreur de chargement");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  function onSearch(e) {
    e.preventDefault();
    setPage(1);
    load();
  }

  async function exportCSV() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const url = `/api/newsletter/export?${params.toString()}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <main className="min-h-screen bg-[#0A0A0D] text-white">
      <div className="mx-auto max-w-7xl px-4 md:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Newsletter — abonnés
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Rechercher, paginer, exporter en CSV.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-black shadow"
              style={{
                background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
              }}
            >
              Export CSV
            </button>
            <Link
              href="/dashboard"
              className="rounded-xl px-4 py-2 text-sm bg-white/10 hover:bg-white/15"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Barre de recherche */}
        <form
          onSubmit={onSearch}
          className="flex flex-col sm:flex-row gap-2 mb-4"
        >
          <input
            placeholder="Rechercher un email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
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

        {err && (
          <p className="mb-4 text-sm text-red-400">Erreur : {String(err)}</p>
        )}

        {/* Table */}
        <div className="rounded-2xl overflow-hidden ring-1 ring-white/10">
          <div className="max-h-[65vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white/5 backdrop-blur z-10">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Inscrit le</th>
                  <th className="px-4 py-3 font-semibold">ID</th>
                </tr>
              </thead>

              {loading ? (
                <TableSkeleton />
              ) : (
                <tbody className="divide-y divide-white/10">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-white/60">
                        Aucun abonné
                      </td>
                    </tr>
                  ) : (
                    items.map((s) => (
                      <tr key={s.id} className="hover:bg-white/[0.03]">
                        <td className="px-4 py-3">{s.email}</td>
                        <td className="px-4 py-3">
                          {new Date(s.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-white/40">{s.id}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              )}
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-sm text-white/60">
            {total} abonné{total > 1 ? "s" : ""} — page {page}/
            {Math.max(1, totalPages)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-2 rounded bg-white/10 disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-2 rounded bg-white/10 disabled:opacity-40"
            >
              Suivant
            </button>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
              className="px-2 py-2 rounded bg-[#0B0B10] border border-white/10"
            >
              {[25, 50, 100, 200].map((n) => (
                <option key={n} value={n}>
                  {n}/page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </main>
  );
}

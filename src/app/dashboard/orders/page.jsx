// app/dashboard/orders/page.jsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";
import { supabase } from "../../lib/supabase";

function Badge({ children, tone = "default" }) {
  const cls =
    tone === "paid"
      ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
      : tone === "pending"
      ? "bg-amber-500/15 text-amber-300 ring-amber-500/30"
      : tone === "failed"
      ? "bg-red-500/15 text-red-300 ring-red-500/30"
      : "bg-white/10 text-white/80 ring-white/20";
  return (
    <span className={`text-xs px-2 py-1 rounded-full ring-1 ${cls}`}>
      {children}
    </span>
  );
}

function Drawer({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-[560px] bg-[#0F0F14] text-white shadow-2xl ring-1 ring-white/10">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/15"
          >
            Fermer
          </button>
        </div>
        <div className="p-5 overflow-y-auto h-[calc(100%-56px-64px)]">
          {children}
        </div>
        <div className="px-5 py-3 border-t border-white/10">{footer}</div>
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 py-1.5">
      <div className="text-white/60 text-sm">{label}</div>
      <div className="text-white/95 text-sm">{children}</div>
    </div>
  );
}

export default function OrdersAdminPage() {
  // Filtres & pagination
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(""); // paid|pending|failed|...
  const [dateFrom, setDateFrom] = useState(""); // YYYY-MM-DD
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Données
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Drawer détail
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  // charge
  async function load() {
    setLoading(true);
    setErr("");
    try {
      let query = supabase
        .from("orders")
        .select(
          "id, created_at, status, total_amount_cents, payment_method, customer_email, start_date, end_date, delivery, address",
          { count: "exact" }
        )
        .order("created_at", { ascending: false });

      // Recherche simple sur id/email
      if (q) {
        // On ne peut pas OR facilement avec supabase-js v2 + count, donc on fait simple:
        // si q ressemble à un UUID → filtre sur id, sinon sur email
        const looksUUID = q.length > 20 && q.includes("-");
        if (looksUUID) query = query.ilike("id", `%${q}%`);
        else query = query.ilike("customer_email", `%${q}%`);
      }

      if (status) query = query.eq("status", status);
      if (dateFrom) query = query.gte("created_at", `${dateFrom}T00:00:00Z`);
      if (dateTo) query = query.lte("created_at", `${dateTo}T23:59:59Z`);

      // pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query.range(from, to);
      if (error) throw error;

      setItems(data || []);
      setTotal(count || 0);
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

  function exportCSVClient() {
    const header = [
      "id",
      "created_at",
      "status",
      "total_eur",
      "payment_method",
      "customer_email",
      "start_date",
      "end_date",
    ];
    const rows = items.map((o) => [
      o.id,
      o.created_at,
      o.status || "",
      (Number(o.total_amount_cents || 0) / 100).toFixed(2),
      o.payment_method || "",
      o.customer_email || "",
      o.start_date || "",
      o.end_date || "",
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map(csvEscape).join(","))
      .join("\n");
    downloadBlob(csv, "text/csv;charset=utf-8", "orders_page.csv");
  }

  function csvEscape(v) {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }
  function downloadBlob(text, mime, filename) {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function toneForStatus(s) {
    if (!s) return "default";
    const t = s.toLowerCase();
    if (["paid", "succeeded"].includes(t)) return "paid";
    if (["pending", "processing"].includes(t)) return "pending";
    if (["failed", "canceled", "refused"].includes(t)) return "failed";
    return "default";
  }

  return (
    <main className="min-h-screen bg-[#0A0A0D] text-white">
      <div className="mx-auto max-w-7xl px-4 md:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Commandes
            </h1>
            <p className="text-white/60 text-sm">
              Recherche, filtres, pagination et détails.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCSVClient}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-black shadow"
              style={{
                background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
              }}
              title="Exporter la page courante en CSV"
            >
              <FiDownload />
              Export CSV (page)
            </button>
            <Link
              href="/dashboard"
              className="rounded-xl px-4 py-2 text-sm bg-white/10 hover:bg-white/15"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Filtres */}
        <form
          onSubmit={onSearch}
          className="rounded-2xl ring-1 ring-white/10 bg-[#0F0F14] p-4 mb-4"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <label className="col-span-2 lg:col-span-2">
              <span className="block text-sm text-white/70 mb-1">
                Recherche (email ou id)
              </span>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="client@exemple.com ou uuid…"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0B0B10] border border-white/10 outline-none"
                />
              </div>
            </label>

            <label>
              <span className="block text-sm text-white/70 mb-1">Statut</span>
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0B0B10] border border-white/10 outline-none"
                >
                  <option value="">Tous</option>
                  <option value="paid">Payée</option>
                  <option value="pending">En attente</option>
                  <option value="failed">Échouée</option>
                </select>
              </div>
            </label>

            <label>
              <span className="block text-sm text-white/70 mb-1">
                Du (création)
              </span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0B10] border border-white/10 outline-none"
              />
            </label>

            <label>
              <span className="block text-sm text-white/70 mb-1">
                Au (création)
              </span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0B10] border border-white/10 outline-none"
              />
            </label>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              className="rounded-lg px-4 py-2 text-sm font-semibold text-black shadow"
              style={{
                background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
              }}
            >
              Rechercher
            </button>
            <button
              type="button"
              onClick={() => {
                setQ("");
                setStatus("");
                setDateFrom("");
                setDateTo("");
                setPage(1);
                load();
              }}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-white/10 hover:bg-white/15"
            >
              <FiRefreshCw />
              Réinitialiser
            </button>
          </div>
        </form>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden ring-1 ring-white/10">
          <div className="max-h-[65vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white/5 backdrop-blur z-10">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Montant</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 font-semibold">Méthode</th>
                  <th className="px-4 py-3 font-semibold">ID</th>
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
                      Aucune commande
                    </td>
                  </tr>
                ) : (
                  items.map((o) => (
                    <tr
                      key={o.id}
                      className="hover:bg-white/[0.03] cursor-pointer"
                      onClick={() => {
                        setCurrent(o);
                        setOpen(true);
                      }}
                    >
                      <td className="px-4 py-3">
                        {new Date(o.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">{o.customer_email || "—"}</td>
                      <td className="px-4 py-3">
                        {(Number(o.total_amount_cents || 0) / 100).toFixed(2)} €
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={toneForStatus(o.status)}>
                          {o.status || "—"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{o.payment_method || "—"}</td>
                      <td className="px-4 py-3 text-white/40">{o.id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-sm text-white/60">
            {total} commande{total > 1 ? "s" : ""} — page {page}/
            {Math.max(1, totalPages)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-2 rounded bg-white/10 disabled:opacity-40"
              title="Précédent"
            >
              <FiChevronLeft />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-2 rounded bg-white/10 disabled:opacity-40"
              title="Suivant"
            >
              <FiChevronRight />
            </button>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setPage(1);
              }}
              className="px-2 py-2 rounded bg-[#0B0B10] border border-white/10"
            >
              {[25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}/page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Drawer détail */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={`Commande — ${current?.id || ""}`}
        footer={
          <div className="text-right text-white/60 text-xs">
            Créée le{" "}
            {current ? new Date(current.created_at).toLocaleString() : "—"}
          </div>
        }
      >
        {!current ? null : (
          <div className="space-y-2">
            <Row label="Statut">
              <Badge tone={toneForStatus(current.status)}>
                {current.status || "—"}
              </Badge>
            </Row>
            <Row label="Montant">
              {(Number(current.total_amount_cents || 0) / 100).toFixed(2)} €
            </Row>
            <Row label="Méthode">{current.payment_method || "—"}</Row>
            <Row label="Email client">{current.customer_email || "—"}</Row>
            <Row label="Période">
              {current.start_date || "—"} → {current.end_date || "—"}
            </Row>
            <Row label="Livraison">
              <pre className="whitespace-pre-wrap break-words text-xs bg-white/5 p-2 rounded">
                {stringifyJSON(current.delivery)}
              </pre>
            </Row>
            <Row label="Adresse">
              <pre className="whitespace-pre-wrap break-words text-xs bg-white/5 p-2 rounded">
                {stringifyJSON(current.address)}
              </pre>
            </Row>
          </div>
        )}
      </Drawer>
    </main>
  );
}

function stringifyJSON(v) {
  try {
    if (!v) return "—";
    if (typeof v === "string") {
      // parfois stocké en texte JSON
      const maybe = JSON.parse(v);
      return JSON.stringify(maybe, null, 2);
    }
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

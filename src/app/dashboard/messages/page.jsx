// app/dashboard/messages/page.jsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiSearch,
} from "react-icons/fi";
import { supabase } from "../../lib/supabase";

function Drawer({ open, onClose, title, children }) {
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
        <div className="p-5 overflow-y-auto h-[calc(100%-56px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function MessagesAdminPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      let query = supabase
        .from("contact_messages")
        .select("id,name,email,phone,subject,message,consent,created_at", {
          count: "exact",
        })
        .order("created_at", { ascending: false });

      if (q) {
        // filtre simple (OR name/email/subject)
        // supabase-js: on peut faire un 'or' string
        query = query.or(
          `name.ilike.%${q}%,email.ilike.%${q}%,subject.ilike.%${q}%`
        );
      }

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
      "name",
      "email",
      "phone",
      "subject",
      "message",
      "consent",
    ];
    const rows = items.map((m) => [
      m.id,
      m.created_at,
      m.name || "",
      m.email || "",
      m.phone || "",
      m.subject || "",
      (m.message || "").replace(/\s+/g, " ").slice(0, 500), // raccourci pour lecture
      m.consent ? "true" : "false",
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map(csvEscape).join(","))
      .join("\n");
    downloadBlob(csv, "text/csv;charset=utf-8", "messages_page.csv");
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

  return (
    <main className="min-h-screen bg-[#0A0A0D] text-white">
      <div className="mx-auto max-w-7xl px-4 md:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Messages de contact
            </h1>
            <p className="text-white/60 text-sm">
              Recherche, pagination et lecture détaillée.
            </p>
          </div>
          <div className="flex items-center gap-2">
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

        {/* Barre de recherche */}
        <form
          onSubmit={onSearch}
          className="flex flex-col sm:flex-row gap-2 mb-4"
        >
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Chercher par nom, email ou sujet…"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0B0B10] border border-white/10 outline-none"
            />
          </div>
          <button
            className="rounded-lg px-4 py-2 text-sm font-semibold text-black shadow"
            style={{
              background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
            }}
          >
            Rechercher
          </button>
        </form>

        {err && <p className="mb-3 text-sm text-red-400">Erreur : {err}</p>}

        {/* Table */}
        <div className="rounded-2xl overflow-hidden ring-1 ring-white/10">
          <div className="max-h-[65vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white/5 backdrop-blur z-10">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Nom</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Sujet</th>
                  <th className="px-4 py-3 font-semibold">Aperçu</th>
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
                      Aucun message
                    </td>
                  </tr>
                ) : (
                  items.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-white/[0.03] cursor-pointer"
                      onClick={() => {
                        setCurrent(m);
                        setOpen(true);
                      }}
                    >
                      <td className="px-4 py-3">
                        {new Date(m.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">{m.name || "—"}</td>
                      <td className="px-4 py-3">{m.email || "—"}</td>
                      <td className="px-4 py-3">{m.subject || "—"}</td>
                      <td className="px-4 py-3 text-white/70">
                        {(m.message || "").slice(0, 80)}
                        {(m.message || "").length > 80 ? "…" : ""}
                      </td>
                      <td className="px-4 py-3 text-white/40">{m.id}</td>
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
            {total} message{total > 1 ? "s" : ""} — page {page}/
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

      {/* Drawer lecture */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={current ? current.subject || "Message" : "Message"}
      >
        {!current ? null : (
          <div className="space-y-3">
            <div className="grid grid-cols-[120px_1fr] gap-3">
              <div className="text-white/60 text-sm">Reçu le</div>
              <div className="text-sm">
                {new Date(current.created_at).toLocaleString()}
              </div>

              <div className="text-white/60 text-sm">Nom</div>
              <div className="text-sm">{current.name || "—"}</div>

              <div className="text-white/60 text-sm">Email</div>
              <div className="text-sm">{current.email || "—"}</div>

              <div className="text-white/60 text-sm">Téléphone</div>
              <div className="text-sm">{current.phone || "—"}</div>

              <div className="text-white/60 text-sm">Consentement</div>
              <div className="text-sm">{current.consent ? "oui" : "non"}</div>

              <div className="text-white/60 text-sm">ID</div>
              <div className="text-xs text-white/40">{current.id}</div>
            </div>

            <div className="pt-2">
              <div className="text-white/60 text-sm mb-1">Message</div>
              <div className="text-sm leading-relaxed bg-white/5 p-3 rounded">
                {(current.message || "").trim() || "—"}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </main>
  );
}

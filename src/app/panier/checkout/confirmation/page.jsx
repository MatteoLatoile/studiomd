"use client";

import { useRouter, useSearchParams } from "next/navigation";
import CheckoutSteps from "../../../components/CheckoutSteps";
import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiDownload,
  FiHome,
  FiLoader,
  FiPrinter,
} from "react-icons/fi";

function euro(cents) {
  const n = (Number(cents) || 0) / 100;
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}
function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return d;
  }
}
function asText(v) {
  if (v == null) return "—";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean")
    return String(v);
  try {
    if (typeof v === "object") {
      const { line1, line2, city, postal_code, country } = v;
      if (line1 || line2 || city || postal_code || country) {
        return [
          line1,
          line2,
          [postal_code, city].filter(Boolean).join(" "),
          country,
        ]
          .filter(Boolean)
          .join("\n");
      }
      return JSON.stringify(v);
    }
  } catch {}
  return String(v);
}

export default function ConfirmationPage() {
  const search = useSearchParams();
  const router = useRouter();

  // CAWL renvoie typiquement ?hostedCheckoutId=... (on gère aussi ?hid=... par prudence)
  const hostedCheckoutId =
    search.get("hostedCheckoutId") || search.get("hid") || null;

  const [status, setStatus] = useState("pending");
  const [orderId, setOrderId] = useState(null);
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!hostedCheckoutId) {
        setErr("Session de paiement manquante");
        setStatus("error");
        return;
      }
      try {
        const res = await fetch("/api/cawl/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hostedCheckoutId }),
        });
        const data = await res.json().catch(() => ({}));
        if (!alive) return;
        if (res.ok && data?.order_id) {
          setOrderId(data.order_id);
          setStatus("ok");
        } else {
          setErr(data.error || "Erreur");
          setStatus("error");
        }
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Erreur réseau");
        setStatus("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, [hostedCheckoutId]);

  useEffect(() => {
    if (!orderId) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          cache: "no-store",
        });
        const isJson = res.headers
          .get("content-type")
          ?.includes("application/json");
        if (!isJson) throw new Error("Réponse inattendue");
        const data = await res.json();
        if (!alive) return;
        if (!res.ok) throw new Error(data.error || "Chargement impossible");
        setOrder(data.order);
      } catch (e) {
        if (!alive) return;
        console.error(e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [orderId]);

  const nbJours = useMemo(() => {
    if (!order?.start_date || !order?.end_date) return 1;
    const a = new Date(order.start_date + "T00:00:00");
    const b = new Date(order.end_date + "T00:00:00");
    return Math.max(1, Math.round((b - a) / 86400000) + 1);
  }, [order?.start_date, order?.end_date]);

  function escapeHtml(x) {
    return String(x)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  // ——————————————————————————————————————————————————
  // FACTURE HTML (design premium)
  // ——————————————————————————————————————————————————
  function printInvoice() {
    if (!order) return;
    const {
      id,
      created_at,
      start_date,
      end_date,
      customer_first_name,
      customer_last_name,
      customer_email,
      customer_phone,
      address,
      items = [],
      total_amount_cents = 0,
    } = order;

    const today = new Date().toLocaleDateString("fr-FR");
    const name =
      [customer_first_name, customer_last_name].filter(Boolean).join(" ") ||
      customer_email ||
      "Client";
    const adr = asText(address);

    const rows = items
      .map(
        (it, idx) => `
        <tr class="${idx % 2 ? "zebra" : ""}">
          <td class="col-item">
            <div class="item-name">${escapeHtml(it.name || "Produit")}</div>
            <div class="item-meta">Réservation ${nbJours} jour${
          nbJours > 1 ? "s" : ""
        }</div>
          </td>
          <td class="c">${Number(it.quantity) || 1}</td>
          <td class="r">${euro(it.unit_price_cents)}</td>
          <td class="r">${euro(
            (Number(it.quantity) || 1) * (Number(it.unit_price_cents) || 0)
          )}</td>
        </tr>`
      )
      .join("");

    const html = `<!doctype html>
<html lang="fr">
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Facture ${escapeHtml(id)}</title>
<style>
  :root{
    --ink:#0F0F14;
    --muted:#586174;
    --line:#ECEEF3;
    --soft:#F7F9FC;
    --brand1:#FFC119;
    --brand2:#FFEB83;
    --accent:#0B0F19;
  }
  @page{ size:A4; margin:18mm; }
  *{ box-sizing:border-box; }
  body{
    margin:0; color:var(--ink);
    font: 13px/1.45 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    background:white;
  }
  .wrap{
    position:relative;
  }

  .hero{
    border-radius:16px;
    overflow:hidden;
    border:1px solid var(--line);
    background:
      radial-gradient(1200px 400px at -15% -30%, rgba(255,235,131,0.55), transparent 60%),
      linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7));
  }
  .hero-bar{
    height:6px;
    background:linear-gradient(90deg, var(--brand1), var(--brand2));
  }
  .hero-in{
    padding:18px 20px;
    display:flex; align-items:flex-start; justify-content:space-between; gap:16px;
  }
  .brand{
    display:flex; align-items:center; gap:12px;
  }
  .logo{
    width:36px; height:36px; border-radius:10px;
    background:linear-gradient(135deg, var(--brand1), var(--brand2));
    display:grid; place-items:center; color:#111; font-weight:900;
    box-shadow:0 4px 18px rgba(255,193,25,.35) inset;
  }
  .brand-txt{
    display:flex; flex-direction:column;
  }
  .brand-name{ font-weight:800; letter-spacing:.2px; }
  .brand-sub{ color:var(--muted); font-size:12px; }

  .hero-right{ text-align:right; }
  .badge{
    display:inline-block; font-weight:800; font-size:11px; letter-spacing:.3px;
    padding:6px 10px; border-radius:999px; color:#111;
    background:linear-gradient(90deg, var(--brand1), var(--brand2));
    box-shadow: 0 6px 20px rgba(255,193,25,.25);
  }
  .muted{ color:var(--muted); }

  h1{
    margin:20px 0 10px; font-size:20px; letter-spacing:.2px;
  }

  .grid{
    display:grid; grid-template-columns:1fr 1fr; gap:12px 20px;
  }
  .card{
    border:1px solid var(--line); border-radius:12px; background:#fff; padding:14px;
  }
  .card .label{ font-size:12px; color:var(--muted); margin-bottom:4px; }
  .card .value{ white-space:pre-line; }

  table{ width:100%; border-collapse:collapse; margin-top:14px; border:1px solid var(--line); overflow:hidden; border-radius:12px; }
  thead th{
    font-size:12px; text-transform:uppercase; letter-spacing:.35px;
    background:var(--soft); color:#2a2f39; border-bottom:1px solid var(--line);
    padding:11px 12px; text-align:left;
  }
  td{ padding:11px 12px; border-bottom:1px solid var(--line); vertical-align:top; }
  tr.zebra td{ background:#fcfdff; }
  .col-item .item-name{ font-weight:600; }
  .col-item .item-meta{ color:var(--muted); font-size:12px; margin-top:2px; }
  td.c{ text-align:center; }
  td.r{ text-align:right; }

  .tot-wrap{
    margin-top:12px; display:flex; justify-content:flex-end;
  }
  .tot{
    width:320px; border:1px solid var(--line); border-radius:12px; background:#fff; overflow:hidden;
  }
  .tot-row{ display:flex; justify-content:space-between; padding:10px 12px; border-bottom:1px dashed var(--line); }
  .tot-row:last-child{ border-bottom:0; background:linear-gradient(180deg,#fff, #fff7dd); }
  .tot-row strong{ font-size:14px; }

  .note{
    margin-top:18px; font-size:11px; color:var(--muted);
    border-left:3px solid var(--brand1); padding-left:10px;
  }

  .footer{
    margin-top:24px; color:var(--muted); font-size:10.5px; line-height:1.55;
    display:grid; grid-template-columns:1.2fr .8fr; gap:16px;
  }
  .sig{
    border:1px dashed var(--line); border-radius:10px; padding:10px 12px; background:#fff;
  }
  .terms{
    border:1px dashed var(--line); border-radius:10px; padding:10px 12px; background:#fff;
  }

  @media print{
    .no-print{ display:none !important; }
    body{ background:#fff; }
  }
</style>

<body>
  <div class="wrap">
    <div class="hero">
      <div class="hero-bar"></div>
      <div class="hero-in">
        <div class="brand">
          <div class="logo">SM</div>
          <div class="brand-txt">
            <div class="brand-name">Studio Mont d’Or</div>
            <div class="brand-sub">Location & production audiovisuelle</div>
          </div>
        </div>
        <div class="hero-right">
          <div class="badge">PAIEMENT VALIDÉ</div><br/>
          <div class="muted" style="margin-top:8px">Facture # <strong>${escapeHtml(
            id
          )}</strong></div>
          <div class="muted">Émise le ${escapeHtml(today)}</div>
          <div class="muted">Commande créée le ${escapeHtml(
            new Date(created_at).toLocaleDateString("fr-FR")
          )}</div>
        </div>
      </div>
    </div>

    <h1>Détails de la commande</h1>

    <div class="grid">
      <div class="card">
        <div class="label">Client</div>
        <div class="value">
          <strong>${escapeHtml(name)}</strong><br/>
          Email&nbsp;: ${escapeHtml(customer_email || "—")}<br/>
          Tél.&nbsp;: ${escapeHtml(customer_phone || "—")}
        </div>
      </div>
      <div class="card">
        <div class="label">Période de location</div>
        <div class="value">
          du <strong>${escapeHtml(
            fmtDate(start_date)
          )}</strong> au <strong>${escapeHtml(fmtDate(end_date))}</strong><br/>
          (${nbJours} jour${nbJours > 1 ? "s" : ""})
        </div>
      </div>
      <div class="card">
        <div class="label">Adresse</div>
        <div class="value">${escapeHtml(adr)}</div>
      </div>
      <div class="card">
        <div class="label">Référence de commande</div>
        <div class="value"><strong>${escapeHtml(id)}</strong></div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Article</th>
          <th class="c">Qté</th>
          <th class="r">Prix / jour</th>
          <th class="r">Total</th>
        </tr>
      </thead>
      <tbody>
        ${
          rows || `<tr><td colspan="4" class="c muted">Aucun article.</td></tr>`
        }
      </tbody>
    </table>

    <div class="tot-wrap">
      <div class="tot">
        <div class="tot-row"><span>Sous-total</span><span>${euro(
          total_amount_cents
        )}</span></div>
        <div class="tot-row"><span>TVA (incluse si applicable)</span><span>—</span></div>
        <div class="tot-row"><strong>Total TTC</strong><strong>${euro(
          total_amount_cents
        )}</strong></div>
      </div>
    </div>

    <div class="note">
      Merci de votre confiance 🙏 — Studio Mont d’Or. Conservez cette facture pour vos dossiers.
      Pour toute question, répondez au mail de confirmation.
    </div>

    <div class="footer">
      <div class="sig">
        <div style="font-weight:700; margin-bottom:6px">Signature & cachet</div>
        <div class="muted">Document généré automatiquement — aucune signature manuscrite requise.</div>
      </div>
      <div class="terms">
        <div style="font-weight:700; margin-bottom:6px">Conditions</div>
        <div class="muted">
          Le matériel reste la propriété du loueur. Toute dégradation est à la charge du client.
          Les réservations sont soumises à nos CGV disponibles sur demande.
        </div>
      </div>
    </div>

    <div class="no-print" style="margin-top:18px; display:flex; gap:8px;">
      <button onclick="window.print()" style="padding:10px 14px; border-radius:10px; border:1px solid var(--line); background:#111; color:#fff; font-weight:700; cursor:pointer">Imprimer</button>
      <button onclick="window.close()" style="padding:10px 14px; border-radius:10px; border:1px solid var(--line); background:#fff; color:#111; font-weight:700; cursor:pointer">Fermer</button>
    </div>
  </div>

  <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
</body>
</html>`;

    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  function openInvoice() {
    if (!orderId) return;
    window.open(
      `/api/orders/${orderId}?pdf=1`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF5D7] to-[#FFF1C0] px-4 md:px-8 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="relative overflow-hidden rounded-3xl ring-1 ring-black/5 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_300px_at_-10%_-20%,#FFE48A_10%,transparent_60%)]" />
          <div className="relative p-6 md:p-10 bg-white/70 backdrop-blur">
            {status === "pending" && (
              <div className="flex items-center gap-3 text-noir">
                <FiLoader className="animate-spin text-xl" />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">
                    Validation du paiement…
                  </h1>
                  <p className="text-sm text-gray-600">
                    Merci de patienter quelques secondes.
                  </p>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="text-noir">
                <h1 className="text-xl md:text-2xl font-bold">Oups…</h1>
                <p className="mt-2 text-red-700">{asText(err)}</p>
                <button
                  onClick={() => router.push("/")}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-noir shadow"
                  style={{
                    background:
                      "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
                  }}
                >
                  <FiArrowLeft /> Retour à l’accueil
                </button>
              </div>
            )}

            {status === "ok" && (
              <div className="space-y-6 text-noir">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-emerald-100 flex items-center justify-center">
                    <FiCheckCircle className="text-emerald-600 text-2xl" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                      Merci, votre réservation est confirmée 🎉
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Référence commande&nbsp;:{" "}
                      <span className="font-mono">{asText(orderId)}</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/80 ring-1 ring-black/5 p-5">
                  {!order ? (
                    <p className="text-sm text-gray-600">
                      Chargement des détails…
                    </p>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Période</p>
                          <p className="font-medium">
                            {fmtDate(order.start_date)} →{" "}
                            {fmtDate(order.end_date)}{" "}
                            <span className="text-gray-500">
                              ({nbJours} jour{nbJours > 1 ? "s" : ""})
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Montant total</p>
                          <p className="font-medium">
                            {euro(order.total_amount_cents)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Client</p>
                          <p className="font-medium">
                            {asText(
                              [
                                order.customer_first_name,
                                order.customer_last_name,
                              ]
                                .filter(Boolean)
                                .join(" ")
                            ) || asText(order.customer_email)}
                          </p>
                          <p className="text-gray-600">
                            {asText(order.customer_email)}
                          </p>
                          {order.customer_phone && (
                            <p className="text-gray-600">
                              {asText(order.customer_phone)}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-500">Adresse</p>
                          <p className="font-medium whitespace-pre-line">
                            {asText(order.address)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-gray-500 text-sm mb-2">Articles</p>
                        <ul className="divide-y divide-black/5 rounded-xl overflow-hidden ring-1 ring-black/5 bg-white">
                          {(order.items || []).map((it) => (
                            <li
                              key={it.id}
                              className="p-3 flex items-center justify-between text-sm"
                            >
                              <div>
                                <p className="font-medium">{asText(it.name)}</p>
                                <p className="text-gray-500">
                                  {asText(it.quantity)} ×{" "}
                                  {(
                                    (Number(it.unit_price_cents) || 0) / 100
                                  ).toFixed(2)}{" "}
                                  € / jour
                                </p>
                              </div>
                              <div className="font-semibold">
                                {euro(
                                  (Number(it.quantity) || 1) *
                                    (Number(it.unit_price_cents) || 0)
                                )}
                              </div>
                            </li>
                          ))}
                          {(order.items || []).length === 0 && (
                            <li className="p-3 text-sm text-gray-500">
                              Aucun article.
                            </li>
                          )}
                        </ul>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => router.push("/")}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-noir shadow"
                    style={{
                      background:
                        "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
                    }}
                  >
                    <FiHome /> Retour à l’accueil
                  </button>

                  <button
                    onClick={() => router.push("/compte")}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-noir bg-white ring-1 ring-black/10 hover:ring-black/20"
                  >
                    Voir mes commandes
                  </button>

                  {orderId && (
                    <a
                      href={`/api/orders/${orderId}?pdf=1`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-noir shadow"
                      style={{
                        background:
                          "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
                      }}
                    >
                      <FiDownload /> Télécharger la facture (PDF)
                    </a>
                  )}

                  <button
                    onClick={printInvoice}
                    disabled={!order}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white bg-black hover:opacity-90 disabled:opacity-60"
                  >
                    <FiPrinter /> Imprimer / Enregistrer en PDF
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  Astuce : la facture s’ouvre dans un nouvel onglet — choisis
                  “Enregistrer au format PDF” pour la télécharger.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

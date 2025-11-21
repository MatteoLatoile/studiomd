"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiDownload,
  FiHome,
  FiLoader,
  FiPrinter,
  FiShield,
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
  const sessionId = search.get("session_id");

  const [status, setStatus] = useState("pending"); // pending | ok | error
  const [orderId, setOrderId] = useState(null);
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState(null);

  // État de la caution
  const [depLoading, setDepLoading] = useState(false);
  const [depError, setDepError] = useState("");
  const [dep, setDep] = useState({
    status: null, // none | pending_hold | authorized | captured | released | failed
    payment_intent_id: null,
    amount_cents: 0,
    message: "",
  });

  // 1) Confirme la session Stripe -> crée/récupère la commande et renvoie order_id
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!sessionId) {
        setErr("Session Stripe manquante");
        setStatus("error");
        return;
      }
      try {
        const res = await fetch("/api/stripe/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
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
  }, [sessionId]);

  // 2) Charge les détails de commande
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

  // 3) Déclenche la caution dès qu'on a un orderId (1 seule fois)
  useEffect(() => {
    if (!orderId) return;
    let alive = true;

    (async () => {
      try {
        setDepLoading(true);
        setDepError("");
        const res = await fetch("/api/orders/deposit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: orderId }),
        });
        const payload = await res.json().catch(() => ({}));
        if (!alive) return;

        if (!res.ok) throw new Error(payload.error || "Échec de la caution");

        setDep({
          status: payload.deposit_status || "pending_hold",
          payment_intent_id: payload.deposit_payment_id || null,
          amount_cents: Number(payload.amount_cents || 0),
          message: payload.message || "",
        });
      } catch (e) {
        if (!alive) return;
        setDepError(e.message || "Échec du traitement de la caution");
      } finally {
        if (alive) setDepLoading(false);
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

  function printInvoice() {
    if (!order) return;
    // (Tu as déjà la version "HTML complet" côté /api/orders/[id]?pdf=1)
    // On garde ton bouton "Imprimer" qui ouvre la facture server-side.
    window.open(
      `/api/orders/${order.id}?pdf=1`,
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

                {/* ÉTAT CAUTION */}
                <div className="rounded-2xl bg-white ring-1 ring-black/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-yellow-100 flex items-center justify-center">
                      <FiShield className="text-yellow-700 text-lg" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">
                        Caution (empreinte bancaire)
                      </p>
                      {depLoading && (
                        <p className="text-sm text-gray-600 mt-1">
                          Mise en place de l’empreinte en cours…
                        </p>
                      )}
                      {!depLoading && depError && (
                        <p className="text-sm text-red-600 mt-1">{depError}</p>
                      )}
                      {!depLoading && !depError && (
                        <>
                          {dep.message && (
                            <p className="text-sm text-gray-700 mt-1">
                              {dep.message}
                            </p>
                          )}
                          {dep.amount_cents > 0 && (
                            <p className="text-sm text-gray-700 mt-1">
                              Montant bloqué&nbsp;:{" "}
                              <strong>{euro(dep.amount_cents)}</strong>
                            </p>
                          )}
                          {dep.status && (
                            <p className="text-xs text-gray-500 mt-1">
                              Statut&nbsp;: <em>{dep.status}</em>
                              {dep.payment_intent_id ? (
                                <>
                                  {" "}
                                  - PI:{" "}
                                  <span className="font-mono">
                                    {dep.payment_intent_id}
                                  </span>
                                </>
                              ) : null}
                            </p>
                          )}
                          {!dep.status && dep.amount_cents === 0 && (
                            <p className="text-sm text-gray-700 mt-1">
                              Aucune caution requise pour cette commande.
                            </p>
                          )}
                        </>
                      )}
                    </div>
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

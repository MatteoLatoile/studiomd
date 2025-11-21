// app/dashboard/page.jsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FiArrowRight,
  FiBox,
  FiCreditCard,
  FiDownload,
  FiFilm,
  FiMail,
  FiShoppingBag,
  FiUnlock,
  FiUsers,
} from "react-icons/fi";
import { supabase } from "../lib/supabase";

/* ---------------- UI bits ---------------- */

function Card({ children, className = "" }) {
  return (
    <div
      className={
        "rounded-2xl bg-[#0F0F14] ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.25)] " +
        className
      }
    >
      {children}
    </div>
  );
}

function StatCard({ icon, label, value, hint, href }) {
  const content = (
    <div className="p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 grid place-items-center rounded-xl bg-white/5">
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-sm text-white/60">{label}</div>
          <div className="text-2xl font-extrabold tracking-tight">{value}</div>
          {hint ? (
            <div className="text-xs text-white/40 mt-1">{hint}</div>
          ) : null}
        </div>
        {href ? (
          <FiArrowRight className="text-white/60 group-hover:text-white transition" />
        ) : null}
      </div>
    </div>
  );
  return href ? (
    <Link
      href={href}
      className="group block rounded-2xl bg-[#0F0F14] ring-1 ring-white/10 hover:ring-white/20 transition"
    >
      {content}
    </Link>
  ) : (
    <Card>{content}</Card>
  );
}

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-3 py-1.5">
      <div className="text-white/60 text-sm">{label}</div>
      <div className="text-white/95 text-sm">{children}</div>
    </div>
  );
}

function SkeletonLine({ w = "100%" }) {
  return <div className="h-4 rounded bg-white/10" style={{ width: w }} />;
}

/* --------------- Modal Capture --------------- */
function CaptureModal({ order, onClose, onCaptured }) {
  const [amount, setAmount] = useState(
    ((order?.deposit_required_cents || 0) -
      (order?.deposit_captured_cents || 0)) /
      100
  );
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setPending(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/deposits/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order.id,
          amount_cents: Math.round(Number(amount || 0) * 100),
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || `HTTP ${res.status}`);
      onCaptured?.();
      onClose();
    } catch (e) {
      setErr(e.message || "Erreur de capture");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 grid place-items-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#0F0F14] ring-1 ring-white/10 p-5">
        <h3 className="text-lg font-semibold">
          Capturer une partie / totalité
        </h3>
        <p className="text-white/60 text-sm mt-1">
          Commande <span className="text-white/80">{order?.id}</span>
        </p>
        <div className="mt-4">
          <label className="block text-sm text-white/70 mb-1">
            Montant à capturer (€)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl bg-[#0B0B10] border border-white/10 px-4 py-3 text-white outline-none"
          />
          <p className="text-xs text-white/50 mt-2">
            Capturé: {(order.deposit_captured_cents || 0) / 100} € / Exigé:{" "}
            {(order.deposit_required_cents || 0) / 100} €
          </p>
        </div>
        {err && <p className="text-sm text-red-400 mt-3">{err}</p>}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-white/10">
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={pending}
            className="px-4 py-2 rounded text-black font-semibold shadow"
            style={{
              background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
            }}
          >
            {pending ? "Capture..." : "Capturer"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------- Page --------------- */

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(true); // mets true si tu n’utilises pas la garde
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Stats
  const [counts, setCounts] = useState({
    products: 0,
    orders: 0,
    films: 0,
    subscribers: 0,
    messages: 0,
    deposits_pending: 0,
  });

  // Dernières activités
  const [lastOrders, setLastOrders] = useState([]);
  const [lastSubs, setLastSubs] = useState([]);

  // Cautions à traiter
  const [deposits, setDeposits] = useState([]);
  const [captureTarget, setCaptureTarget] = useState(null);

  async function loadEverything() {
    setErr("");
    setLoading(true);
    try {
      const [
        auth,
        prodHead,
        ordersHead,
        filmsHead,
        subsHead,
        msgsHead,
        lastOrdersQ,
        lastSubsQ,
        depositsQ,
        pendingCountQ,
      ] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("films").select("*", { count: "exact", head: true }),
        supabase
          .from("newsletter_subscribers")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("contact_messages")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("id,total_amount_cents,status,created_at,customer_email")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("newsletter_subscribers")
          .select("id,email,created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        // Cautions récentes (held, pending_hold, partially_captured)
        supabase
          .from("orders")
          .select(
            "id,customer_email,created_at,deposit_status,deposit_required_cents,deposit_captured_cents,deposit_payment_id"
          )
          .in("deposit_status", ["pending_hold", "held", "partially_captured"])
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .in("deposit_status", ["pending_hold", "held", "partially_captured"]),
      ]);

      const u = auth.data?.user || null;
      setUser(u);
      const admin = !!u?.app_metadata?.is_admin;
      setIsAdmin(admin || true); // mets seulement "admin" si tu veux restreindre

      setCounts({
        products: prodHead.count || 0,
        orders: ordersHead.count || 0,
        films: filmsHead.count || 0,
        subscribers: subsHead.count || 0,
        messages: msgsHead.count || 0,
        deposits_pending: pendingCountQ.count || 0,
      });

      setLastOrders(lastOrdersQ.data || []);
      setLastSubs(lastSubsQ.data || []);
      setDeposits(depositsQ.data || []);
    } catch (e) {
      setErr(e?.message || "Erreur au chargement du dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEverything();
  }, []);

  const actions = useMemo(
    () => [
      {
        label: "Gérer les produits",
        href: "/location",
        desc: "Ajouter / modifier / supprimer (images & stock).",
        icon: <FiBox className="text-xl text-white/80" />,
      },
      {
        label: "Gérer les productions",
        href: "/productions",
        desc: "Films, affiches et détails.",
        icon: <FiFilm className="text-xl text-white/80" />,
      },
      {
        label: "Newsletter",
        href: "/dashboard/newsletter",
        desc: "Abonnés : recherche, export CSV.",
        icon: <FiUsers className="text-xl text-white/80" />,
      },
      {
        label: "Cautions",
        href: "/dashboard/deposits",
        desc: "Liste complète & historique des cautions.",
        icon: <FiCreditCard className="text-xl text-white/80" />,
      },
    ],
    []
  );

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-[#0A0A0D] text-white grid place-items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Accès refusé</h1>
          <p className="text-white/60 mt-2">
            Cette page est réservée aux administrateurs.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15"
          >
            Retour à l’accueil
          </Link>
        </div>
      </main>
    );
  }

  async function release(orderId) {
    const yes = confirm("Libérer totalement l’autorisation de caution ?");
    if (!yes) return;
    const res = await fetch("/api/admin/deposits/release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId }),
    });
    const payload = await res.json();
    if (!res.ok) {
      alert(payload.error || "Échec libération");
      return;
    }
    await loadEverything();
  }

  return (
    <main className="min-h-screen bg-[#0A0A0D] text-white">
      <div className="mx-auto max-w-7xl px-4 md:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Dashboard
            </h1>
            <p className="text-white/60 mt-1 text-sm">
              Vue d’ensemble du site : stats clés, raccourcis et dernières
              activités.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/newsletter/export"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-black shadow"
              style={{
                background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
              }}
              title="Exporter les abonnés newsletter en CSV"
            >
              <FiDownload />
              Export CSV newsletter
            </a>
            <Link
              href="/"
              className="rounded-xl px-4 py-2 text-sm bg-white/10 hover:bg-white/15"
            >
              ← Retour au site
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {loading ? (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <SkeletonLine w="40%" />
                      <SkeletonLine w="60%" />
                    </div>
                  </div>
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatCard
                icon={<FiBox className="text-white/80 text-xl" />}
                label="Produits"
                value={counts.products}
                hint="Catalogue location"
                href="/location"
              />
              <StatCard
                icon={<FiShoppingBag className="text-white/80 text-xl" />}
                label="Commandes"
                value={counts.orders}
                hint="Total historique"
                href="/panier"
              />
              <StatCard
                icon={<FiFilm className="text-white/80 text-xl" />}
                label="Films"
                value={counts.films}
                hint="Section productions"
                href="/productions"
              />
              <StatCard
                icon={<FiUsers className="text-white/80 text-xl" />}
                label="Newsletter"
                value={counts.subscribers}
                hint="Abonnés actifs"
                href="/dashboard/newsletter"
              />
              <StatCard
                icon={<FiMail className="text-white/80 text-xl" />}
                label="Messages"
                value={counts.messages}
                hint="Formulaire contact"
              />
              <StatCard
                icon={<FiCreditCard className="text-white/80 text-xl" />}
                label="Cautions à traiter"
                value={counts.deposits_pending}
                hint="Held / Pending / Partielle"
                href="/dashboard/deposits"
              />
            </>
          )}
        </div>

        {/* Raccourcis */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {actions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group rounded-2xl ring-1 ring-white/10 bg-[#0F0F14] p-5 hover:ring-white/20 transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 grid place-items-center rounded-xl bg-white/5">
                  {a.icon}
                </div>
                <div>
                  <div className="font-semibold">{a.label}</div>
                  <div className="text-sm text-white/60">{a.desc}</div>
                </div>
                <FiArrowRight className="ml-auto text-white/40 group-hover:text-white/80 transition" />
              </div>
            </Link>
          ))}
        </div>

        {/* Deux colonnes : Commandes / Newsletter */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-5 border-b border-white/10">
              <h2 className="text-lg font-semibold">Dernières commandes</h2>
              <p className="text-white/60 text-sm">
                5 plus récentes — statuts & montants
              </p>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="space-y-2">
                  <SkeletonLine />
                  <SkeletonLine w="90%" />
                  <SkeletonLine w="80%" />
                  <SkeletonLine w="70%" />
                  <SkeletonLine w="60%" />
                </div>
              ) : lastOrders.length === 0 ? (
                <p className="text-white/60 text-sm">Aucune commande.</p>
              ) : (
                <div className="divide-y divide-white/10">
                  {lastOrders.map((o) => (
                    <div key={o.id} className="py-3">
                      <Row label="ID">{o.id}</Row>
                      <Row label="Date">
                        {new Date(o.created_at).toLocaleString()}
                      </Row>
                      <Row label="Montant">
                        {(Number(o.total_amount_cents || 0) / 100).toFixed(2)} €
                      </Row>
                      <Row label="Statut">{o.status || "—"}</Row>
                      <Row label="Client">{o.customer_email || "—"}</Row>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Cautions à traiter */}
          <Card>
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Cautions</h2>
                <p className="text-white/60 text-sm">
                  Held / Pending / Capture partielle (8 dernières)
                </p>
              </div>
              <Link
                href="/dashboard/deposits"
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-black shadow"
                style={{
                  background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
                }}
              >
                Tout voir
                <FiArrowRight />
              </Link>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="space-y-2">
                  <SkeletonLine />
                  <SkeletonLine w="90%" />
                  <SkeletonLine w="80%" />
                  <SkeletonLine w="70%" />
                  <SkeletonLine w="60%" />
                </div>
              ) : deposits.length === 0 ? (
                <p className="text-white/60 text-sm">
                  Aucune caution à traiter.
                </p>
              ) : (
                <div className="divide-y divide-white/10">
                  {deposits.map((d) => (
                    <div key={d.id} className="py-3">
                      <Row label="Commande">{d.id}</Row>
                      <Row label="Client">{d.customer_email || "—"}</Row>
                      <Row label="Date">
                        {new Date(d.created_at).toLocaleString()}
                      </Row>
                      <Row label="Exigée / Capturée">
                        {(d.deposit_required_cents / 100).toFixed(2)} € /{" "}
                        {(d.deposit_captured_cents / 100).toFixed(2)} €
                      </Row>
                      <Row label="Statut">
                        <span className="uppercase text-xs px-2 py-1 rounded bg-white/10">
                          {d.deposit_status}
                        </span>
                      </Row>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => setCaptureTarget(d)}
                          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-black shadow"
                          style={{
                            background:
                              "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
                          }}
                          disabled={!d.deposit_payment_id}
                          title={
                            d.deposit_payment_id
                              ? "Capturer"
                              : "Aucun PaymentIntent"
                          }
                        >
                          <FiCreditCard /> Capturer
                        </button>
                        <button
                          onClick={() => release(d.id)}
                          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs bg-white/10 hover:bg-white/15"
                          disabled={!d.deposit_payment_id}
                          title={
                            d.deposit_payment_id
                              ? "Libérer"
                              : "Aucun PaymentIntent"
                          }
                        >
                          <FiUnlock /> Libérer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Newsletter bloc */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Derniers abonnés newsletter
                </h2>
                <p className="text-white/60 text-sm">
                  5 plus récents — email & date
                </p>
              </div>
              <a
                href="/api/newsletter/export"
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-black shadow"
                style={{
                  background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
                }}
                title="Exporter CSV"
              >
                <FiDownload />
                Export
              </a>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="space-y-2">
                  <SkeletonLine />
                  <SkeletonLine w="90%" />
                  <SkeletonLine w="80%" />
                  <SkeletonLine w="70%" />
                  <SkeletonLine w="60%" />
                </div>
              ) : lastSubs.length === 0 ? (
                <p className="text-white/60 text-sm">Aucun abonné.</p>
              ) : (
                <div className="divide-y divide-white/10">
                  {lastSubs.map((s) => (
                    <div key={s.id} className="py-3">
                      <Row label="Email">{s.email}</Row>
                      <Row label="Inscrit le">
                        {new Date(s.created_at).toLocaleString()}
                      </Row>
                      <Row label="ID">
                        <span className="text-white/40 text-xs">{s.id}</span>
                      </Row>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Footer mini info */}
        {err && (
          <p className="mt-6 text-red-400 text-sm">Erreur : {String(err)}</p>
        )}
        <p className="mt-6 text-xs text-white/40">
          Tip : si des nombres restent à 0, vérifie les politiques RLS pour
          permettre la lecture (SELECT) aux admins sur les tableaux concernés.
        </p>
      </div>

      {captureTarget && (
        <CaptureModal
          order={captureTarget}
          onClose={() => setCaptureTarget(null)}
          onCaptured={() => loadEverything()}
        />
      )}
    </main>
  );
}

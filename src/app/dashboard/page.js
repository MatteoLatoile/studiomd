// app/dashboard/page.jsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FiArrowRight,
  FiBox,
  FiDownload,
  FiFilm,
  FiMail,
  FiShoppingBag,
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
  });

  // Dernières activités
  const [lastOrders, setLastOrders] = useState([]);
  const [lastSubs, setLastSubs] = useState([]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setErr("");
        // Auth (optionnel)
        const { data } = await supabase.auth.getUser();
        const u = data?.user || null;
        if (!alive) return;
        setUser(u);
        // garde admin (décommente si tu veux forcer)
        const admin = !!u?.app_metadata?.is_admin;
        setIsAdmin(admin || true); // ← mets juste "admin" si tu veux bloquer l’accès aux non-admins

        // Charge les stats (en parallèle)
        const [
          prodHead,
          ordersHead,
          filmsHead,
          subsHead,
          msgsHead,
          lastOrdersQ,
          lastSubsQ,
        ] = await Promise.all([
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
        ]);

        if (!alive) return;

        setCounts({
          products: prodHead.count || 0,
          orders: ordersHead.count || 0,
          films: filmsHead.count || 0,
          subscribers: subsHead.count || 0,
          messages: msgsHead.count || 0,
        });

        setLastOrders(lastOrdersQ.data || []);
        setLastSubs(lastSubsQ.data || []);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Erreur au chargement du dashboard");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {loading ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
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
            </>
          )}
        </div>

        {/* Raccourcis */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
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

        {/* Deux colonnes : Dernières commandes / Derniers abonnés */}
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
          Tip : si des nombres restent à 0, vérifie les **politiques RLS** pour
          permettre la lecture (SELECT) aux admins sur les tableaux concernés.
        </p>
      </div>
    </main>
  );
}

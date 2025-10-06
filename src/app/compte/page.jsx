export const dynamic = "force-dynamic";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UpdateProfileForm from "./UpdateProfileForm";

/* utils */
function formatDate(d) {
  try {
    return new Date(d).toLocaleString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}
function euroCents(cents) {
  const v = Number(cents || 0) / 100;
  return v.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}
function daysInclusive(a, b) {
  try {
    const d1 = new Date(a + "T00:00:00");
    const d2 = new Date(b + "T00:00:00");
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
  } catch {
    return 1;
  }
}

export default async function ComptePage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion?next=/compte");

  let profile = null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("first_name, last_name, phone")
      .eq("id", user.id)
      .maybeSingle();
    profile = data || null;
  } catch {
    profile = null;
  }

  const { data: orders, error: ordersErr } = await supabase
    .from("orders")
    .select(
      `
      id,
      start_date,
      end_date,
      payment_method,
      delivery,
      address,
      total_amount_cents,
      status,
      created_at,
      items:order_items(
        id,
        name,
        quantity,
        unit_price_cents
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="bg-[#0B0B0F] min-h-screen py-30 px-4 md:px-8 text-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold">Mon compte</h1>
        <p className="text-white/60 mt-2">
          Connecté en tant que <span className="font-medium">{user.email}</span>
        </p>

        {/* Coordonnées + Sécurité */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <section className="rounded-2xl bg-[#0F1117] ring-1 ring-white/10 p-4 sm:p-6 shadow-xl">
            <h2 className="text-xl font-semibold">Mes coordonnées</h2>
            <p className="text-sm text-white/60 mt-1">
              Mets à jour tes informations de contact.
            </p>

            <div className="mt-4">
              <UpdateProfileForm
                userId={user.id}
                email={user.email || ""}
                initialFirstName={profile?.first_name || ""}
                initialLastName={profile?.last_name || ""}
                initialPhone={profile?.phone || ""}
              />
            </div>
          </section>

          <aside className="rounded-2xl bg-[#0F1117] ring-1 ring-white/10 p-4 sm:p-6 shadow-xl h-fit">
            <h3 className="text-lg font-semibold">Sécurité & données</h3>
            <ul className="mt-3 list-disc list-inside text-sm text-white/70 space-y-2">
              <li>Données stockées (Supabase), jamais revendues.</li>
              <li>Suppression du compte/données sur demande.</li>
              <li>Paiements par Stripe, cartes non stockées.</li>
            </ul>
          </aside>
        </div>

        {/* Historique commandes */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Historique des commandes</h2>
            <span className="text-sm text-white/60">
              {ordersErr ? "Erreur" : orders?.length || 0} commande(s)
            </span>
          </div>

          {ordersErr && (
            <p className="text-red-400 mt-3">
              Erreur chargement commandes : {ordersErr.message}
            </p>
          )}

          {!ordersErr && (orders || []).length === 0 && (
            <div className="mt-4 rounded-2xl bg-[#0F1117] ring-1 ring-white/10 p-6 text-sm text-white/70">
              Aucune commande pour le moment.
            </div>
          )}

          <ul className="mt-4 space-y-4">
            {(orders || []).map((o) => {
              const days = daysInclusive(o.start_date, o.end_date);
              const addr =
                typeof o.address === "object" && o.address !== null
                  ? o.address
                  : {};
              const statusBadge = (() => {
                const base =
                  "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1";
                switch (o.status) {
                  case "paid":
                    return `${base} bg-emerald-900/30 text-emerald-300 ring-emerald-700/40`;
                  case "pending":
                    return `${base} bg-yellow-900/30 text-yellow-300 ring-yellow-700/40`;
                  case "canceled":
                    return `${base} bg-red-900/30 text-red-300 ring-red-700/40`;
                  default:
                    return `${base} bg-white/10 text-white/70 ring-white/15`;
                }
              })();

              return (
                <li
                  key={o.id}
                  className="rounded-2xl bg-[#0F1117] ring-1 ring-white/10 p-4 sm:p-6 shadow-xl"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">
                          Commande #{o.id.slice(0, 8)}
                        </h3>
                        <span className={statusBadge}>{o.status}</span>
                        <span className="text-xs text-white/50">
                          {formatDate(o.created_at)}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-white/80">
                        <span className="font-medium">Période :</span>{" "}
                        {o.start_date} → {o.end_date}{" "}
                        <span className="text-white/60">
                          ({days} jour{days > 1 ? "s" : ""})
                        </span>
                      </p>

                      <p className="mt-0.5 text-sm text-white/80">
                        <span className="font-medium">Paiement :</span>{" "}
                        {o.payment_method === "card"
                          ? "Carte bancaire"
                          : "Virement"}
                      </p>

                      <p className="mt-0.5 text-sm text-white/80">
                        <span className="font-medium">Mode :</span>{" "}
                        {o.delivery === "delivery"
                          ? "Livraison"
                          : "Retrait en agence"}
                      </p>

                      {o.delivery === "delivery" && (
                        <div className="mt-1 text-sm text-white/70">
                          {addr?.line1 && <div>{addr.line1}</div>}
                          {addr?.line2 && <div>{addr.line2}</div>}
                          {(addr?.postal_code || addr?.city) && (
                            <div>
                              {addr.postal_code || ""} {addr.city || ""}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-sm text-white/60">Total TTC</div>
                      <div className="text-lg font-semibold">
                        {euroCents(o.total_amount_cents)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-[#0B0D12] ring-1 ring-white/10 p-3">
                    {(o.items || []).length === 0 ? (
                      <p className="text-sm text-white/70">Aucun article.</p>
                    ) : (
                      <ul className="divide-y divide-white/10">
                        {o.items.map((it) => (
                          <li
                            key={it.id}
                            className="py-2 flex items-center justify-between"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {it.name}
                              </p>
                              <p className="text-xs text-white/60">
                                {it.quantity} unité{it.quantity > 1 ? "s" : ""}{" "}
                                · {euroCents(it.unit_price_cents)}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a
                      href={`/api/orders/${o.id}?pdf=1`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-black shadow ring-1 ring-white/10 hover:opacity-90"
                      style={{
                        background:
                          "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
                      }}
                    >
                      Télécharger la facture (PDF)
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}

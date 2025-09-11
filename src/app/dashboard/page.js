export const dynamic = "force-dynamic";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DeleteContactMessageButton from "./DeleteContactMessageButton";
import DeleteOrderButton from "./DeleteOrderButton";
import OrderSearchBar from "./OrderSearchBar";

/* ---------- utils ---------- */
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

export default async function DashboardPage({ searchParams }) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");
  if (!user.app_metadata?.is_admin) redirect("/");

  // COMMANDES
  const { data: orders, error: ordersErr } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      session_id,
      start_date,
      end_date,
      delivery,
      address,
      payment_method,
      total_amount_cents,
      status,
      created_at,
      customer_email,
      customer_first_name,
      customer_last_name,
      customer_phone,
      items:order_items (
        id,
        product_id,
        name,
        unit_price_cents,
        quantity
      )
    `
    )
    .order("created_at", { ascending: false });

  const q = (searchParams?.q || "").toString().trim().toLowerCase();
  const filteredOrders = !q
    ? orders || []
    : (orders || []).filter((o) => o.id.toLowerCase().includes(q));

  // MESSAGES
  const { data: messages, error: msgErr } = await supabase
    .from("contact_messages")
    .select("id, name, email, phone, subject, message, consent, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="px-20 py-30 bg-[#F6EAD1] mx-auto p-6">
      <h1 className="text-3xl font-bold">Dashboard Admin</h1>
      <p className="text-[#6B6B6B] mt-2">Bienvenue {user.email}.</p>

      {/* ===== Commandes ===== */}
      <section className="mt-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Commandes clients</h2>
            <span className="text-sm text-gray-600">
              {ordersErr ? "Erreur" : filteredOrders.length} commande(s)
            </span>
          </div>
          <OrderSearchBar />
        </header>

        {ordersErr && (
          <p className="text-red-600 mt-3">
            Erreur commandes: {ordersErr.message}
          </p>
        )}

        <ul className="mt-4 space-y-4">
          {!ordersErr && filteredOrders.length === 0 && (
            <li className="rounded-2xl p-6 bg-[#ffffff80] ring-1 ring-black/5 text-sm text-gray-600">
              {q
                ? "Aucune commande ne correspond à la recherche."
                : "Aucune commande pour le moment."}
            </li>
          )}

          {filteredOrders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </ul>
      </section>

      {/* ===== Messages ===== */}
      <section className="mt-10">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Messages de contact</h2>
          <span className="text-sm text-gray-600">
            {msgErr ? "Erreur" : messages?.length || 0} message(s)
          </span>
        </header>

        {msgErr && (
          <p className="text-red-600 mt-3">Erreur messages: {msgErr.message}</p>
        )}

        <ul className="mt-4 space-y-4">
          {!msgErr && (messages || []).length === 0 && (
            <li className="rounded-2xl p-6 bg-[#ffffff80] ring-1 ring-black/5 text-sm text-gray-600">
              Aucun message pour le moment.
            </li>
          )}

          {(messages || []).map((m) => (
            <MessageCard key={m.id} message={m} />
          ))}
        </ul>
      </section>
    </main>
  );
}

function OrderCard({ order }) {
  const days = daysInclusive(order.start_date, order.end_date);
  const addr =
    typeof order.address === "object" && order.address !== null
      ? order.address
      : {};

  const deliveryLabel =
    order.delivery === "delivery" ? "Livraison" : "Retrait agence";

  const statusBadge = (() => {
    const base =
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1";
    switch (order.status) {
      case "paid":
        return `${base} bg-green-50 text-green-700 ring-green-200`;
      case "pending":
        return `${base} bg-yellow-50 text-yellow-700 ring-yellow-200`;
      case "canceled":
        return `${base} bg-red-50 text-red-700 ring-red-200`;
      default:
        return `${base} bg-gray-100 text-gray-700 ring-gray-200`;
    }
  })();

  const fullName = [order.customer_first_name, order.customer_last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <li className="rounded-2xl bg-[#ffffff80] ring-1 ring-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-noir text-base">
              Commande #{order.id.slice(0, 8)}
            </h3>
            <span className={statusBadge}>{order.status}</span>
            <span className="text-xs text-gray-500">
              {formatDate(order.created_at)}
            </span>
          </div>

          <div className="mt-1 text-sm text-[#343434]">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-medium">Client:</span>
              {fullName ? <span>{fullName}</span> : null}
              {order.customer_email ? (
                <a
                  href={`mailto:${order.customer_email}`}
                  className="text-blue-700 hover:underline break-all"
                >
                  {order.customer_email}
                </a>
              ) : null}
              {order.customer_phone ? (
                <a
                  href={`tel:${order.customer_phone}`}
                  className="text-gray-700 hover:underline"
                >
                  {order.customer_phone}
                </a>
              ) : null}
              {!fullName && !order.customer_email && !order.customer_phone && (
                <span className="text-gray-600">{order.user_id}</span>
              )}
            </p>

            <p className="mt-0.5">
              <span className="font-medium">Période:</span> {order.start_date} →{" "}
              {order.end_date}{" "}
              <span className="text-gray-600">
                ({days} jour{days > 1 ? "s" : ""})
              </span>
            </p>

            <p className="mt-0.5">
              <span className="font-medium">Paiement:</span>{" "}
              {order.payment_method === "card" ? "CB" : "Virement"}
            </p>
            <p className="mt-0.5">
              <span className="font-medium">Mode:</span> {deliveryLabel}
            </p>

            {order.delivery === "delivery" && (
              <div className="mt-1 text-sm text-gray-700">
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
        </div>

        <div className="shrink-0 text-right">
          <div className="text-sm text-gray-600">Total TTC</div>
          <div className="text-lg font-semibold">
            {euroCents(order.total_amount_cents)}
          </div>

          <div className="mt-3">
            <DeleteOrderButton orderId={order.id} />
          </div>
        </div>
      </div>

      {/* Lignes */}
      <div className="mt-4 rounded-xl bg-white ring-1 ring-black/5 p-3">
        {(order.items || []).length === 0 ? (
          <p className="text-sm text-gray-600">Aucun article.</p>
        ) : (
          <ul className="divide-y divide-black/5">
            {order.items.map((it) => (
              <li
                key={it.id}
                className="py-2 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-noir truncate">
                    {it.name || it.product_id}
                  </p>
                  <p className="text-xs text-gray-600">
                    {it.quantity} unité{it.quantity > 1 ? "s" : ""} / jour ·{" "}
                    {euroCents(it.unit_price_cents)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function MessageCard({ message }) {
  return (
    <li className="rounded-2xl bg-[#ffffff80] ring-1 ring-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-noir text-base">
              {message.name}
            </h3>
            <a
              href={`mailto:${message.email}`}
              className="text-sm text-blue-700 hover:underline"
            >
              {message.email}
            </a>
            {message.phone && (
              <a
                href={`tel:${message.phone}`}
                className="text-sm text-gray-700 hover:underline"
              >
                {message.phone}
              </a>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            {message.subject && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white ring-1 ring-black/10">
                {message.subject}
              </span>
            )}
            <span className="text-gray-500">
              {formatDate(message.created_at)}
            </span>
            {message.consent === false && (
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-50 text-red-700 ring-1 ring-red-200">
                sans consentement
              </span>
            )}
          </div>
        </div>

        <div className="mt-1">
          <DeleteContactMessageButton id={message.id} />
        </div>
      </div>

      <div className="mt-4 text-sm text-[#343434] whitespace-pre-line">
        {message.message}
      </div>
    </li>
  );
}

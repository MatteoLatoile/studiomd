"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiCreditCard,
  FiHome,
  FiMail,
  FiMapPin,
  FiPhone,
  FiTruck,
  FiUser,
  FiShield,
  FiFileText,
  FiCheckCircle,
} from "react-icons/fi";
import { supabase } from "../../lib/supabase";

/* ---------- utils ---------- */
function euro(n) {
  const v = Number(n || 0);
  return v.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}
function isoToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
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

export default function CheckoutPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]); // { id, quantity, product:{ id,name,price,image_url,category } }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // coordonnées
  const [form, setForm] = useState({
    last_name: "",
    first_name: "",
    email: "",
    phone: "",
  });

  // dates
  const [startDate, setStartDate] = useState(isoToday());
  const [endDate, setEndDate] = useState(isoToday());

  // options
  const [delivery, setDelivery] = useState("pickup"); // "pickup" | "delivery"
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    postal_code: "",
    city: "",
  });
  const [payment, setPayment] = useState("card"); // "card" | "bank"
  const [errors, setErrors] = useState({});

  /* ---------- load user + panier + profil ---------- */
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);

      const { data: u } = await supabase.auth.getUser();
      const currentUser = u?.user || null;
      if (!alive) return;

      if (!currentUser) {
        setUser(null);
        setItems([]);
        setLoading(false);
        return;
      }
      setUser(currentUser);

      // Panier
      const { data: cart, error: cartErr } = await supabase
        .from("cart_items")
        .select(
          `
          id,
          quantity,
          product:products(
            id, name, price, image_url, category
          )
        `
        )
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (!alive) return;

      if (cartErr) {
        console.error("[checkout] cart load:", cartErr.message);
        setItems([]);
      } else {
        setItems(cart || []);
      }

      // Pré-remplir si table profiles existe
      const { data: prof } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone")
        .eq("id", currentUser.id)
        .maybeSingle();

      setForm((f) => ({
        ...f,
        email: currentUser.email || "",
        first_name: prof?.first_name || f.first_name,
        last_name: prof?.last_name || f.last_name,
        phone: prof?.phone || f.phone,
      }));

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  /* ---------- dérivés ---------- */
  const days = useMemo(
    () => daysInclusive(startDate, endDate),
    [startDate, endDate]
  );

  const subtotalPerDay = useMemo(
    () =>
      (items || []).reduce(
        (s, it) => s + (Number(it?.product?.price) || 0) * (it?.quantity || 0),
        0
      ),
    [items]
  );

  const subtotal = useMemo(() => subtotalPerDay * days, [subtotalPerDay, days]);
  const tva = subtotal * 0.2;
  const total = subtotal + tva;

  /* ---------- actions ---------- */
  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }
  function onAddressChange(e) {
    const { name, value } = e.target;
    setAddress((a) => ({ ...a, [name]: value }));
  }

  function validate() {
    const err = {};
    if (!form.last_name.trim()) err.last_name = "Nom requis";
    if (!form.first_name.trim()) err.first_name = "Prénom requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = "E-mail invalide";
    // dates
    if (!startDate) err.startDate = "Date de début requise";
    if (!endDate) err.endDate = "Date de fin requise";
    if (new Date(endDate) < new Date(startDate))
      err.endDate = "Date de fin avant début";
    // adresse si livraison
    if (delivery === "delivery") {
      if (!address.line1.trim()) err.line1 = "Adresse requise";
      if (!address.postal_code.trim()) err.postal_code = "Code postal requis";
      if (!address.city.trim()) err.city = "Ville requise";
    }
    return err;
  }

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  // BRANCHEMENT STRIPE : création de session + redirection
  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  async function onSubmit(e) {
    if (e?.preventDefault) e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) return;

    setSubmitting(true);

    try {
      if (payment === "card") {
        const res = await fetch("/api/stripe/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startDate,
            endDate,
            delivery,
            address: delivery === "delivery" ? address : null,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data?.url) {
          throw new Error(
            data?.error || "Impossible de créer la session Stripe"
          );
        }
        // Redirection vers la page de paiement Stripe
        window.location.href = data.url;
        return;
      }

      // Paiement par virement (sans Stripe)
      const ref = "RES-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      router.push(
        `/panier/checkout/confirmation?ref=${encodeURIComponent(ref)}`
      );
    } catch (e2) {
      console.error(e2);
      alert(e2.message || "Erreur inattendue");
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------- UI ---------- */
  if (loading) {
    return (
      <main className="bg-[#FFF5D7] min-h-screen py-30 px-4 md:px-8">
        <h1 className="text-3xl font-bold text-noir">Coordonnées</h1>
        <div className="mt-6 grid md:grid-cols-[1fr_360px] gap-6">
          <div className="rounded-2xl bg-white/70 h-72 animate-pulse" />
          <div className="rounded-2xl bg-white/70 h-72 animate-pulse" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="bg-[#FFF5D7] min-h-screen py-30 px-4 md:px-8">
        <h1 className="text-3xl font-bold text-noir">Checkout</h1>
        <div className="mt-6 rounded-2xl bg-[#ffffffb3] ring-1 ring-black/5 p-6 max-w-xl">
          <p className="text-noir">
            Connecte-toi pour finaliser ta réservation.
          </p>
          <Link
            href="/connexion?next=/panier/checkout"
            className="inline-flex mt-4 items-center rounded-2xl px-6 py-3 text-sm font-semibold text-noir shadow hover:opacity-90 transition"
            style={{
              background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
            }}
          >
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#FFF5D7] min-h-screen py-30 px-4 md:px-8">
      <h1 className="text-3xl font-bold text-noir">Coordonnées</h1>

      <div className="mt-6 grid md:grid-cols-[1fr_360px] gap-6">
        {/* COL GAUCHE */}
        <section className="space-y-8">
          {/* Carte coordonnées */}
          <div className="rounded-2xl bg-[#ffffffb3] ring-1 ring-black/5 p-4 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
            <form className="space-y-4" onSubmit={onSubmit}>
              {/* Nom & prénom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  icon={<FiUser className="text-[#FFB700]" />}
                  label="Nom"
                  name="last_name"
                  value={form.last_name}
                  onChange={onChange}
                  placeholder="Votre nom ici."
                  error={errors.last_name}
                />
                <Field
                  icon={<FiUser className="text-[#FFB700]" />}
                  label="Prénom"
                  name="first_name"
                  value={form.first_name}
                  onChange={onChange}
                  placeholder="Votre prénom ici."
                  error={errors.first_name}
                />
              </div>

              <Field
                icon={<FiMail className="text-[#FFB700]" />}
                label="E-mail"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="Votre e-mail ici."
                error={errors.email}
              />

              <Field
                icon={<FiPhone className="text-[#FFB700]" />}
                label="Téléphone (optionnel)"
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="Numéro de téléphone"
              />

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FieldDate
                  icon={<FiCalendar className="text-[#FFB700]" />}
                  label="Date de début"
                  value={startDate}
                  onChange={(v) => {
                    setStartDate(v);
                    if (new Date(v) > new Date(endDate)) setEndDate(v);
                  }}
                  min={isoToday()}
                  error={errors.startDate}
                />
                <FieldDate
                  icon={<FiCalendar className="text-[#FFB700]" />}
                  label="Date de fin"
                  value={endDate}
                  onChange={setEndDate}
                  min={startDate || isoToday()}
                  error={errors.endDate}
                />
              </div>

              {/* Options & livraison */}
              <div className="pt-2 space-y-3">
                <h2 className="text-xl font-bold text-noir">
                  Options & livraison
                </h2>

                {/* Retrait en agence */}
                <label
                  className={[
                    "cursor-pointer rounded-xl p-3 bg-white ring-1 ring-black/10 flex items-start gap-3",
                    delivery === "pickup"
                      ? "outline outline-2 outline-[#FFB700]"
                      : "",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={delivery === "pickup"}
                    onChange={() => setDelivery("pickup")}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium flex items-center gap-2">
                      <FiHome className="text-[#FFB700]" />
                      Retrait en agence
                    </p>
                    <p className="text-xs text-gray-600 flex items-center gap-2 mt-1">
                      <FiMapPin /> 2 rue de l’Exemple, Lyon 69000
                    </p>
                  </div>
                </label>

                {/* Livraison à l’adresse */}
                <div
                  className={[
                    "rounded-xl bg-white ring-1 ring-black/10",
                    delivery === "delivery"
                      ? "outline outline-2 outline-[#FFB700]"
                      : "",
                  ].join(" ")}
                >
                  <label className="cursor-pointer flex items-start gap-3 p-3">
                    <input
                      type="radio"
                      name="delivery"
                      checked={delivery === "delivery"}
                      onChange={() => setDelivery("delivery")}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium flex items-center gap-2">
                        <FiTruck className="text-[#FFB700]" />
                        Livraison à l’adresse (Lyon & alentours)
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Un membre de l’équipe vous livre le matériel sur le lieu
                        de tournage.
                      </p>
                    </div>
                  </label>

                  {/* Bloc adresse (affiché uniquement si sélectionné) */}
                  <div
                    className={[
                      "grid grid-cols-1 sm:grid-cols-2 gap-3 px-3 pb-3 transition-all",
                      delivery === "delivery"
                        ? "max-h-[800px] opacity-100"
                        : "max-h-0 opacity-0 overflow-hidden",
                    ].join(" ")}
                    aria-hidden={delivery !== "delivery"}
                  >
                    <FieldPlain
                      label="Adresse (ligne 1)"
                      name="line1"
                      value={address.line1}
                      onChange={onAddressChange}
                      placeholder="N°, rue…"
                      required={delivery === "delivery"}
                      error={errors.line1}
                    />
                    <FieldPlain
                      label="Complément (ligne 2)"
                      name="line2"
                      value={address.line2}
                      onChange={onAddressChange}
                      placeholder="Bâtiment, étage, interphone… (optionnel)"
                    />
                    <FieldPlain
                      label="Code postal"
                      name="postal_code"
                      value={address.postal_code}
                      onChange={onAddressChange}
                      placeholder="69000"
                      required={delivery === "delivery"}
                      error={errors.postal_code}
                    />
                    <FieldPlain
                      label="Ville"
                      name="city"
                      value={address.city}
                      onChange={onAddressChange}
                      placeholder="Lyon"
                      required={delivery === "delivery"}
                      error={errors.city}
                    />
                  </div>
                </div>
              </div>

              {/* Paiement */}
              <div className="pt-1">
                <h2 className="text-xl font-bold text-noir">Paiement</h2>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <RadioCard
                    checked={payment === "card"}
                    onChange={() => setPayment("card")}
                    title="Carte bancaire"
                    icon={<FiCreditCard />}
                  />
                  <RadioCard
                    checked={payment === "bank"}
                    onChange={() => setPayment("bank")}
                    title="Virement bancaire"
                    icon={<FiFileText />}
                  />
                </div>
              </div>

              {/* CTA bas de colonne (mobile) */}
              <div className="sm:hidden pt-3">
                <button
                  type="submit"
                  disabled={items.length === 0 || submitting}
                  className="w-full rounded-xl px-5 py-3 font-semibold text-noir shadow disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
                  }}
                >
                  {submitting ? "Validation…" : "Valider le paiement"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* COL DROITE : RÉCAP */}
        <aside className="rounded-2xl bg-[#ffffffb3] ring-1 ring-black/5 p-4 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] h-fit">
          <h3 className="text-lg font-semibold text-noir">
            Résumé de la commande
          </h3>

          {/* Liste des produits */}
          <ul className="mt-4 space-y-3">
            {(items || []).map((it) => (
              <li
                key={it.id}
                className="flex gap-3 items-center bg-white p-3 rounded-xl ring-1 ring-black/5"
              >
                <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden ring-1 ring-black/10 bg-white">
                  {it.product?.image_url ? (
                    <img
                      src={it.product.image_url}
                      alt={it.product.name}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-100" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-noir truncate">
                    {it.product?.name || "—"}
                  </p>
                  <p className="text-xs text-gray-600">
                    {it.product?.category || "—"}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {days} jour{days > 1 ? "s" : ""} ({startDate} – {endDate})
                  </p>
                </div>
                <div className="text-sm font-semibold">
                  {Number(it?.product?.price).toFixed(2)}€
                </div>
              </li>
            ))}
          </ul>

          {/* Totaux */}
          <div className="mt-4 space-y-2 text-sm">
            <Row label="Sous-total" value={euro(subtotal)} />
            <Row label="TVA 20 %" value={euro(tva)} />
            <div className="h-[1px] bg-black/10 my-3" />
            <Row label="Total TTC" value={euro(total)} strong />
          </div>

          <button
            onClick={onSubmit}
            disabled={items.length === 0 || submitting}
            className="mt-5 w-full rounded-xl px-5 py-3 font-semibold text-noir shadow disabled:opacity-60"
            style={{
              background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
            }}
          >
            {submitting ? "Validation…" : "Valider le paiement"}
          </button>

          <ul className="mt-5 space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <FiShield /> Paiement sécurisé
            </li>
            <li className="flex items-center gap-2">
              <FiFileText /> Contrat clair
            </li>
            <li className="flex items-center gap-2">
              <FiCheckCircle /> Support 24/7
            </li>
          </ul>
        </aside>
      </div>
    </main>
  );
}

/* ---------- petits composants ---------- */

function Field({
  icon,
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
}) {
  return (
    <div>
      <label className="text-[13px] text-noir flex items-center gap-2 mb-1">
        <span className="inline-flex h-5 w-5 items-center justify-center">
          {icon}
        </span>
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-lg bg-white border border-gray-300 px-3 py-2 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-[#FFB700]/30">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full text-sm outline-none placeholder-gray-400 bg-transparent"
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          required={
            name === "last_name" || name === "first_name" || name === "email"
          }
        />
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function FieldPlain({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  error,
}) {
  return (
    <div>
      <label className="text-[13px] text-noir mb-1 block">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full text-sm outline-none placeholder-gray-400 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-gray-400 focus:ring-2 focus:ring-[#FFB700]/30"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function FieldDate({ icon, label, value, onChange, min, error }) {
  return (
    <div>
      <label className="text-[13px] text-noir flex items-center gap-2 mb-1">
        <span className="inline-flex h-5 w-5 items-center justify-center">
          {icon}
        </span>
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-lg bg-white border border-gray-300 px-3 py-2 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-[#FFB700]/30">
        <input
          type="date"
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm outline-none appearance-none [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:cursor-pointer bg-transparent"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function RadioCard({ checked, onChange, title, icon }) {
  return (
    <label
      className={[
        "cursor-pointer rounded-xl p-3 bg-white ring-1 ring-black/10 flex items-center gap-3",
        checked ? "outline outline-2 outline-[#FFB700]" : "",
      ].join(" ")}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium">{title}</span>
    </label>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? "font-semibold" : ""}>{label}</span>
      <span className={strong ? "font-semibold" : "text-noir"}>{value}</span>
    </div>
  );
}

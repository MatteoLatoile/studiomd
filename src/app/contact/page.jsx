"use client";

import { useState } from "react";
import { BsFacebook, BsInstagram, BsYoutube } from "react-icons/bs";
import {
  FiMail,
  FiMessageSquare,
  FiPhone,
  FiSend,
  FiTag,
  FiUser,
} from "react-icons/fi";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    consent: true,
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = "Nom requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = "E-mail invalide";
    if (!form.message.trim()) err.message = "Message requis";
    if (!form.consent) err.consent = "Nécessaire pour envoyer le formulaire";
    return err;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) return;

    setSending(true);
    // 👉 Ici, remplace le setTimeout par ton appel API/email (sendgrid, formspree, route API Next…)
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
    setForm({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      consent: true,
    });
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <main className="bg-[#F6EAD1] pt-30 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-10 pb-24">
        {/* Titre */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-noir">
            Formulaire de contact
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-2 leading-5">
            Caméras, optiques, audio, lumière… tout l’équipement dont vous avez
            besoin, prêt à tourner quand vous l’êtes.
          </p>
        </header>

        {/* Grille */}
        <div className="grid md:grid-cols-[1fr_360px] gap-6">
          {/* Carte formulaire */}
          <section className="rounded-2xl bg-[#ffffff80] ring-1 ring-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-5 md:p-6">
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <Field
                icon={<FiUser className="text-[#FFB700]" />}
                label="Nom complet"
                name="name"
                placeholder="Votre nom complet ici."
                value={form.name}
                onChange={handleChange}
                error={errors.name}
              />

              <Field
                icon={<FiMail className="text-[#FFB700]" />}
                label="E-mail"
                name="email"
                type="email"
                placeholder="Votre e-mail ici."
                value={form.email}
                onChange={handleChange}
                error={errors.email}
              />

              <Field
                icon={<FiPhone className="text-[#FFB700]" />}
                label="Téléphone"
                hint="(Optionnel)"
                name="phone"
                placeholder="Entrez votre numéro de téléphone ici."
                value={form.phone}
                onChange={handleChange}
              />

              <Field
                icon={<FiTag className="text-[#FFB700]" />}
                label="Objet"
                name="subject"
                placeholder="Quel est l’objet de votre message ?"
                value={form.subject}
                onChange={handleChange}
              />

              <FieldTextarea
                icon={<FiMessageSquare className="text-[#FFB700]" />}
                label="Message"
                name="message"
                placeholder="Tapez votre message dans ce champs."
                value={form.message}
                onChange={handleChange}
                error={errors.message}
              />

              {/* Consentement */}
              <label className="flex items-start gap-2 text-xs text-[#343434]">
                <input
                  type="checkbox"
                  name="consent"
                  checked={form.consent}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#FFB700] focus:ring-[#FFB700]"
                />
                <span>
                  J’accepte que mes données soient utilisées pour être
                  recontacté
                </span>
              </label>
              {errors.consent && (
                <p className="text-xs text-red-600 -mt-2">{errors.consent}</p>
              )}

              {/* Actions */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-noir shadow-md disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
                  }}
                >
                  {sending ? (
                    <>
                      <Spinner /> Envoi en cours…
                    </>
                  ) : (
                    <>
                      Soumettre le formulaire <FiSend className="text-base" />
                    </>
                  )}
                </button>
                {sent && (
                  <span className="ml-3 text-sm text-green-700">
                    Merci ! Votre message a bien été envoyé.
                  </span>
                )}
              </div>
            </form>
          </section>

          {/* Carte infos & réseaux */}
          <aside className="rounded-2xl bg-[#ffffff80] ring-1 ring-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-5 md:p-6">
            <h3 className="text-noir font-semibold">
              Contactez-nous aussi sur :
            </h3>

            {/* Réseaux */}
            <div className="mt-3 flex items-center gap-3">
              <Social icon={<BsFacebook />} />
              <Social icon={<BsInstagram />} />
              <Social icon={<BsYoutube />} />
            </div>

            {/* Infos */}
            <div className="mt-6 space-y-4 text-sm">
              <InfoRow
                title="E-mail"
                lines={["montdor@gmail.com"]}
                icon={<FiMail className="text-[#FFB700]" />}
              />
              <InfoRow
                title="Téléphone"
                lines={["06.89.27.78"]}
                icon={<FiPhone className="text-[#FFB700]" />}
              />
              <InfoRow
                title="Entreprise"
                lines={["Située à Lyon"]}
                icon={<FiTag className="text-[#FFB700]" />}
              />
            </div>

            {/* Notice délai */}
            <p className="mt-6 text-xs text-[#6B6B6B] leading-5">
              Nous nous efforçons de répondre à toutes les demandes dans un
              délai de 24 heures ouvrées.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* ---------- composants UI ---------- */

function Field({
  icon,
  label,
  hint,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
}) {
  return (
    <div>
      <label className="text-[13px] text-noir flex items-center gap-2 mb-1">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-transparent">
          {icon}
        </span>
        {label} {hint && <span className="text-[#6B6B6B] ml-1">{hint}</span>}
      </label>

      <div className="flex items-center gap-2 rounded-lg bg-white border border-gray-300 px-3 py-2 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-[#FFB700]/30">
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full text-sm outline-none placeholder-gray-400"
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
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

function FieldTextarea({
  icon,
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
}) {
  return (
    <div>
      <label className="text-[13px] text-noir flex items-center gap-2 mb-1">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-transparent">
          {icon}
        </span>
        {label}
      </label>

      <div className="rounded-lg bg-white border border-gray-300 p-2 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-[#FFB700]/30">
        <textarea
          name={name}
          rows={5}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full text-sm outline-none placeholder-gray-400 resize-y min-h-[120px]"
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
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

function InfoRow({ title, lines, icon }) {
  return (
    <div>
      <p className="text-noir font-semibold flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center">
          {icon}
        </span>
        {title}
      </p>
      <div className="mt-1 text-[#6B6B6B] leading-5">
        {lines.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>
    </div>
  );
}

function Social({ icon }) {
  return (
    <button
      type="button"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FFB700] text-noir hover:opacity-90 transition shadow"
      aria-label="Réseau social"
    >
      <span className="text-lg">{icon}</span>
    </button>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black"
      aria-hidden
    />
  );
}

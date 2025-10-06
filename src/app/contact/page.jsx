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
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      setSent(true);
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        consent: true,
      });
      setErrors({});
      setTimeout(() => setSent(false), 3000);
    } catch (e) {
      setErrors((prev) => ({ ...prev, submit: e.message || "Erreur d’envoi" }));
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="bg-[#0B0B0F] pt-30 min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-10 pb-24">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Formulaire de contact
          </h1>
          <p className="text-sm text-white/60 mt-2 leading-5">
            Caméras, optiques, audio, lumière… prêt à tourner quand vous l’êtes.
          </p>
        </header>

        <div className="grid md:grid-cols-[1fr_360px] gap-6">
          <section className="rounded-2xl bg-[#0F1117] ring-1 ring-white/10 shadow-xl p-5 md:p-6">
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
                placeholder="Numéro de téléphone."
                value={form.phone}
                onChange={handleChange}
              />

              <Field
                icon={<FiTag className="text-[#FFB700]" />}
                label="Objet"
                name="subject"
                placeholder="Objet de votre message ?"
                value={form.subject}
                onChange={handleChange}
              />

              <FieldTextarea
                icon={<FiMessageSquare className="text-[#FFB700]" />}
                label="Message"
                name="message"
                placeholder="Tapez votre message ici."
                value={form.message}
                onChange={handleChange}
                error={errors.message}
              />

              <label className="flex items-start gap-2 text-xs text-white/80">
                <input
                  type="checkbox"
                  name="consent"
                  checked={form.consent}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-transparent text-[#FFB700] focus:ring-[#FFB700]"
                />
                <span>
                  J’accepte que mes données soient utilisées pour être
                  recontacté
                </span>
              </label>
              {errors.consent && (
                <p className="text-xs text-red-400 -mt-2">{errors.consent}</p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-black shadow-md disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
                  }}
                >
                  {sending ? (
                    <>Envoi en cours…</>
                  ) : (
                    <>
                      Soumettre le formulaire <FiSend />
                    </>
                  )}
                </button>
                {sent && (
                  <span className="ml-3 text-sm text-emerald-400">
                    Merci ! Votre message a bien été envoyé.
                  </span>
                )}
                {errors.submit && (
                  <p className="mt-2 text-sm text-red-400">{errors.submit}</p>
                )}
              </div>
            </form>
          </section>

          <aside className="rounded-2xl bg-[#0F1117] ring-1 ring-white/10 shadow-xl p-5 md:p-6">
            <h3 className="font-semibold">Contactez-nous aussi sur :</h3>
            <div className="mt-3 flex items-center gap-3">
              <Social icon={<BsFacebook />} />
              <Social icon={<BsInstagram />} />
              <Social icon={<BsYoutube />} />
            </div>

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

            <p className="mt-6 text-xs text-white/60">
              Nous répondons en général sous 24h ouvrées.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* UI */
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
      <label className="text-[13px] text-white flex items-center gap-2 mb-1">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full">
          {icon}
        </span>
        {label} {hint && <span className="text-white/60 ml-1">{hint}</span>}
      </label>
      <div className="flex items-center gap-2 rounded-lg bg-[#0B0D12] border border-white/10 px-3 py-2 focus-within:border-white/20 focus-within:ring-2 focus-within:ring-[#FFB700]/20">
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full text-sm outline-none placeholder-white/30 bg-transparent text-white"
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-400">
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
      <label className="text-[13px] text-white flex items-center gap-2 mb-1">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full">
          {icon}
        </span>
        {label}
      </label>
      <div className="rounded-lg bg-[#0B0D12] border border-white/10 p-2 focus-within:border-white/20 focus-within:ring-2 focus-within:ring-[#FFB700]/20">
        <textarea
          name={name}
          rows={5}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full text-sm outline-none placeholder-white/30 bg-transparent text-white resize-y min-h-[120px]"
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
function InfoRow({ title, lines, icon }) {
  return (
    <div>
      <p className="font-semibold flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center">
          {icon}
        </span>
        {title}
      </p>
      <div className="mt-1 text-white/70 leading-5">
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
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FFB700] text-black hover:opacity-90 transition shadow"
      aria-label="Réseau social"
    >
      <span className="text-lg">{icon}</span>
    </button>
  );
}

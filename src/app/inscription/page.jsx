"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiCheck, FiMail, FiSend, FiShield, FiUser } from "react-icons/fi";
import PasswordInput, { scorePassword } from "../components/PasswordInput";
import { supabase } from "../lib/supabase";

export default function InscriptionPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    terms: true,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const pwdScore = useMemo(() => scorePassword(form.password), [form.password]);

  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = "Nom requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = "E-mail invalide";
    if (pwdScore.score < 3) err.password = "Mot de passe trop faible";
    if (form.password !== form.confirm)
      err.confirm = "Les mots de passe ne correspondent pas";
    if (!form.terms) err.terms = "Vous devez accepter les conditions";
    return err;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) return;

    setSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name },
      },
    });

    if (error) {
      setErrors({ email: error.message });
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setDone(true);
  };

  return (
    <main className="bg-[#F6EAD1] pt-30 min-h-screen">
      <div className="max-w-lg mx-auto px-4 md:px-6 pt-12 pb-24">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-noir">
          Créer un compte
        </h1>
        <p className="text-sm text-[#6B6B6B] mt-2">
          Rejoignez le studio en quelques secondes.
        </p>

        <form
          className="mt-8 space-y-4 rounded-2xl bg-[#ffffff80] ring-1 ring-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6"
          onSubmit={onSubmit}
          noValidate
        >
          <Field
            label="Nom complet"
            icon={<FiUser className="text-[#FFB700]" />}
          >
            <input
              type="text"
              name="name"
              autoComplete="name"
              required
              value={form.name}
              onChange={onChange}
              placeholder="Votre nom ici"
              className="input"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-err" : undefined}
            />
          </Field>
          {errors.name && (
            <p id="name-err" className="err">
              {errors.name}
            </p>
          )}

          <Field label="E-mail" icon={<FiMail className="text-[#FFB700]" />}>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              inputMode="email"
              value={form.email}
              onChange={onChange}
              placeholder="votre@email.com"
              className="input"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-err" : undefined}
            />
          </Field>
          {errors.email && (
            <p id="email-err" className="err">
              {errors.email}
            </p>
          )}

          <Field
            label="Mot de passe"
            icon={<FiShield className="text-[#FFB700]" />}
          >
            <PasswordInput
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="Au moins 12 caractères"
              autoComplete="new-password"
              required
            />
          </Field>
          <StrengthBar score={pwdScore.score} hints={pwdScore.hints} />
          {errors.password && <p className="err">{errors.password}</p>}

          <Field
            label="Confirmer le mot de passe"
            icon={<FiShield className="text-[#FFB700]" />}
          >
            <PasswordInput
              name="confirm"
              value={form.confirm}
              onChange={onChange}
              placeholder="Répétez votre mot de passe"
              autoComplete="new-password"
              required
            />
          </Field>
          {errors.confirm && <p className="err">{errors.confirm}</p>}

          <label className="flex items-start gap-2 text-xs text-[#343434]">
            <input
              type="checkbox"
              name="terms"
              checked={form.terms}
              onChange={onChange}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#FFB700] focus:ring-[#FFB700]"
            />
            <span>
              J’accepte les{" "}
              <Link href="/mentions-legales" className="underline">
                conditions
              </Link>{" "}
              et la{" "}
              <Link href="/confidentialite" className="underline">
                politique de confidentialité
              </Link>
              .
            </span>
          </label>
          {errors.terms && <p className="err">{errors.terms}</p>}

          <div className="pt-2">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? (
                "Création…"
              ) : (
                <>
                  Créer mon compte <FiSend />
                </>
              )}
            </button>
            {done && (
              <span className="ml-3 text-sm text-green-700 inline-flex items-center gap-1">
                <FiCheck /> Vérifiez votre e-mail pour confirmer votre compte.
              </span>
            )}
          </div>

          <p className="text-sm text-[#6B6B6B]">
            Déjà membre ?{" "}
            <Link href="/connexion" className="underline">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

/* UI helpers */
function Field({ label, icon, children }) {
  return (
    <div>
      <label className="text-[13px] text-noir flex items-center gap-2 mb-1">
        {icon}
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-lg bg-white border border-gray-300 px-3 py-2 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-[#FFB700]/30">
        {children}
      </div>
    </div>
  );
}
function StrengthBar({ score, hints }) {
  const steps = [0, 1, 2, 3, 4].map((i) => i < score);
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-4 gap-1">
        {steps.slice(0, 4).map((ok, i) => (
          <div
            key={i}
            className={`h-1.5 rounded ${ok ? "bg-[#FFB700]" : "bg-gray-300"}`}
          />
        ))}
      </div>
      {hints.length > 0 && (
        <ul className="text-[11px] text-[#6B6B6B] list-disc list-inside">
          {hints.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

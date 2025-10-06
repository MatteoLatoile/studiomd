"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiLock, FiLogIn, FiMail } from "react-icons/fi";
import PasswordInput from "../components/PasswordInput";
import { supabase } from "../lib/supabase";

export default function ConnexionPage() {
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("E-mail invalide");
      return;
    }
    if (!form.password) {
      setError("Mot de passe requis");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }

    router.push("/");
  };

  return (
    <main className="bg-[#0B0B0F] pt-30 min-h-screen text-white">
      <div className="max-w-lg mx-auto px-4 md:px-6 pt-12 pb-24">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Connexion
        </h1>
        <p className="text-sm text-white/60 mt-2">Ravi de vous revoir.</p>

        <form
          onSubmit={onSubmit}
          noValidate
          className="mt-8 space-y-4 rounded-2xl bg-[#0F1117] ring-1 ring-white/10 shadow-xl p-6"
        >
          <Field label="E-mail" icon={<FiMail className="text-[#FFB700]" />}>
            <input
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={onChange}
              placeholder="votre@email.com"
              className="w-full bg-transparent outline-none text-white placeholder-white/30"
              aria-invalid={!!error}
            />
          </Field>

          <Field
            label="Mot de passe"
            icon={<FiLock className="text-[#FFB700]" />}
          >
            <PasswordInput
              name="password"
              value={form.password}
              onChange={onChange}
              autoComplete="current-password"
              required
              placeholder="Votre mot de passe"
              className="w-full bg-transparent outline-none text-white placeholder-white/30"
            />
          </Field>

          <div className="flex items-center justify-between text-xs text-white/80">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={onChange}
                className="h-4 w-4 rounded border-white/20 bg-transparent text-[#FFB700] focus:ring-[#FFB700]"
              />
              Se souvenir de moi
            </label>
            <Link href="/reset" className="underline">
              Mot de passe oublié ?
            </Link>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl px-10 py-4 text-sm font-medium text-black shadow hover:opacity-90 transition"
              style={{
                background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
              }}
            >
              {submitting ? (
                "Connexion…"
              ) : (
                <>
                  Se connecter <FiLogIn />
                </>
              )}
            </button>
          </div>

          <p className="text-sm text-white/60">
            Nouveau ?{" "}
            <Link href="/inscription" className="underline">
              Créer un compte
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

function Field({ label, icon, children }) {
  return (
    <div>
      <label className="text-[13px] text-white flex items-center gap-2 mb-1">
        {icon}
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-lg bg-[#0B0D12] border border-white/10 px-3 py-2 focus-within:border-white/20 focus-within:ring-2 focus-within:ring-[#FFB700]/20">
        {children}
      </div>
    </div>
  );
}

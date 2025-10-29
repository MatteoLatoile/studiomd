"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Erreur serveur");
      setMsg("Merci pour votre inscription 🎉 !");
      setEmail("");
    } catch (e) {
      setErr(e.message || "Impossible d’inscrire cet email 😕.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative isolate overflow-hidden bg-[#0A0A0D] py-20 px-6 sm:py-28 sm:px-8 text-center">
      {/* Dégradé d’arrière-plan subtil */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 50% 20%, rgba(255,184,0,0.15) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-2xl text-white">
        {/* Titre principal */}
        <motion.h2
          className="text-3xl sm:text-4xl font-extrabold mb-3 bg-gradient-to-r from-[#FFB700] to-[#FFEB83] bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
        >
          Abonnez-vous à notre newsletter
        </motion.h2>

        {/* Sous-titre */}
        <motion.p
          className="text-white/70 text-sm sm:text-base max-w-lg mx-auto mb-8"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Recevez nos dernières actualités, sorties, offres et projets
          directement dans votre boîte mail. Pas de spam, juste du bon contenu
          ✉️
        </motion.p>

        {/* Formulaire */}
        <motion.form
          onSubmit={onSubmit}
          className="relative flex flex-col sm:flex-row gap-3 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="relative w-full sm:w-auto sm:flex-1">
            <input
              type="email"
              required
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-[#111115] border border-white/10 px-5 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-[#FFEB83]/40 transition"
            />

            {/* Loader animé */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-[#FFEB83]/60 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl px-6 py-3 font-semibold text-black text-sm sm:text-base shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-60"
            style={{
              background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
            }}
          >
            {loading ? "Envoi…" : "S’abonner"}
          </button>
        </motion.form>

        {/* Messages de retour */}
        <div className="h-6 mt-4">
          <AnimatePresence mode="wait">
            {msg && (
              <motion.p
                key="msg"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-green-400 text-sm"
              >
                {msg}
              </motion.p>
            )}
            {err && (
              <motion.p
                key="err"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-red-400 text-sm"
              >
                {err}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

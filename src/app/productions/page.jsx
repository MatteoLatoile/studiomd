"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BsInstagram, BsLinkedin, BsYoutube } from "react-icons/bs";
import { supabase } from "../lib/supabase"; // ← même import que tes autres pages

const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.08 * i, ease },
  }),
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.04 } },
};

export default function ProductionsPage() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);

      const { data: u } = await supabase.auth.getUser();
      if (alive) setUser(u?.user || null);

      const { data, error } = await supabase
        .from("films")
        .select(
          "id, slug, title, director, category, year, runtime_min, poster_url"
        )
        .order("created_at", { ascending: false });

      if (!alive) return;
      if (error) {
        setErr(error.message);
        setFilms([]);
      } else {
        setFilms(data || []);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const isAdmin = !!user?.app_metadata?.is_admin;

  const stats = useMemo(() => {
    const count = films.length;
    const now = new Date().getFullYear();
    const current = films.filter((f) => (f?.year || 0) >= now).length;
    return { count, current };
  }, [films]);

  return (
    <main className="relative min-h-screen bg-[#0A0A0D] text-white overflow-hidden">
      {/* halos + grain */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-[#FFB700]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-[#FFB700]/5 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%224%22 height=%224%22><rect width=%224%22 height=%224%22 fill=%22black%22/><circle cx=%221%22 cy=%221%22 r=%220.6%22 fill=%22white%22 opacity=%220.15%22/></svg>')",
        }}
      />

      <LazyMotion features={domAnimation}>
        {/* HERO */}
        <section className="px-4 md:px-8 lg:px-20 pt-28 md:pt-32 pb-10">
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="max-w-5xl"
          >
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Nos <span className="text-[#FFB700]">productions</span>
            </h1>
            <p className="text-sm md:text-base text-white/70 mt-2">
              Réalisations avec nos partenaires. Des récits forts, une exigence
              technique, une signature visuelle soignée.
            </p>
          </m.div>

          {/* stats + réseaux */}
          <m.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="mt-10 grid gap-8 md:grid-cols-3 items-center"
          >
            <m.div variants={fadeUp} className="text-center md:text-left">
              <p className="text-5xl font-extrabold">
                {stats.count.toString().padStart(2, "0")}
              </p>
              <p className="text-white/70">Films publiés</p>
            </m.div>
            <m.div variants={fadeUp} className="text-center">
              <p className="text-5xl font-extrabold">
                {stats.current.toString().padStart(2, "0")}
              </p>
              <p className="text-white/70">En cours</p>
            </m.div>
            <m.div
              variants={fadeUp}
              className="flex justify-center md:justify-end gap-4"
            >
              <Social
                icon={<BsLinkedin />}
                label="LinkedIn"
                href="https://www.linkedin.com/company/studio-mont-d-or/"
              />
              <Social
                icon={<BsYoutube />}
                label="YouTube"
                href="https://www.youtube.com"
              />
              <Social
                icon={<BsInstagram />}
                label="Instagram"
                href="https://www.instagram.com"
              />
            </m.div>
          </m.div>
        </section>

        {/* GRID AFFICHES */}
        <section className="px-4 md:px-8 lg:px-20 pb-16">
          <m.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
            className="text-xl md:text-2xl font-semibold tracking-tight mb-4"
          >
            Sélection
          </m.h2>

          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-[#111118] ring-1 ring-white/10 h-[340px] animate-pulse"
                />
              ))}
            </div>
          )}

          {err && (
            <p className="text-sm text-red-400">Erreur de chargement : {err}</p>
          )}

          {!loading && !err && (
            <m.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {films.map((f, i) => (
                <PosterCard key={f.id} f={f} i={i} isAdmin={isAdmin} />
              ))}
              {films.length === 0 && (
                <p className="text-white/60 text-sm">
                  Aucun film pour le moment.
                </p>
              )}
            </m.div>
          )}
        </section>

        {/* APPROCHE */}
        <section className="px-4 md:px-8 lg:px-20 pb-20">
          <m.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
            className="text-xl md:text-2xl font-semibold tracking-tight mb-6"
          >
            Notre approche
          </m.h2>

          <m.ol
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            <Step
              i={0}
              title="Développement"
              desc="Accompagnement scénario, moodboard, casting et repérages."
            />
            <Step
              i={1}
              title="Tournage"
              desc="Équipes agiles, pipeline image/son robuste, DIT et sauvegardes."
            />
            <Step
              i={2}
              title="Post-production"
              desc="Montage, mixage, étalonnage, exports conformes, DCP."
            />
          </m.ol>
        </section>

        {/* CTA */}
        <section className="px-4 md:px-8 lg:px-20 pb-28">
          <m.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease }}
            className="rounded-3xl bg-gradient-to-r from-[#13131A] to-[#0E0E13] ring-1 ring-white/10 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h3 className="text-xl md:text-2xl font-semibold">
                Discutons de votre prochain film.
              </h3>
              <p className="text-sm text-white/70 mt-1">
                Un besoin précis ? On vous répond sous 24h ouvrées.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-black shadow-md hover:opacity-90 transition"
              style={{
                background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
              }}
            >
              Nous contacter
            </Link>
          </m.div>
        </section>
      </LazyMotion>
    </main>
  );
}

/* ====== UI ====== */

function Social({ icon, href, label }) {
  return (
    <Link
      href={href}
      aria-label={label}
      target="_blank"
      className="group h-12 w-12 rounded-2xl grid place-items-center bg-[#FFB700] text-black hover:scale-[1.03] transition will-change-transform"
    >
      <span className="text-xl">{icon}</span>
    </Link>
  );
}

function PosterCard({ f, i, isAdmin }) {
  const fallback =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='640'><rect width='100%' height='100%' fill='%23111118'/><text x='50%' y='50%' fill='%23ffffff' font-size='20' font-family='Arial' text-anchor='middle'>Affiche</text></svg>";

  return (
    <m.article
      variants={fadeUp}
      custom={i}
      className="group relative rounded-2xl overflow-hidden bg-[#121219] ring-1 ring-white/10"
    >
      <div className="aspect-[3/4] relative">
        {/* Utilise <img> pour éviter la config remotePatterns pendant le dev */}
        <img
          src={f.poster_url || fallback}
          alt={f.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] will-change-transform"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-70 group-hover:opacity-80 transition" />
      </div>

      <div className="absolute inset-0 p-4 flex flex-col justify-end">
        <h3 className="font-semibold">{f.title}</h3>
        <p className="text-xs text-white/70">
          {f.director}
          {f.year ? ` • ${f.year}` : ""}{" "}
          {f.runtime_min ? ` • ${f.runtime_min}’` : ""}
        </p>

        <div className="pt-3 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition flex gap-2">
          <Link
            href={`/productions/${encodeURIComponent(f.slug)}`}
            className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold text-black"
            style={{
              background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
            }}
          >
            Voir la fiche
          </Link>

          {isAdmin && (
            <Link
              href={`/dashboard/films/${encodeURIComponent(f.id)}`}
              className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/15 ring-1 ring-white/10"
              title="Modifier (admin)"
            >
              Modifier
            </Link>
          )}
        </div>
      </div>
    </m.article>
  );
}

function Step({ i, title, desc }) {
  return (
    <m.li
      variants={fadeUp}
      custom={i}
      className="rounded-2xl bg-[#111118] ring-1 ring-white/10 p-5"
    >
      <div className="h-7 w-7 rounded-lg bg-[#FFB700] text-black grid place-items-center font-bold">
        {i + 1}
      </div>
      <h4 className="mt-3 font-semibold">{title}</h4>
      <p className="mt-1 text-sm text-white/70">{desc}</p>
    </m.li>
  );
}

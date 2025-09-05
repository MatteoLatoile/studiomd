"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { BsInstagram, BsLinkedin, BsYoutube } from "react-icons/bs";
import Black from "../../../public/affiches/black.png";
import Fardeau from "../../../public/affiches/fardeau.png";
import Sil from "../../../public/affiches/sil.png";
import Sunshine from "../../../public/affiches/sunshine.png";

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

const productions = [
  {
    id: 1,
    title: "FARDEAU",
    author: "Naïl Bouhamadi",
    img: Fardeau,
    href: "/fardeau",
  },
  {
    id: 2,
    title: "You Are My Sunshine",
    author: "Preiya Dovel",
    img: Sunshine,
    href: "/you_are_my_sunshine",
  },
  {
    id: 3,
    title: "Silhouette",
    author: "Kendrick Courant",
    img: Sil,
    href: "/silhouette",
  },
  {
    id: 4,
    title: "Black Case",
    author: "Julien Bompart",
    img: Black,
    href: "/black_case",
  },
];

export default function Productions() {
  return (
    <main className="relative min-h-screen bg-[#0A0A0D] text-white overflow-hidden">
      {/* décor léger: halos + grain */}
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
              <p className="text-5xl font-extrabold">+350&nbsp;000</p>
              <p className="text-white/70">Spectateurs</p>
            </m.div>
            <m.div variants={fadeUp} className="text-center">
              <p className="text-5xl font-extrabold">2</p>
              <p className="text-white/70">Films en cours</p>
            </m.div>
            <m.div
              variants={fadeUp}
              className="flex justify-center md:justify-end gap-4"
            >
              <Social
                icon={<BsLinkedin />}
                label="LinkedIn"
                href="https://www.linkedin.com"
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

          <m.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {productions.map((p, i) => (
              <PosterCard key={p.id} p={p} i={i} />
            ))}
          </m.div>
        </section>

        {/* PROCESS (léger) */}
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

function PosterCard({ p, i }) {
  return (
    <m.article
      variants={fadeUp}
      custom={i}
      className="group relative rounded-2xl overflow-hidden bg-[#121219] ring-1 ring-white/10"
    >
      <div className="aspect-[3/4] relative">
        <Image
          src={p.img}
          alt={p.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04] will-change-transform"
          priority={i < 2}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-70 group-hover:opacity-80 transition" />
      </div>

      <div className="absolute inset-0 p-4 flex flex-col justify-end">
        <h3 className="font-semibold">{p.title}</h3>
        <p className="text-xs text-white/70">{p.author}</p>

        <div className="pt-3 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition">
          <Link
            href={p.href}
            className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold text-black"
            style={{
              background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
            }}
          >
            Voir la fiche
          </Link>
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

"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import Link from "next/link";

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
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

export default function AProposPage() {
  return (
    <main className="bg-[#0B0B0F] min-h-screen text-white">
      <LazyMotion features={domAnimation}>
        {/* HERO */}
        <section className="px-4 md:px-8 lg:px-20 pt-28 pb-8">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="max-w-5xl"
          >
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              À <span className="text-[#FFB700]">propos</span>
            </h1>
            <p className="text-sm md:text-base text-white/60 mt-2">
              S.A.S. SMD Factory — Société de production cinématographique.
            </p>
          </m.div>
        </section>

        {/* INFO LÉGALES */}
        <section className="px-4 md:px-8 lg:px-20 pb-10">
          <m.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl"
          >
            <InfoCard
              i={0}
              title="S.A.S. SMD Factory"
              lines={[
                "Au Capital de 16 000 €",
                "Société de production cinématographique",
              ]}
            />
            <InfoCard
              i={1}
              title="Enregistrement"
              lines={["SIRET : 942 300 146 00019", "APE : 5911C"]}
            />
            <InfoCard
              i={2}
              title="Contacts"
              lines={["contact@studiomontdor.com", "+33 (0)9 53 54 78 25"]}
            />
          </m.div>
        </section>

        {/* HISTOIRE */}
        <section className="px-4 md:px-8 lg:px-20 pb-6">
          <m.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
            className="max-w-4xl"
          >
            <h2 className="text-2xl md:text-3xl font-bold">
              Qui sommes-nous ?
            </h2>
            <p className="text-white/80 mt-3 leading-7">
              Et comment la société <strong>SMD Factory</strong> a-t-elle été
              créée ? La société SMD Factory est née de l’évolution du collectif{" "}
              <strong>Studio Mont D’or</strong>, fondé en 2021 par Kendrick
              COURANT et Karl BURON. Ce collectif a permis de produire de
              nombreux contenus audiovisuels : clips musicaux, courts-métrages,
              émissions, et bien plus encore.
            </p>
            <p className="text-white/80 mt-3 leading-7">
              En 2023, <strong>Julien BOMPART</strong> et{" "}
              <strong>Maxime GARCIA</strong> rejoignent l’aventure. C’est à ce
              moment que les grands projets prennent forme, notamment{" "}
              <em>Silhouette</em> et <em>Black Case</em>. Les tournages se
              multiplient, les émissions se concrétisent, et une décision
              majeure est prise : professionnaliser l’activité.
            </p>
            <p className="text-white/80 mt-3 leading-7">
              C’est ainsi qu’en 2025, la <strong>S.A.S SMD Factory</strong> voit
              le jour, fondée par Kendrick COURANT, Olivier COURANT, Maxime
              GARCIA et Julien BOMPART.
            </p>
            <p className="text-white/80 mt-3 leading-7">
              Aujourd’hui, SMD Factory se spécialise dans le{" "}
              <strong>cinéma de genre</strong>, avec une prédilection pour
              l’horreur. Notre ambition : repousser les limites tout en
              conservant une liberté artistique totale.
            </p>
          </m.div>

          {/* Timeline simple */}
          <m.ol
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="mt-8 grid md:grid-cols-3 gap-5 max-w-6xl"
          >
            <TimelineStep
              i={0}
              year="2021"
              title="Studio Mont D’or"
              desc="Naissance du collectif — clips, courts, émissions."
            />
            <TimelineStep
              i={1}
              year="2023"
              title="Accélération"
              desc="Arrivée de J. Bompart & M. Garcia — Silhouette, Black Case."
            />
            <TimelineStep
              i={2}
              year="2025"
              title="SAS SMD Factory"
              desc="Structuration & vision cinéma de genre."
            />
          </m.ol>
        </section>

        {/* ÉQUIPE */}
        <section className="px-4 md:px-8 lg:px-20 pb-16">
          <m.h3
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
            className="text-2xl md:text-3xl font-bold"
          >
            Notre équipe
          </m.h3>

          <m.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl"
          >
            <TeamCard
              i={0}
              name="Kendrick COURANT"
              role="Producteur délégué & Président de SMD Factory"
              initials="KC"
            />
            <TeamCard
              i={1}
              name="Maxime GARCIA"
              role="Producteur exécutif"
              initials="MG"
            />
            <TeamCard
              i={2}
              name="Julien BOMPART"
              role="Producteur exécutif & Responsable de la distribution"
              initials="JB"
            />
          </m.div>
        </section>

        {/* CTA CONTACT */}
        <section className="px-4 md:px-8 lg:px-20 pb-28">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease }}
            className="rounded-3xl bg-[#0F1117]/90 backdrop-blur-sm ring-1 ring-white/10 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h4 className="text-xl md:text-2xl font-semibold">
                Un projet à nous confier ?
              </h4>
              <p className="text-sm text-white/60 mt-1">
                On vous répond sous 24h ouvrées.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-black shadow hover:opacity-90 transition"
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

/* ================= UI SUB-COMPONENTS ================= */

function InfoCard({ i, title, lines }) {
  return (
    <m.div
      variants={fadeUp}
      custom={i}
      className="rounded-2xl bg-[#0F1117] ring-1 ring-white/10 shadow-xl p-5"
    >
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-2 text-sm text-white/70 space-y-1">
        {lines.map((l, idx) => (
          <li key={idx}>{l}</li>
        ))}
      </ul>
    </m.div>
  );
}

function TimelineStep({ i, year, title, desc }) {
  return (
    <m.li
      variants={fadeUp}
      custom={i}
      className="rounded-2xl bg-[#0F1117] ring-1 ring-white/10 p-5 relative"
    >
      <div className="absolute -left-1 top-5 h-3 w-3 rounded-full bg-[#FFB700]" />
      <div className="ml-4">
        <p className="text-xs font-semibold text-[#FFB700]">{year}</p>
        <p className="font-semibold mt-1">{title}</p>
        <p className="text-sm text-white/70 mt-1">{desc}</p>
      </div>
    </m.li>
  );
}

function TeamCard({ i, name, role, initials }) {
  return (
    <m.article
      variants={fadeUp}
      custom={i}
      className="rounded-2xl bg-[#0F1117] ring-1 ring-white/10 p-5 flex items-start gap-4"
    >
      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#FFC119] to-[#FFEB83] text-black font-extrabold grid place-items-center">
        {initials}
      </div>
      <div>
        <h4 className="font-semibold">{name}</h4>
        <p className="text-sm text-white/70">{role}</p>
      </div>
    </m.article>
  );
}

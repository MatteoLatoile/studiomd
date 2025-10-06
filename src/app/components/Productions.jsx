"use client";
import { LazyMotion, domAnimation, m } from "framer-motion";
import Black from "../../../public/affiches/black.webp";
import Fardeau from "../../../public/affiches/fardeau.webp";
import Sil from "../../../public/affiches/sil.webp";
import Sunshine from "../../../public/affiches/sunshine.webp";
import AfficheFilm from "./AfficheFilm";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Productions() {
  return (
    <LazyMotion features={domAnimation}>
      <section className="px-4 md:px-20 mt-32">
        <m.h3
          className="text-3xl md:text-4xl font-bold tracking-tight text-[#000] mb-4"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
        >
          Nos <span className="text-[#FFB700]">productions</span>
        </m.h3>

        <m.p
          className="text-lg md:text-sm leading-4 mb-10 text-[#6B6B6B]"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
        >
          Découvrez une sélection de nos productions : films, clips et projets
          audiovisuels. Chaque projet reflète notre exigence et notre passion.
        </m.p>

        <m.div
          className="flex p-10 flex-col md:flex-row justify-center gap-8 m-auto"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          <AfficheFilm
            href="/fardeau"
            affiche={Fardeau}
            film="FARDEAU"
            auteur="Naïl Bouhamadi"
          />
          <AfficheFilm
            href="/you_are_my_sunshine"
            affiche={Sunshine}
            film="You Are My Sunshine"
            auteur="Preiya Dovel"
          />
          <AfficheFilm
            href="/silhouette"
            affiche={Sil}
            film="Silhouette"
            auteur="Kendrick Courant"
          />
          <AfficheFilm
            href="/black_case"
            affiche={Black}
            film="Black Case"
            auteur="Julien Bompart"
          />
        </m.div>
      </section>
    </LazyMotion>
  );
}

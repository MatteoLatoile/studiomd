"use client";

import { BsFillMegaphoneFill } from "react-icons/bs";
import { FiCamera } from "react-icons/fi";
import { MdOutlineLocalMovies } from "react-icons/md";
import Black from "../../public/affiches/black.png";
import Fardeau from "../../public/affiches/fardeau.png";
import Sil from "../../public/affiches/sil.png";
import Sunshine from "../../public/affiches/sunshine.png";
import AfficheFilm from "./components/AfficheFilm";
import ServiceCard from "./components/CardService";
import Hero from "./components/Hero";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const Home = () => {
  return (
    <motion.div
      className="bg-[#FDF6E3] pb-28"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Hero />

      {/* SERVICES */}
      <section className="px-4 md:px-20 mt-30">
        <motion.h3
          className="text-3xl md:text-4xl font-bold tracking-tight text-noir mb-4"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
        >
          Nos <span className="text-[#FFB700]">services</span>
        </motion.h3>

        <motion.p
          className="text-lg md:text-sm leading-4 mb-10 text-[#6B6B6B]"
          variants={fadeUp}
          custom={1}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
        >
          De l’équipement au delivery : <br className="hidden sm:block" />
          un accompagnement complet, fiable et rapide.
        </motion.p>

        <motion.div
          className="grid gap-6 md:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div variants={fadeUp}>
            <ServiceCard
              icon={<FiCamera className="text-4xl text-noir" />}
              title="Location d’équipement"
              description={
                <div>
                  Matériel professionnel haut de gamme pour tous vos projets
                  cinématographiques :
                  <ul className="mt-2 list-disc list-inside">
                    <li>Caméra 4K</li>
                    <li>Matériel audio</li>
                    <li>Éclairage professionnel</li>
                  </ul>
                </div>
              }
              ctaLabel="Voir le catalogue"
              href="/catalogue"
            />
          </motion.div>

          <motion.div variants={fadeUp} custom={1}>
            <ServiceCard
              icon={<MdOutlineLocalMovies className="text-4xl text-noir" />}
              title="Production & tournage"
              description={
                <div>
                  Équipes agiles pour pubs, clips, fictions et docs :
                  <ul className="mt-2 list-disc list-inside">
                    <li>Réalisation & cadre</li>
                    <li>Son & lumière</li>
                    <li>Assistanat & DIT</li>
                  </ul>
                </div>
              }
              ctaLabel="Voir les packs"
              href="/catalogue"
            />
          </motion.div>

          <motion.div variants={fadeUp} custom={2}>
            <ServiceCard
              icon={<BsFillMegaphoneFill className="text-4xl text-noir" />}
              title="Post-prod & delivery"
              description={
                <div>
                  Montage, étalonnage, mixage, exports conformes :
                  <ul className="mt-2 list-disc list-inside">
                    <li>Color grading</li>
                    <li>Sound design</li>
                    <li>Mastering & DCP</li>
                  </ul>
                </div>
              }
              ctaLabel="Discuter d’un devis"
              href="/location"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* PRODUCTIONS */}
      <section className="px-4 md:px-20 mt-30">
        <motion.h3
          className="text-3xl md:text-4xl  font-bold tracking-tight text-noir mb-4"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
        >
          Nos <span className="text-[#FFB700]">productions</span>
        </motion.h3>

        <motion.p
          className="text-lg md:text-sm leading-4 mb-10 text-[#6B6B6B]"
          variants={fadeUp}
          custom={1}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
        >
          Découvrez une sélection de nos productions : films, clips et projets{" "}
          <br />
          audiovisuels réalisés avec nos équipes et nos partenaires. <br />
          Entre créativité et exigence technique, <br /> chaque projet reflète
          notre savoir-faire et notre passion pour l’image.
        </motion.p>

        <motion.div
          className="flex p-10 flex-col md:flex-row justify-center gap-8 m-auto"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {/* PAS de motion.div ici */}
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
        </motion.div>
      </section>
    </motion.div>
  );
};

export default Home;

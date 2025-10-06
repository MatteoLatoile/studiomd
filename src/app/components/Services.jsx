"use client";
import { LazyMotion, domAnimation, m } from "framer-motion";
import ServiceCard from "./ServiceCard";
import { IconCamera, IconClap, IconMegaphone } from "./icons";

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
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export default function Services() {
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
          Nos <span className="text-[#FFB700]">services</span>
        </m.h3>

        <m.p
          className="text-lg md:text-sm leading-4 mb-10 text-[#000]"
          variants={fadeUp}
          custom={1}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
        >
          De l’équipement au delivery : <br className="hidden sm:block" />
          un accompagnement complet, fiable et rapide.
        </m.p>

        <m.div
          className="grid gap-6 md:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <m.div variants={fadeUp}>
            <ServiceCard
              icon={<IconCamera className="h-8 w-8 fill-[#000]" />}
              title="Location d’équipement"
              description={
                <div>
                  Matériel professionnel haut de gamme :
                  <ul className="mt-2 list-disc list-inside">
                    <li>Caméra 4K</li>
                    <li>Matériel audio</li>
                    <li>Éclairage pro</li>
                  </ul>
                </div>
              }
              ctaLabel="Voir le catalogue"
              href="/catalogue"
            />
          </m.div>

          <m.div variants={fadeUp} custom={1}>
            <ServiceCard
              icon={<IconClap className="h-8 w-8 fill-[#000]" />}
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
          </m.div>

          <m.div variants={fadeUp} custom={2}>
            <ServiceCard
              icon={<IconMegaphone className="h-8 w-8 fill-[#000]" />}
              title="Post-prod & delivery"
              description={
                <div>
                  Montage, étalonnage, mixage :
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
          </m.div>
        </m.div>
      </section>
    </LazyMotion>
  );
}

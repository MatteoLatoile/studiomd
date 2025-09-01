"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const MotionLink = motion(Link);

const AfficheFilm = ({ affiche, film, auteur, href = "#" }) => {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useTransform(ry, [-50, 50], [8, -8]);
  const rotateY = useTransform(rx, [-50, 50], [-8, 8]);

  const onMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    rx.set(x);
    ry.set(y);
  };

  const onMouseLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <MotionLink
      href={href}
      className="md:w-1/5 w-full space-y-2 group block cursor-pointer"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Affiche */}
      <motion.div
        ref={ref}
        className="overflow-hidden rounded-lg will-change-transform"
        style={{ perspective: 800, transformStyle: "preserve-3d" }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <motion.div style={{ rotateX, rotateY }} className="relative">
          <Image
            src={affiche}
            alt={`Affiche du film ${film}`}
            className="w-full h-auto object-cover select-none"
            draggable={false}
          />
          {/* Shine */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.25) 40%, transparent 60%)",
            }}
            initial={{ x: "-120%" }}
            whileHover={{ x: "120%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </motion.div>
      </motion.div>

      {/* Titre du film */}
      <h4 className="text-lg md:text-xl font-bold tracking-tight text-noir leading-snug group-hover:text-[#FFB700] transition-colors">
        {film}
      </h4>

      {/* Auteur */}
      <p className="text-sm text-[#6B6B6B] tracking-tight">{auteur}</p>
    </MotionLink>
  );
};

export default AfficheFilm;

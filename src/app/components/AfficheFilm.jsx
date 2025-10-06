"use client";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const MotionLink = motion(Link);

export default function AfficheFilm({ affiche, film, auteur, href = "#" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useTransform(ry, [-50, 50], [8, -8]);
  const rotateY = useTransform(rx, [-50, 50], [-8, 8]);

  const onMouseMove = (e) => {
    if (reduce) return;
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
      <motion.div
        ref={ref}
        className="overflow-hidden rounded-lg will-change-transform"
        style={{ perspective: 800, transformStyle: "preserve-3d" }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        whileHover={reduce ? undefined : { scale: 1.03 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <motion.div
          style={reduce ? undefined : { rotateX, rotateY }}
          className="relative"
        >
          <div className="relative w-full aspect-[3/4]">
            <Image
              src={affiche}
              alt={`Affiche du film ${film}`}
              fill
              sizes="(max-width: 768px) 50vw, 20vw"
              className="object-cover select-none"
              priority={false}
              draggable={false}
            />
          </div>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.25) 40%, transparent 60%)",
            }}
            initial={{ x: "-120%" }}
            whileHover={reduce ? undefined : { x: "120%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </motion.div>
      </motion.div>

      <h4 className="text-lg md:text-xl font-bold tracking-tight text-noir leading-snug group-hover:text-[#FFB700] transition-colors">
        {film}
      </h4>
      <p className="text-sm text-[#6B6B6B] tracking-tight">{auteur}</p>
    </MotionLink>
  );
}

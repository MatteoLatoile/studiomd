"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function ServiceCard({
  icon,
  title,
  description,
  ctaLabel = "Voir le catalogue",
  href = "#",
  imageSrc,
  imageAlt = "",
}) {
  return (
    <motion.div
      className="relative rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5 overflow-hidden"
      initial={{ opacity: 0, y: 24, rotateX: -6 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
    >
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FFB700] to-[#FFEB83]" />
      <div className="p-7 pt-9">
        <div className="mb-6 flex justify-center">
          {icon ? (
            icon
          ) : imageSrc ? (
            <div className="relative h-12 w-12">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-contain"
              />
            </div>
          ) : null}
        </div>

        <h3 className="text-2xl font-bold tracking-tight text-noir mb-4">
          {title}
        </h3>

        <div className="text-[#6B6B6B] leading-relaxed mb-6 text-[15px]">
          {typeof description === "string" ? <p>{description}</p> : description}
        </div>

        <motion.div
          whileHover={{ x: 2 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
        >
          <Link
            href={href}
            className="w-full inline-flex items-center justify-center rounded-xl py-3 font-medium text-noir shadow hover:opacity-95 transition"
            style={{
              background: "linear-gradient(90deg,#FFB700 0%,#FFEB83 100%)",
            }}
          >
            {ctaLabel}
          </Link>
        </motion.div>
      </div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-1 rounded-2xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          background:
            "radial-gradient(600px 120px at 50% -20%, rgba(255,183,0,0.25), transparent 60%)",
          mixBlendMode: "screen",
        }}
      />
    </motion.div>
  );
}

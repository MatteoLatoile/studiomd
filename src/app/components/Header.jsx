"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  FiChevronDown,
  FiMenu,
  FiSearch,
  FiShoppingCart,
  FiX,
} from "react-icons/fi";
import Logo from "../../../public/logo.webp";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // --- visibilité contrôlée par le scroll uniquement sur la home
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [visible, setVisible] = useState(!isHome); // visible direct sur toutes les pages sauf home
  const ticking = useRef(false);

  useEffect(() => {
    if (!isHome) return; // pas de logique scroll hors home

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const vh = window.innerHeight || 0;
        const shouldShow = y >= vh - 1;
        setVisible(shouldShow || menuOpen); // si menu ouvert, visible de force
        ticking.current = false;
      });
    };

    // initial check (si on arrive ancré plus bas)
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome, menuOpen]);

  // si on ouvre le menu, on force visible (utile sur home quand top)
  useEffect(() => {
    if (!isHome) return;
    if (menuOpen) setVisible(true);
  }, [menuOpen, isHome]);

  return (
    <header
      className={[
        "fixed top-0 inset-x-0 z-[60]",
        // style & blur quand visible
        "backdrop-blur supports-[backdrop-filter]:bg-[#ffffff80] bg-[#FDF6E3]/95",
        // petite anim classe
        "transition-all duration-300",
        visible
          ? "opacity-100 translate-y-0 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          : "opacity-0 -translate-y-3 pointer-events-none",
      ].join(" ")}
      // role bannière
      role="banner"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 flex items-center justify-between gap-4 relative py-3">
        {/* Gauche : logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="shrink-0" aria-label="Aller à l’accueil">
            <Image
              src={Logo}
              alt="Studio Mont d'Or"
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="text-noir/80 hover:text-noir font-medium">
              Accueil
            </Link>

            {/* Services + dropdown stylé */}
            <div className="relative group">
              <button
                className="flex items-center gap-1 text-noir/60 hover:text-noir font-medium"
                aria-haspopup="menu"
                aria-expanded="false"
              >
                Services
                <FiChevronDown className="text-sm transition-transform duration-200 group-hover:rotate-180" />
              </button>

              <div
                className="
                  absolute left-0 top-full w-64 z-30
                  opacity-0 translate-y-1 scale-95 pointer-events-none
                  group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto
                  transition-all duration-150 origin-top
                "
                role="menu"
              >
                <div
                  className="
                    relative rounded-2xl overflow-hidden
                    bg-white/90 backdrop-blur-md
                    ring-1 ring-black/5 border border-[#F5E8C7]
                    shadow-[0_10px_30px_rgba(0,0,0,0.08)]
                    p-2
                  "
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFB700] to-[#FFEB83]" />

                  <ul className="pt-3">
                    <li>
                      <Link
                        href="/services/location"
                        className="flex items-center justify-between w-full px-3 py-2 rounded-xl hover:bg-[#FDF6E3] hover:ring-1 hover:ring-[#FFEB83]/70 text-noir text-sm transition"
                      >
                        Location d'équipements{" "}
                        <span className="text-xs text-gris">→</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/services/production"
                        className="flex items-center justify-between w-full px-3 py-2 rounded-xl hover:bg-[#FDF6E3] hover:ring-1 hover:ring-[#FFEB83]/70 text-noir text-sm transition"
                      >
                        Production <span className="text-xs text-gris">→</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/services/distribution"
                        className="flex items-center justify-between w-full px-3 py-2 rounded-xl hover:bg-[#FDF6E3] hover:ring-1 hover:ring-[#FFEB83]/70 text-noir text-sm transition"
                      >
                        Distribution de films{" "}
                        <span className="text-xs text-gris">→</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <Link href="/a-propos" className="text-noir/60 hover:text-noir">
              à propos
            </Link>
            <Link href="/contact" className="text-noir/60 hover:text-noir">
              Contact
            </Link>
          </nav>
        </div>

        {/* Centre : search (masqué en mobile) */}
        <form
          className="hidden md:flex mx-auto flex-1 justify-center"
          role="search"
        >
          <div className="relative w-full max-w-xl">
            <FiSearch className="absolute text-[#FFB700] left-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none" />
            <input
              type="text"
              placeholder="Cherchez une référence ici…"
              className="w-full rounded-full bg-white pl-11 pr-4 py-3 text-sm placeholder:text-gris/80 outline-none ring-1 ring-white/70 shadow-lg shadow-black/10 focus:ring-2 focus:ring-orFonce"
            />
          </div>
        </form>

        {/* Droite */}
        <div className="flex items-center gap-4">
          <Link
            href="/panier"
            aria-label="Voir le panier"
            className="p-2 rounded-full hover:bg-blancCasse/60 transition"
          >
            <FiShoppingCart className="text-jaune text-xl" />
          </Link>

          <Link
            href="/connexion"
            className="hidden sm:inline-flex items-center rounded-2xl px-10 py-4 text-sm font-medium text-noir shadow hover:opacity-90 transition"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,193,25,1) 49%, rgba(255,235,131,1) 100%)",
            }}
          >
            Connexion
          </Link>

          {/* Burger mobile */}
          <button
            className="md:hidden p-2 text-noir"
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <FiMenu className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Offcanvas menu mobile */}
      <div
        className={`fixed inset-0 z-[70] transform ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        ></div>

        {/* Panel */}
        <div className="absolute right-0 top-0 h-full w-72 bg-[#FDF6E3] shadow-lg flex flex-col p-6">
          <div className="flex justify-between items-center mb-6">
            <Image src={Logo} alt="Studio Mont d'Or" className="h-8 w-auto" />
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Fermer le menu"
            >
              <FiX className="text-2xl text-noir" />
            </button>
          </div>

          <nav className="flex flex-col gap-4 text-noir text-base font-medium">
            <Link href="/" onClick={() => setMenuOpen(false)}>
              Accueil
            </Link>

            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer">
                Services{" "}
                <FiChevronDown className="transition group-open:rotate-180" />
              </summary>
              <div className="ml-4 mt-2 flex flex-col gap-2 text-sm">
                <Link
                  href="/services/location"
                  onClick={() => setMenuOpen(false)}
                >
                  Location d'équipements
                </Link>
                <Link
                  href="/services/production"
                  onClick={() => setMenuOpen(false)}
                >
                  Production
                </Link>
                <Link
                  href="/services/distribution"
                  onClick={() => setMenuOpen(false)}
                >
                  Distribution de films
                </Link>
              </div>
            </details>

            <Link href="/a-propos" onClick={() => setMenuOpen(false)}>
              à propos
            </Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)}>
              Contact
            </Link>
          </nav>

          <div className="mt-auto">
            <Link
              href="/connexion"
              className="w-full inline-flex items-center justify-center rounded-2xl px-10 py-3 text-sm font-medium text-noir shadow hover:opacity-90 transition"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,193,25,1) 49%, rgba(255,235,131,1) 100%)",
              }}
              onClick={() => setMenuOpen(false)}
            >
              Connexion
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

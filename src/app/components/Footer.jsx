// components/Footer.js
"use client";

import Image from "next/image";
import Link from "next/link";
import { FiInstagram, FiLinkedin, FiYoutube } from "react-icons/fi";
import LogoFooter from "../../../public/logofooter.png";

const Footer = () => {
  return (
    <footer className="bg-[#1B1B1B] text-[#FAFAF0]">
      <div className="mx-auto max-w-7xl px-4 md:px-20 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1 : Logo + baseline */}
          <div>
            <Image
              src={LogoFooter}
              alt="Studio Mont d'Or"
              className="h-10 w-auto mb-4"
              priority
            />
            <p className="text-[#CFCFC7]/90 leading-relaxed">
              Location et production
              <br /> audiovisuelle professionnelle.
            </p>
          </div>

          {/* Col 2 : Navigation */}
          <div>
            <h4 className="text-[#FFB700] font-semibold mb-4">
              Navigation rapide
            </h4>
            <ul className="space-y-2 text-[#9A9A93]">
              <li>
                <Link href="/" className="hover:text-[#FAFAF0] transition">
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/services/location"
                  className="hover:text-[#FAFAF0] transition"
                >
                  Location d’équipement
                </Link>
              </li>
              <li>
                <Link
                  href="/services/production"
                  className="hover:text-[#FAFAF0] transition"
                >
                  Production
                </Link>
              </li>
              <li>
                <Link
                  href="/services/distribution"
                  className="hover:text-[#FAFAF0] transition"
                >
                  Distribution du film
                </Link>
              </li>
              <li>
                <Link
                  href="/a-propos"
                  className="hover:text-[#FAFAF0] transition"
                >
                  À propos
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 : Contact */}
          <div>
            <h4 className="text-[#FFB700] font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-[#CFCFC7]">
              <p>123 Avenue de l’Exemple</p>
              <p>69000 Lyon</p>
              <p>+33 6 78 87 56 78</p>
              <p>contact@email.com</p>
            </div>
          </div>

          {/* Col 4 : Réseaux + Légal */}
          <div>
            <h4 className="text-[#FFB700] font-semibold mb-4">Suivez-nous</h4>

            <div className="flex items-center gap-3 mb-6">
              <Link
                href="https://www.linkedin.com"
                aria-label="LinkedIn"
                className="grid place-items-center h-10 w-10 rounded-full shadow hover:opacity-90 transition"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,183,0,1) 0%, rgba(255,235,131,1) 100%)",
                }}
              >
                <FiLinkedin className="text-[#1B1B1B] text-xl" />
              </Link>
              <Link
                href="https://www.youtube.com"
                aria-label="YouTube"
                className="grid place-items-center h-10 w-10 rounded-full shadow hover:opacity-90 transition"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,183,0,1) 0%, rgba(255,235,131,1) 100%)",
                }}
              >
                <FiYoutube className="text-[#1B1B1B] text-xl" />
              </Link>
              <Link
                href="https://www.instagram.com"
                aria-label="Instagram"
                className="grid place-items-center h-10 w-10 rounded-full shadow hover:opacity-90 transition"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,183,0,1) 0%, rgba(255,235,131,1) 100%)",
                }}
              >
                <FiInstagram className="text-[#1B1B1B] text-xl" />
              </Link>
            </div>

            <div className="space-y-2 text-[#9A9A93]">
              <Link href="/mentions-legales" className="hover:text-[#FAFAF0]">
                Mentions légales
              </Link>
              <br />
              <Link
                href="/politique-confidentialite"
                className="hover:text-[#FAFAF0]"
              >
                Politique de confidentialité
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bas de page fin */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 flex items-center justify-between text-xs text-[#9A9A93]">
          <span>
            © {new Date().getFullYear()} Studio Mont d’Or — Tous droits
            réservés.
          </span>
          <span className="hidden sm:inline">
            Design épuré • Performance • Accessibilité
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

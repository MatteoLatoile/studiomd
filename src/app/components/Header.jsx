"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiChevronDown,
  FiLogOut,
  FiMenu,
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiX,
} from "react-icons/fi";
import Logo from "../../../public/logo.webp";
import { supabase } from "../lib/supabase";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const pathname = usePathname();
  const isHome = pathname === "/";
  const isDarkPage = useMemo(
    () => pathname?.startsWith("/productions"),
    [pathname]
  );

  const [visible, setVisible] = useState(!isHome);
  const ticking = useRef(false);

  // --------- palette dynamique (PAS de couleurs figées ailleurs) ----------
  const tone = useMemo(() => {
    if (isDarkPage) {
      return {
        headerBg: "supports-[backdrop-filter]:bg-[#00000099] bg-black/80",
        link: "text-white/80 hover:text-white",
        dim: "text-white/60 hover:text-white",
        searchInput:
          "bg-[#0F0F14] text-white placeholder:text-white/50 ring-white/10 focus:ring-2 focus:ring-[#FFB700]",
        dropdownBg: "bg-[#0F0F14]/95 border border-white/10",
        userIcon: "text-white",
        hoverSurface: "hover:bg-white/5",
        mobilePanel: "bg-[#0F0F14] text-white",
      };
    }
    return {
      headerBg: "supports-[backdrop-filter]:bg-[#ffffff80] bg-[#FDF6E3]/95",
      link: "text-noir/80 hover:text-noir",
      dim: "text-noir/60 hover:text-noir",
      searchInput:
        "bg-white text-noir placeholder:text-gris/80 ring-white/70 shadow-black/10 focus:ring-2 focus:ring-orFonce",
      dropdownBg: "bg-white/90 border border-[#F5E8C7]",
      userIcon: "text-noir",
      hoverSurface: "hover:bg-blancCasse/60",
      mobilePanel: "bg-[#FDF6E3] text-noir",
    };
  }, [isDarkPage]);

  // --------- util cart ----------
  async function fetchCartCount(uid) {
    if (!uid) return 0;
    const { data } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("user_id", uid);
    return (data || []).reduce((s, r) => s + (r?.quantity || 0), 0);
  }

  // --------- auth + badge ----------
  useEffect(() => {
    let channel, poll;

    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const currentUser = u?.user || null;
      setUser(currentUser);
      setCartCount(await fetchCartCount(currentUser?.id));

      if (currentUser?.id) {
        channel = supabase
          .channel(`cart-count-${currentUser.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "cart_items",
              filter: `user_id=eq.${currentUser.id}`,
            },
            async () => setCartCount(await fetchCartCount(currentUser.id))
          )
          .subscribe();
      }

      poll = setInterval(async () => {
        const { data: sess } = await supabase.auth.getUser();
        const uid = sess?.user?.id;
        if (!uid) return setCartCount(0);
        setCartCount(await fetchCartCount(uid));
      }, 10000);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_evt, session) => {
        const u = session?.user || null;
        setUser(u);
        setCartCount(await fetchCartCount(u?.id));
        if (channel) supabase.removeChannel(channel);
        if (u?.id) {
          channel = supabase
            .channel(`cart-count-${u.id}`)
            .on(
              "postgres_changes",
              {
                event: "*",
                schema: "public",
                table: "cart_items",
                filter: `user_id=eq.${u.id}`,
              },
              async () => setCartCount(await fetchCartCount(u.id))
            )
            .subscribe();
        }
      }
    );

    const onManualChange = async () => {
      const { data: sess } = await supabase.auth.getUser();
      setCartCount(await fetchCartCount(sess?.user?.id));
    };
    window.addEventListener("cart:changed", onManualChange);

    return () => {
      listener?.subscription?.unsubscribe();
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener("cart:changed", onManualChange);
      if (poll) clearInterval(poll);
    };
  }, []);

  // --------- apparition (home only) ----------
  useEffect(() => {
    if (!isHome) {
      setVisible(true);
      return;
    }
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const vh = window.innerHeight || 0;
        const shouldShow = y >= vh - 1;
        setVisible(shouldShow || menuOpen);
        ticking.current = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome, menuOpen]);

  const isAdmin = !!user?.app_metadata?.is_admin;
  const cartLabel =
    cartCount > 0
      ? `Voir le panier (${cartCount} article${cartCount > 1 ? "s" : ""})`
      : "Voir le panier";

  return (
    <header
      className={[
        "fixed top-0 inset-x-0 z-[60] backdrop-blur transition-all duration-300",
        tone.headerBg,
        visible
          ? "opacity-100 translate-y-0 shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
          : "opacity-0 -translate-y-3 pointer-events-none",
      ].join(" ")}
      role="banner"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 flex items-center justify-between gap-4 relative py-3">
        {/* Gauche */}
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
            <Link href="/" className={`${tone.link} font-medium`}>
              Accueil
            </Link>

            <div className="relative group">
              <button
                className={`flex items-center gap-1 ${tone.dim} font-medium`}
                aria-haspopup="menu"
                aria-expanded="false"
              >
                Services
                <FiChevronDown className="text-sm transition-transform duration-200 group-hover:rotate-180" />
              </button>

              <div
                className="absolute left-0 top-full w-64 z-30 opacity-0 translate-y-1 scale-95 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-150 origin-top"
                role="menu"
              >
                <div
                  className={`relative rounded-2xl overflow-hidden ${tone.dropdownBg} shadow-[0_10px_30px_rgba(0,0,0,0.18)] p-2`}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFB700] to-[#FFEB83]" />
                  <ul className="pt-3">
                    <li>
                      <Link
                        href="/services/location"
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-xl ${
                          tone.hoverSurface
                        } text-sm transition ${
                          isDarkPage ? "text-white" : "text-noir"
                        }`}
                      >
                        Location d'équipements{" "}
                        <span
                          className={`text-xs ${
                            isDarkPage ? "text-white/60" : "text-gris"
                          }`}
                        >
                          →
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/services/production"
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-xl ${
                          tone.hoverSurface
                        } text-sm transition ${
                          isDarkPage ? "text-white" : "text-noir"
                        }`}
                      >
                        Production{" "}
                        <span
                          className={`text-xs ${
                            isDarkPage ? "text-white/60" : "text-gris"
                          }`}
                        >
                          →
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/services/distribution"
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-xl ${
                          tone.hoverSurface
                        } text-sm transition ${
                          isDarkPage ? "text-white" : "text-noir"
                        }`}
                      >
                        Distribution de films{" "}
                        <span
                          className={`text-xs ${
                            isDarkPage ? "text-white/60" : "text-gris"
                          }`}
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <Link href="/a-propos" className={tone.dim}>
              à propos
            </Link>
            <Link href="/contact" className={tone.dim}>
              Contact
            </Link>

            {isAdmin && (
              <Link href="/dashboard" className={`${tone.link} font-medium`}>
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* Centre : recherche */}
        <form
          className="hidden md:flex mx-auto flex-1 justify-center"
          role="search"
        >
          <div className="relative w-full max-w-xl">
            <FiSearch className="absolute text-[#FFB700] left-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none" />
            <input
              type="text"
              placeholder="Cherchez une référence ici…"
              className={`w-full rounded-full pl-11 pr-4 py-3 text-sm outline-none ring-1 ${tone.searchInput}`}
            />
          </div>
        </form>

        {/* Droite */}
        <div className="flex items-center gap-4">
          <Link
            href="/panier"
            aria-label={cartLabel}
            className={`p-2 rounded-full ${tone.hoverSurface} transition`}
          >
            <span className="relative inline-block align-middle">
              <FiShoppingCart className="text-jaune text-xl" />
              {user && cartCount > 0 && (
                <span
                  className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 min-w-[16px] h-[16px] px-[3px] rounded-full bg-red-600 text-white text-[10px] font-bold leading-[16px] text-center shadow pointer-events-none"
                  aria-hidden
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </span>
          </Link>

          {user ? (
            <div className="relative group">
              <button
                className={`p-2 rounded-full ${tone.hoverSurface} transition relative`}
                aria-label="Compte utilisateur"
              >
                <FiUser className={`text-2xl ${tone.userIcon}`} />
              </button>
              <div
                className={`absolute right-0 mt-2 w-48 ${
                  isDarkPage ? "bg-[#0F0F14]" : "bg-white"
                } rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-y-1 transition-all duration-200 z-50 pointer-events-auto`}
              >
                {isAdmin && (
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-2 w-full px-4 py-3 text-sm rounded-lg transition ${
                      isDarkPage
                        ? "text-white hover:bg-white/5"
                        : "text-noir hover:bg-[#FDF6E3] hover:ring-1 hover:ring-[#FFEB83]/70"
                    }`}
                  >
                    <span className="flex-1 text-left">Dashboard</span>
                  </Link>
                )}
                <button
                  className={`flex items-center gap-2 w-full px-4 py-3 text-sm rounded-lg transition ${
                    isDarkPage
                      ? "text-white hover:bg-white/5"
                      : "text-noir hover:bg-[#FDF6E3] hover:ring-1 hover:ring-[#FFEB83]/70"
                  }`}
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.reload();
                  }}
                >
                  <FiX className="text-lg" />
                  <span className="flex-1 text-left">Déconnexion</span>
                  <FiLogOut className="text-base text-jaune" />
                </button>
              </div>
            </div>
          ) : (
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
          )}

          <button
            className={`md:hidden p-2 ${tone.userIcon}`}
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <FiMenu className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        className={`fixed inset-0 z-[70] transform ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        ></div>
        <div
          className={`absolute right-0 top-0 h-full w-72 ${tone.mobilePanel
            .split(" ")
            .slice(0, 1)} shadow-lg flex flex-col p-6 ${
            tone.mobilePanel.includes("text-white") ? "text-white" : "text-noir"
          }`}
        >
          <div className="flex justify-between items-center mb-6">
            <Image src={Logo} alt="Studio Mont d'Or" className="h-8 w-auto" />
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Fermer le menu"
            >
              <FiX className={`text-2xl ${tone.userIcon}`} />
            </button>
          </div>
          <nav
            className={`flex flex-col gap-4 ${
              tone.mobilePanel.includes("text-white")
                ? "text-white"
                : "text-noir"
            } text-base font-medium`}
          >
            <Link href="/" onClick={() => setMenuOpen(false)}>
              Accueil
            </Link>
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer">
                Services{" "}
                <FiChevronDown
                  className={`transition group-open:rotate-180 ${tone.userIcon}`}
                />
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
            {isAdmin && (
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
            )}
          </nav>
          <div className="mt-auto">
            {user ? (
              <button
                className="w-full inline-flex items-center justify-center rounded-2xl px-10 py-3 text-sm font-medium text-noir shadow hover:opacity-90 transition"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(255,193,25,1) 49%, rgba(255,235,131,1) 100%)",
                }}
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
              >
                Déconnexion
              </button>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

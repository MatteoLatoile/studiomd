import { Roboto } from "next/font/google";
import AnalyticsLoader from "./components/AnalyticsLoader";
import CookieBanner from "./components/CookieBanner";
import Footer from "./components/Footer";
import Header from "./components/Header";
import "./globals.css";

// Font
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// --- SEO global ---
export const metadata = {
  metadataBase: new URL("https://www.studiomontdor.com"),
  title: {
    default: "Studio Mont d’Or — Location & production audiovisuelle à Lyon",
    template: "%s | Studio Mont d’Or",
  },
  description:
    "Studio Mont d’Or est un studio audiovisuel à Lyon spécialisé dans la location de matériel vidéo, la production et la post-production. Équipe pro, matériel haut de gamme, devis rapide.",
  keywords: [
    "studio audiovisuel lyon",
    "location caméra lyon",
    "location lumière lyon",
    "production vidéo lyon",
    "post-production lyon",
    "studio tournage lyon",
    "studio mont d'or",
  ],
  openGraph: {
    type: "website",
    url: "https://www.studiomontdor.com",
    title: "Studio Mont d’Or — Location & production audiovisuelle à Lyon",
    description:
      "Location de matériel vidéo, tournage, montage, mixage et étalonnage à Lyon. Accompagnement complet du tournage à la post-production.",
    siteName: "Studio Mont d’Or",
    images: [
      {
        url: "/og-default.jpg", // à mettre dans /public/
        width: 1200,
        height: 630,
        alt: "Studio Mont d’Or — Production audiovisuelle à Lyon",
      },
    ],
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Studio Mont d’Or — Location & production audiovisuelle à Lyon",
    description:
      "Studio audiovisuel à Lyon : location, tournage et post-production. Caméras, lumière, son, équipe pro et devis rapide.",
    images: ["/og-default.jpg"],
    creator: "@studiomontdor",
  },
  icons: {
    icon: "public/logo.webp",
    shortcut: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  category: "audiovisuel",
  themeColor: "#0A0A0D",
};

// --- Layout ---
export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body
        className={`${roboto.className} bg-[#0A0A0D] text-white min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
        <AnalyticsLoader />
      </body>
    </html>
  );
}

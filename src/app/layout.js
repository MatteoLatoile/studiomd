import { Roboto } from "next/font/google";
import Footer from "./components/Footer";
import Header from "./components/Header";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Normal, Medium, Bold
  display: "swap",
});

export const metadata = {
  title: "Location Audiovisuelle Pro",
  description:
    "Location de matériel audiovisuel pro – rapide, simple, efficace.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={roboto.className}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

// SERVER: pas de "use client"
import dynamic from "next/dynamic";
import Hero from "./components/Hero"; // client
import NewsletterForm from "./components/NewsletterForm";
import Services from "./components/Services"; // client

const Productions = dynamic(() => import("./components/Productions"), {
  ssr: true,
  loading: () => (
    <section className="px-4 md:px-20 mt-32">
      <div className="h-8 w-48 bg-white/10 rounded mb-6" />
      <div className="grid gap-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-white/10 rounded" />
        ))}
      </div>
    </section>
  ),
});

export const revalidate = 60;

export default function Home() {
  return (
    <div className="bg-[#0A0A0D] text-white pb-28">
      <Hero />
      <Services />
      <Productions />
      <NewsletterForm />
    </div>
  );
}

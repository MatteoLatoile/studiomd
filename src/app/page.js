// SERVER: pas de "use client"
import dynamic from "next/dynamic";
import Hero from "./components/Hero"; // client
import Services from "./components/Services"; // client

const Productions = dynamic(() => import("./components/Productions"), {
  ssr: true,
  loading: () => (
    <section className="px-4 md:px-20 mt-32">
      <div className="h-8 w-48 bg-black/10 rounded mb-6" />
      <div className="grid gap-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-black/10 rounded" />
        ))}
      </div>
    </section>
  ),
});

export const revalidate = 60;

export default function Home() {
  return (
    <div className="bg-[#FDF6E3] pb-28">
      <Hero />
      <Services />
      <Productions />
    </div>
  );
}

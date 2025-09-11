"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FiSearch, FiX } from "react-icons/fi";

export default function OrderSearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const initial = useMemo(() => searchParams.get("q") || "", [searchParams]);
  const [q, setQ] = useState(initial);

  // petit debounce pour éviter de spam le router
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (q) params.set("q", q);
      else params.delete("q");
      router.replace(`${pathname}?${params.toString()}`);
    }, 250);
    return () => clearTimeout(t);
  }, [q, pathname, router, searchParams]);

  return (
    <div className="relative w-full max-w-md">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FFB700]" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher une commande (ID)…"
        className="w-full pl-10 pr-9 py-2 rounded-xl bg-white ring-1 ring-black/10 outline-none text-sm"
      />
      {q && (
        <button
          onClick={() => setQ("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-black/5"
          aria-label="Effacer"
        >
          <FiX />
        </button>
      )}
    </div>
  );
}

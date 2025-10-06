"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import AddProductFAB from "../components/AddProductFAB";
import Filters from "../components/Filters";
import ProductCard from "../components/ProductCard";
import { supabase } from "../lib/supabase";

function SkeletonCard() {
  return (
    <div className="relative bg-white rounded-xl shadow p-4 space-y-2 ring-1 ring-[#f5e8c7] animate-pulse">
      {/* Actions admin fantômes */}
      <div className="absolute top-2 left-2 h-6 w-16 bg-black/5 rounded-full" />
      <div className="absolute top-2 right-2 h-6 w-6 bg-black/5 rounded-full" />

      {/* Image */}
      <div className="flex justify-center items-center h-36">
        <div className="h-32 w-full rounded-lg bg-black/5" />
      </div>

      {/* Textes */}
      <div className="space-y-2">
        <div className="h-4 w-3/4 bg-black/5 rounded" />
        <div className="h-3 w-full bg-black/5 rounded" />
        <div className="h-3 w-5/6 bg-black/5 rounded" />
      </div>

      {/* Tags */}
      <div className="flex gap-2">
        <div className="h-5 w-14 rounded-full bg-[#FFF3C4]" />
        <div className="h-5 w-10 rounded-full bg-[#FFF3C4]" />
        <div className="h-5 w-16 rounded-full bg-[#FFF3C4]" />
      </div>

      {/* Prix */}
      <div className="h-4 w-24 bg-black/5 rounded" />

      {/* CTA */}
      <div className="h-9 w-full rounded-lg bg-black/10" />
    </div>
  );
}

export default function LocationPage() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [user, setUser] = useState(null);

  // hydrate depuis l’URL au 1er render
  useEffect(() => {
    const cat = searchParams.get("category");
    const brand = searchParams.get("brand");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (cat) setSelectedCategories([cat]);
    if (brand) setSelectedBrands([brand]);
    if (start) setStartDate(start);
    if (end) setEndDate(end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // user => admin
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (mounted) setUser(user || null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);
  const isAdmin = !!user?.app_metadata?.is_admin;

  // fetch products (+ stock + tags)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, description, price, category, stock, tags, image_url, image_path, created_at"
        )
        .order("created_at", { ascending: false });

      if (!mounted) return;
      if (error) {
        setErr(error.message);
        setProducts([]);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // catégories → filtres + modal
  const allCategories = useMemo(() => {
    const set = new Set(
      (products || []).map((p) => p.category).filter(Boolean)
    );
    return Array.from(set).sort();
  }, [products]);

  // si tu n’utilises pas brand, laisse vide
  const allBrands = useMemo(() => {
    const set = new Set((products || []).map((p) => p.brand).filter(Boolean));
    return Array.from(set).sort();
  }, [products]);

  // filtrage local
  const filtered = useMemo(() => {
    return (products || []).filter((product) => {
      const name = (product.name || "").toLowerCase();
      const matchesSearch = name.includes(search.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);
      const price = Number(product.price) || 0;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, search, selectedCategories, priceRange]);

  // combien de squelettes ? (responsive-friendly)
  const skeletonCount = 9; // 9 ≈ 3 colonnes x 3 rangées en md

  return (
    <div className="bg-[#FDF6E3] min-h-screen py-30 px-4 md:px-15 relative">
      <h1 className="text-3xl font-bold text-noir">Locations d’équipement</h1>
      <p className="text-sm tracking-tighter mb-10 text-gray-600 mt-2">
        Caméras, optiques, audio, lumière… <br /> tout l’équipement dont vous
        avez besoin, prêt à tourner quand vous l’êtes.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        <Filters
          categories={allCategories}
          brands={allBrands}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedBrands={selectedBrands}
          setSelectedBrands={setSelectedBrands}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />

        <div>
          <div className="flex items-center relative mb-4">
            <FiSearch className="absolute left-3 text-[#FFB700]" />
            <input
              type="text"
              placeholder="Cherchez une référence ici…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-full text-sm shadow ring-1 ring-white/70 bg-white outline-none"
            />
          </div>

          {err && <p className="text-sm text-red-600">Erreur : {err}</p>}

          {/* GRID */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {loading &&
              Array.from({ length: skeletonCount }).map((_, i) => (
                <SkeletonCard key={`sk-${i}`} />
              ))}

            {!loading &&
              !err &&
              filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isAdmin={isAdmin}
                  categories={allCategories}
                  onDeleted={(id) =>
                    setProducts((prev) => prev.filter((x) => x.id !== id))
                  }
                  onUpdated={(up) =>
                    setProducts((prev) =>
                      prev.map((x) => (x.id === up.id ? up : x))
                    )
                  }
                />
              ))}

            {!loading && !err && filtered.length === 0 && (
              <p className="text-sm text-noir/60">
                Aucun produit ne correspond à votre recherche.
              </p>
            )}
          </div>
        </div>
      </div>

      <AddProductFAB
        isAdmin={isAdmin}
        categories={allCategories}
        onCreated={(prod) => setProducts((prev) => [prod, ...prev])}
      />
    </div>
  );
}

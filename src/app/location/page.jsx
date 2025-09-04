"use client";

import { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import AddProductFAB from "../components/AddProductFAB";
import Filters from "../components/Filters";
import ProductCard from "../components/ProductCard";
import { supabase } from "../lib/supabase";

export default function LocationPage() {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [user, setUser] = useState(null);

  // user => isAdmin
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

  // fetch products
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, description, price, category, image_url, image_path")
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
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(set).sort();
  }, [products]);

  // filtrage
  const filtered = useMemo(() => {
    return (products || []).filter((product) => {
      const name = (product.name || "").toLowerCase();
      const matchesSearch = name.includes(search.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);
      const matchesBrand =
        selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const price = Number(product.price) || 0;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    });
  }, [products, search, selectedCategories, selectedBrands, priceRange]);

  return (
    <div className="bg-[#FDF6E3] min-h-screen py-30 px-4 md:px-15 relative">
      <h1 className="text-3xl font-bold text-noir">Locations d’équipement</h1>
      <p className="text-sm tracking-tighter mb-10  text-gray-600 mt-2">
        Caméras, optiques, audio, lumière… <br /> tout l’équipement dont vous
        avez besoin, prêt à tourner quand vous l’êtes.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        <Filters
          categories={allCategories}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedBrands={selectedBrands}
          setSelectedBrands={setSelectedBrands}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
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

          {loading && <p className="text-sm text-noir/60">Chargement…</p>}
          {err && <p className="text-sm text-red-600">Erreur : {err}</p>}

          {!loading && !err && (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((p) => (
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

              {filtered.length === 0 && (
                <p className="text-sm text-noir/60">
                  Aucun produit ne correspond à votre recherche.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FAB admin only */}
      <AddProductFAB
        isAdmin={isAdmin}
        categories={allCategories}
        onCreated={(prod) => setProducts((prev) => [prod, ...prev])}
      />
    </div>
  );
}

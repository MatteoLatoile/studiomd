"use client";

import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import Filters from "../components/Filters";
import ProductCard from "../components/ProductCard";

const mockProducts = [
  {
    id: 1,
    name: "Sony EXG - Boîtier",
    price: 76,
    category: "Caméras",
    brand: "Sony",
  },
  {
    id: 2,
    name: "Canon C300 Mark III",
    price: 1230,
    category: "Caméras",
    brand: "Canon",
  },
  {
    id: 3,
    name: "Microphone Pro",
    price: 76,
    category: "Audio",
    brand: "Sony",
  },
  // Ajoute plus si besoin...
];

export default function LocationPage() {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([50, 2000]);

  const filtered = mockProducts.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category);
    const matchesBrand =
      selectedBrands.length === 0 || selectedBrands.includes(product.brand);
    const matchesPrice =
      product.price >= priceRange[0] && product.price <= priceRange[1];

    return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
  });

  return (
    <div className="bg-[#FFF5D7] min-h-screen py-10 px-4 md:px-8">
      <h1 className="text-3xl font-bold text-noir">Locations d’équipement</h1>
      <p className="text-sm text-noir/60 mt-2">
        Caméras, optiques, audio, lumière… tout l’équipement dont vous avez
        besoin, prêt à tourner quand vous l’êtes.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        {/* Filtres */}
        <Filters
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedBrands={selectedBrands}
          setSelectedBrands={setSelectedBrands}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
        />

        {/* Résultats */}
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

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { FiFilter, FiRotateCw, FiX } from "react-icons/fi";

const DEFAULT_CATEGORIES = [
  "Éclairage",
  "Vidéo-assist",
  "Accessoires",
  "Caméras",
  "Audio",
];
const DEFAULT_BRANDS = ["Canon", "Sony"];

export default function Filters({
  categories: categoriesProp,
  brands: brandsProp,
  selectedCategories,
  setSelectedCategories,
  selectedBrands,
  setSelectedBrands,
  priceRange,
  setPriceRange,
}) {
  // listes finales (props > défauts)
  const categories = useMemo(
    () =>
      Array.isArray(categoriesProp) && categoriesProp.length
        ? categoriesProp
        : DEFAULT_CATEGORIES,
    [categoriesProp]
  );
  const brands = useMemo(
    () =>
      Array.isArray(brandsProp) && brandsProp.length
        ? brandsProp
        : DEFAULT_BRANDS,
    [brandsProp]
  );

  // bornes prix
  const MIN_P = 0;
  const MAX_P = 10000;
  const GAP = 1;

  const toggle = (list, value, setter) => {
    setter(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    );
  };

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([MIN_P, MAX_P]);
  };

  // slider min/max
  const onMinChange = (v) => {
    const n = Math.min(Math.max(Number(v), MIN_P), priceRange[1] - GAP);
    setPriceRange([n, priceRange[1]]);
  };
  const onMaxChange = (v) => {
    const n = Math.max(Math.min(Number(v), MAX_P), priceRange[0] + GAP);
    setPriceRange([priceRange[0], n]);
  };

  // styles pour la “barre remplie” entre les deux valeurs
  const leftPct = ((priceRange[0] - MIN_P) / (MAX_P - MIN_P)) * 100;
  const rightPct = ((priceRange[1] - MIN_P) / (MAX_P - MIN_P)) * 100;

  return (
    <aside className="sticky top-24 self-start">
      {/* Carte glass + bordure gradient */}
      <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-[#FFC119] via-[#FFEB83] to-transparent shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
        <div className="rounded-3xl bg-white/80 backdrop-blur-md ring-1 ring-black/5">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
            <div className="flex items-center gap-2 text-noir">
              <FiFilter className="text-[#FFC119]" />
              <h2 className="font-bold">Filtres</h2>
            </div>
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-2 text-xs font-semibold text-noir/80 hover:text-noir px-3 py-1.5 rounded-full ring-1 ring-black/10 hover:ring-black/20 transition cursor-pointer"
              title="Réinitialiser tous les filtres"
            >
              <FiRotateCw /> Réinitialiser
            </button>
          </div>

          {/* Badges sélectionnés */}
          {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
            <div className="px-5 pt-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((c) => (
                  <button
                    key={`cat-${c}`}
                    onClick={() =>
                      toggle(selectedCategories, c, setSelectedCategories)
                    }
                    className="group inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium
                               bg-[#FFF3C4] ring-1 ring-[#FFD966]/70 hover:bg-[#FFE48A] transition cursor-pointer"
                    title="Retirer ce filtre"
                  >
                    {c}
                    <FiX className="opacity-70 group-hover:opacity-100" />
                  </button>
                ))}
                {selectedBrands.map((b) => (
                  <button
                    key={`brand-${b}`}
                    onClick={() => toggle(selectedBrands, b, setSelectedBrands)}
                    className="group inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium
                               bg-[#E9F0FF] ring-1 ring-[#B9CEFF]/70 hover:bg-[#D9E6FF] transition cursor-pointer"
                    title="Retirer ce filtre"
                  >
                    {b}
                    <FiX className="opacity-70 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sections */}
          <div className="px-5 py-5 space-y-8">
            {/* Catégories */}
            <section>
              <h3 className="text-sm font-semibold text-noir mb-3">
                Catégories
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => {
                  const checked = selectedCategories.includes(c);
                  return (
                    <label
                      key={c}
                      className={[
                        "cursor-pointer select-none rounded-full px-3 py-1.5 text-xs font-semibold transition",
                        "ring-1 hover:ring-2",
                        checked
                          ? "bg-gradient-to-r from-[#FFC119] to-[#FFEB83] text-black ring-[#F5D76E]"
                          : "bg-white text-noir ring-black/10 hover:ring-[#FFC119]/50",
                      ].join(" ")}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() =>
                          toggle(selectedCategories, c, setSelectedCategories)
                        }
                      />
                      {c}
                    </label>
                  );
                })}
              </div>
            </section>

            {/* Marques */}
            <section>
              <h3 className="text-sm font-semibold text-noir mb-3">Marques</h3>
              <div className="flex flex-wrap gap-2">
                {brands.map((b) => {
                  const checked = selectedBrands.includes(b);
                  return (
                    <label
                      key={b}
                      className={[
                        "cursor-pointer select-none rounded-full px-3 py-1.5 text-xs font-semibold transition",
                        "ring-1 hover:ring-2",
                        checked
                          ? "bg-white text-noir ring-[#B9CEFF] shadow-[0_4px_14px_rgba(100,120,255,0.15)]"
                          : "bg-white text-noir ring-black/10 hover:ring-[#90A7FF]/50",
                      ].join(" ")}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() =>
                          toggle(selectedBrands, b, setSelectedBrands)
                        }
                      />
                      {b}
                    </label>
                  );
                })}
              </div>
            </section>

            {/* Prix / jour */}
            <section>
              <h3 className="text-sm font-semibold text-noir mb-4">
                Prix / jour
              </h3>

              {/* Valeurs */}
              <div className="flex items-center justify-between text-xs text-noir/70 mb-2">
                <div className="inline-flex items-center gap-2">
                  <span className="px-2 py-1 rounded-md bg-white ring-1 ring-black/10">
                    {priceRange[0]}€
                  </span>
                  <span className="opacity-50">—</span>
                  <span className="px-2 py-1 rounded-md bg-white ring-1 ring-black/10">
                    {priceRange[1]}€
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={MIN_P}
                    max={priceRange[1] - GAP}
                    value={priceRange[0]}
                    onChange={(e) => onMinChange(e.target.value)}
                    className="w-20 px-2 py-1 rounded-md border border-black/10 text-xs outline-none"
                  />
                  <span className="opacity-50 text-[10px]">min</span>
                  <input
                    type="number"
                    min={priceRange[0] + GAP}
                    max={MAX_P}
                    value={priceRange[1]}
                    onChange={(e) => onMaxChange(e.target.value)}
                    className="w-20 px-2 py-1 rounded-md border border-black/10 text-xs outline-none"
                  />
                  <span className="opacity-50 text-[10px]">max</span>
                </div>
              </div>

              {/* Double slider simple */}
              <div className="relative pt-4 pb-1">
                {/* piste */}
                <div className="h-2 rounded-full bg-white ring-1 ring-black/10 relative">
                  <div
                    className="absolute h-2 rounded-full"
                    style={{
                      left: `${leftPct}%`,
                      width: `${rightPct - leftPct}%`,
                      background:
                        "linear-gradient(90deg, rgba(255,193,25,1) 0%, rgba(255,235,131,1) 100%)",
                      boxShadow: "0 0 12px rgba(255,193,25,0.35)",
                    }}
                  />
                </div>

                {/* input min */}
                <input
                  type="range"
                  min={MIN_P}
                  max={MAX_P}
                  value={priceRange[0]}
                  onChange={(e) => onMinChange(e.target.value)}
                  className="absolute inset-0 w-full h-2 appearance-none bg-transparent pointer-events-auto"
                  style={{ WebkitAppearance: "none" }}
                />
                {/* input max */}
                <input
                  type="range"
                  min={MIN_P}
                  max={MAX_P}
                  value={priceRange[1]}
                  onChange={(e) => onMaxChange(e.target.value)}
                  className="absolute inset-0 w-full h-2 appearance-none bg-transparent pointer-events-auto"
                  style={{ WebkitAppearance: "none" }}
                />
              </div>

              {/* Astuce: on ne touche pas aux thumbs natifs ici pour rester full-Tailwind / no CSS custom */}
            </section>
          </div>
        </div>
      </div>
    </aside>
  );
}

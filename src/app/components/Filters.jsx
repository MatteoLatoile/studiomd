const categories = [
  "Éclairage",
  "Vidéo-assist",
  "Accessoires",
  "Caméras",
  "Audio",
];
const brands = ["Canon", "Sony"];

export default function Filters({
  selectedCategories,
  setSelectedCategories,
  selectedBrands,
  setSelectedBrands,
  priceRange,
  setPriceRange,
}) {
  const toggle = (list, value, setter) => {
    if (list.includes(value)) {
      setter(list.filter((v) => v !== value));
    } else {
      setter([...list, value]);
    }
  };

  return (
    <aside className="space-y-6">
      <div>
        <h2 className="font-bold text-lg text-noir">Catégories</h2>
        <ul className="mt-2 space-y-2 text-sm text-noir">
          {categories.map((c) => (
            <li key={c}>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(c)}
                  onChange={() =>
                    toggle(selectedCategories, c, setSelectedCategories)
                  }
                />
                {c}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-bold text-lg text-noir">Marques</h2>
        <ul className="mt-2 space-y-2 text-sm text-noir">
          {brands.map((b) => (
            <li key={b}>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(b)}
                  onChange={() => toggle(selectedBrands, b, setSelectedBrands)}
                />
                {b}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-bold text-lg text-noir">Prix /jour</h2>
        <div className="flex items-center justify-between text-sm">
          <span>{priceRange[0]}€</span>
          <span>{priceRange[1]}€</span>
        </div>
        <input
          type="range"
          min={50}
          max={2000}
          value={priceRange[1]}
          onChange={(e) =>
            setPriceRange([priceRange[0], Number(e.target.value)])
          }
          className="w-full mt-2"
        />
      </div>
    </aside>
  );
}

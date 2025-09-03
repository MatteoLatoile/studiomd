import { FiBox, FiShoppingCart } from "react-icons/fi";

export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-2 ring-1 ring-[#f5e8c7]">
      <div className="flex justify-center items-center h-36">
        <FiBox className="text-6xl text-gray-400" />
      </div>

      <div>
        <h3 className="font-bold text-noir text-sm">{product.name}</h3>
        <p className="text-xs text-gray-600">4K / 230 - Monture E XAVC</p>
      </div>

      <p className="text-sm text-noir">
        à {product.price}€ <span className="text-[#FFB700]">/jour</span>
      </p>

      <button
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-noir shadow-md text-sm hover:opacity-90 transition"
        style={{
          background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
        }}
      >
        Ajouter <FiShoppingCart />
      </button>
    </div>
  );
}

import { FiBox } from "react-icons/fi";
import AddToCartButton from "./AddToCartButton";
import DeleteProductButton from "./DeleteProductButton";
import EditProductButton from "./EditProductButton";

export default function ProductCard({
  product,
  isAdmin = false,
  categories = [],
  onDeleted,
  onUpdated,
}) {
  const hasImage = Boolean(product?.image_url);

  return (
    <div className="relative bg-white rounded-xl shadow p-4 space-y-2 ring-1 ring-[#f5e8c7]">
      {isAdmin && (
        <>
          {/* MODIFIER en haut-gauche */}
          <div className="absolute top-2 left-2 z-20">
            <EditProductButton
              product={product}
              categories={categories}
              onUpdated={onUpdated}
            />
          </div>

          {/* SUPPRIMER en haut-droite */}
          <div className="absolute top-2 right-2 z-20">
            <DeleteProductButton productId={product.id} onDeleted={onDeleted} />
          </div>
        </>
      )}

      <div className="flex justify-center items-center h-36">
        {hasImage ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-36 w-full object-contain rounded-lg"
            loading="lazy"
          />
        ) : (
          <FiBox className="text-6xl text-gray-400" />
        )}
      </div>

      <div>
        <h3 className="font-bold text-noir text-sm line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-2">
          {product.description || "—"}
        </p>
      </div>

      <p className="text-sm text-noir">
        à {Number(product.price).toFixed(2)}€{" "}
        <span className="text-[#FFB700]">/jour</span>
      </p>

      <AddToCartButton productId={product.id} />
    </div>
  );
}

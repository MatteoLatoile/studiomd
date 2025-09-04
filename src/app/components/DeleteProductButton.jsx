"use client";

import { useState } from "react";

export default function DeleteProductButton({ productId, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function handleDelete() {
    setLoading(true);
    setErr(null);

    const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErr(data.error || "Erreur inconnue");
      return;
    }

    setOpen(false);
    if (onDeleted) onDeleted(productId);
  }

  return (
    <>
      {/* Bouton rouge, positionné sur la carte */}
      <button
        onClick={() => setOpen(true)}
        className="absolute top-2 right-2 bg-red-600 text-white rounded-full px-2 py-1 text-xs font-bold hover:bg-red-700 shadow"
        aria-label="Supprimer le produit"
      >
        Supprimer
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-red-600">
              Confirmer la suppression
            </h2>
            <p className="text-sm text-gray-600">
              Es-tu sûr de vouloir supprimer ce produit ? Cette action est
              irréversible.
            </p>
            {err && <p className="text-sm text-red-600">{err}</p>}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Suppression..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

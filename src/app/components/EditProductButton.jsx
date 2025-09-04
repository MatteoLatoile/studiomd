"use client";

import { useMemo, useState } from "react";
import { FiEdit2 } from "react-icons/fi";

export default function EditProductButton({
  product,
  categories = [],
  onUpdated,
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState(null);
  const [preview, setPreview] = useState(product.image_url || "");

  const sortedCats = useMemo(
    () => Array.from(new Set(categories.filter(Boolean))).sort(),
    [categories]
  );

  // la catégorie du produit n’est peut-être pas dans la liste (au cas où)
  const catInList = sortedCats.includes(product.category);

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setErr(null);

    const formEl = e.currentTarget;
    const fd = new FormData(formEl);

    // si "Autre…" est choisi, remplace par la valeur saisie
    if (fd.get("category") === "__other__") {
      fd.set("category", (fd.get("other_category") || "").toString().trim());
    }
    fd.delete("other_category");

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        body: fd,
      });

      let payload = null;
      try {
        payload = await res.json();
      } catch (_) {}

      if (!res.ok) {
        throw new Error(payload?.error || `HTTP ${res.status}`);
      }

      // retour à l’UI
      onUpdated?.(payload.data);
      setOpen(false);
    } catch (e) {
      setErr(e.message || "Erreur réseau");
    } finally {
      setPending(false);
    }
  }

  function onFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return setPreview(product.image_url || "");
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  return (
    <>
      {/* Bouton modifier (admin only – tu le rends conditionnel dans la card) */}
      <button
        onClick={() => setOpen(true)}
        className="rounded-full px-3 py-1 text-xs font-semibold shadow cursor-pointer
                   bg-white/90 hover:bg-white ring-1 ring-black/10"
        title="Modifier"
        aria-label="Modifier"
      >
        <span className="inline-flex items-center gap-1">
          <FiEdit2 className="text-base" /> Modifier
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Modifier le produit</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-2xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <span className="block text-sm font-medium">Image</span>
                  {preview ? (
                    <img
                      src={preview}
                      alt=""
                      className="mt-1 h-36 w-full object-cover rounded-lg ring-1 ring-black/10"
                    />
                  ) : null}
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    className="mt-2 w-full"
                    onChange={onFileChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Laisse vide pour conserver l’image actuelle.
                  </p>
                </div>

                <label className="col-span-2">
                  <span className="block text-sm font-medium">Nom</span>
                  <input
                    name="name"
                    defaultValue={product.name}
                    required
                    className="mt-1 w-full rounded-lg border p-2"
                  />
                </label>

                <label className="col-span-2">
                  <span className="block text-sm font-medium">Description</span>
                  <textarea
                    name="description"
                    defaultValue={product.description}
                    rows={3}
                    required
                    className="mt-1 w-full rounded-lg border p-2"
                  />
                </label>

                <label>
                  <span className="block text-sm font-medium">Prix (€)</span>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={Number(product.price)}
                    required
                    className="mt-1 w-full rounded-lg border p-2"
                  />
                </label>

                <div>
                  <span className="block text-sm font-medium">Catégorie</span>
                  <select
                    name="category"
                    className="mt-1 w-full rounded-lg border p-2"
                    defaultValue={catInList ? product.category : "__other__"}
                    onChange={(e) => {
                      // si autre => afficher champ texte
                      const otherRow = document.getElementById(
                        `other-cat-${product.id}`
                      );
                      if (otherRow)
                        otherRow.style.display =
                          e.target.value === "__other__" ? "block" : "none";
                    }}
                    required
                  >
                    <option value="" disabled>
                      Choisir…
                    </option>
                    {sortedCats.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__other__">Autre…</option>
                  </select>
                </div>

                <label
                  id={`other-cat-${product.id}`}
                  style={{ display: catInList ? "none" : "block" }}
                >
                  <span className="block text-sm font-medium">
                    Nouvelle catégorie
                  </span>
                  <input
                    name="other_category"
                    className="mt-1 w-full rounded-lg border p-2"
                    placeholder="ex: Accessoires"
                    defaultValue={catInList ? "" : product.category}
                  />
                </label>
              </div>

              {err && <p className="text-red-600 text-sm">{err}</p>}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg border cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="px-4 py-2 rounded-lg text-black font-semibold cursor-pointer shadow"
                  style={{
                    background:
                      "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
                  }}
                >
                  {pending ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

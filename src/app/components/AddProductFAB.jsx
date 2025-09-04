"use client";

import { useMemo, useState } from "react";

export default function AddProductFAB({ isAdmin, categories = [], onCreated }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState(null);

  const [useOtherCat, setUseOtherCat] = useState(false);

  const sortedCats = useMemo(
    () => Array.from(new Set(categories.filter(Boolean))).sort(),
    [categories]
  );

  if (!isAdmin) return null; // visible uniquement admin

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setErr(null);

    const formEl = e.currentTarget;
    const fd = new FormData(formEl);

    // catégorie : si “Autre…”, on remplace par le champ texte
    if (fd.get("category") === "__other__") {
      fd.set("category", (fd.get("other_category") || "").toString().trim());
    }
    fd.delete("other_category");

    const res = await fetch("/api/products", { method: "POST", body: fd });
    const payload = await res.json();
    setPending(false);

    if (!res.ok) {
      setErr(payload.error || "Erreur inconnue");
      return;
    }

    formEl.reset();
    setUseOtherCat(false);
    setOpen(false);
    onCreated?.(payload.data);
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 h-16 w-16 rounded-full shadow-xl cursor-pointer
                   flex items-center justify-center text-3xl text-black"
        style={{
          background: "linear-gradient(135deg,#FFC119 0%,#FFEB83 100%)",
        }}
        aria-label="Ajouter un produit"
        title="Ajouter un produit"
      >
        +
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Ajouter un produit</h2>
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
                <label className="col-span-2">
                  <span className="block text-sm font-medium">Image</span>
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    required
                    className="mt-1 w-full"
                  />
                </label>

                <label className="col-span-2">
                  <span className="block text-sm font-medium">Nom</span>
                  <input
                    name="name"
                    required
                    className="mt-1 w-full rounded-lg border p-2"
                  />
                </label>

                <label className="col-span-2">
                  <span className="block text-sm font-medium">Description</span>
                  <textarea
                    name="description"
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
                    required
                    className="mt-1 w-full rounded-lg border p-2"
                  />
                </label>

                <div>
                  <span className="block text-sm font-medium">Catégorie</span>
                  <select
                    name="category"
                    className="mt-1 w-full rounded-lg border p-2"
                    onChange={(e) =>
                      setUseOtherCat(e.target.value === "__other__")
                    }
                    defaultValue=""
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

                {useOtherCat && (
                  <label>
                    <span className="block text-sm font-medium">
                      Nouvelle catégorie
                    </span>
                    <input
                      name="other_category"
                      className="mt-1 w-full rounded-lg border p-2"
                      placeholder="ex: Accessoires"
                    />
                  </label>
                )}
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
                  {pending ? "Ajout..." : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

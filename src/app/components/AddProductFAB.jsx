"use client";

import { useMemo, useState } from "react";

// Catégories (ta liste figée)
const CATEGORIES = [
  "Batterie",
  "Camera",
  "costume-accesoire",
  "eclairage",
  "machinerie",
  "monitoring",
  "son",
];

export default function AddProductFAB({ isAdmin, categories = [], onCreated }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState(null);

  const [useOtherCat, setUseOtherCat] = useState(false);

  // Tags UI
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);

  const sortedCats = useMemo(() => {
    const base = CATEGORIES.length ? CATEGORIES : categories;
    return Array.from(new Set(base.filter(Boolean)));
  }, [categories]);

  if (!isAdmin) return null;

  function addTag() {
    const t = tagInput.trim();
    if (!t) return;
    if (tags.includes(t)) return;
    setTags((prev) => [...prev, t]);
    setTagInput("");
  }
  function removeTag(idx) {
    setTags((prev) => prev.filter((_, i) => i !== idx));
  }
  function onTagKey(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setErr(null);

    const formEl = e.currentTarget;
    const fd = new FormData(formEl);

    if (fd.get("category") === "__other__") {
      fd.set("category", (fd.get("other_category") || "").toString().trim());
    }
    fd.delete("other_category");

    const stock = Math.max(0, parseInt(fd.get("stock") || "0", 10) || 0);
    fd.set("stock", String(stock));

    // 👉 envoyer les tags en JSON (string)
    fd.set("tags", JSON.stringify(tags));

    const res = await fetch("/api/products", { method: "POST", body: fd });
    const payload = await res.json();
    setPending(false);

    if (!res.ok) {
      setErr(payload.error || "Erreur inconnue");
      return;
    }

    formEl.reset();
    setUseOtherCat(false);
    setTags([]);
    setOpen(false);
    onCreated?.(payload.data);
  }

  return (
    <>
      {/* FAB */}
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
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2">
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

                <label>
                  <span className="block text-sm font-medium">Stock</span>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={1}
                    required
                    className="mt-1 w-full rounded-lg border p-2"
                  />
                </label>

                <div className="col-span-2 grid grid-cols-2 gap-4">
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

                {/* TAGS */}
                <div className="col-span-2">
                  <span className="block text-sm font-medium">Tags</span>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={onTagKey}
                      placeholder="ex: 4K, XLR, Vmount…"
                      className="flex-1 rounded-lg border p-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-2 rounded-lg text-black font-semibold cursor-pointer shadow"
                      style={{
                        background:
                          "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
                      }}
                    >
                      Ajouter
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tags.map((t, idx) => (
                        <span
                          key={`${t}-${idx}`}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#E9F0FF] ring-1 ring-[#B9CEFF]/70"
                        >
                          {t}
                          <button
                            type="button"
                            onClick={() => removeTag(idx)}
                            className="ml-1 text-xs leading-none"
                            aria-label={`Supprimer ${t}`}
                            title="Supprimer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {err && <p className="text-red-600 text-sm">{err}</p>}

              <div className="flex items-center justify-end gap-3 pt-2 sticky bottom-0 bg-white md:pt-4">
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

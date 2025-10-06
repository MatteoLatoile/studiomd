"use client";

import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiX } from "react-icons/fi";

export default function EditProductButton({
  product,
  categories = [],
  onUpdated,
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState(null);
  const [preview, setPreview] = useState(product.image_url || "");

  // TAGS local state
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);

  useEffect(() => {
    setTags(Array.isArray(product.tags) ? product.tags : []);
  }, [product.tags]);

  const sortedCats = useMemo(
    () => Array.from(new Set(categories.filter(Boolean))).sort(),
    [categories]
  );

  const catInList = sortedCats.includes(product.category);

  function addTag() {
    const t = tagInput.trim();
    if (!t) return;
    if (!tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  }
  function removeTag(t) {
    setTags((prev) => prev.filter((x) => x !== t));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setErr(null);

    const formEl = e.currentTarget;
    const fd = new FormData(formEl);

    // category "Autre…"
    if (fd.get("category") === "__other__") {
      fd.set("category", (fd.get("other_category") || "").toString().trim());
    }
    fd.delete("other_category");

    // stock >= 0
    const stock = Math.max(
      0,
      parseInt(fd.get("stock") ?? product.stock ?? 0, 10) || 0
    );
    fd.set("stock", String(stock));

    // tags en JSON
    fd.set("tags", JSON.stringify(tags));

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
      <button
        onClick={() => setOpen(true)}
        className="rounded-full text-black px-3 py-1 text-xs font-semibold shadow cursor-pointer
                   bg-white/90 hover:bg-white ring-1 ring-black/10"
        title="Modifier"
        aria-label="Modifier"
      >
        <span className="inline-flex items-center gap-1">
          <FiEdit2 className="text-base" /> Modifier
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] text-black flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl max-h-[85vh] overflow-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white">
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
              <div className="grid grid-cols-2 text-black gap-4">
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
                  <span className="block text-sm text-black font-medium">
                    Nom
                  </span>
                  <input
                    name="name"
                    defaultValue={product.name}
                    required
                    className="mt-1 w-full rounded-lg border p-2"
                  />
                </label>

                <label className="col-span-2">
                  <span className="block text-sm text-black font-medium">
                    Description
                  </span>
                  <textarea
                    name="description"
                    defaultValue={product.description}
                    rows={3}
                    required
                    className="mt-1 w-full text-black rounded-lg border p-2"
                  />
                </label>

                <label>
                  <span className="block text-black text-sm font-medium">
                    Prix (€)
                  </span>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={Number(product.price)}
                    required
                    className="mt-1 w-full text-black rounded-lg border p-2"
                  />
                </label>

                <label>
                  <span className="block text-black text-sm font-medium">
                    Stock
                  </span>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={Number(product.stock ?? 0)}
                    required
                    className="mt-1 text-black w-full rounded-lg border p-2"
                  />
                </label>

                <div>
                  <span className="block text-black text-sm font-medium">
                    Catégorie
                  </span>
                  <select
                    name="category"
                    className="mt-1 w-full text-black rounded-lg border p-2"
                    defaultValue={catInList ? product.category : "__other__"}
                    onChange={(e) => {
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
                  <span className="block text-black text-sm font-medium">
                    Nouvelle catégorie
                  </span>
                  <input
                    name="other_category"
                    className="mt-1 text-black w-full rounded-lg border p-2"
                    placeholder="ex: Accessoires"
                    defaultValue={catInList ? "" : product.category}
                  />
                </label>

                {/* TAGS */}
                <div className="col-span-2">
                  <span className="block text-black text-sm font-medium">
                    Tags
                  </span>
                  <div className="flex text-black items-center gap-2 mt-1">
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="ex: 4K, XLR, compact…"
                      className="flex-1 text-black rounded-lg border p-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="inline-flex text-black items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer"
                      style={{
                        background:
                          "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
                      }}
                    >
                      <FiPlus /> Ajouter
                    </button>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex text-black flex-wrap gap-1.5 mt-2">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex text-black items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-[#FFF3C4] ring-1 ring-[#FFD966]/70"
                        >
                          {t}
                          <button
                            type="button"
                            onClick={() => removeTag(t)}
                            className="opacity-70 text-black hover:opacity-100"
                            aria-label={`Retirer ${t}`}
                            title={`Retirer ${t}`}
                          >
                            <FiX />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {err && <p className="text-red-600 text-sm">{err}</p>}

              <div className="flex items-center justify-end gap-3 pt-2 sticky bottom-0 bg-white">
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

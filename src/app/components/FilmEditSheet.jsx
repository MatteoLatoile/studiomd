"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function FilmEditSheet({ open, onClose, film, onUpdated }) {
  const [form, setForm] = useState({
    title: "",
    director: "",
    category: "",
    year: "",
    runtime_min: "",
    status: "",
    synopsis: "",
    poster_url: "",
    poster_path: "",
    tags_text: "", // édition rapide: "horreur, court, festival"
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!film) return;
    setForm({
      title: film.title || "",
      director: film.director || "",
      category: film.category || "",
      year: film.year || "",
      runtime_min: film.runtime_min || "",
      status: film.status || "",
      synopsis: film.synopsis || "",
      poster_url: film.poster_url || "",
      poster_path: film.poster_path || "",
      tags_text: Array.isArray(film.tags) ? film.tags.join(", ") : "",
    });
  }, [film]);

  async function save() {
    setSaving(true);
    setErr("");
    try {
      const tags = form.tags_text
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: form.title,
        director: form.director,
        category: form.category,
        year: form.year ? Number(form.year) : null,
        runtime_min: form.runtime_min ? Number(form.runtime_min) : null,
        status: form.status || null,
        synopsis: form.synopsis,
        poster_url: form.poster_url || null,
        poster_path: form.poster_path || null,
        tags,
      };

      const { data, error } = await supabase
        .from("films")
        .update(payload)
        .eq("id", film.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      onUpdated?.(data || { ...film, ...payload });
    } catch (e) {
      setErr(e.message || "Erreur");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-[520px] bg-[#0F0F14] text-white shadow-2xl ring-1 ring-white/10 p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Éditer le film</h3>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/15"
          >
            Fermer
          </button>
        </div>

        {err && <p className="mb-3 text-sm text-red-400">{err}</p>}

        <div className="grid gap-3">
          <Field label="Titre">
            <input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              className="inp"
            />
          </Field>

          <Field label="Réalisateur">
            <input
              value={form.director}
              onChange={(e) =>
                setForm((f) => ({ ...f, director: e.target.value }))
              }
              className="inp"
            />
          </Field>

          <Field label="Catégorie">
            <input
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className="inp"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Année">
              <input
                type="number"
                value={form.year}
                onChange={(e) =>
                  setForm((f) => ({ ...f, year: e.target.value }))
                }
                className="inp"
              />
            </Field>
            <Field label="Durée (min)">
              <input
                type="number"
                value={form.runtime_min}
                onChange={(e) =>
                  setForm((f) => ({ ...f, runtime_min: e.target.value }))
                }
                className="inp"
              />
            </Field>
          </div>

          <Field label="Statut">
            <input
              value={form.status}
              placeholder="released | in_production | announced…"
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value }))
              }
              className="inp"
            />
          </Field>

          <Field label="Synopsis">
            <textarea
              rows={4}
              value={form.synopsis}
              onChange={(e) =>
                setForm((f) => ({ ...f, synopsis: e.target.value }))
              }
              className="inp"
            />
          </Field>

          <Field label="Poster URL (public)">
            <input
              value={form.poster_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, poster_url: e.target.value }))
              }
              className="inp"
            />
          </Field>

          <Field label="Poster path (bucket)">
            <input
              value={form.poster_path}
              onChange={(e) =>
                setForm((f) => ({ ...f, poster_path: e.target.value }))
              }
              className="inp"
              placeholder="affiches/fardeau.webp"
            />
          </Field>

          <Field label="Tags (séparés par des virgules)">
            <input
              value={form.tags_text}
              onChange={(e) =>
                setForm((f) => ({ ...f, tags_text: e.target.value }))
              }
              className="inp"
              placeholder="horreur, festival, court"
            />
          </Field>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-white/10 hover:bg-white/15"
          >
            Annuler
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2 font-semibold text-black rounded shadow disabled:opacity-60"
            style={{
              background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
            }}
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .inp {
          width: 100%;
          background: #0b0b10;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: white;
          padding: 10px 12px;
          border-radius: 10px;
          outline: none;
        }
        .inp:focus {
          border-color: rgba(255, 235, 131, 0.5);
          box-shadow: 0 0 0 3px rgba(255, 235, 131, 0.08);
        }
      `}</style>
    </div>
  );
}

/* UI */
function Field({ label, children }) {
  return (
    <label className="text-sm">
      <div className="mb-1 text-white/70">{label}</div>
      {children}
    </label>
  );
}

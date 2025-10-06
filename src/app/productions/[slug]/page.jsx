"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

/* ---------- petites briques UI ---------- */
function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 py-2">
      <div className="text-white/60 text-sm">{label}</div>
      <div className="text-white">{children}</div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label className="text-sm">
      <div className="mb-1 text-white/70">{label}</div>
      {children}
    </label>
  );
}

/* ---------- Uploader (bucket: films) ---------- */
function PosterUploader({ film, onUploaded }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function pick() {
    inputRef.current?.click();
  }

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr("");
    setBusy(true);

    try {
      // chemin: affiches/<slug>-<timestamp>.<ext>
      const ext = (file.name.split(".").pop() || "webp").toLowerCase();
      const path = `affiches/${film.slug}-${Date.now()}.${ext}`;

      // upload dans le bucket "films"
      const { error: upErr } = await supabase.storage
        .from("films")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
        });
      if (upErr) throw upErr;

      // URL publique (si bucket public) — sinon tu peux signer au besoin
      const { data: pub } = supabase.storage.from("films").getPublicUrl(path);
      const publicUrl = pub?.publicUrl || null;

      // maj DB
      const { data, error: updErr } = await supabase
        .from("films")
        .update({ poster_path: path, poster_url: publicUrl })
        .eq("id", film.id)
        .select("*")
        .maybeSingle();
      if (updErr) throw updErr;

      onUploaded?.(data);
    } catch (e) {
      setErr(e.message || "Upload impossible");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <button
        onClick={pick}
        disabled={busy}
        className="inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold text-black shadow disabled:opacity-60"
        style={{
          background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
        }}
      >
        {busy ? "Téléversement…" : "Changer l’affiche"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />
      {err && <p className="text-xs text-red-400 mt-1">{err}</p>}
    </>
  );
}

/* ---------- Feuille d’édition ---------- */
function FilmEditSheet({ film, onClose, onUpdated }) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    title: film.title || "",
    director: film.director || "",
    category: film.category || "",
    year: film.year || "",
    runtime_min: film.runtime_min || "",
    status: film.status || "",
    synopsis: film.synopsis || "",
    poster_url: film.poster_url || "",
    poster_path: film.poster_path || "",
  });

  async function save() {
    setSaving(true);
    setErr("");
    try {
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
      };

      const { data, error } = await supabase
        .from("films")
        .update(payload)
        .eq("id", film.id)
        .select("*")
        .maybeSingle();

      if (error) throw error;
      onUpdated?.(data || { ...film, ...payload });
    } catch (e) {
      setErr(e.message || "Erreur");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
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
          {[
            ["Titre", "title"],
            ["Réalisateur", "director"],
            ["Catégorie", "category"],
          ].map(([label, key]) => (
            <Field key={key} label={label}>
              <input
                value={form[key]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
                className="inp"
              />
            </Field>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Année">
              <input
                type="number"
                value={form.year || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, year: e.target.value }))
                }
                className="inp"
              />
            </Field>
            <Field label="Durée (min)">
              <input
                type="number"
                value={form.runtime_min || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, runtime_min: e.target.value }))
                }
                className="inp"
              />
            </Field>
          </div>

          <Field label="Statut">
            <input
              value={form.status || ""}
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
              value={form.synopsis || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, synopsis: e.target.value }))
              }
              className="inp"
            />
          </Field>

          {/* debug/édition directe de l’URL si besoin */}
          <Field label="Poster URL (public)">
            <input
              value={form.poster_url || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, poster_url: e.target.value }))
              }
              className="inp"
            />
          </Field>

          <Field label="Poster path (bucket)">
            <input
              value={form.poster_path || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, poster_path: e.target.value }))
              }
              className="inp"
              placeholder="affiches/fardeau.webp"
            />
          </Field>

          {/* Uploader depuis le PC */}
          <div className="mt-2">
            <PosterUploader
              film={film}
              onUploaded={(updated) => {
                // refléter les champs visuellement dans la feuille
                setForm((f) => ({
                  ...f,
                  poster_url: updated?.poster_url || f.poster_url,
                  poster_path: updated?.poster_path || f.poster_path,
                }));
                // et remonter la maj à la page
                onUpdated?.(updated);
              }}
            />
            <p className="text-xs text-white/50 mt-1">
              L’image sera envoyée dans <code>films/affiches/</code>.
            </p>
          </div>
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

/* ---------- Page principale ---------- */
export default function FilmPage() {
  const { slug } = useParams();
  const [film, setFilm] = useState(null);
  const [err, setErr] = useState("");
  const [user, setUser] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!alive) return;
      setUser(u?.user || null);

      const { data, error } = await supabase
        .from("films")
        .select(
          `id, slug, title, director, category, synopsis, year, runtime_min, status, poster_url, poster_path`
        )
        .eq("slug", String(slug))
        .maybeSingle();

      if (!alive) return;
      if (error || !data) {
        setErr("Film introuvable");
        setFilm(null);
      } else {
        setErr("");
        setFilm(data);
      }
    })();

    return () => {
      alive = false;
    };
  }, [slug]);

  const isAdmin = !!user?.app_metadata?.is_admin;

  return (
    <main className="min-h-screen bg-[#0A0A0D] text-white">
      <div className="mx-auto max-w-5xl px-4 md:px-8 pt-28 pb-16">
        {err && (
          <div className="rounded-xl bg-red-900/20 ring-1 ring-red-800/40 p-4 mb-6">
            {err}
          </div>
        )}

        {!film && !err && (
          <div className="grid md:grid-cols-[360px_1fr] gap-6">
            <div className="h-[520px] bg-[#121219] rounded-xl animate-pulse" />
            <div className="space-y-3">
              <div className="h-10 bg-[#121219] rounded animate-pulse" />
              <div className="h-4 bg-[#121219] rounded animate-pulse" />
              <div className="h-4 bg-[#121219] rounded animate-pulse" />
              <div className="h-24 bg-[#121219] rounded animate-pulse" />
            </div>
          </div>
        )}

        {film && (
          <>
            {/* barre admin */}
            {isAdmin && (
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs text-white/60">
                  Mode admin — <span className="text-white/80">édition</span>
                </span>

                <div className="flex gap-2">
                  <PosterUploader film={film} onUploaded={(f) => setFilm(f)} />
                  <button
                    onClick={() => setEditOpen(true)}
                    className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold text-black shadow"
                    style={{
                      background:
                        "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
                    }}
                  >
                    Modifier
                  </button>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-[360px_1fr] gap-6">
              {/* affiche */}
              <div className="rounded-2xl overflow-hidden ring-1 ring-white/10 bg-[#121219]">
                {film.poster_url ? (
                  <img
                    src={film.poster_url}
                    alt={film.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-[520px] grid place-items-center text-white/40">
                    Pas d’affiche
                  </div>
                )}
              </div>

              {/* infos */}
              <section>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  {film.title}
                </h1>
                <p className="text-white/70 mt-1">{film.synopsis || "—"}</p>

                <div className="mt-6 rounded-2xl ring-1 ring-white/10 bg-[#0F0F14] p-4">
                  <Row label="Réalisateur">{film.director || "—"}</Row>
                  <Row label="Catégorie">{film.category || "—"}</Row>
                  <Row label="Année">{film.year || "—"}</Row>
                  <Row label="Durée">
                    {film.runtime_min ? `${film.runtime_min} min` : "—"}
                  </Row>
                  <Row label="Statut">{film.status || "—"}</Row>
                </div>
              </section>
            </div>
          </>
        )}
      </div>

      {editOpen && film && (
        <FilmEditSheet
          film={film}
          onClose={() => setEditOpen(false)}
          onUpdated={(f) => setFilm(f)}
        />
      )}
    </main>
  );
}

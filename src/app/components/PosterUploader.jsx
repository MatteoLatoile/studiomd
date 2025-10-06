"use client";

import { useRef, useState } from "react";
import { supabase } from "../lib/supabase";

export default function PosterUploader({
  film,
  onUploaded,
  children,
  className,
}) {
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
      // chemin propre : films/affiches/<slug>-<ts>.<ext>
      const ext = file.name.split(".").pop()?.toLowerCase() || "webp";
      const path = `affiches/${film.slug}-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("films")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (upErr) throw upErr;

      // public URL si bucket public, sinon getPublicUrl renverra quand même un lien (selon réglages)
      const { data: pub } = supabase.storage.from("films").getPublicUrl(path);
      const publicUrl = pub?.publicUrl || null;

      const { data, error: updErr } = await supabase
        .from("films")
        .update({ poster_path: path, poster_url: publicUrl })
        .eq("id", film.id)
        .select("*")
        .maybeSingle();

      if (updErr) throw updErr;
      onUploaded?.(data);
    } catch (e) {
      setErr(e?.message || "Upload impossible");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <button onClick={pick} disabled={busy} className={className}>
        {children}
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

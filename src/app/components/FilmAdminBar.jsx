"use client";

import { useState } from "react";
import FilmEditSheet from "./FilmEditSheet";

export default function FilmAdminBar({ film, onUpdated, isAdmin }) {
  const [open, setOpen] = useState(false);

  if (!isAdmin) return null;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs text-white/60">
          Mode admin — <span className="text-white/80">édition disponible</span>
        </span>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold text-black shadow"
          style={{
            background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
          }}
        >
          Modifier
        </button>
      </div>

      <FilmEditSheet
        open={open}
        onClose={() => setOpen(false)}
        film={film}
        onUpdated={(f) => {
          onUpdated?.(f);
          setOpen(false);
        }}
      />
    </>
  );
}

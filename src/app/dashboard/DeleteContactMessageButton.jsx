"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function DeleteContactMessageButton({ id }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState(null);
  const router = useRouter();
  const [, startTransition] = useTransition();

  async function handleDelete() {
    setPending(true);
    setErr(null);
    try {
      const res = await fetch(`/api/contact/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setOpen(false);
      // Rafraîchir les data côté serveur proprement
      startTransition(() => router.refresh());
    } catch (e) {
      setErr(e.message || "Erreur");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-600 text-white hover:bg-red-700 shadow cursor-pointer"
        aria-label="Supprimer le message"
      >
        Supprimer
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-red-600">
              Supprimer ce message ?
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Cette action est irréversible.
            </p>
            {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border cursor-pointer"
                disabled={pending}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={pending}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {pending ? "Suppression..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

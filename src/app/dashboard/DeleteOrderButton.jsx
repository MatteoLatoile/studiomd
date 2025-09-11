"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiTrash2 } from "react-icons/fi";

export default function DeleteOrderButton({ orderId }) {
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState(null);
  const router = useRouter();

  async function onDelete() {
    setErr(null);
    if (!orderId) return;
    const ok = confirm("Supprimer définitivement cette commande ?");
    if (!ok) return;
    setPending(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      router.refresh();
    } catch (e) {
      setErr(e.message || "Erreur");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onDelete}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
        title="Supprimer la commande"
        aria-label="Supprimer la commande"
      >
        <FiTrash2 />
        {pending ? "Suppression..." : "Supprimer"}
      </button>
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}

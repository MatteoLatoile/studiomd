"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ConfirmationPage() {
  const search = useSearchParams();
  const router = useRouter();
  const sessionId = search.get("session_id");
  const [status, setStatus] = useState("pending");
  const [orderId, setOrderId] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    async function confirm() {
      if (!sessionId) {
        setErr("Session Stripe manquante");
        setStatus("error");
        return;
      }
      try {
        const res = await fetch("/api/stripe/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });
        const data = await res.json();
        if (!alive) return;
        if (res.ok) {
          setOrderId(data.order_id);
          setStatus("ok");
        } else {
          setErr(data.error || "Erreur");
          setStatus("error");
        }
      } catch (e) {
        if (!alive) return;
        setErr(e.message);
        setStatus("error");
      }
    }
    confirm();
    return () => {
      alive = false;
    };
  }, [sessionId]);

  return (
    <main className="bg-[#FFF5D7] min-h-screen py-30 px-4 md:px-8">
      <div className="max-w-xl">
        {status === "pending" && (
          <div className="rounded-2xl bg-[#ffffffb3] p-6 ring-1 ring-black/5">
            <p>Validation du paiement en cours…</p>
          </div>
        )}
        {status === "ok" && (
          <div className="rounded-2xl bg-[#ffffffb3] p-6 ring-1 ring-black/5">
            <h1 className="text-2xl font-bold text-noir">Merci 🙌</h1>
            <p className="mt-2">Votre réservation est confirmée.</p>
            <p className="text-sm text-gray-600 mt-1">
              Référence commande : {orderId}
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 rounded-xl px-5 py-3 font-semibold text-noir shadow"
              style={{
                background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
              }}
            >
              Retour à l’accueil
            </button>
          </div>
        )}
        {status === "error" && (
          <div className="rounded-2xl bg-[#ffffffb3] p-6 ring-1 ring-black/5">
            <h1 className="text-2xl font-bold text-noir">Oups…</h1>
            <p className="mt-2 text-red-700">{err}</p>
          </div>
        )}
      </div>
    </main>
  );
}

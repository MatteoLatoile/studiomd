"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function UpdateProfileForm({
  userId,
  email,
  initialFirstName,
  initialLastName,
  initialPhone,
}) {
  const [firstName, setFirstName] = useState(initialFirstName || "");
  const [lastName, setLastName] = useState(initialLastName || "");
  const [phone, setPhone] = useState(initialPhone || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErr(null);

    try {
      const { error } = await supabase.from("profiles").upsert(
        {
          id: userId,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
        },
        { onConflict: "id" }
      );
      if (error) throw error;
      setMsg("Coordonnées mises à jour ✔");
    } catch (e) {
      setErr(e.message || "Erreur lors de l’enregistrement");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-white">
      {/* Email readonly */}
      <div>
        <label className="text-[13px] text-white mb-1 block">E-mail</label>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full text-sm bg-white/5 text-white/80 border border-white/10 rounded-lg px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[13px] text-white mb-1 block">Prénom</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Votre prénom"
            className="w-full text-sm bg-[#0B0D12] text-white placeholder-white/40 border border-white/10 rounded-lg px-3 py-2 focus:border-white/20 focus:ring-2 focus:ring-[#FFB700]/20 outline-none"
          />
        </div>
        <div>
          <label className="text-[13px] text-white mb-1 block">Nom</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Votre nom"
            className="w-full text-sm bg-[#0B0D12] text-white placeholder-white/40 border border-white/10 rounded-lg px-3 py-2 focus:border-white/20 focus:ring-2 focus:ring-[#FFB700]/20 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-[13px] text-white mb-1 block">Téléphone</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Numéro (optionnel)"
          className="w-full text-sm bg-[#0B0D12] text-white placeholder-white/40 border border-white/10 rounded-lg px-3 py-2 focus:border-white/20 focus:ring-2 focus:ring-[#FFB700]/20 outline-none"
        />
      </div>

      {msg && <p className="text-sm text-emerald-400">{msg}</p>}
      {err && <p className="text-sm text-red-400">{err}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl px-5 py-3 font-semibold text-black shadow disabled:opacity-60"
        style={{
          background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
        }}
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}

"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

// ====== Animations (inchangées) ======
const ease = [0.22, 1, 0.36, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.08 * i, ease },
  }),
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

// ====== Helpers ======
function initialsOf(first, last) {
  const a = (first || "").trim()[0] || "";
  const b = (last || "").trim()[0] || "";
  return (a + b).toUpperCase() || "??";
}
function slugify(name = "") {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ====== UI réutilisable ======
function InfoCard({ i, title, lines }) {
  return (
    <m.div
      variants={fadeUp}
      custom={i}
      className="rounded-2xl bg-[#0F1117] ring-1 ring-white/10 shadow-xl p-5"
    >
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-2 text-sm text-white/70 space-y-1">
        {lines.map((l, idx) => (
          <li key={idx}>{l}</li>
        ))}
      </ul>
    </m.div>
  );
}

function TimelineStep({ i, year, title, desc }) {
  return (
    <m.li
      variants={fadeUp}
      custom={i}
      className="rounded-2xl bg-[#0F1117] ring-1 ring-white/10 p-5 relative"
    >
      <div className="absolute -left-1 top-5 h-3 w-3 rounded-full bg-[#FFB700]" />
      <div className="ml-4">
        <p className="text-xs font-semibold text-[#FFB700]">{year}</p>
        <p className="font-semibold mt-1">{title}</p>
        <p className="text-sm text-white/70 mt-1">{desc}</p>
      </div>
    </m.li>
  );
}

function TeamCard({ i, member, isAdmin, onDelete }) {
  const { first_name, last_name, role, avatar_url } = member;
  const fallback = initialsOf(first_name, last_name);

  return (
    <m.article
      variants={fadeUp}
      custom={i}
      className="relative rounded-2xl bg-[#0F1117] ring-1 ring-white/10 p-5 flex items-start gap-4"
    >
      {isAdmin && (
        <button
          onClick={() => onDelete?.(member)}
          className="absolute right-2 top-2 rounded-md px-2 py-1 text-xs bg-white/10 hover:bg-white/15"
          title="Supprimer ce membre"
        >
          Supprimer
        </button>
      )}

      {avatar_url ? (
        <div className="h-12 w-12 rounded-2xl overflow-hidden ring-1 ring-white/10 bg-[#0C0E13]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar_url}
            alt={`${first_name} ${last_name}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#FFC119] to-[#FFEB83] text-black font-extrabold grid place-items-center">
          {fallback}
        </div>
      )}

      <div>
        <h4 className="font-semibold">
          {first_name} {last_name}
        </h4>
        <p className="text-sm text-white/70">{role}</p>
      </div>
    </m.article>
  );
}

function AddMemberModal({ open, onClose, onCreated }) {
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [role, setRole] = useState("");
  const [file, setFile] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setFirst("");
      setLast("");
      setRole("");
      setFile(null);
      setErr("");
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [open]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      // 1) upload si fichier
      let avatar_url = null;
      let avatar_path = null;

      if (file) {
        const bucket = "team";
        const ext = (file.name?.split(".").pop() || "jpg").toLowerCase();
        const base = slugify(`${firstName}-${lastName}`) || "member";
        const path = `avatars/${base}-${Date.now()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(bucket)
          .upload(path, file, {
            upsert: false,
            cacheControl: "3600",
            contentType: file.type || "image/jpeg",
          });
        if (upErr) throw new Error(upErr.message);

        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
        avatar_url = pub?.publicUrl || null;
        avatar_path = `${bucket}/${path}`;
      }

      // 2) insert DB
      const { data, error } = await supabase
        .from("team_members")
        .insert({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role: role.trim(),
          avatar_url,
          avatar_path,
        })
        .select(
          "id, first_name, last_name, role, avatar_url, avatar_path, created_at"
        )
        .single();
      if (error) throw new Error(error.message);

      onCreated?.(data);
      onClose?.();
    } catch (e) {
      setErr(e.message || "Échec de l’ajout");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-[520px] bg-[#0F1117] text-white shadow-2xl ring-1 ring-white/10 p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Ajouter un membre</h3>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/15"
          >
            Fermer
          </button>
        </div>

        {err && <p className="mb-3 text-sm text-red-400">{err}</p>}

        <form onSubmit={onSubmit} className="grid gap-3">
          <label className="text-sm">
            <div className="mb-1 text-white/70">Prénom</div>
            <input
              value={firstName}
              onChange={(e) => setFirst(e.target.value)}
              required
              className="w-full bg-[#0B0B10] border border-white/10 text-white px-3 py-2 rounded-lg outline-none"
            />
          </label>

          <label className="text-sm">
            <div className="mb-1 text-white/70">Nom</div>
            <input
              value={lastName}
              onChange={(e) => setLast(e.target.value)}
              required
              className="w-full bg-[#0B0B10] border border-white/10 text-white px-3 py-2 rounded-lg outline-none"
            />
          </label>

          <label className="text-sm">
            <div className="mb-1 text-white/70">Rôle</div>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full bg-[#0B0B10] border border-white/10 text-white px-3 py-2 rounded-lg outline-none"
            />
          </label>

          <label className="text-sm">
            <div className="mb-1 text-white/70">Photo (optionnel)</div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-white/80"
            />
          </label>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-white/10 hover:bg-white/15"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2 font-semibold text-black rounded shadow disabled:opacity-60"
              style={{
                background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
              }}
            >
              {busy ? "Ajout…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ====== PAGE /about ======
export default function AboutPage() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [user, setUser] = useState(null);
  const [openAdd, setOpenAdd] = useState(false);

  // Admin ?
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!alive) return;
      setUser(data?.user || null);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => sub?.subscription?.unsubscribe();
  }, []);
  const isAdmin = !!user?.app_metadata?.is_admin;

  // Charger l'équipe
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr("");
      const { data, error } = await supabase
        .from("team_members")
        .select(
          "id, first_name, last_name, role, avatar_url, avatar_path, created_at"
        )
        .order("created_at", { ascending: false });
      if (!alive) return;
      if (error) {
        setErr(error.message);
        setTeam([]);
      } else {
        setTeam(data || []);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Temps réel (INSERT/UPDATE/DELETE)
  useEffect(() => {
    const channel = supabase
      .channel("team-members-live")
      .on(
        "postgres_changes",
        { schema: "public", table: "team_members", event: "*" },
        (payload) => {
          setTeam((prev) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new;
              const exists = prev.some((m) => m.id === row.id);
              return exists ? prev : [row, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new;
              return prev.map((m) => (m.id === row.id ? row : m));
            }
            if (payload.eventType === "DELETE") {
              const row = payload.old;
              return prev.filter((m) => m.id !== row.id);
            }
            return prev;
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function deleteMember(member) {
    if (!isAdmin) return;
    const ok = confirm(`Supprimer ${member.first_name} ${member.last_name} ?`);
    if (!ok) return;

    // 1) supprimer la ligne
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", member.id);
    if (error) {
      alert(`Échec suppression: ${error.message}`);
      return;
    }

    // 2) supprimer l’avatar (best effort)
    if (member.avatar_path) {
      const path = member.avatar_path.replace(/^team\//, "");
      await supabase.storage
        .from("team")
        .remove([path])
        .catch(() => {});
    }
    // La realtime supprimera la carte côté UI; sinon fallback :
    setTeam((prev) => prev.filter((m) => m.id !== member.id));
  }

  const teamEmpty = !loading && !err && team.length === 0;

  return (
    <main className="bg-[#0B0B0F] min-h-screen text-white">
      <LazyMotion features={domAnimation}>
        {/* HERO */}
        <section className="px-4 md:px-8 lg:px-20 pt-28 pb-8">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="max-w-5xl"
          >
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              À <span className="text-[#FFB700]">propos</span>
            </h1>
            <p className="text-sm md:text-base text-white/60 mt-2">
              S.A.S. SMD Factory — Société de production cinématographique.
            </p>
          </m.div>
        </section>

        {/* INFO LÉGALES */}
        <section className="px-4 md:px-8 lg:px-20 pb-10">
          <m.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl"
          >
            <InfoCard
              i={0}
              title="S.A.S. SMD Factory"
              lines={[
                "Au Capital de 16 000 €",
                "Société de production cinématographique",
              ]}
            />
            <InfoCard
              i={1}
              title="Enregistrement"
              lines={["SIRET : 942 300 146 00019", "APE : 5911C"]}
            />
            <InfoCard
              i={2}
              title="Contacts"
              lines={["contact@studiomontdor.com", "+33 (0)9 53 54 78 25"]}
            />
          </m.div>
        </section>

        {/* HISTOIRE */}
        <section className="px-4 md:px-8 lg:px-20 pb-6">
          <m.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
            className="max-w-4xl"
          >
            <h2 className="text-2xl md:text-3xl font-bold">
              Qui sommes-nous ?
            </h2>
            <p className="text-white/80 mt-3 leading-7">
              Et comment la société <strong>SMD Factory</strong> a-t-elle été
              créée ? La société SMD Factory est née de l’évolution du collectif{" "}
              <strong>Studio Mont D’or</strong>, fondé en 2021 par Kendrick
              COURANT et Karl BURON. Ce collectif a permis de produire de
              nombreux contenus audiovisuels : clips musicaux, courts-métrages,
              émissions, et bien plus encore.
            </p>
            <p className="text-white/80 mt-3 leading-7">
              En 2023, <strong>Julien BOMPART</strong> et{" "}
              <strong>Maxime GARCIA</strong> rejoignent l’aventure. C’est à ce
              moment que les grands projets prennent forme, notamment{" "}
              <em>Silhouette</em> et <em>Black Case</em>. Les tournages se
              multiplient, les émissions se concrétisent, et une décision
              majeure est prise : professionnaliser l’activité.
            </p>
            <p className="text-white/80 mt-3 leading-7">
              C’est ainsi qu’en 2025, la <strong>S.A.S SMD Factory</strong> voit
              le jour, fondée par Kendrick COURANT, Olivier COURANT, Maxime
              GARCIA et Julien BOMPART.
            </p>
            <p className="text-white/80 mt-3 leading-7">
              Aujourd’hui, SMD Factory se spécialise dans le{" "}
              <strong>cinéma de genre</strong>, avec une prédilection pour
              l’horreur. Notre ambition : repousser les limites tout en
              conservant une liberté artistique totale.
            </p>
          </m.div>

          {/* Timeline simple */}
          <m.ol
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="mt-8 grid md:grid-cols-3 gap-5 max-w-6xl"
          >
            <TimelineStep
              i={0}
              year="2021"
              title="Studio Mont D’or"
              desc="Naissance du collectif — clips, courts, émissions."
            />
            <TimelineStep
              i={1}
              year="2023"
              title="Accélération"
              desc="Arrivée de J. Bompart & M. Garcia — Silhouette, Black Case."
            />
            <TimelineStep
              i={2}
              year="2025"
              title="SAS SMD Factory"
              desc="Structuration & vision cinéma de genre."
            />
          </m.ol>
        </section>

        {/* ÉQUIPE (dyn.) */}
        <section className="px-4 md:px-8 lg:px-20 pb-16">
          <div className="flex items-center justify-between">
            <m.h3
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.5 }}
              className="text-2xl md:text-3xl font-bold"
            >
              Notre équipe
            </m.h3>

            {isAdmin && (
              <button
                onClick={() => setOpenAdd(true)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-black shadow"
                style={{
                  background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
                }}
              >
                Ajouter
              </button>
            )}
          </div>

          <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl">
            {loading && (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`sk-${i}`}
                    className="rounded-2xl bg-[#0F1117] ring-1 ring-white/10 p-5 animate-pulse"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-white/10" />
                    <div className="h-4 w-40 bg-white/10 rounded mt-3" />
                    <div className="h-3 w-56 bg-white/10 rounded mt-2" />
                  </div>
                ))}
              </>
            )}

            {!loading && err && (
              <p className="text-sm text-red-400">Erreur : {err}</p>
            )}

            {!loading && !err && teamEmpty && (
              <p className="text-sm text-white/70">
                Aucun membre pour le moment.
              </p>
            )}

            {!loading &&
              !err &&
              team.map((m, idx) => (
                <TeamCard
                  key={m.id}
                  i={idx}
                  member={m}
                  isAdmin={isAdmin}
                  onDelete={deleteMember}
                />
              ))}
          </div>
        </section>

        {/* CTA CONTACT */}
        <section className="px-4 md:px-8 lg:px-20 pb-28">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, ease }}
            className="rounded-3xl bg-[#0F1117]/90 backdrop-blur-sm ring-1 ring-white/10 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h4 className="text-xl md:text-2xl font-semibold">
                Un projet à nous confier ?
              </h4>
              <p className="text-sm text-white/60 mt-1">
                On vous répond sous 24h ouvrées.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-black shadow hover:opacity-90 transition"
              style={{
                background: "linear-gradient(90deg,#FFC119 0%, #FFEB83 100%)",
              }}
            >
              Nous contacter
            </Link>
          </m.div>
        </section>
      </LazyMotion>

      {/* Modal d’ajout */}
      {isAdmin && (
        <AddMemberModal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          onCreated={(row) => setTeam((prev) => [row, ...prev])}
        />
      )}
    </main>
  );
}

// app/mentions-legales/page.jsx
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mentions légales — Studio Mont d’Or",
  description:
    "Mentions légales, informations éditeur, hébergeur, propriété intellectuelle, données personnelles et cookies.",
};

function Item({ label, children }) {
  return (
    <p className="text-sm text-white/80">
      <span className="font-semibold text-white">{label} : </span>
      <span className="text-white/80">{children}</span>
    </p>
  );
}

export default function MentionsLegalesPage() {
  const lastUpdate = new Date().toLocaleDateString("fr-FR");

  return (
    <main className="min-h-screen bg-[#0B0B0F] py-30 px-4 md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Titre */}
        <header className="rounded-3xl bg-[#11131A]/80 ring-1 ring-white/10 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Mentions légales
          </h1>
          <p className="text-sm text-white/60 mt-2">
            Dernière mise à jour&nbsp;: {lastUpdate}
          </p>
        </header>

        {/* Editeur */}
        <section className="rounded-3xl bg-[#0F1117] ring-1 ring-white/10 p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-2">
            1. Éditeur du site
          </h2>
          <div className="space-y-1">
            <Item label="Raison sociale">TODO_RAISONSECIALE</Item>
            <Item label="Forme juridique">TODO_FORME</Item>
            <Item label="Capital social">TODO_CAPITAL</Item>
            <Item label="Siège social">TODO_ADRESSE</Item>
            <Item label="SIREN / SIRET">TODO_SIREN / TODO_SIRET</Item>
            <Item label="TVA intracommunautaire">TODO_TVA</Item>
            <Item label="Contact">
              <a
                href="mailto:TODO_EMAIL"
                className="underline decoration-[#FFC119] hover:opacity-80"
              >
                TODO_EMAIL
              </a>{" "}
              — Tél. TODO_TEL
            </Item>
            <Item label="Directeur·rice de la publication">TODO_DIRECTION</Item>
          </div>
        </section>

        {/* Hébergeur */}
        <section className="rounded-3xl bg-[#0F1117] ring-1 ring-white/10 p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-2">
            2. Hébergement
          </h2>
          <div className="space-y-1">
            <Item label="Hébergeur">TODO_HEBERGEUR</Item>
            <Item label="Adresse">TODO_HEB_ADRESSE</Item>
            <Item label="Site web">
              <a
                href="https://TODO-HEBERGEUR-WEB"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-[#FFC119] hover:opacity-80"
              >
                https://TODO-HEBERGEUR-WEB
              </a>
            </Item>
          </div>
        </section>

        {/* PI */}
        <section className="rounded-3xl bg-[#0F1117] ring-1 ring-white/10 p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-2">
            3. Propriété intellectuelle
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            L’ensemble du contenu du site (textes, visuels, logos, graphismes,
            vidéos, marque, architecture, code, etc.) est protégé… Toute
            reproduction… (art. L.335-2 CPI).
          </p>
        </section>

        {/* Données perso */}
        <section className="rounded-3xl bg-[#0F1117] ring-1 ring-white/10 p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-2">
            4. Données personnelles
          </h2>
          <div className="space-y-3 text-sm text-white/80 leading-relaxed">
            <p>
              Conformément au RGPD… finalités : gestion de compte, commande,
              facturation, support, fraude, obligations légales.
            </p>
            <p>
              Droits : accès, rectification, opposition, effacement, limitation,
              portabilité. Contact DPO :{" "}
              <a
                href="mailto:TODO_DPO_EMAIL"
                className="underline decoration-[#FFC119]"
              >
                TODO_DPO_EMAIL
              </a>
              .
            </p>
            <p>Paiements traités par Stripe — jamais accès au PAN complet.</p>
          </div>
        </section>

        {/* Cookies */}
        <section className="rounded-3xl bg-[#0F1117] ring-1 ring-white/10 p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-2">5. Cookies</h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Des cookies techniques (session, sécurité, panier) et, le cas
            échéant, de mesure d’audience… Paramétrage possible via le bandeau
            cookies ou le navigateur.
          </p>
        </section>

        {/* Responsabilité */}
        <section className="rounded-3xl bg-[#0F1117] ring-1 ring-white/10 p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-2">
            6. Responsabilité
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Les informations peuvent comporter des inexactitudes… Service
            susceptible d’interruptions techniques.
          </p>
        </section>

        {/* Liens */}
        <section className="rounded-3xl bg-[#0F1117] ring-1 ring-white/10 p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-2">
            7. Liens externes
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Les sites tiers liés ne sont pas sous notre contrôle…
          </p>
        </section>

        {/* Commandes */}
        <section className="rounded-3xl bg-[#0F1117] ring-1 ring-white/10 p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-2">
            8. Commandes, location & facturation
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Les commandes impliquent l’acceptation des CGV/CGU… Factures
            disponibles dans “Mon compte”.
          </p>
        </section>

        {/* Contact */}
        <section className="rounded-3xl bg-[#0F1117] ring-1 ring-white/10 p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-2">
            9. Contact & litiges
          </h2>
          <div className="space-y-1">
            <Item label="Support">TODO_EMAIL_SUPPORT</Item>
            <Item label="Adresse postale">TODO_ADRESSE_POSTALE</Item>
            <p className="text-sm text-white/80">
              En cas de litige… tribunaux du siège social.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="pt-2 pb-10">
          <a
            href="/"
            className="inline-flex items-center rounded-2xl px-6 py-3 text-sm font-semibold text-black shadow hover:opacity-90 transition"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,193,25,1) 49%, rgba(255,235,131,1) 100%)",
            }}
          >
            Retour à l’accueil
          </a>
        </div>
      </div>
    </main>
  );
}

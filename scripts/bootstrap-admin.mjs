// scripts/bootstrap-admin.mjs
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

// charge .env.local depuis la racine du projet, même si tu lances ailleurs
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!url || !serviceKey) {
  console.error(
    "⚠️ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquants"
  );
  process.exit(1);
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("⚠️ ADMIN_EMAIL ou ADMIN_PASSWORD manquants");
  process.exit(1);
}

const admin = createClient(url, serviceKey);

async function ensureAdmin() {
  console.log("→ Using URL:", url);
  console.log("→ Admin email:", ADMIN_EMAIL);

  // 1) tente de créer
  const { data, error } = await admin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    app_metadata: { is_admin: true },
    user_metadata: { name: "Admin" },
  });

  if (!error) {
    console.log("✅ Admin créé:", data.user.email, data.user.app_metadata);
    return;
  }

  // 2) existe déjà → maj mdp + flag admin
  if ((error.message || "").toLowerCase().includes("already")) {
    console.log("ℹ️ Existe déjà, recherche + mise à jour…");

    let found = null,
      page = 1;
    while (!found) {
      const { data: list, error: listErr } = await admin.auth.admin.listUsers({
        page,
        perPage: 200,
      });
      if (listErr) throw listErr;
      found = list.users.find(
        (u) => (u.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase()
      );
      if (found || list.users.length < 200) break;
      page++;
    }
    if (!found) throw new Error("Utilisateur introuvable.");

    const { data: upd, error: updErr } = await admin.auth.admin.updateUserById(
      found.id,
      {
        password: ADMIN_PASSWORD,
        app_metadata: { is_admin: true },
      }
    );
    if (updErr) throw updErr;

    console.log("✅ Admin promu:", upd.user.email, upd.user.app_metadata);
    return;
  }

  throw error;
}

ensureAdmin().catch((e) => {
  console.error("❌ Échec:", e);
  process.exit(1);
});

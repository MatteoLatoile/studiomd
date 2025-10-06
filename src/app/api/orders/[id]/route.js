import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// ----- Utils -----
function euro(cents) {
  const n = (Number(cents) || 0) / 100;
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}
function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return d;
  }
}
function escapeHtml(x) {
  return String(x)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
function asText(v) {
  if (v == null) return "—";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean")
    return String(v);
  try {
    if (typeof v === "object") {
      const { line1, line2, city, postal_code, country } = v;
      if (line1 || line2 || city || postal_code || country) {
        return [
          line1,
          line2,
          [postal_code, city].filter(Boolean).join(" "),
          country,
        ]
          .filter(Boolean)
          .join("\n");
      }
      return JSON.stringify(v);
    }
  } catch {}
  return String(v);
}

// ----- HTML facture premium -----
function buildInvoiceHtml(order) {
  const {
    id,
    created_at,
    start_date,
    end_date,
    customer_first_name,
    customer_last_name,
    customer_email,
    customer_phone,
    address,
    items = [],
    total_amount_cents = 0,
  } = order;

  const a = start_date ? new Date(start_date + "T00:00:00") : null;
  const b = end_date ? new Date(end_date + "T00:00:00") : null;
  const nbJours = a && b ? Math.max(1, Math.round((b - a) / 86400000) + 1) : 1;

  const today = new Date().toLocaleDateString("fr-FR");
  const name =
    [customer_first_name, customer_last_name].filter(Boolean).join(" ") ||
    customer_email ||
    "Client";
  const adr = asText(address);

  const rows = (items || [])
    .map(
      (it, idx) => `
      <tr class="${idx % 2 ? "zebra" : ""}">
        <td class="col-item">
          <div class="item-name">${escapeHtml(it.name || "Produit")}</div>
          <div class="item-meta">Réservation ${nbJours} jour${
        nbJours > 1 ? "s" : ""
      }</div>
        </td>
        <td class="c">${Number(it.quantity) || 1}</td>
        <td class="r">${euro(it.unit_price_cents)}</td>
        <td class="r">${euro(
          (Number(it.quantity) || 1) * (Number(it.unit_price_cents) || 0)
        )}</td>
      </tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="fr">
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Facture ${escapeHtml(id)}</title>
<style>
  :root{
    --ink:#0F0F14;
    --muted:#586174;
    --line:#ECEEF3;
    --soft:#F7F9FC;
    --brand1:#FFC119;
    --brand2:#FFEB83;
  }
  @page{ size:A4; margin:18mm; }
  *{ box-sizing:border-box; }
  body{
    margin:0; color:var(--ink);
    font: 13px/1.45 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    background:white;
  }
  .wrap{ padding:0; }

  /* Bandeau haut */
  .hero{
    border-radius:16px;
    overflow:hidden;
    border:1px solid var(--line);
    background:
      radial-gradient(1200px 400px at -15% -30%, rgba(255,235,131,0.55), transparent 60%),
      linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7));
  }
  .hero-bar{ height:6px; background:linear-gradient(90deg, var(--brand1), var(--brand2)); }
  .hero-in{
    padding:18px 20px;
    display:flex; align-items:flex-start; justify-content:space-between; gap:16px;
  }
  .brand{ display:flex; align-items:center; gap:12px; }
  .logo{
    width:36px; height:36px; border-radius:10px;
    background:linear-gradient(135deg, var(--brand1), var(--brand2));
    display:grid; place-items:center; color:#111; font-weight:900;
    box-shadow:0 4px 18px rgba(255,193,25,.35) inset;
  }
  .brand-txt{ display:flex; flex-direction:column; }
  .brand-name{ font-weight:800; letter-spacing:.2px; }
  .brand-sub{ color:var(--muted); font-size:12px; }

  .hero-right{ text-align:right; }
  .badge{
    display:inline-block; font-weight:800; font-size:11px; letter-spacing:.3px;
    padding:6px 10px; border-radius:999px; color:#111;
    background:linear-gradient(90deg, var(--brand1), var(--brand2));
    box-shadow: 0 6px 20px rgba(255,193,25,.25);
  }
  .muted{ color:var(--muted); }

  h1{ margin:20px 0 10px; font-size:20px; letter-spacing:.2px; }

  .grid{ display:grid; grid-template-columns:1fr 1fr; gap:12px 20px; }
  .card{
    border:1px solid var(--line); border-radius:12px; background:#fff; padding:14px;
  }
  .card .label{ font-size:12px; color:var(--muted); margin-bottom:4px; }
  .card .value{ white-space:pre-line; }

  table{ width:100%; border-collapse:collapse; margin-top:14px; border:1px solid var(--line); overflow:hidden; border-radius:12px; }
  thead th{
    font-size:12px; text-transform:uppercase; letter-spacing:.35px;
    background:var(--soft); color:#2a2f39; border-bottom:1px solid var(--line);
    padding:11px 12px; text-align:left;
  }
  td{ padding:11px 12px; border-bottom:1px solid var(--line); vertical-align:top; }
  tr.zebra td{ background:#fcfdff; }
  .col-item .item-name{ font-weight:600; }
  .col-item .item-meta{ color:var(--muted); font-size:12px; margin-top:2px; }
  td.c{ text-align:center; }
  td.r{ text-align:right; }

  .tot-wrap{ margin-top:12px; display:flex; justify-content:flex-end; }
  .tot{
    width:320px; border:1px solid var(--line); border-radius:12px; background:#fff; overflow:hidden;
  }
  .tot-row{ display:flex; justify-content:space-between; padding:10px 12px; border-bottom:1px dashed var(--line); }
  .tot-row:last-child{ border-bottom:0; background:linear-gradient(180deg,#fff, #fff7dd); }
  .tot-row strong{ font-size:14px; }

  .note{
    margin-top:18px; font-size:11px; color:var(--muted);
    border-left:3px solid var(--brand1); padding-left:10px;
  }

  .footer{
    margin-top:24px; color:var(--muted); font-size:10.5px; line-height:1.55;
    display:grid; grid-template-columns:1.2fr .8fr; gap:16px;
  }
  .sig, .terms{
    border:1px dashed var(--line); border-radius:10px; padding:10px 12px; background:#fff;
  }

  @media print{ .no-print{ display:none !important; } body{ background:#fff; } }
  .container{ padding:18px; }
</style>

<body>
  <div class="container">
    <div class="wrap">
      <div class="hero">
        <div class="hero-bar"></div>
        <div class="hero-in">
          <div class="brand">
            <div class="logo">SM</div>
            <div class="brand-txt">
              <div class="brand-name">Studio Mont d’Or</div>
              <div class="brand-sub">Location & production audiovisuelle</div>
            </div>
          </div>
          <div class="hero-right">
            <div class="badge">PAIEMENT VALIDÉ</div><br/>
            <div class="muted" style="margin-top:8px">Facture # <strong>${escapeHtml(
              id
            )}</strong></div>
            <div class="muted">Émise le ${escapeHtml(today)}</div>
            <div class="muted">Commande créée le ${escapeHtml(
              new Date(created_at).toLocaleDateString("fr-FR")
            )}</div>
          </div>
        </div>
      </div>

      <h1>Détails de la commande</h1>

      <div class="grid">
        <div class="card">
          <div class="label">Client</div>
          <div class="value">
            <strong>${escapeHtml(name)}</strong><br/>
            Email&nbsp;: ${escapeHtml(customer_email || "—")}<br/>
            Tél.&nbsp;: ${escapeHtml(customer_phone || "—")}
          </div>
        </div>
        <div class="card">
          <div class="label">Période de location</div>
          <div class="value">
            du <strong>${escapeHtml(
              fmtDate(start_date)
            )}</strong> au <strong>${escapeHtml(
    fmtDate(end_date)
  )}</strong><br/>
            (${nbJours} jour${nbJours > 1 ? "s" : ""})
          </div>
        </div>
        <div class="card">
          <div class="label">Adresse</div>
          <div class="value">${escapeHtml(adr)}</div>
        </div>
        <div class="card">
          <div class="label">Référence de commande</div>
          <div class="value"><strong>${escapeHtml(id)}</strong></div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Article</th>
            <th class="c">Qté</th>
            <th class="r">Prix / jour</th>
            <th class="r">Total</th>
          </tr>
        </thead>
        <tbody>
          ${
            rows ||
            `<tr><td colspan="4" class="c muted" style="padding:16px">Aucun article.</td></tr>`
          }
        </tbody>
      </table>

      <div class="tot-wrap">
        <div class="tot">
          <div class="tot-row"><span>Sous-total</span><span>${euro(
            total_amount_cents
          )}</span></div>
          <div class="tot-row"><span>TVA (incluse si applicable)</span><span>—</span></div>
          <div class="tot-row"><strong>Total TTC</strong><strong>${euro(
            total_amount_cents
          )}</strong></div>
        </div>
      </div>

      <div class="note">
        Merci de votre confiance 🙏 — Studio Mont d’Or. Conservez cette facture pour vos dossiers.
        Pour toute question, répondez au mail de confirmation.
      </div>

      <div class="footer">
        <div class="sig">
          <div style="font-weight:700; margin-bottom:6px">Signature & cachet</div>
          <div class="muted">Document généré automatiquement — aucune signature manuscrite requise.</div>
        </div>
        <div class="terms">
          <div style="font-weight:700; margin-bottom:6px">Conditions</div>
          <div class="muted">
            Le matériel reste la propriété du loueur. Toute dégradation est à la charge du client.
            Les réservations sont soumises à nos CGV disponibles sur demande.
          </div>
        </div>
      </div>

      <div class="no-print" style="margin-top:18px; display:flex; gap:8px;">
        <button onclick="window.print()" style="padding:10px 14px; border-radius:10px; border:1px solid var(--line); background:#111; color:#fff; font-weight:700; cursor:pointer">Imprimer</button>
        <button onclick="window.close()" style="padding:10px 14px; border-radius:10px; border:1px solid var(--line); background:#fff; color:#111; font-weight:700; cursor:pointer">Fermer</button>
      </div>
    </div>
  </div>

  <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
</body>
</html>`;
}

// ----- GET: JSON (par défaut) ou facture HTML si ?pdf=1 -----
export async function GET(req, { params }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { id } = params || {};
  if (!id) {
    return new Response(JSON.stringify({ error: "id manquant" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  // qui est connecté ?
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // récupère la commande + items
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id, user_id, session_id,
      start_date, end_date,
      total_amount_cents, status, created_at,
      customer_email, customer_first_name, customer_last_name, customer_phone,
      address,
      items:order_items(id, product_id, name, unit_price_cents, quantity)
    `
    )
    .eq("id", id)
    .single();

  if (error || !order) {
    return new Response(
      JSON.stringify({ error: error?.message || "Commande introuvable" }),
      {
        status: 404,
        headers: { "content-type": "application/json; charset=utf-8" },
      }
    );
  }

  // autorisation: admin OU propriétaire
  const isAdmin = !!user?.app_metadata?.is_admin;
  const isOwner = user?.id && order.user_id && user.id === order.user_id;
  if (!isAdmin && !isOwner) {
    return new Response(JSON.stringify({ error: "Interdit" }), {
      status: 403,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const { searchParams } = new URL(req.url);
  const wantPdf = searchParams.get("pdf");

  if (wantPdf) {
    const html = buildInvoiceHtml(order);
    // inline (ou attachment pour forcer le téléchargement)
    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        // "content-disposition": `attachment; filename="facture-${id}.html"`,
        "x-robots-tag": "noindex",
      },
    });
  }

  // sinon: JSON
  return new Response(JSON.stringify({ order }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

// ----- DELETE: admin supprime une commande et ses items -----
export async function DELETE(_req, { params }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { id } = params || {};

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return new Response(JSON.stringify({ error: "Non authentifié" }), {
      status: 401,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  if (!user.app_metadata?.is_admin) {
    return new Response(JSON.stringify({ error: "Interdit" }), {
      status: 403,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  if (!id) {
    return new Response(JSON.stringify({ error: "id manquant" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const { error: delItemsErr } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", id);
  if (delItemsErr) {
    return new Response(JSON.stringify({ error: delItemsErr.message }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const { error: delOrderErr } = await supabase
    .from("orders")
    .delete()
    .eq("id", id);
  if (delOrderErr) {
    return new Response(JSON.stringify({ error: delOrderErr.message }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

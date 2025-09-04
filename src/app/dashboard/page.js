import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DeleteContactMessageButton from "./DeleteContactMessageButton";

function formatDate(d) {
  try {
    return new Date(d).toLocaleString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");
  if (!user.app_metadata?.is_admin) redirect("/");

  const { data: messages, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, phone, subject, message, consent, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <p className="text-red-600 mt-4">Erreur: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="px-20 py-30 bg-[#F6EAD1] mx-auto p-6">
      <h1 className="text-3xl font-bold">Dashboard Admin</h1>
      <p className="text-[#6B6B6B] mt-2">Bienvenue {user.email}.</p>

      <section className="mt-8">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Messages de contact</h2>
          <span className="text-sm text-gray-600">
            {messages?.length || 0} message(s)
          </span>
        </header>

        <ul className="mt-4 space-y-4">
          {(messages || []).length === 0 && (
            <li className="rounded-2xl p-6 bg-[#ffffff80] ring-1 ring-black/5 text-sm text-gray-600">
              Aucun message pour le moment.
            </li>
          )}

          {(messages || []).map((m) => (
            <MessageCard key={m.id} message={m} />
          ))}
        </ul>
      </section>
    </main>
  );
}

function MessageCard({ message }) {
  return (
    <li className="rounded-2xl bg-[#ffffff80] ring-1 ring-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-noir text-base">
              {message.name}
            </h3>
            <a
              href={`mailto:${message.email}`}
              className="text-sm text-blue-700 hover:underline"
            >
              {message.email}
            </a>
            {message.phone && (
              <a
                href={`tel:${message.phone}`}
                className="text-sm text-gray-700 hover:underline"
              >
                {message.phone}
              </a>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            {message.subject && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white ring-1 ring-black/10">
                {message.subject}
              </span>
            )}
            <span className="text-gray-500">
              {formatDate(message.created_at)}
            </span>
            {message.consent === false && (
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-50 text-red-700 ring-1 ring-red-200">
                sans consentement
              </span>
            )}
          </div>
        </div>

        <div className="mt-1">
          {/* Client component SANS handler */}
          <DeleteContactMessageButton id={message.id} />
        </div>
      </div>

      <div className="mt-4 text-sm text-[#343434] whitespace-pre-line">
        {message.message}
      </div>
    </li>
  );
}

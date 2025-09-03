import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");
  if (!user.app_metadata?.is_admin) redirect("/");

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold">Dashboard Admin</h1>
      <p className="text-[#6B6B6B] mt-2">
        Bienvenue {user.email}. Tu as les droits admin.
      </p>
      {/* Ton contenu admin ici */}
    </main>
  );
}

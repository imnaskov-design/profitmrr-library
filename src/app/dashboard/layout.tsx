import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle();

  return (
    <DashboardShell userEmail={user.email ?? "(no email)"} isAdmin={profile?.role === "admin"}>
      {children}
    </DashboardShell>
  );
}

import { redirect } from "next/navigation";

import { getLoggedProfile } from "@/lib/auth/get-logged-profile";

export default async function Home() {
  const profile = await getLoggedProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role === "ADMIN_MASTER") {
    redirect("/admin");
  }

  redirect("/client");
}

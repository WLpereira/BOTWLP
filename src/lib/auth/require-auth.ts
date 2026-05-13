import { redirect } from "next/navigation";

import { getLoggedProfile } from "@/lib/auth/get-logged-profile";

export async function requireAuth() {
    const profile = await getLoggedProfile();

    if (!profile) {
        redirect("/login");
    }

    if (!profile.active) {
        redirect("/blocked");
    }

    if (profile.must_change_password) {
        redirect("/change-password");
    }

    return profile;
}

export async function requireAdminMaster() {
    const profile = await requireAuth();

    if (profile.role !== "ADMIN_MASTER") {
        redirect("/forbidden");
    }

    return profile;
}

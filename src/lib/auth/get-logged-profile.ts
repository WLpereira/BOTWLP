import { createClient } from "@/lib/supabase/server";
import type { AppUser } from "@/lib/types";

export async function getLoggedProfile(): Promise<AppUser | null> {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
        return null;
    }

    const { data: profile } = await supabase
        .from("users")
        .select("id, name, email, role, active, temporary_password, must_change_password, plan_id, created_at")
        .eq("id", authData.user.id)
        .maybeSingle<AppUser>();

    if (!profile) {
        return null;
    }

    return profile;
}

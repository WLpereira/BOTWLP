import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { AppUser } from "@/lib/types";

export async function requireApiUser() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    const { data: profile } = await supabase
        .from("users")
        .select("id, name, email, role, active, temporary_password, must_change_password, plan_id, created_at")
        .eq("id", user.id)
        .maybeSingle<AppUser>();

    if (!profile || !profile.active) {
        return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }

    return { profile, supabase };
}

export async function requireApiAdminMaster() {
    const result = await requireApiUser();

    if ("error" in result) {
        return result;
    }

    if (result.profile.role !== "ADMIN_MASTER") {
        return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }

    return result;
}

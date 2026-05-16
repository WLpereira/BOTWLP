import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api/auth-guards";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
    const result = await requireApiUser();

    if ("error" in result) {
        return result.error;
    }

    const payload = (await request.json()) as { password?: string };

    if (!payload.password || payload.password.length < 8) {
        return NextResponse.json(
            { error: "Senha deve ter pelo menos 8 caracteres." },
            { status: 400 }
        );
    }

    const { error: updateAuthError } = await result.supabase.auth.updateUser({
        password: payload.password,
    });

    if (updateAuthError) {
        return NextResponse.json({ error: updateAuthError.message }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const { error: updateProfileError } = await adminClient
        .from("users")
        .update({
            must_change_password: false,
            temporary_password: null,
        })
        .eq("id", result.profile.id);

    if (updateProfileError) {
        return NextResponse.json({ error: updateProfileError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
}

import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiAdminMaster } from "@/lib/api/auth-guards";
import { generateTemporaryPassword } from "@/lib/auth/temporary-password";
import { createAdminClient } from "@/lib/supabase/admin";

const createUserSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
    plan_id: z.string().uuid().nullable().optional(),
});

export async function GET() {
    const guard = await requireApiAdminMaster();

    if ("error" in guard) {
        return guard.error;
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
        .from("users")
        .select("id, name, email, role, active, plan_id, created_at")
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ users: data });
}

export async function POST(request: Request) {
    const guard = await requireApiAdminMaster();

    if ("error" in guard) {
        return guard.error;
    }

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const temporaryPassword = generateTemporaryPassword();
    const temporaryPasswordHash = await hash(temporaryPassword, 10);

    const adminClient = createAdminClient();

    const { data: authUserResult, error: authError } = await adminClient.auth.admin.createUser({
        email: parsed.data.email,
        password: temporaryPassword,
        email_confirm: true,
    });

    if (authError || !authUserResult.user) {
        return NextResponse.json({ error: authError?.message ?? "Erro ao criar credencial." }, { status: 400 });
    }

    const { error: insertError } = await adminClient.from("users").insert({
        id: authUserResult.user.id,
        name: parsed.data.name,
        email: parsed.data.email,
        role: "CLIENTE",
        active: true,
        temporary_password: temporaryPasswordHash,
        must_change_password: true,
        plan_id: parsed.data.plan_id ?? null,
    });

    if (insertError) {
        await adminClient.auth.admin.deleteUser(authUserResult.user.id);
        return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({
        ok: true,
        userId: authUserResult.user.id,
        email: parsed.data.email,
        temporaryPassword,
    });
}

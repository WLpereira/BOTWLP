import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiAdminMaster } from "@/lib/api/auth-guards";
import { createAdminClient } from "@/lib/supabase/admin";

const updateSchema = z.object({
    name: z.string().min(2).optional(),
    role: z.enum(["ADMIN_MASTER", "CLIENTE"]).optional(),
    active: z.boolean().optional(),
    plan_id: z.string().uuid().nullable().optional(),
});

type Props = {
    params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Props) {
    const guard = await requireApiAdminMaster();

    if ("error" in guard) {
        return guard.error;
    }

    const { id } = await params;
    const parsed = updateSchema.safeParse(await request.json());

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("users").update(parsed.data).eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: Props) {
    const guard = await requireApiAdminMaster();

    if ("error" in guard) {
        return guard.error;
    }

    const { id } = await params;

    if (id === guard.profile.id) {
        return NextResponse.json({ error: "Você não pode excluir seu próprio usuário." }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(id);

    if (deleteAuthError) {
        return NextResponse.json({ error: deleteAuthError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
}

import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { requireApiAdminMaster } from "@/lib/api/auth-guards";
import { generateTemporaryPassword } from "@/lib/auth/temporary-password";
import { createAdminClient } from "@/lib/supabase/admin";

type Props = {
    params: Promise<{ id: string }>;
};

export async function POST(_: Request, { params }: Props) {
    const guard = await requireApiAdminMaster();

    if ("error" in guard) {
        return guard.error;
    }

    const { id } = await params;
    const temporaryPassword = generateTemporaryPassword();
    const temporaryPasswordHash = await hash(temporaryPassword, 10);

    const adminClient = createAdminClient();

    const { error: resetError } = await adminClient.auth.admin.updateUserById(id, {
        password: temporaryPassword,
    });

    if (resetError) {
        return NextResponse.json({ error: resetError.message }, { status: 400 });
    }

    const { error: updateProfileError } = await adminClient
        .from("users")
        .update({
            must_change_password: true,
            temporary_password: temporaryPasswordHash,
            active: true,
        })
        .eq("id", id);

    if (updateProfileError) {
        return NextResponse.json({ error: updateProfileError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, temporaryPassword });
}

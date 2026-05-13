import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiAdminMaster } from "@/lib/api/auth-guards";
import { createAdminClient } from "@/lib/supabase/admin";

const updatePlanSchema = z.object({
    active: z.boolean().optional(),
    name: z.string().min(2).optional(),
    price_cents: z.number().int().nonnegative().optional(),
});

type Props = {
    params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Props) {
    const guard = await requireApiAdminMaster();

    if ("error" in guard) {
        return guard.error;
    }

    const parsed = updatePlanSchema.safeParse(await request.json());

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const { id } = await params;
    const adminClient = createAdminClient();

    const { error } = await adminClient.from("plans").update(parsed.data).eq("id", id);

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
    const adminClient = createAdminClient();

    const { error } = await adminClient.from("plans").delete().eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
}

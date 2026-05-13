import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiAdminMaster } from "@/lib/api/auth-guards";
import { createAdminClient } from "@/lib/supabase/admin";

const createPlanSchema = z.object({
    name: z.string().min(2),
    price_cents: z.number().int().nonnegative(),
});

export async function GET() {
    const guard = await requireApiAdminMaster();

    if ("error" in guard) {
        return guard.error;
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient.from("plans").select("id, name, price_cents, active, created_at").order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ plans: data });
}

export async function POST(request: Request) {
    const guard = await requireApiAdminMaster();

    if ("error" in guard) {
        return guard.error;
    }

    const parsed = createPlanSchema.safeParse(await request.json());

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("plans").insert({
        name: parsed.data.name,
        price_cents: parsed.data.price_cents,
        active: true,
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
}

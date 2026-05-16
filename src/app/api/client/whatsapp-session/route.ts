import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api/auth-guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMetaConfigured } from "@/lib/whatsapp/meta";

export async function GET() {
    const result = await requireApiUser();

    if ("error" in result) {
        return result.error;
    }

    const { data, error } = await result.supabase
        .from("whatsapp_sessions")
        .select("id, user_id, phone_number, status, created_at")
        .eq("user_id", result.profile.id)
        .maybeSingle();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ session: data });
}

export async function POST(request: Request) {
    const result = await requireApiUser();

    if ("error" in result) {
        return result.error;
    }

    const payload = (await request.json()) as { action?: "connect" | "disconnect"; phone_number?: string };

    if (!isMetaConfigured()) {
        return NextResponse.json(
            {
                error: "Meta Cloud API não configurada. Defina META_WHATSAPP_TOKEN no Vercel.",
            },
            { status: 400 }
        );
    }

    const adminClient = createAdminClient();

    const { data: existingSession, error: loadError } = await adminClient
        .from("whatsapp_sessions")
        .select("id, user_id, phone_number, status, created_at")
        .eq("user_id", result.profile.id)
        .maybeSingle();

    if (loadError) {
        return NextResponse.json({ error: loadError.message }, { status: 400 });
    }

    if (payload.action === "disconnect") {
        const baseRow = {
            user_id: result.profile.id,
            phone_number: null,
            status: "DISCONNECTED" as const,
        };

        const query = existingSession
            ? adminClient.from("whatsapp_sessions").update(baseRow).eq("id", existingSession.id)
            : adminClient.from("whatsapp_sessions").insert(baseRow);

        const { error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({
            ok: true,
            session: {
                ...(existingSession ?? baseRow),
                status: "DISCONNECTED",
                phone_number: null,
                created_at: existingSession?.created_at ?? new Date().toISOString(),
            },
        });
    }

    if (!payload.phone_number?.trim()) {
        return NextResponse.json(
            {
                error: "Informe o Phone Number ID da Cloud API para ativar o canal.",
            },
            { status: 400 }
        );
    }

    const nextStatus: "CONNECTED" = "CONNECTED";
    const baseRow = {
        user_id: result.profile.id,
        phone_number: payload.phone_number ?? null,
        status: nextStatus,
    };

    const query = existingSession
        ? adminClient.from("whatsapp_sessions").update(baseRow).eq("id", existingSession.id)
        : adminClient.from("whatsapp_sessions").insert(baseRow);

    const { error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
        ok: true,
        session: {
            ...(existingSession ?? baseRow),
            status: baseRow.status,
            phone_number: payload.phone_number ?? null,
            created_at: existingSession?.created_at ?? new Date().toISOString(),
        },
    });
}
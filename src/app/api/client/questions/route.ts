import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api/auth-guards";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
    const result = await requireApiUser();

    if ("error" in result) {
        return result.error;
    }

    const { data, error } = await result.supabase
        .from("bot_questions")
        .select("id, user_id, prompt, response, active, sort_order, created_at")
        .eq("user_id", result.profile.id)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ questions: data ?? [] });
}

export async function POST(request: Request) {
    const result = await requireApiUser();

    if ("error" in result) {
        return result.error;
    }

    const payload = (await request.json()) as {
        id?: string;
        prompt?: string;
        response?: string;
        active?: boolean;
        sort_order?: number;
    };

    if (!payload.prompt || !payload.response) {
        return NextResponse.json({ error: "Pergunta e resposta são obrigatórias." }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const data = {
        user_id: result.profile.id,
        prompt: payload.prompt,
        response: payload.response,
        active: payload.active ?? true,
        sort_order: payload.sort_order ?? 0,
    };

    const query = payload.id
        ? adminClient.from("bot_questions").update(data).eq("id", payload.id).eq("user_id", result.profile.id).select()
        : adminClient.from("bot_questions").insert(data).select();

    const { data: savedQuestions, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, question: savedQuestions?.[0] ?? null });
}

export async function DELETE(request: Request) {
    const result = await requireApiUser();

    if ("error" in result) {
        return result.error;
    }

    const payload = (await request.json()) as { id?: string };

    if (!payload.id) {
        return NextResponse.json({ error: "ID da pergunta é obrigatório." }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.from("bot_questions").delete().eq("id", payload.id).eq("user_id", result.profile.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
}
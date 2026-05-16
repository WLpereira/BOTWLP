import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getVerifyToken, sendText } from "@/lib/whatsapp/meta";

type MetaWebhookPayload = {
    object?: string;
    entry?: Array<{
        changes?: Array<{
            value?: {
                metadata?: { phone_number_id?: string };
                messages?: Array<{
                    from?: string;
                    text?: { body?: string };
                    type?: string; // Added type property
                }>;
            };
        }>;
    }>;
};

export async function GET(request: Request) {
    const url = new URL(request.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token && token === getVerifyToken() && challenge) {
        return new Response(challenge, { status: 200 });
    }

    return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
    const payload = (await request.json()) as MetaWebhookPayload;

    if (payload.object !== "whatsapp_business_account") {
        return NextResponse.json({ ok: true });
    }

    const adminClient = createAdminClient();

    for (const entry of payload.entry ?? []) {
        for (const change of entry.changes ?? []) {
            const value = change.value;
            const phoneNumberId = value?.metadata?.phone_number_id;

            if (!phoneNumberId) {
                continue;
            }

            const { data: session } = await adminClient
                .from("whatsapp_sessions")
                .select("id, user_id, phone_number, status")
                .eq("phone_number", phoneNumberId)
                .maybeSingle();

            if (!session) {
                continue;
            }

            await adminClient.from("whatsapp_sessions").update({ status: "CONNECTED" }).eq("id", session.id);

            for (const message of value?.messages ?? []) {
                const from = message.from;
                const messageText = message.text?.body?.trim() ?? "";

                // Ignore group messages and status updates
                if (message.type === "group" || message.type === "status") {
                    continue;
                }

                if (!from || !messageText) {
                    continue;
                }

                await adminClient.from("bot_messages").insert({
                    user_id: session.user_id,
                    direction: "IN",
                    content: messageText,
                });

                const { data: questions } = await adminClient
                    .from("bot_questions")
                    .select("prompt, response, active, sort_order")
                    .eq("user_id", session.user_id)
                    .eq("active", true)
                    .order("sort_order", { ascending: true })
                    .order("created_at", { ascending: true });

                const lowerText = messageText.toLowerCase();
                const match = questions?.find((question) => lowerText.includes(String(question.prompt).toLowerCase()));
                const replyText =
                    match?.response ??
                    "Recebemos sua mensagem. Em breve o bot fará o atendimento desse número automaticamente.";

                await sendText(phoneNumberId, from, String(replyText));

                await adminClient.from("bot_messages").insert({
                    user_id: session.user_id,
                    direction: "OUT",
                    content: String(replyText),
                });
            }
        }
    }

    return NextResponse.json({ ok: true });
}
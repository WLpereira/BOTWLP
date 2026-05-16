import { LogoutButton } from "@/components/logout-button";
import { requireAuth } from "@/lib/auth/require-auth";
import { createClient } from "@/lib/supabase/server";
import type { AppUser, BotMessage, BotQuestion, WhatsAppSession } from "@/lib/types";

import ClientDashboard from "./ClientDashboard";

export default async function ClientPage() {
    const profile = await requireAuth();
    const supabase = await createClient();

    const [{ data: session, error: sessionError }, { data: messages, error: messagesError }, { data: questions, error: questionsError }] = await Promise.all([
        supabase
            .from("whatsapp_sessions")
            .select("id, user_id, phone_number, status, created_at")
            .eq("user_id", profile.id)
            .maybeSingle<WhatsAppSession>(),
        supabase
            .from("bot_messages")
            .select("id, user_id, direction, content, created_at")
            .eq("user_id", profile.id)
            .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .order("created_at", { ascending: false })
            .limit(20)
            .returns<BotMessage[]>(),
        supabase
            .from("bot_questions")
            .select("id, user_id, prompt, response, active, sort_order, created_at")
            .eq("user_id", profile.id)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: true })
            .returns<BotQuestion[]>(),
    ]);

    const setupWarnings = [
        sessionError ? "A sessão do WhatsApp ainda não está pronta no Supabase." : null,
        messagesError ? "O histórico de mensagens ainda não está disponível." : null,
        questionsError ? "A tabela de perguntas do bot ainda não foi aplicada no Supabase. Rode o SQL atualizado." : null,
    ].filter(Boolean) as string[];

    return (
        <main className="mx-auto w-full max-w-5xl flex-1 p-6">
            <header className="mb-6 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                <div>
                    <h1 className="text-2xl font-semibold">Painel do Cliente</h1>
                    <p className="text-sm text-[var(--muted)]">Olá, {profile.name}. Seu ambiente é isolado por usuário.</p>
                </div>
                <LogoutButton />
            </header>

            <ClientDashboard
                profile={profile as AppUser}
                initialSession={session}
                initialMessages={messages ?? []}
                initialQuestions={questions ?? []}
                setupWarnings={setupWarnings}
            />
        </main>
    );
}

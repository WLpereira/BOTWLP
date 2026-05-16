"use client";

import { useMemo, useState } from "react";

import type { AppUser, BotMessage, BotQuestion, WhatsAppSession } from "@/lib/types";

type Props = {
    profile: AppUser;
    initialSession: WhatsAppSession | null;
    initialMessages: BotMessage[];
    initialQuestions: BotQuestion[];
    setupWarnings: string[];
};

export default function ClientDashboard({ profile, initialSession, initialMessages, initialQuestions, setupWarnings }: Props) {
    const [session, setSession] = useState(initialSession);
    const [messages, setMessages] = useState(initialMessages);
    const [questions, setQuestions] = useState(initialQuestions);
    const [phoneNumber, setPhoneNumber] = useState(initialSession?.phone_number ?? "");
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);
    const [newQuestion, setNewQuestion] = useState({ prompt: "", response: "" });
    const [activeTab, setActiveTab] = useState<"session" | "history" | "bot">("session");

    const activeQuestions = questions.filter((question) => question.active).length;

    const lastSyncLabel = useMemo(() => {
        if (!session?.created_at) {
            return "Sem sessão ativa";
        }

        return new Date(session.created_at).toLocaleString("pt-BR");
    }, [session?.created_at]);

    async function handleWhatsAppAction(action: "connect" | "disconnect") {
        setStatusMessage(null);

        const response = await fetch("/api/client/whatsapp-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, phone_number: phoneNumber }),
        });

        const payload = await response.json();

        if (!response.ok) {
            setStatusMessage(payload.error ?? "Falha ao atualizar sessão do WhatsApp.");
            return;
        }

        setSession(payload.session ?? null);
        setStatusMessage(
            action === "disconnect"
                ? "Canal oficial desconectado."
                : "Canal oficial conectado. Mensagens recebidas serão processadas pelo bot."
        );
    }

    async function handleSaveQuestion(question: BotQuestion) {
        setSavingQuestionId(question.id);
        setStatusMessage(null);

        const response = await fetch("/api/client/questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(question),
        });

        const payload = await response.json();

        if (!response.ok) {
            setStatusMessage(payload.error ?? "Falha ao salvar pergunta.");
            setSavingQuestionId(null);
            return;
        }

        const savedQuestion: BotQuestion = payload.question ?? question;
        setQuestions((current) => current.map((item) => (item.id === question.id ? savedQuestion : item)));
        setStatusMessage("Pergunta atualizada com sucesso.");
        setSavingQuestionId(null);
    }

    async function handleCreateQuestion() {
        if (!newQuestion.prompt.trim() || !newQuestion.response.trim()) {
            setStatusMessage("Informe pergunta e resposta.");
            return;
        }

        setStatusMessage(null);

        const response = await fetch("/api/client/questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: newQuestion.prompt,
                response: newQuestion.response,
                active: true,
                sort_order: questions.length + 1,
            }),
        });

        const payload = await response.json();

        if (!response.ok) {
            setStatusMessage(payload.error ?? "Falha ao criar pergunta.");
            return;
        }

        const createdQuestion: BotQuestion = payload.question ?? {
            id: crypto.randomUUID(),
            user_id: profile.id,
            prompt: newQuestion.prompt,
            response: newQuestion.response,
            active: true,
            sort_order: questions.length + 1,
            created_at: new Date().toISOString(),
        };

        setQuestions((current) => [...current, createdQuestion]);
        setNewQuestion({ prompt: "", response: "" });
        setStatusMessage("Pergunta adicionada com sucesso.");
    }

    async function handleDeleteQuestion(questionId: string) {
        const confirmed = window.confirm("Deseja remover esta pergunta do bot?");

        if (!confirmed) {
            return;
        }

        setSavingQuestionId(questionId);
        setStatusMessage(null);

        const response = await fetch("/api/client/questions", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: questionId }),
        });

        const payload = await response.json();

        if (!response.ok) {
            setStatusMessage(payload.error ?? "Falha ao excluir pergunta.");
            setSavingQuestionId(null);
            return;
        }

        setQuestions((current) => current.filter((item) => item.id !== questionId));
        setStatusMessage("Pergunta removida.");
        setSavingQuestionId(null);
    }

    async function handlePhoneNumberSubmit() {
        setStatusMessage(null);

        const response = await fetch("/api/client/whatsapp-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone_number: phoneNumber }),
        });

        const payload = await response.json();

        if (!response.ok) {
            setStatusMessage(payload.error ?? "Falha ao conectar o número de telefone.");
            return;
        }

        setSession(payload.session ?? null);
        setStatusMessage("Número de telefone conectado com sucesso. Mensagens recebidas serão processadas pelo bot.");
    }

    return (
        <section className="space-y-4">
            {setupWarnings.length ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
                    {setupWarnings.map((warning) => (
                        <p key={warning}>{warning}</p>
                    ))}
                </div>
            ) : null}

            {statusMessage ? <div className="rounded-2xl bg-white p-4 text-sm shadow-sm">{statusMessage}</div> : null}

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">WhatsApp</p>
                    <p className="mt-2 text-3xl font-semibold">{session?.status ?? "DISCONNECTED"}</p>
                    <p className="mt-2 text-sm text-[var(--muted)]">Sessão atual do cliente.</p>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Mensagens 7 dias</p>
                    <p className="mt-2 text-3xl font-semibold">{messages.length}</p>
                    <p className="mt-2 text-sm text-[var(--muted)]">Histórico recente de conversas.</p>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Perguntas ativas</p>
                    <p className="mt-2 text-3xl font-semibold">{activeQuestions}</p>
                    <p className="mt-2 text-sm text-[var(--muted)]">Base de conhecimento do bot.</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 rounded-2xl bg-white p-2 shadow-sm">
                {[
                    { key: "session", label: "Conexão WhatsApp" },
                    { key: "history", label: "Histórico" },
                    { key: "bot", label: "Bot Studio" },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key as typeof activeTab)}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeTab === tab.key ? "bg-[var(--brand)] text-white" : "bg-white text-[var(--muted)]"}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div>
                <h1>Conexão do WhatsApp</h1>
                <div>
                    <label htmlFor="phoneNumber">Número de Telefone:</label>
                    <input
                        type="text"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Digite o número de telefone"
                    />
                    <button onClick={handlePhoneNumberSubmit}>Conectar Número</button>
                </div>
                {statusMessage && <p>{statusMessage}</p>}
            </div>

            {activeTab === "session" ? (
                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold">Conectar WhatsApp</h2>
                                <p className="mt-1 text-sm text-[var(--muted)]">Conecte o número oficial da Cloud API e gerencie o canal.</p>
                            </div>
                            <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand)]">
                                {session?.status ?? "DISCONNECTED"}
                            </span>
                        </div>

                        <div className="mt-4 space-y-3">
                            <label className="block text-sm font-medium" htmlFor="phoneNumber">
                                Phone Number ID (Cloud API)
                            </label>
                            <input
                                id="phoneNumber"
                                value={phoneNumber}
                                onChange={(event) => setPhoneNumber(event.target.value)}
                                placeholder="Ex.: 123456789012345"
                                className="w-full rounded-lg border border-[var(--panel-border)] px-3 py-2"
                            />

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => void handleWhatsAppAction("connect")}
                                    className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white"
                                >
                                    Conectar canal oficial
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void handleWhatsAppAction("disconnect")}
                                    className="rounded-lg border border-[var(--panel-border)] bg-white px-4 py-2 text-sm font-semibold"
                                >
                                    Desconectar canal
                                </button>
                            </div>

                            <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--background-soft)] p-4 text-sm">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium">Status da sessão</p>
                                    <p className="text-xs text-[var(--muted)]">{lastSyncLabel}</p>
                                </div>
                                <p className="mt-2 text-sm text-[var(--muted)]">
                                    A Meta Cloud API nao usa QR de sessao. O bot responde pelas mensagens recebidas no webhook oficial.
                                </p>
                                <div className="mt-3 rounded-lg bg-white p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Canal configurado</p>
                                    <p className="mt-2 break-all font-mono text-xs">{phoneNumber || "Nao informado"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold">Histórico de conversas</h2>
                                <p className="mt-1 text-sm text-[var(--muted)]">Últimos 7 dias, separado por entradas e saídas.</p>
                            </div>
                            <span className="rounded-full border border-[var(--panel-border)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                                {messages.length} registros
                            </span>
                        </div>

                        <div className="mt-4 space-y-3">
                            {messages.length ? (
                                messages.map((message) => (
                                    <div key={message.id} className="rounded-xl border border-[var(--panel-border)] p-3 text-sm">
                                        <div className="flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
                                            <span className="rounded-full bg-[var(--background-soft)] px-2 py-1 font-semibold">
                                                {message.direction === "IN" ? "Entrada" : "Saída"}
                                            </span>
                                            <span>{new Date(message.created_at).toLocaleString("pt-BR")}</span>
                                        </div>
                                        <p className="mt-2 leading-6">{message.content}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-xl border border-dashed border-[var(--panel-border)] p-4 text-sm text-[var(--muted)]">
                                    Nenhuma mensagem encontrada nos últimos 7 dias.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}

            {activeTab === "bot" ? (
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold">Bot Studio</h2>
                            <p className="mt-1 text-sm text-[var(--muted)]">Crie perguntas e respostas inteligentes, separadas por cliente.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => void handleCreateQuestion()}
                            className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white"
                        >
                            Salvar nova pergunta
                        </button>
                    </div>

                    <div className="mt-4 grid gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--background-soft)] p-4 md:grid-cols-[1.2fr_1.2fr_0.8fr]">
                        <input
                            value={newQuestion.prompt}
                            onChange={(event) => setNewQuestion((current) => ({ ...current, prompt: event.target.value }))}
                            placeholder="Pergunta que o cliente pode fazer"
                            className="rounded-lg border border-[var(--panel-border)] px-3 py-2"
                        />
                        <textarea
                            value={newQuestion.response}
                            onChange={(event) => setNewQuestion((current) => ({ ...current, response: event.target.value }))}
                            placeholder="Resposta automática do bot"
                            className="min-h-24 rounded-lg border border-[var(--panel-border)] px-3 py-2"
                        />
                        <div className="flex flex-col justify-between gap-2 rounded-lg border border-[var(--panel-border)] bg-white px-3 py-2 text-sm text-[var(--muted)]">
                            <p>Defina a resposta do bot de forma clara e profissional.</p>
                            <p>Você pode desativar ou excluir depois.</p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-3">
                        {questions.length ? (
                            questions.map((question, index) => (
                                <div key={question.id} className="rounded-xl border border-[var(--panel-border)] p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                                            Regra #{index + 1}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setQuestions((current) =>
                                                        current.map((item) =>
                                                            item.id === question.id ? { ...item, active: !item.active } : item
                                                        )
                                                    )
                                                }
                                                className={`rounded-lg px-3 py-2 text-sm font-semibold ${question.active ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "bg-[var(--background-soft)] text-[var(--muted)]"}`}
                                            >
                                                {question.active ? "Ativa" : "Inativa"}
                                            </button>
                                            <button
                                                type="button"
                                                disabled={savingQuestionId === question.id}
                                                onClick={() => void handleSaveQuestion({ ...question, sort_order: index + 1 })}
                                                className="rounded-lg bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-70"
                                            >
                                                {savingQuestionId === question.id ? "Salvando..." : "Salvar"}
                                            </button>
                                            <button
                                                type="button"
                                                disabled={savingQuestionId === question.id}
                                                onClick={() => void handleDeleteQuestion(question.id)}
                                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-70"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_1.2fr_0.8fr]">
                                        <input
                                            value={question.prompt}
                                            onChange={(event) =>
                                                setQuestions((current) =>
                                                    current.map((item) => (item.id === question.id ? { ...item, prompt: event.target.value } : item))
                                                )
                                            }
                                            className="rounded-lg border border-[var(--panel-border)] px-3 py-2"
                                        />
                                        <textarea
                                            value={question.response}
                                            onChange={(event) =>
                                                setQuestions((current) =>
                                                    current.map((item) => (item.id === question.id ? { ...item, response: event.target.value } : item))
                                                )
                                            }
                                            className="min-h-24 rounded-lg border border-[var(--panel-border)] px-3 py-2"
                                        />
                                        <div className="rounded-lg border border-[var(--panel-border)] bg-[var(--background-soft)] px-3 py-2 text-sm text-[var(--muted)]">
                                            O bot responde com esta regra quando a pergunta do cliente corresponde ao gatilho.
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-[var(--panel-border)] p-4 text-sm text-[var(--muted)]">
                                Nenhuma pergunta configurada ainda. Comece criando a primeira regra do bot.
                            </div>
                        )}
                    </div>
                </div>
            ) : null}

            {activeTab === "history" ? (
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold">Histórico operacional</h2>
                            <p className="mt-1 text-sm text-[var(--muted)]">Resumo da sessão, mensagens e configuração do bot.</p>
                        </div>
                        <span className="rounded-full border border-[var(--panel-border)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                            {profile.email}
                        </span>
                    </div>

                    <div className="mt-4 space-y-3">
                        {messages.length ? (
                            messages.slice(0, 10).map((message) => (
                                <div key={message.id} className="flex items-start justify-between gap-4 rounded-xl border border-[var(--panel-border)] p-4 text-sm">
                                    <div>
                                        <p className="font-semibold">{message.direction === "IN" ? "Entrada de cliente" : "Resposta do bot"}</p>
                                        <p className="mt-1 text-[var(--muted)]">{message.content}</p>
                                    </div>
                                    <span className="shrink-0 text-xs text-[var(--muted)]">{new Date(message.created_at).toLocaleString("pt-BR")}</span>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-[var(--panel-border)] p-4 text-sm text-[var(--muted)]">
                                Sem histórico disponível no momento.
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
        </section>
    );
}
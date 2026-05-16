"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function ChangePasswordForm() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (password.length < 8) {
            setError("A nova senha deve ter pelo menos 8 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setError("As senhas não conferem.");
            return;
        }

        setLoading(true);
        setError(null);

        const response = await fetch("/api/auth/change-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ password }),
        });

        const payload = await response.json();

        if (!response.ok) {
            setError(payload.error ?? "Falha ao alterar senha.");
            setLoading(false);
            return;
        }

        setSuccess("Senha alterada com sucesso.");
        setLoading(false);

        setTimeout(() => {
            void (async () => {
                const supabase = createClient();
                await supabase.auth.signOut({ scope: "global" });
                window.location.replace("/login");
            })();
        }, 900);
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold">Troca obrigatória de senha</h1>
            <p className="text-sm text-[var(--muted)]">
                No primeiro acesso, você precisa definir sua senha pessoal.
            </p>

            <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                    Nova senha
                </label>
                <input
                    id="password"
                    type="password"
                    className="w-full rounded-lg border border-[var(--panel-border)] px-3 py-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirmar senha
                </label>
                <input
                    id="confirmPassword"
                    type="password"
                    className="w-full rounded-lg border border-[var(--panel-border)] px-3 py-2"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {success ? <p className="text-sm text-green-700">{success}</p> : null}

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-[var(--brand-foreground)] disabled:opacity-70"
            >
                {loading ? "Salvando..." : "Salvar nova senha"}
            </button>
        </form>
    );
}

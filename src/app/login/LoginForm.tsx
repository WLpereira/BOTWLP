"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            setError("Credenciais inválidas ou acesso não autorizado.");
            setLoading(false);
            return;
        }

        const { data: authData } = await supabase.auth.getUser();

        if (authData.user) {
            const { data: profile } = await supabase
                .from("users")
                .select("role, must_change_password")
                .eq("id", authData.user.id)
                .maybeSingle<{ role: "ADMIN_MASTER" | "CLIENTE"; must_change_password: boolean }>();

            if (profile?.must_change_password) {
                router.push("/change-password");
            } else {
                router.push(profile?.role === "ADMIN_MASTER" ? "/admin" : "/client");
            }
        } else {
            router.push("/");
        }

        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-sm">
            <div>
                <h1 className="text-2xl font-semibold">Acesso BOTWLP</h1>
                <p className="text-sm text-[var(--muted)]">Somente usuários criados pelo ADMIN MASTER.</p>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                    E-mail
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[var(--panel-border)] px-3 py-2"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">
                    Senha
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[var(--panel-border)] px-3 py-2"
                />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-[var(--brand-foreground)] disabled:opacity-70"
            >
                {loading ? "Entrando..." : "Entrar"}
            </button>
        </form>
    );
}

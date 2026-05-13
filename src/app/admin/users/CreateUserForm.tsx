"use client";

import { useState } from "react";

type Plan = {
    id: string;
    name: string;
};

export default function CreateUserForm({ plans }: { plans: Plan[] }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [planId, setPlanId] = useState("");
    const [loading, setLoading] = useState(false);
    const [tempPassword, setTempPassword] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setTempPassword(null);

        const response = await fetch("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                email,
                plan_id: planId || null,
            }),
        });

        const payload = await response.json();

        if (!response.ok) {
            setError(payload.error ?? "Falha ao criar usuário.");
            setLoading(false);
            return;
        }

        setTempPassword(payload.temporaryPassword);
        setName("");
        setEmail("");
        setPlanId("");
        setLoading(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                    Nome
                </label>
                <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-[var(--panel-border)] px-3 py-2"
                    required
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                    E-mail
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-[var(--panel-border)] px-3 py-2"
                    required
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="plan" className="text-sm font-medium">
                    Plano
                </label>
                <select
                    id="plan"
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="w-full rounded-lg border border-[var(--panel-border)] px-3 py-2"
                >
                    <option value="">Sem plano</option>
                    {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                            {plan.name}
                        </option>
                    ))}
                </select>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
            >
                {loading ? "Criando..." : "Criar usuário cliente"}
            </button>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {tempPassword ? (
                <p className="text-sm text-green-700">
                    Usuário criado com senha temporária: <strong>{tempPassword}</strong>
                </p>
            ) : null}
        </form>
    );
}

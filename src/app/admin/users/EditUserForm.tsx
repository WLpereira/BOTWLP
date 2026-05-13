"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Plan = {
    id: string;
    name: string;
};

type User = {
    id: string;
    name: string;
    email: string;
    role: "ADMIN_MASTER" | "CLIENTE";
    active: boolean;
    plan_id: string | null;
};

export default function EditUserForm({ user, plans }: { user: User; plans: Plan[] }) {
    const router = useRouter();
    const [name, setName] = useState(user.name);
    const [role, setRole] = useState(user.role);
    const [active, setActive] = useState(user.active);
    const [planId, setPlanId] = useState(user.plan_id ?? "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/admin/users/${user.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                role,
                active,
                plan_id: planId || null,
            }),
        });

        const payload = await response.json();

        if (!response.ok) {
            setError(payload.error ?? "Não foi possível salvar.");
            setLoading(false);
            return;
        }

        setLoading(false);
        router.push("/admin/users");
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-[var(--muted)]">E-mail: {user.email}</p>

            <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="name">
                    Nome
                </label>
                <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-[var(--panel-border)] px-3 py-2"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="role">
                    Papel
                </label>
                <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as "ADMIN_MASTER" | "CLIENTE")}
                    className="w-full rounded-lg border border-[var(--panel-border)] px-3 py-2"
                >
                    <option value="CLIENTE">CLIENTE</option>
                    <option value="ADMIN_MASTER">ADMIN_MASTER</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="plan">
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

            <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                Usuário ativo
            </label>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
            >
                {loading ? "Salvando..." : "Salvar alterações"}
            </button>
        </form>
    );
}

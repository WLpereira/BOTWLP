"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PlanForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        await fetch("/api/admin/plans", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                price_cents: Math.round(Number(price) * 100),
            }),
        });

        setName("");
        setPrice("");
        setLoading(false);
        router.refresh();
    }

    return (
        <form onSubmit={handleCreate} className="mb-5 grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-4">
            <input
                placeholder="Nome do plano"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border border-[var(--panel-border)] px-3 py-2"
                required
            />
            <input
                placeholder="Preço mensal (ex: 99.9)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-lg border border-[var(--panel-border)] px-3 py-2"
                required
            />
            <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
            >
                {loading ? "Salvando..." : "Criar plano"}
            </button>
        </form>
    );
}

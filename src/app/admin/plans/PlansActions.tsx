"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PlansActions({ id, active }: { id: string; active: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function toggle() {
        setLoading(true);
        await fetch(`/api/admin/plans/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active: !active }),
        });
        setLoading(false);
        router.refresh();
    }

    async function remove() {
        setLoading(true);
        await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
        setLoading(false);
        router.refresh();
    }

    return (
        <div className="flex gap-2">
            <button
                type="button"
                onClick={toggle}
                disabled={loading}
                className="rounded-lg border border-[var(--panel-border)] px-2 py-1 text-xs"
            >
                {active ? "Desativar" : "Ativar"}
            </button>
            <button
                type="button"
                onClick={remove}
                disabled={loading}
                className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700"
            >
                Excluir
            </button>
        </div>
    );
}

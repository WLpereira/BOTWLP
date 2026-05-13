"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
    id: string;
    active: boolean;
};

export default function UserActions({ id, active }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [tempPassword, setTempPassword] = useState<string | null>(null);

    async function toggleActive() {
        setLoading(true);
        await fetch(`/api/admin/users/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active: !active }),
        });
        setLoading(false);
        router.refresh();
    }

    async function resetPassword() {
        setLoading(true);
        const response = await fetch(`/api/admin/users/${id}/reset-password`, {
            method: "POST",
        });
        const payload = await response.json();
        if (response.ok && payload.temporaryPassword) {
            setTempPassword(payload.temporaryPassword);
        }
        setLoading(false);
        router.refresh();
    }

    async function deleteUser() {
        setLoading(true);
        await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
        setLoading(false);
        router.refresh();
    }

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                <Link href={`/admin/users/${id}/edit`} className="rounded-lg border border-[var(--panel-border)] px-2 py-1 text-xs">
                    Editar
                </Link>
                <button
                    type="button"
                    onClick={toggleActive}
                    disabled={loading}
                    className="rounded-lg border border-[var(--panel-border)] px-2 py-1 text-xs"
                >
                    {active ? "Bloquear" : "Ativar"}
                </button>
                <button
                    type="button"
                    onClick={resetPassword}
                    disabled={loading}
                    className="rounded-lg border border-[var(--panel-border)] px-2 py-1 text-xs"
                >
                    Resetar senha
                </button>
                <button
                    type="button"
                    onClick={deleteUser}
                    disabled={loading}
                    className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700"
                >
                    Excluir
                </button>
            </div>

            {tempPassword ? (
                <p className="text-xs text-green-700">
                    Senha temporária gerada: <strong>{tempPassword}</strong>
                </p>
            ) : null}
        </div>
    );
}

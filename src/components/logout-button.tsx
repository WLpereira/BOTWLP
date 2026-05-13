"use client";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
    const router = useRouter();

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-[var(--panel-border)] bg-white px-3 py-2 text-sm font-medium"
        >
            Sair
        </button>
    );
}

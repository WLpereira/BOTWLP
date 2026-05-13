import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import UserActions from "./UserActions";

export default async function AdminUsersPage() {
    const supabase = await createClient();

    const { data: users } = await supabase
        .from("users")
        .select("id, name, email, role, active, plan_id, created_at")
        .order("created_at", { ascending: false });

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Lista de Usuários</h2>
                <Link href="/admin/users/new" className="rounded-lg bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-white">
                    Novo usuário
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-[var(--panel-border)]">
                            <th className="py-2">Nome</th>
                            <th className="py-2">E-mail</th>
                            <th className="py-2">Role</th>
                            <th className="py-2">Status</th>
                            <th className="py-2">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users?.map((user) => (
                            <tr key={user.id} className="border-b border-[var(--panel-border)] align-top">
                                <td className="py-2">{user.name}</td>
                                <td className="py-2">{user.email}</td>
                                <td className="py-2">{user.role}</td>
                                <td className="py-2">{user.active ? "Ativo" : "Bloqueado"}</td>
                                <td className="py-2">
                                    <UserActions id={user.id} active={user.active} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

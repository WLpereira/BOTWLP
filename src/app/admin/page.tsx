import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    const [{ count: userCount }, { count: activeUserCount }, { count: sessionsCount }, { data: recentUsers }] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("users").select("*", { count: "exact", head: true }).eq("active", true),
        supabase.from("whatsapp_sessions").select("*", { count: "exact", head: true }),
        supabase.from("users").select("id, name, email, role, active, created_at").order("created_at", { ascending: false }).limit(5),
    ]);

    return (
        <div className="space-y-4">
            <section className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-[var(--muted)]">Primeiro login do ADMIN</p>
                <h2 className="mt-1 text-2xl font-semibold">Painel de controle da plataforma</h2>
                <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
                    Aqui você cria clientes, bloqueia acessos, redefine senhas, gerencia planos e acompanha as sessões WhatsApp.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                    <Link href="/admin/users/new" className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white">
                        Criar usuário
                    </Link>
                    <Link href="/admin/users" className="rounded-lg border border-[var(--panel-border)] px-4 py-2 text-sm font-semibold">
                        Ver usuários
                    </Link>
                    <Link href="/admin/plans" className="rounded-lg border border-[var(--panel-border)] px-4 py-2 text-sm font-semibold">
                        Gerenciar planos
                    </Link>
                </div>
            </section>

            <div className="grid gap-4 md:grid-cols-3">
                <article className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-medium text-[var(--muted)]">Usuários cadastrados</h2>
                    <p className="mt-2 text-3xl font-semibold">{userCount ?? 0}</p>
                </article>

                <article className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-medium text-[var(--muted)]">Usuários ativos</h2>
                    <p className="mt-2 text-3xl font-semibold">{activeUserCount ?? 0}</p>
                </article>

                <article className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-medium text-[var(--muted)]">Sessões WhatsApp</h2>
                    <p className="mt-2 text-3xl font-semibold">{sessionsCount ?? 0}</p>
                </article>
            </div>

            <section className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Últimos usuários</h3>
                    <Link href="/admin/users" className="text-sm font-medium text-[var(--brand)]">
                        Abrir lista completa
                    </Link>
                </div>

                <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-[var(--panel-border)]">
                                <th className="py-2">Nome</th>
                                <th className="py-2">E-mail</th>
                                <th className="py-2">Role</th>
                                <th className="py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentUsers?.map((user) => (
                                <tr key={user.id} className="border-b border-[var(--panel-border)]">
                                    <td className="py-2">{user.name}</td>
                                    <td className="py-2">{user.email}</td>
                                    <td className="py-2">{user.role}</td>
                                    <td className="py-2">{user.active ? "Ativo" : "Bloqueado"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

import { createClient } from "@/lib/supabase/server";

export default async function AdminFinancePage() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("finance_entries")
        .select("id, user_id, amount_cents, status, due_date, created_at")
        .order("created_at", { ascending: false })
        .limit(30);

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Gerenciar Financeiro</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Cobranças e status de pagamento por cliente.</p>

            <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-[var(--panel-border)]">
                            <th className="py-2">ID</th>
                            <th className="py-2">Usuário</th>
                            <th className="py-2">Valor</th>
                            <th className="py-2">Status</th>
                            <th className="py-2">Vencimento</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((item) => (
                            <tr key={item.id} className="border-b border-[var(--panel-border)]">
                                <td className="py-2">{item.id}</td>
                                <td className="py-2">{item.user_id}</td>
                                <td className="py-2">R$ {(item.amount_cents / 100).toFixed(2)}</td>
                                <td className="py-2">{item.status}</td>
                                <td className="py-2">{item.due_date ?? "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

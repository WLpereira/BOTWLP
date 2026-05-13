import { createClient } from "@/lib/supabase/server";

export default async function AdminSessionsPage() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("whatsapp_sessions")
        .select("id, user_id, phone_number, status, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Gerenciar Sessões WhatsApp</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Visão administrativa de conexões por QR Code.</p>

            <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-[var(--panel-border)]">
                            <th className="py-2">ID Sessão</th>
                            <th className="py-2">Usuário</th>
                            <th className="py-2">Número</th>
                            <th className="py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((item) => (
                            <tr key={item.id} className="border-b border-[var(--panel-border)]">
                                <td className="py-2">{item.id}</td>
                                <td className="py-2">{item.user_id}</td>
                                <td className="py-2">{item.phone_number ?? "-"}</td>
                                <td className="py-2">{item.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

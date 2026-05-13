import { createClient } from "@/lib/supabase/server";

import PlanForm from "./PlanForm";
import PlansActions from "./PlansActions";

export default async function AdminPlansPage() {
    const supabase = await createClient();
    const { data: plans } = await supabase
        .from("plans")
        .select("id, name, price_cents, active, created_at")
        .order("created_at", { ascending: false });

    return (
        <div>
            <h2 className="mb-3 text-xl font-semibold">Gerenciar Planos</h2>
            <PlanForm />

            <div className="rounded-2xl bg-white p-5 shadow-sm">
                <table className="min-w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-[var(--panel-border)]">
                            <th className="py-2">Plano</th>
                            <th className="py-2">Preço</th>
                            <th className="py-2">Status</th>
                            <th className="py-2">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plans?.map((plan) => (
                            <tr key={plan.id} className="border-b border-[var(--panel-border)]">
                                <td className="py-2">{plan.name}</td>
                                <td className="py-2">R$ {(plan.price_cents / 100).toFixed(2)}</td>
                                <td className="py-2">{plan.active ? "Ativo" : "Inativo"}</td>
                                <td className="py-2">
                                    <PlansActions id={plan.id} active={plan.active} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

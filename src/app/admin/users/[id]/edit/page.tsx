import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import EditUserForm from "../../EditUserForm";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function AdminEditUserPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();

    const [{ data: user }, { data: plans }] = await Promise.all([
        supabase
            .from("users")
            .select("id, name, email, role, active, plan_id")
            .eq("id", id)
            .maybeSingle(),
        supabase.from("plans").select("id, name").order("name"),
    ]);

    if (!user) {
        notFound();
    }

    return (
        <div>
            <h2 className="mb-3 text-xl font-semibold">Editar Usuário</h2>
            <EditUserForm user={user} plans={plans ?? []} />
        </div>
    );
}

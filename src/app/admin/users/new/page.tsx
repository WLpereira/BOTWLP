import { createClient } from "@/lib/supabase/server";

import CreateUserForm from "../CreateUserForm";

export default async function AdminCreateUserPage() {
    const supabase = await createClient();
    const { data: plans } = await supabase.from("plans").select("id, name").eq("active", true).order("name");

    return (
        <div>
            <h2 className="mb-3 text-xl font-semibold">Criar Usuário</h2>
            <CreateUserForm plans={plans ?? []} />
        </div>
    );
}

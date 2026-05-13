import { AdminNav } from "@/components/admin-nav";
import { LogoutButton } from "@/components/logout-button";
import { requireAdminMaster } from "@/lib/auth/require-auth";

export default async function AdminLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const profile = await requireAdminMaster();

    return (
        <main className="mx-auto w-full max-w-7xl flex-1 p-6">
            <header className="mb-4 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                <div>
                    <h1 className="text-2xl font-semibold">Painel ADMIN MASTER</h1>
                    <p className="text-sm text-[var(--muted)]">Controle total da plataforma privada.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-[var(--muted)]">{profile.email}</span>
                    <LogoutButton />
                </div>
            </header>

            <AdminNav />
            <section className="mt-4">{children}</section>
        </main>
    );
}

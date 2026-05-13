import { LogoutButton } from "@/components/logout-button";
import { requireAuth } from "@/lib/auth/require-auth";

export default async function ClientPage() {
    const profile = await requireAuth();

    return (
        <main className="mx-auto w-full max-w-5xl flex-1 p-6">
            <header className="mb-6 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                <div>
                    <h1 className="text-2xl font-semibold">Painel do Cliente</h1>
                    <p className="text-sm text-[var(--muted)]">Olá, {profile.name}. Seu ambiente é isolado por usuário.</p>
                </div>
                <LogoutButton />
            </header>

            <section className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">Conectar WhatsApp</h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                        Esta seção está pronta para integração com o serviço de sessão QR Code.
                    </p>
                    <button className="mt-4 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white">
                        Iniciar sessão por QR Code
                    </button>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">Histórico e Bot</h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                        Visualize histórico, ajuste respostas e configure seu bot usando apenas dados da sua conta.
                    </p>
                </div>
            </section>
        </main>
    );
}

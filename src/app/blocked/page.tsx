export default function BlockedPage() {
    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow-sm">
                <h1 className="text-2xl font-semibold">Acesso bloqueado</h1>
                <p className="mt-2 text-sm text-[var(--muted)]">
                    Seu usuário está inativo. Contate o administrador para reativação.
                </p>
            </div>
        </main>
    );
}

import Link from "next/link";

const links = [
    { href: "/admin", label: "Dashboard Admin" },
    { href: "/admin/users", label: "Lista Usuários" },
    { href: "/admin/users/new", label: "Criar Usuário" },
    { href: "/admin/plans", label: "Gerenciar Planos" },
    { href: "/admin/sessions", label: "Sessões WhatsApp" },
    { href: "/admin/finance", label: "Financeiro" },
];

export function AdminNav() {
    return (
        <nav className="rounded-2xl bg-white p-3 shadow-sm">
            <div className="mb-3 px-1 text-sm font-medium text-[var(--muted)]">Ações administrativas</div>
            <ul className="grid gap-2 md:grid-cols-3">
                {links.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className="block rounded-lg border border-[var(--panel-border)] px-3 py-2 text-sm font-medium hover:bg-[var(--background)]"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

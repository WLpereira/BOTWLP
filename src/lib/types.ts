export type UserRole = "ADMIN_MASTER" | "CLIENTE";

export type AppUser = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    active: boolean;
    temporary_password: string | null;
    must_change_password: boolean;
    plan_id: string | null;
    created_at: string;
};

export type Plan = {
    id: string;
    name: string;
    price_cents: number;
    active: boolean;
    created_at: string;
};

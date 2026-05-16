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

export type WhatsAppSession = {
    id: string;
    user_id: string;
    phone_number: string | null;
    status: "DISCONNECTED" | "CONNECTING" | "CONNECTED";
    created_at: string;
};

export type BotMessage = {
    id: string;
    user_id: string;
    direction: "IN" | "OUT";
    content: string;
    created_at: string;
};

export type BotQuestion = {
    id: string;
    user_id: string;
    prompt: string;
    response: string;
    active: boolean;
    sort_order: number;
    created_at: string;
};

import type { UserRole } from "@/lib/types";

export const ROLES: Record<UserRole, UserRole> = {
    ADMIN_MASTER: "ADMIN_MASTER",
    CLIENTE: "CLIENTE",
};

export function isAdminMaster(role: string | null | undefined): boolean {
    return role === ROLES.ADMIN_MASTER;
}

import ChangePasswordForm from "@/app/change-password/ChangePasswordForm";
import { requireAuth } from "@/lib/auth/require-auth";

export default async function ChangePasswordPage() {
    await requireAuth();

    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <ChangePasswordForm />
        </main>
    );
}

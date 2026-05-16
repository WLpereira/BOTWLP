import ChangePasswordForm from "@/app/change-password/ChangePasswordForm";
import { getLoggedProfile } from "@/lib/auth/get-logged-profile";
import { redirect } from "next/navigation";

export default async function ChangePasswordPage() {
    const profile = await getLoggedProfile();

    if (!profile) {
        redirect("/login");
    }

    if (!profile.active) {
        redirect("/blocked");
    }

    if (!profile.must_change_password) {
        redirect("/");
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <ChangePasswordForm />
        </main>
    );
}

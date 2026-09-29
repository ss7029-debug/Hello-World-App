import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage({
                                              searchParams,
                                          }: {
    searchParams: Promise<{ onboarding?: string }>;
}) {
    const { onboarding } = await searchParams;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url")
        .eq("id", user.id)
        .single();

    return (
        <main>
            <NavBar />
            <div style={{ padding: "40px", maxWidth: "500px" }}>
                <h1>Profile</h1>
                <p>Signed in as {user.email}</p>

                {onboarding && (
                    <p style={{ background: "#fff3cd", padding: "10px" }}>
                        Please add your first and last name to continue.
                    </p>
                )}

                <ProfileForm
                    userId={user.id}
                    firstName={profile?.first_name ?? ""}
                    lastName={profile?.last_name ?? ""}
                    avatarUrl={profile?.avatar_url ?? null}
                />
            </div>
        </main>
    );
}
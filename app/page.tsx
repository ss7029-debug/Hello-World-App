
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";

export default async function Home() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    let firstName: string | null = null;

    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("first_name")
            .eq("id", user.id)
            .maybeSingle();

        firstName = profile?.first_name ?? null;
    }

    return (
        <main>
            <NavBar />

            <div
                style={{
                    maxWidth: "900px",
                    margin: "80px auto",
                    padding: "0 24px",
                    textAlign: "center",
                }}
            >
                <p style={{ fontSize: "40px", marginBottom: "12px" }}>
                    🗽✨
                </p>

                <h1
                    style={{
                        fontSize: "48px",
                        fontWeight: "bold",
                        marginBottom: "20px",
                    }}
                >
                    NYC Unlocked
                </h1>

                <h2
                    style={{
                        fontSize: "26px",
                        fontWeight: "normal",
                        marginBottom: "24px",
                    }}
                >
                    Discover New York City, Your Way.
                </h2>

                {user && (
                    <p style={{ fontSize: "18px", marginBottom: "20px" }}>
                        Welcome back{firstName ? `, ${firstName}` : ""}! 👋
                    </p>
                )}

                <p
                    style={{
                        fontSize: "18px",
                        color: "#555",
                        lineHeight: "1.8",
                        maxWidth: "650px",
                        margin: "0 auto 36px",
                    }}
                >
                    Whether you have two hours between classes, a free
                    afternoon, or an entire day to explore, NYC Unlocked
                    helps you discover personalized experiences based on
                    your interests, budget, and available time.
                </p>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "16px",
                        flexWrap: "wrap",
                    }}
                >
                    <Link
                        href={user ? "/generate" : "/login"}
                        style={{
                            backgroundColor: "#2563eb",
                            color: "white",
                            padding: "14px 24px",
                            borderRadius: "10px",
                            textDecoration: "none",
                            fontWeight: "bold",
                        }}
                    >
                        ✨ Generate My Experience
                    </Link>

                    <Link
                        href="/explore"
                        style={{
                            backgroundColor: "#f3f4f6",
                            color: "#111",
                            padding: "14px 24px",
                            borderRadius: "10px",
                            textDecoration: "none",
                            fontWeight: "bold",
                            border: "1px solid #ddd",
                        }}
                    >
                        🗺️ Explore Experiences
                    </Link>
                </div>

                {!user && (
                    <p style={{ marginTop: "24px", color: "#666" }}>
                        Sign in with Google to create and vote on experiences.
                    </p>
                )}

                <div
                    style={{
                        marginTop: "80px",
                        padding: "30px",
                        backgroundColor: "#f9fafb",
                        borderRadius: "16px",
                    }}
                >
                    <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>
                        Your City. Your Interests. Your Adventure.
                    </h2>

                    <p style={{ color: "#555", lineHeight: "1.8" }}>
                        Tell us what you're looking for, receive an
                        AI-generated NYC experience, and discover adventures
                        shared by other explorers. Vote for your favorites
                        and help the community find its next adventure!
                    </p>
                </div>
            </div>
        </main>
    );
}

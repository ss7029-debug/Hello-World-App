
import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";
import VoteButtons from "@/components/VoteButtons";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
    const supabase = await createClient();

    const { data: generations, error } = await supabase
        .from("generations")
        .select("id, prompt, content, created_at")
        .order("created_at", { ascending: false });

    return (
        <main>
            <NavBar />

            <div
                style={{
                    maxWidth: "850px",
                    margin: "40px auto",
                    padding: "0 20px",
                }}
            >
                <h1>Explore NYC Experiences 🗽</h1>

                <p>
                    Discover personalized NYC adventures created by the community!
                </p>

                <Link href="/generate">
                    ✨ Generate Your Own Experience
                </Link>

                {error && (
                    <p style={{ color: "red", marginTop: "24px" }}>
                        Unable to load experiences: {error.message}
                    </p>
                )}

                {!error && generations?.length === 0 && (
                    <p style={{ marginTop: "30px" }}>
                        No experiences yet. Be the first to create one!
                    </p>
                )}

                <div style={{ marginTop: "30px" }}>
                    {generations?.map((experience) => (
                        <article
                            key={experience.id}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "12px",
                                padding: "24px",
                                marginBottom: "20px",
                            }}
                        >
                            <h2 style={{ fontSize: "20px" }}>
                                {experience.prompt}
                            </h2>

                            <p
                                style={{
                                    whiteSpace: "pre-wrap",
                                    lineHeight: "1.7",
                                    marginTop: "16px",
                                }}
                            >
                                {experience.content}
                            </p>

                            <p
                                style={{
                                    color: "#666",
                                    fontSize: "13px",
                                    marginTop: "20px",
                                }}
                            >
                                Created{" "}
                                {new Date(experience.created_at).toLocaleDateString()}
                            </p>

                            <VoteButtons generationId={experience.id} />
                        </article>
                    ))}
                </div>
            </div>
        </main>
    );
}

import Link from "next/link";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Generation = {
    id: number;
    prompt: string | null;
    content: string | null;
    created_at: string;
};

type Vote = {
    generation_id: number;
    vote: number;
};

function getExperienceTitle(generation: Generation): string {
    if (generation.content) {
        try {
            const parsed = JSON.parse(generation.content);

            if (
                parsed &&
                typeof parsed.title === "string" &&
                parsed.title.trim()
            ) {
                return parsed.title;
            }
        } catch {
            // Older experiences may contain plain text.
        }
    }

    return generation.prompt || "Untitled NYC Experience";
}

export default async function CommunityRatingsPage() {
    const supabase = await createClient();

    const [
        { data: generations, error: generationsError },
        { data: votes, error: votesError },
    ] = await Promise.all([
        supabase
            .from("generations")
            .select("id, prompt, content, created_at")
            .order("created_at", { ascending: false }),
        supabase
            .from("votes")
            .select("generation_id, vote"),
    ]);

    const voteTotals = new Map<
        number,
        { likes: number; dislikes: number }
    >();

    for (const vote of (votes ?? []) as Vote[]) {
        const current = voteTotals.get(vote.generation_id) ?? {
            likes: 0,
            dislikes: 0,
        };

        if (vote.vote === 1) {
            current.likes += 1;
        } else if (vote.vote === -1) {
            current.dislikes += 1;
        }

        voteTotals.set(vote.generation_id, current);
    }

    const experiences = ((generations ?? []) as Generation[])
        .map((generation) => {
            const totals = voteTotals.get(generation.id) ?? {
                likes: 0,
                dislikes: 0,
            };

            const total = totals.likes + totals.dislikes;

            return {
                ...generation,
                title: getExperienceTitle(generation),
                likes: totals.likes,
                dislikes: totals.dislikes,
                total,
                percentage:
                    total > 0
                        ? Math.round((totals.likes / total) * 100)
                        : 0,
            };
        })
        .sort((a, b) => {
            if (b.likes !== a.likes) return b.likes - a.likes;
            return b.total - a.total;
        });

    return (
        <main className="min-h-screen bg-[#F5D5DF] text-[#593B32]">
            <NavBar />

            <div className="mx-auto max-w-4xl px-5 py-12">
                <div className="mb-10 text-center">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#A46B7C]">
                        NYC UNLOCKED
                    </span>

                    <h1 className="mt-4 text-4xl font-bold md:text-5xl">
                        Community Ratings ♡
                    </h1>

                    <p className="mx-auto mt-4 max-w-xl text-[#765044]">
                        See which NYC experiences the community loves,
                        compare likes and dislikes, and discover your
                        next adventure.
                    </p>

                    <Link
                        href="/explore"
                        className="mt-6 inline-block rounded-2xl bg-[#593B32] px-6 py-3 font-semibold text-[#FFF8EE] transition hover:bg-[#765044]"
                    >
                        Explore Experiences →
                    </Link>
                </div>

                {(generationsError || votesError) && (
                    <div className="mb-6 rounded-2xl border border-red-300 bg-[#FFF8EE] p-5 text-sm text-red-700">
                        Unable to load all community ratings:{" "}
                        {generationsError?.message ||
                            votesError?.message}
                    </div>
                )}

                {!generationsError &&
                    !votesError &&
                    experiences.length === 0 && (
                        <div className="rounded-3xl bg-[#F5EBDD] p-10 text-center">
                            <h2 className="text-xl font-bold">
                                No experiences yet!
                            </h2>
                            <p className="mt-2 text-[#765044]">
                                Generate an experience to get started.
                            </p>
                        </div>
                    )}

                {!votesError && (
                    <div className="space-y-5">
                        {experiences.map((experience, index) => (
                            <article
                                key={experience.id}
                                className="rounded-3xl border border-[#D9B8AE] bg-[#F5EBDD] p-6 shadow-sm md:p-8"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-[#A46B7C]">
                                            Community Experience
                                        </span>

                                        <h2 className="mt-2 text-xl font-bold md:text-2xl">
                                            {experience.title}
                                        </h2>
                                    </div>

                                    <span className="shrink-0 rounded-full bg-[#F9DFE4] px-3 py-2 text-xs font-bold">
                                        #{index + 1}
                                    </span>
                                </div>

                                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                                    <span className="font-semibold text-green-700">
                                        👍 {experience.likes} liked
                                    </span>

                                    <span className="font-semibold text-red-700">
                                        👎 {experience.dislikes} disliked
                                    </span>
                                </div>

                                <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-[#E6D0C5]">
                                    {experience.total > 0 && (
                                        <>
                                            <div
                                                className="bg-green-600"
                                                style={{
                                                    width: `${experience.percentage}%`,
                                                }}
                                            />
                                            <div
                                                className="bg-red-400"
                                                style={{
                                                    width: `${100 - experience.percentage}%`,
                                                }}
                                            />
                                        </>
                                    )}
                                </div>

                                <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-[#765044]">
                                    <span>
                                        {experience.total === 0
                                            ? "Not rated yet"
                                            : `${experience.percentage}% positive`}
                                    </span>

                                    <span>
                                        {experience.total} total{" "}
                                        {experience.total === 1
                                            ? "vote"
                                            : "votes"}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

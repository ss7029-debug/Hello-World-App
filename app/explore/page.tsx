
import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";
import VoteButtons from "@/components/VoteButtons";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Stop = {
    name: string;
    description: string;
    cost: string;
    tip: string;
};

type ExperienceContent = {
    title: string;
    description: string;
    budget: string;
    duration: string;
    neighborhood: string;
    stops: Stop[];
};

function parseExperience(content: string): ExperienceContent | null {
    try {
        const parsed: unknown = JSON.parse(content);

        if (
            typeof parsed !== "object" ||
            parsed === null ||
            !("title" in parsed) ||
            !("stops" in parsed) ||
            typeof parsed.title !== "string" ||
            !Array.isArray(parsed.stops)
        ) {
            return null;
        }

        return parsed as ExperienceContent;
    } catch {
        // Older experiences were saved as plain text.
        return null;
    }
}

function mapsUrl(place: string) {
    return (
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(place + ", New York City")
    );
}

export default async function ExplorePage() {
    const supabase = await createClient();

    const { data: generations, error } = await supabase
        .from("generations")
        .select("id, prompt, content, created_at")
        .order("created_at", { ascending: false });

    return (
        <main className="min-h-screen bg-[#F5D5DF] text-[#593B32]">
            <NavBar />

            <div className="mx-auto max-w-4xl px-5 py-12">

                {/* Page heading */}
                <div className="mb-10 text-center">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#A46B7C]">
                        NYC UNLOCKED
                    </span>

                    <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                        Explore NYC Experiences 🗽
                    </h1>

                    <p className="mx-auto mt-3 max-w-xl text-[#765044]">
                        Discover NYC adventures created by the community.
                        Find something you love and vote for your favorites!
                    </p>

                    <Link
                        href="/generate"
                        className="mt-6 inline-block rounded-2xl bg-[#593B32] px-6 py-3 font-semibold text-[#FFF8EE] transition hover:bg-[#765044]"
                    >
                        ✨ Generate Your Own Experience
                    </Link>
                </div>

                {/* Error state */}
                {error && (
                    <div className="rounded-2xl border border-red-300 bg-[#FFF8EE] p-5 text-red-700">
                        Unable to load experiences: {error.message}
                    </div>
                )}

                {/* Empty state */}
                {!error && generations?.length === 0 && (
                    <div className="rounded-3xl border border-[#D9B8AE] bg-[#F5EBDD] p-10 text-center">
                        <h2 className="text-xl font-bold">
                            No experiences yet!
                        </h2>
                        <p className="mt-2 text-[#765044]">
                            Be the first to create an NYC adventure.
                        </p>
                    </div>
                )}

                {/* Community experiences */}
                <div className="space-y-6">
                    {generations?.map((generation) => {
                        const experience = parseExperience(
                            generation.content
                        );

                        return (
                            <article
                                key={generation.id}
                                className="overflow-hidden rounded-3xl border border-[#D9B8AE] bg-[#F5EBDD] shadow-sm"
                            >
                                <div className="p-6 md:p-8">

                                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A46B7C]">
                                        COMMUNITY DISCOVERY
                                    </span>

                                    {experience ? (
                                        <>
                                            <h2 className="mt-3 text-2xl font-bold">
                                                {experience.title}
                                            </h2>

                                            <p className="mt-2 text-sm leading-6 text-[#765044]">
                                                {experience.description}
                                            </p>

                                            {/* Budget, time, and neighborhood */}
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {[
                                                    experience.budget,
                                                    experience.duration,
                                                    experience.neighborhood,
                                                ]
                                                    .filter(Boolean)
                                                    .map((detail, index) => (
                                                        <span
                                                            key={index}
                                                            className="rounded-full border border-[#593B32] bg-[#F9DFE4] px-4 py-2 text-xs font-semibold"
                                                        >
                                                            {detail}
                                                        </span>
                                                    ))}
                                            </div>

                                            {/* Recommended places */}
                                            <div className="mt-6 space-y-3">
                                                {experience.stops.map(
                                                    (stop, index) => (
                                                        <div
                                                            key={index}
                                                            className="rounded-2xl border border-[#E6D0C5] bg-[#FFF8EE] p-4"
                                                        >
                                                            <div className="flex items-start gap-3">

                                                                {/* Brown circle with pink number */}
                                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#593B32] text-sm font-bold text-[#F5D5DF]">
                                                                    {index + 1}
                                                                </span>

                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                                                                        <h3 className="font-bold">
                                                                            {stop.name}
                                                                        </h3>

                                                                        <span className="text-xs font-medium text-[#956C68]">
                                                                            {stop.cost}
                                                                        </span>
                                                                    </div>

                                                                    <p className="mt-1 text-sm leading-6 text-[#765044]">
                                                                        {stop.description}
                                                                    </p>

                                                                    {stop.tip && (
                                                                        <p className="mt-2 text-xs text-[#956C68]">
                                                                            ✦ {stop.tip}
                                                                        </p>
                                                                    )}

                                                                    <a
                                                                        href={mapsUrl(stop.name)}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="mt-3 inline-block text-xs font-bold underline underline-offset-4 hover:text-[#A46B7C]"
                                                                    >
                                                                        View on Google Maps ↗
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Older plain-text experiences */}
                                            <h2 className="mt-3 text-xl font-bold">
                                                {generation.prompt}
                                            </h2>

                                            <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[#765044]">
                                                {generation.content}
                                            </p>
                                        </>
                                    )}

                                    {/* Date and voting */}
                                    <div className="mt-6 border-t border-[#D9B8AE] pt-5">
                                        <p className="mb-3 text-xs text-[#956C68]">
                                            Created{" "}
                                            {new Date(
                                                generation.created_at
                                            ).toLocaleDateString()}
                                        </p>

                                        <VoteButtons
                                            generationId={generation.id}
                                        />
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}


"use client";

import { useState } from "react";
import Image from "next/image";

type Stop = {
    name: string;
    description: string;
    cost: string;
    tip: string;
};

type Experience = {
    title: string;
    description: string;
    budget: string;
    duration: string;
    neighborhood: string;
    stops: Stop[];
};

function chooseThemeImage(prompt: string, experience: Experience): string {
    const text = [
        prompt,
        experience.title,
        experience.description,
        experience.stops.map((stop) => stop.name).join(" "),
    ]
        .join(" ")
        .toLowerCase();

    const themes = [
        {
            image: "/themes/books.jpg",
            words: [
                "book", "reading", "library", "literature",
                "bookstore", "novel", "coffee", "café", "cafe",
            ],
        },
        {
            image: "/themes/nature.jpg",
            words: [
                "park", "nature", "garden", "outdoor",
                "hiking", "greenery", "peaceful", "relax",
                "waterfront", "scenic",
            ],
        },
        {
            image: "/themes/art.jpg",
            words: [
                "art", "museum", "gallery", "painting",
                "exhibition", "creative", "culture",
            ],
        },
        {
            image: "/themes/food.jpg",
            words: [
                "food", "restaurant", "brunch", "dinner",
                "lunch", "dessert", "bakery", "pastry",
                "pizza", "dumpling", "eat",
            ],
        },
        {
            image: "/themes/shopping.jpg",
            words: [
                "shopping", "shop", "thrift", "vintage",
                "fashion", "clothing", "boutique", "market",
            ],
        },
    ];

    // Choose the theme with the most matching keywords.
    let bestImage = "/themes/nyc.jpg";
    let bestScore = 0;

    for (const theme of themes) {
        let score = 0;

        for (const word of theme.words) {
            const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(`\\b${escaped}\\b`, "i");

            if (regex.test(text)) {
                score += 1;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestImage = theme.image;
        }
    }

    return bestImage;
}

export default function GeneratePage() {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [experience, setExperience] = useState<Experience | null>(null);
    const [error, setError] = useState("");
    const [expanded, setExpanded] = useState<number | null>(0);
    const [themeImage, setThemeImage] = useState("/themes/nyc.jpg");

    const examples = [
        "I have $20 and 2 hours. I love bookstores and coffee.",
        "Plan a peaceful afternoon near Columbia University.",
        "I want a fun, affordable adventure with friends.",
    ];

    function mapsUrl(place: string) {
        return (
            "https://www.google.com/maps/search/?api=1&query=" +
            encodeURIComponent(place + ", New York City")
        );
    }

    function directionsUrl(stops: Stop[]) {
        if (stops.length === 0) return "#";

        const names = stops.map(
            (stop) => `${stop.name}, New York City`
        );

        const params = new URLSearchParams({
            api: "1",
            origin: names[0],
            destination: names[names.length - 1],
            travelmode: "walking",
        });

        if (names.length > 2) {
            params.set(
                "waypoints",
                names.slice(1, -1).join("|")
            );
        }

        return `https://www.google.com/maps/dir/?${params.toString()}`;
    }

    async function handleGenerate() {
        if (!prompt.trim()) {
            setError("Tell us what you're looking for first.");
            return;
        }

        setLoading(true);
        setError("");
        setExperience(null);
        setExpanded(0);

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Something went wrong."
                );
            }

            const parsed = JSON.parse(
                data.content
            ) as Experience;

            if (
                !parsed.title ||
                !Array.isArray(parsed.stops) ||
                parsed.stops.length === 0
            ) {
                throw new Error(
                    "The recommendation format was incomplete."
                );
            }

            setThemeImage(chooseThemeImage(prompt, parsed));
            setExperience(parsed);
        } catch (err) {
            console.error("Generation error:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to generate an experience. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#F5D5DF] px-5 py-12 text-[#593B32]">
            <div className="mx-auto max-w-4xl">

                {/* Page heading */}
                <div className="mb-10 text-center">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#A46B7C]">
                        NYC UNLOCKED
                    </span>

                    <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                        Your next NYC experience!
                    </h1>

                    <p className="mx-auto mt-3 max-w-lg text-[#765044]">
                        Tell us what you&apos;re looking for,
                        and we&apos;ll find the best NYC spots for you.
                    </p>
                </div>

                {/* Prompt card */}
                <div className="rounded-3xl border border-[#D9B8AE] bg-[#F5EBDD] p-6 shadow-sm md:p-8">
                    <label
                        htmlFor="prompt"
                        className="mb-3 block text-sm font-bold"
                    >
                        What are your interests or requirements?
                    </label>

                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Cozy cafés, bookstores, under $25, 2 hours, near Columbia..."
                        rows={4}
                        maxLength={2000}
                        className="w-full resize-none rounded-2xl border border-[#D9B8AE] bg-[#FFF8EE] p-4 text-[#593B32] outline-none transition focus:border-[#A46B7C] focus:ring-2 focus:ring-[#A46B7C]/20"
                    />

                    <div className="mt-5">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#956C68]">
                            Need inspiration?
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {examples.map((example) => (
                                <button
                                    key={example}
                                    type="button"
                                    onClick={() => setPrompt(example)}
                                    className="rounded-full border border-[#D9B8AE] bg-[#F9DFE4] px-4 py-2 text-left text-xs font-medium text-[#593B32] transition hover:border-[#A46B7C] hover:bg-[#F0C7D2]"
                                >
                                    ✦ {example}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p className="mt-4 text-sm text-red-700" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={loading}
                        className="mt-6 w-full rounded-2xl bg-[#593B32] px-6 py-4 font-bold text-[#FFF8EE] transition hover:bg-[#765044] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading
                            ? "Finding your NYC experience..."
                            : "Find my NYC spots →"}
                    </button>
                </div>

                {/* Generated experience */}
                {experience && (
                    <section className="mt-10 space-y-6">

                        {/* Experience overview */}
                        <div>
                            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#A46B7C]">
                                YOUR PERSONALIZED DISCOVERY
                            </span>

                            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                                {experience.title}
                            </h2>

                            <p className="mt-2 text-[#765044]">
                                {experience.description}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {[
                                    experience.budget,
                                    experience.duration,
                                    experience.neighborhood,
                                ]
                                    .filter(Boolean)
                                    .map((item, index) => (
                                        <span
                                            key={index}
                                            className="rounded-full bg-[#F5EBDD] px-4 py-2 text-sm font-medium"
                                        >
                                            {item}
                                        </span>
                                    ))}
                            </div>
                        </div>

                        {/* Theme-based photograph */}
                        <div className="overflow-hidden rounded-3xl border border-[#D9B8AE] bg-[#F5EBDD] shadow-sm">
                            <div className="relative h-64 w-full md:h-96">
                                <Image
                                    src={themeImage}
                                    alt={`A photograph representing the theme of ${experience.title}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 896px"
                                    className="object-cover"
                                />
                            </div>

                            <div className="px-5 py-4">
                                <p className="text-sm font-semibold">
                                    A little inspiration for your adventure ✨
                                </p>
                                <p className="mt-1 text-xs text-[#765044]">
                                    Theme-inspired photograph.
                                    Your recommended locations are listed below.
                                </p>
                            </div>
                        </div>

                        {/* Recommended stops */}
                        <div>
                            <h3 className="mb-4 text-xl font-bold">
                                Your recommended stops
                            </h3>

                            <div className="space-y-3">
                                {experience.stops.map((stop, index) => (
                                    <div
                                        key={index}
                                        className="overflow-hidden rounded-2xl border border-[#D9B8AE] bg-[#F5EBDD] shadow-sm"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpanded(
                                                    expanded === index ? null : index
                                                )
                                            }
                                            aria-expanded={expanded === index}
                                            className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-[#FBE5E8]"
                                        >
                                            <span className="flex items-center gap-3">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAC5CF] font-bold">
                                                    {index + 1}
                                                </span>

                                                <span>
                                                    <span className="block font-bold">
                                                        {stop.name}
                                                    </span>
                                                    <span className="mt-1 block text-xs text-[#765044]">
                                                        {stop.cost}
                                                    </span>
                                                </span>
                                            </span>

                                            <span className="text-xl text-[#A46B7C]">
                                                {expanded === index ? "−" : "+"}
                                            </span>
                                        </button>

                                        {expanded === index && (
                                            <div className="border-t border-[#D9B8AE] px-5 py-5">
                                                <p className="text-sm leading-7 text-[#684A40]">
                                                    {stop.description}
                                                </p>

                                                {stop.tip && (
                                                    <p className="mt-3 rounded-xl bg-[#FFF8EE] p-3 text-sm text-[#684A40]">
                                                        ✦ Tip: {stop.tip}
                                                    </p>
                                                )}

                                                <a
                                                    href={mapsUrl(stop.name)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-4 inline-block rounded-xl bg-[#593B32] px-4 py-3 text-sm font-semibold text-[#FFF8EE] transition hover:bg-[#765044]"
                                                >
                                                    View this stop on Google Maps ↗
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-3">
                            <a
                                href={directionsUrl(experience.stops)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-xl bg-[#593B32] px-5 py-3 text-sm font-semibold text-[#FFF8EE] transition hover:bg-[#765044]"
                            >
                                Get directions to all stops ↗
                            </a>

                            <button
                                type="button"
                                onClick={() =>
                                    navigator.clipboard.writeText(
                                        JSON.stringify(experience, null, 2)
                                    )
                                }
                                className="rounded-xl border border-[#593B32] px-5 py-3 text-sm font-semibold transition hover:bg-[#EAC5CF]"
                            >
                                Copy experience
                            </button>

                            <a
                                href="/explore"
                                className="rounded-xl border border-[#593B32] px-5 py-3 text-sm font-semibold transition hover:bg-[#EAC5CF]"
                            >
                                Explore community discoveries →
                            </a>
                        </div>

                        <p className="text-xs text-[#765044]">
                            Costs and availability are estimates.
                            Check current details before visiting.
                        </p>
                    </section>
                )}
            </div>
        </main>
    );
}

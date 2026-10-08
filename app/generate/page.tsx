
"use client";

import { useState } from "react";

export default function GeneratePage() {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");


    async function handleGenerate() {
        if (!prompt.trim()) {
            alert("Please describe what you're looking for!");
            return;
        }

        setLoading(true);
        setResult("");

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
                throw new Error(data.error || "Something went wrong.");
            }

            setResult(data.content);
        } catch (error) {
            console.error("Generation error:", error);
            setResult(
                error instanceof Error
                    ? error.message
                    : "Unable to generate an experience. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 px-6 py-12">
            <div className="mx-auto max-w-2xl">
                <h1 className="mb-3 text-4xl font-bold text-gray-900">
                    NYC Unlocked 🗽
                </h1>

                <p className="mb-8 text-lg text-gray-600">
                    Discover New York City your way. Tell us your mood,
                    interests, budget, or how much time you have, and
                    we'll help you find your next NYC experience!
                </p>

                <div className="rounded-2xl bg-white p-6 shadow-md">
                    <label
                        htmlFor="prompt"
                        className="mb-3 block font-semibold text-gray-800"
                    >
                        What kind of NYC experience are you looking for?
                    </label>

                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., I have 3 hours free after class and want to explore somewhere peaceful under $20..."
                        rows={5}
                        className="w-full rounded-xl border border-gray-300 p-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="mt-4 w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Generating..." : "Unlock My NYC Experience ✨"}
                    </button>
                </div>

                {result && (
                    <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">
                        <h2 className="mb-3 text-2xl font-bold text-gray-900">
                            Your NYC Experience
                        </h2>
                        <p className="whitespace-pre-wrap text-gray-700">
                            {result}
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}


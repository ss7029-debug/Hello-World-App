
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Vote = {
    user_id: string;
    vote: number;
};

export default function VoteButtons({
                                        generationId,
                                    }: {
    generationId: number;
}) {
    const [votes, setVotes] = useState<Vote[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const supabase = createClient();

        async function loadVotes() {
            const [{ data: voteData, error }, { data: authData }] =
                await Promise.all([
                    supabase
                        .from("votes")
                        .select("user_id, vote")
                        .eq("generation_id", generationId),
                    supabase.auth.getUser(),
                ]);

            if (error) {
                console.error("Unable to load votes:", error);
            }

            setVotes(voteData ?? []);
            setUserId(authData.user?.id ?? null);
            setLoading(false);
        }

        loadVotes();
    }, [generationId]);

    const upvotes = votes.filter((v) => v.vote === 1).length;
    const downvotes = votes.filter((v) => v.vote === -1).length;
    const myVote = votes.find((v) => v.user_id === userId)?.vote;

    async function handleVote(value: 1 | -1) {
        if (!userId) {
            alert("Please sign in to vote on experiences.");
            return;
        }

        if (saving) return;

        setSaving(true);

        const supabase = createClient();

        const { error } = await supabase.from("votes").upsert(
            {
                user_id: userId,
                generation_id: generationId,
                vote: value,
            },
            {
                onConflict: "user_id,generation_id",
            }
        );

        if (error) {
            alert("Unable to save your vote: " + error.message);
        } else {
            setVotes((previous) => [
                ...previous.filter((v) => v.user_id !== userId),
                { user_id: userId, vote: value },
            ]);
        }

        setSaving(false);
    }

    if (loading) {
        return <p>Loading votes...</p>;
    }

    return (
        <div
            style={{
                display: "flex",
                gap: "12px",
                marginTop: "20px",
                alignItems: "center",
            }}
        >
            <button
                onClick={() => handleVote(1)}
                disabled={saving}
                aria-pressed={myVote === 1}
                style={{
                    padding: "8px 14px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background: myVote === 1 ? "#d1fae5" : "white",
                    color: "#111",
                }}
            >
                👍 {upvotes}
            </button>

            <button
                onClick={() => handleVote(-1)}
                disabled={saving}
                aria-pressed={myVote === -1}
                style={{
                    padding: "8px 14px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background: myVote === -1 ? "#fee2e2" : "white",
                    color: "#111",
                }}
            >
                👎 {downvotes}
            </button>

            {!userId && (
                <span style={{ fontSize: "13px", color: "#666" }}>
          Sign in to vote
        </span>
            )}
        </div>
    );
}

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import NavBar from "@/components/NavBar";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const signInWithGoogle = async () => {
        setLoading(true);
        setError("");

        const supabase = createClient();

        const { error: authError } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (authError) {
            setError("Unable to sign in. Please try again.");
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#F5D5DF] text-[#593B32]">
            <NavBar />

            <div className="flex min-h-[calc(100vh-75px)] items-center justify-center px-5 py-12">

                <div className="w-full max-w-md rounded-3xl border border-[#D9B8AE] bg-[#F5EBDD] px-8 py-12 text-center shadow-lg md:px-12">

                    {/* Decorative icon */}
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F9DFE4] text-[#593B32]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect
                                x="4"
                                y="10"
                                width="16"
                                height="11"
                                rx="2"
                            />
                            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                        </svg>
                    </div>

                    {/* Heading */}
                    <h1 className="text-3xl font-bold tracking-tight">
                        Welcome to NYC Unlocked
                    </h1>

                    <p className="mt-4 text-sm leading-6 text-[#765044]">
                        Sign in to create your own NYC adventures.
                    </p>

                    {/* Google sign-in */}
                    <button
                        type="button"
                        onClick={signInWithGoogle}
                        disabled={loading}
                        className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#593B32] px-6 py-4 font-semibold text-[#FFF8EE] transition hover:bg-[#765044] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20.3 12.2a8.3 8.3 0 0 1-8.3 8.3 8.5 8.5 0 1 1 6-14.5" />
                            <path d="M12 12h8.3" />
                        </svg>

                        {loading ? "Connecting to Google..." : "Continue with Google"}
                    </button>

                    {error && (
                        <p
                            role="alert"
                            className="mt-4 text-sm font-medium text-red-700"
                        >
                            {error}
                        </p>
                    )}

                    <p className="mt-6 text-xs text-[#956C68]">
                        Your next adventure starts here.
                    </p>
                </div>
            </div>
        </main>
    );
}

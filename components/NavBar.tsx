
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NavBar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        supabase.auth.getUser().then(({ data }) => {
            setIsLoggedIn(!!data.user);
            setChecking(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session?.user);
            setChecking(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        router.push("/");
        router.refresh();
    };

    return (
        <nav
            style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                padding: "16px 40px",
                borderBottom: "1px solid #ccc",
                flexWrap: "wrap",
            }}
        >
            <Link href="/" style={{ fontWeight: "bold" }}>
                NYC Unlocked
            </Link>

            <Link href="/">Home</Link>

            <Link href="/generate">Generate Experience ✨</Link>
            <Link href="/explore">Explore Experiences</Link>

            {!checking && (
                isLoggedIn ? (
                    <>
                        <Link href="/profile">Profile</Link>

                        <button
                            onClick={signOut}
                            style={{ marginLeft: "auto", cursor: "pointer" }}
                        >
                            Sign Out
                        </button>
                    </>
                ) : (
                    <Link href="/login" style={{ marginLeft: "auto" }}>
                        Sign In
                    </Link>
                )
            )}
        </nav>
    );
}
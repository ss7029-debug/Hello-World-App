"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NavBar() {
    const router = useRouter();

    const signOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <nav style={{ display: "flex", gap: "16px", padding: "16px 40px", borderBottom: "1px solid #ccc" }}>
            <Link href="/">Home</Link>
            <Link href="/profile">Profile</Link>
            <button onClick={signOut}>Sign out</button>
        </nav>
    );
}
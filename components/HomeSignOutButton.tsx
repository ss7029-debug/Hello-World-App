
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function HomeSignOutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSignOut() {
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
            alert("Unable to sign out. Please try again.");
            setLoading(false);
            return;
        }

        router.push("/");
        router.refresh();
    }

    return (
        <button
            type="button"
            onClick={handleSignOut}
            disabled={loading}
            className="rounded-xl border border-[#EAC5CF] px-7 py-2.5 text-sm font-semibold text-[#F9DFE4] transition hover:bg-[#765044] disabled:opacity-60"
        >
            {loading ? "Signing Out..." : "Sign Out"}
        </button>
    );
}

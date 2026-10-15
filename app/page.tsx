
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";
import HomeSignOutButton from "@/components/HomeSignOutButton";

export const dynamic = "force-dynamic";

export default async function Home() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    let firstName: string | null = null;

    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("first_name")
            .eq("id", user.id)
            .maybeSingle();

        firstName = profile?.first_name ?? null;
    }

    return (
        <main className="min-h-screen bg-[#F5D5DF] text-[#593B32]">
            <NavBar />

            <div className="mx-auto max-w-5xl px-5 pb-16 pt-10 md:pt-14">

                {/* Heading */}
                <div className="mb-8 text-center">
                    <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
                        NYC Unlocked
                    </h1>

                    {user && (
                        <p className="mt-4 text-lg font-medium text-[#765044]">
                            Welcome back{firstName ? `, ${firstName}` : ""}! ♡
                        </p>
                    )}

                    <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#765044] md:text-base">
                        Your interests. Your city. Your next adventure.
                    </p>
                </div>

                {/* NYC photograph */}
                <div className="overflow-hidden rounded-3xl border-4 border-[#F5EBDD] shadow-xl">
                    <div className="relative h-64 w-full md:h-[420px]">
                        <Image
                            src="/themes/nyc.jpg"
                            alt="New York City"
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, 1024px"
                            className="object-cover"
                        />
                    </div>
                </div>

                {/* Main buttons */}
                <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-3">

                    <Link
                        href={user ? "/generate" : "/login"}
                        className="w-full rounded-2xl bg-[#593B32] px-6 py-4 text-center text-base font-bold text-[#FFF8EE] transition hover:bg-[#765044] sm:min-w-72"
                    >
                        Find My NYC Experience →
                    </Link>

                    <Link
                        href="/explore"
                        className="w-full rounded-2xl border border-[#593B32] bg-[#F5EBDD] px-6 py-4 text-center text-sm font-semibold text-[#593B32] transition hover:bg-[#F9DFE4] sm:min-w-72"
                    >
                        Explore Experiences
                    </Link>

                    {/* Sign In / Sign Out */}
                    <div className="mt-5">
                        {user ? (
                            <HomeSignOutButton />
                        ) : (
                            <Link
                                href="/login"
                                className="inline-block rounded-xl border border-[#593B32] px-7 py-2.5 text-sm font-semibold text-[#593B32] transition hover:bg-[#F9DFE4]"
                            >
                                Sign In with Google
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

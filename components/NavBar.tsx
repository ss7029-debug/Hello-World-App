
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NavBar() {
    const router = useRouter();
    const pathname = usePathname();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [checking, setChecking] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);

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

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    const signOut = async () => {
        const supabase = createClient();

        await supabase.auth.signOut();
        setIsLoggedIn(false);
        setMenuOpen(false);

        router.push("/");
        router.refresh();
    };

    const menuItems = [
        { label: "Home", href: "/" },
        { label: "Generate Experience", href: "/generate" },
        { label: "Explore Experiences", href: "/explore" },
    ];

    return (
        <>
            {/* Coffee-brown top navigation */}
            <nav className="flex items-center justify-between border-b border-[#765044] bg-[#593B32] px-5 py-4 text-[#FFF8EE] md:px-10">

                {/* Pink hamburger menu */}
                <button
                    type="button"
                    onClick={() => setMenuOpen(true)}
                    aria-label="Open navigation menu"
                    className="rounded-xl p-2 transition hover:bg-[#765044]"
                >
                    <span className="block h-0.5 w-6 bg-[#EAC5CF]" />
                    <span className="mt-1.5 block h-0.5 w-6 bg-[#EAC5CF]" />
                    <span className="mt-1.5 block h-0.5 w-6 bg-[#EAC5CF]" />
                </button>

                {/* Centered brand */}
                <Link
                    href="/"
                    className="text-sm font-bold uppercase tracking-[0.2em] text-[#FFF8EE]"
                >
                    NYC Unlocked
                </Link>

                {/* Pink profile icon */}
                {!checking ? (
                    <Link
                        href={isLoggedIn ? "/profile" : "/login"}
                        aria-label={isLoggedIn ? "My profile" : "Sign in"}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EAC5CF] text-[#EAC5CF] transition hover:bg-[#765044]"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                    </Link>
                ) : (
                    <div className="h-10 w-10" />
                )}
            </nav>

            {/* Overlay when sidebar opens */}
            {menuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-50 flex h-full w-72 max-w-[85vw] flex-col bg-[#F5EBDD] p-6 text-[#593B32] shadow-2xl transition-transform duration-300 ${
                    menuOpen ? "translate-x-0" : "-translate-x-full"
                }`}
                aria-label="Main navigation"
                aria-hidden={!menuOpen}
                inert={!menuOpen}
            >
                <div className="mb-10 flex items-center justify-between">
                    <span className="text-lg font-bold">
                        NYC Unlocked
                    </span>

                    <button
                        type="button"
                        onClick={() => setMenuOpen(false)}
                        aria-label="Close navigation menu"
                        className="rounded-lg p-2 text-2xl hover:bg-[#F9DFE4]"
                    >
                        ×
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            className={`rounded-xl px-4 py-3 font-semibold transition ${
                                pathname === item.href
                                    ? "bg-[#593B32] text-[#FFF8EE]"
                                    : "hover:bg-[#F9DFE4]"
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}

                    {isLoggedIn && (
                        <Link
                            href="/profile"
                            onClick={() => setMenuOpen(false)}
                            className={`rounded-xl px-4 py-3 font-semibold transition ${
                                pathname === "/profile"
                                    ? "bg-[#593B32] text-[#FFF8EE]"
                                    : "hover:bg-[#F9DFE4]"
                            }`}
                        >
                            My Profile
                        </Link>
                    )}
                </div>

                {/* Sign In / Sign Out inside sidebar */}
                {!checking && (
                    <div className="mt-auto border-t border-[#D9B8AE] pt-6">
                        {isLoggedIn ? (
                            <button
                                type="button"
                                onClick={signOut}
                                className="w-full rounded-xl border border-[#593B32] px-4 py-3 text-left font-semibold transition hover:bg-[#F9DFE4]"
                            >
                                Sign Out
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setMenuOpen(false)}
                                className="block rounded-xl bg-[#593B32] px-4 py-3 text-center font-semibold text-[#FFF8EE]"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                )}
            </aside>
        </>
    );
}

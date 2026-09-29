import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";

export default async function Home() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url")
        .eq("id", user.id)
        .single();

    if (!profile?.first_name || !profile?.last_name) {
        redirect("/profile?onboarding=1");
    }

    const { data: rows, error } = await supabase
        .from("Hellooooo")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    const cellStyle = { border: "1px solid black", padding: "10px" };

    return (
        <main>
            <NavBar />
            <div style={{ padding: "40px" }}>
                <h1>Greetings</h1>

                <p>
                    Signed in as {profile.first_name} {profile.last_name} ({user.email})
                </p>

                <table
                    style={{
                        borderCollapse: "collapse",
                        width: "100%",
                        marginTop: "20px",
                    }}
                >
                    <thead>
                    <tr>
                        <th style={cellStyle}>ID</th>
                        <th style={cellStyle}>Title</th>
                        <th style={cellStyle}>Author</th>
                    </tr>
                    </thead>

                    <tbody>
                    {rows?.map((row) => (
                        <tr key={row.id}>
                            <td style={cellStyle}>{row.id}</td>
                            <td style={cellStyle}>{row.title}</td>
                            <td style={cellStyle}>{row.author}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
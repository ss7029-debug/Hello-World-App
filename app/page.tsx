import { supabase } from "@/lib/supabase";

export default async function Home() {
    const { data: greetings, error } = await supabase
        .from("Hellooooo")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        return (
            <main className="min-h-screen bg-zinc-50 p-8">
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-4xl font-bold text-black">
                        Greetings Around the World
                    </h1>

                    <p className="mt-4 text-red-600">
                        Error loading greetings: {error.message}
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-zinc-50 p-8">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-8 text-4xl font-bold text-black">
                    Greetings Around the World
                </h1>

                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <table className="w-full">
                        <thead className="bg-zinc-100">
                        <tr>
                            <th className="px-6 py-4 text-left font-semibold text-black">
                                ID
                            </th>
                            <th className="px-6 py-4 text-left font-semibold text-black">
                                Greeting
                            </th>
                            <th className="px-6 py-4 text-left font-semibold text-black">
                                Author
                            </th>
                        </tr>
                        </thead>

                        <tbody>
                        {greetings?.map((greeting) => (
                            <tr key={greeting.id} className="border-t">
                                <td className="px-6 py-4 text-black">
                                    {greeting.id}
                                </td>

                                <td className="px-6 py-4 font-medium text-black">
                                    {greeting.title}
                                </td>

                                <td className="px-6 py-4 text-zinc-600">
                                    {greeting.author}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}

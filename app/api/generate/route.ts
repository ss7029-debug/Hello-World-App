
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(request: NextRequest) {
    try {
        // Step 1: Identify the logged-in user
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Please log in to generate an experience." },
                { status: 401 }
            );
        }

        // Step 2: Read the user's request
        const { prompt } = await request.json();

        if (
            typeof prompt !== "string" ||
            !prompt.trim() ||
            prompt.length > 2000
        ) {
            return NextResponse.json(
                { error: "Please enter a prompt of 2000 characters or fewer." },
                { status: 400 }
            );
        }

        // Step 3: Generate an NYC experience
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: `
You are NYC Unlocked, a creative and helpful New York City
experience guide.

Your audience includes college students, people new to NYC,
and anyone who wants to explore the city.

Create a personalized NYC experience based on this request:
"${prompt}"

Provide:
1. A creative title for the experience.
2. Two or three specific activities or places in NYC.
3. An estimated budget.
4. An estimated duration.
5. A short explanation of why this experience matches
   the user's request.

Make the recommendations engaging, practical, and
budget-conscious when appropriate.

Do not invent exact opening hours or prices. If details
may change, encourage the user to verify them.
`,
        });

        const content = response.text;

        if (!content) {
            return NextResponse.json(
                { error: "Gemini did not return a response." },
                { status: 502 }
            );
        }

        // Step 4: Save the experience in Supabase
        const { data: savedGeneration, error: saveError } = await supabase
            .from("generations")
            .insert({
                user_id: user.id,
                prompt: prompt.trim(),
                content,
            })
            .select("id")
            .single();

        if (saveError) {
            console.error("Supabase save failed:", saveError);

            return NextResponse.json(
                { error: "The experience was generated but could not be saved." },
                { status: 500 }
            );
        }

        // Step 5: Return the saved experience
        return NextResponse.json({
            id: savedGeneration.id,
            content,
        });
    } catch (error) {
        console.error("Generation failed:", error);

        return NextResponse.json(
            { error: "Unable to generate an experience right now." },
            { status: 500 }
        );
    }
}


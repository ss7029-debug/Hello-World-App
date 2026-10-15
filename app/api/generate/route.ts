
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(request: NextRequest) {
    try {
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

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: `
You are NYC Unlocked, a helpful New York City discovery guide.

The user wants:
"${prompt}"

Recommend 3 or 4 REAL, specific places in New York City
that match their interests, time, and budget.

Return ONLY a valid JSON object in this exact structure:

{
  "title": "A specific neighborhood or destination name",
  "description": "One short sentence explaining the experience.",
  "budget": "Estimated total budget, e.g. $20–$30",
  "duration": "Estimated duration, e.g. 2–3 hours",
  "neighborhood": "NYC neighborhood",
  "stops": [
    {
      "name": "Real place name",
      "description": "One short sentence about what to do there.",
      "cost": "Estimated cost or Free",
      "tip": "One useful practical tip."
    }
  ]
}

RULES:
- Return ONLY JSON. No markdown fences or introductory text.
- Use real NYC places, not invented businesses.
- Keep all descriptions brief and useful.
- Respect the user's stated budget and available time.
- Do not invent exact opening hours or exact prices.
- If the user requests a specific neighborhood, prioritize it.
- Make the title specific, not generic marketing language.
- Do not include more than 4 stops.
`,
            config: {
                responseMimeType: "application/json",
            },
        });

        const rawContent = response.text;

        if (!rawContent) {
            return NextResponse.json(
                { error: "Gemini did not return a response." },
                { status: 502 }
            );
        }

        // Validate the response before storing it.
        const experience = JSON.parse(rawContent);

        if (
            !experience ||
            typeof experience.title !== "string" ||
            typeof experience.description !== "string" ||
            !Array.isArray(experience.stops) ||
            experience.stops.length === 0
        ) {
            return NextResponse.json(
                { error: "The generated experience had an unexpected format. Please try again." },
                { status: 502 }
            );
        }

        // Keep using the existing text column in Supabase.
        const content = JSON.stringify(experience);

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

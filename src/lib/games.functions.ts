import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { GAME_SYSTEM_PROMPT, extractHtml, extractTitle } from "./game-prompt";

const inputSchema = z.object({ prompt: z.string().min(3).max(2000) });

export const generateGame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          { role: "system", content: GAME_SYSTEM_PROMPT },
          { role: "user", content: `Game idea: ${data.prompt}` },
        ],
      }),
    });

    if (res.status === 429) throw new Error("Rate limit reached. Try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please top up your workspace.");
    if (!res.ok) throw new Error(`Generation failed (${res.status})`);

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content ?? "";
    const code = extractHtml(raw);
    if (!code) throw new Error("The model did not return a playable game. Try again.");

    const { data: inserted, error } = await context.supabase
      .from("games")
      .insert({
        user_id: context.userId,
        prompt: data.prompt,
        title: extractTitle(code, data.prompt),
        code,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return { id: inserted.id as string };
  });

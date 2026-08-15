import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — Automaton" },
      { name: "description", content: "How to write prompts that generate great browser games." },
      { property: "og:title", content: "Learn — Automaton" },
      { property: "og:description", content: "Prompting tips for generating great games." },
    ],
  }),
  component: LearnPage,
});

const TIPS = [
  {
    title: "Name the genre",
    body: "Start with a known shape — runner, shooter, puzzle, platformer. The generator builds better mechanics when the genre is explicit.",
  },
  {
    title: "Describe one core loop",
    body: "One verb the player repeats: dodge, stack, shoot, jump. Extra systems make the game muddier, not deeper.",
  },
  {
    title: "Set the win and lose state",
    body: "Say how a run ends: three lives, a 60-second timer, reach the top. Clear stakes make the game feel finished.",
  },
  {
    title: "Direct the art",
    body: "Mention palette, shapes and effects — neon grid, glowing particles, chunky pixels. Everything is drawn with canvas, so keep it graphical.",
  },
];

function LearnPage() {
  return (
    <div className="relative min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-pixel text-neon text-xl leading-relaxed">Learn</h1>
        <p className="mt-6 text-sm text-muted-foreground">
          Four rules for prompts that turn into games worth playing.
        </p>
        <div className="mt-10 space-y-4">
          {TIPS.map((t, i) => (
            <article key={t.title} className="neon-panel rounded-2xl p-6">
              <span className="font-pixel text-[10px] text-primary">0{i + 1}</span>
              <h2 className="mt-4 text-base font-semibold text-foreground">{t.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t.body}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { generateGame } from "@/lib/games.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Automaton — Idea to game in seconds" },
      {
        name: "description",
        content:
          "Type a game idea and Automaton generates a playable neon arcade game in your browser in seconds.",
      },
      { property: "og:title", content: "Automaton — Idea to game in seconds" },
      {
        property: "og:description",
        content: "Type a game idea and get a playable browser game in seconds.",
      },
    ],
  }),
  component: Index,
});

const IDEAS = [
  "Neon snake that speeds up with every pellet",
  "Space shooter with waves of pixel aliens",
  "Endless runner jumping over glowing spikes",
  "Brick breaker with a laser paddle",
];

function Index() {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const create = useServerFn(generateGame);

  async function submit() {
    const idea = prompt.trim();
    if (idea.length < 3) {
      toast.error("Describe your game idea first");
      return;
    }

    if (!loading && !user) {
      toast.error("Sign in to generate your game");
      navigate({ to: "/auth" });
      return;
    }
    setBusy(true);
    try {
      const { id } = await create({ data: { prompt: idea } });
      toast.success("Your game is ready!");
      navigate({ to: "/play/$gameId", params: { gameId: id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="grid-floor pointer-events-none absolute inset-0" aria-hidden />
      <SiteNav />

      <main className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pt-24 pb-28 text-center">
        <span className="neon-panel mb-10 rounded-full px-4 py-1.5 text-xs tracking-widest text-muted-foreground uppercase">
          <Sparkles className="mr-2 inline size-3 text-primary" />
          AI game studio
        </span>

        <h1 className="font-pixel text-neon text-3xl leading-[1.6] sm:text-4xl md:text-5xl md:leading-[1.55]">
          Idea to game
          <br />
          in seconds.
        </h1>

        <p className="mt-8 max-w-xl text-sm text-muted-foreground sm:text-base">
          Describe anything. Automaton builds a complete, playable browser game — code, art and
          controls included.
        </p>

        <div className="neon-border mt-12 w-full rounded-2xl bg-card/70 p-3 backdrop-blur-xl">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
            }}
            rows={4}
            placeholder="Describe your game idea..."
            className="w-full resize-none bg-transparent px-4 py-3 text-left text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between gap-3 px-2 pb-1">
            <span className="text-xs text-muted-foreground">⌘ + Enter to generate</span>
            <Button variant="neon" size="lg" onClick={submit} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
              {busy ? "Building your game..." : "Generate game"}
            </Button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {IDEAS.map((idea) => (
            <button
              key={idea}
              onClick={() => setPrompt(idea)}
              className="neon-panel rounded-full px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {idea}
            </button>
          ))}
        </div>

        <div className="mt-16 flex gap-3">
          <Button asChild variant="arcade">
            <Link to="/demos">Play demos</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/games">My games</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

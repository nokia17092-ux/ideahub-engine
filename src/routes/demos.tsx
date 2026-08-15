import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/demos")({
  head: () => ({
    meta: [
      { title: "Demos — Automaton" },
      { name: "description", content: "Play community games generated with Automaton." },
      { property: "og:title", content: "Demos — Automaton" },
      { property: "og:description", content: "Play community games generated with Automaton." },
    ],
  }),
  component: DemosPage,
});

function DemosPage() {
  const { data: games, isLoading } = useQuery({
    queryKey: ["public-games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("id, title, prompt, created_at")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="relative min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="font-pixel text-neon text-xl leading-relaxed">Demos</h1>
        <p className="mt-6 text-sm text-muted-foreground">
          Games players chose to share publicly. Make one of yours public from My games.
        </p>

        {isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading…</p>}

        {games?.length === 0 && (
          <div className="neon-panel mt-10 rounded-2xl p-10 text-center">
            <p className="text-sm text-muted-foreground">No public games yet — be the first.</p>
            <Button asChild variant="neon" className="mt-6">
              <Link to="/">Create a game</Link>
            </Button>
          </div>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games?.map((g) => (
            <div key={g.id} className="neon-panel rounded-2xl p-5">
              <h2 className="text-base font-semibold text-foreground">{g.title}</h2>
              <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{g.prompt}</p>
              <Button asChild size="sm" variant="neon" className="mt-5">
                <Link to="/play/$gameId" params={{ gameId: g.id }}>
                  Play
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

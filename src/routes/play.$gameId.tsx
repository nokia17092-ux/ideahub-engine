import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/play/$gameId")({
  head: () => ({
    meta: [
      { title: "Play — Automaton" },
      { name: "description", content: "Play a game generated with Automaton." },
      { property: "og:title", content: "Play — Automaton" },
      { property: "og:description", content: "Play a game generated with Automaton." },
    ],
  }),
  component: PlayPage,
});

function PlayPage() {
  const { gameId } = Route.useParams();
  const [reloadKey, setReloadKey] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["game", gameId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("id, title, code")
        .eq("id", gameId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <Button asChild size="sm" variant="ghost">
          <Link to="/games">
            <ArrowLeft className="size-4" /> Back
          </Link>
        </Button>
        <span className="truncate font-pixel text-[10px] text-neon">
          {data?.title ?? "Loading…"}
        </span>
        <Button size="sm" variant="arcade" onClick={() => setReloadKey((k) => k + 1)}>
          <RotateCcw className="size-4" /> Restart
        </Button>
      </header>

      <main className="flex-1">
        {isLoading && (
          <p className="p-10 text-center text-sm text-muted-foreground">Loading game…</p>
        )}
        {(error || (!isLoading && !data)) && (
          <p className="p-10 text-center text-sm text-muted-foreground">
            This game is not available.
          </p>
        )}
        {data && (
          <iframe
            key={reloadKey}
            title={data.title}
            srcDoc={data.code}
            sandbox="allow-scripts allow-pointer-lock"
            className="h-[calc(100vh-57px)] w-full border-0 bg-black"
          />
        )}
      </main>
    </div>
  );
}

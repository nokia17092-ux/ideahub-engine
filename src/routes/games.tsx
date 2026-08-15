import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "My games — Automaton" },
      { name: "description", content: "Your library of AI-generated browser games." },
      { property: "og:title", content: "My games — Automaton" },
      { property: "og:description", content: "Your library of AI-generated browser games." },
    ],
  }),
  component: GamesPage,
});

function GamesPage() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();

  const { data: games, isLoading } = useQuery({
    queryKey: ["my-games", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("id, title, prompt, is_public, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function remove(id: string) {
    const { error } = await supabase.from("games").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Game deleted");
    qc.invalidateQueries({ queryKey: ["my-games"] });
  }

  async function togglePublic(id: string, next: boolean) {
    const { error } = await supabase.from("games").update({ is_public: next }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["my-games"] });
  }

  return (
    <div className="relative min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="font-pixel text-neon text-xl leading-relaxed">My games</h1>

        {!loading && !user && (
          <p className="mt-8 text-sm text-muted-foreground">
            <Link to="/auth" className="text-primary underline">
              Sign in
            </Link>{" "}
            to see your saved games.
          </p>
        )}

        {user && isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading…</p>}

        {user && games?.length === 0 && (
          <div className="neon-panel mt-10 rounded-2xl p-10 text-center">
            <p className="text-sm text-muted-foreground">No games yet.</p>
            <Button asChild variant="neon" className="mt-6">
              <Link to="/">Generate your first game</Link>
            </Button>
          </div>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {games?.map((g) => (
            <div key={g.id} className="neon-panel rounded-2xl p-5">
              <h2 className="text-base font-semibold text-foreground">{g.title}</h2>
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{g.prompt}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Button asChild size="sm" variant="neon">
                  <Link to="/play/$gameId" params={{ gameId: g.id }}>
                    Play
                  </Link>
                </Button>
                <Button size="sm" variant="arcade" onClick={() => togglePublic(g.id, !g.is_public)}>
                  {g.is_public ? <Globe className="size-4" /> : <Lock className="size-4" />}
                  {g.is_public ? "Public" : "Private"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(g.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

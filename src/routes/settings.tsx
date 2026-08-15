import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Automaton" },
      { name: "description", content: "Manage your Automaton player profile and account." },
      { property: "og:title", content: "Settings — Automaton" },
      { property: "og:description", content: "Manage your player profile and account." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, loading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setDisplayName(data?.display_name ?? ""));
  }, [user]);

  async function save() {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, display_name: displayName });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile saved");
  }

  return (
    <div className="relative min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-xl px-4 py-16">
        <h1 className="font-pixel text-neon text-xl leading-relaxed">Settings</h1>

        {!loading && !user && (
          <p className="mt-8 text-sm text-muted-foreground">
            <Link to="/auth" className="text-primary underline">
              Sign in
            </Link>{" "}
            to manage your profile.
          </p>
        )}

        {user && (
          <div className="neon-panel mt-10 space-y-5 rounded-2xl p-6">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dn">Player name</Label>
              <Input
                id="dn"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="PixelHero"
              />
            </div>
            <Button variant="neon" onClick={save} disabled={busy}>
              Save profile
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

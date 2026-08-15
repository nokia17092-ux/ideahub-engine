CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled game',
  prompt TEXT NOT NULL,
  code TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.games TO authenticated;
GRANT SELECT ON public.games TO anon;
GRANT ALL ON public.games TO service_role;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "games_select_public" ON public.games FOR SELECT TO anon, authenticated USING (is_public = true);
CREATE POLICY "games_select_own" ON public.games FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "games_insert_own" ON public.games FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "games_update_own" ON public.games FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "games_delete_own" ON public.games FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX games_user_id_idx ON public.games(user_id);
CREATE INDEX games_public_idx ON public.games(is_public, created_at DESC);
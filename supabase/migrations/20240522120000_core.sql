-- This migration is now superseded by the comprehensive schema fix
-- Only create tables if they don't already exist

-- Profiles --------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        CREATE TABLE public.profiles (
          id            uuid primary key references auth.users on delete cascade,
          username      text unique not null,
          avatar_url    text,
          bio           text,
          tip_jar_on    boolean default true,
          lifetime_cents integer default 0,
          plan          text default 'free',
          created_at    timestamptz default now()
        );

        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "public profiles" ON public.profiles
          FOR SELECT
          USING (true);
    END IF;
END $$;

-- Projects --------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projects') THEN
        CREATE TABLE public.projects (
          id             uuid primary key default uuid_generate_v4(),
          owner          uuid references public.profiles(id) on delete cascade,
          slug           text not null,
          title          text not null,
          is_public      boolean default true,
          current_version uuid,                -- fk added below after versions table
          created_at     timestamptz default now(),
          updated_at     timestamptz default now(),
          constraint unique_owner_slug unique (owner, slug)
        );

        ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Project: owners or public" ON public.projects
          FOR SELECT USING (is_public OR auth.uid() = owner);
    END IF;
END $$;

-- Versions --------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_versions') THEN
        CREATE TABLE public.project_versions (
          id          uuid primary key default uuid_generate_v4(),
          project_id  uuid references public.projects(id) on delete cascade,
          version_no  integer not null,
          readme_md   text,
          files       jsonb,                     -- [{name, path, size, mime}]
          created_at  timestamptz default now(),
          constraint unique_proj_version unique (project_id, version_no)
        );
    END IF;
END $$;

-- Hook the projects.current_version fk now that the table exists (if not already hooked)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND constraint_name = 'fk_current_version'
    ) THEN
        ALTER TABLE public.projects
          ADD CONSTRAINT fk_current_version
          FOREIGN KEY (current_version) REFERENCES public.project_versions(id);
    END IF;
END $$;

-- Comments (also doubles as Mini-Q&A) ----------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') THEN
        CREATE TABLE public.comments (
          id          uuid primary key default uuid_generate_v4(),
          project_id  uuid references public.projects(id) on delete cascade,
          parent_id   uuid references public.comments(id),
          user_id     uuid references public.profiles(id) on delete cascade,
          content_md  text,
          kind        text default 'comment',    -- 'comment' | 'question' | 'answer'
          is_accepted boolean default false,
          upvotes     integer default 0,
          created_at  timestamptz default now()
        );

        ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Comments: read public or own project" ON public.comments
          FOR SELECT USING (
            (SELECT is_public FROM public.projects p WHERE p.id = project_id)
            OR auth.uid() = (SELECT owner FROM public.projects p WHERE p.id = project_id)
          );
    END IF;
END $$;

-- Payments --------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') THEN
        CREATE TABLE public.payments (
          id                 uuid primary key default uuid_generate_v4(),
          payer              uuid references public.profiles(id),
          payee              uuid references public.profiles(id),
          project_id         uuid references public.projects(id),
          amount_cents       integer not null,
          stripe_intent_id   text,
          type               text,              -- 'tip' | 'subscription'
          created_at         timestamptz default now()
        );
    END IF;
END $$;

-- Simple trigger to keep lifetime tip counter up-to-date
CREATE OR REPLACE FUNCTION public.fn_accumulate_tip() RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.type = 'tip') THEN
    UPDATE public.profiles
      SET lifetime_cents = lifetime_cents + NEW.amount_cents
    WHERE id = NEW.payee;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_acc_tip ON public.payments;
CREATE TRIGGER trg_acc_tip
  AFTER INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.fn_accumulate_tip(); 
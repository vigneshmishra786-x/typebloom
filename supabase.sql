`-- =====================================================================
-- TypeBloom — supabase.sql
-- =====================================================================
-- Beginner-friendly schema for the TypeBloom typing practice website.
--
-- What this file does:
--   1. Creates the practice_sessions table (one row per completed test).
--   2. Enables Row Level Security (RLS) on it.
--   3. Adds policies so each authenticated user can only read, insert,
--      update, or delete THEIR OWN rows. Nobody can read another user's
--      rows, even by crafting a sneaky request from the browser.
--   4. Adds helpful indexes.
--
-- Garden progress is DERIVED from practice_sessions (a simple COUNT(*)),
-- so we do not need a separate garden table. The script.js file uses
-- Supabase's count() query on practice_sessions to decide the plant stage.
-- This keeps a single source of truth and prevents "duplicate garden growth".
--
-- HOW TO RUN THIS:
--   1. Open your Supabase project dashboard at https://supabase.com
--   2. Click "SQL Editor" in the left sidebar.
--   3. Click "+ New query".
--   4. Paste the entire contents of this file.
--   5. Click "Run" (Ctrl+Enter / Cmd+Enter).
--
-- IS IT SAFE TO RUN TWICE?
--   Yes. The "drop policy if exists" + "drop table if exists" lines mean
--   you can re-run this file safely on a fresh project. If you already
--   have data you do NOT want to lose, comment out the DROP TABLE line.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0. (Optional) Clean slate — remove old objects if you are starting over.
-- ---------------------------------------------------------------------
-- Drop existing policies first (policies depend on tables, so do this carefully).
DROP POLICY IF EXISTS "users_select_own_sessions" ON public.practice_sessions;
DROP POLICY IF EXISTS "users_insert_own_sessions" ON public.practice_sessions;
DROP POLICY IF EXISTS "users_update_own_sessions" ON public.practice_sessions;
DROP POLICY IF EXISTS "users_delete_own_sessions" ON public.practice_sessions;

-- ⚠️ If you want to keep existing data, COMMENT OUT the next line.
DROP TABLE IF EXISTS public.practice_sessions CASCADE;


-- ---------------------------------------------------------------------
-- 1. Create the practice_sessions table.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.practice_sessions (
    -- Surrogate unique id (UUID, generated automatically).
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign key to auth.users(id). ON DELETE CASCADE means that
    -- if a user is deleted from Supabase Auth, their sessions are
    -- also deleted automatically (no orphan rows).
    user_id         UUID NOT NULL
                        REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Practice results.
    wpm             INTEGER NOT NULL DEFAULT 0,
    accuracy        INTEGER NOT NULL DEFAULT 0,        -- 0 to 100 (whole percent)
    errors          INTEGER NOT NULL DEFAULT 0,

    -- Practice context.
    mood            TEXT    NOT NULL DEFAULT 'focused'
                        CHECK (mood IN ('calm', 'focused', 'energetic', 'tired')),
    difficulty      TEXT    NOT NULL DEFAULT 'beginner'
                        CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    duration_sec    INTEGER NOT NULL DEFAULT 30
                        CHECK (duration_sec IN (30, 60, 120)),

    -- When the session was saved. Default = now() in the database timezone.
    -- Supabase uses UTC. The browser will format it for display.
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpful comment so future-you remembers what this table is.
COMMENT ON TABLE public.practice_sessions IS
    'One row per completed TypeBloom typing practice session. RLS enforced — each user can only access their own rows.';

COMMENT ON COLUMN public.practice_sessions.wpm IS 'Words per minute, rounded to whole number.';
COMMENT ON COLUMN public.practice_sessions.accuracy IS 'Whole-number accuracy percent (0–100).';
COMMENT ON COLUMN public.practice_sessions.errors IS 'Count of incorrect keystrokes during the session.';
COMMENT ON COLUMN public.practice_sessions.mood IS 'User-selected mood: calm, focused, energetic, or tired.';
COMMENT ON COLUMN public.practice_sessions.difficulty IS 'Beginner, intermediate, or advanced.';
COMMENT ON COLUMN public.practice_sessions.duration_sec IS 'Test duration selected by the user (30, 60, or 120).';


-- ---------------------------------------------------------------------
-- 2. Enable Row Level Security.
--    With RLS ON, NO rows are readable or writable unless a policy
--    explicitly allows it. This is the single most important security
--    setting in the whole project.
-- ---------------------------------------------------------------------
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

-- By default, also block the table owner from bypassing RLS.
-- (If you are an advanced user and want the postgres role to bypass RLS,
-- skip this line. For beginners, this is the safer choice.)
ALTER TABLE public.practice_sessions FORCE ROW LEVEL SECURITY;


-- ---------------------------------------------------------------------
-- 3. RLS Policies — authenticated users can only touch their own rows.
-- ---------------------------------------------------------------------

-- 3a. SELECT — a user can read only rows where user_id matches their auth.uid().
CREATE POLICY "users_select_own_sessions"
    ON public.practice_sessions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 3b. INSERT — a user can insert a row only if user_id is their own.
--     USING applies to the WHERE clause for SELECT-like checks.
--     WITH CHECK applies to the new row being inserted.
CREATE POLICY "users_insert_own_sessions"
    ON public.practice_sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 3c. UPDATE — a user can update only their own rows, and the new
--     user_id must still match their auth.uid().
CREATE POLICY "users_update_own_sessions"
    ON public.practice_sessions
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3d. DELETE — a user can delete only their own rows.
CREATE POLICY "users_delete_own_sessions"
    ON public.practice_sessions
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Note: We intentionally do NOT add a policy for the "anon" (unauthenticated)
-- role. Anonymous visitors cannot save sessions to the database. The
-- frontend handles local-only practice for signed-out users.


-- ---------------------------------------------------------------------
-- 4. Indexes — speed up common queries.
-- ---------------------------------------------------------------------

-- Most history queries filter by user_id and sort by created_at desc.
CREATE INDEX IF NOT EXISTS practice_sessions_user_created_idx
    ON public.practice_sessions (user_id, created_at DESC);

-- Helpful for the count() garden query.
CREATE INDEX IF NOT EXISTS practice_sessions_user_idx
    ON public.practice_sessions (user_id);


-- ---------------------------------------------------------------------
-- 5. (Optional) Realtime — enable if you want a "live" history list.
--    Skip for the basic setup. Left commented out for beginners.
-- ---------------------------------------------------------------------
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.practice_sessions;


-- =====================================================================
-- VERIFICATION QUERIES (run these manually to confirm everything works)
-- =====================================================================
-- After running the script above, paste and run the following to verify:

-- 1) Show the table definition:
--     \d public.practice_sessions

-- 2) List all policies on the table:
--     SELECT polname, polcmd, polroles::regrole[], polqual, polwithcheck
--     FROM pg_policy WHERE polrelid = 'public.practice_sessions'::regclass;

-- 3) Confirm RLS is enabled:
--     SELECT relname, relrowsecurity, relforcerowsecurity
--     FROM pg_class WHERE relname = 'practice_sessions';
--     -- Expected: relrowsecurity = t, relforcerowsecurity = t

-- Done! 🌱 Your database is ready for TypeBloom.

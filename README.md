# TypeBloom 🌱 — Typing Practice Website

A calm, nature-inspired typing practice website that helps you practise typing,
improve accuracy, track your progress, and grow a virtual plant garden as you
practise. Built with **vanilla HTML, CSS, and JavaScript** + **Supabase** for
authentication and database — no frameworks, no build tools.

> 🌷 The more sessions you finish, the more your plant grows: **Seed → Sprout →
> Young Plant → Blooming Plant → Flourishing**.

---

## Table of Contents

1. [What you get](#1-what-you-get)
2. [Quick start (TL;DR)](#2-quick-start-tldr)
3. [Project structure](#3-project-structure)
4. [Step-by-step setup for beginners](#4-step-by-step-setup-for-beginners)
5. [How typing metrics are calculated](#5-how-typing-metrics-are-calculated)
6. [How the garden grows](#6-how-the-garden-grows)
7. [Security — Row Level Security explained](#7-security--row-level-security-explained)
8. [Publishing to GitHub Pages](#8-publishing-to-github-pages)
9. [Troubleshooting common errors](#9-troubleshooting-common-errors)
10. [Testing checklist](#10-testing-checklist)
11. [Where to find your Supabase keys](#11-where-to-find-your-supabase-keys)
12. [License & credits](#12-license--credits)

---

## 1. What you get

TypeBloom is a single-page website with five files (plus this README):

| File            | What it does                                                  |
|-----------------|---------------------------------------------------------------|
| `index.html`    | Page structure, navigation, all sections.                     |
| `style.css`     | All styling, animations, responsive layout, accessibility.   |
| `script.js`     | All app logic: auth, typing test, garden, save/load.          |
| `supabase.sql`  | Database schema with Row Level Security (RLS) policies.       |
| `README.md`     | This file.                                                     |

Features included:

- ✅ Email/password registration and login via Supabase Auth
- ✅ Session restore on page refresh
- ✅ Typing test with 3 difficulty levels × 3 durations
- ✅ Live WPM, accuracy, and error count
- ✅ Character-by-character highlighting (correct/incorrect/current)
- ✅ Mood selector (Calm / Focused / Energetic / Tired) — shapes passage & messages
- ✅ Dashboard with current WPM, accuracy, total errors, total sessions
- ✅ Virtual plant garden with 5 growth stages and progress bar
- ✅ Practice history (last 10 sessions)
- ✅ Row-Level-Secured database (each user only sees their own data)
- ✅ Local-only practice when signed out (no saving)
- ✅ Mobile, tablet, desktop responsive
- ✅ Keyboard-accessible controls and screen-reader labels

---

## 2. Quick start (TL;DR)

If you are comfortable with the tools, here is the fast path:

```bash
# 1. Create a folder and copy the 5 files into it.
mkdir typebloom && cd typebloom
# (copy index.html, style.css, script.js, supabase.sql, README.md)

# 2. Create a free Supabase project at https://supabase.com
# 3. Grab your Project URL + publishable (anon) key (see Section 11).

# 4. Open script.js in VS Code and edit the two placeholders:
#    SUPABASE_URL = 'https://xxxx.supabase.co'
#    SUPABASE_ANON_KEY = 'eyJh...your-anon-key...'

# 5. Open Supabase → SQL Editor → New query → paste supabase.sql → Run.

# 6. Open index.html in your browser (double-click it), or use Live Server.
```

You can finish steps 4–6 in about 10 minutes if you already have a Supabase account.

---

## 3. Project structure

```
typebloom/
├── index.html       # Page structure (loads Supabase SDK + style.css + script.js)
├── style.css        # All styling
├── script.js        # All app logic (auth, typing, garden, database)
├── supabase.sql     # Database schema + RLS policies
└── README.md        # This file
```

That's it. No `node_modules`, no `package.json`, no build step.

---

## 4. Step-by-step setup for beginners

### Step 1 — Create the project folder

1. Open VS Code.
2. Click **File → Open Folder…** (or `File → Open…` on macOS).
3. Click **New Folder**, name it `typebloom`, then click **Open** (or **Select Folder**).
4. Inside the `typebloom` folder, create these five empty files:
   - `index.html`
   - `style.css`
   - `script.js`
   - `supabase.sql`
   - `README.md`
5. Paste the contents of each file (from this project) into the matching file in VS Code.

> Tip: To create a file in VS Code, click the **New File** icon (a sheet of
> paper with a `+`) in the Explorer panel on the left.

### Step 2 — Install the Live Server extension (optional but recommended)

1. Click the **Extensions** icon on the left (or `Ctrl+Shift+X` / `Cmd+Shift+X`).
2. Search for **Live Server** by Ritwick Dey.
3. Click **Install**.
4. Right-click `index.html` in your Explorer panel → **Open with Live Server**.
   VS Code opens your browser at `http://127.0.0.1:5500/index.html`.

This lets you refresh quickly while you test. You can also just double-click
`index.html` to open it directly in your browser — both work.

### Step 3 — Create a free Supabase project

1. Go to <https://supabase.com> and click **Start your project** (top right).
2. Sign in with GitHub or email.
3. Click **New project**.
4. Fill in:
   - **Name:** `typebloom`
   - **Database Password:** pick a strong password and save it somewhere safe.
   - **Region:** choose the one closest to you.
   - **Pricing plan:** Free tier is fine.
5. Click **Create new project** and wait ~2 minutes while Supabase sets up your database.

### Step 4 — Where to paste the Supabase URL and publishable key

1. In your Supabase project dashboard, click the **gear icon → Project Settings**
   (or click the project name at the top, then **Project Settings**).
2. In the left menu under "Configuration", click **API**.
3. You will see two values at the top:
   - **Project URL** — something like `https://abcdefgh.supabase.co`
   - **Project API keys → `anon` `public`** — a long string starting with `eyJ…`
4. Copy the **Project URL**.
5. Open `script.js` in VS Code.
6. Find these two lines near the top:

   ```js
   const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_PUBLISHABLE_KEY';
   ```

7. Replace the placeholder strings with your own values:

   ```js
   const SUPABASE_URL = 'https://abcdefgh.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOi...your-anon-key...sHCQ';
   ```

8. Save the file (`Ctrl+S` / `Cmd+S`).

> ⚠️ The `anon` `public` key is **safe** to put in frontend code. It only lets
> people do what your RLS policies allow. NEVER put the `service_role` key
> or your database password in `script.js` — those grant full access.

### Step 5 — Run `supabase.sql` in the Supabase SQL Editor

1. In the Supabase dashboard, click **SQL Editor** in the left sidebar.
2. Click **+ New query** (top right of the SQL Editor page).
3. Open the `supabase.sql` file from this project in VS Code.
4. Select everything (`Ctrl+A` / `Cmd+A`) and copy it (`Ctrl+C` / `Cmd+C`).
5. Paste it into the Supabase SQL Editor query box.
6. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).
7. You should see "Success. No rows returned" in the bottom panel.

This creates the `practice_sessions` table, enables RLS, and adds four
policies (select / insert / update / delete) that restrict each user to their
own rows.

### Step 6 — Configure Supabase authentication

1. In the Supabase dashboard, click **Authentication** in the left sidebar.
2. Click **Providers** under the "Configuration" section.
3. Click **Email** (it should already be enabled).
4. Make sure **Enable Email provider** is ON (the toggle should be blue).
5. (Optional but recommended for production) Scroll down to **Email confirmations**:
   - Toggle **Confirm email** is **ON by default** — new users must click a
     confirmation link in their inbox before they can log in.
   - For **testing only**, you can turn this OFF to skip the email step. (Not
     recommended for a real product.)

### Step 7 — Set the correct Site URL and Redirect URLs

The Site URL is where Supabase sends users after they click the email
confirmation link. For local testing, use `http://127.0.0.1:5500`. For GitHub
Pages, use your `https://<username>.github.io/<repo>/` URL.

1. In Supabase, click **Authentication → URL Configuration**.
2. Under **Site URL**, paste your main URL, e.g.:
   - Local testing: `http://127.0.0.1:5500/`
   - GitHub Pages: `https://yourusername.github.io/typebloom/`
3. Under **Redirect URLs**, click **Add URL** and add ALL of these (one per line):
   - `http://127.0.0.1:5500/`
   - `http://localhost:5500/`
   - `http://127.0.0.1:5500/index.html`
   - `https://yourusername.github.io/typebloom/`
   - `https://yourusername.github.io/typebloom/index.html`
4. Click **Save**.

> Why both? Because email-confirmation links come back to a URL that must
> match exactly. Adding both local and production URLs lets you test on your
> laptop and later deploy to GitHub Pages without reconfiguring Supabase.

### Step 8 — Test registration and login

1. Open `index.html` in your browser (via Live Server or by double-clicking).
2. Click **Sign in** in the navbar. The auth panel opens.
3. Click the **Register** tab.
4. Enter a real email you can check, and a password of at least 6 characters.
5. Click **Create account**.
6. If you left email confirmation ON, you will see a message:
   *"Account created! Check your inbox for a confirmation link, then log in."*
7. Open your email inbox, find the message from Supabase, and click the link.
8. You will be redirected back to your site. Click **Sign in** again, switch to
   the **Log in** tab, enter the same email/password, and click **Log in**.
9. The account pill in the navbar should now show your email with a green dot.

If email confirmation is OFF, you are signed in immediately after step 5.

### Step 9 — Test typing and confirm sessions are saved

1. Scroll to **Typing practice**.
2. Pick a **Difficulty** (Beginner / Intermediate / Advanced) and a **Duration** (30 / 60 / 120s).
3. Pick a **Mood** (e.g. Calm 🌿).
4. Click **Start**. A passage appears. Click into the typing area below it.
5. Type the passage. The timer starts on your first keystroke.
6. Watch WPM, accuracy, errors, and time update in real time.
7. When the timer runs out (or you finish the passage, or you click **Finish**),
   a **Session complete** panel appears with your results.
8. Below the results, you should see **"Saved to your account."** in green text.
9. Scroll to **History** — your session should appear in the list.
10. Scroll to **Your garden** 🌷 — your plant should now be a **Sprout** (after 1 session).
11. Refresh the page. Your stats and garden should be restored (because you are signed in).

### Step 10 — Verify Row Level Security

1. Register a SECOND account with a different email (use a private/incognito
   window, or sign out and register again).
2. Sign in as user A. Complete a few practice sessions.
3. Sign out. Sign in as user B. Complete a different number of sessions.
4. Verify that user B's **History** list shows ONLY user B's sessions, never user A's.
5. (Optional advanced check) Open the Supabase **SQL Editor** and run:

   ```sql
   SELECT count(*) FROM public.practice_sessions;
   -- This runs as the postgres role and sees ALL rows. It should equal
   -- the TOTAL of all users' sessions combined.
   ```

   Now try this in your browser console while signed in as user A:

   ```js
   const { data } = await supabase.from('practice_sessions').select('*');
   console.log(data.length);  // Should show ONLY user A's sessions.
   ```

   Even though the database has many rows, RLS returns only the ones that
   belong to the signed-in user.

### Step 11 — Publish the frontend using GitHub Pages

1. Create a GitHub account if you don't have one (<https://github.com>).
2. Create a new repository named `typebloom` (or any name). Do **not** initialize it
   with a README — you already have files locally.
3. In VS Code, open a terminal (`Ctrl+\`  `` ` `` / `Cmd+\`  `` ` ``).
4. Run these commands (replace `yourusername`):

   ```bash
   git init
   git add .
   git commit -m "Initial TypeBloom project"
   git branch -M main
   git remote add origin https://github.com/yourusername/typebloom.git
   git push -u origin main
   ```

5. On GitHub, open your repository → click **Settings** (top tab) → **Pages**
   (left sidebar).
6. Under **Build and deployment → Source**, choose **Deploy from a branch**.
7. Under **Branch**, select `main` and the `/ (root)` folder. Click **Save**.
8. Wait 1–2 minutes. GitHub will show a green box at the top with your live URL:
   `https://yourusername.github.io/typebloom/`
9. Open that URL. Your site loads.
10. Update Supabase **Authentication → URL Configuration → Site URL** and
    **Redirect URLs** to use the GitHub Pages URL (see Step 7).

> Because the site is purely static, GitHub Pages is enough — no server code
> is needed. Supabase handles all dynamic work (auth + database).

### Step 12 — Troubleshooting common errors

See [Section 9](#9-troubleshooting-common-errors) below.

---

## 5. How typing metrics are calculated

TypeBloom uses standard, well-documented formulas so the numbers are
trustworthy and consistent.

### 5.1 WPM (Words Per Minute)

```
WPM = (correct characters ÷ 5) ÷ elapsed minutes
```

- **correct characters** = the number of keystrokes where the typed character
  exactly matched the expected character at that position in the passage.
- **5 characters = 1 standard word** — this is the typing-test industry
  standard (used by Ratatype, Monkeytype, and others).
- **elapsed minutes** = the time from your FIRST keystroke to the moment the
  test ends, divided by 60.

Example: If you correctly type 100 characters in 30 seconds:
- elapsed minutes = 30 ÷ 60 = 0.5
- WPM = (100 ÷ 5) ÷ 0.5 = 20 ÷ 0.5 = **40 WPM**

### 5.2 Accuracy

```
Accuracy = (correct keystrokes ÷ total keystrokes) × 100
```

- **total keystrokes** = every character you typed while the test was running
  (including wrong characters, even ones you later corrected with Backspace).
- **correct keystrokes** = those that matched the expected character at that
  position when first typed.

If you have not typed anything yet, accuracy is shown as **100%** by default.

Example: 90 correct keystrokes out of 100 total → 90 / 100 × 100 = **90%**.

### 5.3 Errors

```
Errors = number of incorrect keystrokes made during the test
```

Counting rule: **each time you press a key that does not match the expected
character at that position, that counts as one error — even if you immediately
press Backspace and re-type it correctly.** This is the standard approach used
by most typing tests because it reflects your raw accuracy, not just the final
state of the text.

Backspace itself is **not** counted as an error. Backspace does not reduce the
error count either — the incorrect keystroke was still made.

Example: You type `hillo` instead of `hello`, then Backspace twice and retype
`lo`. Your error count = 1 (the `i` you originally typed at position 2).

### 5.4 When the timer starts

The timer starts on your **first keystroke**, not when you click **Start**.
This way, you can read the passage first without losing time.

### 5.5 When the timer ends

The test ends in three ways:

1. The countdown reaches 0 (most common).
2. You type the entire passage correctly (early finish — bonus points for speed!).
3. You click **Finish**.

After the test ends, the input is disabled. Click **Start** to begin a new test.

---

## 6. How the garden grows

The garden is derived **directly from your saved practice sessions** in the
database. There is no separate "garden table" to keep out of sync. We just
count how many completed sessions you have.

| Sessions completed | Stage              | Emoji |
|--------------------|--------------------|-------|
| 0                  | Seed               | 🌱    |
| 1                  | Sprout             | 🌿    |
| 3                  | Young Plant        | ☘️    |
| 6                  | Blooming Plant     | 🌷    |
| 10                 | Flourishing        | 🌸    |

The progress bar shows how close you are to the next stage. When you reach the
top stage, the bar shows 100% and a message congratulates you.

### Important: no duplicate rewards

- The garden is recomputed from `SELECT count(*)` on your sessions table — so
  refreshing the page cannot give you extra growth.
- Completing a session inserts exactly one row in `practice_sessions`, which
  means the count goes up by exactly one.
- If the insert fails (network error, RLS violation, etc.), the count does not
  increase, and the result panel shows a red error message — never a fake
  "Progress saved" message.

---

## 7. Security — Row Level Security explained

### Why RLS matters

Even though your `anon` key is "safe" to expose, anyone who knows it could try
to query your database. **Row Level Security (RLS) is what actually stops them
from reading other people's data.** With RLS on, Supabase checks every query
against your policies BEFORE returning any rows.

### What `supabase.sql` does

1. Creates the `practice_sessions` table.
2. Runs `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` — turns on RLS.
3. Runs `ALTER TABLE ... FORCE ROW LEVEL SECURITY` — even the table owner
   must respect RLS (belt and suspenders).
4. Adds four policies:

   | Policy                          | Allows...                                                |
   |---------------------------------|----------------------------------------------------------|
   | `users_select_own_sessions`     | SELECT rows where `auth.uid() = user_id`                 |
   | `users_insert_own_sessions`     | INSERT a row only if `auth.uid() = user_id`              |
   | `users_update_own_sessions`     | UPDATE only own rows; new row must still be owned        |
   | `users_delete_own_sessions`     | DELETE only own rows                                     |

5. Adds indexes on `user_id` and `created_at` so queries are fast.

### Why there is no separate garden table

A garden table would just store "total sessions" — but we already have that
number as a count of `practice_sessions`. A separate table would be a second
source of truth that could drift out of sync (e.g. if a user deletes a session,
the count must also decrease). By deriving the count from the sessions table,
we keep a single source of truth and prevent duplicate rewards.

### Verifying RLS works

See [Step 10](#step-10--verify-row-level-security) above. The fastest check:
sign in as user A, run the snippet in the browser console — it returns ONLY
user A's rows, even though the database has more.

---

## 8. Publishing to GitHub Pages

See [Step 11](#step-11--publish-the-frontend-using-github-pages) above for the
full walkthrough. Summary:

1. `git init`, commit, push to a new GitHub repo.
2. Repository → **Settings → Pages → Branch = main / root → Save**.
3. Wait 1–2 minutes for the green confirmation banner.
4. Update Supabase **Site URL** and **Redirect URLs** to your GitHub Pages URL.

Because TypeBloom is pure static HTML/CSS/JS, GitHub Pages is sufficient.
No server code, no Node.js, no build step.

---

## 9. Troubleshooting common errors

### 9.1 "Invalid API key"

- **Cause:** The `SUPABASE_ANON_KEY` in `script.js` is wrong, missing, or
  contains extra quotes/spaces.
- **Fix:** Open `script.js`. Make sure the value looks like
  `const SUPABASE_ANON_KEY = 'eyJhbGci...long-string...';` (with single
  quotes, no extra spaces). Copy it again from Supabase → Project Settings →
  API → Project API keys → `anon` `public`.

### 9.2 "Failed to fetch" or network errors

- **Cause:** Browser cannot reach Supabase. Usually a typo in the URL, a
  network block, or mixed content (HTTP vs HTTPS).
- **Fix:**
  1. Confirm `SUPABASE_URL` starts with `https://` and ends with `.supabase.co`.
  2. If you opened `index.html` via `file://`, use **Live Server** instead
     (some browsers block fetch from `file://`).
  3. Check your internet connection and ad-blockers (uBlock Origin sometimes
     blocks Supabase domains — disable it for your site).

### 9.3 Email confirmation issues

- **Symptom:** You registered but cannot log in. The auth panel says
  *"Wrong email or password"* or *"Please confirm your email"*.
- **Cause:** Email confirmation is enabled, and you haven't clicked the link
  Supabase sent you.
- **Fix:**
  1. Check the inbox (and **Spam/Junk** folder) of the email you registered with.
  2. Look for an email from `noreply@mail.supabase.com` (or similar).
  3. Click the confirmation link inside. It should redirect you back to your
     **Site URL** (see Step 7 in setup).
  4. If still stuck: in Supabase, open **Authentication → Users**, find your
     user, click the three dots → **Confirm user** to manually confirm them
     (useful only for testing).
  5. To disable email confirmation entirely for testing: **Authentication →
     Providers → Email → turn OFF "Confirm email" → Save**.

### 9.4 Row Level Security violations

- **Symptom:** A "Save failed: ..." message that mentions "policy", "permission",
  or "rls" in the result panel.
- **Cause:** Either (a) you didn't run `supabase.sql`, (b) you ran only part
  of it, or (c) the user isn't signed in.
- **Fix:**
  1. Confirm you ran the **entire** `supabase.sql` file in the SQL Editor.
  2. In Supabase, open **Table Editor → practice_sessions** and look for a
     small blue "RLS enabled" badge near the table name.
  3. Run this query in the SQL Editor to verify policies exist:

     ```sql
     SELECT polname FROM pg_policy
     WHERE polrelid = 'public.practice_sessions'::regclass;
     ```

     You should see 4 policy names.
  4. Make sure the user is signed in (the navbar pill should be green).

### 9.5 Database insert errors

- **Symptom:** "Save failed: ..." with a database-y message (e.g. "violates
  foreign key constraint", "value too long for type", "invalid input syntax").
- **Fix:**
  1. Make sure you ran `supabase.sql` (it creates the table with the right columns).
  2. If you previously created a `practice_sessions` table by hand, drop it
     first: in SQL Editor run `DROP TABLE public.practice_sessions CASCADE;`
     then re-run `supabase.sql`.
  3. Open the browser DevTools console (`F12` → Console tab) and read the full
     error message. It usually tells you which column is wrong.

### 9.6 Missing Supabase client

- **Symptom:** Console says `ReferenceError: supabase is not defined` or
  `Cannot read properties of undefined (reading 'createClient')`.
- **Cause:** The Supabase SDK script tag in `index.html` didn't load before
  `script.js` ran.
- **Fix:**
  1. Open `index.html` and confirm this line is in the `<head>`:

     ```html
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.min.js"></script>
     ```

  2. Confirm the `<script src="script.js" defer></script>` line is at the
     **end of `<body>`**, so it runs after the Supabase SDK.
  3. Check the **Network** tab in DevTools to see if the Supabase SDK file
     loaded (status 200). If it shows red, your connection blocked the CDN.

### 9.7 JavaScript console errors

- **Symptom:** The page loads but some buttons don't work; the Console tab
  shows red errors.
- **Fix:**
  1. Click the error in the Console to expand it — the line number points to
     the problem in `script.js`.
  2. Common causes: a typo in a DOM id (e.g. `$('stat-wmp')` instead of
     `$('stat-wpm')` returns `null`, and reading a property of `null` throws).
  3. Make sure you saved the latest `script.js` and refreshed the page
     (hard refresh: `Ctrl+Shift+R` / `Cmd+Shift+R`).

### 9.8 Other gotchas

- **Garden not growing after refresh:** Make sure you are signed in. The garden
  is derived from the database count, which only works for authenticated users.
- **History list is empty:** Same reason. Sign in to see your saved history.
- **Policies seem to allow too much:** Re-run `supabase.sql`. The `DROP POLICY
  IF EXISTS` lines clean up old policies first.

---

## 10. Testing checklist

Before you declare TypeBloom "done", run through this list. The first column
tells you whether the test requires your own Supabase credentials.

| #   | Test                                                              | Needs Supabase? |
|-----|-------------------------------------------------------------------|-----------------|
| 1   | Homepage loads with no JS errors in the console                   | No              |
| 2   | Supabase SDK loads before `script.js` (check Network tab)         | No              |
| 3   | Typing area is disabled until **Start** is clicked               | No              |
| 4   | Timer starts only on first keystroke                              | No              |
| 5   | Timer counts down and ends the test at 0                          | No              |
| 6   | Live WPM, accuracy, errors update as you type                    | No              |
| 7   | Correct chars turn green; incorrect ones turn red                | No              |
| 8   | Backspace works and does NOT reduce the error count               | No              |
| 9   | Clicking **Finish** ends the test early                          | No              |
| 10  | **Restart** clears input and lets you start fresh                 | No              |
| 11  | Garden grows from Seed → Sprout after the first session (local)  | No              |
| 12  | Refreshing the page keeps the local garden progress              | No              |
| 13  | Register form rejects invalid email / short password              | Yes             |
| 14  | Login handles wrong password with friendly message                | Yes             |
| 15  | Email confirmation flow works (if enabled)                       | Yes             |
| 16  | Session restore works after refresh while signed in               | Yes             |
| 17  | A completed session is saved for the signed-in user               | Yes             |
| 18  | History list shows only the signed-in user's sessions             | Yes             |
| 19  | User A cannot see User B's sessions (RLS check)                  | Yes             |
| 20  | Garden progress is restored from server after refresh             | Yes             |
| 21  | Sign out works and clears saved data from the UI                  | Yes             |
| 22  | Layout looks good on a 360px-wide phone                           | No              |
| 23  | Keyboard navigation works (Tab, arrows for mood radiogroup)      | No              |
| 24  | GitHub Pages deployment serves the site without errors           | Yes             |

> ⚠️ Tests 13–24 require your own Supabase credentials and a deployed
> environment. The author of this README has **not** run these tests against
> your specific Supabase project — you must perform them yourself. If any
> test fails, see Section 9 for troubleshooting.

---

## 11. Where to find your Supabase keys

| You want...                          | Path in Supabase dashboard                                  |
|--------------------------------------|-------------------------------------------------------------|
| Project URL                          | Project Settings → API → "Project URL"                      |
| Anon (publishable) key               | Project Settings → API → Project API keys → `anon` `public` |
| Service-role key (DO NOT use here)   | Project Settings → API → Project API keys → `service_role`  |
| Database password                    | Project Settings → Database → Connection string             |
| Authentication settings              | Authentication → Providers → Email                          |
| Site URL / Redirect URLs             | Authentication → URL Configuration                         |
| SQL Editor                           | SQL Editor → + New query                                     |
| Table viewer                         | Table Editor → (table name)                                 |

> The "anon public" key is designed to be embedded in frontend code. The
> `service_role` key is **NOT**. Never paste `service_role` into `script.js`.

---

## 12. License & credits

- Code: MIT-style "do whatever you want, attribution appreciated".
- Fonts: Poppins & Inter via Google Fonts (OFL license).
- Supabase SDK v2: MIT license.
- Plant illustrations: inline SVG + emoji (no copyrighted assets).

Built with care for beginner coders. 🌱 Happy typing, and may your garden
flourish!

— TypeBloom

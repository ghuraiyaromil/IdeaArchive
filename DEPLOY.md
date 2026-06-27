# IdeaArchive — Zero-Dollar Deployment Checklist

Deploy IdeaArchive for free using **Supabase Free Tier** + **Vercel Hobby Tier**.
Estimated time: ~30 minutes.

---

## Prerequisites

- Node.js 18+ and npm installed locally
- A GitHub account (for Vercel deploy)
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account

---

## Step 1 — Install Dependencies Locally

```bash
npm install
npm run build   # must be zero errors before proceeding
```

---

## Step 2 — Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Choose a name (e.g. `ideaarchive`), set a strong database password, pick a region.
3. Wait for the project to initialize (~1 min).

---

## Step 3 — Run the Schema

1. In the Supabase dashboard, open **SQL Editor** → **New query**
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run**
4. Verify in **Table Editor** that you see: `profiles`, `ideas`, `ratings`, `connections`
5. Verify in **Database → Views** that you see: `idea_leaderboard`

---

## Step 4 — Configure Supabase Auth

1. Go to **Authentication → Settings**
2. Under **Email**, ensure **Enable email confirmations** is toggled to your preference.
   - For a quick demo: turn it **off** (users confirmed immediately)
   - For production: turn it **on** (email confirmation flow)
3. Under **Site URL**, set it to your production URL (you'll update this after Vercel deploy).
   - Temporary placeholder: `http://localhost:3000`
4. Under **Redirect URLs**, add:
   - `http://localhost:3000/**`
   - `https://YOUR-APP.vercel.app/**` (add after Vercel deploy)

---

## Step 5 — Get Your API Keys

1. In Supabase: **Settings → API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Update your local `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Run `npm run build` again to confirm everything compiles.

---

## Step 6 — Set Up Connection Request Emails (Optional)

The `connections` table fires a DB event on insert. To send founder notification emails:

### Option A — Supabase Edge Function + DB Webhook (recommended)

1. In Supabase: **Edge Functions** → **New Function** → name it `notify-connection`
2. Paste this Edge Function:

```typescript
// supabase/functions/notify-connection/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const payload = await req.json();
  const record = payload.record;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Get founder email
  const { data: founder } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", record.founder_id)
    .single();

  const { data: investor } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", record.investor_id)
    .single();

  const { data: founderUser } = await supabase.auth.admin.getUserById(record.founder_id);

  if (founderUser?.user?.email) {
    await supabase.auth.admin.sendRawEmail({
      // Use Supabase's built-in email or connect Resend/SendGrid
    });
    // For a zero-cost approach: log to the DB or use Resend free tier (100/day)
  }

  return new Response("ok");
});
```

3. In **Database → Webhooks** → **Create webhook**:
   - Table: `connections`
   - Events: `INSERT`
   - Method: `POST`
   - URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-connection`
   - Add header: `Authorization: Bearer YOUR_ANON_KEY`

### Option B — Skip for MVP

Connection requests are stored in the DB. Founders can check their profile for incoming requests. Email can be added post-launch.

---

## Step 7 — Deploy to Vercel

### Option A — GitHub (recommended)

1. Push this repo to GitHub:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/ideaarchive.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import from GitHub
3. Select your repo → **Deploy**
4. Vercel auto-detects Next.js — no config needed

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel
```

---

## Step 8 — Add Environment Variables in Vercel

1. In Vercel: **Project → Settings → Environment Variables**
2. Add:
   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` |
   | `NEXT_PUBLIC_SITE_URL` | `https://YOUR-APP.vercel.app` |
3. **Redeploy** (Deployments → ⋯ → Redeploy)

---

## Step 9 — Update Supabase Auth Redirect URL

1. Go back to **Supabase → Authentication → Settings → Redirect URLs**
2. Add your Vercel URL: `https://YOUR-APP.vercel.app/**`
3. Update **Site URL** to `https://YOUR-APP.vercel.app`

---

## Step 10 — Smoke Test

- [ ] Visit your Vercel URL — homepage loads
- [ ] Sign up as a Founder, submit an idea
- [ ] Sign up as an Investor (separate account), rate the idea  
- [ ] Verify the idea appears on `/leaderboard`
- [ ] Investor requests a connection — row appears in `connections` table
- [ ] Check Supabase Table Editor to confirm all tables have data

---

## Free Tier Limits

| Service | Free Limit | Notes |
|---------|-----------|-------|
| Supabase DB | 500 MB | Plenty for early traction |
| Supabase Auth | 50,000 MAU | More than enough |
| Supabase Edge Functions | 500K invocations/mo | Free tier |
| Vercel Hobby | 100 GB bandwidth | Resets monthly |
| Vercel Hobby | Unlimited deploys | Personal projects |

---

## Common Issues

**Build error: `NEXT_PUBLIC_SUPABASE_URL` is undefined**  
→ Make sure `.env.local` exists and `npm run build` is run after editing it.

**RLS blocking all reads**  
→ Verify you ran the full `schema.sql`. Check **Supabase → Authentication → Policies** for each table.

**Profile not created after signup**  
→ The `on_auth_user_created` trigger requires the `handle_new_user` function. Re-run `schema.sql`.

**`idea_leaderboard` view returns nothing**  
→ The view only includes ideas with ≥1 rating. Submit a rating first.

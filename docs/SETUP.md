# Athlone Anglers app — setup

## What's built so far

- **Public site** (`/`, `/news`, `/events`, `/results`): mobile-friendly,
  shows placeholder content until the database is connected.
- **Committee login + dashboard** (`/committee/login`, `/committee/dashboard`,
  and a manage page for members/news/events/results): add/delete rows,
  changes show up on the public site immediately.
- **Weather widget** on the home page, a 7-day Athlone forecast with a wind
  compass, pulling live from Met Éireann's free public API — no setup
  needed, already working.

Nothing can be saved yet because there's no database connected — that's step 1
below.

## 1. Create a Supabase project (free)

Supabase gives us the database (for members/news/events/results) and
the committee login, for free at this scale.

1. Go to https://supabase.com, sign up, and create a new project (pick a
   region close to Ireland, e.g. "West EU").
2. In the project, open **SQL Editor > New query**, paste in the contents of
   `docs/schema.sql` from this repo, and run it. This creates the four
   tables and locks them down so only logged-in committee members can edit
   them (the public can only read news/events/results; member records
   stay private).
3. Open **Project Settings > API**. Copy the **Project URL** and the
   **anon public key**.
4. In `app/`, copy `.env.local.example` to `.env.local` and paste those two
   values in.
5. Restart the dev server (`npm run dev` inside `app/`). The "Supabase isn't
   configured yet" warnings should disappear.

## 2. Create committee member logins

Supabase Auth handles login. To add a committee member:

1. Supabase dashboard > **Authentication > Users > Add user**.
2. Enter their email and a temporary password, and tell them to log in at
   `/committee/login` with it (there's no self-signup — only you add
   accounts, so random people can't get committee access).

## 3. Deploy to Netlify

Same flow as the TV Tech Ireland site:

```
cd app
netlify init      # first time only
netlify deploy --prod
```

Add the two Supabase env vars in the Netlify dashboard (**Site settings >
Environment variables**) so the live site can reach the database too.

## 4. Pulling content from Facebook (optional, later)

To auto-pull posts/photos from the Athlone Anglers Facebook Page into the
news feed:

1. You (as the Page admin) create a free app at
   https://developers.facebook.com and generate a **Page Access Token** for
   the Athlone Anglers Page.
2. Give me that token (and the Page ID) and I'll wire up a script that pulls
   posts via the Graph API into the `news` table.

This step needs your Facebook login, so it's the one thing I can't do for
you directly.

## 5. WhatsApp

Simplest option, no setup: add a "Join our WhatsApp group" button linking to
your group's invite link (`wa.me/...` or the group invite URL) — just give
me the link and I'll add it to the site.

A bigger option — the WhatsApp Business API for automated alerts (e.g.
competition reminders) — needs a Meta Business account and has a per-message
cost. Worth considering later if the simple version isn't enough.

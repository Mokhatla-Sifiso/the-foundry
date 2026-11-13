This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Custom domain (v1 launch)

The canonical URL used by `sitemap.xml`, `robots.txt`, OG metadata, the
JSON-LD schema and email links comes from one place: `src/lib/site-url.ts`.

1. Production (`VERCEL_ENV=production`): always `https://www.mzwakhemokhatla.co.za`.
   Page requests that reach a `*.vercel.app` production host are redirected there (308).
2. `NEXT_PUBLIC_SITE_URL` (local builds).
3. `VERCEL_URL` (preview deployments).
4. `http://localhost:3000` for local dev.

### Launch checklist

1. Buy + add the domain in **Vercel → Settings → Domains**.
2. Add the suggested A / CNAME records at the registrar (Vercel shows the
   exact values). Wait for verification.
3. In **Vercel → Settings → Environment Variables**, set:
   - `NEXT_PUBLIC_SITE_URL` = `https://your-domain` (all environments).
   - `BETTER_AUTH_URL` = the same value (production only).
4. Update `RESEND_FROM` to a sender on your verified domain.
5. Redeploy. Visit `/sitemap.xml` and `/robots.txt`. They should now
   reference the custom domain.

## Visitor analytics (optional, consent-gated)

Daily visitors and page views run on Google Analytics 4, gated behind the
cookie banner. It is off until you supply a Measurement ID: no script, no
cookies, and the CSP stays fully locked down. Leave `NEXT_PUBLIC_GA_MEASUREMENT_ID`
blank to keep it off.

1. In **Google Analytics → Admin → Data streams**, create a Web stream for the
   domain and copy the **Measurement ID** (`G-XXXXXXXXXX`).
2. In **Vercel → Settings → Environment Variables**, set
   `NEXT_PUBLIC_GA_MEASUREMENT_ID` = that ID (all environments), then redeploy.
3. GA now loads **only** for visitors who accept the "Analytics" cookie
   category. Withdrawing consent disables it and clears its cookies. Read the
   numbers in the GA dashboard (Reports → Realtime / Engagement → Pages).

To verify: set the ID, open the site and click **Accept all**. A `_ga` cookie
appears and the visit shows up in GA Realtime within a few seconds.

## Launch updates (the upgrades gate)

"Notify me when the updates are done" stores sign-ups in Neon and emails through Resend. Before
it works in production:

1. Apply the `update_subscriber` migration with [the runbook](docs/runbooks/prisma-migrations.md).
2. In **Vercel → Settings → Environment Variables**, set `CRON_SECRET` for Production (letters
   and digits, 16 or more), then redeploy. The daily cron in `vercel.json` sends it to
   `/api/updates/purge`, which deletes sign-ups left unconfirmed for 7 days, as the privacy
   policy promises.
3. Check that `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (or the `KV_REST_API_*`
   pair) are set, or the sign-up form is not rate limited.

## Recruiter auth setup

The `/recruiter` flow is wired to BetterAuth + Prisma + Neon Postgres + Resend.

1. Copy `.env.example` to `.env.local` and fill in:
   - **DATABASE_URL** / **DIRECT_URL**: Neon pooled and direct connection strings.
   - **BETTER_AUTH_SECRET**: `openssl rand -base64 32`.
   - **RESEND_API_KEY** + **RESEND_FROM**: verified sender from your Resend domain.
   - **RECRUITER_BYPASS_EMAILS** + **RECRUITER_BYPASS_UNTIL**: a time-boxed escape from the
     work-email check, for walking the journey with a personal address. It expires on
     `RECRUITER_BYPASS_UNTIL` regardless. Leave both blank to keep it off. Never grant admin for
     this: admin skips the CV entitlement and makes every gate untestable.
2. Apply the schema and seed the admin whitelist:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```
   The schema is versioned in `prisma/migrations`. A database created earlier with `db push` is
   adopted once with a baseline; see [docs/runbooks/prisma-migrations.md](docs/runbooks/prisma-migrations.md).
   `mokhatla.mzwakhe@gmail.com` (Mzwakhe Mokhatla) is seeded as the founding admin.
   Additional admins can be added via `POST /api/admin/whitelist { email, name }`
   from any signed-in admin session.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Custom domain (v1 launch)

The canonical URL used by `sitemap.xml`, `robots.txt`, OG metadata, and the
JSON-LD Person schema reads from a single source — `src/lib/site-url.ts`.
Priority order:

1. `NEXT_PUBLIC_SITE_URL` (set this in Vercel once a custom domain is
   attached, e.g. `https://mzwakhe.dev`).
2. `VERCEL_PROJECT_PRODUCTION_URL` (Vercel injects on production builds).
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
5. Redeploy. Visit `/sitemap.xml` and `/robots.txt` — they should now
   reference the custom domain.

## Recruiter auth setup

The `/recruiter` flow is wired to BetterAuth + Prisma + Neon Postgres + Resend.

1. Copy `.env.example` to `.env.local` and fill in:
   - **DATABASE_URL** / **DIRECT_URL** — Neon pooled + direct connection strings.
   - **BETTER_AUTH_SECRET** — `openssl rand -base64 32`.
   - **RESEND_API_KEY** + **RESEND_FROM** — verified sender from your Resend domain.
2. Apply the schema and seed the admin whitelist:
   ```bash
   npx prisma migrate deploy   # or `npx prisma db push` for a first-time setup
   npx prisma db seed
   ```
   `mokhatla.mzwakhe@gmail.com` (Mzwakhe Mokhatla) is seeded as the founding admin.
   Additional admins can be added via `POST /api/admin/whitelist { email, name }`
   from any signed-in admin session.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
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

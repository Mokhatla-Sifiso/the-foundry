# THE FOUNDRY — Complete Project Blueprint

> **Purpose of this document.** This is a single-file, exhaustive reconstruction spec for the project codenamed **the-foundry** — the personal portfolio + recruiter-access web application of **Mzwakhe Mokhatla**. It is written so that, given only this file, an engineer (or an AI) could regenerate the project **1:1** — functionality, logic, UI, calculations, data model, styling, tooling, and deployment. It has two halves:
>
> 1. **The Narrative (Sections 0–28)** — the *why* and *how*: architecture, every subsystem, every algorithm and formula, the design system, all content data, flows, and operational setup. Authored from the code.
> 2. **The Source Appendix (Section 29)** — the *ground truth*: the complete verbatim source of every text file in the repository, so nothing is lost to paraphrase. If the Narrative and the Appendix ever disagree, the Appendix wins.
>
> Binary assets (the portrait PNG, the CV PDF, the favicon) cannot be represented as text and are documented by path, purpose, and dimensions in Section 5; supply your own.

---

## 0. How to regenerate this project from scratch (the short path)

1. Scaffold a Next.js 16 App-Router + TypeScript project (Section 6).
2. Install the exact dependencies in Section 2 (`package.json` in the Appendix is authoritative).
3. Recreate the config files (Section 6, Appendix): `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.prettierrc.json`, `prisma.config.ts`, `jest.config.ts`, `jest.setup.ts`, CI workflow.
4. Recreate the Prisma schema (Section 7), provision Neon Postgres, `prisma db push`, `prisma db seed`.
5. Recreate `src/` exactly from the Appendix. The dependency order that avoids forward-references: `lib/` → `hooks/` → `components/primitives` → `components/*` → `app/`.
6. Recreate `src/app/globals.css` (design system, Section 8 + Appendix).
7. Supply the binary assets (Section 5), set env vars (Section 4), run `npm run dev`.
8. Deploy to Vercel with `build = prisma generate && next build` and `postinstall = prisma generate` (Section 25).

---

## 1. What this is

A one-person portfolio site with an unusually engineered feel, plus a **real, database-backed recruiter access system**. It serves **two audiences**:

- **General visitors** land on `/` — a single, long, animated marketing page (smooth-scrolled, section-revealed) presenting who Mzwakhe is, what he does, where he has worked, and how he uses AI. No login, fully public, SEO-optimised.
- **Recruiters** go to `/recruiter` — a passwordless email-OTP journey (sign up / sign in) backed by BetterAuth + Prisma + Neon Postgres + Resend, that "verifies" the recruiter and then unlocks a CV download. A separate **admin whitelist** grants the owner (and any future admins) elevated rights and bypasses the work-email gate.

Design language: cool, glassy, near-monochrome with a single signature accent — **"candy" blue `#b2d5e5`** on an **onyx `#020202`** / soft-ice `#e9f1f5` base. Light and dark themes. Everything animates on scroll. The aesthetic tagline is "Turning ideas into digital realities."

The project is intentionally comment-free across every source file (a deliberate house style — see Section 23).

---

## 2. Tech stack (exact versions)

**Runtime / framework**
- **Next.js `16.2.9`** — App Router, Turbopack dev server, React Server Components by default. NOTE: this is a breaking-change-heavy Next major; conventions differ from Next 13–15 (see `AGENTS.md`).
- **React `19.2.4`** / **react-dom `19.2.4`**.
- **TypeScript `^5`**, `"strict": true`, `moduleResolution: "bundler"`, path alias `@/* → ./src/*`.
- **Node 22** in CI; Node ≥20 locally.

**Styling**
- **Tailwind CSS v4** (`tailwindcss@^4`, `@tailwindcss/postcss@^4`) — used via `@import "tailwindcss"` and the new `@theme inline` / `@variant` CSS-first configuration (no `tailwind.config.js`). The vast majority of styling is hand-written CSS in `globals.css` and a few component CSS files; Tailwind is present mostly for its reset + token bridge.
- Font: **Onest** via `next/font/google` (weights 400–900), exposed as CSS var `--font-onest`.

**Animation / scroll**
- **framer-motion `^12.40.0`** — entrance/scroll animations, `AnimatePresence`, `useScroll`/`useTransform`/`useSpring`.
- **lenis `^1.3.23`** — smooth wheel scrolling (touch left native).

**Auth / data / email**
- **better-auth `^1.6.20`** — email-OTP plugin, Prisma adapter, `nextCookies` plugin, Next.js catch-all handler.
- **prisma `^7.8.0`** + **@prisma/client `^7.8.0`** + **@prisma/adapter-neon `^7.8.0`** + **@neondatabase/serverless `^1.1.0`** — Prisma 7 (breaking: no `url` in `schema.prisma`; driver-adapter required; `prisma.config.ts` replaces config in schema).
- **Neon Postgres** — serverless Postgres (EU-West-2 in production).
- **resend `^6.14.0`** — transactional email (the OTP code).

**UI helpers**
- **react-hot-toast `^2.6.0`** — all user-facing error/success feedback.
- **simple-icons `^16.24.0`** — MIT monochrome brand SVG paths (Accenture, GE) rendered with `currentColor`.

**Tooling / test**
- **jest `^30`** + `jest-environment-jsdom` + Testing Library (`@testing-library/react|dom|jest-dom|user-event`), `next/jest`.
- **eslint `^9`** + `eslint-config-next@16.2.9` (flat config).
- **prettier `^3.8.4`** (printWidth 100, double quotes, trailing commas all, semicolons).
- **tsx `^4`** (seed runner), **ts-node**, **dotenv `^17`**.

The Appendix `package.json` is the authoritative version list. `package-lock.json` is omitted here (15k lines, regenerable via `npm install`).

---

## 3. External services & accounts required

| Service | Why | What to create |
|---|---|---|
| **Neon Postgres** | Primary DB (auth, whitelist, recruiter profiles, consent logs) | A project + database; grab **pooled** (`DATABASE_URL`) and **direct** (`DIRECT_URL`) connection strings |
| **Resend** | Sends the OTP email | API key + a **verified sender domain**; set `RESEND_FROM` to a verified sender |
| **Vercel** | Hosting + CI deploy target | Import the GitHub repo; set env vars; optionally attach a custom domain |
| **GitHub** | Source + Actions CI | Repo `Mokhatla-Sifiso/the-foundry`; Actions runs type-check/lint/test/build |
| **Custom domain** (optional, v1) | Canonical URLs | Buy + attach in Vercel; set `NEXT_PUBLIC_SITE_URL` |

If `RESEND_API_KEY` is missing in **non-production**, the OTP is logged to the server console instead of emailed (a dev convenience — see `src/lib/auth/email.ts`).

---

## 4. Environment variables

All secrets live in `.env.local` (gitignored). `.env.example` is the committed template (Appendix). Priority for the canonical URL is implemented in `src/lib/site-url.ts`.

| Var | Required | Purpose / format |
|---|---|---|
| `DATABASE_URL` | Yes (runtime) | Neon **pooled** connection string. Used by the app's Prisma client (`src/lib/db.ts`) and seed. |
| `DIRECT_URL` | Yes (migrations) | Neon **direct** connection string. Used by `prisma.config.ts` for migrate/seed via the CLI. |
| `BETTER_AUTH_SECRET` | Yes | `openssl rand -base64 32`. Falls back to an insecure dev default if unset. |
| `BETTER_AUTH_URL` | Yes (prod) | Public base URL the auth server trusts (e.g. `http://localhost:3000` in dev, the domain in prod). |
| `RESEND_API_KEY` | Yes (prod) | Resend API key. If absent in dev, OTP prints to console. |
| `RESEND_FROM` | Yes (prod) | Verified sender, e.g. `Mzwakhe Mokhatla <noreply@your-domain>`. |
| `NEXT_PUBLIC_SITE_URL` | Optional | Canonical origin once a custom domain is attached (e.g. `https://mzwakhe.dev`). Highest priority in `site-url.ts`. |
| `NEXT_PUBLIC_AUTH_URL` | Optional | Base URL for the BetterAuth **client** (`src/lib/auth/client.ts`); defaults to `/`. |

**`site-url.ts` resolution order** (no trailing slash): `NEXT_PUBLIC_SITE_URL` → `https://$VERCEL_PROJECT_PRODUCTION_URL` → `https://$VERCEL_URL` → `http://localhost:3000`.

---

## 5. Project structure (annotated)

Root:
```
the-foundry/
├─ .github/workflows/ci.yml        # GitHub Actions: type-check · lint · test · build
├─ .env.example                    # env template (values placeholder)
├─ .gitignore .prettierignore .prettierrc.json
├─ AGENTS.md  CLAUDE.md            # AI-agent guardrails (CLAUDE.md just imports AGENTS.md)
├─ README.md                       # setup + launch checklist
├─ eslint.config.mjs  next.config.ts  postcss.config.mjs
├─ jest.config.ts  jest.setup.ts   # test config + jsdom shims
├─ next-env.d.ts  tsconfig.json  package.json
├─ prisma.config.ts                # Prisma 7 config (schema path, datasource, seed)
├─ prisma/
│  ├─ schema.prisma                # data model (7 models/enums)
│  └─ seed.ts                      # seeds the founding admin into admin_whitelist
├─ public/
│  ├─ cv/Mzwakhe_Sifiso_Mokhatla_CV.pdf   # [BINARY] the downloadable CV (~117 KB)
│  └─ img/Potrait.png              # [BINARY] hero portrait (~3 MB) — note the filename spelling "Potrait"
├─ __mocks__/                      # jest manual mocks
│  ├─ framer-motion.tsx            # strips motion props so components render in jsdom
│  └─ lenis.ts                     # no-op Lenis
└─ src/
   ├─ app/                         # App Router
   │  ├─ layout.tsx                # root document, metadata, JSON-LD, providers, loader
   │  ├─ page.tsx                  # the home page (section composition)
   │  ├─ error.tsx                 # global error boundary (client)
   │  ├─ globals.css               # design system + all page styling (2072 lines)
   │  ├─ favicon.ico               # [BINARY]
   │  ├─ robots.ts  sitemap.ts     # SEO route handlers
   │  ├─ legal/{privacy,cookies,terms}/page.tsx   # legal pages
   │  ├─ recruiter/page.tsx        # recruiter state machine (client)
   │  ├─ recruiter/recruiter.css   # recruiter UI styling
   │  └─ api/                      # route handlers (see Section 18/19)
   │     ├─ auth/[...all]/route.ts
   │     ├─ admin/whitelist/route.ts
   │     ├─ privacy/consent/route.ts
   │     └─ recruiter/{session,signout,screen,account,data,
   │                    signup/start,signup/verify,
   │                    signin/start,signin/verify}/route.ts
   ├─ components/
   │  ├─ Loader.tsx  ThemeScript.tsx
   │  ├─ nav/{Nav,Menu,NavMenu}.tsx
   │  ├─ primitives/{Reveal,SmoothScroll,StackScaleEffect,Progress,Toaster,icons}.tsx
   │  ├─ sections/{Hero,Statement,Services,Work,LogoBar,WorkVisual,
   │  │            Experience,TransContinental,AISection,Contact,Footer}.tsx
   │  ├─ devices/{Laptop,PhoneDevice,TabletDevice,WatchDevice,index}.tsx
   │  ├─ legal/{LegalLayout.tsx, legal.css}
   │  ├─ privacy/{ConsentProvider,ConsentBanner}.tsx + consent.css
   │  └─ recruiter/{Gate,SignUp,SignIn,Otp,Screening,Approved,Field,Dots,Howto,TopBar}.tsx
   ├─ hooks/{useInView,useTheme}.ts
   ├─ lib/
   │  ├─ site-url.ts constants.ts colors.ts db.ts api.ts recruiter.ts lenis-bus.ts
   │  ├─ auth/{server,client,admin,email,profile,validation}.ts
   │  └─ privacy/{policy,cookies,consent,log}.ts
   └─ __tests__/…                  # 22 suites / 102 tests mirroring src structure
```

**Binary assets to supply:**
- `public/img/Potrait.png` — portrait, rendered `object-fit: cover` in a rounded frame; used as OG/Twitter image and apple-touch icon (so ideally ≥1200×630 usable). Filename is literally `Potrait.png` (historical typo, referenced as `SITE.portrait`).
- `public/cv/Mzwakhe_Sifiso_Mokhatla_CV.pdf` — the CV the recruiter flow ultimately offers.
- `src/app/favicon.ico` — site favicon.

---

## 6. Bootstrapping the scaffold

There is **no** `tailwind.config.js` (Tailwind v4 is CSS-configured). `next.config.ts` is empty (`{}`). The essential non-obvious scaffold facts:

- **`package.json` scripts**: `dev: next dev`, `build: prisma generate && next build`, `postinstall: prisma generate`, `start: next start`, `lint: eslint`, `test: jest`, `test:coverage: jest --coverage`, `typecheck: tsc --noEmit`, `format`/`format:check` via Prettier over `src/**/*.{ts,tsx,css}`, `__mocks__`, `prisma/*.ts`, and root `*.{ts,tsx,json,md}`.
- **`tsconfig.json`**: target ES2017; libs dom/dom.iterable/esnext; `strict`, `noEmit`, `esModuleInterop`, `module: esnext`, `moduleResolution: bundler`, `resolveJsonModule`, `isolatedModules`, `jsx: react-jsx`, Next TS plugin, `paths: {"@/*": ["./src/*"]}`.
- **`postcss.config.mjs`**: single plugin `@tailwindcss/postcss`.
- **`eslint.config.mjs`**: flat config composing `eslint-config-next` (core-web-vitals + typescript) and `globalIgnores([".next/**","out/**","build/**","next-env.d.ts","coverage/**"])`.
- **`.prettierrc.json`**: `semi:true, singleQuote:false, trailingComma:"all", printWidth:100, tabWidth:2, useTabs:false, bracketSpacing:true, arrowParens:"always", endOfLine:"lf"`.

---

## 7. Data model (Prisma) — the exact schema

`generator client` outputs to `../node_modules/.prisma/client`, `provider = "prisma-client-js"`. `datasource db { provider = "postgresql" }` — **no `url`** (Prisma 7; the URL is injected at runtime via the Neon driver adapter in `src/lib/db.ts`, and for CLI via `prisma.config.ts`).

Models (all `@@map`-ed to snake_case tables):

- **User** → `user`. `id String @id` (BetterAuth-supplied), `email @unique`, `name @default("")`, `emailVerified Boolean @default(false)`, `image String?`, `createdAt/updatedAt`. GDPR fields: `acceptedTermsAt/acceptedPrivacyAt DateTime?`, `acceptedTermsVer/acceptedPrivacyVer String?`. Relations: `sessions Session[]`, `accounts Account[]`, `recruiterProfile RecruiterProfile?`, `consentLogs ConsentLog[]`.
- **Session** → `session`. `id`, `userId`, `token @unique`, `expiresAt`, `ipAddress?`, `userAgent?`, timestamps, `user` relation `onDelete: Cascade`.
- **Account** → `account`. BetterAuth credential/OAuth account rows: `accountId`, `providerId`, token fields, `password?`, timestamps, cascade.
- **Verification** → `verification`. `identifier`, `value`, `expiresAt`, timestamps. (Holds the hashed OTP.)
- **AdminWhitelist** → `admin_whitelist`. `id @default(cuid())`, `email @unique`, `name`, `addedBy String?`, `createdAt`. **This is the allowlist — separate from `User`.** Membership = admin.
- **RecruiterProfile** → `recruiter_profile`. `id cuid`, `userId @unique`, `company`, `role`, `url`, `decision ScreenDecision @default(pending)`, `reason String?`, `verifiedAt DateTime?`, timestamps, cascade.
- **ConsentLog** → `consent_log`. `id cuid`, `userId String?`, `clientId String?`, `action ConsentAction`, `payload Json`, `policyVer`, `ipAddress?`, `userAgent?`, `createdAt`. Indexes on `userId` and `clientId`. `user` relation optional cascade.

Enums: `ScreenDecision { pending, approve, reject }` → `screen_decision`; `ConsentAction { grant, withdraw, update, accept_terms, accept_privacy }` → `consent_action`.

Seed (`prisma/seed.ts`, run via `tsx`): upserts one founding admin into `admin_whitelist` — `{ email: "mokhatla.mzwakhe@gmail.com", name: "Mzwakhe Mokhatla" }`.

---

## 8. The design system

Defined at the top of `src/app/globals.css`. **Everything themes off CSS custom properties** switched by `html[data-theme="light"|"dark"]`.

**Global tokens (`:root`)**
- `--onyx: #020202`, `--candy: #b2d5e5` (the one accent), `--font: var(--font-onest), "Onest", system-ui, sans-serif`, `--ease: cubic-bezier(0.22, 1, 0.36, 1)`, `--r: 30px` (base radius).

**Reset & base**: universal `box-sizing:border-box; margin:0; padding:0`; `html { scroll-behavior: smooth }`; `body` uses `--bg` + `--bg-grad` (fixed attachment), `--fg`, font 18px/1.5, antialiased, `overflow-x: clip`, with a 0.6s eased color/background transition (theme cross-fade). `::selection` uses `--candy`. `.wrap` is the content container: `width: min(1320px, 100% - 44px); margin-inline:auto`.

**Light theme** (`html[data-theme="light"]`): `--bg:#e9f1f5`, `--bg-grad` a vertical ice gradient (`#eef5f8→#e4f0f5→#d6e9f1`), `--fg:#06090b`, `--muted:#7c8a91`, `--line: rgba(2,8,12,.1)`, buttons dark-on-light (`--btn:#07090a`, `--btn-fg:#eef5f8`), glass tokens (`--glass-bg/--glass-line`), and a full **card palette** (`--card`, `--card-soft`, `--card-fg`, `--card-pill`, `--card-line`, `--glow`) used by the dark "service/work" cards that sit on the light page.

**Dark theme** (`html[data-theme="dark"]`): `--bg:#020202` with a candy radial glow top-right, `--fg:#eef5f8`, inverted buttons (`--btn: var(--candy)`), and dark-tuned card/glass/glow tokens.

**Tailwind bridge**: `@theme inline { --color-bg: var(--bg); … --color-candy: var(--candy); --font-sans: var(--font-onest) }` exposes the CSS vars to Tailwind utilities. `@variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))` makes Tailwind's `dark:` follow the `data-theme` attribute (not the OS preference), so the manual toggle drives everything.

**Loader**: a full-screen `#loader` (fixed, z-9999, onyx bg) with a spinning `.ld-ring`, the `mzwakhe.` wordmark, and "Loading experience". `Loader.tsx` adds `.hide` after 600 ms and removes the node after 1400 ms.

**Key structural classes** (defined further down `globals.css`, in the Appendix): `.sec` (section rhythm), `.eyebrow`, `.statement`, `.em` (candy-accented span), `.mut` (muted span), `.hero*`, `.svc-card`/`.stack` (Services), `.work-*`/`.work-visual`, `.logo-bar*`, `.xp-*` (Experience), `.trans-*` (map), `.ai*`/device mocks, `.contact-*`, `.foot-*`, `.progress` (scroll bar), `.nav`/`.pill*`/`.menu*`, plus responsive `@media` blocks at 880/860/720/560/480 px.

---

## 9. App architecture & routing

App Router, RSC-by-default. Client components are explicitly `"use client"` (all animated/interactive ones).

**Route map**
- `/` → `app/page.tsx` (home). Public.
- `/recruiter` → `app/recruiter/page.tsx` (client state machine). Public entry, gated content.
- `/legal/privacy`, `/legal/cookies`, `/legal/terms` → static legal pages via `LegalLayout`.
- `/sitemap.xml` → `app/sitemap.ts`; `/robots.txt` → `app/robots.ts`.
- **API** (`app/api/**/route.ts`): `auth/[...all]` (BetterAuth catch-all GET/POST), `admin/whitelist` (GET/POST, admin-only), `privacy/consent` (POST), and the recruiter set: `session` (GET), `signout` (POST), `screen` (POST), `account` (DELETE), `data` (GET export), `signup/start` & `signup/verify` (POST), `signin/start` & `signin/verify` (POST).

`robots.ts` disallows `/api/` and `/recruiter` (personal/stateful, no SEO value); allows everything else; points to the sitemap.

---

## 10. Root layout & document head (`app/layout.tsx`)

- Loads **Onest** (`next/font/google`, weights 400–900, `display:swap`, `variable:"--font-onest"`), applied as `className={onest.variable}` on `<html>`.
- **Full metadata** (`export const metadata`): `metadataBase` from `SITE_URL`; title default `"Mzwakhe Mokhatla, Software Engineer"` with template `%s · Mzwakhe Mokhatla`; a long SEO description; a `keywords` array; `authors/creator/publisher/applicationName`; `category:"technology"`; `alternates.canonical:"/"`; **OpenGraph** (type website, `en_ZA`, portrait 1200×630) and **Twitter** (`summary_large_image`); `robots` (index/follow + googleBot `max-image-preview:large`, `max-snippet:-1`); `icons.apple: SITE.portrait`.
- **Viewport** (`export const viewport`): `themeColor` per color scheme (`#e9f1f5` light / `#020202` dark), `width:device-width`, `initialScale:1`.
- **`StructuredData()`** injects two JSON-LD `<script type="application/ld+json">` blocks: a **Person** (name, url, image, email, telephone, jobTitle, description, PostalAddress Pretoria/South Africa, `worksFor` MTN + Accenture, `knowsAbout` skill list) and a **WebSite**.
- **`RootLayout`** renders `<html lang="en" className={onest.variable} suppressHydrationWarning>` → `<head>` with `<ThemeScript />` + `<StructuredData />` → `<body>` with the `#loader` markup, `<Loader />`, `<ConsentProvider>{children}<ConsentBanner /></ConsentProvider>`, and `<Toaster />`.
- **`suppressHydrationWarning` on `<html>` is load-bearing** (see Section 11): the pre-hydration `ThemeScript` sets `data-theme` on `<html>`, which React's SSR output doesn't contain; without the suppress, React throws a hydration mismatch that cascades into an `insertBefore` NotFoundError.

---

## 11. Theming system (anti-flash + no hydration mismatch)

Three moving parts:

1. **`components/ThemeScript.tsx`** — renders an inline `<script>` that runs **before** hydration:
   ```js
   (()=>{try{var t=localStorage.getItem('studio-theme')||'light';
   document.documentElement.setAttribute('data-theme',t);}
   catch(e){document.documentElement.setAttribute('data-theme','light');}})()
   ```
   This paints the correct theme immediately (no flash of wrong theme).
2. **`hooks/useTheme.ts`** — React state mirror. Initial state `"light"`; on mount reads `localStorage('studio-theme')` and adopts it if not light; an effect writes `data-theme` to `<html>` and persists to localStorage on every change. Exposes `{ theme, toggle, setTheme }`. `toggle` flips light↔dark.
3. **`suppressHydrationWarning`** on `<html>` in `layout.tsx` — because the attribute set by step 1 is intentionally not in the server HTML.

The theme toggle lives in `Nav` and `Menu`. Persistence key is `studio-theme` (a **functional** cookie/storage item per the cookie inventory).

---

## 12. Smooth scroll & scroll primitives

- **`SmoothScroll`** (`primitives/SmoothScroll.tsx`) wraps the whole home page. Instantiates `new Lenis({ lerp: 0.1, smoothWheel: true })` (touch scrolling left native by not enabling `smoothTouch`). A `requestAnimationFrame` loop calls `lenis.raf(time)` and emits the current scroll value on **`lenisBus`** each frame. **Disabled entirely under `prefers-reduced-motion: reduce`.** Cleans up rAF + `lenis.destroy()` on unmount.
- **`lib/lenis-bus.ts`** — a tiny pub/sub (`emit(scroll)`, `on(fn) → unsubscribe`) decoupling Lenis from consumers. (Historically fed the stacking effect; the current `StackScaleEffect` reads `window.scrollY` directly and no longer subscribes — see Section 14.)
- **`Progress`** (`primitives/Progress.tsx`) — a top scroll-progress bar. `useScroll().scrollYProgress` → `useSpring(…, { stiffness:130, damping:28, mass:0.3 })` → `scaleX` on `.progress`.
- **`Reveal`** (`primitives/Reveal.tsx`) — the universal scroll-in wrapper. Exports **`EASE = [0.22, 1, 0.36, 1]`** (the site-wide easing). Renders a `motion[as]` element (`as` defaults `div`), `initial={opacity:0, y}` (default `y=38`), animates to `{opacity:1,y:0}` when seen, `transition {duration:0.8, delay, ease:EASE}`. Visibility via **`useInView`**.
- **`hooks/useInView.ts`** — no IntersectionObserver; a scroll/resize listener computes `getBoundingClientRect()` and marks `seen` once `rect.top < viewportHeight * (1 - margin) && rect.bottom > 0` (default `margin=0.16`). It is **one-shot** (unbinds after first reveal) and has a **1500 ms failsafe** that force-reveals (so content never gets stuck hidden). Returns `[ref, seen]`.

---

## 13. The home page — section by section

`app/page.tsx` composition, in order, all inside `<SmoothScroll>`:
```
<Progress/> <NavMenu/>
<main>
  <Hero/> <Statement/> <Services/> <Work/> <Experience/>
  <TransContinental/> <AISection/> <Contact/>
</main>
<Footer/>
```

**Content data lives in `src/lib/constants.ts`** (all verbatim in Appendix), notably:
- `SITE` — name, email `mokhatla.mzwakhe@gmail.com`, phone `067 980 1166` / `tel:+27679801166`, location "Pretoria, South Africa", tagline, `cvHref:"/cv/Mzwakhe_Sifiso_Mokhatla_CV.pdf"`, `portrait:"/img/Potrait.png"`.
- `NAVLINKS` — 01 Work `#work`, 02 Services `#services`, 03 AI Workflow `#ai`, 04 Experience `#experience`, 05 Contact `#contact`.
- `SERVICES` (4) — Frontend Engineering / Full-Stack & Cloud / Technical Leadership / Platform & DevOps, each with `pills[]` and a description `d`.
- `WORK` (4) — StudioSync (MTN, slot `work-studiosync`), Bayobab Client Portal (Accenture·MTN, `work-bayobab`), e-Teller (Nybble·NMB Bank Tanzania, `work-eteller`), GE Smallworld GIS (IST, `work-gis`).
- `XP` (4 rows) — MTN Tech Lead (now), Accenture Product/Platform (now), Nybble Frontend, IST Junior.
- `AIITEMS` (4) — AI pair-programming, Rapid prototyping, Tests & documentation, Review & research (each with `tools[]`).
- `ASSISTANT_NAME = "Clerk"`, `PEAK_COLOR = "#020202"`.

### Hero (`sections/Hero.tsx`) — parallax
Client component. `useScroll({ target: heroRef, offset: ["start start","end start"] })` drives three `useTransform`s over scroll progress 0→1:
- `yRender = [0, -40]` — the portrait drifts up.
- `yMark = [0, 80]` — the giant "mzwakhe" wordmark drifts down (parallax split).
- `cueFade = [0,0.7] → [1,0]` — the "Scroll" cue fades out over the first 70% of the hero.

Entrance: wordmark `opacity 0→1, scale 1.04→1` (1.1 s); portrait `opacity 0→1, y 60→0` (1 s, delay 0.25 s) inside `.hero-render-wrap` with a `next/image` `fill priority` (sizes `(min-width:1280px) 620px, (min-width:768px) 40vw, 64vw`, `object-fit:cover`, radius 26) and a `.glowpad`; H1 "Turning ideas into **digital realities.**" fades up (delay 0.5 s); the scroll cue has a pulsing dot (`scale [1,0.5,1]`, infinite 1.6 s).

### Statement (`sections/Statement.tsx`)
`#about`. Eyebrow "About" + a large statement: "I'm a full-stack engineer focused on turning your vision into **production-ready** *software*." (`.em` candy, `.mut` muted).

### Services (`sections/Services.tsx`) + StackScaleEffect
`#services`. Header eyebrow + statement ("What I do: front-end-focused, **full-stack capable.**"). Then a `.stack` of `.svc-card` articles built from `SERVICES`. Each card: inline style `{ zIndex: i+1, "--i": i, marginTop: i>0 ? "12vh" : undefined }`, a `NN / 04` counter, an `<h3>` with two lines (`w1`/`w2`), the pills, and a description with a `✳` asterisk. A trailing `.stack-spacer`. The stacking/scale behavior is the **StackScaleEffect** (Section 14). This is the marquee interaction and its correctness (no jitter) was hard-won.

### Work (`sections/Work.tsx`) + LogoBar + WorkVisual
`#work`. Heading "A track record of turning ideas into **digital realities.**" + lede. Then **`LogoBar`** and a `.work-grid` of 4 cards from `WORK`. Each card: `motion.div` with `whileHover={{ y: -6 }}`, an `.image-slot[data-slot]` containing **`<WorkVisual slot={w.slot} />`** (Section 16), and an overlay with tag/name/org.

**LogoBar** (`sections/LogoBar.tsx`): "Trusted across" + a `.logo-bar` list of 7 brands. Two render kinds: `icon` (an inline `<svg>` using a `simple-icons` path with `fill="currentColor"` — Accenture `siAccenture.path`, GE `siGeneralelectric.path`) and `text` (a typographic wordmark — MTN Group, NMB Bank, Bayobab, Nybble, IST). Dimmed via `opacity:0.5`, brightening on hover; theme-aware through `currentColor`.

### Experience (`sections/Experience.tsx`)
`#experience`. "Five years building **at scale.**" + an `.xp-list` from `XP`; rows with `now` show a candy `●` marker.

### TransContinental (`sections/TransContinental.tsx`) — the interactive map
See Section 15 for the full math. `#transcontinental`. A hand-drawn SVG map of five work locations across South Africa + Tanzania, with a chronological "journey" arc, tappable pins + chips, and a side panel that updates to the active location.

### AISection (`sections/AISection.tsx`) — peak + device mocks
`#ai`. Props `{ showPhone=true, showDesktop=true, threshold=0.25 }`. An **IntersectionObserver** (thresholds `[0, t/2, t, t*1.5, 1]` filtered ≤1) sets `peakActive = ratio ≥ threshold`, toggling the `ai--peak` class that transitions the section toward `PEAK_COLOR` (`#020202`) as it dominates the viewport. Content: eyebrow, "AI is part of **how I build.**", lede, an `.ai-showcase` with device mockups (`Laptop`, `PhoneDevice`, `WatchDevice`, `TabletDevice` from `components/devices`, each wrapped in `Reveal`) and floating `.dev-label`s, then an `.ai-grid` of the 4 `AIITEMS` (numbered, title, desc, tool chips). `showPhone`/`showDesktop` allow responsive hiding of heavy mockups on small screens.

### Contact (`sections/Contact.tsx`)
`#contact`. A `.contact-card` (with a `.blob`), eyebrow "Contact · Available 2026", big "Don't be **shy.**", two CTAs — "Start a conversation" (`mailto:`) and "Download CV" (→ `/recruiter`) — and a `.c-meta` block (email/phone/located).

### Footer (`sections/Footer.tsx`)
Big wordmark, subtitle, a links bar (Email/Phone/Work), a "Go up" button (`scrollTo top smooth`), and legal links (Privacy/Cookies/Terms) plus a **"Cookie preferences"** button that calls `useConsent().reopen()` to re-open the consent banner.

### Nav & Menu
`NavMenu` holds open state and renders `Nav` + `Menu`. **`Nav`**: brand, a **theme toggle** (`useTheme`, Moon/Sun icon), a "Let's talk" pill (→ `#contact`), and a "Menu" pill (opens the overlay). Entrance via framer-motion. **`Menu`**: a full-screen overlay animated with `clipPath: inset(0 0 100%/0% 0)`; locks body scroll and closes on `Escape`; staggered `NAVLINKS`; a footer with Download CV, email, phone, and a theme-mode toggle.

---

## 14. The Services stacking calculation (StackScaleEffect) — full algorithm

This is the site's signature interaction and the source of a long jitter saga; the final architecture is deliberately simple and **jitter-proof by construction**.

**CSS side (in `globals.css`):**
```css
.svc-card {
  position: sticky;
  top: calc(80px + var(--i, 0) * 48px);
  transform-origin: top center;
  /* …visual styling… */
}
```
Position is handled **entirely by native CSS `position: sticky`** — the browser pins each card on the compositor thread at a per-index offset (`--i` set inline). Because the compositor owns pinning, a card **can never lag the scroll** — that lag was the historical jitter.

**JS side (`primitives/StackScaleEffect.tsx`)** — writes **only `scale()`**, never position. Constants:
```
BASE_TOP = 80    STEP = 48    SCALE_PER_LAYER = 0.05    SCALE_RANGE = 320
```
Algorithm:
1. `cards = [...document.querySelectorAll(".svc-card")]`; bail if `< 2`.
2. `absTop(el)` = document-absolute layout top: sum `offsetTop` up the `offsetParent` chain. (Uses layout position, **unaffected by sticky pinning**, so dock points stay valid even while pinned.)
3. `measure()`: `dock[i] = absTop(cards[i]) − (BASE_TOP + i*STEP)` — the exact `window.scrollY` at which card *i* reaches its sticky top.
4. `apply()`: let `y = window.scrollY`. For each card *i*, accumulate a `reduction` over **later** cards *j > i*:
   - `remaining = dock[j] − y`.
   - if `remaining ≤ 0` (card *j* has fully docked): `reduction += 0.05`.
   - else if `remaining < 320`: `reduction += 0.05 * (1 − remaining/320)` (ramp in as *j* approaches).
   - Then `cards[i].style.transform = reduction > 0 ? scale(1 − reduction) : ""` (4-dp).
   Net effect: as later cards dock on top, each earlier card shrinks ~5% per layer, producing a stacked-depth cue (≈ 0.9 / 0.95 / 1.0 scales).
5. Scroll handling is `requestAnimationFrame`-coalesced (one pending frame max). `resize` re-runs `measure()` + `apply()` (heights are vh-based). Cleanup cancels rAF, unbinds, and clears transforms.

**Why it can't jitter:** `scale()` is anchored at `transform-origin: top center`, so even a scale value a frame behind the scroll keeps the pinned **top edge** fixed — position and scale are fully decoupled. All previous jitter came from JS *positioning* cards against a scroll value that diverged from the browser's real scroll (especially on mobile, where Lenis leaves touch scrolling native). The fix was to stop positioning in JS at all.

---

## 15. TransContinental — the map projection & journey math

**Canvas:** SVG `viewBox="0 0 800 500"` (`VB_W=800, VB_H=500`). A rectangular equirectangular-ish projection over a hand-tuned bounding box:
```
LAT_TOP = -4    LAT_BOTTOM = -32    LNG_LEFT = 17    LNG_RIGHT = 43
project(lat, lng):
  x = ((lng - 17) / (43 - 17)) * 800
  y = ((-4 - lat) / (-4 - (-32))) * 500      // = ((-4 - lat) / 28) * 500
```
(A slightly compressed box so the South-African cluster stays legible next to Tanzania.)

**Locations** (`LOCATIONS`, chronological `order`), each `{lat, lng, offsetX?, offsetY?, labelAnchor?}`; the pixel `offset*` nudges resolve the Gauteng cluster so pins don't overlap:
1. Pretoria (IST, Junior Software Developer, Jan 2021–Dec 2022) — lat −25.73, lng 28.19, offset (+70, −110), label start.
2. Bryanston (Nybble, Frontend Engineer, Dec 2022–Jun 2023) — −26.05, 28.03, offset (−90, −30), label end.
3. Dar es Salaam (Nybble · NMB Bank, e-Teller, Dec 2022–Jun 2023) — −6.79, 39.21, offset (−30, 0), label end.
4. Roodepoort (MTN Group, Software Engineer · Tech Lead, Mar 2024–Present) — −26.17, 27.87, offset (−90, +70), label end.
5. Waterfall (Accenture, Product & Platform Engineer, Mar 2024–Present) — −25.99, 28.13, offset (+70, +30), label start.

**Rendered point:** `{ x: project(lat,lng).x + (offsetX??0), y: project(lat,lng).y + (offsetY??0) }`.

**Background:** a dotted-grid `<pattern>` (22×22, `currentColor` dots at 0.18 opacity) fills the canvas; an abstract hand-authored `COAST_PATH` silhouette (a fixed sequence of quadratic curves, not a real map) sits at low opacity with a dashed stroke; a `radialGradient` glow (`#trans-glow`) is used by pin halos.

**Journey arc:** `ordered = [...points].sort(order)`. The path is built as: `M x0 y0`, then for each subsequent point a quadratic `Q cx cy x y` where `cx = (prev.x + p.x)/2` and `cy = min(prev.y, p.y) − 50` (control point lifted 50 px above the higher endpoint → each hop arcs upward). Stroke is candy.

**Draw-on reveal:** `pathRef.getTotalLength()` (guarded — JSDOM lacks it) sets `pathLen`; the path renders with `strokeDasharray = pathLen`, `strokeDashoffset = pathLen`, and an inline style animating `strokeDashoffset` to `0` over `1.8s ease 0.3s` — the line draws itself once on mount.

**Pins & interaction:** each location is a `<g transform="translate(x,y)">` with `.trans-pin` (halo circle r22 using `#trans-glow`, ring r10, dot r5, and a `<text>` label anchored per `labelAnchor`). `role="button"`, `tabIndex=0`, `aria-pressed`, click and Enter/Space set `activeId`. Below the map, a `.trans-chips` list mirrors the pins as buttons. An `aside.trans-panel` (`aria-live="polite"`) shows the active location's city/country/org/role/dates.

**Critical CSS invariant (documented in `globals.css`):** *never* put a CSS `transform` on `.trans-pin` itself. Each pin group is positioned via its SVG `transform="translate(x,y)"` **attribute**; a CSS `transform` **property** overrides that attribute entirely, snapping the pin to the SVG origin (0,0). A former `.trans-pin:hover { transform: translate(var(--tx),var(--ty)) }` rule with undefined vars caused a hover→snap→unhover→snap jitter loop; it was removed. Hover feedback lives only on the inner halo/dot.

---

## 16. WorkVisual — the four abstract card illustrations

`sections/WorkVisual.tsx` maps a `slot` string to one of four hand-built abstract SVG scenes (600×412, `preserveAspectRatio="xMidYMid slice"`, `.work-visual`, `aria-hidden`). Shared palette constants: `BG_LIGHT = var(--card-soft,#2f3236)`, `BG_DARK = #0c1316`, `FG_TINT/FG_LINE/FG_TEXT` (white at low alpha), `ACCENT = var(--candy,#b2d5e5)`. The four scenes:
- `work-studiosync` → **PlatformVisual**: dashboard with sidebar rail, KPI cards, a sparkline polyline + dots, status pills.
- `work-bayobab` → **PortalVisual**: browser chrome, headline + form fields + a candy CTA, sidebar mini-cards.
- `work-eteller` → **FintechVisual**: a rotated virtual payment card (chip, digit rows, labels) + a transaction list panel.
- `work-gis` → **GisVisual**: a map grid with contour curves, pre-computed nodes + edges, and a mini scale bar.
`default` → PlatformVisual. Pure geometry; no real product UI is depicted. They pick up `--card-*`/`--candy` so they stay on-theme in both modes.

---

## 17. Recruiter auth system

The most substantial subsystem: a passwordless, email-OTP recruiter access flow with a separate admin allowlist, backed by BetterAuth + Prisma + Neon + Resend. **Design philosophy:** no failure crashes the page — every non-200 becomes a toast (`lib/api.ts`), and the UI degrades gracefully.

### 17.1 Server auth config (`lib/auth/server.ts`)
`betterAuth({ … })`:
- `appName: "Mzwakhe Mokhatla, Recruiter Access"`, `baseURL: BETTER_AUTH_URL ?? http://localhost:3000`, `secret` (env or insecure dev default).
- `database: prismaAdapter(db, { provider: "postgresql" })`.
- `emailAndPassword: { enabled: false }` (OTP only).
- `user.additionalFields.name`: `{ type:"string", required:false, input:false }` — **required:false + input:false is deliberate**: making `name` required broke OTP sign-in (the schema default is `""`, filled later from the signup form/whitelist).
- `session`: `expiresIn: 14 days`, `updateAge: 1 day`, `cookieCache: { enabled:true, maxAge: 5 min }`.
- `plugins`: `emailOTP({ otpLength:6, expiresIn: 5 min, allowedAttempts:5, overrideDefaultEmailVerification:true, sendVerificationOTP → sendOtpEmail(email, otp) })`, then `nextCookies()`.
- The Next handler: `app/api/auth/[...all]/route.ts` = `toNextJsHandler(auth.handler)` (exports GET/POST).
- **Client** (`lib/auth/client.ts`): `createAuthClient({ baseURL: NEXT_PUBLIC_AUTH_URL ?? "/", plugins:[emailOTPClient()] })`; re-exports `useSession`, `signOut`.

### 17.2 The client state machine (`app/recruiter/page.tsx`)
`Step = "gate" | "signup" | "signin" | "otp" | "screening" | "approved"`; `Mode = "signup" | "signin"`. Renders `<TopBar/>` + a `.stage` card that cross-fades between step components with framer-motion (`AnimatePresence mode="wait"`, variants enter/center/exit y-slide, `EASE`, 0.45 s). Key state: `step`, `mode`, `signupDraft`, `signinEmail`, `account`, `otpError`, `resumed`.

Flow:
- **On mount** → `GET /api/recruiter/session` (silent). If it returns an `account`, jump straight to `approved` (session resume). Set `resumed=true` (until then, a busy placeholder).
- **Gate** → choose "Request access" (→ signup) or "I already have access" (→ signin).
- **SignUp** (`handleSignUpSubmit`) → `POST /signup/start` with the form; on success toast "Code sent" and go to `otp` (mode signup).
- **SignIn** (`handleSignInSubmit`) → `POST /signin/start` with `{ email }`; on success toast + `otp` (mode signin).
- **Otp** (`handleOtpVerify`) → branch on mode:
  - signup: `POST /signup/verify` with `{ ...signupDraft, otp }` (silent; sets `otpError` on failure); on success set account → `screening`.
  - signin: `POST /signin/verify` with `{ email, otp }`; on success set account → `approved`.
- **Resend** (`handleResend`) re-hits the relevant `/start`.
- **Screening** (`runScreening`) → `POST /screen`; maps the DB `decision` (`reject → "review"`, else `"approve"`) into the UI; `onDone` → `approved`.
- **Approved** shows the account + a Download CV affordance; **Sign out** → `POST /signout`, reset state → `gate`.

### 17.3 Validation (`lib/auth/validation.ts`)
`validateSignup(raw, { isAdmin })` returns `{ok:true, value}` or `{ok:false, error:{field,message}}`. Rules:
- `EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
- **Work-email gate**: if **not** admin and the domain is in `FREE_DOMAINS` (a 23-entry set: gmail, googlemail, yahoo(.co.uk), hotmail(.co.uk), outlook, live, msn, icloud, me, mac, aol, proton.me, protonmail, gmx, mail.com, yandex, zoho, pm.me, hey, ymail), reject with "Please use your work email…". Admins bypass this.
- `name ≥ 2`, `company ≥ 2`, `role ≥ 2`, `url ≥ 4` chars.
- `acceptedTerms === true` **and** `acceptedPrivacy === true` (else `field:"consent"`).
- On success returns a normalized payload (email lower-cased/trimmed).

`lib/recruiter.ts` holds a parallel client-side copy (`FREE` set, `emailRe`, `domainOf`, `isFree`, `genCode`, localStorage helpers `LS_ACCOUNTS`/`LS_SESSION` + `loadAccounts`/`saveAccounts`) — a lightweight client mirror used by the recruiter form components; the **server** validation is the source of truth.

### 17.4 API routes (all under `app/api/recruiter/`)
- **`signup/start` (POST)**: parse email, compute `adminGate = isWhitelisted(email)`, `validateSignup(payload, {isAdmin:adminGate})`; on invalid → 400 `{message, field}`; else `auth.api.sendVerificationOTP({ body:{ email, type:"sign-in" }, headers })` → `{ok:true}`. 500 on error.
- **`signup/verify` (POST)**: require `OTP_RE=/^\d{6}$/`; re-validate; `auth.api.signInEmailOTP({ body:{email,otp}, asResponse:false })` (maps expired/invalid/attempt errors → friendly 401). Then a `db.$transaction([...])`: `user.update` (name, `emailVerified:true`, `acceptedTermsAt/PrivacyAt=now`, `acceptedTermsVer=TERMS_VERSION`, `acceptedPrivacyVer=PRIVACY_POLICY_VERSION`) + `recruiterProfile.upsert` (company/role/url). Then `logConsent` **accept_terms** and **accept_privacy** (Promise.all). Return `{ account: fetchAccount(userId) }`.
- **`signin/start` (POST)**: valid email required; look up `user` **or** `isWhitelisted`; if neither → 404 "No access found… Request access instead."; else `sendVerificationOTP`.
- **`signin/verify` (POST)**: email + OTP regex; `signInEmailOTP`; if admin, sync the user's `name` from the whitelist entry (and `emailVerified:true`); return `{ account }`.
- **`screen` (POST)**: requires session (`getSessionContext`); if a `recruiterProfile` exists, set `decision:"approve"`, `reason` = admin → "Admin allowlist." else "Verified via work email and domain.", `verifiedAt:now`; return `{ account }`.
- **`session` (GET)**: `getSessionContext()`; `{ account: null }` if none, else `{ account: fetchAccount(userId) }`.
- **`signout` (POST)**: `auth.api.signOut({ headers })` → `{ok:true}`.
- **`account` (DELETE)** — DSAR erasure: requires session; **admins are refused** (must be removed from the whitelist first, 403); otherwise `signOut` then `db.user.delete` (cascades sessions/accounts/profile/consent logs) → `{ok:true}`.
- **`data` (GET)** — DSAR export: requires session; builds a JSON `snapshot` (`exportedAt`, `policyVersions`, `identity`, `consent` incl. the full `consentLogs`, `profile`, `sessions`) and returns it as a **downloadable attachment** (`Content-Disposition: attachment; filename="my-data-<id>.json"`, `Cache-Control:no-store`).

### 17.5 Admin whitelist (`app/api/admin/whitelist/route.ts`, `lib/auth/admin.ts`)
- `isWhitelisted(email)` = a row exists in `admin_whitelist` (normalized lower-case).
- `getSessionContext()` = `{ userId, email, name, isAdmin }` from the BetterAuth session (or null).
- `requireAdmin()` throws `HttpError(401)` if unauthenticated, `HttpError(403)` if not admin.
- **GET** (admin-only): list whitelist entries. **POST** (admin-only): upsert `{ email, name, addedBy: ctx.email }` (201). Bad input → `HttpError(400)`.

### 17.6 Account projection (`lib/auth/profile.ts`)
`fetchAccount(userId)` joins `user` + `recruiterProfile` + `adminWhitelist` and returns a `RecruiterAccountDto` `{ name, email, company, role, url, verifiedAt(ms), isAdmin, screen }`. `screen` is the profile's `{decision, reason}`, or for a profile-less admin, `{decision:"approve", reason:"Admin allowlist."}`, else `null`. Admins with no profile get `role:"Admin"`.

### 17.7 OTP email (`lib/auth/email.ts`)
`sendOtpEmail(to, otp)` lazily constructs a Resend client from `RESEND_API_KEY`. If the key is missing: in **non-production** it warns + logs the OTP to console (dev bypass); in production it throws. Subject "Your access code"; a plain-text + inline-HTML body showing the 6-digit code, "expires in 5 minutes". Resend send errors get the same dev-console fallback / prod-throw treatment. `FROM = RESEND_FROM ?? "Mzwakhe Mokhatla <noreply@example.com>"`.

### 17.8 The DB client (`lib/db.ts`)
A **lazy singleton Proxy** over `PrismaClient`. On first property access it constructs `new PrismaClient({ adapter: new PrismaNeon({ connectionString: DATABASE_URL }), log:["warn","error"] })`, stored on `globalThis` (avoids exhausting connections during dev HMR). Throws a clear error if `DATABASE_URL` is unset. The Proxy binds methods to the real client. This lazy pattern also means importing `db` never crashes at build time when env is absent.

---

## 18. Privacy / consent / GDPR system

Enterprise-grade consent + data-subject rights, tuned for GDPR / CCPA / POPIA.

**Policy versions (`lib/privacy/policy.ts`)**: `PRIVACY_POLICY_VERSION = COOKIE_POLICY_VERSION = TERMS_VERSION = "2026-06-23.v1"`; `DATA_CONTROLLER = { name:"Mzwakhe Mokhatla", email, location:"South Africa" }`; `DATA_RETENTION_DAYS = 365`.

**Cookie inventory (`lib/privacy/cookies.ts`)**: `CookieCategory = "necessary" | "functional" | "analytics"`. `COOKIE_INVENTORY` documents each real cookie/storage item: `better-auth.session_token` (necessary, 14d), `better-auth.session_data` (necessary, 5min), `consent` (necessary, 12mo), `studio-theme` (functional, localStorage). `CATEGORY_META` gives label/description/`alwaysOn` per category (necessary alwaysOn); `CATEGORY_ORDER`; `inventoryByCategory()`.

**Consent record (`lib/privacy/consent.ts`)**: the `consent` cookie stores `{ v, ts, choices:{necessary:true, functional, analytics} }`, URI-encoded JSON, `Max-Age = 1 year`. `parseConsent` returns `null` if the version doesn't match the current policy (so a policy bump re-prompts everyone). `serializeConsent` stamps the current version + `Date.now()`. `DEFAULT_REJECTED` (only necessary) / `ACCEPT_ALL`. `isGranted(record, category)` — necessary always true.

**ConsentProvider (`components/privacy/ConsentProvider.tsx`)**: React context. On mount reads + parses the cookie; `resolved` is true only if a valid record exists (else the banner shows). `save(choices, action)` writes the cookie (`SameSite=Lax`, `Secure` on https), updates state, closes the banner, and **fires `POST /api/privacy/consent`** to audit-log the choice. `reopen()/close()` control the "Cookie preferences" re-open path. A `NOOP_CONSENT` fallback keeps `useConsent()` safe outside the provider.

**ConsentBanner (`components/privacy/ConsentBanner.tsx`)**: a `motion.aside role="dialog"` that slides up when `!resolved || open`. Two views: the **summary** (three actions — "Reject non-essential" → `save(DEFAULT_REJECTED,"withdraw")`, "Customise", "Accept all" → `save(ACCEPT_ALL,"grant")`) and the **customise** panel (per-category toggles from `CATEGORY_ORDER`, necessary disabled/always-on, each with an expandable `<details>` listing the actual cookies; "Save preferences" → `save(draft,"update")`). Links to `/legal/cookies` and `/legal/privacy`.

**Consent audit log (`lib/privacy/log.ts`)**: `logConsent({ userId?, action, payload })` writes a `ConsentLog` row with the request IP (`x-forwarded-for` first hop, else `x-real-ip`) and user-agent. For anonymous consent it stores a **SHA-256 hash of `ip|ua` as `clientId`** (pseudonymous, no raw PII tied to the record); for signed-in users it stores `userId` and null clientId. `action ∈ {grant, withdraw, update, accept_terms, accept_privacy}`; `policyVer` stamped.

**`POST /api/privacy/consent`**: validates the action against the allowed set and that `choices` is an object, resolves the (optional) session, and `logConsent`s. Always safe (500 on unexpected error, but never throws to the client UI).

**DSAR** (data-subject access requests): export via `GET /api/recruiter/data` (§17.4), erasure via `DELETE /api/recruiter/account` (§17.4).

**Legal pages** (`app/legal/{privacy,cookies,terms}/page.tsx`) render through `components/legal/LegalLayout.tsx` (+ `legal.css`), presenting the policies, the cookie table (which scrolls horizontally on phones), effective dates from the policy versions, and controller contact. Exact copy is in the Appendix.

---

## 19. SEO & discoverability

- **Metadata** (Section 10): title/description/keywords, canonical, OpenGraph + Twitter cards, robots directives, themeColor.
- **JSON-LD**: Person + WebSite (Section 10) for rich results.
- **`sitemap.ts`**: `/` (priority 1, monthly), `/recruiter` (0.7, monthly), and the three legal pages (0.3, yearly), all off `SITE_URL`.
- **`robots.ts`**: allow `/`, disallow `/api/` + `/recruiter`, declare the sitemap + host.
- **Canonical URL** resolution centralised in `site-url.ts` so sitemap/robots/OG/JSON-LD stay correct across localhost, Vercel previews, Vercel prod, and a custom domain.
- Content is written em-dash-free (a deliberate copy rule) and uses semantic headings, `aria-label`s, and keyboard-navigable interactions throughout.

---

## 20. Error handling & resilience

- **`app/error.tsx`** — a client error boundary: toasts "Something went wrong…", logs the error, and offers a "Try again" (`reset()`).
- **`lib/api.ts` `apiFetch<T>(url, init)`** — the single client fetch wrapper. Returns a discriminated `ApiResult<T>` (`{ok:true,data}` | `{ok:false,error}`), never throws. It JSON-parses safely, and on non-2xx picks a human message (`body.message`/`body.error`, else status-specific copy for 401/403/404/429/5xx) and **`toast.error`s it unless `silent`**. Network failures become a toast too. This is why "no failure crashes the site": UI code just checks `res.ok`.
- **`Toaster`** — react-hot-toast, top-center, dark toasts (`#0a0a0a`/`#fafafa`, hardcoded — using `var(--card)/var(--fg)` previously made text invisible), success/error icon themes, 4.5 s (6 s for errors).
- **Lazy Prisma proxy** (Section 17.8) — importing `db` never crashes without env; it only constructs on first use.
- **Graceful degradations**: reduced-motion disables Lenis; `useInView` has a failsafe reveal; `getTotalLength` is JSDOM-guarded; the recruiter page shows a busy placeholder until session-resume resolves.

---

## 21. Testing

- **`jest.config.ts`** via `next/jest`: `testEnvironment: jsdom`, `coverageProvider: v8`, `setupFilesAfterEach: jest.setup.ts`, `moduleNameMapper @/ → src/`. Coverage is **collected from `src/lib/**` and `src/hooks/**`** with **gates: lib & hooks ≥ 80% lines/statements/functions, ≥ 70% branches** (global thresholds 0 — the point is to gate the pure logic, not the presentational components).
- **`jest.setup.ts`**: imports `@testing-library/jest-dom` and shims `matchMedia`, `IntersectionObserver`, `ResizeObserver` for jsdom.
- **`__mocks__/framer-motion.tsx`**: replaces `motion.*` with plain elements (strips animation props) so components render deterministically; `__mocks__/lenis.ts`: no-op.
- **22 suites / 102 tests** mirror `src/` under `src/__tests__/…` — covering `lib` (colors, constants, recruiter validation), `hooks` (useInView, useTheme), components (Loader, ThemeScript, Nav/Menu, the recruiter components incl. Otp/SignUp/Screening/Approved/Gate/Field/Dots, and the section peak behavior in `AISection.peak.test.tsx`), and app (layout, page, recruiter-page). All 102 pass on the current tree.

---

## 22. Code conventions & house style

- **TypeScript strict**, no `any` (narrow `unknown`), **named exports** (no default exports except Next's required page/layout/route defaults), explicit return types on public functions, `Readonly<>`/`as const` for data.
- **Prettier** (printWidth 100, double quotes, trailing commas, semicolons) is the canonical formatter (`npm run format`).
- **No comments, anywhere** — every source file is intentionally comment-free (JSX comments, JSDoc, `//`, `/* */`, CSS, YAML `#`, Prisma `///`, Markdown `<!-- -->` all removed). This is a deliberate cleanliness choice for this repo; the knowledge lives in commit messages and this blueprint instead.
- **Content/data** is centralised in `lib/constants.ts` (site copy) and the various `lib/**` modules — components stay presentational.

---

## 23. CI/CD (`.github/workflows/ci.yml`)

On push/PR to `main`: a single `ci` job (Ubuntu, Node 22, npm cache, 10-min timeout, `concurrency` cancels superseded runs) runs, in order: `npm ci` → `npx tsc --noEmit` → `npm run lint` → `npm run test:coverage` (enforces the lib/hooks gates) → `npm run build`. `permissions: contents: read`.

---

## 24. Deployment (Vercel)

- **Build**: `prisma generate && next build`; **postinstall**: `prisma generate` (both required so `@prisma/client` exists on Vercel — a Prisma 7 gotcha).
- **Env vars** on Vercel: `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (= the deployed origin), `RESEND_API_KEY`, `RESEND_FROM`, and optionally `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_AUTH_URL`.
- **DB provisioning**: `npx prisma db push` (first time) or `migrate deploy`, then `npx prisma db seed` (seeds the founding admin).
- **Custom domain (v1 launch)** — from `README.md`: buy + add the domain in Vercel → Domains; add the DNS records; set `NEXT_PUBLIC_SITE_URL` (+ matching `BETTER_AUTH_URL`) in Vercel env; update `RESEND_FROM` to a verified-domain sender; redeploy; verify `/sitemap.xml` and `/robots.txt` reference the new domain.

---

## 25. Local development

```bash
cp .env.example .env.local        # fill DATABASE_URL, DIRECT_URL, BETTER_AUTH_SECRET, RESEND_*
npm install                       # runs postinstall: prisma generate
npx prisma db push                # apply schema to Neon
npx prisma db seed                # seed founding admin (mokhatla.mzwakhe@gmail.com)
npm run dev                       # http://localhost:3000
```
Useful: `npm run typecheck`, `npm run test`, `npm run test:coverage`, `npm run lint`, `npm run format`, `npm run build`. Without `RESEND_API_KEY`, request an OTP and read it from the dev server console.

---

## 26. Known constraints & gotchas

- **Prisma 7 breaking changes**: no `url` in `schema.prisma`; a driver adapter (`@prisma/adapter-neon`) is mandatory; `prisma.config.ts` supplies the CLI datasource + seed; `postinstall`/`build` must `prisma generate`.
- **Next 16 / React 19**: App Router conventions differ from earlier majors; `AGENTS.md` warns to consult the bundled Next docs before writing framework code.
- **Hydration**: `suppressHydrationWarning` on `<html>` is required by the theme script (Section 11) — removing it reintroduces the `insertBefore` crash.
- **Portrait filename** is `Potrait.png` (misspelled); referenced consistently as `SITE.portrait`. On case-insensitive macOS this hid a case mismatch that 404'd on Vercel — keep the exact casing.
- **Reduced motion** disables Lenis entirely (no smooth scroll for those users, by design).
- One commit message references "the real Anthropic call per §13" — that is legitimate product content about an Anthropic API integration path, not build noise.

---

## 27. Full regeneration checklist (ordered)

1. Scaffold Next 16 + TS + Tailwind v4 (no `tailwind.config.js`); set `tsconfig` paths, `postcss`, `eslint`, `prettier`.
2. `npm i` the exact deps (Appendix `package.json`).
3. Add `prisma/schema.prisma` (Section 7) + `prisma.config.ts` + `prisma/seed.ts`; provision Neon; `db push`; `db seed`.
4. Recreate `src/lib/**` (site-url, constants, colors, db, api, recruiter, lenis-bus, auth/*, privacy/*).
5. Recreate `src/hooks/**`, then `src/components/**` (primitives → nav/sections/devices/legal/privacy/recruiter), then `src/app/**` (layout, page, error, api routes, legal, recruiter, robots/sitemap).
6. Recreate `src/app/globals.css`, `src/app/recruiter/recruiter.css`, `src/components/legal/legal.css`, `src/components/privacy/consent.css` verbatim (Appendix).
7. Supply binaries: `public/img/Potrait.png`, `public/cv/*.pdf`, `src/app/favicon.ico`.
8. Add `__mocks__/*`, `jest.config.ts`, `jest.setup.ts`, `src/__tests__/**`; `npm test` → 102 pass.
9. Add `.github/workflows/ci.yml`, `README.md`, `AGENTS.md`, `CLAUDE.md`.
10. Set env, `npm run dev`, verify; deploy to Vercel per Section 24.

---

## 28. File-by-file quick index (what each source file is)

- `src/lib/site-url.ts` — canonical origin resolver.
- `src/lib/constants.ts` — all site copy/data (SITE, NAVLINKS, SERVICES, WORK, XP, AIITEMS, ASSISTANT_NAME, PEAK_COLOR).
- `src/lib/colors.ts` — hex→rgb, relative luminance, rgb/rgba string helpers.
- `src/lib/db.ts` — lazy Prisma+Neon singleton Proxy.
- `src/lib/api.ts` — `apiFetch` + toast error mapping.
- `src/lib/recruiter.ts` — client-side email/domain helpers + localStorage account cache.
- `src/lib/lenis-bus.ts` — scroll pub/sub.
- `src/lib/auth/{server,client,admin,email,profile,validation}.ts` — BetterAuth server/client, admin/session gating, Resend OTP, account projection, signup validation.
- `src/lib/privacy/{policy,cookies,consent,log}.ts` — versions, cookie inventory, consent (de)serialization, audit logging.
- `src/hooks/{useInView,useTheme}.ts` — scroll-reveal, theme state.
- `src/components/primitives/*` — Reveal (+EASE), SmoothScroll (Lenis), StackScaleEffect (Services scale), Progress, Toaster, icons (SVG set).
- `src/components/nav/*` — Nav (toggle + pills), Menu (overlay), NavMenu (state).
- `src/components/sections/*` — the home-page sections + WorkVisual/LogoBar.
- `src/components/devices/*` — Laptop/Phone/Tablet/Watch SVG mockups for the AI showcase.
- `src/components/privacy/*` — ConsentProvider + ConsentBanner.
- `src/components/recruiter/*` — Gate, SignUp, SignIn, Otp, Screening, Approved, Field, Dots, Howto, TopBar.
- `src/components/legal/LegalLayout.tsx` — shared legal-page shell.
- `src/components/{Loader,ThemeScript}.tsx` — loader lifecycle, anti-flash theme script.
- `src/app/*` — layout, page, error, robots, sitemap, globals.css, legal/*, recruiter/*, api/**.

---

# 29. APPENDIX — Complete verbatim source

> Every text file in the repository, byte-exact, follows below (excluding `package-lock.json` and binary assets). This is the authoritative source; the Narrative above explains it. Generated directly from disk.


---

## Appendix · Configuration & tooling

### `package.json`

```json
{
  "name": "the-foundry",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "postinstall": "prisma generate",
    "start": "next start",
    "lint": "eslint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\" \"__mocks__/**/*.{ts,tsx}\" \"prisma/*.ts\" \"*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\" \"__mocks__/**/*.{ts,tsx}\" \"prisma/*.ts\" \"*.{ts,tsx,json,md}\""
  },
  "dependencies": {
    "@neondatabase/serverless": "^1.1.0",
    "@prisma/adapter-neon": "^7.8.0",
    "@prisma/client": "^7.8.0",
    "better-auth": "^1.6.20",
    "framer-motion": "^12.40.0",
    "lenis": "^1.3.23",
    "next": "16.2.9",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "react-hot-toast": "^2.6.0",
    "resend": "^6.14.0",
    "simple-icons": "^16.24.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/jest": "^30.0.0",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "dotenv": "^17.4.2",
    "eslint": "^9",
    "eslint-config-next": "16.2.9",
    "jest": "^30.4.2",
    "jest-environment-jsdom": "^30.4.1",
    "prettier": "^3.8.4",
    "prisma": "^7.8.0",
    "tailwindcss": "^4",
    "ts-node": "^10.9.2",
    "tsx": "^4.22.4",
    "typescript": "^5"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

### `next.config.ts`

```typescript
import type { NextConfig } from "next";
const nextConfig: NextConfig = {};
export default nextConfig;
```

### `postcss.config.mjs`

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

### `eslint.config.mjs`

```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
  ]),
]);

export default eslintConfig;
```

### `.prettierrc.json`

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### `.prettierignore`

```
.next
node_modules
dist
build
coverage
*.lock
package-lock.json
public
.env*
prisma/migrations
```

### `jest.config.ts`

```typescript
import type { Config } from "jest";
import nextJest from "next/jest.js";
const createJestConfig = nextJest({ dir: "./" });
const config: Config = {
  testEnvironment: "jsdom",
  coverageProvider: "v8",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  collectCoverageFrom: ["src/lib/**/*.{ts,tsx}", "src/hooks/**/*.{ts,tsx}", "!**/*.d.ts"],
  coverageThreshold: {
    global: { lines: 0, statements: 0, branches: 0, functions: 0 },
    "src/lib/": { lines: 80, statements: 80, branches: 70, functions: 80 },
    "src/hooks/": { lines: 80, statements: 80, branches: 70, functions: 80 },
  },
};
export default createJestConfig(config);
```

### `jest.setup.ts`

```typescript
import "@testing-library/jest-dom";
if (typeof window !== "undefined") {
  if (!window.matchMedia) {
    window.matchMedia = (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  }
  if (!window.IntersectionObserver) {
    class IntersectionObserverShim {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
      readonly root: Element | null = null;
      readonly rootMargin: string = "";
      readonly thresholds: ReadonlyArray<number> = [];
    }
    window.IntersectionObserver =
      IntersectionObserverShim as unknown as typeof IntersectionObserver;
  }
  if (!window.ResizeObserver) {
    class ResizeObserverShim {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }
    window.ResizeObserver = ResizeObserverShim as unknown as typeof ResizeObserver;
  }
}
```

### `next-env.d.ts`

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/dev/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

### `prisma.config.ts`

```typescript
import { config } from "dotenv";
import { defineConfig } from "@prisma/config";
config({ path: ".env.local" });
config({ path: ".env" });
const datasourceUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: datasourceUrl ? { url: datasourceUrl } : undefined,
  migrations: {
    path: "./prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
```

### `.env.example`

```
NEXT_PUBLIC_SITE_URL="https://mzwakhe.dev"

DATABASE_URL="postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxxx.region.aws.neon.tech/dbname?sslmode=require"

BETTER_AUTH_SECRET="replace-with-a-32-byte-base64-secret"
BETTER_AUTH_URL="http://localhost:3000"

RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
RESEND_FROM="Mzwakhe Mokhatla <noreply@mzwakhe.dev>"
```

### `.gitignore`

```
.next/
out/
.repl_history

node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log

.env*.local
.env.development.local
.env.test.local
.env.production.local

coverage/
.nyc_output/

*.tsbuildinfo

dist/
build/

*.log

.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
desktop.ini

.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.idea/
*.swp
*.swo
*~

.tmp
.temp
*.tmp
*.temp
.vercel
```

---

## Appendix · CI & docs

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  ci:
    name: Type-check · Lint · Test · Build
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - name: Check out
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Type-check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

      - name: Test (with coverage gates)
        run: npm run test:coverage

      - name: Build
        run: npm run build
```

### `README.md`

````markdown
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
````

### `AGENTS.md`

```markdown
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
```

### `CLAUDE.md`

```markdown
@AGENTS.md
```

---

## Appendix · Prisma

### `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider = "postgresql"
}

model User {
  id            String   @id
  email         String   @unique
  name          String   @default("")
  emailVerified Boolean  @default(false)
  image         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  acceptedTermsAt    DateTime?
  acceptedPrivacyAt  DateTime?
  acceptedTermsVer   String?
  acceptedPrivacyVer String?

  sessions          Session[]
  accounts          Account[]
  recruiterProfile  RecruiterProfile?
  consentLogs       ConsentLog[]

  @@map("user")
}

model Session {
  id        String   @id
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("session")
}

model Account {
  id                    String    @id
  userId                String
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  idToken               String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("account")
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("verification")
}

model AdminWhitelist {
  id         String   @id @default(cuid())
  email      String   @unique
  name       String
  addedBy    String?
  createdAt  DateTime @default(now())

  @@map("admin_whitelist")
}

model RecruiterProfile {
  id         String        @id @default(cuid())
  userId     String        @unique
  company    String
  role       String
  url        String
  decision   ScreenDecision @default(pending)
  reason     String?
  verifiedAt DateTime?
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("recruiter_profile")
}

enum ScreenDecision {
  pending
  approve
  reject

  @@map("screen_decision")
}

model ConsentLog {
  id        String       @id @default(cuid())
  userId    String?
  clientId  String?
  action    ConsentAction
  payload   Json
  policyVer String
  ipAddress String?
  userAgent String?
  createdAt DateTime     @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([clientId])
  @@map("consent_log")
}

enum ConsentAction {
  grant
  withdraw
  update
  accept_terms
  accept_privacy

  @@map("consent_action")
}
```

### `prisma/seed.ts`

```typescript
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
config({ path: ".env.local" });
config({ path: ".env" });
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Cannot seed.");
  process.exit(1);
}
const db = new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) });
const SEED_ADMINS = [{ email: "mokhatla.mzwakhe@gmail.com", name: "Mzwakhe Mokhatla" }];
async function main(): Promise<void> {
  for (const admin of SEED_ADMINS) {
    const email = admin.email.toLowerCase();
    await db.adminWhitelist.upsert({
      where: { email },
      update: { name: admin.name },
      create: { email, name: admin.name },
    });
    console.log(`  ✓ admin whitelist · ${email}`);
  }
}
main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
```

---

## Appendix · src/lib

### `src/lib/api.ts`

```typescript
import toast from "react-hot-toast";
export type ApiResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
    };
type FetchInit = RequestInit & {
  silent?: boolean;
};
export async function apiFetch<T = unknown>(
  url: string,
  init: FetchInit = {},
): Promise<ApiResult<T>> {
  const { silent, headers, ...rest } = init;
  try {
    const res = await fetch(url, {
      ...rest,
      headers: { "Content-Type": "application/json", ...(headers ?? {}) },
    });
    const text = await res.text();
    const body = text ? safeJson(text) : null;
    if (!res.ok) {
      const message = pickErrorMessage(body, res.status);
      if (!silent) toast.error(message);
      return { ok: false, error: message };
    }
    return { ok: true, data: body as T };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    if (!silent) toast.error(message);
    return { ok: false, error: message };
  }
}
function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
function pickErrorMessage(body: unknown, status: number): string {
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    if (typeof b.message === "string") return b.message;
    if (typeof b.error === "string") return b.error;
  }
  if (status === 401) return "Please sign in to continue.";
  if (status === 403) return "You don't have access to do that.";
  if (status === 404) return "We couldn't find what you were looking for.";
  if (status === 429) return "Too many attempts. Try again in a minute.";
  if (status >= 500) return "Something went wrong on our side. Please try again.";
  return `Request failed (${status}).`;
}
```

### `src/lib/auth/admin.ts`

```typescript
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "./server";
export type SessionContext = {
  userId: string;
  email: string;
  name: string;
  isAdmin: boolean;
};
export async function isWhitelisted(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const entry = await db.adminWhitelist.findUnique({ where: { email: normalized } });
  return entry !== null;
}
export async function getSessionContext(): Promise<SessionContext | null> {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });
  if (!session?.user) return null;
  const isAdmin = await isWhitelisted(session.user.email);
  return {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name ?? "",
    isAdmin,
  };
}
export async function requireAdmin(): Promise<SessionContext> {
  const ctx = await getSessionContext();
  if (!ctx) throw new HttpError(401, "Sign in required");
  if (!ctx.isAdmin) throw new HttpError(403, "Admin access required");
  return ctx;
}
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
```

### `src/lib/auth/client.ts`

```typescript
"use client";
import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL ?? "/",
  plugins: [emailOTPClient()],
});
export const { useSession, signOut } = authClient;
```

### `src/lib/auth/email.ts`

```typescript
import { Resend } from "resend";
const FROM = process.env.RESEND_FROM ?? "Mzwakhe Mokhatla <noreply@example.com>";
let resend: Resend | null = null;
function getResend(): Resend | null {
  if (resend) return resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  resend = new Resend(key);
  return resend;
}
export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const client = getResend();
  if (!client) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[email] RESEND_API_KEY missing, OTP for ${to}: ${otp}`);
      return;
    }
    throw new Error("RESEND_API_KEY missing");
  }
  const subject = "Your access code";
  const text = `Your one-time code is ${otp}. It expires in 5 minutes.`;
  const html = `
    <div style="font-family: ui-sans-serif, system-ui, sans-serif; padding: 24px; color: #0a0a0a;">
      <h2 style="margin: 0 0 12px;">Your access code</h2>
      <p style="margin: 0 0 16px;">Use this code to continue:</p>
      <p style="font-size: 28px; letter-spacing: 6px; font-weight: 700; margin: 0 0 16px;">${otp}</p>
      <p style="color: #6b7280; font-size: 13px;">Expires in 5 minutes. If you didn't request this, ignore this email.</p>
    </div>
  `;
  const result = await client.emails.send({ from: FROM, to, subject, text, html });
  if (result.error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[email] Resend rejected the send (${result.error.message}). ` +
          `Falling back to console for ${to}. OTP: ${otp}`,
      );
      return;
    }
    throw new Error(result.error.message);
  }
}
```

### `src/lib/auth/profile.ts`

```typescript
import { db } from "@/lib/db";
export type RecruiterDecision = "pending" | "approve" | "reject";
export type RecruiterAccountDto = Readonly<{
  name: string;
  email: string;
  company: string;
  role: string;
  url: string;
  verifiedAt: number;
  isAdmin: boolean;
  screen: {
    decision: RecruiterDecision;
    reason: string;
  } | null;
}>;
export async function fetchAccount(userId: string): Promise<RecruiterAccountDto | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { recruiterProfile: true },
  });
  if (!user) return null;
  const admin = await db.adminWhitelist.findUnique({ where: { email: user.email } });
  const profile = user.recruiterProfile;
  return {
    name: user.name,
    email: user.email,
    company: profile?.company ?? "",
    role: profile?.role ?? (admin ? "Admin" : ""),
    url: profile?.url ?? "",
    verifiedAt: (profile?.verifiedAt ?? user.createdAt).getTime(),
    isAdmin: admin !== null,
    screen: profile
      ? { decision: profile.decision, reason: profile.reason ?? "" }
      : admin
        ? { decision: "approve", reason: "Admin allowlist." }
        : null,
  };
}
```

### `src/lib/auth/server.ts`

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { sendOtpEmail } from "./email";
const secret = process.env.BETTER_AUTH_SECRET ?? "dev-only-insecure-secret-change-me";
export const auth = betterAuth({
  appName: "Mzwakhe Mokhatla, Recruiter Access",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: false },
  user: {
    additionalFields: {
      name: { type: "string", required: false, input: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 14,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 5,
      allowedAttempts: 5,
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp }) {
        await sendOtpEmail(email, otp);
      },
    }),
    nextCookies(),
  ],
});
export type Auth = typeof auth;
```

### `src/lib/auth/validation.ts`

```typescript
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FREE_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "mail.com",
  "yandex.com",
  "zoho.com",
  "pm.me",
  "hey.com",
  "ymail.com",
]);
export type SignupPayload = Readonly<{
  email: string;
  name: string;
  company: string;
  role: string;
  url: string;
  acceptedTerms: true;
  acceptedPrivacy: true;
}>;
export type ValidationError = Readonly<{
  field: keyof SignupPayload | "consent";
  message: string;
}>;
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}
export function isFreeDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return FREE_DOMAINS.has(domain);
}
export function validateSignup(
  raw: unknown,
  options: {
    isAdmin: boolean;
  },
):
  | {
      ok: true;
      value: SignupPayload;
    }
  | {
      ok: false;
      error: ValidationError;
    } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: { field: "email", message: "Invalid request." } };
  }
  const input = raw as Record<string, unknown>;
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const company = typeof input.company === "string" ? input.company.trim() : "";
  const role = typeof input.role === "string" ? input.role.trim() : "";
  const url = typeof input.url === "string" ? input.url.trim() : "";
  const acceptedTerms = input.acceptedTerms === true;
  const acceptedPrivacy = input.acceptedPrivacy === true;
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: { field: "email", message: "Enter a valid email address." } };
  }
  if (!options.isAdmin && isFreeDomain(email)) {
    return {
      ok: false,
      error: {
        field: "email",
        message:
          "Please use your work email, personal inboxes (gmail, outlook…) can't be verified.",
      },
    };
  }
  if (name.length < 2)
    return { ok: false, error: { field: "name", message: "Please enter your full name." } };
  if (company.length < 2)
    return { ok: false, error: { field: "company", message: "Which company are you with?" } };
  if (role.length < 2)
    return { ok: false, error: { field: "role", message: "What role are you hiring for?" } };
  if (url.length < 4)
    return {
      ok: false,
      error: { field: "url", message: "Company website or LinkedIn helps verify you." },
    };
  if (!acceptedTerms || !acceptedPrivacy) {
    return {
      ok: false,
      error: {
        field: "consent",
        message: "You must accept the Recruiter Terms and Privacy Policy to continue.",
      },
    };
  }
  return {
    ok: true,
    value: {
      email: normalizeEmail(email),
      name,
      company,
      role,
      url,
      acceptedTerms: true,
      acceptedPrivacy: true,
    },
  };
}
```

### `src/lib/colors.ts`

```typescript
export const _hx = (h: string): number[] => {
  h = h.replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const _lum = (a: number[]): number => (0.299 * a[0] + 0.587 * a[1] + 0.114 * a[2]) / 255;
export const _rgb = (a: number[]): string => `rgb(${a[0]},${a[1]},${a[2]})`;
export const _rgba = (a: number[], o: number): string => `rgba(${a[0]},${a[1]},${a[2]},${o})`;
```

### `src/lib/constants.ts`

```typescript
export const SITE = {
  name: "Mzwakhe Mokhatla",
  email: "mokhatla.mzwakhe@gmail.com",
  phone: "067 980 1166",
  phoneHref: "tel:+27679801166",
  location: "Pretoria, South Africa",
  tagline: "Turning ideas into digital realities.",
  cvHref: "/cv/Mzwakhe_Sifiso_Mokhatla_CV.pdf",
  portrait: "/img/Potrait.png",
} as const;
export type NavLink = Readonly<{
  n: string;
  t: string;
  href: string;
}>;
export const NAVLINKS: ReadonlyArray<NavLink> = [
  { n: "01", t: "Work", href: "#work" },
  { n: "02", t: "Services", href: "#services" },
  { n: "03", t: "AI Workflow", href: "#ai" },
  { n: "04", t: "Experience", href: "#experience" },
  { n: "05", t: "Contact", href: "#contact" },
];
export type Service = Readonly<{
  w1: string;
  w2: string;
  pills: ReadonlyArray<string>;
  d: string;
}>;
export const SERVICES: ReadonlyArray<Service> = [
  {
    w1: "Frontend",
    w2: "Engineering",
    pills: ["React", "TypeScript", "Next.js", "Microfrontends", "UI/UX"],
    d: "I build the interfaces people count on at work, accessible, responsive, and fast. Reusable component systems and design-faithful UI, translated straight from Figma into production.",
  },
  {
    w1: "Full-Stack",
    w2: "& Cloud",
    pills: [
      "Node · NestJS",
      "Azure Functions",
      "REST APIs",
      "PostgreSQL",
      "Pulumi · IaC",
      "Docker",
    ],
    d: "The contracts underneath the screen: APIs, relational data, and Azure-native services, designed to scale and stay honest from the UI all the way down to the database.",
  },
  {
    w1: "Technical",
    w2: "Leadership",
    pills: ["Code review", "Mentorship", "Architecture", "Agile · Scrum", "Sprint delivery"],
    d: "Acting Technical Lead on StudioSync, owning specs, component boundaries, and migrations while mentoring the team and holding engineering standards high across frontend and backend.",
  },
  {
    w1: "Platform",
    w2: "& DevOps",
    pills: ["Azure DevOps", "GitHub Actions", "Grafana", "CI/CD", "Observability"],
    d: "Pipelines and observability that make shipping calm, infrastructure as code, automated delivery, and dashboards that surface what production is actually doing.",
  },
];
export type Work = Readonly<{
  nm: string;
  og: string;
  tag: string;
  slot: string;
}>;
export const WORK: ReadonlyArray<Work> = [
  { nm: "StudioSync", og: "MTN Group · Technical Lead", tag: "Platform", slot: "work-studiosync" },
  { nm: "Bayobab Client Portal", og: "Accenture · MTN", tag: "Frontend", slot: "work-bayobab" },
  { nm: "e-Teller", og: "Nybble · NMB Bank, Tanzania", tag: "Fintech", slot: "work-eteller" },
  { nm: "GE Smallworld GIS", og: "IST · Spatial systems", tag: "GIS", slot: "work-gis" },
];
export type XpRow = Readonly<{
  role: string;
  org: string;
  when: string;
  now?: boolean;
}>;
export const XP: ReadonlyArray<XpRow> = [
  {
    role: "Software Engineer · Tech Lead",
    org: "MTN Group, Roodepoort",
    when: "Mar 2024 to Present",
    now: true,
  },
  {
    role: "Product & Platform Engineer",
    org: "Accenture, Waterfall",
    when: "Mar 2024 to Present",
    now: true,
  },
  {
    role: "Frontend Engineer",
    org: "Nybble Technologies, Bryanston / Dar es Salaam",
    when: "Dec 2022 to Jun 2023",
  },
  { role: "Junior Software Developer", org: "IST, Pretoria", when: "Jan 2021, Dec 2022" },
];
export type AiItem = Readonly<{
  t: string;
  d: string;
  tools: ReadonlyArray<string>;
}>;
export const AIITEMS: ReadonlyArray<AiItem> = [
  {
    t: "AI pair-programming",
    d: "Cursor and Copilot handle scaffolding, refactors, and the tedious parts of a migration, so I stay in flow while the boilerplate writes itself.",
    tools: ["Cursor", "Copilot"],
  },
  {
    t: "Rapid prototyping",
    d: "I stand up UI prototypes and explore several directions in minutes with LLMs, then keep only what earns its place in the product.",
    tools: ["LLM prompting", "Prototyping"],
  },
  {
    t: "Tests & documentation",
    d: "Generating unit and integration tests, surfacing edge cases, and drafting docs keeps the codebase understandable as it grows.",
    tools: ["Test generation", "Docs"],
  },
  {
    t: "Review & research",
    d: "A second pass on pull requests, plus tracking new AI tooling and folding what genuinely works into the team's everyday practice.",
    tools: ["PR review", "AI trends"],
  },
];
export const ASSISTANT_NAME = "Clerk";
export const PEAK_COLOR = "#020202";
```

### `src/lib/db.ts`

```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};
function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (pooled Neon connection string).",
    );
  }
  const adapter = new PrismaNeon({ connectionString: url });
  return new PrismaClient({ adapter, log: ["warn", "error"] });
}
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    if (!globalForPrisma.prisma) globalForPrisma.prisma = createClient();
    const value = Reflect.get(globalForPrisma.prisma, prop, receiver);
    return typeof value === "function" ? value.bind(globalForPrisma.prisma) : value;
  },
});
```

### `src/lib/lenis-bus.ts`

```typescript
type Cb = (scroll: number) => void;
const subs: Cb[] = [];
export const lenisBus = {
  emit(scroll: number): void {
    for (const fn of subs) fn(scroll);
  },
  on(fn: Cb): () => void {
    subs.push(fn);
    return (): void => {
      const i = subs.indexOf(fn);
      if (i !== -1) subs.splice(i, 1);
    };
  },
};
```

### `src/lib/privacy/consent.ts`

```typescript
import { COOKIE_POLICY_VERSION } from "./policy";
import type { CookieCategory } from "./cookies";
export const CONSENT_COOKIE = "consent";
export const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
export type ConsentChoices = Readonly<{
  necessary: true;
  functional: boolean;
  analytics: boolean;
}>;
export type ConsentRecord = Readonly<{
  v: string;
  ts: number;
  choices: ConsentChoices;
}>;
export const DEFAULT_REJECTED: ConsentChoices = {
  necessary: true,
  functional: false,
  analytics: false,
};
export const ACCEPT_ALL: ConsentChoices = {
  necessary: true,
  functional: true,
  analytics: true,
};
export function parseConsent(raw: string | undefined | null): ConsentRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<ConsentRecord>;
    if (parsed.v !== COOKIE_POLICY_VERSION) return null;
    if (typeof parsed.ts !== "number") return null;
    const c = parsed.choices;
    if (!c || typeof c !== "object") return null;
    return {
      v: parsed.v,
      ts: parsed.ts,
      choices: {
        necessary: true,
        functional: Boolean(c.functional),
        analytics: Boolean(c.analytics),
      },
    };
  } catch {
    return null;
  }
}
export function serializeConsent(choices: ConsentChoices): string {
  const record: ConsentRecord = {
    v: COOKIE_POLICY_VERSION,
    ts: Date.now(),
    choices,
  };
  return encodeURIComponent(JSON.stringify(record));
}
export function isGranted(record: ConsentRecord | null, category: CookieCategory): boolean {
  if (category === "necessary") return true;
  if (!record) return false;
  return record.choices[category] === true;
}
```

### `src/lib/privacy/cookies.ts`

```typescript
export type CookieCategory = "necessary" | "functional" | "analytics";
export type CookieEntry = Readonly<{
  name: string;
  storage: "cookie" | "localStorage";
  category: CookieCategory;
  party: "first" | "third";
  purpose: string;
  duration: string;
}>;
export const COOKIE_INVENTORY: readonly CookieEntry[] = [
  {
    name: "better-auth.session_token",
    storage: "cookie",
    category: "necessary",
    party: "first",
    purpose:
      "Identifies your authenticated session after sign-in so you don't have to verify your email on every request.",
    duration: "14 days",
  },
  {
    name: "better-auth.session_data",
    storage: "cookie",
    category: "necessary",
    party: "first",
    purpose:
      "Short-lived cache of your session so pages can render without an extra database lookup.",
    duration: "5 minutes",
  },
  {
    name: "consent",
    storage: "cookie",
    category: "necessary",
    party: "first",
    purpose: "Records your cookie preferences so we don't ask you again on every visit.",
    duration: "12 months",
  },
  {
    name: "studio-theme",
    storage: "localStorage",
    category: "functional",
    party: "first",
    purpose: "Remembers whether you chose light or dark mode.",
    duration: "Until you clear browser storage",
  },
] as const;
export const CATEGORY_META: Readonly<
  Record<
    CookieCategory,
    Readonly<{
      label: string;
      description: string;
      alwaysOn: boolean;
    }>
  >
> = {
  necessary: {
    label: "Strictly necessary",
    description:
      "Required to authenticate you and remember your consent choices. Without these, the recruiter access flow cannot function.",
    alwaysOn: true,
  },
  functional: {
    label: "Functional",
    description: "Remembers preferences like your theme so the site stays personal across visits.",
    alwaysOn: false,
  },
  analytics: {
    label: "Analytics",
    description:
      "Helps me understand which parts of the site are useful. We don't currently set any analytics cookies, but turning this off will keep it that way if we add them.",
    alwaysOn: false,
  },
};
export const CATEGORY_ORDER: readonly CookieCategory[] = [
  "necessary",
  "functional",
  "analytics",
] as const;
export function inventoryByCategory(category: CookieCategory): readonly CookieEntry[] {
  return COOKIE_INVENTORY.filter((c) => c.category === category);
}
```

### `src/lib/privacy/log.ts`

```typescript
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { COOKIE_POLICY_VERSION } from "./policy";
export type ConsentActionKind = "grant" | "withdraw" | "update" | "accept_terms" | "accept_privacy";
function hashedClientId(ip: string | null, ua: string | null): string {
  return createHash("sha256")
    .update(`${ip ?? "unknown"}|${ua ?? "unknown"}`)
    .digest("hex");
}
export async function logConsent(args: {
  userId?: string | null;
  action: ConsentActionKind;
  payload: unknown;
}): Promise<void> {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? hdrs.get("x-real-ip") ?? null;
  const ua = hdrs.get("user-agent");
  await db.consentLog.create({
    data: {
      userId: args.userId ?? null,
      clientId: args.userId ? null : hashedClientId(ip, ua),
      action: args.action,
      payload: args.payload as object,
      policyVer: COOKIE_POLICY_VERSION,
      ipAddress: ip ?? null,
      userAgent: ua ?? null,
    },
  });
}
```

### `src/lib/privacy/policy.ts`

```typescript
export const PRIVACY_POLICY_VERSION = "2026-06-23.v1";
export const COOKIE_POLICY_VERSION = "2026-06-23.v1";
export const TERMS_VERSION = "2026-06-23.v1";
export const DATA_CONTROLLER = {
  name: "Mzwakhe Mokhatla",
  email: "mokhatla.mzwakhe@gmail.com",
  location: "South Africa",
} as const;
export const DATA_RETENTION_DAYS = 365;
```

### `src/lib/recruiter.ts`

```typescript
export const LS_ACCOUNTS = "recruiter-accounts-v1";
export const LS_SESSION = "recruiter-session-v1";
export const FREE: ReadonlySet<string> = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "mail.com",
  "yandex.com",
  "zoho.com",
  "pm.me",
  "hey.com",
  "ymail.com",
]);
export const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const domainOf = (e: string): string => (e.split("@")[1] || "").toLowerCase().trim();
export const isFree = (e: string): boolean => FREE.has(domainOf(e));
export const genCode = (): string => String(Math.floor(100000 + Math.random() * 900000));
export type RecruiterAccount = Readonly<{
  name: string;
  email: string;
  company: string;
  role: string;
  url: string;
  verifiedAt: number;
  screen?: ScreenResult;
}>;
export type ScreenResult = Readonly<{
  decision: "approve" | "review";
  reason: string;
}>;
type AccountMap = Record<string, RecruiterAccount>;
export const loadAccounts = (): AccountMap => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LS_ACCOUNTS) || "{}") as AccountMap;
  } catch {
    return {};
  }
};
export const saveAccounts = (accounts: AccountMap): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_ACCOUNTS, JSON.stringify(accounts));
};
```

### `src/lib/site-url.ts`

```typescript
export const SITE_URL: string = (() => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prod) return `https://${prod}`;

  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
})();
```

---

## Appendix · src/hooks

### `src/hooks/useInView.ts`

```typescript
"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
export function useInView<T extends HTMLElement = HTMLElement>(
  margin = 0.16,
): readonly [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let done = false;
    const check = (): void => {
      if (done) return;
      const r = el.getBoundingClientRect();
      const h = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < h * (1 - margin) && r.bottom > 0) {
        done = true;
        setSeen(true);
        cleanup();
      }
    };
    const cleanup = (): void => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    const onScroll = (): void => check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    check();
    const t = window.setTimeout(() => {
      if (!done) {
        setSeen(true);
        cleanup();
      }
    }, 1500);
    return () => {
      cleanup();
      window.clearTimeout(t);
    };
  }, [margin]);
  return [ref, seen] as const;
}
```

### `src/hooks/useTheme.ts`

```typescript
"use client";
import { useEffect, useState } from "react";
export type Theme = "light" | "dark";
export function useTheme(): {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
} {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    const stored = (
      typeof window !== "undefined" ? localStorage.getItem("studio-theme") : null
    ) as Theme | null;
    if (stored && stored !== "light") {
      setTheme(stored);
    }
  }, []);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("studio-theme", theme);
    } catch {}
  }, [theme]);
  const toggle = (): void => setTheme((p) => (p === "dark" ? "light" : "dark"));
  return { theme, toggle, setTheme };
}
```

---

## Appendix · src/components

### `src/components/Loader.tsx`

```tsx
"use client";
import { useEffect } from "react";
export function Loader(): null {
  useEffect(() => {
    const t1 = window.setTimeout(() => {
      const ld = document.getElementById("loader");
      if (ld) ld.classList.add("hide");
    }, 600);
    const t2 = window.setTimeout(() => {
      const ld = document.getElementById("loader");
      if (ld && ld.parentNode) ld.remove();
    }, 1400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);
  return null;
}
```

### `src/components/ThemeScript.tsx`

```tsx
export function ThemeScript(): React.ReactElement {
  const js =
    "(()=>{try{var t=localStorage.getItem('studio-theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})()";
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
```

### `src/components/devices/Laptop.tsx`

```tsx
import { ASSISTANT_NAME } from "@/lib/constants";
type LaptopProps = Readonly<{
  assistantName?: string;
}>;
export function Laptop({ assistantName = ASSISTANT_NAME }: LaptopProps = {}): React.ReactElement {
  return (
    <>
      <div className="laptop-lid">
        <div className="laptop-scr">
          <aside className="ldash-side">
            <div className="ldash-logo">
              <span className="ld" />
              {assistantName}
            </div>
            <nav className="ldash-nav">
              <a className="on" href="#">
                <span className="dot" />
                Dashboard
              </a>
              <a href="#">Code Review</a>
              <a href="#">Deployments</a>
              <a href="#">Analytics</a>
              <a href="#">Settings</a>
            </nav>
          </aside>

          <main className="ldash-main">
            <div className="ldash-head">
              <h4>Today&apos;s overview</h4>
              <span className="badge">
                <i />
                {assistantName} monitoring
              </span>
            </div>

            <div className="ldash-stats">
              <div className="ldash-stat">
                <div className="sl">PRs Reviewed</div>
                <div className="sv">24</div>
                <div className="sd">↑ 12%</div>
              </div>
              <div className="ldash-stat">
                <div className="sl">Deploys</div>
                <div className="sv">12</div>
                <div className="sd">↑ 8%</div>
              </div>
              <div className="ldash-stat">
                <div className="sl">Uptime</div>
                <div className="sv">99.8%</div>
                <div className="sd">↑ 0.3%</div>
              </div>
              <div className="ldash-stat">
                <div className="sl">Tests</div>
                <div className="sv">847</div>
                <div className="sd">↑ 5%</div>
              </div>
            </div>

            <div className="ldash-chart">
              <div className="ldash-ch">
                <div className="ct">Deploys, 7 days</div>
                <svg viewBox="0 0 200 50" width="100%" height={40} aria-hidden="true">
                  <polyline
                    points="0,42 28,38 56,40 84,30 112,32 140,22 168,15 200,8"
                    stroke="var(--candy)"
                    strokeWidth={1.5}
                    fill="none"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="ldash-ch ldash-ins">
                <div className="it">{assistantName} Insights</div>
                <div className="ib">
                  <span className="id" />
                  Sprint velocity up 15%, consider tighter cycles
                </div>
                <div className="ib">
                  <span className="id" />3 PRs need attention before merge
                </div>
                <div className="ib">
                  <span className="id" />
                  API latency spike at 02:14, auto-resolved
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="laptop-base">
        <div className="laptop-notch" />
      </div>
    </>
  );
}
```

### `src/components/devices/PhoneDevice.tsx`

```tsx
import { ASSISTANT_NAME } from "@/lib/constants";
type PhoneProps = Readonly<{
  assistantName?: string;
}>;
export function PhoneDevice({
  assistantName = ASSISTANT_NAME,
}: PhoneProps = {}): React.ReactElement {
  return (
    <>
      <div className="phone-notch" />
      <div className="phone-sb">
        <span>9:41</span>
        <span>AI · live</span>
      </div>
      <div className="phone-pad">
        <div className="ph-card">
          <div className="h">
            Daily PR review
            <span className="ai">{assistantName}</span>
          </div>
          <div className="ph-bul">
            <span className="d">›</span>3 PRs summarised, 1 needs your eyes
          </div>
          <div className="ph-bul">
            <span className="d">›</span>
            Flagged null-check in auth.ts
          </div>
          <div className="ph-bul">
            <span className="d">›</span>
            Tests drafted for session hook
          </div>
          <div className="ph-btn">Open review</div>
        </div>
      </div>
    </>
  );
}
```

### `src/components/devices/TabletDevice.tsx`

```tsx
import { ASSISTANT_NAME } from "@/lib/constants";
type TabletProps = Readonly<{
  assistantName?: string;
}>;
export function TabletDevice({
  assistantName = ASSISTANT_NAME,
}: TabletProps = {}): React.ReactElement {
  return (
    <>
      <div className="tablet-scr">
        <div className="tab-head">
          Weekly Report
          <span className="tbg">This week</span>
        </div>
        <div className="tab-stats">
          <div className="tab-st">
            <div className="tn">1.8k</div>
            <div className="tl">Lines</div>
          </div>
          <div className="tab-st">
            <div className="tn">R312k</div>
            <div className="tl">Revenue</div>
          </div>
        </div>
        <div className="tab-bar">
          <div />
        </div>
        <div className="tab-digest">
          <i />
          {assistantName} weekly digest
        </div>
      </div>
    </>
  );
}
```

### `src/components/devices/WatchDevice.tsx`

```tsx
export function WatchDevice(): React.ReactElement {
  return (
    <>
      <div className="watch-ring">
        <span className="watch-val">99.8%</span>
      </div>
      <div className="watch-lbl">Uptime</div>
    </>
  );
}
```

### `src/components/devices/index.ts`

```typescript
export { Laptop } from "./Laptop";
export { PhoneDevice } from "./PhoneDevice";
export { TabletDevice } from "./TabletDevice";
export { WatchDevice } from "./WatchDevice";
```

### `src/components/legal/LegalLayout.tsx`

```tsx
import Link from "next/link";
import "./legal.css";
type LegalLayoutProps = Readonly<{
  title: string;
  version: string;
  updatedAt: string;
  children: React.ReactNode;
}>;
export function LegalLayout({
  title,
  version,
  updatedAt,
  children,
}: LegalLayoutProps): React.ReactElement {
  return (
    <main className="legal">
      <header className="legal-head">
        <Link href="/" className="legal-back">
          ← Back to site
        </Link>
        <h1>{title}</h1>
        <p className="legal-meta">
          Version <code>{version}</code> · last updated {updatedAt}
        </p>
      </header>

      <div className="legal-callout" role="note">
        <strong>Note:</strong> this document is provided in good faith to describe how the site
        actually behaves. It is not legal advice. If you depend on it for regulatory compliance,
        have qualified counsel review it for your jurisdiction.
      </div>

      <article className="legal-body">{children}</article>

      <nav className="legal-nav" aria-label="Legal documents">
        <Link href="/legal/privacy">Privacy</Link>
        <Link href="/legal/cookies">Cookies</Link>
        <Link href="/legal/terms">Terms</Link>
      </nav>
    </main>
  );
}
```

### `src/components/legal/legal.css`

```css
.legal {
  max-width: 760px;
  margin: 0 auto;
  padding: 64px 24px 96px;
  font-family: var(--font-onest, ui-sans-serif, system-ui, sans-serif);
  color: var(--fg, #0a0a0a);
  line-height: 1.65;
}

.legal-head h1 {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 16px 0 8px;
  line-height: 1.05;
}

.legal-back {
  display: inline-block;
  font-size: 13px;
  color: var(--muted, rgba(10, 10, 10, 0.6));
  text-decoration: none;
  margin-bottom: 8px;
}

.legal-back:hover {
  color: var(--fg, #0a0a0a);
}

.legal-meta {
  margin: 0 0 24px;
  color: var(--muted, rgba(10, 10, 10, 0.6));
  font-size: 13px;
}

.legal-meta code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  background: rgba(10, 10, 10, 0.05);
  padding: 1px 6px;
  border-radius: 6px;
}

[data-theme="dark"] .legal-meta code {
  background: rgba(255, 255, 255, 0.07);
}

.legal-callout {
  margin: 24px 0 32px;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 13.5px;
  border: 1px solid rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.08);
}

.legal-body h2 {
  font-size: 22px;
  font-weight: 700;
  margin: 40px 0 12px;
}

.legal-body h3 {
  font-size: 17px;
  font-weight: 700;
  margin: 24px 0 8px;
}

.legal-body p {
  margin: 0 0 14px;
  font-size: 15.5px;
}

.legal-body ul,
.legal-body ol {
  margin: 0 0 18px;
  padding-left: 22px;
}

.legal-body li {
  margin-bottom: 6px;
  font-size: 15px;
}

.legal-body a {
  color: var(--candy, #2563eb);
  text-decoration: underline;
}

.legal-body strong {
  font-weight: 700;
}

.legal-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0 24px;
  font-size: 13.5px;
}

.legal-table th,
.legal-table td {
  border: 1px solid var(--border, rgba(10, 10, 10, 0.08));
  padding: 10px 12px;
  text-align: left;
  vertical-align: top;
}

[data-theme="dark"] .legal-table th,
[data-theme="dark"] .legal-table td {
  border-color: rgba(255, 255, 255, 0.1);
}

.legal-table th {
  background: rgba(10, 10, 10, 0.04);
  font-weight: 700;
}

[data-theme="dark"] .legal-table th {
  background: rgba(255, 255, 255, 0.05);
}

.legal-table code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  white-space: nowrap;
}

.legal-nav {
  display: flex;
  gap: 18px;
  margin-top: 48px;
  padding-top: 18px;
  border-top: 1px solid var(--border, rgba(10, 10, 10, 0.08));
  font-size: 13px;
}

[data-theme="dark"] .legal-nav {
  border-color: rgba(255, 255, 255, 0.08);
}

.legal-nav a {
  color: var(--muted, rgba(10, 10, 10, 0.65));
  text-decoration: none;
  font-weight: 600;
}

.legal-nav a:hover {
  color: var(--fg, #0a0a0a);
}

[data-theme="dark"] .legal-nav a:hover {
  color: #fafafa;
}

@media (max-width: 720px) {
  .legal {
    padding: 48px 20px 80px;
  }
  .legal-body h2 {
    font-size: 19px;
    margin: 30px 0 10px;
  }
  .legal-body p,
  .legal-body li {
    font-size: 14.5px;
  }
  .legal-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
    font-size: 12.5px;
    -webkit-overflow-scrolling: touch;
  }
  .legal-table th,
  .legal-table td {
    padding: 8px 10px;
  }
  .legal-nav {
    gap: 14px;
    font-size: 12.5px;
  }
}
```

### `src/components/nav/Menu.tsx`

```tsx
"use client";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Close } from "@/components/primitives/icons";
import { EASE } from "@/components/primitives/Reveal";
import { useTheme } from "@/hooks/useTheme";
import { NAVLINKS, SITE } from "@/lib/constants";
type MenuProps = Readonly<{
  open: boolean;
  onClose: () => void;
}>;
export function Menu({ open, onClose }: MenuProps): React.ReactElement {
  const { theme, toggle } = useTheme();
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  const themeText = theme === "dark" ? "Light mode" : "Dark mode";
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="menu-top">
            <a href="#top" className="brand" onClick={onClose}>
              mzwakhe<span className="d">.</span>
            </a>
            <button type="button" className="closeb" aria-label="Close menu" onClick={onClose}>
              <Close />
            </button>
          </div>

          <nav className="menu-links" aria-label="Primary">
            {NAVLINKS.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={onClose}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.06, duration: 0.5, ease: EASE }}
              >
                <span className="n">{link.n}</span>
                {link.t}
              </motion.a>
            ))}
          </nav>

          <div className="menu-foot">
            <a href="/recruiter" onClick={onClose}>
              Download CV
            </a>
            <a href={`mailto:${SITE.email}`} onClick={onClose}>
              {SITE.email}
            </a>
            <a href={SITE.phoneHref} onClick={onClose}>
              {SITE.phone}
            </a>
            <a
              role="button"
              onClick={() => {
                toggle();
              }}
            >
              {themeText}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### `src/components/nav/Nav.tsx`

```tsx
"use client";
import { Chat, Dots, Moon, Sun } from "@/components/primitives/icons";
import { EASE } from "@/components/primitives/Reveal";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";
type NavProps = Readonly<{
  onOpenMenu: () => void;
}>;
export function Nav({ onOpenMenu }: NavProps): React.ReactElement {
  const { theme, toggle } = useTheme();
  return (
    <motion.nav
      className="nav"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
    >
      <div className="wrap nav-in">
        <a href="#top" className="brand">
          mzwakhe<span className="d">.</span>
        </a>
        <div className="pills">
          <button type="button" className="tbtn" aria-label="Toggle theme" onClick={toggle}>
            {theme === "light" ? <Moon /> : <Sun />}
          </button>
          <a href="#contact" className="pill pill-light">
            <span className="t">Let&apos;s talk</span>
            <span className="ic">
              <Chat />
            </span>
          </a>
          <button type="button" className="pill pill-dark" onClick={onOpenMenu}>
            Menu
            <span className="ic">
              <Dots />
            </span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
```

### `src/components/nav/NavMenu.tsx`

```tsx
"use client";
import { useCallback, useState } from "react";
import { Menu } from "./Menu";
import { Nav } from "./Nav";
export function NavMenu(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const onOpenMenu = useCallback((): void => setOpen(true), []);
  const onClose = useCallback((): void => setOpen(false), []);
  return (
    <>
      <Nav onOpenMenu={onOpenMenu} />
      <Menu open={open} onClose={onClose} />
    </>
  );
}
```

### `src/components/primitives/Progress.tsx`

```tsx
"use client";
import { motion, useScroll, useSpring } from "framer-motion";
export function Progress(): React.ReactElement {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 130, damping: 28, mass: 0.3 });
  return <motion.div className="progress" style={{ scaleX: x }} />;
}
```

### `src/components/primitives/Reveal.tsx`

```tsx
"use client";
import type { ElementType, ReactNode, CSSProperties } from "react";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
export const EASE = [0.22, 1, 0.36, 1] as const;
type RevealProps = Readonly<{
  children: ReactNode;
  y?: number;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
}>;
export function Reveal({
  children,
  y = 38,
  delay = 0,
  className,
  style,
  as = "div",
}: RevealProps): React.ReactElement {
  const [ref, seen] = useInView();
  const Tag = (motion as unknown as Record<string, ElementType>)[as as string] ?? motion.div;
  return (
    <Tag
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      animate={seen ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}
```

### `src/components/primitives/SmoothScroll.tsx`

```tsx
"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { lenisBus } from "@/lib/lenis-bus";
type SmoothScrollProps = Readonly<{
  children: React.ReactNode;
}>;
export function SmoothScroll({ children }: SmoothScrollProps): React.ReactElement {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });
    let rafId = 0;
    const raf = (time: number): void => {
      lenis.raf(time);
      lenisBus.emit(
        (
          lenis as unknown as {
            scroll: number;
          }
        ).scroll ?? window.scrollY,
      );
      rafId = window.requestAnimationFrame(raf);
    };
    rafId = window.requestAnimationFrame(raf);
    return () => {
      window.cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
  return <>{children}</>;
}
```

### `src/components/primitives/StackScaleEffect.tsx`

```tsx
"use client";
import { useEffect } from "react";

const BASE_TOP = 80;
const STEP = 48;
const SCALE_PER_LAYER = 0.05;
const SCALE_RANGE = 320;

export function StackScaleEffect(): null {
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".svc-card"));
    if (cards.length < 2) return;

    const absTop = (el: HTMLElement): number => {
      let t = 0;
      let n: HTMLElement | null = el;
      while (n) {
        t += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      return t;
    };

    let dock: number[] = [];
    const measure = (): void => {
      dock = cards.map((c, i) => absTop(c) - (BASE_TOP + i * STEP));
    };

    const apply = (): void => {
      const y = window.scrollY;
      for (let i = 0; i < cards.length; i++) {
        let reduction = 0;
        for (let j = i + 1; j < cards.length; j++) {
          const remaining = dock[j] - y;
          if (remaining <= 0) reduction += SCALE_PER_LAYER;
          else if (remaining < SCALE_RANGE)
            reduction += SCALE_PER_LAYER * (1 - remaining / SCALE_RANGE);
        }
        cards[i].style.transform = reduction > 0 ? `scale(${(1 - reduction).toFixed(4)})` : "";
      }
    };

    let rafId = 0;
    const onScroll = (): void => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        apply();
      });
    };

    measure();
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    const onResize = (): void => {
      measure();
      apply();
    };
    window.addEventListener("resize", onResize);

    return (): void => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      for (const c of cards) c.style.transform = "";
    };
  }, []);
  return null;
}
```

### `src/components/primitives/Toaster.tsx`

```tsx
"use client";
import { Toaster as HotToaster } from "react-hot-toast";
export function Toaster(): React.ReactElement {
  return (
    <HotToaster
      position="top-center"
      gutter={8}
      toastOptions={{
        duration: 4500,
        style: {
          background: "#0a0a0a",
          color: "#fafafa",
          border: "1px solid var(--border, rgba(255,255,255,0.08))",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "14px",
        },
        success: { iconTheme: { primary: "#10b981", secondary: "#0a0a0a" } },
        error: { iconTheme: { primary: "#ef4444", secondary: "#0a0a0a" }, duration: 6000 },
      }}
    />
  );
}
```

### `src/components/primitives/icons.tsx`

```tsx
type IconProps = Readonly<{
  className?: string;
}>;
const ROUND = { strokeLinecap: "round", strokeLinejoin: "round" } as const;
export function Chat({ className }: IconProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...ROUND}
      className={className}
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
    </svg>
  );
}
export function Dots({ className }: IconProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <circle cx="8" cy="12" r="1.7" />
      <circle cx="16" cy="12" r="1.7" />
    </svg>
  );
}
export function Close({ className }: IconProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
export function Arrow({ className }: IconProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      {...ROUND}
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
export function Up({ className }: IconProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      {...ROUND}
      className={className}
      aria-hidden="true"
    >
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}
export function Cal({ className }: IconProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...ROUND}
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  );
}
export function Sun({ className }: IconProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  );
}
export function Moon({ className }: IconProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}
export function IconLock({ className }: IconProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      {...ROUND}
      className={className}
      aria-hidden="true"
    >
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
export function IconMail({ className }: IconProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...ROUND}
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}
export function IconUser({ className }: IconProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...ROUND}
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}
export function IconBuild({ className }: IconProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...ROUND}
      className={className}
      aria-hidden="true"
    >
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M9 7h0M15 7h0M9 11h0M15 11h0M9 15h0M15 15h0" />
    </svg>
  );
}
export function IconBrief({ className }: IconProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...ROUND}
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
export function IconLink({ className }: IconProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...ROUND}
      className={className}
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
    </svg>
  );
}
export function IconBack({ className }: IconProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      {...ROUND}
      className={className}
      aria-hidden="true"
    >
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}
export function IconCheck({ className }: IconProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      {...ROUND}
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}
export function IconDown({ className }: IconProps): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      {...ROUND}
      className={className}
      aria-hidden="true"
    >
      <path d="M12 4v12M7 11l5 5 5-5M5 20h14" />
    </svg>
  );
}
```

### `src/components/privacy/ConsentBanner.tsx`

```tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useConsent, ACCEPT_ALL, DEFAULT_REJECTED } from "./ConsentProvider";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  inventoryByCategory,
  type CookieCategory,
} from "@/lib/privacy/cookies";
import type { ConsentChoices } from "@/lib/privacy/consent";
import "./consent.css";
export function ConsentBanner(): React.ReactElement | null {
  const { record, resolved, save, open, close } = useConsent();
  const [customising, setCustomising] = useState(false);
  const [draft, setDraft] = useState<ConsentChoices>(() => record?.choices ?? DEFAULT_REJECTED);
  const visible = !resolved || open;
  const openCustomise = (): void => {
    setDraft(record?.choices ?? DEFAULT_REJECTED);
    setCustomising(true);
  };
  const dismiss = (): void => {
    setCustomising(false);
    close();
  };
  const toggle = (cat: CookieCategory): void => {
    if (CATEGORY_META[cat].alwaysOn) return;
    setDraft((d) => ({ ...d, [cat]: !d[cat as Exclude<CookieCategory, "necessary">] }));
  };
  return (
    <AnimatePresence>
      {visible ? (
        <motion.aside
          className="consent"
          role="dialog"
          aria-modal="false"
          aria-labelledby="consent-title"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="consent-inner">
            {!customising ? (
              <>
                <div className="consent-copy">
                  <h2 id="consent-title">Your privacy</h2>
                  <p>
                    I use cookies to keep you signed in to <strong>/recruiter</strong> and remember
                    your preferences. Read the <Link href="/legal/cookies">Cookie Policy</Link> and{" "}
                    <Link href="/legal/privacy">Privacy Policy</Link> for details. You can change
                    your mind anytime.
                  </p>
                </div>
                <div className="consent-actions">
                  <button
                    type="button"
                    className="consent-btn consent-btn-ghost"
                    onClick={() => void save(DEFAULT_REJECTED, "withdraw")}
                  >
                    Reject non-essential
                  </button>
                  <button
                    type="button"
                    className="consent-btn consent-btn-ghost"
                    onClick={openCustomise}
                  >
                    Customise
                  </button>
                  <button
                    type="button"
                    className="consent-btn consent-btn-primary"
                    onClick={() => void save(ACCEPT_ALL, "grant")}
                  >
                    Accept all
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="consent-copy">
                  <h2 id="consent-title">Customise cookies</h2>
                  <p>
                    Choose which categories you allow. Strictly necessary cookies can&apos;t be
                    turned off because the site needs them to function.
                  </p>
                </div>
                <ul className="consent-list">
                  {CATEGORY_ORDER.map((cat) => {
                    const meta = CATEGORY_META[cat];
                    const checked =
                      cat === "necessary" ? true : draft[cat as "functional" | "analytics"];
                    const items = inventoryByCategory(cat);
                    return (
                      <li key={cat} className="consent-row">
                        <div className="consent-row-head">
                          <label className="consent-toggle">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={meta.alwaysOn}
                              onChange={() => toggle(cat)}
                              aria-label={`Toggle ${meta.label} cookies`}
                            />
                            <span className="consent-toggle-knob" aria-hidden="true" />
                          </label>
                          <div>
                            <strong>{meta.label}</strong>
                            {meta.alwaysOn ? <span className="consent-pill">Always on</span> : null}
                            <p>{meta.description}</p>
                          </div>
                        </div>
                        {items.length > 0 ? (
                          <details className="consent-details">
                            <summary>
                              {items.length} {items.length === 1 ? "item" : "items"} in this
                              category
                            </summary>
                            <ul>
                              {items.map((c) => (
                                <li key={c.name}>
                                  <code>{c.name}</code>
                                  <span>· {c.purpose}</span>
                                </li>
                              ))}
                            </ul>
                          </details>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                <div className="consent-actions">
                  <button
                    type="button"
                    className="consent-btn consent-btn-ghost"
                    onClick={() => setCustomising(false)}
                  >
                    Back
                  </button>
                  <button type="button" className="consent-btn consent-btn-ghost" onClick={dismiss}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="consent-btn consent-btn-primary"
                    onClick={() => {
                      void save(draft, "update");
                      setCustomising(false);
                    }}
                  >
                    Save preferences
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
```

### `src/components/privacy/ConsentProvider.tsx`

```tsx
"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ACCEPT_ALL,
  CONSENT_COOKIE,
  CONSENT_COOKIE_MAX_AGE,
  DEFAULT_REJECTED,
  parseConsent,
  serializeConsent,
  type ConsentChoices,
  type ConsentRecord,
} from "@/lib/privacy/consent";
type ConsentAction = "grant" | "withdraw" | "update";
type ConsentContextValue = Readonly<{
  record: ConsentRecord | null;
  resolved: boolean;
  save: (choices: ConsentChoices, action?: ConsentAction) => Promise<void>;
  reopen: () => void;
  open: boolean;
  close: () => void;
}>;
const ConsentContext = createContext<ConsentContextValue | null>(null);
const NOOP_CONSENT: ConsentContextValue = {
  record: null,
  resolved: true,
  save: async () => {},
  reopen: () => {},
  open: false,
  close: () => {},
};
export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  return ctx ?? NOOP_CONSENT;
}
function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? match[1] : null;
}
function writeCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === "undefined") return;
  const isSecure = typeof location !== "undefined" && location.protocol === "https:";
  document.cookie =
    `${name}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax` + (isSecure ? "; Secure" : "");
}
export function ConsentProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [record, setRecord] = useState<ConsentRecord | null>(null);
  const [resolved, setResolved] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const raw = readCookie(CONSENT_COOKIE);
    const parsed = parseConsent(raw);
    setRecord(parsed);
    setResolved(parsed !== null);
  }, []);
  const save = useCallback(
    async (choices: ConsentChoices, action: ConsentAction = "update"): Promise<void> => {
      writeCookie(CONSENT_COOKIE, serializeConsent(choices), CONSENT_COOKIE_MAX_AGE);
      const next: ConsentRecord = {
        v: parseConsent(serializeConsent(choices))?.v ?? "",
        ts: Date.now(),
        choices,
      };
      setRecord(next);
      setResolved(true);
      setOpen(false);
      try {
        await fetch("/api/privacy/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, choices }),
        });
      } catch {}
    },
    [],
  );
  const reopen = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const value = useMemo<ConsentContextValue>(
    () => ({ record, resolved, save, reopen, open, close }),
    [record, resolved, save, reopen, open, close],
  );
  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}
export { ACCEPT_ALL, DEFAULT_REJECTED };
```

### `src/components/privacy/consent.css`

```css
.consent {
  position: fixed;
  bottom: 16px;
  left: 16px;
  right: 16px;
  z-index: 9999;
  max-width: 720px;
  margin: 0 auto;
  border-radius: 16px;
  background: #ffffff;
  color: #0a0a0a;
  border: 1px solid rgba(10, 10, 10, 0.08);
  box-shadow: 0 24px 60px -20px rgba(0, 0, 0, 0.24);
  font-family: var(--font-onest, ui-sans-serif, system-ui, sans-serif);
}

html[data-theme="dark"] .consent {
  background: #131313;
  color: #fafafa;
  border-color: rgba(255, 255, 255, 0.08);
}

.consent-inner {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.consent-copy h2 {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 6px;
}

.consent-copy p {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--muted, rgba(10, 10, 10, 0.65));
}

[data-theme="dark"] .consent-copy p {
  color: rgba(255, 255, 255, 0.7);
}

.consent-copy a {
  color: var(--candy, #2563eb);
  text-decoration: underline;
  font-weight: 600;
}

.consent-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.consent-btn {
  appearance: none;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.consent-btn-primary {
  background: #0a0a0a;
  color: #ffffff;
}

.consent-btn-primary:hover {
  background: #1f1f1f;
}

html[data-theme="dark"] .consent-btn-primary {
  background: #fafafa;
  color: #0a0a0a;
}

html[data-theme="dark"] .consent-btn-primary:hover {
  background: #ffffff;
}

.consent-btn-ghost {
  background: transparent;
  color: var(--fg, #0a0a0a);
  border-color: var(--border, rgba(10, 10, 10, 0.12));
}

.consent-btn-ghost:hover {
  background: rgba(10, 10, 10, 0.04);
}

[data-theme="dark"] .consent-btn-ghost {
  color: #fafafa;
  border-color: rgba(255, 255, 255, 0.16);
}

[data-theme="dark"] .consent-btn-ghost:hover {
  background: rgba(255, 255, 255, 0.06);
}

.consent-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.consent-row {
  border: 1px solid var(--border, rgba(10, 10, 10, 0.08));
  border-radius: 12px;
  padding: 12px 14px;
}

[data-theme="dark"] .consent-row {
  border-color: rgba(255, 255, 255, 0.08);
}

.consent-row-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.consent-row-head strong {
  font-size: 13px;
  font-weight: 700;
}

.consent-row-head p {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--muted, rgba(10, 10, 10, 0.6));
}

[data-theme="dark"] .consent-row-head p {
  color: rgba(255, 255, 255, 0.65);
}

.consent-pill {
  display: inline-block;
  margin-left: 8px;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(10, 10, 10, 0.06);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

[data-theme="dark"] .consent-pill {
  background: rgba(255, 255, 255, 0.1);
}

.consent-toggle {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 22px;
  flex-shrink: 0;
  margin-top: 2px;
}

.consent-toggle input {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.consent-toggle input:disabled {
  cursor: not-allowed;
}

.consent-toggle-knob {
  position: absolute;
  inset: 0;
  background: rgba(10, 10, 10, 0.16);
  border-radius: 999px;
  transition: background 0.15s ease;
}

.consent-toggle-knob::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: transform 0.18s ease;
}

.consent-toggle input:checked + .consent-toggle-knob {
  background: var(--candy, #2563eb);
}

.consent-toggle input:checked + .consent-toggle-knob::after {
  transform: translateX(14px);
}

.consent-toggle input:disabled + .consent-toggle-knob {
  opacity: 0.55;
}

.consent-details {
  margin-top: 10px;
}

.consent-details summary {
  font-size: 12px;
  color: var(--muted, rgba(10, 10, 10, 0.6));
  cursor: pointer;
}

[data-theme="dark"] .consent-details summary {
  color: rgba(255, 255, 255, 0.65);
}

.consent-details ul {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: grid;
  gap: 4px;
}

.consent-details li {
  font-size: 12px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.consent-details code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px;
  background: rgba(10, 10, 10, 0.06);
  padding: 1px 6px;
  border-radius: 6px;
}

[data-theme="dark"] .consent-details code {
  background: rgba(255, 255, 255, 0.08);
}

@media (min-width: 720px) {
  .consent-inner {
    flex-direction: row;
    align-items: center;
  }

  .consent-inner:has(.consent-list) {
    flex-direction: column;
    align-items: stretch;
  }

  .consent-copy {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .consent {
    bottom: 8px;
    left: 8px;
    right: 8px;
  }
  .consent-inner {
    padding: 14px 16px;
    gap: 12px;
  }
  .consent-copy h2 {
    font-size: 14px;
  }
  .consent-copy p {
    font-size: 12.5px;
  }
  .consent-actions {
    flex-direction: column;
    gap: 6px;
  }
  .consent-btn {
    width: 100%;
    padding: 11px 14px;
    font-size: 13px;
  }
}
```

### `src/components/recruiter/Approved.tsx`

```tsx
"use client";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { EASE } from "@/components/primitives/Reveal";
import { IconCheck, IconDown } from "@/components/primitives/icons";
import { Dots } from "./Dots";
import { SITE } from "@/lib/constants";
import { apiFetch } from "@/lib/api";
import type { RecruiterAccount } from "@/lib/recruiter";
type ApprovedProps = Readonly<{
  account: RecruiterAccount;
  onSignOut: () => void;
  onDeleted?: () => void;
}>;
export function Approved({ account, onSignOut, onDeleted }: ApprovedProps): React.ReactElement {
  const firstName = account.name.split(" ")[0];
  const fileName = SITE.cvHref.split("/").pop() ?? "Mzwakhe-Mokhatla-CV.pdf";
  const handleExport = (): void => {
    const link = document.createElement("a");
    link.href = "/api/recruiter/data";
    link.rel = "noopener";
    link.click();
  };
  const handleDelete = async (): Promise<void> => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Delete your account and all data we hold? This can't be undone. You'll need to request access again to download the CV.",
      )
    ) {
      return;
    }
    const res = await apiFetch<{
      ok: true;
    }>("/api/recruiter/account", {
      method: "DELETE",
    });
    if (!res.ok) return;
    toast.success("Your account and data were deleted.");
    if (onDeleted) onDeleted();
    else onSignOut();
  };
  return (
    <>
      <Dots step={3} />
      <motion.div
        className="seal"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        aria-hidden="true"
      >
        <IconCheck />
      </motion.div>
      <h1 className="t" style={{ textAlign: "center" }}>
        You&apos;re verified.
      </h1>
      <p className="sub" style={{ textAlign: "center", margin: "0 auto 22px" }}>
        Thanks, {firstName}. The full CV is unlocked for you on this device.
      </p>

      <div className="who">
        <span className="nm">{account.name}</span>
        <span className="meta">
          {account.role} · {account.company}
        </span>
        <span className="meta">{account.email}</span>
        <span className="badge">
          <IconCheck />
          Verified recruiter
        </span>
      </div>

      <a className="dl" href={SITE.cvHref} download={fileName}>
        Download CV (PDF)
        <IconDown />
      </a>

      <div style={{ textAlign: "center" }}>
        <button type="button" className="signout" onClick={onSignOut}>
          Not you? Sign out
        </button>
      </div>

      <details className="privacy-tools">
        <summary>Manage your data</summary>
        <p>
          Under GDPR and similar laws you can ask me for a copy of everything I hold about you or to
          delete it entirely.
        </p>
        <div className="privacy-tools-actions">
          <button type="button" className="signout" onClick={handleExport}>
            Export my data (JSON)
          </button>
          <button
            type="button"
            className="signout privacy-tools-delete"
            onClick={() => void handleDelete()}
          >
            Delete my account
          </button>
        </div>
      </details>
    </>
  );
}
```

### `src/components/recruiter/Dots.tsx`

```tsx
type DotsProps = Readonly<{
  step: number;
  total?: number;
}>;
export function Dots({ step, total = 4 }: DotsProps): React.ReactElement {
  return (
    <div className="dots">
      {Array.from({ length: total }, (_, i) => {
        const cls = i < step ? "done" : i === step ? "on" : "";
        return <i key={i} className={cls} />;
      })}
    </div>
  );
}
```

### `src/components/recruiter/Field.tsx`

```tsx
import type { ChangeEvent, ReactElement } from "react";
type FieldProps = Readonly<{
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "url";
  value: string;
  onChange: (next: string) => void;
  icon: ReactElement;
  error?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}>;
export function Field({
  name,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  icon,
  error,
  autoComplete,
  autoFocus,
}: FieldProps): React.ReactElement {
  const errorId = `${name}-error`;
  return (
    <div className={`field${error ? " invalid" : ""}`}>
      <label htmlFor={name}>{label}</label>
      <div className="inp">
        {icon}
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
      </div>
      <div className="err" id={errorId}>
        {error}
      </div>
    </div>
  );
}
```

### `src/components/recruiter/Gate.tsx`

```tsx
"use client";
import { Arrow, IconLock } from "@/components/primitives/icons";
import { Howto } from "./Howto";
type GateProps = Readonly<{
  onRequestAccess: () => void;
  onHaveAccess: () => void;
}>;
export function Gate({ onRequestAccess, onHaveAccess }: GateProps): React.ReactElement {
  return (
    <>
      <span className="eyebrow">
        <span className="lock">
          <IconLock />
        </span>
        Verified recruiter access
      </span>
      <h1 className="t">
        Download my CV, <span className="em">for verified recruiters.</span>
      </h1>
      <p className="sub">
        To keep my details with people who are actually hiring, the full CV sits behind a quick
        verification. Takes about a minute with your work email.
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        <button type="button" className="btn btn-primary" onClick={onRequestAccess}>
          Request access
          <Arrow />
        </button>
        <button type="button" className="btn btn-ghost" onClick={onHaveAccess}>
          I already have access
        </button>
      </div>

      <Howto />
    </>
  );
}
```

### `src/components/recruiter/Howto.tsx`

```tsx
export function Howto(): React.ReactElement {
  return (
    <details className="howto">
      <summary>
        <span className="pl">＋</span> How verification works
      </summary>
      <ol>
        <li>
          <b>Work email.</b> Personal inboxes are blocked, a company domain ties you to your
          organisation.
        </li>
        <li>
          <b>Email code.</b> A 6-digit code confirms you actually control that inbox.
        </li>
        <li>
          <b>Quick screen.</b> Your company, role and link are reviewed for a genuine hiring intent.
        </li>
        <li>
          <b>Access on file.</b> You can sign back in anytime to re-download, no re-verifying.
        </li>
      </ol>
      <p style={{ marginTop: 14, fontSize: 13, color: "var(--muted)", lineHeight: 1.45 }}>
        This is a front-end prototype: the code is shown on screen instead of emailed, and access is
        stored on your device. A production version adds server-side email delivery, expiring
        download links, and session security.
      </p>
    </details>
  );
}
```

### `src/components/recruiter/Otp.tsx`

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Arrow } from "@/components/primitives/icons";
import { Dots } from "./Dots";
const OTP_LENGTH = 6;
type OtpProps = Readonly<{
  email: string;
  onVerify: (entered: string) => void;
  error?: string;
  onResend: () => void;
}>;
export function Otp({ email, onVerify, error, onResend }: OtpProps): React.ReactElement {
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  useEffect(() => {
    refs.current[0]?.focus();
  }, []);
  const setAt = (i: number, value: string): void => {
    setDigits((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  };
  const handleChange = (i: number, e: ChangeEvent<HTMLInputElement>): void => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length === 0) {
      setAt(i, "");
      return;
    }
    if (raw.length === 1) {
      setAt(i, raw);
      const nextIndex = Math.min(i + 1, OTP_LENGTH - 1);
      refs.current[nextIndex]?.focus();
      return;
    }
    setDigits((prev) => {
      const next = [...prev];
      for (let k = 0; k < OTP_LENGTH - i && k < raw.length; k += 1) {
        next[i + k] = raw[k];
      }
      return next;
    });
    const last = Math.min(i + raw.length, OTP_LENGTH) - 1;
    refs.current[Math.max(last, 0)]?.focus();
  };
  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Backspace" && digits[i] === "" && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };
  const joined = digits.join("");
  const allFilled = joined.length === OTP_LENGTH;
  const handleVerify = (): void => onVerify(joined);
  return (
    <>
      <Dots step={1} />
      <h1 className="t">Check your inbox</h1>
      <p className="sub">
        Enter the 6-digit code sent to <b>{email}</b>{" "}
        to confirm it&apos;s yours.
      </p>

      <div className="otp" aria-label="Verification code">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            inputMode="numeric"
            maxLength={OTP_LENGTH}
            value={d}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
            aria-invalid={Boolean(error)}
          />
        ))}
      </div>

      {error ? (
        <div className="err" style={{ color: "var(--warn)", fontSize: 13, marginTop: 4 }}>
          {error}
        </div>
      ) : null}

      <button
        type="button"
        className="btn btn-primary"
        disabled={!allFilled}
        onClick={handleVerify}
        style={{ marginTop: 18 }}
      >
        Verify email
        <Arrow />
      </button>

      <div className="note">
        <span className="b">Heads up</span>
        <div>
          The code lands in your inbox within a few seconds and expires in 5 minutes. Didn&apos;t
          get it?{" "}
          <a
            role="button"
            tabIndex={0}
            onClick={onResend}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onResend();
            }}
            style={{ color: "var(--candy)", fontWeight: 700 }}
          >
            Resend
          </a>
        </div>
      </div>
    </>
  );
}
```

### `src/components/recruiter/Screening.tsx`

```tsx
"use client";
import { useEffect, useState } from "react";
import { IconCheck } from "@/components/primitives/icons";
import { domainOf, type ScreenResult } from "@/lib/recruiter";
import { Dots } from "./Dots";
const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
type ScreeningProps = Readonly<{
  email: string;
  screen: () => Promise<ScreenResult>;
  onDone: (result: ScreenResult) => void;
}>;
export function Screening({ email, screen, onDone }: ScreeningProps): React.ReactElement {
  const [emailOk, setEmailOk] = useState(false);
  const [domainOk, setDomainOk] = useState(false);
  const [screenOk, setScreenOk] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const run = async (): Promise<void> => {
      await wait(550);
      if (cancelled) return;
      setEmailOk(true);
      await wait(650);
      if (cancelled) return;
      setDomainOk(true);
      let result: ScreenResult;
      try {
        result = await screen();
      } catch {
        result = { decision: "approve", reason: "Verified via work email and domain." };
      }
      if (cancelled) return;
      setScreenOk(true);
      await wait(700);
      if (cancelled) return;
      onDone(result);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [screen, onDone]);
  return (
    <>
      <Dots step={2} />
      <div className="center">
        <div className="spinner" aria-hidden="true" />
        <h1 className="t">Verifying you…</h1>
        <p className="sub" style={{ margin: "0 auto 26px" }}>
          Confirming your details add up to a real hiring company.
        </p>
      </div>

      <div className="checks">
        <div className={`c${emailOk ? " ok" : ""}`}>
          <span className="ic">{emailOk ? <IconCheck /> : null}</span>
          Work email confirmed
        </div>
        <div className={`c${domainOk ? " ok" : ""}`}>
          <span className="ic">{domainOk ? <IconCheck /> : null}</span>
          Domain <b>{domainOf(email)}</b> checked
        </div>
        <div className={`c${screenOk ? " ok" : ""}`}>
          <span className="ic">{screenOk ? <IconCheck /> : null}</span>
          Reviewing company &amp; role
        </div>
      </div>
    </>
  );
}
```

### `src/components/recruiter/SignIn.tsx`

```tsx
"use client";
import { useState } from "react";
import { Arrow, IconBack, IconMail } from "@/components/primitives/icons";
import { Field } from "./Field";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type SignInProps = Readonly<{
  onBack: () => void;
  onCode: (email: string) => void;
  onNewHere: () => void;
}>;
export function SignIn({ onBack, onCode, onNewHere }: SignInProps): React.ReactElement {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(undefined);
    onCode(value);
  };
  return (
    <>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={onBack}
        aria-label="Back to gate"
        style={{ width: "auto", padding: "0 16px", height: 40, fontSize: 13, marginBottom: 16 }}
      >
        <IconBack />
        Back
      </button>
      <h1 className="t">Welcome back</h1>
      <p className="sub">Sign in with the work email you verified to download the CV again.</p>

      <form onSubmit={handleSubmit} noValidate>
        <Field
          name="signin-email"
          label="Work email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={setEmail}
          icon={<IconMail />}
          error={error}
          autoComplete="email"
          autoFocus
        />
        <button type="submit" className="btn btn-primary">
          Send sign-in code
          <Arrow />
        </button>
      </form>

      <div className="alt">
        New here?{" "}
        <a
          role="button"
          onClick={onNewHere}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onNewHere();
          }}
        >
          Request access
        </a>
      </div>
    </>
  );
}
```

### `src/components/recruiter/SignUp.tsx`

```tsx
"use client";
import { useState } from "react";
import {
  Arrow,
  IconBack,
  IconBrief,
  IconBuild,
  IconLink,
  IconMail,
  IconUser,
} from "@/components/primitives/icons";
import { emailRe } from "@/lib/recruiter";
import { Dots } from "./Dots";
import { Field } from "./Field";
export type SignUpData = Readonly<{
  name: string;
  email: string;
  company: string;
  role: string;
  url: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
}>;
type Errors = {
  name?: string;
  email?: string;
  company?: string;
  role?: string;
  url?: string;
  consent?: string;
};
type SignUpProps = Readonly<{
  initial?: Partial<SignUpData>;
  onBack: () => void;
  onSubmit: (data: SignUpData) => void;
  onAlreadyVerified: () => void;
}>;
export function SignUp({
  initial,
  onBack,
  onSubmit,
  onAlreadyVerified,
}: SignUpProps): React.ReactElement {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [acceptedTerms, setAcceptedTerms] = useState(initial?.acceptedTerms ?? false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(initial?.acceptedPrivacy ?? false);
  const [errors, setErrors] = useState<Errors>({});
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const next: Errors = {};
    const trim = (s: string) => s.trim();
    if (trim(name).length < 2) next.name = "Please enter your full name.";
    if (!emailRe.test(trim(email))) {
      next.email = "Enter a valid email address.";
    }
    if (trim(company).length < 2) next.company = "Which company are you with?";
    if (trim(role).length < 2) next.role = "What role are you hiring for?";
    if (trim(url).length < 4) next.url = "Company website or LinkedIn helps verify you.";
    if (!acceptedTerms || !acceptedPrivacy) {
      next.consent = "Please accept the Recruiter Terms and Privacy Policy to continue.";
    }
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    setErrors({});
    onSubmit({
      name: trim(name),
      email: trim(email),
      company: trim(company),
      role: trim(role),
      url: trim(url),
      acceptedTerms,
      acceptedPrivacy,
    });
  };
  return (
    <>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={onBack}
        aria-label="Back to gate"
        style={{ width: "auto", padding: "0 16px", height: 40, fontSize: 13, marginBottom: 16 }}
      >
        <IconBack />
        Back
      </button>
      <Dots step={0} />
      <h1 className="t">Request access</h1>
      <p className="sub">
        A few details so I know who&apos;s asking. Your work email is how I confirm you&apos;re with
        the company you name.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <Field
          name="name"
          label="Full name"
          placeholder="Jordan Pillay"
          value={name}
          onChange={setName}
          icon={<IconUser />}
          error={errors.name}
          autoComplete="name"
        />
        <Field
          name="email"
          label="Work email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={setEmail}
          icon={<IconMail />}
          error={errors.email}
          autoComplete="email"
        />
        <div className="row2">
          <Field
            name="company"
            label="Company"
            placeholder="Acme Talent"
            value={company}
            onChange={setCompany}
            icon={<IconBuild />}
            error={errors.company}
            autoComplete="organization"
          />
          <Field
            name="role"
            label="Hiring for"
            placeholder="Senior Frontend Engineer"
            value={role}
            onChange={setRole}
            icon={<IconBrief />}
            error={errors.role}
          />
        </div>
        <Field
          name="url"
          label="Company site or LinkedIn"
          placeholder="acme.com  ·  linkedin.com/in/…"
          value={url}
          onChange={setUrl}
          icon={<IconLink />}
          error={errors.url}
        />

        <div className="consent-checks">
          <label className="consent-check">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              aria-describedby={errors.consent ? "consent-error" : undefined}
            />
            <span>
              I agree to the{" "}
              <a href="/legal/terms" target="_blank" rel="noreferrer">
                Recruiter Terms
              </a>
              .
            </span>
          </label>
          <label className="consent-check">
            <input
              type="checkbox"
              checked={acceptedPrivacy}
              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
              aria-describedby={errors.consent ? "consent-error" : undefined}
            />
            <span>
              I&apos;ve read the{" "}
              <a href="/legal/privacy" target="_blank" rel="noreferrer">
                Privacy Policy
              </a>{" "}
              and understand how my details will be used.
            </span>
          </label>
          {errors.consent ? (
            <p id="consent-error" className="consent-check-err" role="alert">
              {errors.consent}
            </p>
          ) : null}
        </div>

        <button type="submit" className="btn btn-primary">
          Send verification code
          <Arrow />
        </button>
      </form>

      <div className="alt">
        Already verified?{" "}
        <a
          role="button"
          onClick={onAlreadyVerified}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onAlreadyVerified();
          }}
        >
          Sign in
        </a>
      </div>
    </>
  );
}
```

### `src/components/recruiter/TopBar.tsx`

```tsx
"use client";
import Link from "next/link";
import { IconBack, Moon, Sun } from "@/components/primitives/icons";
import { useTheme } from "@/hooks/useTheme";
export function TopBar(): React.ReactElement {
  const { theme, toggle } = useTheme();
  return (
    <div className="topbar">
      <div className="topbar-in">
        <Link href="/" className="brand">
          mzwakhe<span className="d">.</span>
        </Link>
        <div className="top-actions">
          <button type="button" className="tbtn" aria-label="Toggle theme" onClick={toggle}>
            {theme === "light" ? <Moon /> : <Sun />}
          </button>
          <Link href="/" className="backlink">
            <IconBack />
            Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### `src/components/sections/AISection.tsx`

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { Laptop, PhoneDevice, TabletDevice, WatchDevice } from "@/components/devices";
import { Reveal } from "@/components/primitives/Reveal";
import { AIITEMS } from "@/lib/constants";
type AISectionProps = Readonly<{
  showPhone?: boolean;
  showDesktop?: boolean;
  threshold?: number;
}>;
export function AISection({
  showPhone = true,
  showDesktop = true,
  threshold = 0.25,
}: AISectionProps = {}): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const [peakActive, setPeakActive] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setPeakActive(entry.intersectionRatio >= threshold),
      { threshold: [0, threshold / 2, threshold, threshold * 1.5, 1].filter((t) => t <= 1) },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return (
    <section ref={sectionRef} id="ai" className={`ai sec${peakActive ? " ai--peak" : ""}`}>
      <div className="wrap">
        <Reveal as="span" className="eyebrow">
          AI in the workflow
        </Reveal>
        <Reveal>
          <h2 className="ai-h">
            AI is part of <span className="em">how I build.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="ai-lead">
            I treat AI as everyday tooling, not a novelty, wired into the same review and
            observability loops I expect from production software.
          </p>
        </Reveal>

        <div className="ai-showcase">
          <div className="bg-fade" />

          <Reveal className="laptop">
            <Laptop />
          </Reveal>

          {showPhone ? (
            <Reveal className="phone" delay={0.1}>
              <PhoneDevice />
            </Reveal>
          ) : null}

          <Reveal className="watch" delay={0.15}>
            <WatchDevice />
          </Reveal>

          {showDesktop ? (
            <Reveal className="tablet" delay={0.12}>
              <TabletDevice />
            </Reveal>
          ) : null}

          <span className="dev-label" style={{ top: -8, left: 56 }}>
            AI Briefings
          </span>
          <span className="dev-label" style={{ bottom: 22, left: -28 }}>
            On your wrist
          </span>
          <span className="dev-label" style={{ bottom: -2, right: -14 }}>
            Full reporting
          </span>
        </div>

        <div className="ai-grid">
          {AIITEMS.map((item, i) => (
            <Reveal key={item.t} delay={(i % 2) * 0.06} style={{ height: "100%" }}>
              <div className="ai-item">
                <div className="ai-n">{String(i + 1).padStart(2, "0")}</div>
                <h3>{item.t}</h3>
                <p>{item.d}</p>
                <div className="ai-tools">
                  {item.tools.map((tool) => (
                    <span key={tool}>{tool}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### `src/components/sections/Contact.tsx`

```tsx
import { Cal, Chat } from "@/components/primitives/icons";
import { Reveal } from "@/components/primitives/Reveal";
import { SITE } from "@/lib/constants";
export function Contact(): React.ReactElement {
  return (
    <section id="contact" className="contact sec">
      <div className="wrap">
        <Reveal>
          <div className="contact-card">
            <div className="blob" aria-hidden="true" />
            <span className="eyebrow">Contact · Available 2026</span>
            <h2>
              Don&apos;t
              <br />
              be <span className="w2">shy.</span>
            </h2>

            <div className="c-actions">
              <a className="btn btn-primary" href={`mailto:${SITE.email}`}>
                Start a conversation
                <span className="ic">
                  <Chat />
                </span>
              </a>
              <a className="btn btn-light" href="/recruiter">
                Download CV
                <span className="ic">
                  <Cal />
                </span>
              </a>
            </div>

            <div className="c-meta">
              <a href={`mailto:${SITE.email}`}>
                <span className="k">Email</span>
                <span className="v">{SITE.email}</span>
              </a>
              <a href={SITE.phoneHref}>
                <span className="k">Phone</span>
                <span className="v">{SITE.phone}</span>
              </a>
              <div>
                <span className="k">Located</span>
                <span className="v">{SITE.location}</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

### `src/components/sections/Experience.tsx`

```tsx
import { Reveal } from "@/components/primitives/Reveal";
import { XP } from "@/lib/constants";
export function Experience(): React.ReactElement {
  return (
    <section id="experience" className="sec">
      <div className="wrap">
        <Reveal as="span" className="eyebrow">
          Experience
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            style={{
              fontWeight: 700,
              fontSize: "clamp(30px, 4.6vw, 60px)",
              letterSpacing: "-.035em",
              lineHeight: 1,
              marginBottom: 44,
              maxWidth: "18ch",
            }}
          >
            Five years building <span style={{ color: "var(--candy)" }}>at scale.</span>
          </h2>
        </Reveal>

        <div className="xp-list">
          {XP.map((row, i) => (
            <Reveal key={`${row.role}-${i}`} className="xp-row" delay={i * 0.04}>
              <div className="role">{row.role}</div>
              <div className="org">{row.org}</div>
              <div className="when">
                {row.now ? <span className="now">● </span> : null}
                {row.when}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### `src/components/sections/Footer.tsx`

```tsx
"use client";
import Link from "next/link";
import { Arrow, Chat, Up } from "@/components/primitives/icons";
import { SITE } from "@/lib/constants";
import { useConsent } from "@/components/privacy/ConsentProvider";
export function Footer(): React.ReactElement {
  const { reopen } = useConsent();
  const goUp = (): void => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-card">
          <div className="foot-big">
            Mzwakhe Mokhatla<span className="d">.</span>
          </div>
          <div className="foot-sub">
            Software Engineer · Full-Stack · Tech Lead, {SITE.location}
          </div>

          <div className="foot-bar">
            <div className="links">
              <a href={`mailto:${SITE.email}`}>
                Email
                <span className="ic">
                  <Chat />
                </span>
              </a>
              <a href={SITE.phoneHref}>
                Phone
                <span className="ic">
                  <Arrow />
                </span>
              </a>
              <a href="#work">
                Work
                <span className="ic">
                  <Arrow />
                </span>
              </a>
            </div>
            <button type="button" className="goup" onClick={goUp} aria-label="Scroll back to top">
              Go up
              <span className="ic">
                <Up />
              </span>
            </button>
          </div>

          <div className="foot-legal">
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/cookies">Cookies</Link>
            <Link href="/legal/terms">Terms</Link>
            <button type="button" className="foot-legal-btn" onClick={reopen}>
              Cookie preferences
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

### `src/components/sections/Hero.tsx`

```tsx
"use client";
import { EASE } from "@/components/primitives/Reveal";
import { SITE } from "@/lib/constants";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
export function Hero(): React.ReactElement {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yRender = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const yMark = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const cueFade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  return (
    <section id="top" className="hero" ref={ref}>
      <motion.div
        className="hero-mark"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: EASE }}
        style={{ y: yMark }}
      >
        mzwakhe
      </motion.div>

      <div className="hero-render-wrap">
        <motion.div
          className="hero-render"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.25 }}
          style={{ y: yRender }}
        >
          <div className="glowpad" />
          <Image
            src={SITE.portrait}
            alt={`Portrait of ${SITE.name}`}
            fill
            priority
            sizes="(min-width: 1280px) 620px, (min-width: 768px) 40vw, 64vw"
            style={{ objectFit: "cover", borderRadius: 26 }}
          />
        </motion.div>
      </div>

      <div className="wrap hero-foot">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
        >
          Turning ideas into <span className="em">digital realities.</span>
        </motion.h1>

        <motion.div
          className="scroll-cue"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{ opacity: cueFade }}
        >
          <motion.span
            className="dot"
            animate={{ scale: [1, 0.5, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
          Scroll
        </motion.div>
      </div>
    </section>
  );
}
```

### `src/components/sections/LogoBar.tsx`

```tsx
"use client";
import { siAccenture, siGeneralelectric } from "simple-icons";
import { Reveal } from "@/components/primitives/Reveal";

type Brand = Readonly<
  { name: string; ariaLabel: string } & (
    | { kind: "icon"; iconPath: string; viewBox?: string }
    | { kind: "text"; display: string }
  )
>;

const BRANDS: ReadonlyArray<Brand> = [
  {
    name: "Accenture",
    ariaLabel: "Accenture",
    kind: "icon",
    iconPath: siAccenture.path,
  },
  { name: "MTN Group", ariaLabel: "MTN Group", kind: "text", display: "MTN Group" },
  {
    name: "GE Smallworld",
    ariaLabel: "General Electric Smallworld",
    kind: "icon",
    iconPath: siGeneralelectric.path,
  },
  { name: "NMB Bank", ariaLabel: "NMB Bank", kind: "text", display: "NMB Bank" },
  { name: "Bayobab", ariaLabel: "Bayobab", kind: "text", display: "Bayobab" },
  { name: "Nybble", ariaLabel: "Nybble Technologies", kind: "text", display: "Nybble" },
  { name: "IST", ariaLabel: "IST", kind: "text", display: "IST" },
];

export function LogoBar(): React.ReactElement {
  return (
    <Reveal delay={0.12} className="logo-bar-wrap">
      <p className="logo-bar-eyebrow">Trusted across</p>
      <ul className="logo-bar" aria-label="Companies and products I've shipped with">
        {BRANDS.map((b) => (
          <li key={b.name} className="logo-bar-item">
            {b.kind === "icon" ? (
              <svg
                viewBox={b.viewBox ?? "0 0 24 24"}
                role="img"
                aria-label={b.ariaLabel}
                className="logo-bar-svg"
              >
                <path d={b.iconPath} fill="currentColor" />
              </svg>
            ) : (
              <span className="logo-bar-text" aria-label={b.ariaLabel}>
                {b.display}
              </span>
            )}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
```

### `src/components/sections/Services.tsx`

```tsx
import { Reveal } from "@/components/primitives/Reveal";
import { StackScaleEffect } from "@/components/primitives/StackScaleEffect";
import { SERVICES } from "@/lib/constants";
const TOTAL = SERVICES.length;
export function Services(): React.ReactElement {
  return (
    <section id="services" className="sec services-section">
      <div className="wrap services-head">
        <Reveal as="span" className="eyebrow">
          Services
        </Reveal>
        <Reveal delay={0.05} className="statement">
          <p>
            <span className="mut">What I do:</span> front-end-focused,{" "}
            <span className="em">full-stack capable.</span>
          </p>
        </Reveal>
      </div>

      <StackScaleEffect />
      <div className="stack">
        {SERVICES.map((s, i) => (
          <article
            key={s.w1}
            className={`svc-card svc-card--${i}`}
            style={
              {
                zIndex: i + 1,
                "--i": i,
                ...(i > 0 ? { marginTop: "12vh" } : {}),
              } as React.CSSProperties
            }
          >
            <span className="num">
              {String(i + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
            </span>

            <Reveal>
              <h3 className="svc-h">
                <span className="svc-h-l1">{s.w1}</span>
                <span className="svc-h-l2">{s.w2}</span>
              </h3>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="svc-pills">
                {s.pills.map((p) => (
                  <span key={p}>{p}</span>
                ))}
              </div>
              <div className="svc-desc">
                <span className="ast" aria-hidden="true">
                  ✳
                </span>
                <p>{s.d}</p>
              </div>
            </Reveal>
          </article>
        ))}

        <div className="stack-spacer" aria-hidden="true" />
      </div>
    </section>
  );
}
```

### `src/components/sections/Statement.tsx`

```tsx
import { Reveal } from "@/components/primitives/Reveal";
export function Statement(): React.ReactElement {
  return (
    <section id="about" className="sec">
      <div className="wrap">
        <Reveal as="span" className="eyebrow">
          About
        </Reveal>
        <Reveal delay={0.05} className="statement">
          <p>
            I&apos;m a full-stack engineer focused on turning your vision into{" "}
            <span className="em">production-ready</span> <span className="mut">software.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
```

### `src/components/sections/TransContinental.tsx`

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Reveal } from "@/components/primitives/Reveal";

type Location = Readonly<{
  id: string;
  city: string;
  country: string;
  org: string;
  role: string;
  when: string;
  order: number;
  lat: number;
  lng: number;
  offsetX?: number;
  offsetY?: number;
  labelAnchor?: "start" | "end";
}>;

const LOCATIONS: ReadonlyArray<Location> = [
  {
    id: "pretoria",
    city: "Pretoria",
    country: "South Africa",
    org: "IST",
    role: "Junior Software Developer",
    when: "Jan 2021 to Dec 2022",
    order: 1,
    lat: -25.73,
    lng: 28.19,
    offsetX: 70,
    offsetY: -110,
    labelAnchor: "start",
  },
  {
    id: "bryanston",
    city: "Bryanston",
    country: "South Africa",
    org: "Nybble Technologies",
    role: "Frontend Engineer",
    when: "Dec 2022 to Jun 2023",
    order: 2,
    lat: -26.05,
    lng: 28.03,
    offsetX: -90,
    offsetY: -30,
    labelAnchor: "end",
  },
  {
    id: "dar",
    city: "Dar es Salaam",
    country: "Tanzania",
    org: "Nybble · NMB Bank",
    role: "Frontend Engineer (e-Teller)",
    when: "Dec 2022 to Jun 2023",
    order: 3,
    lat: -6.79,
    lng: 39.21,
    offsetX: -30,
    labelAnchor: "end",
  },
  {
    id: "roodepoort",
    city: "Roodepoort",
    country: "South Africa",
    org: "MTN Group",
    role: "Software Engineer · Tech Lead",
    when: "Mar 2024 to Present",
    order: 4,
    lat: -26.17,
    lng: 27.87,
    offsetX: -90,
    offsetY: 70,
    labelAnchor: "end",
  },
  {
    id: "waterfall",
    city: "Waterfall",
    country: "South Africa",
    org: "Accenture",
    role: "Product & Platform Engineer",
    when: "Mar 2024 to Present",
    order: 5,
    lat: -25.99,
    lng: 28.13,
    offsetX: 70,
    offsetY: 30,
    labelAnchor: "start",
  },
];

const VB_W = 800;
const VB_H = 500;
const LAT_TOP = -4;
const LAT_BOTTOM = -32;
const LNG_LEFT = 17;
const LNG_RIGHT = 43;

function project(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - LNG_LEFT) / (LNG_RIGHT - LNG_LEFT)) * VB_W;
  const y = ((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * VB_H;
  return { x, y };
}

const COAST_PATH =
  "M 80 60 " +
  "Q 220 40 320 90 " +
  "Q 420 130 520 110 " +
  "Q 640 95 720 130 " +
  "Q 760 200 700 270 " +
  "Q 640 340 540 360 " +
  "Q 460 380 380 420 " +
  "Q 300 460 220 440 " +
  "Q 120 415 80 340 " +
  "Q 50 230 80 60 Z";

export function TransContinental(): React.ReactElement {
  const [activeId, setActiveId] = useState<string>(LOCATIONS[0].id);
  const active = LOCATIONS.find((l) => l.id === activeId) ?? LOCATIONS[0];
  const points = LOCATIONS.map((l) => {
    const p = project(l.lat, l.lng);
    return { ...l, x: p.x + (l.offsetX ?? 0), y: p.y + (l.offsetY ?? 0) };
  });
  const ordered = [...points].sort((a, b) => a.order - b.order);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(0);

  useEffect(() => {
    const el = pathRef.current;
    if (el && typeof el.getTotalLength === "function") {
      setPathLen(el.getTotalLength());
    }
  }, []);

  const journeyPath = ordered
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = ordered[i - 1];
      const cx = (prev.x + p.x) / 2;
      const cy = Math.min(prev.y, p.y) - 50;
      return `Q ${cx} ${cy} ${p.x} ${p.y}`;
    })
    .join(" ");

  return (
    <section id="transcontinental" className="sec trans-sec">
      <div className="wrap">
        <Reveal as="span" className="eyebrow">
          Transcontinental
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="trans-h">
            Two countries,<br />
            <span className="em">one team at a time.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="trans-lead">
            Every project on this site shipped from one of these benches. Tap a city to see who I
            was working with and what we built together.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="trans-shell">
          <div className="trans-map-wrap" role="figure" aria-label="Cities I have worked from">
            <svg
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              preserveAspectRatio="xMidYMid meet"
              className="trans-svg"
              aria-hidden="true"
            >
              <defs>
                <pattern
                  id="trans-grid"
                  width="22"
                  height="22"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="1.1" fill="currentColor" opacity="0.18" />
                </pattern>
                <radialGradient id="trans-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--candy)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--candy)" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width={VB_W} height={VB_H} fill="url(#trans-grid)" />

              <path
                d={COAST_PATH}
                fill="currentColor"
                opacity="0.045"
                stroke="currentColor"
                strokeOpacity="0.18"
                strokeWidth="1.2"
                strokeDasharray="2 6"
              />

              <path
                ref={pathRef}
                d={journeyPath}
                fill="none"
                stroke="var(--candy)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeDasharray={pathLen}
                strokeDashoffset={pathLen}
                style={{
                  transition: "stroke-dashoffset 1.8s ease 0.3s",
                  strokeDashoffset: 0,
                }}
              />

              {points.map((p) => {
                const isActive = p.id === activeId;
                return (
                  <g
                    key={p.id}
                    transform={`translate(${p.x}, ${p.y})`}
                    className={`trans-pin${isActive ? " trans-pin--active" : ""}`}
                    onClick={() => setActiveId(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveId(p.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${p.city}, ${p.country}: ${p.org}, ${p.role}`}
                    aria-pressed={isActive}
                  >
                    <circle r="22" fill="url(#trans-glow)" className="trans-pin-halo" />
                    <circle r="10" fill="var(--candy)" opacity="0.18" className="trans-pin-ring" />
                    <circle r="5" fill="var(--candy)" className="trans-pin-dot" />
                    <text
                      x={p.labelAnchor === "end" ? -12 : 12}
                      y="4"
                      textAnchor={p.labelAnchor === "end" ? "end" : "start"}
                      className="trans-pin-label"
                      fill="currentColor"
                      fontSize="13"
                      fontWeight="600"
                    >
                      {p.city}
                    </text>
                  </g>
                );
              })}
            </svg>

            <ul className="trans-chips" aria-label="Locations">
              {points.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className={`trans-chip${p.id === activeId ? " trans-chip--active" : ""}`}
                    onClick={() => setActiveId(p.id)}
                    aria-pressed={p.id === activeId}
                  >
                    <span className="trans-chip-dot" aria-hidden="true" />
                    {p.city}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <aside className="trans-panel" aria-live="polite">
            <span className="trans-panel-eyebrow">Now showing</span>
            <h3 className="trans-panel-city">
              {active.city}
              <span className="trans-panel-country">, {active.country}</span>
            </h3>
            <p className="trans-panel-org">{active.org}</p>
            <p className="trans-panel-role">{active.role}</p>
            <p className="trans-panel-when">{active.when}</p>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
```

### `src/components/sections/Work.tsx`

```tsx
"use client";
import { motion } from "framer-motion";
import { Reveal, EASE } from "@/components/primitives/Reveal";
import { LogoBar } from "@/components/sections/LogoBar";
import { WorkVisual } from "@/components/sections/WorkVisual";
import { WORK } from "@/lib/constants";
export function Work(): React.ReactElement {
  return (
    <section id="work" className="sec">
      <div className="wrap">
        <div className="work-head">
          <Reveal>
            <h2>
              A track record of turning ideas into{" "}
              <span style={{ color: "var(--candy)" }}>digital realities.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.06}>
            <p>
              Selected projects across telecom, consulting, fintech, and GIS, built and shipped end
              to end.
            </p>
          </Reveal>
        </div>

        <LogoBar />

        <div className="work-grid">
          {WORK.map((w, i) => (
            <Reveal key={w.slot} delay={(i % 2) * 0.08}>
              <motion.div
                className="work-card"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <div className="image-slot" aria-hidden="true" data-slot={w.slot}>
                  <WorkVisual slot={w.slot} />
                </div>
                <div className="ov">
                  <span className="tag">{w.tag}</span>
                  <div className="nm">{w.nm}</div>
                  <div className="og">{w.og}</div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### `src/components/sections/WorkVisual.tsx`

```tsx
type Props = Readonly<{ slot: string }>;

export function WorkVisual({ slot }: Props): React.ReactElement {
  switch (slot) {
    case "work-studiosync":
      return <PlatformVisual />;
    case "work-bayobab":
      return <PortalVisual />;
    case "work-eteller":
      return <FintechVisual />;
    case "work-gis":
      return <GisVisual />;
    default:
      return <PlatformVisual />;
  }
}

const BG_LIGHT = "var(--card-soft, #2f3236)";
const BG_DARK = "#0c1316";
const FG_TINT = "rgba(255,255,255,0.07)";
const FG_LINE = "rgba(255,255,255,0.16)";
const FG_TEXT = "rgba(255,255,255,0.6)";
const ACCENT = "var(--candy, #b2d5e5)";

function PlatformVisual(): React.ReactElement {
  return (
    <svg viewBox="0 0 600 412" preserveAspectRatio="xMidYMid slice" className="work-visual" aria-hidden="true">
      <defs>
        <linearGradient id="pv-bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={BG_LIGHT} />
          <stop offset="100%" stopColor={BG_DARK} />
        </linearGradient>
      </defs>
      <rect width="600" height="412" fill="url(#pv-bg)" />

      <rect x="32" y="32" width="116" height="348" rx="14" fill={FG_TINT} />
      {[64, 100, 136, 172, 208].map((y, i) => (
        <rect key={y} x="50" y={y} width={i === 0 ? 80 : 64 + (i % 2) * 12} height="10" rx="5" fill={i === 0 ? ACCENT : FG_LINE} opacity={i === 0 ? 1 : 0.7} />
      ))}

      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${172 + i * 132}, 32)`}>
          <rect width="120" height="92" rx="14" fill={FG_TINT} />
          <rect x="14" y="18" width="56" height="8" rx="4" fill={FG_TEXT} opacity="0.4" />
          <rect x="14" y="40" width={36 + i * 8} height="18" rx="4" fill={i === 1 ? ACCENT : "rgba(255,255,255,0.9)"} />
          <rect x="14" y="70" width="40" height="6" rx="3" fill={FG_TEXT} opacity="0.35" />
        </g>
      ))}

      <g transform="translate(172, 142)">
        <rect width="384" height="160" rx="16" fill={FG_TINT} />
        <rect x="18" y="18" width="120" height="10" rx="5" fill={FG_TEXT} opacity="0.5" />
        <polyline
          points="22,128 70,108 110,118 152,86 196,96 240,62 282,76 326,48 366,58"
          fill="none"
          stroke={ACCENT}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {[22, 70, 110, 152, 196, 240, 282, 326, 366].map((x, i) => {
          const ys = [128, 108, 118, 86, 96, 62, 76, 48, 58];
          return <circle key={x} cx={x} cy={ys[i]} r="3" fill={ACCENT} />;
        })}
      </g>

      <g transform="translate(172, 322)">
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${i * 132}, 0)`}>
            <rect width="120" height="58" rx="14" fill={FG_TINT} />
            <circle cx="18" cy="29" r="5" fill={i === 0 ? ACCENT : FG_LINE} />
            <rect x="32" y="20" width="68" height="8" rx="4" fill={FG_TEXT} opacity="0.5" />
            <rect x="32" y="34" width="48" height="6" rx="3" fill={FG_TEXT} opacity="0.32" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function PortalVisual(): React.ReactElement {
  return (
    <svg viewBox="0 0 600 412" preserveAspectRatio="xMidYMid slice" className="work-visual" aria-hidden="true">
      <defs>
        <linearGradient id="bv-bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={BG_LIGHT} />
          <stop offset="100%" stopColor={BG_DARK} />
        </linearGradient>
      </defs>
      <rect width="600" height="412" fill="url(#bv-bg)" />

      <rect x="44" y="48" width="512" height="316" rx="18" fill={FG_TINT} />
      <rect x="44" y="48" width="512" height="36" rx="18" fill="rgba(255,255,255,0.04)" />
      <circle cx="68" cy="66" r="5" fill="rgba(255,255,255,0.22)" />
      <circle cx="86" cy="66" r="5" fill="rgba(255,255,255,0.22)" />
      <circle cx="104" cy="66" r="5" fill="rgba(255,255,255,0.22)" />
      <rect x="138" y="58" width="280" height="16" rx="8" fill="rgba(255,255,255,0.08)" />

      <rect x="80" y="116" width="220" height="14" rx="7" fill={ACCENT} />
      <rect x="80" y="138" width="320" height="10" rx="5" fill={FG_LINE} />
      <rect x="80" y="156" width="240" height="10" rx="5" fill={FG_LINE} opacity="0.7" />

      {[0, 1].map((i) => (
        <g key={i} transform={`translate(80, ${200 + i * 56})`}>
          <rect width="280" height="44" rx="10" fill="rgba(255,255,255,0.05)" stroke={FG_LINE} />
          <rect x="16" y="18" width="120" height="8" rx="4" fill={FG_TEXT} opacity="0.4" />
        </g>
      ))}

      <g transform="translate(80, 320)">
        <rect width="160" height="44" rx="22" fill={ACCENT} />
        <rect x="32" y="18" width="96" height="8" rx="4" fill="rgba(6,24,31,0.8)" />
      </g>

      <g transform="translate(400, 116)">
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(0, ${i * 76})`}>
            <rect width="136" height="60" rx="12" fill="rgba(255,255,255,0.05)" />
            <rect x="14" y="14" width="60" height="8" rx="4" fill={FG_TEXT} opacity="0.5" />
            <rect x="14" y="30" width="100" height="8" rx="4" fill={FG_LINE} />
            <rect x="14" y="42" width="64" height="6" rx="3" fill={FG_TEXT} opacity="0.32" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function FintechVisual(): React.ReactElement {
  return (
    <svg viewBox="0 0 600 412" preserveAspectRatio="xMidYMid slice" className="work-visual" aria-hidden="true">
      <defs>
        <linearGradient id="fv-bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={BG_LIGHT} />
          <stop offset="100%" stopColor={BG_DARK} />
        </linearGradient>
        <linearGradient id="fv-card" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#1d2530" />
          <stop offset="100%" stopColor="#0a1018" />
        </linearGradient>
      </defs>
      <rect width="600" height="412" fill="url(#fv-bg)" />

      <g transform="translate(60, 70) rotate(-6 130 80)">
        <rect width="260" height="160" rx="18" fill="url(#fv-card)" stroke="rgba(255,255,255,0.08)" />
        <rect x="22" y="34" width="36" height="26" rx="6" fill={ACCENT} opacity="0.85" />
        <rect x="28" y="40" width="24" height="3" rx="1.5" fill="rgba(0,0,0,0.35)" />
        <rect x="28" y="46" width="24" height="3" rx="1.5" fill="rgba(0,0,0,0.35)" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${22 + i * 56}, 90)`}>
            {[0, 1, 2, 3].map((j) => (
              <circle key={j} cx={j * 8} cy="0" r="2.6" fill="rgba(255,255,255,0.55)" />
            ))}
          </g>
        ))}
        <rect x="22" y="124" width="56" height="6" rx="3" fill="rgba(255,255,255,0.3)" />
        <rect x="22" y="134" width="80" height="8" rx="4" fill="rgba(255,255,255,0.7)" />
      </g>

      <g transform="translate(340, 56)">
        <rect width="216" height="300" rx="16" fill={FG_TINT} />
        <rect x="18" y="20" width="80" height="10" rx="5" fill={FG_TEXT} opacity="0.5" />
        <rect x="18" y="36" width="120" height="14" rx="7" fill={ACCENT} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(18, ${70 + i * 52})`}>
            <circle cx="14" cy="18" r="12" fill="rgba(255,255,255,0.06)" />
            <circle cx="14" cy="18" r="5" fill={i === 0 ? ACCENT : FG_LINE} />
            <rect x="36" y="8" width="120" height="8" rx="4" fill={FG_TEXT} opacity="0.55" />
            <rect x="36" y="22" width="80" height="6" rx="3" fill={FG_TEXT} opacity="0.3" />
            <rect x="160" y="14" width={32 + (i % 2) * 10} height="8" rx="4" fill={i % 2 === 0 ? ACCENT : "rgba(255,255,255,0.8)"} opacity={i % 2 === 0 ? 0.85 : 0.65} />
          </g>
        ))}
      </g>
    </svg>
  );
}

function GisVisual(): React.ReactElement {
  const nodes: ReadonlyArray<{ x: number; y: number; r: number; accent?: boolean }> = [
    { x: 90, y: 90, r: 6 },
    { x: 200, y: 130, r: 5 },
    { x: 320, y: 80, r: 7, accent: true },
    { x: 430, y: 150, r: 5 },
    { x: 510, y: 90, r: 5 },
    { x: 140, y: 250, r: 5 },
    { x: 270, y: 220, r: 6 },
    { x: 380, y: 280, r: 5 },
    { x: 480, y: 240, r: 6, accent: true },
    { x: 220, y: 340, r: 5 },
    { x: 360, y: 360, r: 5 },
  ];
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [1, 5], [2, 6], [3, 7], [4, 8],
    [5, 9], [6, 9], [6, 10], [7, 10], [8, 7],
  ];

  return (
    <svg viewBox="0 0 600 412" preserveAspectRatio="xMidYMid slice" className="work-visual" aria-hidden="true">
      <defs>
        <linearGradient id="gv-bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={BG_LIGHT} />
          <stop offset="100%" stopColor={BG_DARK} />
        </linearGradient>
        <pattern id="gv-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="600" height="412" fill="url(#gv-bg)" />
      <rect width="600" height="412" fill="url(#gv-grid)" />

      <path d="M 0 280 Q 150 240, 300 270 T 600 250" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      <path d="M 0 320 Q 180 290, 320 310 T 600 295" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
      <path d="M 0 200 Q 200 160, 380 190 T 600 180" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />

      {edges.map(([a, b], i) => {
        const A = nodes[a];
        const B = nodes[b];
        return (
          <line
            key={i}
            x1={A.x}
            y1={A.y}
            x2={B.x}
            y2={B.y}
            stroke={ACCENT}
            strokeOpacity="0.55"
            strokeWidth="1.4"
            strokeDasharray="3 4"
          />
        );
      })}

      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.r + 6} fill={n.accent ? ACCENT : "rgba(255,255,255,0.05)"} opacity={n.accent ? 0.18 : 1} />
          <circle cx={n.x} cy={n.y} r={n.r} fill={n.accent ? ACCENT : "rgba(255,255,255,0.85)"} />
        </g>
      ))}

      <g transform="translate(40, 360)">
        <rect width="120" height="6" rx="3" fill="rgba(255,255,255,0.18)" />
        <rect width="60" height="6" rx="3" fill={ACCENT} />
        <rect y="14" width="48" height="6" rx="3" fill="rgba(255,255,255,0.12)" />
      </g>
    </svg>
  );
}
```

---

## Appendix · src/app

### `src/app/api/admin/whitelist/route.ts`

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { HttpError, requireAdmin } from "@/lib/auth/admin";
export async function GET(): Promise<Response> {
  try {
    await requireAdmin();
    const entries = await db.adminWhitelist.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, email: true, name: true, addedBy: true, createdAt: true },
    });
    return NextResponse.json({ entries });
  } catch (err) {
    return errorResponse(err);
  }
}
export async function POST(request: Request): Promise<Response> {
  try {
    const ctx = await requireAdmin();
    const payload = (await request.json().catch(() => null)) as {
      email?: unknown;
      name?: unknown;
    } | null;
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
    const name = typeof payload?.name === "string" ? payload.name.trim() : "";
    if (!email || !email.includes("@")) {
      throw new HttpError(400, "A valid email is required.");
    }
    if (!name) {
      throw new HttpError(400, "Name is required.");
    }
    const created = await db.adminWhitelist.upsert({
      where: { email },
      update: { name },
      create: { email, name, addedBy: ctx.email },
    });
    return NextResponse.json({ entry: created }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
function errorResponse(err: unknown): Response {
  if (err instanceof HttpError) {
    return NextResponse.json({ message: err.message }, { status: err.status });
  }
  console.error("[admin/whitelist]", err);
  return NextResponse.json({ message: "Unexpected error." }, { status: 500 });
}
```

### `src/app/api/auth/[...all]/route.ts`

```typescript
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/server";
export const { GET, POST } = toNextJsHandler(auth.handler);
```

### `src/app/api/privacy/consent/route.ts`

```typescript
import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/admin";
import { logConsent, type ConsentActionKind } from "@/lib/privacy/log";
const VALID_ACTIONS: readonly ConsentActionKind[] = [
  "grant",
  "withdraw",
  "update",
  "accept_terms",
  "accept_privacy",
];
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => null);
    const action = typeof body?.action === "string" ? body.action : "";
    if (!VALID_ACTIONS.includes(action as ConsentActionKind)) {
      return NextResponse.json({ message: "Invalid consent action." }, { status: 400 });
    }
    if (!body?.choices || typeof body.choices !== "object") {
      return NextResponse.json({ message: "choices payload missing." }, { status: 400 });
    }
    const ctx = await getSessionContext();
    await logConsent({
      userId: ctx?.userId,
      action: action as ConsentActionKind,
      payload: body.choices as Record<string, unknown>,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[privacy/consent]", err);
    return NextResponse.json({ message: "Could not record consent." }, { status: 500 });
  }
}
```

### `src/app/api/recruiter/account/route.ts`

```typescript
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/auth/admin";
export async function DELETE(): Promise<Response> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ message: "Sign in required." }, { status: 401 });
    }
    if (ctx.isAdmin) {
      return NextResponse.json(
        {
          message:
            "Admin accounts can't be deleted from here. Remove the email from the admin whitelist first.",
        },
        { status: 403 },
      );
    }
    const hdrs = await headers();
    try {
      await auth.api.signOut({ headers: hdrs });
    } catch {}
    await db.user.delete({ where: { id: ctx.userId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[recruiter/account] delete failed", err);
    return NextResponse.json({ message: "Could not delete account." }, { status: 500 });
  }
}
```

### `src/app/api/recruiter/data/route.ts`

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/auth/admin";
import { COOKIE_POLICY_VERSION, PRIVACY_POLICY_VERSION, TERMS_VERSION } from "@/lib/privacy/policy";
export async function GET(): Promise<Response> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ message: "Sign in required." }, { status: 401 });
    }
    const user = await db.user.findUnique({
      where: { id: ctx.userId },
      include: {
        recruiterProfile: true,
        sessions: { select: { id: true, ipAddress: true, userAgent: true, createdAt: true } },
        consentLogs: {
          select: { action: true, payload: true, policyVer: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!user) {
      return NextResponse.json({ message: "Account not found." }, { status: 404 });
    }
    const snapshot = {
      exportedAt: new Date().toISOString(),
      policyVersions: {
        privacy: PRIVACY_POLICY_VERSION,
        cookies: COOKIE_POLICY_VERSION,
        terms: TERMS_VERSION,
      },
      identity: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      consent: {
        termsAcceptedAt: user.acceptedTermsAt,
        privacyAcceptedAt: user.acceptedPrivacyAt,
        termsVersion: user.acceptedTermsVer,
        privacyVersion: user.acceptedPrivacyVer,
        log: user.consentLogs,
      },
      profile: user.recruiterProfile,
      sessions: user.sessions,
    };
    return new NextResponse(JSON.stringify(snapshot, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="my-data-${user.id}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[recruiter/data]", err);
    return NextResponse.json({ message: "Could not export data." }, { status: 500 });
  }
}
```

### `src/app/api/recruiter/screen/route.ts`

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/auth/admin";
import { fetchAccount } from "@/lib/auth/profile";
export async function POST(): Promise<Response> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return NextResponse.json({ message: "Sign in required." }, { status: 401 });
    const existing = await db.recruiterProfile.findUnique({ where: { userId: ctx.userId } });
    if (existing) {
      await db.recruiterProfile.update({
        where: { userId: ctx.userId },
        data: {
          decision: "approve",
          reason: ctx.isAdmin ? "Admin allowlist." : "Verified via work email and domain.",
          verifiedAt: new Date(),
        },
      });
    }
    const account = await fetchAccount(ctx.userId);
    return NextResponse.json({ account });
  } catch (err) {
    console.error("[recruiter/screen]", err);
    return NextResponse.json({ message: "Screening failed." }, { status: 500 });
  }
}
```

### `src/app/api/recruiter/session/route.ts`

```typescript
import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/admin";
import { fetchAccount } from "@/lib/auth/profile";
export async function GET(): Promise<Response> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return NextResponse.json({ account: null });
    const account = await fetchAccount(ctx.userId);
    return NextResponse.json({ account });
  } catch (err) {
    console.error("[recruiter/session]", err);
    return NextResponse.json({ message: "Could not load session." }, { status: 500 });
  }
}
```

### `src/app/api/recruiter/signin/start/route.ts`

```typescript
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { isWhitelisted } from "@/lib/auth/admin";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await request.json().catch(() => null);
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
    }
    const [user, admin] = await Promise.all([
      db.user.findUnique({ where: { email } }),
      isWhitelisted(email),
    ]);
    if (!user && !admin) {
      return NextResponse.json(
        { message: "No access found for that email. Request access instead." },
        { status: 404 },
      );
    }
    const hdrs = await headers();
    await auth.api.sendVerificationOTP({
      body: { email, type: "sign-in" },
      headers: hdrs,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[recruiter/signin/start]", err);
    return NextResponse.json({ message: "Could not send code." }, { status: 500 });
  }
}
```

### `src/app/api/recruiter/signin/verify/route.ts`

```typescript
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { isWhitelisted } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { fetchAccount } from "@/lib/auth/profile";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_RE = /^\d{6}$/;
export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await request.json().catch(() => null);
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
    const otp = typeof payload?.otp === "string" ? payload.otp.trim() : "";
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
    }
    if (!OTP_RE.test(otp)) {
      return NextResponse.json({ message: "Enter the 6-digit code." }, { status: 400 });
    }
    const hdrs = await headers();
    let session;
    try {
      session = await auth.api.signInEmailOTP({
        body: { email, otp },
        headers: hdrs,
        asResponse: false,
      });
    } catch (err) {
      const message =
        err instanceof Error && /expired|invalid|attempt/i.test(err.message)
          ? "That code doesn't match. Try again."
          : "Could not verify the code. Try again.";
      return NextResponse.json({ message }, { status: 401 });
    }
    if (!session?.user?.id) {
      return NextResponse.json({ message: "That code doesn't match. Try again." }, { status: 401 });
    }
    const admin = await isWhitelisted(email);
    if (admin) {
      const whitelist = await db.adminWhitelist.findUnique({ where: { email } });
      if (whitelist && session.user.name !== whitelist.name) {
        await db.user.update({
          where: { id: session.user.id },
          data: { name: whitelist.name, emailVerified: true },
        });
      }
    }
    const account = await fetchAccount(session.user.id);
    return NextResponse.json({ account });
  } catch (err) {
    console.error("[recruiter/signin/verify]", err);
    return NextResponse.json({ message: "Could not finish sign-in." }, { status: 500 });
  }
}
```

### `src/app/api/recruiter/signout/route.ts`

```typescript
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
export async function POST(): Promise<Response> {
  try {
    const hdrs = await headers();
    await auth.api.signOut({ headers: hdrs });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[recruiter/signout]", err);
    return NextResponse.json({ message: "Could not sign out." }, { status: 500 });
  }
}
```

### `src/app/api/recruiter/signup/start/route.ts`

```typescript
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { isWhitelisted } from "@/lib/auth/admin";
import { validateSignup } from "@/lib/auth/validation";
export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await request.json().catch(() => null);
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
    const adminGate = email ? await isWhitelisted(email) : false;
    const result = validateSignup(payload, { isAdmin: adminGate });
    if (!result.ok) {
      return NextResponse.json(
        { message: result.error.message, field: result.error.field },
        { status: 400 },
      );
    }
    const hdrs = await headers();
    await auth.api.sendVerificationOTP({
      body: { email: result.value.email, type: "sign-in" },
      headers: hdrs,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not send code.";
    console.error("[recruiter/signup/start]", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
```

### `src/app/api/recruiter/signup/verify/route.ts`

```typescript
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { isWhitelisted } from "@/lib/auth/admin";
import { fetchAccount } from "@/lib/auth/profile";
import { validateSignup } from "@/lib/auth/validation";
import { logConsent } from "@/lib/privacy/log";
import { PRIVACY_POLICY_VERSION, TERMS_VERSION } from "@/lib/privacy/policy";
const OTP_RE = /^\d{6}$/;
export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await request.json().catch(() => null);
    const otp = typeof payload?.otp === "string" ? payload.otp.trim() : "";
    if (!OTP_RE.test(otp)) {
      return NextResponse.json({ message: "Enter the 6-digit code." }, { status: 400 });
    }
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
    const adminGate = email ? await isWhitelisted(email) : false;
    const validation = validateSignup(payload, { isAdmin: adminGate });
    if (!validation.ok) {
      return NextResponse.json(
        { message: validation.error.message, field: validation.error.field },
        { status: 400 },
      );
    }
    const { value } = validation;
    const hdrs = await headers();
    let session;
    try {
      session = await auth.api.signInEmailOTP({
        body: { email: value.email, otp },
        headers: hdrs,
        asResponse: false,
      });
    } catch (err) {
      const message =
        err instanceof Error && /expired|invalid|attempt/i.test(err.message)
          ? "That code doesn't match. Try again."
          : "Could not verify the code. Try again.";
      return NextResponse.json({ message }, { status: 401 });
    }
    if (!session?.user?.id) {
      return NextResponse.json({ message: "That code doesn't match. Try again." }, { status: 401 });
    }
    const now = new Date();
    await db.$transaction([
      db.user.update({
        where: { id: session.user.id },
        data: {
          name: value.name,
          emailVerified: true,
          acceptedTermsAt: now,
          acceptedPrivacyAt: now,
          acceptedTermsVer: TERMS_VERSION,
          acceptedPrivacyVer: PRIVACY_POLICY_VERSION,
        },
      }),
      db.recruiterProfile.upsert({
        where: { userId: session.user.id },
        update: {
          company: value.company,
          role: value.role,
          url: value.url,
        },
        create: {
          userId: session.user.id,
          company: value.company,
          role: value.role,
          url: value.url,
        },
      }),
    ]);
    await Promise.all([
      logConsent({
        userId: session.user.id,
        action: "accept_terms",
        payload: { version: TERMS_VERSION },
      }),
      logConsent({
        userId: session.user.id,
        action: "accept_privacy",
        payload: { version: PRIVACY_POLICY_VERSION },
      }),
    ]);
    const account = await fetchAccount(session.user.id);
    return NextResponse.json({ account });
  } catch (err) {
    console.error("[recruiter/signup/verify]", err);
    return NextResponse.json({ message: "Could not finish sign-up." }, { status: 500 });
  }
}
```

### `src/app/error.tsx`

```tsx
"use client";
import { useEffect } from "react";
import toast from "react-hot-toast";
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}): React.ReactElement {
  useEffect(() => {
    toast.error("Something went wrong. We're recovering the page.");
    console.error("[global-error]", error);
  }, [error]);
  return (
    <main style={{ padding: "80px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>We hit a snag.</h1>
      <p style={{ opacity: 0.7, marginBottom: 24 }}>
        The page failed to load. Try refreshing, your session is safe.
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: "10px 18px",
          borderRadius: 999,
          border: "1px solid currentColor",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </main>
  );
}
```

### `src/app/globals.css`

```css
@import "tailwindcss";

:root {
  --onyx: #020202;
  --candy: #b2d5e5;
  --font: var(--font-onest), "Onest", system-ui, sans-serif;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  --r: 30px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
html {
  scroll-behavior: smooth;
}
body {
  background: var(--bg);
  background-image: var(--bg-grad);
  background-attachment: fixed;
  color: var(--fg);
  font-family: var(--font);
  font-size: 18px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  overflow-x: clip;
  transition:
    background-color 0.6s var(--ease),
    color 0.6s var(--ease);
}
a {
  color: inherit;
  text-decoration: none;
}
::selection {
  background: var(--candy);
  color: var(--accent-ink);
}
.wrap {
  width: min(1320px, 100% - 44px);
  margin-inline: auto;
}

html[data-theme="light"] {
  --bg: #e9f1f5;
  --bg-grad: linear-gradient(180deg, #eef5f8 0%, #e4f0f5 55%, #d6e9f1 100%);
  --fg: #06090b;
  --fg-2: #45555c;
  --muted: #7c8a91;
  --line: rgba(2, 8, 12, 0.1);
  --accent: var(--candy);
  --accent-ink: #06181f;
  --btn: #07090a;
  --btn-fg: #eef5f8;
  --pill: rgba(255, 255, 255, 0.62);
  --pill-line: rgba(255, 255, 255, 0.85);
  --glass-bg: rgba(255, 255, 255, 0.5);
  --glass-line: rgba(255, 255, 255, 0.75);
  --card: #0a0e10;

  --card-soft: #2f3236;
  --card-soft-fg: #f3f8fa;
  --card-soft-pill: rgba(255, 255, 255, 0.1);
  --card-soft-pill-line: rgba(255, 255, 255, 0.12);
  --card-fg: #f3f8fa;
  --card-2: #c3d0d6;
  --card-muted: #6d7b82;
  --card-pill: rgba(178, 213, 229, 0.1);
  --card-line: rgba(178, 213, 229, 0.2);
  --glow: rgba(178, 213, 229, 0.7);
}
html[data-theme="dark"] {
  --bg: #020202;
  --bg-grad:
    radial-gradient(80vw 60vw at 75% -10%, rgba(178, 213, 229, 0.1), transparent 60%), #020202;
  --fg: #eef5f8;
  --fg-2: #aebec6;
  --muted: #6c7d85;
  --line: rgba(178, 213, 229, 0.14);
  --accent: var(--candy);
  --accent-ink: #06181f;
  --btn: var(--candy);
  --btn-fg: #06181f;
  --pill: rgba(178, 213, 229, 0.07);
  --pill-line: rgba(178, 213, 229, 0.2);
  --glass-bg: rgba(178, 213, 229, 0.06);
  --glass-line: rgba(178, 213, 229, 0.18);
  --card: #0c1316;
  --card-soft: #1c2024;
  --card-soft-fg: #f3f8fa;
  --card-soft-pill: rgba(255, 255, 255, 0.08);
  --card-soft-pill-line: rgba(255, 255, 255, 0.1);
  --card-fg: #f3f8fa;
  --card-2: #aebec6;
  --card-muted: #5d6b72;
  --card-pill: rgba(178, 213, 229, 0.08);
  --card-line: rgba(178, 213, 229, 0.16);
  --glow: rgba(178, 213, 229, 0.4);
}

@theme inline {
  --color-bg: var(--bg);
  --color-fg: var(--fg);
  --color-fg-2: var(--fg-2);
  --color-muted: var(--muted);
  --color-line: var(--line);
  --color-accent: var(--accent);
  --color-btn: var(--btn);
  --color-btn-fg: var(--btn-fg);
  --color-card: var(--card);
  --color-card-fg: var(--card-fg);
  --color-card-muted: var(--card-muted);
  --color-onyx: var(--onyx);
  --color-candy: var(--candy);
  --font-sans: var(--font-onest);
}

@variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

#loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #020202;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  transition:
    opacity 0.7s ease,
    visibility 0.7s ease;
}
#loader.hide {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
.ld-ring {
  width: 48px;
  height: 48px;
  border: 2px solid rgba(178, 213, 229, 0.15);
  border-top-color: #b2d5e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.ld-brand {
  font-family: var(--font);
  font-weight: 800;
  font-size: 32px;
  color: #eef5f8;
  letter-spacing: -0.04em;
}
.ld-brand span {
  color: #b2d5e5;
}
.ld-sub {
  font-family: var(--font);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(178, 213, 229, 0.45);
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.progress {
  position: fixed;
  inset: 0 0 auto 0;
  height: 2px;
  background: var(--candy);
  transform-origin: 0 50%;
  z-index: 120;
}

.nav {
  position: fixed;
  inset: 14px 0 auto 0;
  z-index: 100;
}
.nav-in {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand {
  font-weight: 800;
  font-size: 26px;
  letter-spacing: -0.04em;
}
.brand .d {
  color: var(--candy);
}
.pills {
  display: flex;
  gap: 10px;
  align-items: center;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  height: 50px;
  padding: 0 10px 0 22px;
  border-radius: 40px;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.01em;
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    transform 0.2s var(--ease),
    filter 0.2s,
    background 0.2s,
    color 0.2s;
}
.pill .ic {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}
.pill:hover {
  transform: translateY(-1px);
}
.pill-light {
  background: var(--pill);
  border-color: var(--pill-line);
  color: var(--fg);
  backdrop-filter: blur(14px) saturate(160%);
  -webkit-backdrop-filter: blur(14px) saturate(160%);
  text-transform: uppercase;
  font-size: 12.5px;
  letter-spacing: 0.08em;
}
.pill-light .ic {
  background: var(--bg);
}
.pill-dark {
  background: var(--btn);
  color: var(--btn-fg);
  text-transform: uppercase;
  font-size: 12.5px;
  letter-spacing: 0.08em;
  padding-right: 8px;
}
.pill-dark .ic {
  background: rgba(255, 255, 255, 0.16);
}
html[data-theme="dark"] .pill-dark .ic {
  background: rgba(6, 24, 31, 0.22);
}
.tbtn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 1px solid var(--pill-line);
  background: var(--pill);
  color: var(--fg);
  display: grid;
  place-items: center;
  cursor: pointer;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: transform 0.2s;
}
.tbtn:hover {
  transform: translateY(-1px) rotate(8deg);
}
.tbtn svg {
  width: 19px;
  height: 19px;
}
@media (max-width: 720px) {
  .pills {
    gap: 8px;
  }
  .pill-light span.t,
  .pill-dark > :not(.ic):not(svg) {
    display: none;
  }
  .pill-dark {
    font-size: 0;
  }
  .pill,
  .tbtn {
    width: 44px;
    height: 44px;
    padding: 0;
    border-radius: 50%;
    gap: 0;
    justify-content: center;
  }
  .pill .ic {
    width: 22px;
    height: 22px;
    background: transparent;
  }
  .pill-dark .ic {
    background: transparent;
  }
  .tbtn svg {
    width: 18px;
    height: 18px;
  }
  .brand {
    font-size: 22px;
  }
}

.menu {
  position: fixed;
  inset: 0;
  z-index: 110;
  background: var(--card);
  color: var(--card-fg);
  display: flex;
  flex-direction: column;
  padding: 22px;
}
.menu-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.menu-top .brand {
  color: var(--card-fg);
}
.menu-top .brand .d {
  color: var(--candy);
}
.menu-links {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}
.menu-links a {
  font-weight: 700;
  font-size: clamp(40px, 8vw, 96px);
  letter-spacing: -0.04em;
  line-height: 1.02;
  color: var(--card-fg);
  width: max-content;
  display: flex;
  align-items: baseline;
  gap: 18px;
}
.menu-links a .n {
  font-size: 0.2em;
  color: var(--candy);
  font-weight: 600;
  letter-spacing: 0;
}
.menu-links a:hover {
  color: var(--candy);
}
.menu-foot {
  display: flex;
  gap: 22px;
  flex-wrap: wrap;
  color: var(--card-2);
  font-size: 14px;
}
.menu-foot a:hover {
  color: var(--candy);
}
.closeb {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 1px solid var(--card-line);
  background: var(--card-pill);
  color: var(--card-fg);
  display: grid;
  place-items: center;
  cursor: pointer;
}
.closeb svg {
  width: 20px;
  height: 20px;
}

.hero {
  position: relative;
  z-index: 1;
  min-height: 100svh;
  display: flex;
  align-items: center;
  overflow-x: clip;
  overflow-y: visible;
}
.hero-mark {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: clamp(150px, 27vw, 460px);
  letter-spacing: -0.06em;
  line-height: 0.8;
  color: var(--fg);
  white-space: nowrap;
  z-index: 1;
  pointer-events: none;
  user-select: none;
}
.hero-render-wrap {
  position: absolute;
  z-index: 2;
  top: 28%;
  left: 52%;
  height: clamp(720px, 108svh, 1260px);
  aspect-ratio: 3 / 4;
  width: auto;
}
.hero-render {
  position: relative;
  height: 100%;
  width: 100%;
}
.hero-render .glowpad {
  position: absolute;
  inset: -16% -10%;
  background: radial-gradient(closest-side, var(--glow), transparent 72%);
  filter: blur(10px);
  z-index: -1;
}
.hero-render img,
.hero-render .image-slot {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 26px;
  object-fit: cover;
}
.hero-foot {
  position: absolute;
  left: 0;
  right: 0;
  bottom: clamp(28px, 6vh, 70px);
  z-index: 3;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}
.hero-foot h1 {
  font-weight: 700;
  font-size: clamp(28px, 4.4vw, 56px);
  letter-spacing: -0.03em;
  line-height: 1.02;
  max-width: 18ch;
  text-wrap: balance;
}
.hero-foot h1 .em {
  color: var(--candy);
}
.scroll-cue {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
}
.scroll-cue .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--candy);
}
@media (max-width: 1024px) {
  .hero-mark {
    font-size: clamp(110px, 22vw, 240px);
  }
  .hero-render-wrap {
    height: clamp(320px, 56svh, 560px);
    top: 18%;
    left: 50%;
    transform: translateX(-12%);
  }
  .hero-foot h1 {
    font-size: clamp(34px, 5vw, 48px);
    max-width: 16ch;
  }
}
@media (max-width: 720px) {
  .hero {
    min-height: 92svh;
  }
  .hero-foot {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    bottom: 24px;
  }
  .hero-mark {
    font-size: clamp(64px, 22vw, 120px);
    letter-spacing: -0.07em;
  }
  .hero-render-wrap {
    height: auto;
    width: min(72vw, 320px);
    top: 17%;
    left: 50%;
    transform: translateX(-50%);
  }
  .hero-foot h1 {
    font-size: clamp(30px, 8vw, 42px);
    max-width: 14ch;
  }
}

.sec {
  padding: clamp(70px, 11vh, 130px) 0;
}
.eyebrow {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
}
.eyebrow::before {
  content: "";
  width: 26px;
  height: 1px;
  background: var(--candy);
}
.statement p {
  font-weight: 600;
  font-size: clamp(30px, 5.2vw, 72px);
  line-height: 1.04;
  letter-spacing: -0.035em;
  max-width: 20ch;
  text-wrap: balance;
}
.statement .mut {
  color: var(--muted);
}
.statement .em {
  color: var(--candy);
}

.services-section {
  background: #eef1f4;
  padding-bottom: clamp(60px, 8vh, 120px);
}
html[data-theme="dark"] .services-section {
  background: transparent;
}
.services-head {
  margin-bottom: 48px;
}
.services-head .statement-line {
  font-weight: 600;
  font-size: clamp(24px, 3.6vw, 48px);
  line-height: 1.1;
  letter-spacing: -0.025em;
  max-width: 22ch;
  text-wrap: balance;
  opacity: 0.6;
}
.services-head .statement-line .mut {
  color: var(--muted);
}
.services-head .statement-line .em {
  color: var(--candy);
}

.stack {
  width: min(1320px, 100% - 44px);
  margin: 32px auto 0;
}
.stack-spacer {
  height: 60vh;
}

.svc-card {
  position: sticky;
  top: calc(80px + var(--i, 0) * 48px);
  transform-origin: top center;
  display: flex;
  flex-direction: column;
  gap: clamp(28px, 4vw, 48px);
  border-radius: 32px;
  padding: clamp(22px, 2.4vw, 32px) clamp(24px, 3.5vw, 48px) clamp(28px, 4vw, 48px);
  min-height: clamp(320px, 52vh, 480px);
  color: #ffffff;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  box-shadow: 0 -24px 60px rgba(0, 0, 0, 0.38);
  overflow: hidden;
}

.svc-card--0 {
  background: #444a53;
}
.svc-card--1 {
  background: #242b35;
}
.svc-card--2 {
  background: #161d27;
}
.svc-card--3 {
  background: #050b16;
}

.svc-card .num {
  position: absolute;
  top: 24px;
  right: clamp(24px, 3vw, 40px);
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.22);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.svc-card .svc-h {
  font-family: inherit;
  font-weight: 700;
  font-size: clamp(44px, 5.5vw, 84px);
  line-height: 0.96;
  letter-spacing: -0.03em;
}
.svc-card .svc-h-l1,
.svc-card .svc-h-l2 {
  display: block;
}

.svc-card--0 .svc-h-l1 {
  color: rgba(255, 255, 255, 0.35);
}
.svc-card--1 .svc-h-l1 {
  color: rgba(255, 255, 255, 0.55);
}
.svc-card--2 .svc-h-l1 {
  color: rgba(255, 255, 255, 0.75);
}
.svc-card--3 .svc-h-l1 {
  color: rgba(255, 255, 255, 0.95);
}
.svc-card--0 .svc-h-l2 {
  color: rgba(255, 255, 255, 0.1);
}
.svc-card--1 .svc-h-l2 {
  color: rgba(255, 255, 255, 0.15);
}
.svc-card--2 .svc-h-l2 {
  color: rgba(255, 255, 255, 0.2);
}
.svc-card--3 .svc-h-l2 {
  color: rgba(255, 255, 255, 0.28);
}

.svc-card .svc-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.svc-card .svc-pills span {
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.svc-card .svc-desc {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-top: clamp(20px, 2.5vw, 32px);
  max-width: none;
}
.svc-card .svc-desc .ast {
  flex: none;
  display: inline-flex;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 3px;
  font-size: 14px;
}
.svc-card .svc-desc p {
  font-weight: 400;
  font-size: clamp(14px, 1.4vw, 17px);
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.6);
  text-wrap: pretty;
}

@media (max-width: 720px) {
  .svc-card {
    border-radius: 28px;
    padding: 20px 28px 44px;
    gap: 36px;
    min-height: clamp(380px, 62vh, 500px);
  }
  .svc-card .svc-pills span {
    padding: 5px 12px;
    font-size: 10px;
  }
  .svc-card .svc-desc p {
    font-size: 14px;
  }
}

.work-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 30px;
  flex-wrap: wrap;
  margin-bottom: 44px;
}
.work-head h2 {
  font-weight: 700;
  font-size: clamp(30px, 4.6vw, 60px);
  letter-spacing: -0.035em;
  line-height: 1;
  max-width: 20ch;
  text-wrap: balance;
}
.work-head p {
  color: var(--fg-2);
  max-width: 34ch;
  font-size: 16px;
}
.work-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}
.work-card {
  border-radius: var(--r);
  overflow: hidden;
  position: relative;
  background: var(--card);
  aspect-ratio: 16 / 11;
  display: block;
}
.work-card img,
.work-card .image-slot {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
.work-card .ov {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 26px 28px;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(
    0deg,
    rgba(2, 4, 6, 0.62) 0%,
    rgba(2, 4, 6, 0.12) 42%,
    transparent 70%
  );
}
.work-card .ov .nm {
  font-weight: 700;
  font-size: clamp(24px, 2.4vw, 34px);
  letter-spacing: -0.02em;
  color: #fff;
}
.work-card .ov .og {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.78);
  margin-top: 3px;
}
.work-card .ov .tag {
  position: absolute;
  top: 22px;
  left: 24px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #06181f;
  background: var(--candy);
  padding: 7px 13px;
  border-radius: 30px;
}
@media (max-width: 760px) {
  .work-grid {
    grid-template-columns: 1fr;
  }
}

.xp-list {
  border-top: 1px solid var(--line);
}
.xp-row {
  display: grid;
  grid-template-columns: 0.7fr 1.3fr 0.7fr;
  gap: 24px;
  padding: 30px 4px;
  border-bottom: 1px solid var(--line);
  align-items: center;
  transition: padding-left 0.3s var(--ease);
}
.xp-row:hover {
  padding-left: 18px;
}
.xp-row .role {
  font-weight: 700;
  font-size: clamp(20px, 2.2vw, 28px);
  letter-spacing: -0.02em;
}
.xp-row .org {
  color: var(--fg-2);
  font-size: 16px;
}
.xp-row .when {
  color: var(--muted);
  font-size: 14px;
  text-align: right;
  font-weight: 500;
}
.xp-row .when .now {
  color: var(--candy);
}
@media (max-width: 700px) {
  .xp-row {
    grid-template-columns: 1fr;
    gap: 4px;
    padding: 22px 4px;
  }
  .xp-row .when {
    text-align: left;
  }
}

.ai {
  overflow: hidden;
  background-color: transparent;
  color: var(--fg);
  transition:
    background-color 0.8s var(--ease),
    color 0.8s var(--ease);
}

.ai.ai--peak {
  background-color: #020202;
  color: #eef5f8;
}
.ai.ai--peak .eyebrow,
.ai.ai--peak .ai-lead,
.ai.ai--peak .ai-item p {
  color: rgba(238, 245, 248, 0.74);
}
.ai.ai--peak .ai-h .em,
.ai.ai--peak .ai-item .ai-n {
  color: var(--candy);
}
.ai.ai--peak .ai-item,
.ai.ai--peak .ai-tools span {
  border-color: rgba(238, 245, 248, 0.22);
}

html[data-theme="dark"] .ai.ai--peak {
  background-color: var(--candy);
  color: #06181f;
}
html[data-theme="dark"] .ai.ai--peak .eyebrow,
html[data-theme="dark"] .ai.ai--peak .ai-lead,
html[data-theme="dark"] .ai.ai--peak .ai-item p {
  color: rgba(6, 24, 31, 0.74);
}
html[data-theme="dark"] .ai.ai--peak .ai-h .em,
html[data-theme="dark"] .ai.ai--peak .ai-item .ai-n {
  color: #06181f;
}
html[data-theme="dark"] .ai.ai--peak .ai-item,
html[data-theme="dark"] .ai.ai--peak .ai-tools span {
  border-color: rgba(6, 24, 31, 0.22);
}

.ai .eyebrow,
.ai .ai-lead,
.ai .ai-item p {
  color: var(--muted);
  transition: color 0.8s var(--ease);
}
.ai .ai-h {
  font-weight: 700;
  font-size: clamp(34px, 6vw, 84px);
  letter-spacing: -0.04em;
  line-height: 0.98;
  max-width: 16ch;
  margin-bottom: 22px;
  text-wrap: balance;
}
.ai .ai-h .em {
  color: var(--accent);
  transition: color 0.8s var(--ease);
}
.ai-lead {
  font-size: clamp(17px, 1.8vw, 22px);
  max-width: 52ch;
  margin-bottom: clamp(40px, 6vw, 70px);
  line-height: 1.45;
}
.ai-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.ai-item {
  border: 1px solid var(--line);
  border-radius: 22px;
  padding: clamp(24px, 3vw, 40px);
  height: 100%;
  transition: border-color 0.8s var(--ease);
}
.ai-item .ai-n {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--accent);
  transition: color 0.8s var(--ease);
}
.ai-item h3 {
  font-weight: 700;
  font-size: clamp(22px, 2.4vw, 30px);
  letter-spacing: -0.02em;
  margin: 14px 0 12px;
}
.ai-item p {
  font-size: 16px;
  line-height: 1.5;
}
.ai-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}
.ai-tools span {
  font-size: 12.5px;
  font-weight: 500;
  border: 1px solid var(--line);
  padding: 6px 13px;
  border-radius: 30px;
  transition: border-color 0.8s var(--ease);
}
@media (max-width: 720px) {
  .ai-grid {
    grid-template-columns: 1fr;
  }
}

.ai-showcase {
  position: relative;

  max-width: 880px;
  margin: 10px auto 56px;
  min-height: 520px;
  padding: 30px 0;
}
.dev-label {
  position: absolute;
  font-family: var(--font);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted);
  opacity: 0.45;
  white-space: nowrap;
  pointer-events: none;
}
.ai-showcase .bg-fade {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 55%;
  background: linear-gradient(
    to right,
    transparent 0%,
    rgba(178, 213, 229, 0.06) 40%,
    rgba(178, 213, 229, 0.14) 100%
  );
  pointer-events: none;
  z-index: 0;
  border-radius: 24px;
  mask-image: linear-gradient(to left, black 60%, transparent);
  -webkit-mask-image: linear-gradient(to left, black 60%, transparent);
}
html[data-theme="light"] .ai-showcase .bg-fade {
  background: linear-gradient(
    to right,
    transparent 0%,
    rgba(2, 2, 2, 0.03) 40%,
    rgba(2, 2, 2, 0.08) 100%
  );
}
@media (max-width: 860px) {
  .ai-showcase {
    min-height: auto;
  }
  .laptop {
    width: 100%;
  }
  .phone,
  .watch,
  .tablet {
    position: static;
    margin: 20px auto 0;
  }
  .dev-label {
    display: none;
  }
}

.laptop {
  position: relative;
  z-index: 2;
  width: min(720px, 100%);
  margin: 0 auto;
  filter: drop-shadow(0 40px 60px rgba(0, 0, 0, 0.55)) drop-shadow(0 16px 24px rgba(0, 0, 0, 0.3));
}
.laptop-lid {
  background: #111416;
  border: 3px solid #2a2e31;
  border-bottom: none;
  border-radius: 14px 14px 0 0;
  aspect-ratio: 16 / 10;
  overflow: hidden;
}
.laptop-base {
  height: 16px;
  background: linear-gradient(180deg, #3a3e42, #2c3033);
  border-radius: 0 0 10px 10px;
  margin: 0 -2%;
  position: relative;
}
.laptop-notch {
  position: absolute;
  width: 16%;
  height: 5px;
  background: #3a3e42;
  border-radius: 0 0 5px 5px;
  top: 0;
  left: 42%;
}
.laptop-scr {
  padding: 0;
  background: #06090b;
  height: 100%;
  display: flex;
  overflow: hidden;
}
.ldash-side {
  width: 130px;
  background: #0a0e11;
  border-right: 1px solid rgba(178, 213, 229, 0.08);
  padding: 14px 0;
  flex: none;
}
.ldash-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px 14px;
  font-weight: 700;
  font-size: 12px;
  color: #eaf2f6;
}
.ldash-logo .ld {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  background: var(--candy);
}
.ldash-nav a {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  font-size: 11px;
  color: #6e7d85;
  text-decoration: none;
}
.ldash-nav a.on {
  color: #eaf2f6;
  background: rgba(178, 213, 229, 0.08);
  border-left: 2px solid var(--candy);
}
.ldash-nav a .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--candy);
}
.ldash-main {
  flex: 1;
  padding: 14px 16px;
  overflow: hidden;
}
.ldash-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.ldash-head h4 {
  font-size: 12px;
  font-weight: 700;
  color: #eaf2f6;
}
.ldash-head .badge {
  font-size: 9px;
  color: var(--candy);
  border: 1px solid rgba(178, 213, 229, 0.3);
  padding: 3px 8px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.ldash-head .badge i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #5fd09b;
}
.ldash-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-bottom: 12px;
}
.ldash-stat {
  background: rgba(178, 213, 229, 0.04);
  border: 1px solid rgba(178, 213, 229, 0.08);
  border-radius: 8px;
  padding: 8px;
}
.ldash-stat .sl {
  font-size: 8px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6e7d85;
}
.ldash-stat .sv {
  font-size: 16px;
  font-weight: 700;
  color: #eaf2f6;
  font-family: ui-monospace, monospace;
}
.ldash-stat .sd {
  font-size: 9px;
  color: var(--candy);
  margin-top: 2px;
}
.ldash-chart {
  display: flex;
  gap: 10px;
}
.ldash-ch {
  flex: 1;
  background: rgba(178, 213, 229, 0.04);
  border: 1px solid rgba(178, 213, 229, 0.08);
  border-radius: 8px;
  padding: 10px;
}
.ldash-ch .ct {
  font-size: 8px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6e7d85;
  margin-bottom: 8px;
}
.ldash-ins {
  flex: 0 0 38%;
}
.ldash-ins .it {
  font-size: 9px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--candy);
  font-weight: 700;
  margin-bottom: 6px;
}
.ldash-ins .ib {
  display: flex;
  gap: 6px;
  font-size: 10px;
  color: #aebec6;
  line-height: 1.35;
  margin-bottom: 5px;
}
.ldash-ins .ib .id {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #5fd09b;
  margin-top: 4px;
  flex: none;
}

.phone {
  position: absolute;
  z-index: 1;
  top: -20px;
  right: -30px;
  width: 180px;
  background: #0a0c0e;
  border: 5px solid #1a1e21;
  border-radius: 28px;
  overflow: hidden;
  filter: drop-shadow(0 30px 50px rgba(0, 0, 0, 0.5));
  color: #eaf2f6;
}
.phone-notch {
  width: 60px;
  height: 16px;
  background: #1a1e21;
  border-radius: 0 0 10px 10px;
  margin: 0 auto;
}
.phone-sb {
  display: flex;
  justify-content: space-between;
  padding: 6px 14px 4px;
  font-size: 9px;
  color: #7e96a0;
}
.phone-pad {
  padding: 10px 12px 16px;
}
.ph-card {
  background: rgba(178, 213, 229, 0.07);
  border: 1px solid rgba(178, 213, 229, 0.14);
  border-radius: 12px;
  padding: 10px;
}
.ph-card .h {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 11px;
  margin-bottom: 8px;
}
.ph-card .h .ai {
  font-size: 7px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #06181f;
  background: var(--candy);
  padding: 2px 5px;
  border-radius: 10px;
  margin-left: auto;
}
.ph-bul {
  display: flex;
  gap: 6px;
  font-size: 10px;
  color: #aebec6;
  margin-bottom: 5px;
  line-height: 1.35;
}
.ph-bul .d {
  color: var(--candy);
  font-weight: 700;
}
.ph-btn {
  height: 30px;
  border-radius: 8px;
  background: var(--candy);
  color: #06181f;
  font-weight: 700;
  font-size: 11px;
  display: grid;
  place-items: center;
  margin-top: 4px;
}

.watch {
  position: absolute;
  z-index: 3;
  bottom: 30px;
  left: -50px;
  width: 110px;
  height: 138px;
  background: #0a0c0e;
  border: 6px solid #1a1e21;
  border-radius: 32px;
  overflow: hidden;
  filter: drop-shadow(0 24px 40px rgba(0, 0, 0, 0.5));
  color: #eaf2f6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.watch-ring {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid rgba(178, 213, 229, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.watch-ring::before {
  content: "";
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 3px solid var(--candy);
  border-bottom-color: transparent;
  border-left-color: transparent;
}
.watch-val {
  font-size: 14px;
  font-weight: 800;
  color: #eaf2f6;
  font-family: ui-monospace, monospace;
}
.watch-lbl {
  font-size: 7px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #7e96a0;
  margin-top: 6px;
}

.tablet {
  position: absolute;
  z-index: 3;
  bottom: 10px;
  right: -40px;
  width: 220px;
  background: #0a0c0e;
  border: 4px solid #1a1e21;
  border-radius: 14px;
  overflow: hidden;
  filter: drop-shadow(0 28px 44px rgba(0, 0, 0, 0.5));
  color: #eaf2f6;
}
.tablet-scr {
  padding: 12px;
  background: #06090b;
}
.tab-head {
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tab-head .tbg {
  font-size: 8px;
  background: var(--candy);
  color: #06181f;
  padding: 2px 7px;
  border-radius: 10px;
  font-weight: 700;
}
.tab-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 8px;
}
.tab-st {
  background: rgba(178, 213, 229, 0.05);
  border: 1px solid rgba(178, 213, 229, 0.1);
  border-radius: 6px;
  padding: 6px;
}
.tab-st .tn {
  font-size: 14px;
  font-weight: 700;
  font-family: ui-monospace, monospace;
}
.tab-st .tl {
  font-size: 7px;
  color: #7e96a0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.tab-bar {
  height: 4px;
  background: rgba(178, 213, 229, 0.12);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}
.tab-bar div {
  height: 100%;
  width: 72%;
  background: var(--candy);
  border-radius: 4px;
}
.tab-digest {
  font-size: 9px;
  color: var(--candy);
  display: flex;
  align-items: center;
  gap: 5px;
}
.tab-digest i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #5fd09b;
}

.contact {
  position: relative;
}
.contact-card {
  background: var(--card);
  color: var(--card-fg);
  border-radius: var(--r);
  padding: clamp(40px, 7vw, 110px);
  position: relative;
  overflow: hidden;
  border: 1px solid var(--card-line);
}
.contact-card .blob {
  position: absolute;
  right: -8%;
  top: -30%;
  width: 56%;
  aspect-ratio: 1;
  background: radial-gradient(closest-side, var(--glow), transparent 70%);
  pointer-events: none;
}
.contact-card .eyebrow {
  color: var(--card-muted);
}
.contact-card h2 {
  font-weight: 700;
  font-size: clamp(64px, 14vw, 200px);
  line-height: 0.84;
  letter-spacing: -0.05em;
  margin-bottom: 36px;
  position: relative;
}
.contact-card h2 .w2 {
  color: var(--card-muted);
}
.c-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 52px;
  position: relative;
}
.c-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px 28px;
  border-top: 1px solid var(--card-line);
  position: relative;
}
.c-meta a,
.c-meta div {
  padding-top: 22px;
  min-width: 0;
}
.c-meta .k {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--card-muted);
  display: block;
  margin-bottom: 8px;
}
.c-meta .v {
  font-weight: 600;
  font-size: clamp(15px, 1.5vw, 19px);
  overflow-wrap: anywhere;
}
.c-meta a:hover .v {
  color: var(--candy);
}
@media (max-width: 880px) {
  .c-meta {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .c-meta a,
  .c-meta div {
    padding: 18px 0;
    border-top: 1px solid var(--card-line);
  }
}
@media (max-width: 640px) {
  .c-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .c-actions .btn {
    width: 100%;
    justify-content: space-between;
    padding-left: 22px;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  height: 56px;
  padding: 0 12px 0 26px;
  border-radius: 40px;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    transform 0.2s var(--ease),
    filter 0.2s;
}
.btn .ic {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}
.btn:hover {
  transform: translateY(-2px);
}
.btn-primary {
  background: var(--candy);
  color: #06181f;
}
.btn-primary .ic {
  background: rgba(6, 24, 31, 0.16);
}
.btn-light {
  background: var(--card-pill);
  color: var(--card-fg);
  border-color: var(--card-line);
}
.btn-light .ic {
  background: rgba(255, 255, 255, 0.1);
}

.foot {
  padding: 30px 0 40px;
}
.foot-card {
  background: var(--card);
  color: var(--card-fg);
  border-radius: var(--r);
  padding: clamp(36px, 6vw, 88px) clamp(28px, 5vw, 70px) clamp(28px, 4vw, 50px);
  border: 1px solid var(--card-line);
}
.foot-big {
  font-weight: 800;
  font-size: clamp(40px, 9vw, 132px);
  letter-spacing: -0.05em;
  line-height: 0.92;
  text-align: center;
}
.foot-big .d {
  color: var(--candy);
}
.foot-sub {
  text-align: center;
  color: var(--card-muted);
  margin-top: 14px;
  font-size: clamp(14px, 1.6vw, 18px);
  letter-spacing: 0.04em;
}
.foot-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: clamp(40px, 6vw, 70px);
  padding-top: 26px;
  border-top: 1px solid var(--card-line);
}
.foot-bar .links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.foot-bar .links a {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  height: 48px;
  padding: 0 10px 0 20px;
  border-radius: 40px;
  border: 1px solid var(--card-line);
  background: var(--card-pill);
  font-size: 12.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--card-fg);
  transition:
    background 0.2s,
    color 0.2s;
}
.foot-bar .links a .ic {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: grid;
  place-items: center;
}
.foot-bar .links a:hover {
  color: var(--candy);
}
.goup {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  height: 48px;
  padding: 0 8px 0 20px;
  border-radius: 40px;
  background: var(--candy);
  color: #06181f;
  font-size: 12.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  border: none;
}
.goup .ic {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(6, 24, 31, 0.16);
  display: grid;
  place-items: center;
}

.foot-legal {
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-items: center;
  font-size: 13px;
}
.foot-legal a,
.foot-legal-btn {
  color: var(--muted);
  text-decoration: none;
  font-weight: 600;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
}
.foot-legal a:hover,
.foot-legal-btn:hover {
  color: var(--fg);
}

@media (max-width: 860px) {
  .ai-showcase {
    padding: 16px 0 0;
    min-height: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }
  .ai-showcase .bg-fade,
  .dev-label {
    display: none;
  }

  .laptop,
  .tablet,
  .watch {
    display: none;
  }
  .phone {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    bottom: auto;
    margin: 0;
    width: min(260px, 70%);
  }
}

@media (max-width: 720px) {
  .foot-card {
    padding: 36px 22px 28px;
  }
  .foot-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    margin-top: 32px;
    padding-top: 22px;
  }
  .foot-bar .links {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    min-width: 0;
  }
  .foot-bar .links a {
    height: 44px;
    padding: 0 10px;
    justify-content: space-between;
    font-size: 10.5px;
    letter-spacing: 0.04em;
    gap: 6px;
    min-width: 0;
  }
  .foot-bar .links a .ic {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }
  .foot-bar .links a .ic svg {
    width: 12px;
    height: 12px;
  }
  .goup {
    width: 100%;
    height: 48px;
    justify-content: space-between;
    padding: 0 16px;
  }
  .foot-legal {
    gap: 14px;
    font-size: 12px;
    flex-wrap: wrap;
  }
}
@media (max-width: 480px) {
  .foot-big {
    font-size: clamp(32px, 11vw, 56px) !important;
    line-height: 1.05;
  }
  .foot-sub {
    font-size: 13px;
    line-height: 1.5;
  }
}

.logo-bar-wrap {
  margin: 36px 0 56px;
}
.logo-bar-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0 0 18px;
  text-align: center;
}
.logo-bar {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: clamp(28px, 5vw, 64px) clamp(28px, 5vw, 72px);
  color: var(--fg);
  opacity: 0.5;
  transition: opacity 0.3s ease;
}
.logo-bar:hover {
  opacity: 0.8;
}
.logo-bar-item {
  display: inline-flex;
  align-items: center;
  height: 28px;
  transition: filter 0.2s ease;
}
.logo-bar-item:hover {
  filter: brightness(1.2);
}
.logo-bar-svg {
  height: 28px;
  width: auto;
  display: block;
}
.logo-bar-text {
  font-family: var(--font);
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.01em;
  line-height: 1;
  white-space: nowrap;
}

@media (max-width: 720px) {
  .logo-bar-wrap {
    margin: 28px 0 40px;
  }
  .logo-bar {
    gap: 22px 32px;
  }
  .logo-bar-item,
  .logo-bar-svg {
    height: 22px;
  }
  .logo-bar-text {
    font-size: 15px;
  }
}

.work-visual {
  width: 100%;
  height: 100%;
  display: block;
}

.trans-sec {
  position: relative;
  overflow: clip;
}
.trans-h {
  font-size: clamp(40px, 6vw, 88px);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.02;
  margin: 8px 0 18px;
  max-width: 18ch;
}
.trans-h .em {
  color: var(--candy);
}
.trans-lead {
  font-size: clamp(16px, 1.3vw, 19px);
  color: var(--fg-2);
  max-width: 60ch;
  line-height: 1.55;
  margin: 0 0 36px;
}
.trans-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(280px, 1fr);
  gap: 28px;
  align-items: stretch;
}
.trans-map-wrap {
  position: relative;
  background:
    radial-gradient(80% 60% at 50% 50%, rgba(178, 213, 229, 0.06), transparent 70%),
    var(--pill);
  border: 1px solid var(--line);
  border-radius: 28px;
  padding: 18px;
  overflow: hidden;
  color: var(--fg);
}
.trans-svg {
  width: 100%;
  height: auto;
  display: block;
  font-family: var(--font);
}

.trans-pin {
  cursor: pointer;
  outline: none;
}
.trans-pin:focus-visible .trans-pin-ring {
  fill: var(--candy);
  fill-opacity: 0.38;
}
.trans-pin .trans-pin-halo {
  opacity: 0;
  transition: opacity 0.25s ease;
}
.trans-pin .trans-pin-ring {
  transition:
    fill-opacity 0.25s ease,
    transform 0.25s ease;
  transform-origin: 0 0;
}
.trans-pin .trans-pin-dot {
  transition: transform 0.25s ease;
  transform-origin: 0 0;
}
.trans-pin:hover .trans-pin-halo,
.trans-pin--active .trans-pin-halo {
  opacity: 1;
}
.trans-pin--active .trans-pin-ring {
  fill-opacity: 0.4;
}
.trans-pin--active .trans-pin-dot {
  transform: scale(1.2);
}
.trans-pin-label {
  pointer-events: none;
  letter-spacing: 0.04em;
  paint-order: stroke;
  stroke: var(--bg);
  stroke-width: 3.5px;
  stroke-linejoin: round;
}

.trans-chips {
  list-style: none;
  margin: 18px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.trans-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--fg-2);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition:
    color 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}
.trans-chip:hover {
  color: var(--fg);
  border-color: var(--candy);
}
.trans-chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--candy);
  opacity: 0.45;
  transition: opacity 0.18s ease;
}
.trans-chip--active {
  color: var(--fg);
  border-color: var(--candy);
  background: rgba(178, 213, 229, 0.12);
}
.trans-chip--active .trans-chip-dot {
  opacity: 1;
}

.trans-panel {
  background: var(--card);
  color: var(--card-fg);
  border-radius: 24px;
  padding: 28px 26px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid var(--card-line);
  min-height: 220px;
}
.trans-panel-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--card-muted);
  margin-bottom: 12px;
}
.trans-panel-city {
  font-size: clamp(26px, 2.4vw, 34px);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 4px;
  line-height: 1.05;
}
.trans-panel-country {
  font-weight: 500;
  color: var(--card-2);
}
.trans-panel-org {
  font-size: 15px;
  color: var(--candy);
  margin: 4px 0 0;
  font-weight: 600;
}
.trans-panel-role {
  font-size: 14.5px;
  color: var(--card-2);
  margin: 0;
}
.trans-panel-when {
  font-size: 13px;
  color: var(--card-muted);
  margin-top: 8px;
  letter-spacing: 0.02em;
}

@media (max-width: 960px) {
  .trans-shell {
    grid-template-columns: 1fr;
  }
  .trans-panel {
    min-height: auto;
  }
  .trans-pin-label {
    font-size: 14px;
  }
}
@media (max-width: 560px) {
  .trans-h {
    font-size: clamp(32px, 9vw, 56px);
  }
  .trans-map-wrap {
    padding: 12px;
    border-radius: 22px;
  }
  .trans-svg {
    transform: scale(1.05);
    transform-origin: center center;
  }
  .trans-pin-label {
    font-size: 16px;
  }
  .trans-panel {
    padding: 22px 20px;
  }
}
```

### `src/app/layout.tsx`

```tsx
import type { Metadata, Viewport } from "next";
import { Onest } from "next/font/google";
import { Loader } from "@/components/Loader";
import { ThemeScript } from "@/components/ThemeScript";
import { Toaster } from "@/components/primitives/Toaster";
import { ConsentProvider } from "@/components/privacy/ConsentProvider";
import { ConsentBanner } from "@/components/privacy/ConsentBanner";
import { SITE } from "@/lib/constants";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const TITLE = `${SITE.name}, Software Engineer`;
const DESCRIPTION =
  "Mzwakhe Mokhatla, a full-stack software engineer and acting Technical Lead in South Africa, turning ideas into digital realities through production-grade React, Next.js, TypeScript, NestJS, and Azure-native systems for telecoms, fintech, and consulting clients.";
const KEYWORDS = [
  "Mzwakhe Mokhatla",
  "Software Engineer",
  "Full-Stack Engineer",
  "Tech Lead",
  "React",
  "Next.js",
  "TypeScript",
  "NestJS",
  "Azure",
  "Microfrontends",
  "Pretoria",
  "South Africa",
  "Portfolio",
  "MTN",
  "Accenture",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s · ${SITE.name}` },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  applicationName: SITE.name,
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_ZA",
    images: [
      {
        url: SITE.portrait,
        width: 1200,
        height: 630,
        alt: `Portrait of ${SITE.name}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [SITE.portrait],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    apple: SITE.portrait,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e9f1f5" },
    { media: "(prefers-color-scheme: dark)", color: "#020202" },
  ],
  width: "device-width",
  initialScale: 1,
};

function StructuredData(): React.ReactElement {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    url: SITE_URL,
    image: `${SITE_URL}${SITE.portrait}`,
    email: SITE.email,
    telephone: SITE.phoneHref.replace("tel:", ""),
    jobTitle: "Software Engineer · Full-Stack · Tech Lead",
    description: DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pretoria",
      addressCountry: "South Africa",
    },
    worksFor: [
      { "@type": "Organization", name: "MTN Group" },
      { "@type": "Organization", name: "Accenture" },
    ],
    knowsAbout: [
      "TypeScript",
      "React",
      "Next.js",
      "NestJS",
      "Azure",
      "Microfrontends",
      "DevOps",
      "PostgreSQL",
    ],
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE_URL,
    inLanguage: "en",
    author: { "@type": "Person", name: SITE.name },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps): React.ReactElement {
  return (
    <html lang="en" className={onest.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
        <StructuredData />
      </head>
      <body>
        <div id="loader">
          <div className="ld-ring" />
          <div className="ld-brand">
            mzwakhe<span>.</span>
          </div>
          <div className="ld-sub">Loading experience</div>
        </div>
        <Loader />
        <ConsentProvider>
          {children}
          <ConsentBanner />
        </ConsentProvider>
        <Toaster />
      </body>
    </html>
  );
}
```

### `src/app/legal/cookies/page.tsx`

```tsx
import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { CATEGORY_META, CATEGORY_ORDER, inventoryByCategory } from "@/lib/privacy/cookies";
import { COOKIE_POLICY_VERSION } from "@/lib/privacy/policy";
export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Every cookie and storage key this site sets, what it does, and how long it lives.",
};
export default function CookiePage(): React.ReactElement {
  return (
    <LegalLayout title="Cookie Policy" version={COOKIE_POLICY_VERSION} updatedAt="23 June 2026">
      <h2>About this list</h2>
      <p>
        Every cookie and browser-storage key this site sets is listed below. The list is rendered
        directly from the same inventory the consent banner uses, so the policy cannot drift from
        reality. If you find something on your machine that isn&apos;t in the table, it isn&apos;t
        from us.
      </p>

      {CATEGORY_ORDER.map((cat) => {
        const meta = CATEGORY_META[cat];
        const rows = inventoryByCategory(cat);
        return (
          <section key={cat}>
            <h2>{meta.label}</h2>
            <p>{meta.description}</p>
            {rows.length === 0 ? (
              <p>
                <em>None currently set.</em>
              </p>
            ) : (
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Where</th>
                    <th>Set by</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.name}>
                      <td>
                        <code>{c.name}</code>
                      </td>
                      <td>{c.storage}</td>
                      <td>{c.party === "first" ? "this site" : "third party"}</td>
                      <td>{c.purpose}</td>
                      <td>{c.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        );
      })}

      <h2>Changing your mind</h2>
      <p>
        Click <strong>&ldquo;Cookie preferences&rdquo;</strong>{" "}
        in the footer at any time to reopen the consent banner. Withdrawing consent does not
        retroactively erase data we already had your permission to process &mdash; see the{" "}
        <a href="/legal/privacy">Privacy Policy</a> for that.
      </p>
    </LegalLayout>
  );
}
```

### `src/app/legal/privacy/page.tsx`

```tsx
import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { DATA_CONTROLLER, DATA_RETENTION_DAYS, PRIVACY_POLICY_VERSION } from "@/lib/privacy/policy";
export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Mzwakhe Mokhatla handles personal data on this site.",
};
export default function PrivacyPage(): React.ReactElement {
  return (
    <LegalLayout title="Privacy Policy" version={PRIVACY_POLICY_VERSION} updatedAt="23 June 2026">
      <h2>Who I am</h2>
      <p>
        This site is operated personally by <strong>{DATA_CONTROLLER.name}</strong>, based in{" "}
        {DATA_CONTROLLER.location}. For any privacy question or to exercise the rights described
        below, email <a href={`mailto:${DATA_CONTROLLER.email}`}>{DATA_CONTROLLER.email}</a>.
      </p>

      <h2>What I collect, and why</h2>
      <p>
        I only collect what the recruiter verification flow on <code>/recruiter</code> actually
        needs.
      </p>
      <ul>
        <li>
          <strong>Account details</strong>, your full name, work email, company, role you&apos;re
          hiring for, and a company website / LinkedIn URL. You give this when you request access.
        </li>
        <li>
          <strong>Authentication data</strong>, a one-time code emailed to your inbox, plus a
          session token after verification so you stay signed in.
        </li>
        <li>
          <strong>Technical metadata</strong>, IP address and user-agent of the device that signed
          in, captured for fraud prevention and audit logs.
        </li>
        <li>
          <strong>Consent records</strong>, your cookie choices and policy acceptance, so I can
          prove consent was given (GDPR Article 7).
        </li>
      </ul>
      <p>
        I do <strong>not</strong> sell data, run advertising, or share data with social networks.
        There is no marketing pixel on this site.
      </p>

      <h2>Lawful basis</h2>
      <ul>
        <li>
          <strong>Contract / pre-contract</strong> (GDPR Art. 6(1)(b)), you provide your details to
          take a step toward a hiring conversation.
        </li>
        <li>
          <strong>Legitimate interest</strong> (Art. 6(1)(f)), fraud prevention and audit logs of
          who accessed the CV.
        </li>
        <li>
          <strong>Consent</strong> (Art. 6(1)(a)), non-essential cookies and any future analytics.
        </li>
      </ul>

      <h2>Who processes the data with me</h2>
      <ul>
        <li>
          <strong>Neon</strong> (Postgres database, EU-West-2), stores user records and consent
          logs.
        </li>
        <li>
          <strong>Resend</strong>, delivers the one-time verification code to your inbox.
        </li>
        <li>
          <strong>Vercel</strong>, hosts the site and routes traffic.
        </li>
      </ul>
      <p>
        Each of these is a data processor under a Data Processing Agreement and only handles data on
        documented instructions.
      </p>

      <h2>Retention</h2>
      <p>
        Recruiter accounts are kept for {DATA_RETENTION_DAYS} days from your last sign-in and are
        then either deleted or anonymised, unless you ask me to delete them sooner. Audit logs
        (sign-ins, consent events) are kept for 24 months for security and legal reasons, then
        deleted.
      </p>

      <h2>Your rights</h2>
      <p>Under GDPR and similar laws (UK GDPR, POPIA, CCPA), you have the right to:</p>
      <ul>
        <li>
          <strong>Access</strong>, export everything I hold about you as JSON via{" "}
          <code>/recruiter</code> → &ldquo;Export my data&rdquo;.
        </li>
        <li>
          <strong>Rectification</strong>, update your name, company, role, and URL by going through
          sign-up again with the same email.
        </li>
        <li>
          <strong>Erasure</strong>, delete your account and all associated profile data via{" "}
          <code>/recruiter</code> → &ldquo;Delete my account&rdquo;.
        </li>
        <li>
          <strong>Withdraw consent</strong>, reopen the cookie banner at any time from the footer.
        </li>
        <li>
          <strong>Object / restrict</strong>, email me and I&apos;ll comply within 30 days (usually
          within 48 hours).
        </li>
        <li>
          <strong>Lodge a complaint</strong>, with your local supervisory authority (in South
          Africa, the Information Regulator; in the EU, your national DPA).
        </li>
      </ul>

      <h2>International transfers</h2>
      <p>
        Data is processed primarily in the EU (Neon EU-West-2, Resend EU region) and may transit
        through Vercel&apos;s global edge network. Standard contractual clauses (or the equivalent
        transfer mechanism) are in place with each processor.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        When this policy changes materially, the version string at the top of the page is bumped and
        you will be asked to re-confirm consent on your next visit.
      </p>
    </LegalLayout>
  );
}
```

### `src/app/legal/terms/page.tsx`

```tsx
import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { DATA_CONTROLLER, TERMS_VERSION } from "@/lib/privacy/policy";
export const metadata: Metadata = {
  title: "Recruiter Terms",
  description: "What you agree to when you request access to download the CV.",
};
export default function TermsPage(): React.ReactElement {
  return (
    <LegalLayout title="Recruiter Terms" version={TERMS_VERSION} updatedAt="23 June 2026">
      <h2>1. Who these terms apply to</h2>
      <p>
        These terms apply when you request access to <code>/recruiter</code> in order to download{" "}
        {DATA_CONTROLLER.name}&apos;s CV or related professional materials.
      </p>

      <h2>2. Acceptable use</h2>
      <ul>
        <li>You confirm that the company, role, and contact details you provide are accurate.</li>
        <li>
          You agree to use the materials you download solely to evaluate a potential professional
          engagement with {DATA_CONTROLLER.name}.
        </li>
        <li>
          You will not republish, post on job boards, sell, or otherwise distribute the CV without
          written permission.
        </li>
      </ul>

      <h2>3. Account responsibility</h2>
      <p>
        The work email you sign up with is the key to your account. Don&apos;t share access. If you
        suspect someone else has used your email, email{" "}
        <a href={`mailto:${DATA_CONTROLLER.email}`}>{DATA_CONTROLLER.email}</a>.
      </p>

      <h2>4. Intellectual property</h2>
      <p>
        All CV content, writing, code samples, and visual assets on this site remain the property of{" "}
        {DATA_CONTROLLER.name}. Verified access does not transfer ownership.
      </p>

      <h2>5. Limitation of liability</h2>
      <p>
        This site is provided as-is. To the extent permitted by law, {DATA_CONTROLLER.name} is not
        liable for any indirect or consequential loss arising from your use of the site or the
        materials downloaded from it.
      </p>

      <h2>6. Termination</h2>
      <p>
        I may suspend or revoke your access at any time if I believe these terms have been breached.
        You can terminate your own account at any time via <code>/recruiter</code> → &ldquo;Delete
        my account&rdquo;.
      </p>

      <h2>7. Governing law</h2>
      <p>
        These terms are governed by the laws of {DATA_CONTROLLER.location}. Any disputes will be
        resolved in the appropriate courts there, unless mandatory consumer-protection law in your
        country gives you the right to use a local forum.
      </p>

      <h2>8. Changes</h2>
      <p>
        When these terms change materially, the version string at the top of this page is bumped and
        you&apos;ll be asked to re-accept on your next sign-in.
      </p>
    </LegalLayout>
  );
}
```

### `src/app/page.tsx`

```tsx
import { NavMenu } from "@/components/nav/NavMenu";
import { Progress } from "@/components/primitives/Progress";
import { SmoothScroll } from "@/components/primitives/SmoothScroll";
import { AISection } from "@/components/sections/AISection";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Statement } from "@/components/sections/Statement";
import { TransContinental } from "@/components/sections/TransContinental";
import { Work } from "@/components/sections/Work";
export default function HomePage(): React.ReactElement {
  return (
    <SmoothScroll>
      <Progress />
      <NavMenu />
      <main>
        <Hero />
        <Statement />
        <Services />
        <Work />
        <Experience />
        <TransContinental />
        <AISection />
        <Contact />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
```

### `src/app/recruiter/page.tsx`

```tsx
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { EASE } from "@/components/primitives/Reveal";
import { Approved } from "@/components/recruiter/Approved";
import { Gate } from "@/components/recruiter/Gate";
import { Otp } from "@/components/recruiter/Otp";
import { Screening } from "@/components/recruiter/Screening";
import { SignIn } from "@/components/recruiter/SignIn";
import { SignUp, type SignUpData } from "@/components/recruiter/SignUp";
import { TopBar } from "@/components/recruiter/TopBar";
import { apiFetch } from "@/lib/api";
import "./recruiter.css";
type Step = "gate" | "signup" | "signin" | "otp" | "screening" | "approved";
type Account = Readonly<{
  name: string;
  email: string;
  company: string;
  role: string;
  url: string;
  verifiedAt: number;
  isAdmin: boolean;
  screen: {
    decision: "pending" | "approve" | "reject";
    reason: string;
  } | null;
}>;
type Mode = "signup" | "signin";
const screenVariants = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
};
const screenTransition = { duration: 0.45, ease: EASE };
export default function RecruiterPage(): React.ReactElement {
  const [step, setStep] = useState<Step>("gate");
  const [mode, setMode] = useState<Mode>("signup");
  const [signupDraft, setSignupDraft] = useState<SignUpData | null>(null);
  const [signinEmail, setSigninEmail] = useState<string>("");
  const [account, setAccount] = useState<Account | null>(null);
  const [otpError, setOtpError] = useState<string | undefined>();
  const [resumed, setResumed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await apiFetch<{
        account: Account | null;
      }>("/api/recruiter/session", {
        method: "GET",
        silent: true,
      });
      if (cancelled) return;
      if (res.ok && res.data?.account) {
        setAccount(res.data.account);
        setStep("approved");
      }
      setResumed(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const handleSignUpSubmit = useCallback(async (form: SignUpData): Promise<void> => {
    setSignupDraft(form);
    setMode("signup");
    setOtpError(undefined);
    const res = await apiFetch<{
      ok: true;
    }>("/api/recruiter/signup/start", {
      method: "POST",
      body: JSON.stringify(form),
    });
    if (!res.ok) return;
    toast.success(`Code sent to ${form.email}`);
    setStep("otp");
  }, []);
  const handleSignInSubmit = useCallback(async (email: string): Promise<void> => {
    setSigninEmail(email);
    setMode("signin");
    setOtpError(undefined);
    const res = await apiFetch<{
      ok: true;
    }>("/api/recruiter/signin/start", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    if (!res.ok) return;
    toast.success(`Code sent to ${email}`);
    setStep("otp");
  }, []);
  const handleOtpVerify = useCallback(
    async (entered: string): Promise<void> => {
      setOtpError(undefined);
      if (mode === "signup") {
        if (!signupDraft) {
          toast.error("Session expired. Please request access again.");
          setStep("signup");
          return;
        }
        const res = await apiFetch<{
          account: Account;
        }>("/api/recruiter/signup/verify", {
          method: "POST",
          body: JSON.stringify({ ...signupDraft, otp: entered }),
          silent: true,
        });
        if (!res.ok) {
          setOtpError(res.error);
          return;
        }
        setAccount(res.data.account);
        setStep("screening");
        return;
      }
      const res = await apiFetch<{
        account: Account;
      }>("/api/recruiter/signin/verify", {
        method: "POST",
        body: JSON.stringify({ email: signinEmail, otp: entered }),
        silent: true,
      });
      if (!res.ok) {
        setOtpError(res.error);
        return;
      }
      setAccount(res.data.account);
      setStep("approved");
    },
    [mode, signupDraft, signinEmail],
  );
  const handleResend = useCallback(async (): Promise<void> => {
    if (mode === "signup" && signupDraft) {
      const res = await apiFetch<{
        ok: true;
      }>("/api/recruiter/signup/start", {
        method: "POST",
        body: JSON.stringify(signupDraft),
      });
      if (res.ok) toast.success("New code sent.");
    } else if (mode === "signin" && signinEmail) {
      const res = await apiFetch<{
        ok: true;
      }>("/api/recruiter/signin/start", {
        method: "POST",
        body: JSON.stringify({ email: signinEmail }),
      });
      if (res.ok) toast.success("New code sent.");
    }
  }, [mode, signupDraft, signinEmail]);
  const runScreening = useCallback(async (): Promise<{
    decision: "approve" | "review";
    reason: string;
  }> => {
    const res = await apiFetch<{
      account: Account;
    }>("/api/recruiter/screen", {
      method: "POST",
    });
    if (!res.ok || !res.data.account.screen) {
      return { decision: "approve", reason: "Verified via work email and domain." };
    }
    setAccount(res.data.account);
    const { decision, reason } = res.data.account.screen;
    return { decision: decision === "reject" ? "review" : "approve", reason };
  }, []);
  const handleScreeningDone = useCallback((): void => {
    setStep("approved");
  }, []);
  const handleSignOut = useCallback(async (): Promise<void> => {
    await apiFetch<{
      ok: true;
    }>("/api/recruiter/signout", { method: "POST" });
    setAccount(null);
    setSignupDraft(null);
    setSigninEmail("");
    setStep("gate");
  }, []);
  const otpTargetEmail = mode === "signup" ? (signupDraft?.email ?? "") : signinEmail;
  const approvedAccount = useMemo(() => {
    if (!account) return null;
    return {
      name: account.name,
      email: account.email,
      company: account.company,
      role: account.role,
      url: account.url,
      verifiedAt: account.verifiedAt,
      screen: account.screen
        ? {
            decision:
              account.screen.decision === "reject" ? ("review" as const) : ("approve" as const),
            reason: account.screen.reason,
          }
        : undefined,
    };
  }, [account]);
  if (!resumed) {
    return (
      <>
        <TopBar />
        <main className="stage" aria-busy="true" />
      </>
    );
  }
  return (
    <>
      <TopBar />
      <main className="stage">
        <div className="card" aria-live="polite">
          <span className="glow" aria-hidden="true" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              variants={screenVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={screenTransition}
            >
              {step === "gate" ? (
                <Gate
                  onRequestAccess={() => {
                    setMode("signup");
                    setStep("signup");
                  }}
                  onHaveAccess={() => {
                    setMode("signin");
                    setStep("signin");
                  }}
                />
              ) : null}
              {step === "signup" ? (
                <SignUp
                  initial={signupDraft ?? undefined}
                  onBack={() => setStep("gate")}
                  onSubmit={handleSignUpSubmit}
                  onAlreadyVerified={() => {
                    setMode("signin");
                    setStep("signin");
                  }}
                />
              ) : null}
              {step === "signin" ? (
                <SignIn
                  onBack={() => setStep("gate")}
                  onCode={handleSignInSubmit}
                  onNewHere={() => {
                    setMode("signup");
                    setStep("signup");
                  }}
                />
              ) : null}
              {step === "otp" ? (
                <Otp
                  email={otpTargetEmail}
                  error={otpError}
                  onVerify={handleOtpVerify}
                  onResend={handleResend}
                />
              ) : null}
              {step === "screening" && account ? (
                <Screening
                  email={account.email}
                  screen={runScreening}
                  onDone={handleScreeningDone}
                />
              ) : null}
              {step === "approved" && approvedAccount ? (
                <Approved account={approvedAccount} onSignOut={handleSignOut} />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
```

### `src/app/recruiter/recruiter.css`

```css
:root {
  --candy: #b2d5e5;
  --font: var(--font-onest), "Onest", system-ui, sans-serif;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
}

html[data-theme="light"] {
  --bg: #e9f1f5;
  --bg-grad: linear-gradient(180deg, #eef5f8, #e0eef4 60%, #d3e7f0);
  --fg: #06090b;
  --fg-2: #45555c;
  --muted: #7c8a91;
  --line: rgba(2, 8, 12, 0.12);
  --card: #ffffff;
  --card-line: rgba(2, 8, 12, 0.08);
  --field: #f3f7f9;
  --field-line: rgba(2, 8, 12, 0.12);
  --field-focus: #06181f;
  --accent: var(--candy);
  --btn: #07090a;
  --btn-fg: #eef5f8;
  --ok: #1f8a5b;
  --warn: #b5742a;
  --glass: rgba(255, 255, 255, 0.6);
  --glass-line: rgba(255, 255, 255, 0.8);
  --shadow: 0 40px 90px -50px rgba(20, 50, 65, 0.5);
}

html[data-theme="dark"] {
  --bg: #020202;
  --bg-grad:
    radial-gradient(70vw 60vw at 70% -10%, rgba(178, 213, 229, 0.12), transparent 60%), #020202;
  --fg: #eef5f8;
  --fg-2: #aebec6;
  --muted: #6c7d85;
  --line: rgba(178, 213, 229, 0.16);
  --card: #0c1316;
  --card-line: rgba(178, 213, 229, 0.16);
  --field: rgba(178, 213, 229, 0.06);
  --field-line: rgba(178, 213, 229, 0.2);
  --field-focus: var(--candy);
  --accent: var(--candy);
  --btn: var(--candy);
  --btn-fg: #06181f;
  --ok: #5fd09b;
  --warn: #e0b06a;
  --glass: rgba(178, 213, 229, 0.07);
  --glass-line: rgba(178, 213, 229, 0.2);
  --shadow: 0 40px 90px -50px rgba(0, 0, 0, 0.8);
}

body {
  background: var(--bg);
  background-image: var(--bg-grad);
  background-attachment: fixed;
  color: var(--fg);
  font-family: var(--font);
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  transition:
    background-color 0.5s var(--ease),
    color 0.5s var(--ease);
}

::selection {
  background: var(--candy);
  color: #06181f;
}
input {
  font-family: inherit;
}

.topbar {
  position: fixed;
  inset: 16px 0 auto 0;
  z-index: 20;
}
.topbar-in {
  width: min(960px, 100% - 40px);
  margin-inline: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.brand {
  font-weight: 800;
  font-size: 22px;
  letter-spacing: -0.04em;
}
.brand .d {
  color: var(--candy);
}
.top-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.tbtn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--glass-line);
  background: var(--glass);
  color: var(--fg);
  display: grid;
  place-items: center;
  cursor: pointer;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: transform 0.2s;
}
.tbtn:hover {
  transform: translateY(-1px) rotate(8deg);
}
.tbtn svg {
  width: 18px;
  height: 18px;
}
.backlink {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  height: 44px;
  padding: 0 18px;
  border-radius: 40px;
  border: 1px solid var(--glass-line);
  background: var(--glass);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: transform 0.2s;
}
.backlink:hover {
  transform: translateY(-1px);
}

.stage {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 100px 20px 60px;
}
.card {
  width: min(560px, 100%);
  background: var(--card);
  border: 1px solid var(--card-line);
  border-radius: 30px;
  box-shadow: var(--shadow);
  padding: clamp(28px, 5vw, 52px);
  position: relative;
  overflow: hidden;
}
.card .glow {
  position: absolute;
  right: -20%;
  top: -40%;
  width: 70%;
  aspect-ratio: 1;
  background: radial-gradient(closest-side, var(--candy), transparent 70%);
  opacity: 0.5;
  pointer-events: none;
}
html[data-theme="light"] .card .glow {
  opacity: 0.8;
}

.eyebrow {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.eyebrow .lock {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--candy);
  color: #06181f;
  display: grid;
  place-items: center;
}
.eyebrow .lock svg {
  width: 14px;
  height: 14px;
}
h1.t {
  font-weight: 700;
  font-size: clamp(28px, 4.4vw, 40px);
  letter-spacing: -0.03em;
  line-height: 1.04;
  margin-bottom: 12px;
  text-wrap: balance;
}
h1.t .em {
  color: var(--candy);
}
html[data-theme="light"] h1.t .em {
  color: #2a6f93;
}
p.sub {
  color: var(--fg-2);
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 26px;
  max-width: 44ch;
  overflow-wrap: anywhere;
}

.dots {
  display: flex;
  gap: 7px;
  margin-bottom: 26px;
}
.dots i {
  height: 4px;
  flex: 1;
  border-radius: 4px;
  background: var(--line);
  transition: background 0.4s var(--ease);
}
.dots i.on {
  background: var(--candy);
}
.dots i.done {
  background: var(--ok);
}

form {
  display: grid;
  gap: 16px;
}
.row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 480px) {
  .row2 {
    grid-template-columns: 1fr;
  }
}
.field label {
  display: block;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--fg-2);
  margin-bottom: 7px;
}
.field .inp {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--field);
  border: 1px solid var(--field-line);
  border-radius: 14px;
  padding: 0 15px;
  height: 52px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.field .inp:focus-within {
  border-color: var(--field-focus);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--candy) 40%, transparent);
}
.field .inp svg {
  width: 17px;
  height: 17px;
  color: var(--muted);
  flex: none;
}
.field input {
  border: none;
  outline: none;
  background: none;
  color: var(--fg);
  font-size: 15.5px;
  width: 100%;
  height: 100%;
}
.field input::placeholder {
  color: var(--muted);
}
.field .err {
  color: var(--warn);
  font-size: 12.5px;
  margin-top: 6px;
  display: none;
}
.field.invalid .err {
  display: block;
}
.field.invalid .inp {
  border-color: var(--warn);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 54px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  border: 1px solid transparent;
  width: 100%;
  transition:
    transform 0.2s var(--ease),
    filter 0.2s,
    opacity 0.2s;
}
.btn:hover {
  transform: translateY(-2px);
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
.btn-primary {
  background: var(--btn);
  color: var(--btn-fg);
}
.btn-ghost {
  background: transparent;
  color: var(--fg);
  border-color: var(--field-line);
}
.btn svg {
  width: 17px;
  height: 17px;
}

.alt {
  text-align: center;
  font-size: 14px;
  color: var(--fg-2);
  margin-top: 20px;
}
.alt a {
  font-weight: 600;
  color: var(--candy);
  cursor: pointer;
}
html[data-theme="light"] .alt a {
  color: #2a6f93;
}

.note {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: var(--field);
  border: 1px dashed var(--field-line);
  border-radius: 14px;
  padding: 14px 16px;
  font-size: 13.5px;
  color: var(--fg-2);
  line-height: 1.45;
  margin-top: 4px;
}
.note .b {
  color: var(--candy);
  flex: none;
  font-weight: 700;
}
html[data-theme="light"] .note .b {
  color: #2a6f93;
}
.note code {
  font-weight: 700;
  color: var(--fg);
  letter-spacing: 0.12em;
}

.otp {
  display: flex;
  gap: 10px;
  justify-content: space-between;
  margin: 6px 0 4px;
}
.otp input {
  width: 100%;
  aspect-ratio: 1 / 1.15;
  text-align: center;
  font-size: 26px;
  font-weight: 700;
  border: 1px solid var(--field-line);
  background: var(--field);
  border-radius: 14px;
  color: var(--fg);
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.otp input:focus {
  border-color: var(--field-focus);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--candy) 40%, transparent);
}

.center {
  text-align: center;
  padding: 16px 0;
}
.spinner {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 3px solid var(--line);
  border-top-color: var(--candy);
  margin: 0 auto 22px;
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.checks {
  display: grid;
  gap: 10px;
  text-align: left;
  max-width: 340px;
  margin: 22px auto 0;
}
.checks .c {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14.5px;
  color: var(--fg-2);
}
.checks .c .ic {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex: none;
  background: var(--field);
  border: 1px solid var(--field-line);
}
.checks .c.ok .ic {
  background: var(--ok);
  color: #fff;
  border-color: var(--ok);
}
.checks .c.ok {
  color: var(--fg);
}
.checks .c .ic svg {
  width: 14px;
  height: 14px;
}

.seal {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: var(--ok);
  color: #fff;
  display: grid;
  place-items: center;
  margin: 0 auto 22px;
}
.seal svg {
  width: 40px;
  height: 40px;
}
.who {
  background: var(--field);
  border: 1px solid var(--field-line);
  border-radius: 16px;
  padding: 18px 20px;
  margin: 22px 0;
  display: grid;
  gap: 4px;
  text-align: left;
}
.who .nm {
  font-weight: 700;
  font-size: 17px;
}
.who .meta {
  color: var(--fg-2);
  font-size: 14px;
}
.who .badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  align-self: start;
  margin-top: 8px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ok);
  background: color-mix(in oklab, var(--ok) 14%, transparent);
  padding: 6px 12px;
  border-radius: 30px;
}
.dl {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 60px;
  border-radius: 16px;
  background: var(--candy);
  color: #06181f;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s;
  text-decoration: none;
}
.dl:hover {
  transform: translateY(-2px);
}
.dl svg {
  width: 20px;
  height: 20px;
}
.signout {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 13px;
  cursor: pointer;
  margin-top: 18px;
  font-family: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.howto {
  margin-top: 26px;
  border-top: 1px solid var(--line);
  padding-top: 18px;
}
.howto summary {
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: var(--fg-2);
  list-style: none;
  display: flex;
  align-items: center;
  gap: 8px;
}
.howto summary::-webkit-details-marker {
  display: none;
}
.howto summary .pl {
  color: var(--candy);
}
.howto ol {
  margin: 14px 0 0;
  padding-left: 20px;
  display: grid;
  gap: 8px;
}
.howto li {
  font-size: 13.5px;
  color: var(--fg-2);
  line-height: 1.45;
}
.howto li b {
  color: var(--fg);
  font-weight: 600;
}

.consent-checks {
  display: grid;
  gap: 10px;
  margin: 4px 0 18px;
}
.consent-check {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 13px;
  line-height: 1.5;
  color: var(--fg-2);
  cursor: pointer;
}
.consent-check input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  accent-color: var(--candy);
  cursor: pointer;
  flex-shrink: 0;
}
.consent-check a {
  color: var(--candy);
  font-weight: 600;
  text-decoration: underline;
}
.consent-check-err {
  margin: 0;
  font-size: 12.5px;
  color: var(--warn, #ef4444);
}

.privacy-tools {
  margin-top: 18px;
  border-top: 1px solid var(--border, rgba(10, 10, 10, 0.08));
  padding-top: 16px;
}
.privacy-tools summary {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  list-style: none;
}
.privacy-tools summary::-webkit-details-marker {
  display: none;
}
.privacy-tools summary::before {
  content: "+ ";
}
.privacy-tools[open] summary::before {
  content: "− ";
}
.privacy-tools p {
  margin: 10px 0 12px;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--muted);
}
.privacy-tools-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.privacy-tools-delete {
  color: var(--warn, #ef4444);
}
```

### `src/app/robots.ts`

```typescript
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/recruiter"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
```

### `src/app/sitemap.ts`

```typescript
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/recruiter`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/legal/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/legal/cookies`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/legal/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
```

---

## Appendix · Test mocks

### `__mocks__/framer-motion.tsx`

```tsx
import React from "react";
const ANIMATION_PROPS = new Set([
  "initial",
  "animate",
  "exit",
  "transition",
  "variants",
  "whileHover",
  "whileTap",
  "whileFocus",
  "whileDrag",
  "whileInView",
  "viewport",
  "layout",
  "layoutId",
  "layoutDependency",
  "layoutScroll",
  "drag",
  "dragConstraints",
  "dragElastic",
  "onAnimationStart",
  "onAnimationComplete",
  "onHoverStart",
  "onHoverEnd",
  "onTap",
  "onTapStart",
  "onTapCancel",
  "onPan",
  "onPanStart",
  "onPanEnd",
  "onDragStart",
  "onDragEnd",
  "onDrag",
  "onUpdate",
  "transformTemplate",
  "custom",
]);
type AnyProps = Record<string, unknown> & {
  children?: React.ReactNode;
};
function stripAnimationProps(props: AnyProps): AnyProps {
  const cleaned: AnyProps = {};
  for (const [key, value] of Object.entries(props)) {
    if (!ANIMATION_PROPS.has(key)) cleaned[key] = value;
  }
  return cleaned;
}
const motionFactory = new Proxy(
  {},
  {
    get(_target, tag: string) {
      const Component = (props: AnyProps) =>
        React.createElement(tag, stripAnimationProps(props), props.children);
      Component.displayName = `motion.${tag}`;
      return Component;
    },
  },
);
const passthroughMotionValue = <T,>(value: T) => ({
  get: () => value,
  set: () => {},
  on: () => () => {},
  destroy: () => {},
});
export const motion = motionFactory;
export const AnimatePresence = ({ children }: { children?: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);
export const useScroll = () => ({
  scrollY: passthroughMotionValue(0),
  scrollYProgress: passthroughMotionValue(0),
  scrollX: passthroughMotionValue(0),
  scrollXProgress: passthroughMotionValue(0),
});
export const useSpring = <T,>(value: T) => value;
export const useTransform = <T,>(_input: unknown, _from: unknown, to: T[]) => to[0];
export const useMotionValue = <T,>(value: T) => passthroughMotionValue(value);
export const useInView = () => true;
export const useReducedMotion = () => false;
export const useAnimation = () => ({ start: () => Promise.resolve(), stop: () => {} });
```

### `__mocks__/lenis.ts`

```typescript
class LenisMock {
  constructor(_options?: any) {}
  raf(_time: number): void {}
  destroy(): void {}
}
export default LenisMock;
```

---

## Appendix · Tests

### `src/__tests__/app/layout.test.tsx`

```tsx
import { metadata } from "@/app/layout";
describe("RootLayout metadata", () => {
  it("publishes the spec title with a templated suffix", () => {
    expect(metadata.title).toEqual(
      expect.objectContaining({
        default: expect.stringMatching(/Mzwakhe Mokhatla/),
        template: expect.stringMatching(/Mzwakhe Mokhatla/),
      }),
    );
  });
  it("uses the spec tagline as the description", () => {
    expect(metadata.description).toMatch(/turning ideas into digital realities/i);
  });
  it("opts into indexing", () => {
    expect(metadata.robots).toEqual(
      expect.objectContaining({ index: true, follow: true }),
    );
  });
});
```

### `src/__tests__/app/page.test.tsx`

```tsx
jest.mock("framer-motion");
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...rest }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...rest} />
  ),
}));
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import { SITE } from "@/lib/constants";
describe("HomePage composition", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });
  it("renders the Hero h1 with the spec headline", () => {
    render(<HomePage />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(/Turning ideas into\s+digital realities\./i);
  });
  it("renders the Statement, Contact, and Footer signatures", () => {
    render(<HomePage />);
    expect(screen.getByText(/I'm a full-stack engineer/)).toBeInTheDocument();
    expect(screen.getByText(/Don't/)).toBeInTheDocument();
    expect(screen.getByText(/Software Engineer · Full-Stack · Tech Lead/)).toHaveTextContent(
      SITE.location,
    );
  });
});
```

### `src/__tests__/app/recruiter-page.test.tsx`

```tsx
jest.mock("framer-motion");
import { render, screen, waitFor } from "@testing-library/react";
import RecruiterPage from "@/app/recruiter/page";
const originalFetch = global.fetch;
function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}
function mockSession(account: unknown): void {
  global.fetch = jest.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.includes("/api/recruiter/session")) return jsonResponse({ account });
    return jsonResponse({});
  }) as unknown as typeof global.fetch;
}
describe("RecruiterPage auto-resume", () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });
  it("starts at the Gate when /api/recruiter/session returns no account", async () => {
    mockSession(null);
    render(<RecruiterPage />);
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Download my CV/i),
    );
  });
  it("jumps to Approved when /api/recruiter/session returns an account", async () => {
    mockSession({
      name: "Jordan Pillay",
      email: "jordan@acme.co",
      company: "Acme",
      role: "Frontend",
      url: "acme.co",
      verifiedAt: 1,
      isAdmin: false,
      screen: { decision: "approve", reason: "Verified." },
    });
    render(<RecruiterPage />);
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("You're verified."),
    );
    expect(screen.getByText(/Thanks, Jordan\./)).toBeInTheDocument();
  });
  it("falls back to the Gate when the session endpoint errors", async () => {
    global.fetch = jest.fn(async () =>
      jsonResponse({ message: "boom" }, 500),
    ) as unknown as typeof global.fetch;
    render(<RecruiterPage />);
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Download my CV/i),
    );
  });
});
```

### `src/__tests__/components/Loader.test.tsx`

```tsx
import { act, render } from "@testing-library/react";
import { Loader } from "@/components/Loader";
beforeEach(() => {
  jest.useFakeTimers();
  document.body.innerHTML =
    '<div id="loader"><div class="ld-ring"></div><div class="ld-brand">mzwakhe<span>.</span></div><div class="ld-sub">Loading experience</div></div>';
});
afterEach(() => {
  jest.useRealTimers();
  document.body.innerHTML = "";
});
describe("Loader", () => {
  it("renders nothing itself (just runs the timers)", () => {
    const { container } = render(<Loader />);
    expect(container.firstChild).toBeNull();
  });
  it("adds .hide at 600ms and removes the #loader element at 1400ms", () => {
    render(<Loader />);
    expect(document.getElementById("loader")?.classList.contains("hide")).toBe(false);
    act(() => jest.advanceTimersByTime(600));
    expect(document.getElementById("loader")?.classList.contains("hide")).toBe(true);
    act(() => jest.advanceTimersByTime(800));
    expect(document.getElementById("loader")).toBeNull();
  });
  it("does nothing when the loader element is missing", () => {
    document.body.innerHTML = "";
    expect(() => render(<Loader />)).not.toThrow();
    act(() => jest.advanceTimersByTime(2000));
  });
});
```

### `src/__tests__/components/ThemeScript.test.tsx`

```tsx
import { render } from "@testing-library/react";
import { ThemeScript } from "@/components/ThemeScript";
describe("ThemeScript", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });
  it("emits an inline script that reads `studio-theme`", () => {
    const { container } = render(<ThemeScript />);
    const source = container.querySelector("script")?.innerHTML ?? "";
    expect(source).toContain("studio-theme");
    expect(source).toContain("data-theme");
    expect(source).toContain("light");
  });
  it("applies the persisted theme when the script executes", () => {
    window.localStorage.setItem("studio-theme", "dark");
    const { container } = render(<ThemeScript />);
    const source = container.querySelector("script")?.innerHTML ?? "";
    new Function(source)();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
  it("defaults to 'light' when storage is empty", () => {
    const { container } = render(<ThemeScript />);
    const source = container.querySelector("script")?.innerHTML ?? "";
    new Function(source)();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});
```

### `src/__tests__/components/nav/Menu.test.tsx`

```tsx
jest.mock("framer-motion");
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Menu } from "@/components/nav/Menu";
import { NAVLINKS, SITE } from "@/lib/constants";
describe("Menu", () => {
  it("renders nothing when closed", () => {
    render(<Menu open={false} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("renders the dialog with all NAVLINKS when open", () => {
    render(<Menu open={true} onClose={() => {}} />);
    const dialog = screen.getByRole("dialog", { name: /site menu/i });
    expect(dialog).toBeInTheDocument();
    for (const link of NAVLINKS) {
      expect(screen.getByText(link.t)).toBeInTheDocument();
      expect(screen.getByText(link.n)).toBeInTheDocument();
    }
  });
  it("includes the footer row: Download CV, mailto, tel, theme toggle", () => {
    render(<Menu open={true} onClose={() => {}} />);
    expect(screen.getByRole("link", { name: "Download CV" })).toHaveAttribute("href", "/recruiter");
    expect(screen.getByRole("link", { name: SITE.email })).toHaveAttribute(
      "href",
      `mailto:${SITE.email}`,
    );
    expect(screen.getByRole("link", { name: SITE.phone })).toHaveAttribute("href", SITE.phoneHref);
    expect(screen.getByText(/Dark mode/i)).toBeInTheDocument();
  });
  it("closes on Escape", async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(<Menu open={true} onClose={onClose} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  it("closes when a nav link is clicked", async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(<Menu open={true} onClose={onClose} />);
    await user.click(screen.getByText(NAVLINKS[0].t));
    expect(onClose).toHaveBeenCalled();
  });
});
```

### `src/__tests__/components/nav/Nav.test.tsx`

```tsx
jest.mock("framer-motion");
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Nav } from "@/components/nav/Nav";
describe("Nav", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });
  it("renders the mzwakhe. brand linking to #top", () => {
    const { container } = render(<Nav onOpenMenu={() => {}} />);
    const brand = container.querySelector("a.brand") as HTMLAnchorElement;
    expect(brand).not.toBeNull();
    expect(brand.textContent).toBe("mzwakhe.");
    expect(brand.getAttribute("href")).toBe("#top");
  });
  it("renders the Let's talk pill and Menu trigger", () => {
    render(<Nav onOpenMenu={() => {}} />);
    expect(screen.getByRole("link", { name: /let's talk/i })).toHaveAttribute("href", "#contact");
    expect(screen.getByRole("button", { name: /menu/i })).toBeInTheDocument();
  });
  it("calls onOpenMenu when the Menu button is clicked", async () => {
    const open = jest.fn();
    const user = userEvent.setup();
    render(<Nav onOpenMenu={open} />);
    await user.click(screen.getByRole("button", { name: /menu/i }));
    expect(open).toHaveBeenCalledTimes(1);
  });
  it("renders the theme button with an accessible label", () => {
    render(<Nav onOpenMenu={() => {}} />);
    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument();
  });
});
```

### `src/__tests__/components/recruiter/Approved.test.tsx`

```tsx
jest.mock("framer-motion");
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Approved } from "@/components/recruiter/Approved";
import type { RecruiterAccount } from "@/lib/recruiter";
const ACCOUNT: RecruiterAccount = {
  name: "Jordan Pillay",
  email: "jordan@acme.co",
  company: "Acme Talent",
  role: "Senior Frontend Engineer",
  url: "acme.co",
  verifiedAt: 1717000000000,
};
describe("Approved", () => {
  it("renders the personalised headline, who card, and download link", () => {
    render(<Approved account={ACCOUNT} onSignOut={() => {}} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("You're verified.");
    expect(screen.getByText(/Thanks, Jordan\./)).toBeInTheDocument();
    expect(screen.getByText(ACCOUNT.name)).toBeInTheDocument();
    expect(screen.getByText(/Senior Frontend Engineer · Acme Talent/)).toBeInTheDocument();
    expect(screen.getByText(ACCOUNT.email)).toBeInTheDocument();
    const dl = screen.getByRole("link", { name: /Download CV \(PDF\)/i });
    expect(dl).toHaveAttribute("href", "/cv/Mzwakhe_Sifiso_Mokhatla_CV.pdf");
    expect(dl).toHaveAttribute("download");
  });
  it("calls onSignOut when 'Not you? Sign out' is clicked", async () => {
    const onSignOut = jest.fn();
    const user = userEvent.setup();
    render(<Approved account={ACCOUNT} onSignOut={onSignOut} />);
    await user.click(screen.getByRole("button", { name: /Not you\? Sign out/i }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
```

### `src/__tests__/components/recruiter/Dots.test.tsx`

```tsx
import { render } from "@testing-library/react";
import { Dots } from "@/components/recruiter/Dots";
describe("Dots", () => {
  it("renders 4 segments by default with the active step lit and prior ones done", () => {
    const { container } = render(<Dots step={2} />);
    const items = container.querySelectorAll(".dots i");
    expect(items.length).toBe(4);
    expect(items[0].className).toBe("done");
    expect(items[1].className).toBe("done");
    expect(items[2].className).toBe("on");
    expect(items[3].className).toBe("");
  });
  it("respects a custom total", () => {
    const { container } = render(<Dots step={0} total={3} />);
    expect(container.querySelectorAll(".dots i").length).toBe(3);
  });
});
```

### `src/__tests__/components/recruiter/Field.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field } from "@/components/recruiter/Field";
describe("Field", () => {
  it("renders label + input with the supplied placeholder", () => {
    render(
      <Field
        name="name"
        label="Full name"
        placeholder="Jordan Pillay"
        value=""
        onChange={() => {}}
        icon={<svg data-testid="ic" />}
      />,
    );
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Jordan Pillay")).toBeInTheDocument();
    expect(screen.getByTestId("ic")).toBeInTheDocument();
  });
  it("propagates typed values via onChange", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<Field name="name" label="Full name" value="" onChange={onChange} icon={<svg />} />);
    await user.type(screen.getByLabelText("Full name"), "M");
    expect(onChange).toHaveBeenCalledWith("M");
  });
  it("toggles `.invalid` + shows the error message when error is set", () => {
    const { container, rerender } = render(
      <Field name="name" label="Full name" value="" onChange={() => {}} icon={<svg />} />,
    );
    expect(container.querySelector(".field.invalid")).toBeNull();
    rerender(
      <Field
        name="name"
        label="Full name"
        value=""
        onChange={() => {}}
        icon={<svg />}
        error="Please enter your full name."
      />,
    );
    expect(container.querySelector(".field.invalid")).not.toBeNull();
    expect(screen.getByText("Please enter your full name.")).toBeInTheDocument();
  });
});
```

### `src/__tests__/components/recruiter/Gate.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Gate } from "@/components/recruiter/Gate";
describe("Gate", () => {
  it("renders the spec eyebrow, headline, and sub copy", () => {
    render(<Gate onRequestAccess={() => {}} onHaveAccess={() => {}} />);
    expect(screen.getByText(/Verified recruiter access/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Download my CV, for verified recruiters\./i,
    );
    expect(screen.getByText(/Takes about a minute with your work email/i)).toBeInTheDocument();
  });
  it("triggers onRequestAccess and onHaveAccess on the matching buttons", async () => {
    const onRequest = jest.fn();
    const onHave = jest.fn();
    const user = userEvent.setup();
    render(<Gate onRequestAccess={onRequest} onHaveAccess={onHave} />);
    await user.click(screen.getByRole("button", { name: /Request access/i }));
    expect(onRequest).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: /I already have access/i }));
    expect(onHave).toHaveBeenCalledTimes(1);
  });
  it("includes the Howto disclosure as a closed details element by default", () => {
    const { container } = render(<Gate onRequestAccess={() => {}} onHaveAccess={() => {}} />);
    const details = container.querySelector("details.howto");
    expect(details).not.toBeNull();
    expect((details as HTMLDetailsElement).open).toBe(false);
  });
});
```

### `src/__tests__/components/recruiter/Otp.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Otp } from "@/components/recruiter/Otp";
const inputs = (): HTMLInputElement[] =>
  Array.from(document.querySelectorAll(".otp input")) as HTMLInputElement[];
describe("Otp", () => {
  it("renders 6 inputs and the email in the note", () => {
    render(<Otp email="jordan@acme.co" onVerify={() => {}} onResend={() => {}} />);
    expect(inputs().length).toBe(6);
    expect(screen.getByText("jordan@acme.co")).toBeInTheDocument();
  });
  it("advances focus on each digit and disables verify until all 6 are filled", async () => {
    const onVerify = jest.fn();
    const user = userEvent.setup();
    render(<Otp email="jordan@acme.co" onVerify={onVerify} onResend={() => {}} />);
    const verify = screen.getByRole("button", { name: /Verify email/i });
    expect((verify as HTMLButtonElement).disabled).toBe(true);
    const all = inputs();
    for (let i = 0; i < 6; i += 1) {
      all[i].focus();
      await user.keyboard(String(i + 1));
    }
    expect((verify as HTMLButtonElement).disabled).toBe(false);
    await user.click(verify);
    expect(onVerify).toHaveBeenCalledWith("123456");
  });
  it("distributes pasted digits across boxes", async () => {
    const user = userEvent.setup();
    render(<Otp email="jordan@acme.co" onVerify={() => {}} onResend={() => {}} />);
    const first = inputs()[0];
    first.focus();
    await user.paste("987654");
    const after = inputs()
      .map((i) => i.value)
      .join("");
    expect(after).toBe("987654");
  });
  it("backspace on empty box moves focus to previous", async () => {
    const user = userEvent.setup();
    render(<Otp email="jordan@acme.co" onVerify={() => {}} onResend={() => {}} />);
    const all = inputs();
    all[0].focus();
    await user.keyboard("1");
    expect(document.activeElement).toBe(all[1]);
    await user.keyboard("{Backspace}");
    expect(document.activeElement).toBe(all[0]);
  });
  it("shows caller-supplied error text + aria-invalid on inputs", () => {
    render(
      <Otp
        email="jordan@acme.co"
        error="That code doesn't match. Try again."
        onVerify={() => {}}
        onResend={() => {}}
      />,
    );
    expect(screen.getByText(/That code doesn't match/i)).toBeInTheDocument();
    expect(inputs()[0].getAttribute("aria-invalid")).toBe("true");
  });
  it("Resend triggers onResend", async () => {
    const onResend = jest.fn();
    const user = userEvent.setup();
    render(<Otp email="jordan@acme.co" onVerify={() => {}} onResend={onResend} />);
    await user.click(screen.getByText("Resend"));
    expect(onResend).toHaveBeenCalledTimes(1);
  });
});
```

### `src/__tests__/components/recruiter/Screening.test.tsx`

```tsx
import { act, render } from "@testing-library/react";
import { Screening } from "@/components/recruiter/Screening";
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());
describe("Screening (§10.7 sequence)", () => {
  it("ticks email at 550ms, domain at 1200ms, then screen + onDone after 700ms", async () => {
    const screen = jest.fn().mockResolvedValue({ decision: "approve", reason: "OK" });
    const onDone = jest.fn();
    const { container } = render(
      <Screening email="jordan@acme.co" screen={screen} onDone={onDone} />,
    );
    const checks = (): NodeListOf<Element> => container.querySelectorAll(".checks .c");
    expect(checks()[0].className).not.toMatch(/ok/);
    await act(async () => {
      jest.advanceTimersByTime(550);
    });
    expect(checks()[0].className).toMatch(/ok/);
    await act(async () => {
      jest.advanceTimersByTime(650);
    });
    expect(checks()[1].className).toMatch(/ok/);
    await act(async () => {
      await Promise.resolve();
    });
    expect(checks()[2].className).toMatch(/ok/);
    await act(async () => {
      jest.advanceTimersByTime(700);
    });
    expect(onDone).toHaveBeenCalledWith({ decision: "approve", reason: "OK" });
  });
  it("falls back to an approve result when screen() rejects", async () => {
    const screen = jest.fn().mockRejectedValue(new Error("network"));
    const onDone = jest.fn();
    render(<Screening email="jordan@acme.co" screen={screen} onDone={onDone} />);
    await act(async () => {
      jest.advanceTimersByTime(550);
    });
    await act(async () => {
      jest.advanceTimersByTime(650);
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      jest.advanceTimersByTime(700);
    });
    expect(onDone).toHaveBeenCalledWith({
      decision: "approve",
      reason: "Verified via work email and domain.",
    });
  });
});
```

### `src/__tests__/components/recruiter/SignIn.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignIn } from "@/components/recruiter/SignIn";
describe("SignIn", () => {
  it("rejects an invalid email format", async () => {
    const onCode = jest.fn();
    const user = userEvent.setup();
    render(<SignIn onBack={() => {}} onCode={onCode} onNewHere={() => {}} />);
    await user.type(screen.getByLabelText(/Work email/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /Send sign-in code/i }));
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(onCode).not.toHaveBeenCalled();
  });
  it("calls onCode for a well-formed email (server handles existence check)", async () => {
    const onCode = jest.fn();
    const user = userEvent.setup();
    render(<SignIn onBack={() => {}} onCode={onCode} onNewHere={() => {}} />);
    await user.type(screen.getByLabelText(/Work email/i), "jordan@acme.co");
    await user.click(screen.getByRole("button", { name: /Send sign-in code/i }));
    expect(onCode).toHaveBeenCalledWith("jordan@acme.co");
  });
});
```

### `src/__tests__/components/recruiter/SignUp.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignUp } from "@/components/recruiter/SignUp";
async function fillValid(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.type(screen.getByLabelText(/Full name/i), "Jordan Pillay");
  await user.type(screen.getByLabelText(/Work email/i), "jordan@acme.co");
  await user.type(screen.getByLabelText(/^Company$/i), "Acme");
  await user.type(screen.getByLabelText(/Hiring for/i), "Frontend Engineer");
  await user.type(screen.getByLabelText(/LinkedIn/i), "acme.co");
  await user.click(screen.getByLabelText(/Recruiter Terms/i));
  await user.click(screen.getByLabelText(/Privacy Policy/i));
}
describe("SignUp validation", () => {
  it("blocks submit and surfaces 5 inline errors when all fields are empty", async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<SignUp onBack={() => {}} onSubmit={onSubmit} onAlreadyVerified={() => {}} />);
    await user.click(screen.getByRole("button", { name: /Send verification code/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Please enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Which company are you with?")).toBeInTheDocument();
    expect(screen.getByText("What role are you hiring for?")).toBeInTheDocument();
    expect(screen.getByText("Company website or LinkedIn helps verify you.")).toBeInTheDocument();
  });
  it("does not block free-mail addresses client-side (server enforces the rule with admin bypass)", async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<SignUp onBack={() => {}} onSubmit={onSubmit} onAlreadyVerified={() => {}} />);
    await user.type(screen.getByLabelText(/Full name/i), "Jordan Pillay");
    await user.type(screen.getByLabelText(/Work email/i), "jordan@gmail.com");
    await user.type(screen.getByLabelText(/^Company$/i), "Acme Talent");
    await user.type(screen.getByLabelText(/Hiring for/i), "Senior Frontend Engineer");
    await user.type(screen.getByLabelText(/LinkedIn/i), "acme.com");
    await user.click(screen.getByLabelText(/Recruiter Terms/i));
    await user.click(screen.getByLabelText(/Privacy Policy/i));
    await user.click(screen.getByRole("button", { name: /Send verification code/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
  it("requires both Terms and Privacy checkboxes before submit", async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<SignUp onBack={() => {}} onSubmit={onSubmit} onAlreadyVerified={() => {}} />);
    await user.type(screen.getByLabelText(/Full name/i), "Jordan");
    await user.type(screen.getByLabelText(/Work email/i), "jordan@acme.co");
    await user.type(screen.getByLabelText(/^Company$/i), "Acme");
    await user.type(screen.getByLabelText(/Hiring for/i), "Frontend");
    await user.type(screen.getByLabelText(/LinkedIn/i), "acme.co");
    await user.click(screen.getByRole("button", { name: /Send verification code/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/accept the Recruiter Terms and Privacy Policy/i)).toBeInTheDocument();
  });
  it("submits trimmed values + acceptance flags when every field is valid", async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<SignUp onBack={() => {}} onSubmit={onSubmit} onAlreadyVerified={() => {}} />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /Send verification code/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Jordan Pillay",
      email: "jordan@acme.co",
      company: "Acme",
      role: "Frontend Engineer",
      url: "acme.co",
      acceptedTerms: true,
      acceptedPrivacy: true,
    });
  });
});
```

### `src/__tests__/components/sections/AISection.peak.test.tsx`

```tsx
jest.mock("framer-motion");
import { act, render } from "@testing-library/react";
import { AISection } from "@/components/sections/AISection";
type ObserverCallback = (entries: IntersectionObserverEntry[]) => void;
type FakeObserver = {
  callback: ObserverCallback;
  targets: Element[];
};
let observers: FakeObserver[] = [];
let originalObserver: typeof IntersectionObserver | undefined;
beforeAll(() => {
  originalObserver = window.IntersectionObserver;
  class FakeIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = "";
    readonly thresholds: ReadonlyArray<number> = [];
    private readonly record: FakeObserver;
    constructor(callback: ObserverCallback) {
      this.record = { callback, targets: [] };
      observers.push(this.record);
    }
    observe(target: Element): void {
      this.record.targets.push(target);
    }
    unobserve(target: Element): void {
      this.record.targets = this.record.targets.filter((t) => t !== target);
    }
    disconnect(): void {
      this.record.targets = [];
    }
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  window.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;
});
afterAll(() => {
  if (originalObserver) window.IntersectionObserver = originalObserver;
});
beforeEach(() => {
  observers = [];
});
function fireRatio(ratio: number): void {
  for (const observer of observers) {
    const entries = observer.targets.map(
      (target) =>
        ({
          isIntersecting: ratio > 0,
          intersectionRatio: ratio,
          target,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
          time: 0,
        }) as IntersectionObserverEntry,
    );
    observer.callback(entries);
  }
}
describe("AISection in-view bg trigger", () => {
  it("does not apply .ai--peak before the threshold is reached", () => {
    const { container } = render(<AISection threshold={0.25} />);
    const section = container.querySelector("#ai") as HTMLElement;
    expect(section.className).not.toMatch(/ai--peak/);
    act(() => fireRatio(0.1));
    expect(section.className).not.toMatch(/ai--peak/);
  });
  it("applies .ai--peak once the section reaches the threshold", () => {
    const { container } = render(<AISection threshold={0.25} />);
    const section = container.querySelector("#ai") as HTMLElement;
    act(() => fireRatio(0.3));
    expect(section.className).toMatch(/ai--peak/);
  });
  it("removes .ai--peak once the section drops back below the threshold (scroll past)", () => {
    const { container } = render(<AISection threshold={0.25} />);
    const section = container.querySelector("#ai") as HTMLElement;
    act(() => fireRatio(0.5));
    expect(section.className).toMatch(/ai--peak/);
    act(() => fireRatio(0.1));
    expect(section.className).not.toMatch(/ai--peak/);
  });
});
```

### `src/__tests__/components/sections/sections.test.tsx`

```tsx
jest.mock("framer-motion");
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...rest }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...rest} />
  ),
}));
import { render, screen, within } from "@testing-library/react";
import { AISection } from "@/components/sections/AISection";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Statement } from "@/components/sections/Statement";
import { Work } from "@/components/sections/Work";
import { AIITEMS, NAVLINKS, SERVICES, SITE, WORK, XP } from "@/lib/constants";
describe("Hero", () => {
  it("renders the spec's lowercase wordmark + h1 + Scroll cue", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector(".hero-mark")?.textContent).toBe("mzwakhe");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Turning ideas into\s+digital realities\./i,
    );
    expect(screen.getByText("Scroll")).toBeInTheDocument();
  });
  it("ids the section as #top so the brand href can scroll-link back", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector("section#top")).not.toBeNull();
  });
  it("renders the portrait next/image with the SITE.portrait src + descriptive alt", () => {
    render(<Hero />);
    const img = screen.getByAltText(`Portrait of ${SITE.name}`) as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toBe(SITE.portrait);
  });
});
describe("Statement", () => {
  it("renders the spec copy with the production-ready + software spans", () => {
    render(<Statement />);
    expect(screen.getByText("About")).toBeInTheDocument();
    const para = screen.getByText(/I'm a full-stack engineer/);
    expect(para).toHaveTextContent(/production-ready/);
    expect(para).toHaveTextContent(/software\./);
  });
});
describe("Services", () => {
  it("renders the eyebrow, intro statement, and all four cards with stack styles", () => {
    const { container } = render(<Services />);
    expect(screen.getAllByText("Services").length).toBeGreaterThan(0);
    expect(screen.getByText(/What I do:/)).toBeInTheDocument();
    const cards = container.querySelectorAll(".svc-card");
    expect(cards.length).toBe(SERVICES.length);
    cards.forEach((card, i) => {
      const style = (card as HTMLElement).getAttribute("style") ?? "";
      expect(style).toContain(`z-index: ${i + 1}`);
    });
  });
  it("renders each service's titleLineOne", () => {
    render(<Services />);
    for (const s of SERVICES) {
      expect(screen.getByRole("heading", { level: 3, name: new RegExp(s.w1) })).toBeInTheDocument();
    }
  });
});
describe("Work", () => {
  it("renders the head copy + all four spec project cards with tag pills", () => {
    render(<Work />);
    expect(screen.getByText(/A track record of turning/)).toBeInTheDocument();
    for (const w of WORK) {
      expect(screen.getByText(w.nm)).toBeInTheDocument();
      expect(screen.getByText(w.og)).toBeInTheDocument();
      expect(screen.getByText(w.tag)).toBeInTheDocument();
    }
  });
});
describe("Experience", () => {
  it("renders all four XP rows; current roles carry a `.now` marker", () => {
    const { container } = render(<Experience />);
    const rows = container.querySelectorAll(".xp-row");
    expect(rows.length).toBe(XP.length);
    XP.forEach((row, i) => {
      const item = rows[i] as HTMLElement;
      const inItem = within(item);
      expect(inItem.getByText(row.role)).toBeInTheDocument();
      expect(inItem.getByText(row.org)).toBeInTheDocument();
      const whenText = inItem.getByText(new RegExp(row.when.replace(/\s+/g, "\\s+")));
      expect(whenText).toBeInTheDocument();
      if (row.now) {
        expect(item.querySelector(".now")).not.toBeNull();
      }
    });
  });
});
describe("AISection", () => {
  it("renders the eyebrow, headline, and all four AIITEMS with their tools", () => {
    beforeEachLocal();
    render(<AISection />);
    expect(screen.getByText("AI in the workflow")).toBeInTheDocument();
    expect(screen.getByText(/AI is part of/)).toBeInTheDocument();
    for (const item of AIITEMS) {
      expect(screen.getByRole("heading", { level: 3, name: item.t })).toBeInTheDocument();
      for (const tool of item.tools) {
        expect(screen.getByText(tool)).toBeInTheDocument();
      }
    }
  });
  it("includes the three dev-label captions in the showcase", () => {
    beforeEachLocal();
    const { container } = render(<AISection />);
    const labels = container.querySelectorAll(".dev-label");
    expect(labels.length).toBe(3);
    const texts = Array.from(labels).map((l) => l.textContent);
    expect(texts).toEqual(["AI Briefings", "On your wrist", "Full reporting"]);
  });
  it("respects the showPhone / showDesktop toggles", () => {
    beforeEachLocal();
    const { container } = render(<AISection showPhone={false} showDesktop={false} />);
    expect(container.querySelector(".phone")).toBeNull();
    expect(container.querySelector(".tablet")).toBeNull();
    expect(container.querySelector(".watch")).not.toBeNull();
    expect(container.querySelector(".laptop")).not.toBeNull();
  });
  function beforeEachLocal(): void {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  }
});
describe("Contact", () => {
  it("renders the Don't be shy headline and both action buttons", () => {
    render(<Contact />);
    expect(screen.getByText(/Don't/)).toBeInTheDocument();
    expect(screen.getByText("shy.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start a conversation/i })).toHaveAttribute(
      "href",
      `mailto:${SITE.email}`,
    );
    expect(screen.getByRole("link", { name: /Download CV/i })).toHaveAttribute(
      "href",
      "/recruiter",
    );
  });
  it("renders the email, phone, and location meta values", () => {
    render(<Contact />);
    expect(screen.getByText(SITE.email)).toBeInTheDocument();
    expect(screen.getByText(SITE.phone)).toBeInTheDocument();
    expect(screen.getByText(SITE.location)).toBeInTheDocument();
  });
});
describe("Footer", () => {
  it("renders the spec wordmark + sub line + 3 links + GoUp", () => {
    render(<Footer />);
    expect(screen.getByText(/Mzwakhe Mokhatla/)).toBeInTheDocument();
    expect(screen.getByText(/Software Engineer · Full-Stack · Tech Lead/)).toHaveTextContent(
      SITE.location,
    );
    expect(screen.getByRole("link", { name: /Email/i })).toHaveAttribute(
      "href",
      `mailto:${SITE.email}`,
    );
    expect(screen.getByRole("link", { name: /Phone/i })).toHaveAttribute("href", SITE.phoneHref);
    expect(screen.getByRole("link", { name: /Work/i })).toHaveAttribute("href", "#work");
    expect(screen.getByRole("button", { name: /scroll back to top/i })).toBeInTheDocument();
  });
});
describe("NAVLINKS shape (re-asserted at section level)", () => {
  it("has exactly 5 entries and the order matches what Menu renders", () => {
    expect(NAVLINKS.length).toBe(5);
  });
});
```

### `src/__tests__/hooks/useInView.test.tsx`

```tsx
import { act, render } from "@testing-library/react";
import { useEffect } from "react";
import { useInView } from "@/hooks/useInView";
function Probe({ report }: { report: (seen: boolean) => void }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  useEffect(() => report(seen), [seen, report]);
  return <div ref={ref}>probe</div>;
}
describe("useInView", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());
  it("flips to seen=true via the 1500ms fallback when no scroll fires", () => {
    const original = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function (): DOMRect {
      return {
        top: 9999,
        bottom: 99999,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect;
    };
    const report = jest.fn();
    render(<Probe report={report} />);
    expect(report).toHaveBeenLastCalledWith(false);
    act(() => jest.advanceTimersByTime(1600));
    expect(report).toHaveBeenLastCalledWith(true);
    HTMLElement.prototype.getBoundingClientRect = original;
  });
  it("is seen immediately when the element rect is already in view", () => {
    const original = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function (): DOMRect {
      return {
        top: 10,
        bottom: 100,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect;
    };
    const report = jest.fn();
    render(<Probe report={report} />);
    expect(report).toHaveBeenLastCalledWith(true);
    HTMLElement.prototype.getBoundingClientRect = original;
  });
});
```

### `src/__tests__/hooks/useTheme.test.tsx`

```tsx
import { act, renderHook } from "@testing-library/react";
import { useTheme } from "@/hooks/useTheme";
const KEY = "studio-theme";
describe("useTheme", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });
  it("starts at 'light' before hydration, then resolves from localStorage", () => {
    window.localStorage.setItem(KEY, "dark");
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
  it("toggles between light and dark, persisting + applying each time", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
    act(() => result.current.toggle());
    expect(result.current.theme).toBe("dark");
    expect(window.localStorage.getItem(KEY)).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    act(() => result.current.toggle());
    expect(result.current.theme).toBe("light");
    expect(window.localStorage.getItem(KEY)).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
  it("setTheme writes the supplied value without flipping", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme("dark"));
    expect(result.current.theme).toBe("dark");
    expect(window.localStorage.getItem(KEY)).toBe("dark");
  });
});
```

### `src/__tests__/lib/colors.test.ts`

```typescript
import { _hx, _lum, _rgb, _rgba } from "@/lib/colors";
describe("_hx (hex → [r,g,b])", () => {
  it("parses 6-digit hex with leading #", () => {
    expect(_hx("#b2d5e5")).toEqual([0xb2, 0xd5, 0xe5]);
  });
  it("parses 6-digit hex without #", () => {
    expect(_hx("020202")).toEqual([2, 2, 2]);
  });
  it("expands 3-digit shorthand", () => {
    expect(_hx("#abc")).toEqual([0xaa, 0xbb, 0xcc]);
  });
});
describe("_lum (relative luminance)", () => {
  it("is 0 for pure black", () => {
    expect(_lum([0, 0, 0])).toBe(0);
  });
  it("is 1 for pure white", () => {
    expect(_lum([255, 255, 255])).toBe(1);
  });
  it("agrees with the 0.299/0.587/0.114 weights for primaries", () => {
    expect(_lum([255, 0, 0])).toBeCloseTo(0.299, 4);
    expect(_lum([0, 255, 0])).toBeCloseTo(0.587, 4);
    expect(_lum([0, 0, 255])).toBeCloseTo(0.114, 4);
  });
});
describe("_rgb / _rgba (CSS string formatters)", () => {
  it("_rgb wraps the triple", () => {
    expect(_rgb([1, 2, 3])).toBe("rgb(1,2,3)");
  });
  it("_rgba appends opacity", () => {
    expect(_rgba([1, 2, 3], 0.5)).toBe("rgba(1,2,3,0.5)");
  });
});
```

### `src/__tests__/lib/constants.test.ts`

```typescript
import { AIITEMS, NAVLINKS, SERVICES, SITE, WORK, XP } from "@/lib/constants";
describe("SITE", () => {
  it("carries the spec identity strings verbatim", () => {
    expect(SITE.name).toBe("Mzwakhe Mokhatla");
    expect(SITE.email).toBe("mokhatla.mzwakhe@gmail.com");
    expect(SITE.phone).toBe("067 980 1166");
    expect(SITE.phoneHref).toBe("tel:+27679801166");
    expect(SITE.location).toBe("Pretoria, South Africa");
    expect(SITE.tagline).toBe("Turning ideas into digital realities.");
  });
  it("points cvHref + portrait at the assets shipped under /public", () => {
    expect(SITE.cvHref).toBe("/cv/Mzwakhe_Sifiso_Mokhatla_CV.pdf");
    expect(SITE.portrait).toBe("/img/Potrait.png");
  });
});
describe("NAVLINKS", () => {
  it("is the five spec entries in order with the right numbering", () => {
    expect(NAVLINKS.map((l) => `${l.n} ${l.t} ${l.href}`)).toEqual([
      "01 Work #work",
      "02 Services #services",
      "03 AI Workflow #ai",
      "04 Experience #experience",
      "05 Contact #contact",
    ]);
  });
});
describe("SERVICES", () => {
  it("is exactly the four spec services in order", () => {
    expect(SERVICES.map((s) => `${s.w1} ${s.w2}`)).toEqual([
      "Frontend Engineering",
      "Full-Stack & Cloud",
      "Technical Leadership",
      "Platform & DevOps",
    ]);
  });
  it("Frontend service has the spec pills + body", () => {
    const fe = SERVICES[0];
    expect(fe.pills).toEqual(["React", "TypeScript", "Next.js", "Microfrontends", "UI/UX"]);
    expect(fe.d).toMatch(/accessible, responsive, and fast/);
  });
});
describe("WORK", () => {
  it("is the four spec projects in order with the right tags + slots", () => {
    expect(WORK.map((w) => `${w.nm}|${w.tag}|${w.slot}`)).toEqual([
      "StudioSync|Platform|work-studiosync",
      "Bayobab Client Portal|Frontend|work-bayobab",
      "e-Teller|Fintech|work-eteller",
      "GE Smallworld GIS|GIS|work-gis",
    ]);
  });
});
describe("XP", () => {
  it("marks MTN and Accenture as ongoing (now=true)", () => {
    expect(XP[0].now).toBe(true);
    expect(XP[1].now).toBe(true);
    expect(XP[2].now).toBeUndefined();
    expect(XP[3].now).toBeUndefined();
  });
});
describe("AIITEMS", () => {
  it("is the four spec items with their tool sets", () => {
    expect(AIITEMS.map((a) => a.t)).toEqual([
      "AI pair-programming",
      "Rapid prototyping",
      "Tests & documentation",
      "Review & research",
    ]);
    expect(AIITEMS[0].tools).toEqual(["Cursor", "Copilot"]);
  });
});
```

### `src/__tests__/lib/recruiter.test.ts`

```typescript
import {
  domainOf,
  emailRe,
  FREE,
  genCode,
  isFree,
  loadAccounts,
  LS_ACCOUNTS,
  LS_SESSION,
  saveAccounts,
} from "@/lib/recruiter";
describe("FREE domain set", () => {
  it("contains the canonical personal-inbox providers", () => {
    expect(FREE.has("gmail.com")).toBe(true);
    expect(FREE.has("outlook.com")).toBe(true);
    expect(FREE.has("icloud.com")).toBe(true);
    expect(FREE.has("proton.me")).toBe(true);
  });
  it("does not contain corporate-looking domains", () => {
    expect(FREE.has("anthropic.com")).toBe(false);
    expect(FREE.has("mtn.com")).toBe(false);
  });
});
describe("emailRe", () => {
  it.each([
    ["a@b.co", true],
    ["jordan.pillay@acme.co.uk", true],
    ["no-at", false],
    ["@nothing.com", false],
    ["space @x.co", false],
  ])("%s → %s", (input, want) => {
    expect(emailRe.test(input)).toBe(want);
  });
});
describe("domainOf", () => {
  it("returns the lowercased trimmed domain part", () => {
    expect(domainOf("Jordan@Acme.CO")).toBe("acme.co");
    expect(domainOf("   x@Foo.com ")).toBe("foo.com");
  });
  it("returns empty string when there's no @", () => {
    expect(domainOf("nope")).toBe("");
  });
});
describe("isFree", () => {
  it("flags personal inboxes", () => {
    expect(isFree("me@gmail.com")).toBe(true);
    expect(isFree("Me@OUTLOOK.com")).toBe(true);
  });
  it("approves work domains", () => {
    expect(isFree("me@acme.co")).toBe(false);
  });
});
describe("genCode", () => {
  it("always produces a 6-digit numeric string", () => {
    for (let i = 0; i < 50; i += 1) {
      const code = genCode();
      expect(code).toMatch(/^\d{6}$/);
    }
  });
});
describe("loadAccounts / saveAccounts", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  it("returns {} when storage is empty", () => {
    expect(loadAccounts()).toEqual({});
  });
  it("round-trips a saved account map", () => {
    const accounts = {
      "jordan@acme.co": {
        name: "Jordan",
        email: "jordan@acme.co",
        company: "Acme",
        role: "Frontend Engineer",
        url: "acme.co",
        verifiedAt: 123,
      },
    };
    saveAccounts(accounts);
    expect(window.localStorage.getItem(LS_ACCOUNTS)).toContain("jordan@acme.co");
    expect(loadAccounts()).toEqual(accounts);
  });
  it("returns {} when storage holds corrupt JSON", () => {
    window.localStorage.setItem(LS_ACCOUNTS, "{not-json");
    expect(loadAccounts()).toEqual({});
  });
  it("exposes the LS_SESSION key constant for callers", () => {
    expect(LS_SESSION).toBe("recruiter-session-v1");
  });
});
```

---

## Appendix · Other tracked files

### `.claude/launch.json`

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "dev",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 3000,
      "autoPort": true
    },
    {
      "name": "preview",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start", "--", "--port", "0"],
      "port": 4100,
      "autoPort": true
    }
  ]
}
```

---

## Appendix · Binary & placeholder files (not embeddable as text)

These cannot be reproduced from text; supply your own equivalents (see Section 5 for purpose/dimensions).

- `public/img/Potrait.png` — hero portrait (~3.06 MB). Rendered `object-fit: cover` in a rounded frame; also used as the OpenGraph/Twitter image (target ≥1200×630 usable) and apple-touch icon. Filename spelling (`Potrait`) is intentional — referenced as `SITE.portrait`.
- `public/cv/Mzwakhe_Sifiso_Mokhatla_CV.pdf` — the downloadable CV (~117 KB) offered at the end of the recruiter flow / "Download CV" links.
- `src/app/favicon.ico` — site favicon (~25.9 KB).
- `public/cv/.gitkeep`, `public/img/.gitkeep` — empty placeholders that keep the otherwise-empty asset directories under version control.
- `package-lock.json` — omitted (regenerate with `npm install`); exact dependency versions are pinned in `package.json` above.

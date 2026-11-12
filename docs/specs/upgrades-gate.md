# UG: "Upgrades in progress" gate

| Field | Value |
| --- | --- |
| Spec ID | UG |
| Status | Spec signed off and design approved 2026-11-05. Build in progress (section 12). |
| Owner | Mzwakhe Mokhatla |
| Branches | `feature/UG-00-spec` (this document), then the build branches in section 12 |
| Brief received | 2026-11-05 |

Sign-off gates, in order. Nothing moves to the next gate until the previous one is signed off.

1. **Spec**: this document, including every open decision in section 3.
2. **Design**: code-built design boards (HTML, CSS and the same tokens the build will use) for every frame listed in section 9, exported as images for review. Changed from Figma on 2026-11-05: the Figma Starter plan's MCP allowance ran out after the foundations were created. The Figma file keeps the token foundations.
3. **Build**: pull requests as planned in section 12. Nothing merges without your approved review.

---

## 1. Problem definition

Several sections of the portfolio are being rebuilt. Until they are done, visitors should land on a single, deliberate page that:

- says plainly that upgrades are in progress,
- lets anyone who needs the work today continue to the current site,
- lets anyone who would rather wait leave an email address and be told once when the new version is live.

Nothing else on the site is reachable until the visitor chooses to continue.

### Goals

- G1. A first impression that carries the brand while the rebuild happens.
- G2. No dead end: the current site stays one click away.
- G3. A lawful, verifiable list of people who asked to be told about the launch.

### Non-goals

- Changing any section of the current site (AI section, logo, navbar, projects, map, "which brings you here", footer). You are handling those.
- Acting as a security boundary. The gate is a presentation gate; the recruiter, guest and executive areas keep their own authentication.
- Analytics on the gate beyond what the consent banner already governs.

---

## 2. Confirmed decisions

| ID | Decision | Source |
| --- | --- | --- |
| C1 | Caution tape is monochrome. Dark mode: black and grey. Light mode: white and darker shades of white. | Brief, point 1 |
| C2 | The tape is far thicker than standard, has a subtle gloss, sits close to the screen and runs edge to edge. | Brief, point 1 |
| C3 | The tape print reads "Upgrades in progress", bold and large, with very subtle movement. | Brief, point 1 |
| C4 | Three strips crossing, as in the supplied tape reference. | Answer, 2026-11-05 |
| C5 | Composition follows the supplied phone render: two subjects at angles facing each other, one in front of the other. | Brief, point 2 |
| C6 | Subjects: a cut-out of you, standing, facing a frameless, rounded-edge mirror. Inside the mirror, an AI synthezoid that looks like you faces back. | Brief, point 2 |
| C7 | Imagery is produced by manipulating the portrait you supplied, not generated from a third-party model. | Answer, 2026-11-05 |
| C8 | The only actions on the page are two central buttons: "Go to previous portfolio version for now" and "Notify me when the updates are done". | Brief, point 3 |
| C9 | "Go to previous portfolio version for now" unlocks the current site at its existing URLs. | Answer, 2026-11-05 |
| C10 | "Notify me when the updates are done" is an email sign-up with double opt-in, stored in the existing Neon database and sent through Resend. | Answer, 2026-11-05 |
| C11 | The theme toggle becomes a glossy pill switch (Daily UI #015 reference): shades of black in dark mode, shades of white in light mode. | Brief, point 4 |
| C12 | The rest of the site is inaccessible until the access button is clicked. | Brief, PS |
| C13 | No dependency version changes. | Standing rule |

---

## 3. Decisions from sign-off

All twelve recommendations below were accepted on 2026-11-05. D12 is deferred: design proceeds with the supplied portrait, and the synthezoid treatment (A2) is produced last.

| ID | Question | Recommendation | Why |
| --- | --- | --- | --- |
| D1 | How long does "Go to previous portfolio version for now" stay remembered? | The tab it was chosen in (changed 2026-11-11, was 30 days) | Owner decision: closing the tab and opening a new one shows the gate again. |
| D2 | Which of the two buttons is primary (filled)? | "Go to previous portfolio version for now" | Most visitors arrive to see work today; the sign-up is the secondary path. |
| D3 | What does the top bar show on the gate? | Logo and theme toggle only | "Let's talk" and "Menu" link into sections the gate is hiding. |
| D4 | Does the new toggle replace the current one everywhere? | Yes, one component sitewide | One source of truth; two toggle styles would read as inconsistent. |
| D5 | Page background on the gate | Neutral monochrome (whites in light mode, blacks in dark mode) | Matches C1 and C11. The current light background is tinted with your candy blue, which would sit oddly against white tape. |
| D6 | Typeface for the tape print | Onest Black (900), uppercase | Keeps one brand typeface. The reference uses a condensed face; adding one is possible but brings a second font into the brand. |
| D7 | What "very subtle movement" means | The print drifts slowly along each strip, alternating direction per strip, and the strips sway by no more than a couple of pixels | Movement you notice on a second look, never on the first. |
| D8 | Contrast of the tape print | At least 3:1 against the tape (WCAG 2.2 AA for large text). In light mode that makes the print a soft mid grey rather than an off-white. | The print carries the page's only visible message, so an accessibility review would flag anything fainter. |
| D9 | Database change process | Introduce versioned Prisma migrations, starting with a baseline of the current schema | The repo applies schema with `db push` today and has no migrations folder. Your global rule requires versioned, reversible migrations. |
| D10 | Input validation | Reuse the project's existing validators (`src/lib/auth/validation.ts` pattern) | Zod is not installed. Adding it is a new dependency; reusing the existing pattern keeps the API routes consistent. |
| D11 | Search visibility while gated | Accept it | Every URL serves the gate, so search results will show the gate until it comes down. Letting crawlers past the gate would be cloaking, which search engines penalise. |
| D12 | Portrait source file | Send the original full-resolution file if you have it | The supplied copy is a compressed 1149 x 1369 image. It works, but the figure is shown about 1.3x larger than that on high-density screens and will look slightly soft. |

---

## 4. Experience specification

### 4.1 Layout

Reference frames: desktop 1440 x 900, tablet 1024 x 768, mobile 390 x 844. Supported down to 320 x 568.

The page is one screen tall (`100svh`). If the viewport is too short for its content, the page scrolls rather than clipping anything.

**Z-order, back to front:**

1. Background.
2. Mirror, with the synthezoid inside it.
3. Cut-out of you.
4. The three tape strips.
5. Top bar and the two buttons.

**Composition (desktop):**

- **You:** front left, angled toward the mirror, bleeding off the bottom edge. As in the phone reference, nothing below the chest is visible, so the photographed pose reads as standing (see 4.4).
- **Mirror:** behind and to the right, turned in perspective to face you, also bleeding off the bottom edge.
- **Eye line:** the synthezoid's eyes sit on the same line as yours, so the two look at each other across the centre of the screen.
- **Buttons:** centred horizontally, in the space between the two figures.

**Hard constraints (every breakpoint):**

- No tape strip crosses either face.
- No tape strip passes behind either button.
- No content is hidden behind the consent banner at the reference sizes: when the banner is open, the buttons stay visible above it.

### 4.2 Caution tape

| Property | Light mode | Dark mode |
| --- | --- | --- |
| Tape body | White through soft greys, for example `#FFFFFF` to `#E9EAEC` across the gloss | Near black through charcoal, for example `#0B0B0C` to `#1C1C1E` |
| Print | Grey meeting D8 | Grey meeting D8 |
| Gloss | One soft specular band along each strip, low intensity | Same, cooler and dimmer |
| Depth | The nearest sections are slightly out of focus (depth of field), as in the reference | Same |

- Thickness at desktop: roughly 11 to 14 percent of viewport height per strip. The Figma mockup fixes the exact value.
- Print: "UPGRADES IN PROGRESS" repeating, with a fixed gap between repeats.
- Motion: as D7.

### 4.3 Mirror

- Frameless, with rounded corners and a thin polished edge that catches the light.
- The glass has a faint tint and one diagonal reflection sweep.
- Whatever the mirror reflects is darker than the room in front of it, in both themes, so the synthezoid reads as being inside it.
- The mirror is drawn in code (CSS), not baked into an image, so it adapts to both themes from one asset.

### 4.4 Imagery and its limits

| Asset | Description | Produced by |
| --- | --- | --- |
| A1, you | Your supplied portrait, lifted from its background on this Mac with Apple's Vision framework (nothing uploaded), then cropped above the resting forearm so the figure bleeds off the bottom edge | On-device manipulation |
| A2, synthezoid | A1 mirrored horizontally (a true reflection), then treated as a synthetic version of you. In light mode it is white ceramic with shaded panel seams; in dark mode, black graphite with the same seams. The seams are placed from detected facial landmarks so they follow your real features, and the eyes take a soft emissive ring. Hair, glasses and suit take the same material. | On-device manipulation |

**Limits, stated up front:**

- Manipulation cannot change your posture. Your torso stays as photographed: turned slightly, head turned toward the mirror. "Standing" is achieved by the crop.
- A2 will read as a treated photograph of you, not a fully rendered android. A fully rendered synthezoid needs a generative model that takes your portrait as input. That would mean linking Figma Weave and uploading your photo, which you have chosen not to do.

### 4.5 Buttons

| Property | Primary | Secondary |
| --- | --- | --- |
| Label | Per D2 | The other label |
| Light mode | Black pill, white label | White glossy pill, black label, hairline border |
| Dark mode | White pill, black label | Black glossy pill, light grey label, hairline border |

- Shared: height 52 px, Onest 600 at 16 px, at least 44 x 44 px hit area.
- States: default, hover, pressed, focus-visible, busy (Notify only), disabled (Notify only, while submitting).
- Mobile: stacked and full width, with the primary on top.

### 4.6 Theme toggle

- A pill switch. The knob is a glossy sphere with a soft drop shadow.
- Light mode: the track runs from white to light grey with an inner shadow, the knob is white, and the knob sits on the right, as in the reference.
- Dark mode: the track runs from black to charcoal with a top sheen, the knob is black with a grey highlight, and the knob sits on the left.
- The knob carries a tone-on-tone glyph: a crescent in dark mode, a disc in light mode.
- Semantics: `role="switch"`, `aria-checked` reflects dark mode, and the accessible name is "Dark mode".
- Keyboard: Space and Enter toggle it, and the focus ring is visible.
- Motion: the knob slides in 240 ms; with reduced motion it switches instantly.
- Persistence: reuses `useTheme` and the existing `studio-theme` storage key, so there is no change to theme storage or to the cookie inventory.

### 4.7 Notify dialog

Opened by "Notify me when the updates are done".

**Contents:**

- Title: "Get one email when it's live".
- An email field labelled "Email address".
- A required consent checkbox: "Email me once when the new version is live. I can unsubscribe at any time." It is followed by a link to the privacy policy.
- A submit button.
- A hidden honeypot field.

**States:**

| State | What the visitor sees |
| --- | --- |
| Idle | The form |
| Submitting | Button busy, form disabled |
| Submitted | "Check your inbox to confirm." This message is identical whether the address is new, pending or already confirmed, so nobody can test which addresses are on the list. |
| Invalid input | Message next to the field |
| Rate limited | "A few attempts in a short window. Try again shortly." |
| Server error | "Something went wrong. Try again." |

**Behaviour:** an accessible modal. Focus is trapped while it is open, Escape closes it, and focus returns to the button that opened it. Body scroll is locked while it is open.

### 4.8 Copy

- Spelling follows the site's existing British and South African spelling.
- All visible copy is final and approved in the design gate.
- No em dashes.

---

## 5. Functional requirements

### FR-UG-01 Gate every page

Without the access cookie, every page request renders the gate with status 200. The URL in the address bar stays unchanged.

**Exempt (always reachable):**

- `/api/*`, `/_next/*`, `/robots.txt`, `/sitemap.xml`, `/icon.svg`
- `/legal/*`
- `/updates/confirm`, `/updates/unsubscribe`

**Acceptance criteria:**

- AC1. A request to `/`, `/recruiter` or `/guest?token=x` without the cookie returns the gate markup.
- AC2. `/legal/privacy` without the cookie returns the policy.
- AC3. The CSP header is still applied to every response, including the gate.

### FR-UG-02 Continue to the current site

"Go to previous portfolio version for now" sets the access cookie and reloads the same URL. The visitor lands on the page they originally asked for, with its query string intact.

The button works without JavaScript: it is a form POST to `/api/site-access`, which answers with a 303 redirect.

**Acceptance criteria:**

- AC1. After clicking it on `/guest?token=x`, the guest page loads with its token.
- AC2. The return path accepts same-origin relative paths only; anything else falls back to `/`, so the endpoint cannot be used as an open redirect.
- AC3. The tab the choice was made in goes straight to the site. A new tab or window shows the gate.

### FR-UG-03 Access cookie

| Attribute | Value |
| --- | --- |
| Name | `site-access` |
| Value | `v2` (was `v1` until 2026-11-12; the bump re-gates everyone who held the old 30-day cookie) |
| Flags | `Secure` (production), `SameSite=Lax`, `Path=/`. Not `HttpOnly`: the page script clears it in tabs that did not make the choice. |
| Lifetime | Session cookie, scoped to one tab by a `site-access` sessionStorage mark (D1) |

- The value is versioned so that a future change can re-gate everyone.
- Added to `COOKIE_INVENTORY` as strictly necessary, with `COOKIE_POLICY_VERSION` bumped.

**Acceptance criteria:**

- AC1. The cookie policy page lists `site-access`.

### FR-UG-04 Gate page content

The gate page renders sections 4.1 to 4.6. A visually hidden `h1` reads "Upgrades in progress". The tape strips, mirror and synthezoid are `aria-hidden`. The cut-out of you has alt text: "Mzwakhe Mokhatla looking into a mirror."

**Acceptance criteria:**

- AC1. axe reports no violations.
- AC2. Every interactive element is reachable by keyboard, in a logical order.

### FR-UG-05 Subscribe

`POST /api/updates/subscribe` (contract in 7.1) validates the input, rate limits by IP and by email, stores a pending subscriber with a hashed confirmation token, and sends the confirmation email.

**Acceptance criteria:**

- AC1. A valid request returns 202 and the confirmation email arrives. Delivery is verified in Resend's own log, not only in tests.
- AC2. A repeat request for the same address returns the same 202.
- AC3. A missing consent returns 400.
- AC4. The honeypot field silently returns 202 and stores nothing.

### FR-UG-06 Confirm

The email link opens `/updates/confirm?token=…`. That page shows a "Confirm" button, which POSTs to `/api/updates/confirm`. Confirmation takes a click because a plain link would let email security scanners, which open links automatically, confirm addresses on their own.

**Acceptance criteria:**

- AC1. A valid token confirms the subscription and shows "You're on the list".
- AC2. An expired or used token shows a clear message and a way to sign up again.
- AC3. Tokens expire after 48 hours.

### FR-UG-07 Unsubscribe

- Every email carries an unsubscribe link and RFC 8058 one-click `List-Unsubscribe` headers.
- Unsubscribing deletes the row.

**Acceptance criteria:**

- AC1. One-click unsubscribe from Gmail removes the row.
- AC2. The unsubscribe page confirms the removal.

### FR-UG-08 Launch announcement

`npm run updates:announce` sends one email to every confirmed subscriber, in batches through Resend, then deletes the rows. It runs only when you run it.

- `--dry-run` prints the count and sends nothing.
- Pending rows older than 7 days are deleted first.

**Acceptance criteria:**

- AC1. A dry run sends nothing.
- AC2. After a real run, the table is empty and Resend's log shows each delivery.

### FR-UG-09 Theme toggle

Section 4.6, implemented as one shared component used in both the gate and the site nav (per D4).

**Acceptance criteria:**

- AC1. The toggle is announced as a switch with its state.
- AC2. Theme survives a reload, with no flash of the wrong theme.

### FR-UG-10 Privacy

The privacy policy gains a section for launch updates:

- the purpose,
- the lawful basis (consent),
- what is stored (email address, consent time and policy version only, with no IP address or user agent),
- retention (until the launch email is sent; unconfirmed sign-ups after 7 days),
- how to withdraw.

`PRIVACY_POLICY_VERSION` is bumped.

**Acceptance criteria:**

- AC1. The consent checkbox links to the updated section.

---

## 6. Non-functional requirements

| Area | Requirement |
| --- | --- |
| Accessibility | WCAG 2.2 AA. Visible focus on everything interactive; contrast per D8 and at least 4.5:1 for button labels; `prefers-reduced-motion` stops all ambient motion and shows a still frame; no information conveyed by motion alone. |
| Performance | On a throttled mid-tier phone: LCP under 2.5 s, CLS under 0.1, INP under 200 ms. Imagery is served as AVIF or WebP at responsive sizes, and the cut-out is the LCP image with priority loading. Ambient motion pauses when the tab is hidden or the page is off screen. Rendering the tape costs under 4 ms per frame on that phone. |
| Security | The existing CSP with nonce is unchanged. Rate limits use the existing Upstash limiter, with new policies `updates-subscribe` and `updates-confirm`. Tokens are 32 random bytes and only their SHA-256 hash is stored. POST routes check `Origin` the way Next checks Server Actions: when present, its host must match `Host` or the first `X-Forwarded-Host`; an opaque or malformed `Origin` fails; a request without one passes, because browsers always send it cross-site and a handcrafted request carries no visitor's credentials. The RFC 8058 one-click POST is exempt, since mail providers send it from their servers. Responses do not reveal which addresses are on the list. |
| Privacy | Data minimisation as FR-UG-10. No new third parties: Neon and Resend are already processors. |
| Theming | Both themes are specified for every element. There is no flash of the wrong theme on load (the existing `ThemeScript`). |
| Browsers | Last two versions of Chrome, Edge, Firefox and Safari, plus iOS Safari 17 and later. |
| Code | TypeScript strict, named exports, explicit return types. Pure logic (gate matching, token handling, validation, tape geometry) lives in `src/lib` with unit tests at the existing coverage thresholds. |

---

## 7. API contracts

### 7.1 `POST /api/updates/subscribe`

Request:

```json
{ "email": "string, at most 254 characters, normalised to lowercase", "consent": true, "website": "honeypot, must be empty" }
```

| Status | Body | When |
| --- | --- | --- |
| 202 | `{ "ok": true }` | Accepted. Same response for new, pending and confirmed addresses. |
| 400 | `{ "message": string, "field": "email" \| "consent" }` | Invalid email, or consent not given. `field` places the message next to its control, as the dialog boards show. |
| 403 | `{ "message": string }` | `Origin` is not this site |
| 429 | `{ "message": string }` | Rate limited |
| 500 | `{ "message": string }` | Unexpected failure; the details are logged on the server only |

### 7.2 `POST /api/updates/confirm`

Request:

```json
{ "token": "string" }
```

The token may also arrive as a form field, since the confirm page posts a plain form. The response is a 303 redirect to `/updates/confirm?status=confirmed|expired|invalid|limited|error`. `limited` (the `updates-confirm` policy) and `error` (an unexpected failure, logged on the server) are not on the approved page boards; the page shows them with the dialog's approved lines, "A few attempts in a short window. Try again shortly." and "Something went wrong. Try again.", pending your approval in PR 3. A foreign `Origin` gets 403.

### 7.3 `POST /api/updates/unsubscribe`

Takes `{ "token": string }`, or the RFC 8058 body `List-Unsubscribe=One-Click` with the token in the query string. Answers with a 303 redirect to `/updates/unsubscribe?status=removed|invalid|error`, or a bare 200 for one-click requests, never a redirect (RFC 8058 section 3.1), and 500 when the database fails so the provider retries.

`GET /api/updates/unsubscribe?token=…`, sent by mail clients that open the header link in a browser, only redirects to the unsubscribe page with the token. A GET never deletes anything, so link scanners cannot unsubscribe anyone.

### 7.4 `POST /api/site-access`

Takes the form field `return` (a same-origin relative path). Sets the cookie from FR-UG-03 and answers with a 303 redirect to the validated return path.

---

## 8. Data model

```prisma
model UpdateSubscriber {
  id                   String                 @id @default(cuid())
  email                String                 @unique
  status               UpdateSubscriberStatus @default(pending)
  confirmTokenHash     String?                @unique
  confirmExpiresAt     DateTime?
  unsubscribeTokenHash String                 @unique
  policyVersion        String
  consentedAt          DateTime
  confirmedAt          DateTime?
  createdAt            DateTime               @default(now())
  updatedAt            DateTime               @updatedAt

  @@index([status])
  @@map("update_subscriber")
}

enum UpdateSubscriberStatus {
  pending
  confirmed

  @@map("update_subscriber_status")
}
```

- The change is additive only: no existing table or column is touched.
- Reversal is a single drop of the new table and enum. How it is applied depends on D9.

---

## 9. Design deliverables (design gate)

The Figma file contains:

1. Gate: desktop, tablet and mobile, each in light and dark.
2. Gate with the consent banner open: desktop and mobile, light.
3. The reduced-motion still frame.
4. Theme toggle: both states, hover, focus and pressed.
5. Buttons: every state from 4.5, in both themes.
6. Notify dialog: every state from 4.7, desktop and mobile.
7. The confirm and unsubscribe pages, in every state.
8. Email templates: the confirmation email and the launch announcement.
9. Imagery: A1 and A2 in both themes, shown at full size so the image quality can be judged.

Every frame is exported as an image for your review, because artifact links do not display for you.

---

## 10. Test strategy

| Test | Covers |
| --- | --- |
| TC-01 | Gate matching: the exempt list, the cookie present or absent, a versioned cookie value (unit) |
| TC-02 | Return-path validation, rejecting `//evil.com`, absolute URLs, `/\evil` and encoded variants (unit) |
| TC-03 | Subscribe route: valid, duplicate, honeypot, missing consent, bad origin, rate limited (route tests with Prisma and Resend mocked) |
| TC-04 | Token issue, hash, expiry and single use (unit) |
| TC-05 | Confirm and unsubscribe routes, including RFC 8058 one-click (route tests) |
| TC-06 | Announce script: dry run, batching, deletion afterwards (unit, with mocks) |
| TC-07 | Toggle: role, `aria-checked`, keyboard, reduced motion (component) |
| TC-08 | Notify dialog: every state, focus trap, Escape, focus return (component) |
| TC-09 | Gate page: hidden `h1`, `aria-hidden` decoration, button order, no-JavaScript form (component) |
| TC-10 | Real delivery: a confirmation email to a real inbox, checked in Resend's log (manual, recorded in the PR) |
| TC-11 | Browser verification at every reference size, in both themes and with reduced motion; screenshots attached to each PR (manual) |

---

## 11. Risks

| ID | Risk | Mitigation |
| --- | --- | --- |
| R1 | A2 reads as a filter rather than a synthezoid | It is judged at full size at the design gate before any code. The limits are stated in 4.4. |
| R2 | Search listings show the gate (D11) | Keep the gate up only as long as needed. Its metadata stays your name and title. |
| R3 | The tape renderer is costly on low-end phones | Frame budget in section 6; frames are skipped when hidden; still frame with reduced motion. |
| R4 | Confirmation emails land in spam | Send from the existing verified Resend domain (`RESEND_FROM`) and verify for real per TC-10. |
| R5 | Email links (guest and executive approvals) now pass through the gate | One click continues to the original URL, token included (FR-UG-02 AC1). |

---

## 12. Delivery plan

Each pull request stays under 400 changed lines. They are stacked, each built on the previous one, and none merges without your approval. Pull requests planned as one were split to stay under that limit, and on 2026-11-06 the tape and gate page moved ahead of PR 3 at your request, so the gate can be seen running sooner. The table is in stack order.

| PR | Branch | Contents |
| --- | --- | --- |
| 1 | `feature/UG-01-theme-toggle` | The toggle component, its styles and tests, replacing the current button (D4) |
| 2a | `feature/UG-02a-migrations` | Versioned migrations, the baseline and the `update_subscriber` table (D9), with the runbook |
| 2b | `feature/UG-02b-updates-core` | Link tokens, sign-up validation and the confirmation email, with tests |
| 2c | `feature/UG-02c-updates-service` | Subscribe, confirm, unsubscribe and purge service, rate-limit policies, with tests |
| 2d | `feature/UG-02d-updates-routes` | Subscribe route (7.1) and the shared POST helpers, with tests |
| 2e | `feature/UG-02e-updates-routes` | Confirm and unsubscribe routes (7.2, 7.3), with tests |
| 4a | `feature/UG-04a-tape-geometry` | Tape presets and projection, with tests |
| 4b | `feature/UG-04b-tape-fit` | Fitting the strips clear of the buttons, and the print layout, with tests |
| 4c | `feature/UG-04c-tape-layout` | The hook that lays the tape out for the live page, with tests |
| 4d | `feature/UG-04d-tape-component` | The tape component, its tokens and styles, with tests |
| 5a | `feature/UG-05a-gate-page` | The gate page at `/upgrades`: top bar, tape, the two buttons, shared button styles |
| 5b | `feature/UG-05b-gate-consent` | The gate keeps clear of the consent banner (G6) |
| 3a | `feature/UG-03a-notify-signup` | The sign-up logic behind the notify dialog, with tests |
| 3b | `feature/UG-03b-notify-styles` | The dialog and form styles, the alert icon and the busy button |
| 3c | `feature/UG-03c-notify-form` | The notify form, with tests |
| 3d | `feature/UG-03d-notify-dialog` | The notify dialog and confirmation, wired to the gate, with tests (TC-08) |
| 3e | `feature/UG-03e-updates-pages` | Confirm and unsubscribe pages |
| 3f | `feature/UG-03f-privacy` | Privacy policy section for launch updates (FR-UG-10) |
| 2f | `feature/UG-02f-updates-purge` | A daily Vercel cron calling a protected purge route, so unconfirmed sign-ups go after 7 days as FR-UG-10 promises (decided 2026-11-06) |
| 6 | `feature/UG-06-site-gate` | Proxy gating, `/api/site-access`, cookie inventory. This is the switch that makes the gate live, so it lands last. |
| 7 | `feature/UG-07-announce` | Announce script and runbook |

---

## 13. Design gate notes (2026-11-05, for sign-off)

The design boards settle the points below. Items marked **change** differ from the text above and need your approval with the design.

| ID | Note |
| --- | --- |
| G1 | **Change to 4.6.** The toggle glyph is a sun (light) and moon (dark) at 3.6:1 or more against the knob, not tone on tone, and the track has a 1 px rim at 3.3:1 (light) and 3.6:1 (dark) against the page. Without both, the switch fails WCAG 1.4.11. |
| G2 | **Change to 4.2.** Tape print tokens, measured: light `#6E7075` (3.9:1 at the darkest point of the tape), dark `#7A7C81` (3.6:1 on the gloss band). |
| G3 | **Change to 4.2 and D7.** The movement is the whole strip drifting slowly along its own length (16 s each way, strips out of phase), not the print scrolling inside it. It reads the same, costs nothing per frame, and keeps the depth of field fixed in place. |
| G4 | **Change to 4.1.** The figure fades out at the chest instead of running off the bottom edge. The supplied photo ends at the chest, so a hard crop would show. |
| G5 | Layout rule: vertical positions are fractions of the scene box, the band between the top bar and the buttons. This is what guarantees no tape behind the buttons at any size. |
| G6 | With the consent banner open, the scene lays out in the space above it; nothing sits under the banner. |
| G7 | Phones: both buttons are full width and long labels wrap in balanced lines; the notify dialog is a bottom sheet. |
| G8 | **Change to 4.7.** The submitted state reads "If this address still needs confirming, a link is on its way to [address]. It expires in 48 hours." It stays identical for new, pending and confirmed addresses, and makes no claim that an email was sent when none was. |
| G9 | Errors use the one non-monochrome colour on the page: `#B3261E` (light) and `#F2B8B5` (dark), always with an icon and text. |
| G10 | The mirror shows a plain reflection (the cut-out mirrored, slightly further away) until the synthezoid treatment (A2) is produced. |
| G11 | Emails are designed for the Helvetica/Arial fallback that most clients use; Apple Mail gets a dark variant. The footer names the sender and location and carries unsubscribe and privacy links. |

## 14. Change: portrait and mirror removed (2026-11-05)

At your direction the portrait, the synthezoid and the mirror are removed. The gate is now the three tape strips and the two buttons.

- **Superseded:** C5, C6 and C7 in section 2; sections 4.3 and 4.4; the alt text in FR-UG-04 (there is no image left to describe); D12; G4 and G10.
- **Still in force:** everything else, including both buttons, the theme toggle, the notify flow and the site gate.

Design notes added with this change:

| ID | Note |
| --- | --- |
| G12 | The three strips cross the middle of the screen as in the reference: one high, one on the diagonal, one low. They are far thicker than before (about a fifth of the scene height each on desktop), glossy, with depth of field on the far ends. |
| G13 | The tape is fitted, not just placed. The layout projects each strip's real edges through the same 3D transform the CSS uses, at both ends of its drift, and lifts or thins the strips until none passes behind the buttons. This holds at every screen size and with the consent banner open. The build gets this as a tested function. |
| G14 | One whole "UPGRADES IN PROGRESS" is centred on screen on every strip, measured in the real font. On phones the print is smaller relative to the strip so the full phrase fits across the screen. |
| G15 | Build note (2026-11-06), matching the approved boards: on desktop and tablet the print fills the strip, so where a strip turns away from the viewer the end of the centred phrase can run into the out-of-focus far end. On phones the whole phrase fits. The build keeps the approved print sizes rather than shrinking the print to fit every width. |
| G16 | Build note (2026-11-06), matching the approved boards: the buttons are 56 px tall, not the 52 px in 4.5. |
| G17 | **Change to G14 for phones** (approved 2026-11-08 from rendered mockups). The phone strips match the desktop's weight: about 17 percent of the scene height each, with the print at 56 percent of the strip, and each strip centres one word, so the three read UPGRADES, IN, PROGRESS from top to bottom. At 390 x 844 the strips are 109 to 122 px thick with 62 to 69 px print, up from 59 to 67 px with 27 to 31 px. The print shrinks only where a tall, narrow phone would otherwise push the centred word past a 16 px gutter. On phones a strip group that starts above the top bar drops under it when the buttons leave room. Desktop, tablet and the confirm and unsubscribe pages are unchanged. |

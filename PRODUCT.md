# Problem.ge — Product Specification

> **Problem.ge is a free civic platform that allows citizens across Georgia to report local problems that need attention, such as damaged roads, broken streetlights, overflowing garbage bins, and neglected public spaces. Users can upload photos, write descriptions, select their neighborhood (such as Dighomi, Vake, or Saburtalo), and pinpoint the exact location of the problem on a map. Other users can browse reports, filter them by location and category, and upvote issues they believe deserve attention, helping the community highlight important problems. Each report has a status that allows users to track its progress, from being reported to receiving an official response and eventually being fixed, with evidence used to verify resolutions. A dedicated Fixed feed showcases resolved problems and the platform's real impact, while future partnerships with municipalities and businesses could help Problem.ge grow sustainably without charging citizens to report, vote, or view problems.**

Status: Draft v1 · Stack: Next.js (App Router) + MongoDB Atlas · Languages: Georgian (default), English

---

## Table of contents

1. [Principles](#1-principles)
2. [Goals and non-goals](#2-goals-and-non-goals)
3. [Users and roles](#3-users-and-roles)
4. [Core features](#4-core-features)
5. [Report status lifecycle](#5-report-status-lifecycle)
6. [Locations](#6-locations)
7. [Categories](#7-categories)
8. [Feeds, ranking and filters](#8-feeds-ranking-and-filters)
9. [Data model](#9-data-model)
10. [Server actions / API](#10-server-actions--api)
11. [Tech stack and free-tier limits](#11-tech-stack-and-free-tier-limits)
12. [What can break the site, and how to prevent it](#12-what-can-break-the-site-and-how-to-prevent-it)
13. [Security checklist](#13-security-checklist)
14. [Privacy, legal and content policy](#14-privacy-legal-and-content-policy)
15. [Internationalization](#15-internationalization)
16. [Performance and accessibility budgets](#16-performance-and-accessibility-budgets)
17. [Observability, backups and operations](#17-observability-backups-and-operations)
18. [Success metrics](#18-success-metrics)
19. [Release plan](#19-release-plan)
20. [Launch checklist](#20-launch-checklist)
21. [Open questions](#21-open-questions)

---

## 1. Principles

1. **Free for citizens, always.** Reporting, voting and viewing never require payment.
2. **Evidence over opinion.** Every report has a photo; every "Fixed" claim has an "after" photo.
3. **Trust the ranking.** Nothing — money, staff, or bots — can buy a position in the feed.
4. **Mobile first.** Most reports are made standing next to the problem, on a phone, on mobile data.
5. **Privacy by default.** No faces, plates, or exact home addresses of private people exposed.
6. **Not an emergency service.** Dangerous situations go to 112, not to us.

## 2. Goals and non-goals

**Goals (v1)**
- A citizen can report a problem with photo, description, category, neighborhood and map pin in under 60 seconds.
- Anyone (even logged out) can browse, filter, and view reports.
- Logged-in users can upvote once per report.
- Reports move through a visible status lifecycle, ending in a verified Fixed state.
- A Fixed feed shows before/after evidence of resolved problems.

**Non-goals (v1)**
- Comments/threads (adds heavy moderation load — Phase 2).
- Native mobile apps (PWA instead).
- Direct integration with municipal ticketing systems.
- Real-time updates via websockets.
- Payments of any kind.

## 3. Users and roles

| Role | How they get it | Can do |
|---|---|---|
| **Guest** | Not logged in | Browse, filter, search, view reports and Fixed feed, share links |
| **Citizen** | Signs in | Everything a guest can + create reports, upvote, confirm/dispute fixes, flag content, edit/delete own reports |
| **Moderator** | Granted by admin | Review flags, hide/remove content, mark duplicates, record official responses, approve/reject fix claims, blur images |
| **Admin** | Seeded in DB | Everything + manage roles, categories, locations, ban users, view audit log |
| **Verified official** *(Phase 3)* | Verified by admin | Post official responses, set *In progress* on reports in their jurisdiction |

Role is stored on the user document and **checked on the server for every mutation** — never trust the client.

## 4. Core features

Each feature lists acceptance criteria (AC). A feature is done only when all AC pass.

### 4.1 Authentication
- Sign in with **Google** (Auth.js). Phase 2: email magic link (for people without Google accounts).
- **AC**
  - Session persists across reloads; sign-out works on all tabs.
  - New users get `role: "citizen"`, `status: "active"`.
  - Banned users can browse but every mutation returns 403.
  - Accounts younger than **24 hours** can post max 2 reports/day (anti-spam).
  - User must accept Terms + Privacy Policy on first sign-in (stored with version + timestamp).

### 4.2 Create a report
Flow: **Photo → Location → Details → Review → Submit**

| Field | Rules |
|---|---|
| Photos | 1–4 images. JPEG/PNG/WebP/HEIC. Max 10 MB each before compression. At least 1 required. |
| Title | 5–80 chars, required |
| Description | 10–1000 chars, required. Plain text only (no HTML). |
| Category | Required, one of the list in §7 |
| Region / municipality / neighborhood | Required. Auto-suggested from map pin, user can correct. |
| Map pin | Required. Must be inside Georgia's boundary. |
| Address hint | Optional free text, max 120 chars ("near the bus stop on Gudiashvili St.") |
| Severity (self-reported) | Optional: Low / Medium / Dangerous. "Dangerous" shows the 112 notice. |

- **AC**
  - Images upload **directly from the browser to Cloudinary** using a server-signed signature (never through a Next.js function — see §12.1).
  - Images are resized client-side to max 2048px long edge before upload.
  - EXIF data (including GPS) is stripped from the stored image.
  - If the photo contains EXIF GPS, offer "Use photo location?" before stripping.
  - "Use my location" button uses browser geolocation; denial falls back to manual pin + search.
  - Before submit, run **duplicate check** (§4.9) and show nearby similar reports.
  - Draft is saved in `localStorage` so a lost connection doesn't lose the report.
  - Submit button disables on click; server enforces an idempotency key to prevent double posts.
  - After submit, user lands on the new report page with a share button.

### 4.3 Report detail page
- Photo gallery, title, description, category, location (breadcrumb + small map), status badge + **status timeline**, upvote count + button, author display name, created date, official responses, fix evidence (before/after slider).
- Actions: Upvote, Share, Flag, (author) Edit/Delete/Mark fixed, (anyone) Propose fixed, Confirm/Dispute fix.
- **AC**
  - Server-rendered with Open Graph tags (title, first image, status) so shared links preview well on Facebook/Messenger/Telegram.
  - URL format: `/r/{shortId}/{slug}` — slug changes on edit must not break old links (lookup by `shortId`).
  - Hidden/removed reports return a "This report was removed" page with reason category, not a 500.

### 4.4 Upvotes
- One upvote per user per report; tapping again removes it.
- Authors cannot upvote their own report (their report starts at 0, not 1).
- Guests clicking upvote get a sign-in prompt and the vote is applied after login.
- **AC**
  - Unique index `(userId, reportId)` on `votes` — duplicate insert is a no-op, not an error to the user.
  - Count updated with atomic `$inc`; optimistic UI rolls back on failure.
  - Rate limit: 60 votes/min/user.
  - Votes on Fixed / Removed reports are disabled (count frozen).

### 4.5 Status updates and official responses
- See §5. Every status change creates a `statusEvents` entry (who, when, from, to, note, evidence).
- Moderators can attach an **official response**: text summary, source (link, screenshot, or letter scan), date, responding body (e.g., "Saburtalo District Administration").

### 4.6 Marking a report fixed (verification)
1. Author **or any citizen** submits a fix claim with ≥1 "after" photo (+ optional note). Pin must be within 150 m of the original pin if photo has GPS.
2. Status → `fix_pending`. Report shows "Fixed? Confirm or dispute" to users.
3. Becomes **`fixed`** when any of:
   - The author submitted or confirmed the claim, **and** no disputes after 72h, or
   - 3 confirmations from distinct citizens (not the claimant) with net confirmations − disputes ≥ 3, or
   - A moderator approves.
4. Goes back to the previous status if disputes ≥ 3 or a moderator rejects.
5. Fixed reports can be **reopened** ("It broke again") with a new photo → status `reopened`, keeps history.

- **AC**
  - A user can't confirm their own claim; one confirm-or-dispute per user per claim.
  - `fixedAt` and `daysToFix = fixedAt − createdAt` stored for stats.

### 4.7 Fixed feed
- Grid of before/after cards, newest fixes first, filterable by location/category.
- Header stats: total fixed, fixed this month, median days to fix, per-district leaderboard.
- **AC**: stats come from a cached aggregate refreshed at most every 10 minutes (don't aggregate on every page view).

### 4.8 Profile
- Public: display name, avatar, join date, reports created, fixes contributed.
- Private settings: display name (can be a nickname), language, email notifications on/off, delete account.
- **Delete account**: removes personal data; reports remain but show "Deleted user" (user chooses: keep or delete their reports).

### 4.9 Duplicate detection
- On submit, query open reports of the same category within **50 m** (`$near` on a `2dsphere` index).
- If found, show them: "Is this the same problem? Upvote it instead."
- Moderators can merge duplicates: votes move to the original (deduplicated by user), duplicate gets `status: duplicate` and redirects.

### 4.10 Flagging and moderation
- Flag reasons: spam, not a public problem, offensive, personal info visible, wrong location, duplicate, other.
- Report auto-hides pending review at **5 flags** from accounts older than 7 days.
- Moderator queue sorted by flag count and age. Actions logged in `auditLog`.
- Moderators can blur a region of an image (Cloudinary `e_pixelate_region` / `e_blur_faces`) without deleting the report.

### 4.11 Notifications (email, Phase 1.5)
- To author: status changed, official response added, fix claim submitted, report fixed.
- To voters (opt-in): report fixed.
- Max 1 digest email/day per user. Unsubscribe link in every email.

### 4.12 Search
- Text search over title + description (Atlas Search if available on the tier, else a MongoDB `text` index).
- Georgian text: `text` index doesn't stem Georgian — use `default_language: "none"` so it matches exact words; consider Atlas Search later.

## 5. Report status lifecycle

```
            ┌──────────────┐
            │   reported   │◄────────────────────────┐
            └──────┬───────┘                         │
   moderator adds  │                                 │ disputes ≥ 3 /
   official reply  ▼                                 │ moderator rejects
            ┌──────────────┐                         │
            │ acknowledged │─────────┐               │
            └──────┬───────┘         │               │
  official/mod     ▼                 ▼               │
            ┌──────────────┐  ┌──────────────┐       │
            │ in_progress  │─►│ fix_pending  │───────┘
            └──────────────┘  └──────┬───────┘
                                     │ verified (§4.6)
                                     ▼
                              ┌──────────────┐  "broke again"  ┌──────────┐
                              │    fixed     │────────────────►│ reopened │→ behaves like reported
                              └──────────────┘                 └──────────┘

   Side states (moderator only): duplicate · rejected (not a public problem) · removed (policy)
```

| Status | Label (EN / KA) | Who can set it | Shown in feed |
|---|---|---|---|
| `reported` | Reported / დაფიქსირებული | System on create | Main |
| `acknowledged` | Official response / ოფიციალური პასუხი | Moderator, verified official | Main |
| `in_progress` | In progress / მიმდინარეობს | Moderator, verified official | Main |
| `fix_pending` | Fix pending verification / გადამოწმება | Any citizen with photo | Main (badge) |
| `fixed` | Fixed / მოგვარებული | System (rules) or moderator | **Fixed feed** |
| `reopened` | Reopened / ხელახლა გახსნილი | Any citizen with photo | Main |
| `duplicate` | Duplicate | Moderator | Hidden, redirects |
| `rejected` | Not a public issue | Moderator | Hidden |
| `removed` | Removed | Moderator | Hidden |

**Rule:** transitions are validated server-side against an allowed-transitions map. Any other transition returns 400.

## 6. Locations

Georgia has 2 autonomous republics + 9 regions + Tbilisi. Hierarchy:

```
Region (mkhare) → Municipality / Tbilisi district → Neighborhood (optional)
e.g. Tbilisi → Saburtalo → Dighomi Massive
     Tbilisi → Vake → Vake
     Imereti → Kutaisi → (neighborhood)
```

- Tbilisi's 10 districts: Vake, Saburtalo, Didube, Gldani, Nadzaladevi, Isani, Samgori, Krtsanisi, Mtatsminda, Chughureti.
- Note: **Dighomi is a neighborhood, not a district** — model neighborhoods separately so filters stay correct.
- Store locations in a `locations` collection with `nameKa`, `nameEn`, `slug`, `parentId`, `level`, and a **GeoJSON boundary polygon** (from OpenStreetMap admin boundaries).
- **Auto-detect**: when the pin is dropped, find the containing polygon with `$geoIntersects`; pre-fill the dropdowns. User can override; if override disagrees with the pin, save both and flag for review.
- Pins outside Georgia's boundary polygon are rejected.
- Occupied territories (Abkhazia, Tskhinvali region): show in the hierarchy for completeness but disable reporting with an explanatory note (decide — see §21).
- **Launch scope**: Tbilisi with full neighborhood list; other regions at municipality level, neighborhoods added on demand.

## 7. Categories

| Slug | EN | KA (draft) |
|---|---|---|
| `roads` | Roads & potholes | გზები და ორმოები |
| `sidewalks` | Sidewalks & crossings | ტროტუარები და გადასასვლელები |
| `lighting` | Street lighting | გარე განათება |
| `garbage` | Garbage & sanitation | ნაგავი და სანიტარია |
| `water` | Water, sewage & drainage | წყალი, კანალიზაცია, სანიაღვრე |
| `parks` | Parks & green spaces | პარკები და გამწვანება |
| `playgrounds` | Playgrounds & yards | სათამაშო მოედნები და ეზოები |
| `transport` | Public transport & stops | საზოგადოებრივი ტრანსპორტი |
| `traffic` | Traffic signs & signals | საგზაო ნიშნები და შუქნიშნები |
| `parking` | Illegal parking & blocked paths | უკანონო პარკირება |
| `buildings` | Dangerous buildings & construction | საშიში შენობები და მშენებლობა |
| `animals` | Stray animals | მიუსაფარი ცხოველები |
| `accessibility` | Accessibility barriers | ხელმისაწვდომობის ბარიერები |
| `other` | Other | სხვა |

Categories live in the DB (admin-editable), not hardcoded, with an `active` flag so retired categories don't break old reports.

## 8. Feeds, ranking and filters

**Main feed tabs**
| Tab | Sort |
|---|---|
| **Trending** (default) | `hotScore` desc |
| **Top** | `upvoteCount` desc, then `createdAt` desc |
| **New** | `createdAt` desc |
| **Near me** | distance from user (`$geoNear`) |
| **Map** | clustered pins in current viewport |

**Hot score** (prevents old posts from sitting on top forever):
```
hotScore = log10(max(upvoteCount, 1)) + (createdAt_epoch_seconds − 1735689600) / 172800
```
(One order of magnitude of votes ≈ 2 days of recency.) Recompute on every vote (cheap, stored on the document) — no cron needed.

**Filters** (combine with AND, reflected in the URL query so filtered views are shareable):
`region`, `municipality`, `neighborhood`, `category`, `status` (open = reported/acknowledged/in_progress/fix_pending/reopened), `period` (7d / 30d / all), `hasOfficialResponse`.

**Pagination**: cursor-based (`?after=<hotScore>_<_id>`), page size 20, infinite scroll + "Load more" button fallback. **Never use `skip`** on large collections.

**Fixed feed**: `status = fixed`, sort `fixedAt` desc.

## 9. Data model

All collections have `createdAt`, `updatedAt` (Mongoose `timestamps: true`).

```ts
// users
{ _id, email (unique), name, displayName, image, role: "citizen"|"moderator"|"admin",
  status: "active"|"banned", banReason?, locale: "ka"|"en",
  emailNotifications: boolean, termsAcceptedVersion, termsAcceptedAt,
  reportsCount, deletedAt? }

// reports
{ _id, shortId (unique, 8 chars), slug, authorId,
  title, description, categoryId, severity?,
  locationIds: { region, municipality, neighborhood? },
  point: { type: "Point", coordinates: [lng, lat] },   // GeoJSON — lng first!
  addressHint?, images: [{ publicId, url, width, height }],
  status, upvoteCount, hotScore, flagCount,
  hidden: boolean, mergedInto?,
  officialResponses: [{ body, text, sourceUrl?, sourceImage?, date, addedBy }],
  fixedAt?, daysToFix?, idempotencyKey (unique, sparse) }

// votes
{ _id, userId, reportId }                               // unique (userId, reportId)

// fixClaims
{ _id, reportId, claimantId, images[], note?, state: "pending"|"approved"|"rejected",
  confirmations: [userId], disputes: [userId], resolvedAt?, resolvedBy? }

// statusEvents
{ _id, reportId, actorId, from, to, note?, evidenceImages?[] }

// flags
{ _id, reportId, userId, reason, note?, resolved: boolean }   // unique (userId, reportId)

// locations
{ _id, slug, nameKa, nameEn, level: "region"|"municipality"|"neighborhood",
  parentId?, boundary: GeoJSON Polygon|MultiPolygon, centroid: Point }

// categories
{ _id, slug, nameKa, nameEn, icon, order, active }

// auditLog
{ _id, actorId, action, targetType, targetId, meta }

// statsCache
{ _id: "global"|locationId, totals..., computedAt }
```

**Required indexes**
```
reports: { point: "2dsphere" }
reports: { status: 1, hidden: 1, hotScore: -1, _id: -1 }
reports: { status: 1, hidden: 1, upvoteCount: -1, _id: -1 }
reports: { status: 1, hidden: 1, createdAt: -1 }
reports: { "locationIds.municipality": 1, status: 1, hotScore: -1 }
reports: { categoryId: 1, status: 1, hotScore: -1 }
reports: { status: 1, fixedAt: -1 }
reports: { shortId: 1 } unique
reports: { title: "text", description: "text" } default_language "none"
votes:   { userId: 1, reportId: 1 } unique
flags:   { userId: 1, reportId: 1 } unique
locations: { boundary: "2dsphere" }
```

## 10. Server actions / API

All mutations: authenticated, role-checked, zod-validated, rate-limited, and return typed errors.

| Action | Auth | Notes |
|---|---|---|
| `GET /api/cloudinary/sign` | Citizen | Returns signature for direct upload, restricted folder + max size + allowed formats |
| `createReport(input, idempotencyKey)` | Citizen | Validates images belong to our Cloudinary folder |
| `updateReport(id, input)` | Author / mod | Author can edit within 24h or until first status change |
| `deleteReport(id)` | Author / mod | Soft delete (`hidden`, `status: removed`) |
| `toggleVote(reportId)` | Citizen | Insert/delete vote + `$inc` + recompute `hotScore` in a transaction |
| `submitFixClaim(reportId, images, note)` | Citizen | One pending claim per report |
| `respondToFixClaim(claimId, "confirm"|"dispute")` | Citizen | Not the claimant |
| `reopenReport(reportId, images, note)` | Citizen | Only from `fixed` |
| `flagReport(reportId, reason)` | Citizen | |
| `addOfficialResponse(reportId, data)` | Mod | Moves to `acknowledged` |
| `setStatus(reportId, to, note)` | Mod | Validated against transition map |
| `mergeDuplicate(dupId, originalId)` | Mod | Transaction |
| `GET /api/reports` | Public | Feed with filters + cursor |
| `GET /api/reports/nearby?lat&lng&category` | Public | Duplicate check |
| `GET /api/locations/resolve?lat&lng` | Public | Point → location hierarchy |
| `GET /api/stats` | Public | From `statsCache` |
| Cron `/api/cron/*` | Secret header | Fix-claim auto-resolution (72h), stats refresh, digest emails |

## 11. Tech stack and free-tier limits

| Layer | Choice | Free-tier limit that matters |
|---|---|---|
| Framework | Next.js (App Router, TypeScript, Server Actions) | — |
| DB | MongoDB Atlas Free cluster + Mongoose | **512 MB storage (hard limit), 100 ops/sec, limited connections, 10 GB/week transfer** |
| Images | Cloudinary (direct signed uploads) | 25 credits/month (1 credit = 1 GB storage or 1 GB bandwidth or 1k transformations) |
| Auth | Auth.js + Google provider + MongoDB adapter | — |
| Bot protection | Cloudflare Turnstile | Free |
| Rate limiting | Upstash Redis (`@upstash/ratelimit`) | Free tier daily command cap |
| Maps | Leaflet + react-leaflet + OpenStreetMap tiles (or MapTiler free key) | OSM tile servers forbid heavy use — use a tile provider for production |
| Geocoding search | Nominatim (low volume) / MapTiler | Nominatim: max 1 req/sec, must set User-Agent |
| Email | Resend | Free tier daily cap |
| Hosting | Vercel Hobby (non-commercial use) | **10s function timeout, 4.5 MB request body, limited image optimizations** |
| Cron | Vercel Cron (Hobby: once/day) or GitHub Actions scheduled workflow | |
| Errors | Sentry free | |
| Analytics | Umami / Vercel Analytics | |
| Validation | zod | |
| i18n | next-intl | |
| UI | Tailwind CSS + shadcn/ui | |

## 12. What can break the site, and how to prevent it

### 12.1 Image uploads (most likely failure)
| Risk | Prevention |
|---|---|
| Vercel rejects bodies > 4.5 MB → uploads fail silently | **Upload directly to Cloudinary from the browser** with a signed signature; send only `publicId`s to the server |
| iPhone HEIC photos don't display | Let Cloudinary convert; always deliver with `f_auto,q_auto` |
| Photos appear rotated | Use Cloudinary `a_auto` / client-side `createImageBitmap` with `imageOrientation: "from-image"` |
| 12 MB phone photos burn bandwidth credits | Client-side resize to 2048px; deliver feed thumbnails at `w_600` |
| EXIF GPS leaks the reporter's home location | Strip metadata on upload (Cloudinary default strips on transformation; verify) |
| Someone uploads to your Cloudinary account directly | Signed uploads only, restricted folder, `allowed_formats`, max file size in signature, signature expires |
| Orphaned images (uploaded but report never submitted) | Tag uploads `pending`; daily job deletes `pending` assets older than 24h |
| `next/image` burns Vercel's free optimization quota | Use a **Cloudinary loader** for `next/image` or `unoptimized` with Cloudinary URLs |
| Upload on slow 3G times out | Show progress bar, retry with backoff, keep draft in localStorage |

### 12.2 Database
| Risk | Prevention |
|---|---|
| **Too many connections** — every serverless invocation opens a new one | Cache the Mongoose connection on `globalThis` in `lib/db.ts`; set `maxPoolSize: 10` |
| 512 MB fills up → all writes fail | No images/base64 in DB; cap text lengths; no unbounded arrays (votes in their own collection, not on the report); alert at 70% usage |
| 100 ops/sec throttle on traffic spikes (e.g., post goes viral) | Cache feed responses (ISR / `revalidate: 30`) and stats; avoid N+1 queries — use `$lookup` or batch author fetch |
| Slow feed queries | Compound indexes in §9; check with `explain()`; never `skip` |
| `coordinates` stored as `[lat, lng]` → points land in the wrong place/ocean | GeoJSON is **`[lng, lat]`** — enforce in zod schema with a test |
| Vote count drifts from real votes | Transaction for vote + `$inc`; weekly reconciliation job recomputes counts |
| Atlas pauses an idle free cluster | Keep a small scheduled ping; know how to resume; plan upgrade before launch traffic |
| Accidental data loss | Daily `mongodump` via GitHub Actions to private storage; test restore once |

### 12.3 Abuse and data integrity
| Risk | Prevention |
|---|---|
| Bot accounts spam reports | Turnstile on create; new-account limits (§4.1); rate limit 5 reports/hour/user |
| Vote stuffing with multiple accounts | One vote per account; account age ≥ 24h for votes to count toward ranking; monitor sudden vote bursts from new accounts |
| Fake "Fixed" claims | Evidence photo + community/author verification + dispute + reopen (§4.6) |
| Offensive images / personal attacks | Flagging + auto-hide threshold + moderator queue; optional Cloudinary moderation add-on later |
| Political spam / ads disguised as reports | "Not a public problem" rejection reason; content policy |
| Reports naming private individuals (defamation risk) | Policy forbids naming private people; moderator removal; flag reason "personal info" |
| Faces and car plates in photos | Report-time reminder; moderator blur tool; `e_blur_faces` on public delivery (consider default-on) |
| Someone edits a popular report into something else | Edits allowed only within 24h or before first status change; edit history saved |
| XSS via description | Render as plain text (React escapes by default); **never** `dangerouslySetInnerHTML`; strip HTML on save |

### 12.4 Maps and location
| Risk | Prevention |
|---|---|
| Leaflet crashes on SSR (`window is not defined`) | Load map with `next/dynamic(..., { ssr: false })` |
| Default marker icons 404 in production | Import marker images explicitly and set `L.Icon.Default` options |
| OSM tile usage policy blocks you | Use a tile provider with a free key (MapTiler/Stadia) for production |
| User denies geolocation / no GPS indoors | Manual pin + address search; default map center = selected municipality centroid |
| Pin in wrong district | Point-in-polygon auto-detect; mismatches flagged |
| Too many pins freeze the map | Marker clustering; fetch only pins in current viewport bounds, max 500 |

### 12.5 Frontend and UX
| Risk | Prevention |
|---|---|
| Double-tap creates two reports / two votes | Disable buttons while pending + server idempotency + unique indexes |
| Hydration errors from dates/time zones | Format dates on the server in `Asia/Tbilisi`, or render relative times client-side only |
| Georgian text renders in a fallback font or overflows | Use a font with Georgian glyphs (e.g., Noto Sans Georgian / FiraGO); test long Georgian words in buttons |
| Stale counts after voting | Optimistic update + `revalidatePath` for the report page |
| Broken shared links after slug edit | Resolve by `shortId`; redirect to canonical slug |
| Infinite scroll loses position on back navigation | Store cursor + scroll position; or use "Load more" with URL state |
| Empty states look broken (new district, no reports) | Designed empty states with a "Be the first to report" CTA |

### 12.6 Hosting and deployment
| Risk | Prevention |
|---|---|
| Missing env vars in production → white screen | Validate env at boot with zod (`env.ts`); fail the build if missing |
| Functions exceed 10s on Hobby | No heavy work in requests; move aggregations to cron + cache |
| Free-tier limit hit → site paused for the rest of the period | Usage alerts on Vercel/Atlas/Cloudinary; know the upgrade path before launch publicity |
| Secrets leaked to the client | Only `NEXT_PUBLIC_*` vars reach the browser; Cloudinary API secret, Auth secret, DB URI stay server-side |
| Google OAuth fails on the real domain | Add production + preview callback URLs in Google Console; set `AUTH_URL`/`AUTH_TRUST_HOST` |
| Preview deployments write to production DB | Separate Atlas databases for dev / preview / prod |

## 13. Security checklist

- [ ] Every server action checks session + role + ownership.
- [ ] zod validation on every input (server-side; client validation is UX only).
- [ ] Rate limits: reports 5/h, votes 60/min, flags 20/h, sign-URL 30/h per user; IP limits for guests on read APIs.
- [ ] Turnstile on report creation and first sign-in.
- [ ] Security headers: CSP (allow Cloudinary, tile provider, Google), `X-Frame-Options: DENY`, `Referrer-Policy`, HSTS.
- [ ] Mongo queries never built from raw user objects (prevents operator injection like `{ "$gt": "" }`) — zod strips unknown keys.
- [ ] Cron endpoints require a secret header.
- [ ] Atlas network access: restrict where possible; strong DB user password; least-privilege DB user (readWrite on one DB).
- [ ] Moderator/admin actions written to `auditLog`.
- [ ] Dependency updates (Dependabot) and `npm audit` in CI.

## 14. Privacy, legal and content policy

- **Terms of Service** and **Privacy Policy** (Georgian + English) before launch, compliant with Georgia's Law on Personal Data Protection. Have them reviewed by a lawyer.
- Data collected: Google name/email/avatar, reports, votes, IP (for rate limiting, not stored long-term). No selling of data.
- Public display uses `displayName`, never email.
- **Content policy**: public problems only; no private individuals named or shown identifiably; no hate, threats, political campaigning, ads; photos must be your own.
- **Takedown process**: a contact email + form; moderator response target 48h.
- **Emergency disclaimer** on create screen and when severity = Dangerous: "Problem.ge is not an emergency service. In danger, call 112."
- Account deletion and data export available from settings.
- Cookie banner only if you add non-essential cookies/analytics that require it (Umami is cookieless).

## 15. Internationalization

- `next-intl`, locales `ka` (default) and `en`, routes `/ka/...` and `/en/...`.
- All UI strings in message files — no hardcoded text.
- Location and category names stored bilingually in DB.
- User content is not translated; show it as written.
- Dates: Georgian month names via `Intl.DateTimeFormat("ka-GE")`; time zone `Asia/Tbilisi`.
- `hreflang` tags for SEO.

## 16. Performance and accessibility budgets

- LCP < 2.5s on a mid-range Android over 4G; feed JS < 200 KB gzipped (map loaded only on map pages).
- Feed images lazy-loaded with fixed aspect ratios (no layout shift).
- Feed pages cached/revalidated (30–60s); report pages revalidated on mutation.
- WCAG 2.1 AA: color contrast, alt text (default alt = report title), keyboard navigation, focus states, status shown by text + color (not color alone), 44px touch targets.
- PWA: installable manifest, offline page; camera capture via `<input accept="image/*" capture="environment">`.

## 17. Observability, backups and operations

- **Sentry** for client + server errors with release tags.
- **Uptime monitor** (UptimeRobot / Better Stack free) on `/api/health` (checks DB connectivity).
- **Usage alerts**: Atlas storage 70%, Cloudinary credits 70%, Vercel usage emails on.
- **Backups**: daily `mongodump` (GitHub Actions) + monthly restore test.
- **Admin dashboard**: counts per status, flag queue size, new users/day, storage usage.
- **Runbook** (keep in `/docs/RUNBOOK.md`): what to do when DB is full, Cloudinary over quota, spam wave, site paused.

## 18. Success metrics

- Reports created per week; % with all required fields and a valid pin.
- Median time to create a report (target < 60s).
- Weekly active voters.
- **Reports fixed** (total and per month) — the north-star metric.
- Median days to fix, per district.
- % of reports with an official response.
- Spam/removed rate (target < 5%).

## 19. Release plan

**Phase 0 — Foundations (week 1)**
Repo, TypeScript, Tailwind, env validation, DB connection, Auth.js, locations + categories seed, CI, Sentry.

**Phase 1 — MVP (weeks 2–4)**
Create report (photos, map pin, auto-location), report page, feeds (Trending/Top/New), filters, upvotes, fix claims + verification, Fixed feed, flagging, moderator queue, ka/en, legal pages. **Launch in Tbilisi.**

**Phase 1.5**
Email notifications, duplicate merge tool, map view with clustering, PWA install, stats page.

**Phase 2**
Comments (moderated), email magic-link login, all Georgian regions with neighborhoods, Atlas Search for Georgian text, image moderation automation.

**Phase 3**
Verified official accounts for municipalities, public data export / open data API, district performance pages.

## 20. Launch checklist

- [ ] All Phase 1 acceptance criteria pass.
- [ ] Tested on iPhone Safari and Android Chrome, on slow 3G throttling.
- [ ] HEIC upload, rotated photo, 10 MB photo, denied geolocation, offline submit — all tested.
- [ ] Double-click vote/submit tested (no duplicates).
- [ ] Indexes created in production (`syncIndexes` run).
- [ ] Production env vars set; Google OAuth production callback added.
- [ ] Separate prod database; backups running; restore tested.
- [ ] Rate limits and Turnstile active.
- [ ] Terms, Privacy Policy, content policy, takedown contact published.
- [ ] Moderators assigned and trained; flag queue checked daily.
- [ ] Usage alerts configured on Atlas, Cloudinary, Vercel.
- [ ] OG previews verified on Facebook and Telegram.
- [ ] 404/500/removed-report pages designed.
- [ ] Seed with 20–30 real reports before announcing (empty feeds kill launches).

## 21. Open questions

1. Should authors be able to report anonymously (shown as "Citizen" publicly, still tied to an account internally)?
2. Thresholds: 3 confirmations / 72h / 5 flags — tune after the first month of data.
3. How to handle occupied territories in the location list?
4. Should face/plate blurring be automatic on all images (costs transformation credits) or moderator-applied?
5. Who are the first moderators, and what's the escalation path for legal complaints?
6. Do we need a dedicated "Official response" submission channel before verified official accounts exist (e.g., an email address municipalities can reply to)?
# CertPrep

Exam preparation site for the Microsoft security certifications **AZ-500**, **SC-401**, and **SC-200**: practice quizzes, flashcards, timed mock exams, study paths, and curated links to free study material.

Built with Next.js 15 (App Router), Tailwind CSS v4, Prisma 7 + Postgres, and Auth.js v5.

## What's in it

| Feature | Route | Notes |
| --- | --- | --- |
| Exam overview | `/exams/[examId]` | Official skills-measured domains with real weights and objectives |
| Study path | `/exams/[examId]/study` | Modules with outcomes, estimated hours, and linked reading |
| Practice quiz | `/exams/[examId]/practice` | Filter by skill area, per-question explanation and doc link |
| Flashcards | `/exams/[examId]/flashcards` | Leitner-box scheduling (5 boxes, 1/3/7/16/35-day intervals) |
| Mock exam | `/exams/[examId]/mock` | Timed, domain-weighted, flag-for-review, full result breakdown |
| Resources | `/exams/[examId]/resources` | External links only — nothing is re-hosted |
| Dashboard | `/dashboard` | Score history, per-domain accuracy, weakest areas |

Answers are graded **server-side**. Mock exam papers are sent to the browser with the answer keys and explanations stripped out; the review content only comes back after submission.

## Local setup

```bash
npm install
```

Start the local Postgres instance (a user-owned cluster on port 55432, no sudo or Docker needed):

```bash
npm run db:start
```

Copy the environment template and fill in a secret:

```bash
cp .env.example .env
```

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

Apply the schema, then run the dev server:

```bash
npm run db:migrate
```

```bash
npm run dev
```

The site is at http://localhost:3000. Stop the database with `npm run db:stop`.

### Google sign-in (optional)

Leave `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` blank and the Google button is hidden — email/password still works. To enable it, create an OAuth client at [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and set the authorized redirect URI to `http://localhost:3000/api/auth/callback/google` (and your production URL alongside it).

## Deploying to Vercel

1. Push the repository to GitHub and import it in Vercel.
2. Create a Postgres database (Neon, Supabase, or Vercel Postgres) and copy its connection string.
3. Set these environment variables in the Vercel project:
   - `DATABASE_URL` — the hosted Postgres connection string
   - `AUTH_SECRET` — a fresh `openssl rand -base64 32` value
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — only if using Google sign-in
4. Deploy. The build script runs `prisma generate` before `next build`.
5. Apply migrations against the hosted database once:

```bash
DATABASE_URL="<your-production-url>" npx prisma migrate deploy
```

The generated Prisma client lives in `src/generated/prisma` and is gitignored, which is why `prisma generate` runs in both `build` and `postinstall`.

## Adding content

All exam content is typed TypeScript in `src/content/exams/`. One file per exam, matching the `Exam` interface in [`src/content/types.ts`](src/content/types.ts). To add a question, append to the `questions` array:

```ts
{
  id: "az500-q13",
  domainId: "network",          // must match a domain id on the same exam
  type: "single",               // or "multi"
  prompt: "…",
  options: [{ id: "a", text: "…" }, { id: "b", text: "…" }],
  correct: ["a"],               // option ids
  explanation: "Why the right answer is right and the others are wrong.",
  difficulty: 2,                // 1 foundational, 2 intermediate, 3 advanced
  reference: { label: "Docs page title", url: "https://learn.microsoft.com/…" },
}
```

Flashcards, resources, and study-path modules follow the same pattern in the same file. Everything else — practice filters, mock exam weighting, dashboard breakdowns — picks up new content automatically. No database changes are needed.

To add a whole new exam, create `src/content/exams/<code>.ts` and register it in [`src/content/index.ts`](src/content/index.ts).

### Content sourcing

Domains, weights, and objectives currently mirror the official Microsoft Learn study guides, captured on 2026-08-13:

- [AZ-500](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-500) — skills measured as of 2026-01-22
- [SC-401](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-401) — skills measured as of 2026-07-28
- [SC-200](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-200) — skills measured as of 2026-07-28

Microsoft updates these periodically. Re-check the change log on each study guide before a big content push.

> **AZ-500 retires on 31 August 2026.** The exam page shows a countdown banner. Check the [official exam page](https://learn.microsoft.com/en-us/credentials/certifications/exams/az-500) for the replacement certification path.

When importing questions from elsewhere, only use material you have the right to reuse — write your own wording rather than copying question banks verbatim.

## Database schema

Defined in [`prisma/schema.prisma`](prisma/schema.prisma):

- `User` / `Account` / `Session` / `VerificationToken` — Auth.js models, with `passwordHash` added for credentials sign-in
- `Attempt` — one completed quiz or mock run; per-question results stored as JSON
- `CardProgress` — Leitner box state per user per flashcard

Sessions use the JWT strategy because credentials sign-in cannot use database sessions.

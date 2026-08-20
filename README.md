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
| Review queue | `/exams/[examId]/flashcards?mode=due` | Studies only cards that are due plus ones never seen |
| Case studies | `/exams/[examId]/case-studies` | A long shared scenario with linked questions, background always on screen |
| Wrong-answer drill | `/exams/[examId]/practice?mode=missed` | Re-asks questions whose most recent answer was wrong |
| Mock exam | `/exams/[examId]/mock` | Timed, domain-weighted, flag-for-review, full result breakdown |
| Resources | `/exams/[examId]/resources` | External links only — nothing is re-hosted |
| Dashboard | `/dashboard` | Score history, per-domain accuracy, weakest areas |

Answers are graded **server-side**. Mock exam papers are sent to the browser with the answer keys and explanations stripped out; the review content only comes back after submission.

### Question formats

Beyond single- and multiple-answer items, the bank supports the formats Microsoft actually uses — see `QuestionType` in [`src/content/types.ts`](src/content/types.ts):

- `meets-goal` — one scenario repeated across several items, each proposing a different solution, answered Yes/No
- `statements` — a scenario with several statements, each judged Yes or No (hot-area equivalent)
- `ordering` — arrange steps into the correct sequence (drag-and-drop equivalent)

For `statements` the per-statement `correct` flags are stripped before the paper reaches the browser, and for `ordering` the steps are reshuffled server-side, since the stored array order *is* the answer.

### Answer randomisation

Options are reordered per session by `randomiseQuestion()` in [`src/lib/quiz.ts`](src/lib/quiz.ts) before questions reach the browser. Grading compares option **ids**, never positions, so `correct` never changes.

This matters because the bank was authored with the key overwhelmingly first — 93% of single-answer questions had it at position A — which let a learner score well by always picking the first option. Randomisation makes position uninformative regardless of how future questions are authored.

Ordering questions store their steps in the correct sequence, so they are always reshuffled and explicitly never presented already solved. Yes/No items keep their fixed order.

### Case studies

Defined in each exam's `case-studies.ts` and linked from questions by `caseStudyId`. Such questions are **excluded from practice and mock pools** by `standaloneQuestions()` in [`src/lib/quiz.ts`](src/lib/quiz.ts), because they are unanswerable without their scenario. They are also excluded from the wrong-answer drill for the same reason.

### Wrong-answer drill

[`src/lib/drill.ts`](src/lib/drill.ts) walks a user's attempts newest-first and keeps the **most recent** outcome per question. A question enters the drill when that outcome is wrong and leaves as soon as you answer it correctly, so the set shrinks as you improve rather than accumulating forever.

### In-progress mock exams

A running mock is saved to `localStorage` by [`src/lib/mock-session.ts`](src/lib/mock-session.ts), so closing the tab does not destroy the paper. The countdown is stored as remaining seconds rather than a start timestamp, which means **the clock pauses while the exam is not open** — chosen so an interruption does not cost the attempt. It also means the timer can be paused by closing the tab; acceptable for self-study, but worth knowing. Sessions expire after 7 days and are cleared on submit.

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

### Google sign-in

Leave `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` blank and the Google button is hidden — email/password still works. To enable it, create a **Web application** OAuth client at [Google Cloud Console](https://console.cloud.google.com/apis/credentials) with:

*Authorized JavaScript origins* — the bare domains:

```
https://<your-domain>
http://localhost:3000
```

*Authorized redirect URIs* — same domains with the callback path appended:

```
https://<your-domain>/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

A missing or misspelled redirect URI produces `Error 400: redirect_uri_mismatch` at sign-in. Preview deployments get random URLs that will not be in this list, so Google sign-in works on production and localhost only unless you add more.

While the Google consent screen is in **Testing** mode, only accounts listed as test users can sign in; click **Publish app** to open it to everyone.

**Accounts are not linked across providers by email.** Credentials sign-up does not verify the address, so auto-linking would let someone who registered a password against an address they do not own inherit the real owner's Google account. Someone who signed up with a password and then tries Google gets an explanatory message on `/signin` rather than a silent merge. Adding verified email would make safe linking possible.

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

### Deploying with the Vercel CLI

Git-based deploys are unaffected by this, but `vercel deploy` from the command line **uploads your local `.env`**, and a shipped `.env` overrides the project environment variables. That pins `AUTH_URL` to `http://localhost:3000` and breaks the post-sign-in redirect in production.

A `.vercelignore` does not fix it — Vercel puts `.env` in its upload manifest and the build fails if the file is then missing. Move it aside for the duration of the deploy instead:

```bash
mv .env .env.bak && vercel deploy --prod && mv .env.bak .env
```

`vercel link` also writes a `.env.local` holding a `VERCEL_OIDC_TOKEN`. That one is harmless because it sets no key the app reads, but if you ever put app settings in `.env.local`, move it aside too — Next.js gives it higher precedence than `.env`.

Leave `AUTH_URL` unset in production. `trustHost: true` in [`src/auth.ts`](src/auth.ts) makes Auth.js infer the origin from the request, so the same build works on any domain.

## Adding content

Each exam is a directory under `src/content/exams/` with three files:

| File | Holds |
| --- | --- |
| `index.ts` | Exam metadata, skill-area domains and weights, resources, study path |
| `questions.ts` | The question bank |
| `flashcards.ts` | The flashcard deck |

Current bank: **60 questions per exam** (180 total) and 52 / 40 / 46 flashcards for AZ-500 / SC-401 / SC-200. Every domain holds enough questions to satisfy its weighted mock-exam quota, so mock papers run at their full 40-question length.

To add a question, append to the array in the exam's `questions.ts`:

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

Flashcards go in `flashcards.ts`; resources and study-path modules live in `index.ts`. Everything else — practice filters, mock exam weighting, dashboard breakdowns — picks up new content automatically. No database changes are needed.

To add a whole new exam, create `src/content/exams/<code>/` with the three files above and register it in [`src/content/index.ts`](src/content/index.ts).

### Validating the bank

Before committing a batch of new content, check referential integrity — unknown domain ids, correct answers that aren't options, single-answer questions with two keys, and whether each domain still has enough questions for its mock quota:

```bash
npx tsx validate-content.ts
```

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

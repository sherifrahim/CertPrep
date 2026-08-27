# CertPrep

Exam preparation site for the Microsoft security certifications **SC-500**, **SC-401**, and **SC-200** (plus **AZ-500**, which SC-500 supersedes): practice quizzes, flashcards, timed mock exams, study paths, and curated links to free study material.

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
| Dashboard | `/dashboard` | Readiness score, review queue, drill, score history, weakest areas |
| Password reset | `/forgot-password` | Single-use token, one-hour expiry, no account enumeration |
| **Practice lab** | `/lab` | A simulated Defender XDR, Sentinel and Azure portal — see [Practice lab](#practice-lab) |

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

### Exam readiness

[`src/lib/readiness.ts`](src/lib/readiness.ts) weights your per-domain accuracy by each domain's official share of the exam, so a mock dominated by one area does not skew the estimate. Domains with no evidence are **excluded rather than counted as zero**, and reported separately — "80% across two of four areas" is not the same as being ready. "Ready" requires a margin above the pass mark, because the real exam is harder than practice.

### Tests

```bash
npm test
```

334 vitest cases over the pure logic, the content bank, and the practice lab: shuffle uniformity, grading across all five question formats, answer randomisation, mock composition, Leitner scheduling, drill selection, reset-token handling, readiness weighting, the KQL engine, and every rule-evaluation model in the lab. Pure logic lives in [`src/lib/scheduling.ts`](src/lib/scheduling.ts), [`src/lib/password-reset.ts`](src/lib/password-reset.ts), and [`src/lib/readiness.ts`](src/lib/readiness.ts) so it is testable without a database, and the lab's logic sits in `src/lab/` for the same reason.

Where a lab blade shows teaching copy next to a worked example — "this is denied by the rule at priority 200" — a test asserts the engine actually agrees with the copy. Explanatory text that drifts from behaviour is worse than none, because learners believe it.

`npm run validate:content` additionally checks the content bank's referential integrity.

### Case studies

Defined in each exam's `case-studies.ts` and linked from questions by `caseStudyId`. Such questions are **excluded from practice and mock pools** by `standaloneQuestions()` in [`src/lib/quiz.ts`](src/lib/quiz.ts), because they are unanswerable without their scenario. They are also excluded from the wrong-answer drill for the same reason.

### Wrong-answer drill

[`src/lib/drill.ts`](src/lib/drill.ts) walks a user's attempts newest-first and keeps the **most recent** outcome per question. A question enters the drill when that outcome is wrong and leaves as soon as you answer it correctly, so the set shrinks as you improve rather than accumulating forever.

### In-progress mock exams

A running mock is saved to `localStorage` by [`src/lib/mock-session.ts`](src/lib/mock-session.ts), so closing the tab does not destroy the paper. The countdown is stored as remaining seconds rather than a start timestamp, which means **the clock pauses while the exam is not open** — chosen so an interruption does not cost the attempt. It also means the timer can be paused by closing the tab; acceptable for self-study, but worth knowing. Sessions expire after 7 days and are cleared on submit.

## Practice lab

Reading about advanced hunting is not the same as having used it, and the exams assume portal time that most candidates have not had. `/lab` is a simulated tenant — Contoso, a mid-size finance business — with a real KQL engine, realistically shaped telemetry, and a complete intrusion buried in the noise.

Nothing here talks to Microsoft. It is a simulation whose table names, columns, and rule-evaluation behaviour follow the real products closely enough that what you learn transfers.

### The environment

Seven days of telemetry across **14 tables** ([`src/lab/schema.ts`](src/lab/schema.ts)) from Defender XDR, Microsoft Sentinel, and Entra ID, generated deterministically from a fixed seed in [`src/lab/data.ts`](src/lab/data.ts) so every learner sees the same environment and exercises have stable answers.

A full intrusion runs through it — phishing, a click, credential replay from an external address with no MFA, encoded PowerShell, an LSASS dump via `comsvcs.dll` MiniDump, lateral movement on a service account, and exfiltration. Every stage is visible if you query for it. The lab home page gives the answer behind a disclosure, so you can try first.

### Blades

Grouped by product in a persistent left rail, the way the real portals are. Planned blades stay visible but disabled, so the navigation is an honest roadmap rather than a curated subset — and [`src/lab/nav.test.ts`](src/lab/nav.test.ts) enforces that, failing if a blade claims to be ready without a page or is built while still marked planned.

| Blade | Route | What you practise |
| --- | --- | --- |
| Incidents & alerts | `/lab/incidents` | Triage a correlated queue, assign, classify, walk the attack story |
| Advanced hunting | `/lab/hunting` | Write real KQL against all 14 tables, with a schema browser and samples |
| Action center | `/lab/actions` | Approve or reject pending remediation, with the blast radius stated |
| Device inventory | `/lab/devices` | Onboarded endpoints with risk, exposure and onboarding state |
| Explorer | `/lab/email` | Hunt delivered mail, separate received from clicked, remediate |
| Quarantine | `/lab/quarantine` | Release, report and expire quarantined mail as admin or as end user |
| Analytics rules | `/lab/analytics` | Author scheduled rules and see what they would have caught |
| Network security groups | `/lab/nsg` | Build rules, test a flow, see which rule decided it and why |
| Azure Firewall | `/lab/firewall` | DNAT, network and application rules, threat intelligence, full trace |
| Virtual networks | `/lab/vnet` | Effective routes, longest-prefix match, peering, private endpoints |
| Defender for Cloud | `/lab/defender-cloud` | Secure score, recommendations and attack paths over an Azure estate |

Still to build: identities, vulnerability management, attack surface reduction, and Sentinel data connectors.

### The KQL engine

[`src/lab/kql/engine.ts`](src/lab/kql/engine.ts) is a real interpreter, not a lookup table of canned answers: lexer, parser, and evaluator for the subset of Kusto that actually appears in SC-200 and SC-500 hunting — `where`, `project`, `extend`, `summarize` with aggregations, `join`, `union`, `top`, `sort`, `distinct`, `render`, the string operators (`has`, `contains`, `startswith`, `matches regex`), timespan literals, and around forty scalar functions.

Anything outside that subset **fails with a clear message rather than returning a plausible-looking wrong answer**, because a query engine that quietly lies is worse than no engine at all for someone trying to learn.

Queries run server-side through [`src/lib/actions/lab-actions.ts`](src/lib/actions/lab-actions.ts). Blades that pose an investigation question link straight into the console with the query prefilled, via `/lab/hunting?q=…`.

### What each rule engine is really teaching

The interactive blades exist because these behaviours are the ones that reading reliably fails to convey. Each is a pure function with a trace, so the answer always comes with its reasoning:

- **NSG** ([`nsg.ts`](src/lab/nsg.ts)) — priority order decides nothing unless the rule also *matches*. The `Internet` service tag excludes private space, which is why the deny people expect to catch internal RDP does not.
- **Azure Firewall** ([`firewall.ts`](src/lab/firewall.ts)) — rule **types** are processed DNAT, then network, then application, and that order outranks every priority number. A broad network allow therefore silently disables the FQDN allow-list you thought you had, because network rules terminate before application rules are ever consulted.
- **Virtual networks** ([`vnet.ts`](src/lab/vnet.ts)) — longest prefix match wins first; only on a tie does source break it, user-defined over BGP over system. Peering is never transitive, so two spokes on a shared hub cannot reach each other. A next hop of `None` is a route that matches and drops.
- **Action center** ([`actions.ts`](src/lab/actions.ts)) — what an automated investigation may do unattended is set by the **device group's automation level**, not by alert severity. The same file in `AppData\Roaming` is auto-remediated under one semi-automatic level and held for approval under the other.
- **Quarantine** ([`quarantine.ts`](src/lab/quarantine.ts)) — recipient permissions come from the quarantine policy the **verdict** assigns. Malware and high-confidence phishing are admin-only and invisible to the user; a normal-confidence phish they can release themselves.
- **Defender for Cloud** ([`defender-cloud.ts`](src/lab/defender-cloud.ts)) — secure score is earned points over possible points, weighted per control. A resource counts as healthy only once it passes **every** recommendation in its control, so fixing one of two earns nothing, and a Low-severity finding can be worth more points than a High one. Mark recommendations remediated and watch the score move.

### Nothing is persisted

Lab state — triage decisions, approvals, remediation toggles — lives in component state or `localStorage`, never the database. The lab is a sandbox to be re-run, so there is no schema for it and signing in is not required to use it.

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

### Password reset

`/forgot-password` issues a single-use link that expires in an hour. Only the SHA-256 hash of the token is stored, so a database leak yields nothing usable. Completing a reset also deletes the user's sessions.

The response is identical whether or not the address has an account, to avoid revealing which emails are registered, and requests are throttled per IP and address.

Mail goes through Resend when `RESEND_API_KEY` is set. **Without it the message is logged to the server console instead**, so the flow is testable locally — but a production deployment needs the key or nobody receives their link.

Accounts created through Google have no password, so there is nothing to reset; the confirmation screen says so and points at Google sign-in.

### Rate limiting

Sign-in, sign-up, and password reset are throttled by [`src/lib/rate-limit.ts`](src/lib/rate-limit.ts) using a fixed window stored in **Postgres, not process memory** — serverless instances do not share memory, so an in-process counter resets on cold start and is bypassed by spreading requests across instances.

Counters are keyed by IP *and* identifier: one noisy address cannot lock out everyone behind a shared NAT, and one attacker cannot spray many addresses freely. The sign-in counter is cleared inside `authorize()` when the password verifies — the only point where success is unambiguous, since both success and failure leave the server action by throwing a redirect.

The limiter **fails open**: if the counter cannot be read or written, the request proceeds rather than locking everyone out of sign-in over a database blip.

### Security headers

Set in [`next.config.ts`](next.config.ts) for every route: CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, and `Permissions-Policy`. `X-Powered-By` is disabled.

The CSP keeps `'unsafe-inline'` on `script-src` because Next.js injects inline bootstrap scripts; removing it needs nonce-based CSP via middleware. The other directives still carry most of the value — `frame-ancestors 'none'`, `object-src 'none'`, and `base-uri 'self'`.

## Deploying

The site is live at **https://certprep-exams.vercel.app**.

Deployment is **Git-connected**: pushing to `main` triggers a Vercel build automatically, and it goes live in about a minute. There is no manual deploy step and no CLI involved.

```bash
git push origin main
```

To confirm a push actually deployed rather than assuming it did, read the commit status — Vercel writes one, and no authentication is needed for a public repo:

```bash
curl -s https://api.github.com/repos/sherifrahim/CertPrep/commits/$(git rev-parse HEAD)/status
```

Look for `"context": "Vercel"` moving from `pending` to `success`.

### Environment variables

These live in the **Vercel project settings**, not in the repository and not in GitHub Secrets — Vercel does not read GitHub Secrets:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Hosted Postgres connection string |
| `AUTH_SECRET` | A fresh `openssl rand -base64 32` value |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Only if Google sign-in is enabled |

Leave `AUTH_URL` **unset** in production. `trustHost: true` in [`src/auth.ts`](src/auth.ts) makes Auth.js infer the origin from the request, so the same build works on any domain; pinning it breaks the post-sign-in redirect.

The build script runs `prisma generate` before `next build`, because the generated client lives in `src/generated/prisma` and is gitignored — which is also why `postinstall` runs it.

Apply migrations against the hosted database once, after changing the schema:

```bash
DATABASE_URL="<your-production-url>" npx prisma migrate deploy
```

### Setting up a new deployment

Only needed when creating a fresh Vercel project rather than pushing to the existing one:

1. Import the repository at [vercel.com/new](https://vercel.com/new), production branch `main`.
2. Add the environment variables above.
3. Create the Postgres database and run `prisma migrate deploy` against it.

> **If a project was ever deployed with `vercel deploy` from the CLI**, connect it to Git before relying on pushes: Settings → Git → Connect Git Repository. Until that is done, pushes to `main` change nothing on the hosted site and the deployment silently serves whatever was last uploaded by hand. Afterwards, trigger the first Git build with a new commit rather than redeploying the existing one — *Redeploy* rebuilds the old CLI-uploaded source, not the repository.

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

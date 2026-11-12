# XAI Robotics CMS — API

Express + MySQL backend for the CMS in `../frontend` and the content API the
XAI Robotics website reads (the repository root).

## Setup

**1. MySQL.** MySQL 8 or MariaDB 10.6+, running locally or remote. Nothing needs
creating by hand — the migration creates the database.

**2. Environment.**

```bash
cp .env.example .env
```

Fill in the `DB_*` values and generate a real cookie secret:

```bash
node -e "console.log(crypto.randomUUID() + crypto.randomUUID())"
```

**3. Schema and first user.**

```bash
npm run db:migrate     # creates the database, applies migrations
npm run db:seed        # creates the first administrator
```

There is no built-in password. Set one, or let the seed generate one and print
it once:

```bash
SEED_EMAIL=you@example.com SEED_PASSWORD='YourStrongPass1' npm run db:seed
```

Sign in with the email or the username (`SEED_USERNAME`, default `admin`).

**4. Run.**

```bash
npm run dev            # http://localhost:4000
```

Check it: `curl http://localhost:4000/api/health`

## Environment

| Variable | | |
| --- | --- | --- |
| `CORS_ORIGIN` | required | CMS and website origins, comma-separated. The first is the CMS address used in emails. |
| `DB_HOST` `DB_PORT` `DB_USER` `DB_PASSWORD` `DB_NAME` | required | |
| `COOKIE_SECRET` | required | ≥ 16 characters. Changing it signs everyone out. |
| `COOKIE_SECURE` `COOKIE_SAME_SITE` | `false` / `lax` | Set explicitly; see config.ts. |
| `ENQUIRIES_LOCK_PASSWORD` | **required in production** | Second password in front of enquiries (≥ 8 chars). Development falls back to a fixed non-secret value. |
| `UPLOAD_DIR` | `uploads` | Public media, served at `/uploads`. |
| `PRIVATE_DIR` | `private` | CVs from job applications. **Never served.** Keep outside `UPLOAD_DIR`, on a persistent volume. |
| `MAX_UPLOAD_MB` | `10` | Media library limit. CVs are capped at 5 MB separately. |
| `SMTP_*` `MAIL_FROM` | optional | Without SMTP, mail is logged to the console. |
| `SITE_REVALIDATE_URL` `REVALIDATE_SECRET` | optional | Pings the website after a content change. |
| `CMS_SITE` | `xai` | Sent as `X-CMS-Site` on every response. |
| `SEED_EMAIL` `SEED_USERNAME` `SEED_NAME` `SEED_PASSWORD` | optional | First administrator. |

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Watch mode via tsx |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run the compiled build |
| `npm run typecheck` | Types only, no emit |
| `npm test` | Creates `<DB_NAME>_test`, migrates it, runs the suite |
| `npm run db:migrate` | Apply pending migrations (safe to re-run) |
| `npm run db:seed` | Create the first administrator (idempotent) |
| `npm run db:reset-admin <username> <password>` | Reset or recreate an administrator |

## Structure

```
src/
  config.ts              env parsed and validated at boot
  app.ts                 middleware + route wiring
  server.ts              entry, startup checks, graceful shutdown
  db/                    pool, migration runner, seed, migrations/*.sql
  http/                  errors, list-param parsing, website revalidation
  mail/                  mailer (SMTP or console), templates, submission alerts
  middleware/            session resolution and roles, audit trail
  modules/
    shared/              content schema pieces, field maps, publishing rules,
                         slug redirects, sanitiser, the content repo/router factories,
                         taxonomy.ts (the fixed categories and services; see below)
    blogs/ case_studies/ portfolio/ jobs/
    applications/        job applications + private CV storage
    enquiries/           contact-form inbox (+ password lock)
    analytics/           page-view counters and reports
    public/              everything the website reads and posts, no session
    tags/ faqs/ faq_categories/ media/ seo/ settings/
    users/ auth/ activity/ dashboard/
```

## The admin contract

Every resource exposes the same five operations:

| Method | Path | |
| --- | --- | --- |
| `GET` | `/api/<resource>?page=1&pageSize=25&q=&sort=updatedAt&dir=desc&status=draft` | list |
| `GET` | `/api/<resource>/:id` | get |
| `POST` | `/api/<resource>` | create |
| `PATCH` | `/api/<resource>/:id` | update — only the keys sent are written |
| `DELETE` | `/api/<resource>` — body `{ "ids": [...] }` | bulk remove |

Lists return `{ items, total, page, pageSize }`. Errors return
`{ message, fieldErrors? }`; `fieldErrors` keys are form field names.

Content resources: `blogs`, `case-studies`, `portfolio`, `jobs`, plus
`faqs`, `faq-categories`, `media`, `redirects`, `users`.
Inboxes: `enquiries` (admin + enquiries password; `PATCH /bulk`,
`POST /unlock`, `POST /lock`) and `applications` (admin; `GET /:id/cv`
downloads the CV; no create). Also `GET /api/settings`, `PATCH /api/settings`,
`GET /api/dashboard/summary`, `GET /api/search?q=`,
`GET /api/analytics/overview?range=7|30|90`,
`GET /api/analytics/content?range=&type=blog|case_study&sort=range|total|published|title`,
`/api/activity/*`, `/api/tags`.

### Publishing

Content types share one lifecycle — `status`: `draft | published |
scheduled | archived`.

- Set `status` directly on create or patch. `scheduled` needs `publishAt`
  (ISO timestamp, at least a minute ahead).
- Public = `published`, or `scheduled` with `publishAt` in the past (portfolio
  also needs `state: 'active'`; jobs also need `closingDate` empty or today
  or later). Due scheduled items are flipped to `published` on the next
  public read, throttled to every 30 s.
- `publishedAt` is set on first publish and kept afterwards.
- Going live checks completeness (e.g. a blog needs an excerpt of 20+
  characters and a body); the failure is a 422 with every missing field.
- Rich HTML (blog body, case-study sections, portfolio/job descriptions) is
  sanitised on save with the website's
  allow-list.
- Renaming the slug of something that has been public records the old slug
  (`slug_redirects`) for blogs, case studies, portfolio and jobs.

### Categories and services

Categories and services are fixed lists in `src/modules/shared/taxonomy.ts`,
not records: `BLOG_CATEGORIES`, `CASE_STUDY_CATEGORIES`,
`PORTFOLIO_CATEGORIES` and `SERVICES` (XAI Robotics' offerings, as the contact form lists them). Content
stores the slug — `category` on blogs, case studies and portfolio items,
`relatedService` on blogs, `serviceSlug` on case studies — and the schemas
refuse a slug that is not on the list (422, keyed by the field). The public
API still answers `category: { name, slug }`, with the name from the list.
The lists are mirrored in the admin (`../frontend/src/config/taxonomy.ts`):
change both together.

Image slots are `{ id, url?, alt?, width?, height? }`; `null` removes one, an
absent key leaves it alone. An empty string clears an optional id or text.

## The public API (`/api/public`)

No session. Lists return `{ items, total }` (paged ones also `page`,
`pageSize`; `?page=&pageSize=`, max 100). Media URLs are site-relative
(`/uploads/...`).

| | |
| --- | --- |
| `GET /site` | `{ general, social, seo }` |
| `GET /blogs?category=&tag=` · `GET /blogs/:slug` | |
| `GET /tags` | |
| `GET /case-studies?industry=` · `GET /case-studies/:slug` | |
| `GET /portfolio?category=&featured=1` · `GET /portfolio/:slug` | list also returns `categories` |
| `GET /faqs?homeOnly=1&category=` · `GET /faq-categories` | |
| `GET /jobs` · `GET /jobs/:slug` | open jobs only |
| `POST /jobs/:slug/apply` | multipart: `name`, `email`, `phone?`, `location?`, `linkedinUrl?`, `portfolioUrl?`, `coverLetter?`, `website` (honeypot), file `cv` (PDF/DOC/DOCX by content, ≤ 5 MB). 201 `{ ok }`; 409 if already applied; 5 per IP per 30 min |
| `POST /enquiries` | JSON `{ name, email, phone?, company?, service?, message, website }`. 201 `{ ok }`; duplicates (same email + message in 10 min) and honeypot hits also 201 but are not stored; 5 per IP per 10 min |
| `POST /track` | JSON `{ path }`. Always 204. 1 per IP per path per 30 min, 120 per IP per hour |
| `GET /redirects` | `{ items: [{from,to,type}], slugs: [{type,from,to,fromPath,toPath}] }` |

**Old slugs.** A detail endpoint asked for a renamed item answers
`301 { "redirect": "<current-slug>" }` with no `Location` header, so `fetch`
returns it to the website rather than following it.

Rate limits key on the visitor's IP: post the forms from the browser, or
forward `X-Forwarded-For` when proxying them (`trust proxy` is 2).

New enquiries and applications email the address in Settings → Email when the
matching switch is on.

## Security notes

These are deliberate, not incidental:

- Passwords are **argon2id**. Login compares against a dummy hash when the user
  does not exist, so response timing does not reveal which accounts exist.
- Unknown account and wrong password return the **same message**.
- `/auth/forgot-password` **always returns 204**.
- Password reset stores a **SHA-256 hash of the token**, never the token.
- Sessions are **httpOnly, SameSite=Lax, signed cookies** (`xai_cms_session`).
- Changing a password **revokes other sessions** but keeps the current one.
- `requireRole()` enforces permissions **server-side**.
- Sort and filter columns are **whitelisted**.
- Enquiries need an admin **and** the shared enquiries password
  (`xai_enquiries_unlock` cookie, 12 h). The dashboard and search only show
  lead names to a browser that has cleared it.
- CVs live under `PRIVATE_DIR`, are accepted by **magic bytes**, stored under
  random names, and only downloadable by an admin as an attachment.
- Rich text is **sanitised on save**.
- Rate limits on login, forgot-password, the enquiries unlock and every public
  form.

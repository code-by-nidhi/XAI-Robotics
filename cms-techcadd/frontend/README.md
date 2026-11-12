# XAI Robotics CMS

Admin CMS for the XAI Robotics website — blogs, case studies, portfolio, careers
(jobs and applications), FAQs, enquiries, media, SEO, settings and the team's accounts.
The dashboard also carries the website traffic figures (views, top pages, enquiries by
service, content performance).

Services (XAI Robotics' offerings) and the blog / case study / portfolio categories are
fixed in code, not managed here. Forms pick from the lists in `src/config/taxonomy.ts`,
which mirror the backend's `src/modules/shared/taxonomy.ts` — change both together.

The website is a single page today: it reads FAQs and Settings and posts the contact form
into Enquiries. Blogs, case studies, portfolio and jobs can be prepared here, but no page
shows them yet; each of those forms says so.

This app talks to the Express API in `../backend` (default `http://localhost:4000/api`,
override with `VITE_API_URL`). "View on site" links point at the XAI Robotics website
(`VITE_SITE_URL`, default `http://localhost:3000`).

---

## Quick start

```bash
npm install
npm run dev
```

Start the API first (see `../backend`). Sign in with the admin account the backend seeds
(`admin@example.com`, password `SEED_PASSWORD` from `backend/.env`). Enquiries are behind a
second, shared password: `ENQUIRIES_LOCK_PASSWORD` in the same file.

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Typechecks (`tsc -b`) then builds for production |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | ESLint over the whole project |

`npm run build` and `npm run lint` must both pass — treat either failing as a broken build.

---

## Stack

| Concern | Choice |
| --- | --- |
| Build | Vite 8 |
| Language | TypeScript 6 (strict) |
| UI | React 19 |
| Routing | react-router-dom 7, **data router** (`createBrowserRouter`) |
| Styling | Tailwind CSS v4 — CSS-first `@theme`, no `tailwind.config.js` |
| Server state | TanStack Query |
| Forms | react-hook-form + zod |
| Overlays | Radix primitives (dialog, menu, tooltip, popover, tabs, accordion) |
| Editor | TipTap 3 |
| Drag & drop | dnd-kit |
| Icons | lucide-react |

The router **must** stay a data router: the unsaved-changes guard on every form uses
`useBlocker`, which does not exist on `<BrowserRouter>`.

---

## Project structure

```
src/
  api/              The swap point — everything network-shaped
    http/           resource factory over the REST client
    resources/      One file per collection + auth and settings
    index.ts        Public barrel
  config/           brand, siteMap (where content appears), taxonomy (fixed lists)
  components/
    common/         Button, Card, Badge, Modal, Drawer, DropdownMenu, …
    form/           Input, Select, DatePicker, RichTextEditor, ImageField, …
    data/           DataTable, Pagination, FilterBar, Tabs, SortableList
    feedback/       Toast, Skeleton, Alert, ErrorBoundary, Spinner
    layout/         AdminLayout, Sidebar, Header, PageHeader, FormFooter
    media/          MediaPicker
  features/         One folder per module: pages, schema, hooks, columns
  hooks/            useListParams, useUrlState, useConfirm, useToast, useAuth, …
  lib/              cn, format, slugify, csv, id
  providers/        Query, Auth, Toast, Confirm, sidebar + toast contexts
  routes/           router, ProtectedRoute, lazy page registry
  types/            Domain entities and shared UI types
```

Contexts live in their own `*.ts` files (`authContext`, `toastContext`, …) because a module
exporting both components and non-components breaks fast refresh.

---

## Data layer

`src/api/` is the only place that knows about the network. Every collection is exposed
through the same five-method contract:

```ts
list(params: ListParams): Promise<ListResult<T>>
get(id: string): Promise<T>
create(input: TCreate): Promise<T>
update(id: string, input: TUpdate): Promise<T>
remove(ids: string[]): Promise<void>
```

`createHttpResource` implements it once against the REST API, so pagination, search, sorting
and filtering behave identically in every module. The server is the source of truth for
validation; its errors normalise to `ApiError { status, message, fieldErrors? }` so forms can
map them back onto individual inputs.

### Authentication

The session is an httpOnly cookie set by the API; every request is sent with
`credentials: 'include'`.

Roles are `admin` and `editor`. `useCan(permission)` gates UI, but hiding a
button is not access control; the server has to enforce it too.

---

## Conventions

1. **Comments explain _why_, not _what_.** Most functions need none.
2. **Named exports for components**; `export default` only for pages.
3. **Never fabricate data.** If a value isn't known, make the field optional and render an
   honest fallback ("No activity recorded yet") rather than a plausible-looking number. A
   brand-new install shows empty states, not lorem ipsum.
4. **Guard empty and degenerate states.** `Math.max(...[])` is `-Infinity`; `x / 0` is `NaN`.
   Both have bitten this codebase.
5. **No dead UI.** A control that does nothing is worse than no control. Wire it or remove it.
6. **Accessibility is not optional** — decorative icons get `aria-hidden`, icon-only buttons
   get `aria-label`, tables get an `sr-only` caption and `scope`, forms wire
   `aria-describedby` / `aria-invalid`.
7. **Tailwind only**, using design tokens (`bg-primary-500`, never `bg-[#5f6fff]`).
   Inline `style` is for genuinely dynamic values only (bar heights, drag transforms).
8. **Don't call `setState` inside an effect** to sync from props or server state — adjust
   during render instead. The lint rules enforce this.
9. `src/data/navigation.ts` is the single source of truth for the sidebar and header titles.

---

## Module pattern

Every module follows the same shape, established by Courses:

```
features/<module>/
  <module>Schema.ts      zod schema — single source of truth for the form
  use<Module>.ts         query hooks, via createResourceHooks
  <Module>ListPage.tsx   PageHeader + FilterBar + DataTable + Pagination
  <Module>FormPage.tsx   two-column form + FormFooter (sticky save + guard)
```

List state (page, search, sort, filters) lives in the query string through `useListParams`,
so `/courses?status=draft&page=2` is shareable and survives back/forward.

---

## Development notes

- `/dev/primitives` renders every shared primitive in isolation. It is **development only**
  and excluded from production builds.
- The dev gallery's `lazy()` call sits inside the `import.meta.env.DEV` branch on purpose. A
  top-level dynamic import stays reachable and Vite emits the chunk anyway — it shipped
  ~594 kB of editor code to production before that was fixed.

---

## Known gaps

- No automated test suite. Verification so far has been typecheck, lint and scripted
  browser runs against a real build.
- Password reset has no mail server, so the mock resets the signed-in account rather than
  resolving a token.
- No dark mode. Tokens are structured so a second palette can be added without touching
  components.

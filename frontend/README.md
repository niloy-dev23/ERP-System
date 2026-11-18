# TaskFlow — workspace frontend for the Express API

A production-quality Next.js frontend for the existing Express/Node task API in
`../backendTemplate`. The backend is treated as a fixed contract: **no backend
files were modified** to make this UI work.

The app provides authentication, a task board, a team directory with admin
approvals, profile management, and an in-app API explorer. It is built with the
Next.js App Router, TypeScript, and Tailwind CSS v4.

---

## Highlights

- **Same-origin API access.** The browser calls `/api/backend/*`; a Next.js
  rewrite proxies those requests to the Express server. This avoids CORS changes
  to the backend.
- **Real auth lifecycle.** JWT access tokens plus rotating refresh tokens,
  automatic refresh-and-retry once on `401`, and server-side logout that revokes
  the refresh token.
- **Role-aware UI.** Admins can create, edit, approve, pause, and delete.
  Members get read-only task views and cannot see admin mutations.
- **Complete auth flows.** Login, registration, email verification, resend
  verification, forgot password, and reset password.
- **Polished shell.** Responsive sidebar/topbar, light and dark themes, toasts,
  loading skeletons, empty states, error boundaries, and a custom 404.
- **Developer page.** A searchable catalog of every endpoint the UI consumes,
  including proxy flow and request/response contracts.

## Stack

| Concern        | Choice                                  |
| -------------- | --------------------------------------- |
| Framework      | Next.js 16 (App Router, Turbopack)      |
| Language       | TypeScript (strict)                     |
| Styling        | Tailwind CSS v4 + design tokens         |
| Icons          | lucide-react                            |
| State          | React context + small data hooks        |
| UI primitives  | Hand-built, dependency-light components |

No component library or data-fetching library is required.

---

## Requirements

- Node.js 20.9 or newer (developed on Node 24)
- The Express backend running at `http://localhost:8000`
- MongoDB reachable by the backend

## Quick start

```bash
# 1. Start the backend (from the backend directory)
cd "../backendTemplate"
npm install
npm start            # http://localhost:8000

# 2. Start the frontend (from this directory)
cd "../frontend"
npm install
cp .env.example .env.local   # first time only
npm run dev                  # http://localhost:3000
```

Open <http://localhost:3000>. Register an account, verify it using the token from
the backend email/log (see [Email links](#email-links)), then sign in.

### Environment variables

| Variable                  | Default                          | Used by                         |
| ------------------------- | -------------------------------- | ------------------------------- |
| `BACKEND_URL`             | `http://localhost:8000`          | Next.js rewrite (server-side)   |
| `BACKEND_API_PREFIX`      | `/api/v1`                        | Next.js rewrite (server-side)   |
| `NEXT_PUBLIC_API_DOCS_URL`| `http://localhost:8000/api-docs` | "API reference" links           |

These are read in `next.config.ts`, so **restart the dev server or rebuild**
after changing them. `NEXT_PUBLIC_*` values are inlined into the client bundle.

> The rewrite target is evaluated at build time for `next build` + `next start`.
> Build with the intended `BACKEND_URL` in the environment when deploying.

---

## How the proxy works

```
Browser  ──►  /api/backend/getAllTask
                 │
                 ▼
         Next.js rewrite (next.config.ts)
                 │
                 ▼
   http://localhost:8000/api/v1/getAllTask
                 │
                 ▼
             Express API
```

The browser never talks to `:8000` directly, so the Express app does not need a
CORS middleware. `src/lib/api.ts` only knows `API_BASE = "/api/backend"`.

## Authentication model

1. `POST /login` returns `{ user, accessToken, refreshToken }`.
2. Tokens are stored in `localStorage` under `taskflow.*` keys; a cached user
   snapshot keeps the shell usable while the profile revalidates.
3. Every authenticated request sends `Authorization: Bearer <accessToken>`.
4. On `401`, the client calls `POST /refresh` once (shared promise so parallel
   requests do not stampede), stores the rotated pair, and retries the original
   request once. A failed refresh clears the session.
5. `POST /logout` revokes the refresh token, then local state is cleared.
6. The app gate rehydrates the session on load. Because `GET /me` returns the
   "safe" profile without `role` or `status`, the client also calls
   `GET /getSingle/:id` to hydrate those fields.

> `localStorage` is used because the API is token-based and served through the
> proxy. If you later add a backend session endpoint, moving refresh tokens to
> `HttpOnly` cookies is the recommended hardening step.

## Roles and permissions

| Capability                    | Admin | Employee | Member |
| ----------------------------- | :---: | :------: | :----: |
| View dashboard/tasks/team     |  ✅   |    ✅    |   ✅   |
| Create/edit/delete tasks      |  ✅   |    —     |   —    |
| Approve/pause accounts        |  ✅   |    —     |   —    |
| Edit own profile              |  ✅   |    ✅    |   ✅   |

The backend is still the source of truth; hidden controls are a UX improvement,
not a security boundary.

## Routes

| Route                     | Description                                      |
| ------------------------- | ------------------------------------------------ |
| `/`                       | Marketing/landing page with live API health pill |
| `/login`                  | Sign in                                          |
| `/register`               | Create an account                                |
| `/verify-email`           | Verify with `?token=` or paste a token           |
| `/forgot-password`        | Request a reset link                             |
| `/reset-password`         | Set a new password with `?token=`                |
| `/dashboard`              | Stats, deadlines, pipeline, team snapshot        |
| `/tasks`                  | Board/list views, search, filters, sorting       |
| `/tasks/[id]`             | Task detail, edit/delete for admins              |
| `/team`                   | Directory, search, role/status filters           |
| `/team/[id]`              | Member profile and admin approval actions        |
| `/profile`                | Editable profile, security actions, metadata     |
| `/developers`             | Endpoint catalog and integration notes           |
| `not-found` / `error`     | Branded 404 and recoverable error boundary       |

## Backend API mapping

All paths are relative to `/api/v1` and proxied through `/api/backend`.

| UI feature           | Method + path                    | Notes                              |
| -------------------- | -------------------------------- | ---------------------------------- |
| Register             | `POST /registration`             | No `role` sent by the UI           |
| Login                | `POST /login`                    | Rate-limited 3 / 15 min            |
| Refresh              | `POST /refresh`                  | Rotating refresh token             |
| Logout               | `POST /logout`                   | Revokes refresh token              |
| Verify email         | `GET /verify-email?token=…`      | Also available as `POST`           |
| Resend verification  | `POST /resend-verification`      |                                    |
| Forgot/reset         | `POST /forgot-password`, `POST /reset-password` |                   |
| Current user         | `GET /me`                        | Safe profile (no role/status)      |
| Full user            | `GET /getSingle/:id`             | Hydrates role/status               |
| Directory            | `GET /getAll?search=&role=`      | Excludes current user              |
| Update profile       | `PATCH /update/:id`              |                                    |
| Approve / pause      | `PATCH /approve/:id`, `/disapprove/:id` | Admin only                  |
| List tasks           | `GET /getAllTask`                |                                    |
| One task             | `GET /getSingleTask/:id`         |                                    |
| Create task          | `POST /createTask`               | Admin only                         |
| Update task          | `PATCH /updateTask/:id`          | Admin only                         |
| Delete task          | `DELETE /deleteTask/:id`         | Admin only                         |

## Backend quirks handled by the UI

These are intentional frontend workarounds; the backend was not changed.

- **No CORS.** Solved with the same-origin Next.js rewrite.
- **`/me` omits `role` and `status`.** The auth context follows up with
  `GET /getSingle/:id` so role-gated controls render correctly.
- **`/getAll` ignores role when `search` is also present** (the controller
  overwrites `$or`). The directory therefore applies role filtering client-side.
- **Deadlines are strings.** The UI sends ISO strings, validates that new
  deadlines are in the future, and treats unparseable values as "No deadline".
- **Completed tasks.** Deadline badges show "Completed" rather than "Overdue"
  once a task is done.
- **Registration accepts `role`.** The UI deliberately does not expose it;
  accounts should not self-assign admin.
- **Email links point at the API.** Verification/reset emails use the backend
  `BASE_URL`, so they open raw JSON. The frontend pages accept `?token=` and also
  offer a paste-token form with an explanation.
- **Login rate limit.** Login allows 3 attempts per 15 minutes. The UI surfaces
  the backend message rather than retrying.

### Email links

For local development, copy the token from the emailed URL (or backend log) and
open:

```
http://localhost:3000/verify-email?token=<token>
http://localhost:3000/reset-password?token=<token>
```

## Project structure

```
src/
├─ app/
│  ├─ (auth)/            # login, register, verify, forgot, reset
│  ├─ (app)/             # authenticated workspace shell + pages
│  ├─ error.tsx          # route error boundary
│  ├─ not-found.tsx      # branded 404
│  └─ globals.css        # tokens, themes, utilities
├─ components/
│  ├─ auth/              # auth forms and shared shell
│  ├─ layout/            # app shell, auth gate, boot screen
│  ├─ tasks/             # board/list/task modal
│  ├─ team/              # directory
│  └─ ui/                # button, form, modal, alert, primitives
└─ lib/
   ├─ api.ts             # client, token store, refresh, wrappers
   ├─ auth-context.tsx   # session bootstrap and actions
   ├─ hooks.ts           # tasks/users data hooks
   ├─ types.ts           # API and view models
   └─ utils.ts           # status/role metadata, formatting
```

## Scripts

```bash
npm run dev      # dev server (http://localhost:3000)
npm run build    # production build
npm start        # serve the production build
npm run lint     # ESLint
```

Quality gates used for this project:

```bash
npx tsc --noEmit
npx eslint src
npm run build
```

## Design notes

- Brand: **TaskFlow**, teal/sky accent, slate neutrals.
- Theme tokens live in `src/app/globals.css`; light/dark follow the system
  preference and can be toggled from the topbar (persisted in `localStorage`).
- UI primitives are intentionally small and local: no runtime theme or component
  framework dependency.
- `cacheComponents` and `partialPrefetching` are enabled; the authenticated shell
  is a client boundary wrapped in `<Suspense>` so `usePathname` stays compatible
  with partial prerendering.

## Deployment checklist

1. Provision MongoDB and start the Express API.
2. Set `BACKEND_URL` and `BACKEND_API_PREFIX` to the deployed API before
   `npm run build`.
3. Set `NEXT_PUBLIC_API_DOCS_URL` to the public Swagger URL.
4. `npm run build && npm start`, or deploy the directory to your platform.
5. Ensure the API allows the frontend server to reach it (the browser only needs
   the frontend origin).

---

The Express backend in `../backendTemplate` is unmodified. All integration
compromises are resolved inside this frontend and documented above.

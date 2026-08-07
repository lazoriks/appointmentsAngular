# AdminPanel

Staff admin panel for **GLAM Beauty Salon** — appointments, clients, beauticians, services, service groups, and the photos shown on the salon's home page. Angular 20 (standalone components, hash routing), deployed as static files to `https://glamlimerick.com/admin-panel/`.

It talks to the Spring Boot backend (repo `appointmentsSpring`, Cloud Run `europe-north1`). The customer-facing booking flow is a separate app (repo `glam-booking-frontend`, served at `/booking-app/`).

## Table of Contents

- [What's in the panel](#whats-in-the-panel)
- [Authentication](#authentication)
- [Configuration](#configuration)
- [Development server](#development-server)
- [Building and deploying](#building-and-deploying)
- [Code scaffolding](#code-scaffolding)
- [Running unit tests](#running-unit-tests)
- [Known issues](#known-issues)
- [Running end-to-end tests](#running-end-to-end-tests)
- [Additional Resources](#additional-resources)
- [Troubleshooting](#troubleshooting)

## What's in the panel

| Tab | What it does |
|---|---|
| **Appointments** | Grouped by week → day → beautician. Date filter, client name and **mobile** (a `tel:` link, so staff can call from the dashboard), services, total. Add/edit/delete |
| **Clients** | Full client list with contact details; edit opens the client's own appointment history |
| **Masters** | Beauticians, their group and the services each one performs. *"Master" is the internal term; the customer-facing booking app says "Beautician"* |
| **Services** | Grouped by category, with price and duration |
| **Groups** | Service categories (Hair, Nails, …). Their ids are what the home page's `?group=N` links point at — don't renumber them casually |
| **Site Photos** | The 14 photos in the home page category sections (7 sections × 2). Upload replaces the photo on the live website within ~5 minutes, without touching WordPress |

## Authentication

Login takes a **username and password**, which `POST /api/auth/login` checks against the `ADMIN_USERNAME` / `ADMIN_PASSWORD` environment variables on Cloud Run. On success the backend returns the internal API key, which is stored in `localStorage` and attached as the `X-Admin-Key` header to every request by [`adminKeyInterceptor`](src/app/interceptors/admin-key.interceptor.ts). A `401` clears the stored key and bounces back to the login page.

Managers therefore never see or type the raw key, and log in **once per browser** — the session persists until they hit Logout or clear browser data. To change the credentials, edit the two environment variables in Cloud Run; no code change or redeploy is needed.

> The route guard is a convenience, not a security boundary — it only hides the UI. The real check is the backend rejecting any request without a valid key.

## Configuration

The backend URL lives in [`src/environments/environment.ts`](src/environments/environment.ts) and `environment.prod.ts`; `angular.json` swaps them via `fileReplacements` for production builds. Nothing else is environment-specific.

## Development server

```bash
ng serve --port 3000
```

**Use port 3000, not the default 4200.** The backend's CORS configuration only allows `https://glamlimerick.com` and `http://localhost:3000`, so on any other port every API call fails.

Then open [http://localhost:3000](http://localhost:3000). The app uses hash routing (`#/dashboard`), which is what lets it work as static files in a subfolder.

## Building and deploying

```powershell
npx ng build --configuration production --base-href /admin-panel/
```

Three things worth knowing:

1. **Run this in PowerShell, not Git Bash.** Git Bash's MSYS layer rewrites the `/admin-panel/` argument into a Windows path, and the build silently ends up with `<base href="C:/Program Files/Git/admin-panel/">` — every asset 404s on the live site.
2. **The output is in `dist/admin-panel/browser/`**, not `dist/admin-panel/`. Upload the contents of `browser/`.
3. **`.htaccess` lives in the project root**, not in `dist/` — copy it alongside the build output.

Deploy by uploading those files to `public_html/admin-panel/` on Bluehost (cPanel File Manager), replacing what's there, then purging the Cloudflare cache. Verify by checking that the `main-*.js` filename in the live page source matches the one you just built.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

> Note: current CLI schematics generate `name.ts` / `name.html`, while the components actually wired into this app use the older `name.component.ts` convention. Generating a component creates a *second* set of files that nothing imports — rename the generated files rather than leaving both.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Known issues

- The `test` script exists but there is no meaningful coverage — the generated spec files tested the unused stub components and were removed.
- The production bundle is ~665 kB, slightly over the 600 kB budget in `angular.json`, mostly Bootstrap CSS. It's a warning, not an error.
- `saveService` / `saveMaster` / `saveClient` / `saveGroup` all POST for both create and update; the backend upserts on `id`. There's no separate PUT.

## Troubleshooting

### Has anyone come across error NG0908 and managed to resolve it?

For Angular version 17, add the following to `main.server.ts` and it will resolve the issue:

```ts
import 'zone.js';
```

> Thank you. This worked for me. Specifically I made this change in `src/polyfills.ts`, as mentioned in another answer.

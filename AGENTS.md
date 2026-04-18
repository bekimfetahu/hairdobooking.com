# AGENTS Guide - HairdoBooking

## What this repo is
- Next.js 16 App Router frontend for HairdoBooking; Laravel owns persistence, auth/token issuance, and business logic.
- Two UX tracks share the same codebase: client booking flows and business/partner marketing + trial flows.

## Architecture you must keep intact
- Root layout (`src/app/layout.js`) wraps all routes with `StoreProvider` and global nav; interactive app routes live in `src/app/(app)`.
- `(app)` layout (`src/app/(app)/layout.js`) is client-only and adds `ClientProvider` + `MainLayout` for session restore and interactive nav.
- Reuse shells instead of ad-hoc page wrappers: `src/components/layouts/PageShell.js` and `src/components/layouts/AuthPageShell.js`.
- Keep the Laravel boundary thin: React pages call Next route handlers in `src/app/api/*`, and handlers call Laravel via services.

## Data and service boundaries
- `src/services/laravelApp.js`: app-to-app requests (`X-App-Token` from `CLIENT_ACCESS_TOKEN`).
- `src/services/laravelApi.js`: user-scoped requests (`withCredentials: true`, optional `Authorization: Bearer <token>` in handlers).
- Browser-side service examples: `src/services/salon/salonService.js` posts to `/api/salons/[slug]/*` and `/api/appointments` (never raw Laravel URLs).
- Server-side helper: `src/services/sendRequest.js` chooses `laravelApp` vs `laravelApi` by `access_type`.

## Auth/session patterns (follow exactly)
- Redux auth state is in `src/store/slices/authSlice.js`; only update via `loginSuccess` and `logout`.
- Login route (`src/app/api/auth/login/route.js`) writes `token` as HttpOnly cookie.
- Session restore (`src/components/layouts/MainLayout.js`) calls `/api/auth/me`; on 401 it dispatches `logout`.
- Social auth entrypoint is `src/app/api/auth/social/[provider]/route.js`; normalize to Laravel contract fields (`first_name`, `last_name`, `email`, `social_id`, optional `avatar`/`phone`).

## API proxy conventions in this codebase
- Preferred pattern is dedicated proxies per domain (`src/app/api/salons/*`, `src/app/api/appointments`, `src/app/api/locations`).
- Proxy payload shape is usually `{ method, access_type, data }`; do not introduce client-supplied arbitrary backend URLs.
- Preserve forwarding headers used in proxies (`X-Forwarded-For`) and server-assembled auth headers.
- Pricing flow example: UI -> `/api/pricing/quote` -> Laravel `client/pricing/plan-price` (`src/app/api/pricing/quote/route.js`).

## UI and styling conventions
- Brand direction is black/red/warm-neutral; avoid blue/purple-heavy components.
- Primary CTA style is black background with white text (see `src/components/ui/BlackButton`).
- Use `@/` import alias (`jsconfig.json`) and `Link`/`next/image` patterns used in `src/app/(app)/partners/page.js` and auth pages.

## Component organization
- Components are organized by domain in `src/components/`: `navigation/`, `search/`, `content/`, `booking/`, `modals/`, `providers/`, plus existing `layouts/`, `ui/`, `typography/`, `marketing/`, `salon/`.
- **Navigation** (`navigation/`): Navbar variants, DesktopNav, MobileNav.
- **Search & Hero** (`search/`): Hero, ClientHero components.
- **Content display** (`content/`): Card, CardCarousel, CategoryCarousel, ImageLightbox.
- **Booking** (`booking/`): SalonDatePicker, StepSection.
- **Modals** (`modals/`): PreferredSalonModal, PreferredSalonSearch.
- **Providers** (`providers/`): StoreProvider, ClientProvider, ErrorBoundary.
- Always use absolute paths: `@/components/folder/ComponentName`, never relative imports across folders.

## Dev workflow (discoverable commands)
- Local dev script: `npm run dev` (Next dev with webpack) from `package.json`.
- Quality gate available in repo: `npm run lint`.
- Docker dev stack exists (`docker-compose.yml`): frontend container maps `${APP_PORT:-3084}:3000`, mounts source, and expects Laravel on external `shared-network`.
- Base image is `node:20-alpine` with `npm ci` install (`Dockerfile`).

## Known instruction sources reviewed
- `.github/copilot-instructions.md` (primary project-specific AI guidance).
- `README.md` (generic Next.js scaffold; not authoritative for project architecture).


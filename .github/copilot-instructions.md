# Copilot Instructions for HairdoBooking

## Project overview
HairdoBooking is a **Next.js 16 App Router** frontend that works together with a **Laravel backend**. The frontend handles the user experience, routing, UI state, and a thin API layer that proxies requests to Laravel. The backend owns persistence, authentication tokens, user creation, and business logic.

The app supports two main audiences:
- **Client users**: log in, browse salons, and manage appointments.
- **Business users**: view marketing content, start a free trial, and later manage billing and business setup.

## Frontend architecture
### Main frontend stack
- Next.js 16 App Router (with server components and SSR)
- React 19
- Tailwind CSS 4
- Redux Toolkit for auth state
- Custom UI components in `src/components/ui`
- Shared page wrappers in `src/components/layouts`

### Important frontend folders
- `src/app` — route pages, layouts, and route handlers (API)
- `src/components` — reusable UI and layout components
- `src/components/layouts` — shells and page wrappers
- `src/components/ui` — buttons, inputs, checkboxes, sign-in buttons, SVG icons
- `src/services` — Axios/fetch wrappers for Laravel calls
- `src/store` — Redux store and auth slice
- `src/lib` — shared utilities such as `cn`
- `public` — static assets such as `logo.png`, `logo.svg`, `hero-booking.jpg`, and other images

## Layout and page structure
### Root layout and SSR
- `src/app/layout.js` is the root app wrapper.
- It imports `globals.css` and wraps children with the main layout/shell used across marketing and app pages.
- Keep the root layout minimal and SSR-friendly. Do not put page-specific UI there.

### Navigation and shared shells
Use reusable shells instead of repeating page structure:
- `src/components/layouts/PageShell.js` — shared page wrapper for marketing, business, and dashboard views
- `src/components/layouts/AuthPageShell.js` — shared two-column auth shell with a benefit panel and a form panel
- `src/components/Navbar.js` — main interactive navigation for authenticated/interactive views
- `src/components/navigation/NavbarStatic.js` — SSR-friendly navbar used from the root layout for marketing pages
- `src/components/navigation/NavbarAuthWrapper.js` — server component wrapper that fetches auth server-side and passes to `NavbarStatic` (used in root layout)

### Current route patterns
- `/` — homepage / hero content
- `/pricing` — pricing page with live, API-driven pricing and calculator
- `/partners` — business/marketing page for salons and businesses
- `/partners/register` — business free-trial signup
- `/auth` — unified client authentication page (sign in and sign up tabs)
- `/auth?tab=signin` — sign in tab
- `/auth?tab=signup` — create account tab
- `/login` — legacy URL, redirects to `/auth?tab=signin`
- `/register` — legacy URL, redirects to `/auth?tab=signup`
- `/dashboard` — client dashboard placeholder

## Design direction
The brand is primarily:
- **black**
- **red**
- **warm neutrals / ivory**

Avoid blue-heavy or purple-heavy styling unless there is a very specific reason.

### Visual style goals
- premium but simple
- structured page layouts
- soft borders and rounded cards
- black primary buttons
- neutral secondary buttons
- subtle red accents for brand highlights
- avoid noisy gradients and bright multicolor UI

### Button hierarchy
- **Primary button**: black background, white text
- **Secondary button**: white background, black border, black text
- **Tertiary/text action**: neutral text with subtle hover state

## Auth and session flow
### Auth state
- Redux auth state lives in `src/store/slices/authSlice.js`
- Use `loginSuccess` and `logout` to update auth state

### Login/register API flow
- Client pages call Next.js route handlers under `src/app/api/auth/*`
- Those route handlers proxy to Laravel
- Laravel returns a token and user payload
- The token is stored as an HttpOnly cookie by the Next.js route handler

### Social login flow
- Google sign-in uses `@react-oauth/google`
- The browser receives a Google credential
- `src/components/ui/GoogleSignInButton.js` sends the credential to `src/app/api/auth/social/[provider]/route.js`
- That Next.js route decodes Google credentials and forwards the user data to Laravel
- Laravel handles user lookup/creation and returns the app token

### Server-side auth for SSR pages
- Use `src/lib/auth-server.js` in server components to read auth from cookies
- `getCurrentUserServer()` — fetch authenticated user server-side by reading token from cookies
- `isUserAuthenticatedServer()` — check if user is authenticated server-side
- For pages like `/salon/[slug]` that need to display user menu on SSR, use `NavbarAuthWrapper` (server component wrapper that fetches auth and passes to `NavbarStatic`)
- This pattern ensures user menu displays immediately during SSR without client-side flash
- Maintains backward compatibility: `NavbarStatic` still has fallback client-side fetch for client-side navigation

### Unified authentication with AuthPanel
- `AuthPanel` is a reusable component that handles both sign-in and sign-up in one tabbed interface
- Located at: `src/components/auth/AuthPanel.js`
- Props:
  - `initialTab` (default: 'signin') — start on 'signin' or 'signup' tab
  - `onAuthSuccess` — callback function after successful auth (for modal usage), receives user object
  - `returnUrl` — URL to redirect to after auth completes (optional, default: preferred salon or dashboard)
  - `showHeader` — whether to show full tab headers and descriptions (default: true for full page, false for modal)
- Usage in full page:
  ```javascript
  // src/app/(app)/auth/page.js
  <AuthPanel initialTab="signin" showHeader={true} />
  ```
- Usage in modal:
  ```javascript
  // In a component
  <BookingAuthModal
    isOpen={showAuthModal}
    onClose={() => setShowAuthModal(false)}
    onAuthSuccess={handleAuthSuccess}
    salonName={salon.name}
    salonSlug={salon.slug}
  />
  ```

### Booking authentication flow
- When user clicks "Book Now" on `/salon/[slug]` without being authenticated:
  1. Show `BookingAuthModal` (modal overlays the page)
  2. User signs in or creates account inside modal
  3. Modal state persists if user closes without signing up
  4. On successful auth, modal closes and redirect happens
  5. User redirected back to `/salon/[slug]` (preserves booking context)
- Modal component: `src/components/modals/BookingAuthModal.js`
- The booking intent (salon + service) should be stored in Redux or Context before showing modal
- After auth succeeds, retrieve booking intent from Redux and navigate to booking confirmation

### Important auth conventions
- Preserve the HttpOnly cookie pattern
- Keep local development cookie behavior compatible with HTTP
- Maintain the `loginSuccess` / `logout` Redux flow
- Do not bypass Laravel for user creation or token generation
- For SSR pages, fetch auth server-side when possible instead of waiting for client-side hydration

## Backend/Laravel architecture
### Laravel responsibilities
Laravel owns:
- user creation
- session/token issuance
- social login persistence
- booking/business API logic
- request validation and resources

### Backend structure to respect
- `routes/api.php` and controller routes define the API surface
- `app/Http/Controllers/Client/Auth` handles client auth and social login
- `app/Http/Requests` should hold validation rules where applicable
- `app/Http/Resources` should shape API responses

### Social login contract
The social login endpoint expects normalized user data such as:
- `first_name`
- `last_name`
- `email`
- `social_id`
- optional fields like `phone` or `avatar` when available

## API and service conventions
### Next.js service layer
- `src/services/laravelApp.js` is for authenticated/business API calls to Laravel
- `src/services/laravelApi.js` is for generic Laravel API calls
- Keep request logic centralized in services when possible

### Route handlers
- Use Next.js route handlers under `src/app/api`
- Route handlers are the bridge between UI and Laravel
- Avoid putting business logic in React components when it belongs in a route handler or service

### Information flow: Client → Next.js proxy → Laravel

- Client requests: always call Next.js API routes under `src/app/api/*`. Do NOT call Laravel endpoints directly from browser JS — never send raw Laravel `url` strings or app tokens from the client.
- Example pattern: browser POSTs to `/api/appointments` (body: `{ slug, data }`) → Next.js handler at `src/app/api/appointments/route.js` validates the request and forwards it server-side to Laravel `client/salons/{slug}/appointments` via the appropriate service.
- Which service to use:
	- `laravelApi` (`src/services/laravelApi.js`): user-scoped requests. Uses Sanctum cookies or server-added `Authorization` header. `withCredentials: true`.
	- `laravelApp` (`src/services/laravelApp.js`): application-to-application requests. Sends `X-App-Token` from `CLIENT_ACCESS_TOKEN`.
- Server-side Next.js code (server components, route handlers, or `src/services/sendRequest.js`) may call `laravelApp`/`laravelApi` directly without an intermediary API route when no browser-origin is involved.
- Security best-practices:
	- Prefer dedicated proxy routes (for example `src/app/api/salons/*`, `src/app/api/appointments`) rather than a generic proxy that accepts arbitrary Laravel URLs from the client.
	- Validate HTTP method, body, and expected fields server-side; reject requests with unexpected `url` or method values.
	- Keep tokens and cookies HttpOnly and assemble Authorization headers server-side — never accept tokens from client JS.
- Migration note: dedicated proxies have been added for salons and appointments (see `src/app/api/salons/*` and `src/app/api/appointments`). Update client-side services to call these proxies instead of sending Laravel endpoint strings to the generic proxy.

## Coding conventions
### Prefer these patterns
- Use the `@/` import alias for app code
- Build reusable, composable components
- Keep pages lean and delegate layout to shared shells
- Keep form logic in client components only when necessary
- Use `next/image` for important images when practical
- Use `Link` for internal navigation
- Keep UI state local unless it must be shared through Redux

### Be careful with
- mixing client-page UI code into root layout
- creating duplicate header/nav systems
- using blue/purple styling that conflicts with the brand
- hardcoding business logic into page components when a route handler or service is better
- breaking the Laravel/Next token flow

## Business and pricing pages
The business experience should feel slightly different from the client experience:
- more polished
- more conversion-focused
- more product-oriented
- still aligned to the same black/red brand system

The pricing page is a live, API-driven page. Pricing logic supports:
- billing frequency selection (monthly/yearly)
- number of users/seats
- discount rules from Laravel
- API-driven price calculation via a Next.js route handler that proxies to Laravel

### Pricing API bridge and SSR
- Frontend pricing UI (e.g. `/pricing`) should call a Next.js route handler under `src/app/api` rather than hitting Laravel directly.
- That route handler should call the appropriate Laravel pricing endpoint, keep responses typed/normalized, and return only the data needed by the UI.
- Prefer server components and SSR for marketing and pricing pages so content and main layout/nav render on the server.
- Keep client components focused on local interactivity (sliders, toggles) and let them fetch from the Next.js API layer when they need live recalculation.

## Dev and runtime workflow
### Frontend
Run the Next app in Docker and use the containerized dev workflow. The app is expected to be accessed from the host via the mapped port, while container-to-container API traffic uses Docker networking.

### Backend
Laravel runs in a separate container/stack and must be reachable from the Next.js container through the shared Docker network.

### Environment variables to remember
Common frontend env vars include:
- `NEXT_PUBLIC_LARAVEL_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `CLIENT_ACCESS_TOKEN`
- `NEXT_PUBLIC_FRONTEND_URL`
- `APP_PORT`

## Practical guidance for Copilot
When generating code for this repo:
1. Prefer shared shells (`PageShell`, `AuthPageShell`) over ad hoc page markup.
2. Keep the black/red brand palette consistent.
3. Route auth and business requests through the Next.js API layer when they need Laravel.
4. Preserve the existing login/social auth/token flow.
5. Keep pages structured and reusable so client and business areas stay visually consistent.
6. When adding a new page, think first: is this a client page, a business page, or a shared marketing page? Choose the correct shell.


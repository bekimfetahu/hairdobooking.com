# Copilot Instructions for HairdoBooking

## Project overview
HairdoBooking is a **Next.js 16 App Router** frontend that works together with a **Laravel backend**. The frontend handles the user experience, routing, UI state, and a thin API layer that proxies requests to Laravel. The backend owns persistence, authentication tokens, user creation, and business logic.

The app supports two main audiences:
- **Client users**: log in, browse salons, and manage appointments.
- **Business users**: view marketing content, start a free trial, and later manage billing and business setup.

## Frontend architecture
### Main frontend stack
- Next.js App Router
- React 19
- Tailwind CSS 4
- Redux Toolkit for auth state
- Custom UI components in `src/components/ui`
- Shared page wrappers in `src/components/layouts`

### Important frontend folders
- `src/app` — route pages and route handlers
- `src/components` — reusable UI and layout components
- `src/components/layouts` — shells and page wrappers
- `src/components/ui` — buttons, inputs, checkboxes, sign-in buttons, SVG icons
- `src/services` — Axios/fetch wrappers for Laravel calls
- `src/store` — Redux store and auth slice
- `src/lib` — shared utilities such as `cn`
- `public` — static assets such as `logo.png`, `logo.svg`, `hero-booking.jpg`, and other images

## Layout and page structure
### Root layout
- `src/app/layout.js` is the root app wrapper.
- It imports `globals.css`, `ClientProvider`, and `MainLayout`.
- Keep the root layout minimal. Do not put page-specific UI there.

### Shared shells
Use reusable shells instead of repeating page structure:
- `src/components/layouts/PageShell.js` — shared page wrapper for marketing, business, and dashboard views
- `src/components/layouts/AuthPageShell.js` — shared two-column auth shell with a benefit panel and a form panel
- `src/components/Navbar.js` — single source of truth for the top navigation

### Current route patterns
- `/` — homepage / hero content
- `/pricing` — pricing placeholder page for later billing logic
- `/partners` — business/marketing page for salons and businesses
- `/partners/register` — business free-trial signup
- `/login` — client login
- `/register` — client signup
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

### Important auth conventions
- Preserve the HttpOnly cookie pattern
- Keep local development cookie behavior compatible with HTTP
- Maintain the `loginSuccess` / `logout` Redux flow
- Do not bypass Laravel for user creation or token generation

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

The pricing page is currently a placeholder. Future pricing logic should support:
- billing frequency selection
- number of users/seats
- discount rules
- API-driven price calculation

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


# TeeTime Executive — Frontend Project Context

## Project Overview

Premium golf club management platform for the Moroccan market. French language. The frontend is a single-page application built with React + Vite, serving three role-based dashboards (Player, Manager, Admin) plus public pages (landing, search, shop, campus, auth).

The platform allows players to search for golf clubs, book tee times, join clubs, shop golf equipment, and book golf vacation packages. Managers manage their clubs, courses, slots, reservations, members, and tournaments. Admins oversee the entire platform — users, clubs, and shop.

## Tech Stack

- **Build tool:** Vite + SWC
- **Framework:** React 18 + TypeScript (strict mode, ES2023 target)
- **Routing:** React Router v6 (nested routes, lazy loading, protected routes)
- **Server state:** TanStack Query (React Query) — caching, refetching, mutations
- **Client state:** Zustand — auth, theme, cart, UI state
- **Styling:** Tailwind CSS v4 + shadcn/ui (Nova preset, New York style)
- **Forms:** React Hook Form + Zod (schema validation)
- **HTTP client:** Axios (interceptors for auth tokens)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Dates:** date-fns
- **Notifications:** Sonner (toasts)
- **Linter:** ESLint
- **Package manager:** npm

## Architecture

### Single App, Feature-Based Structure

One Vite application with feature-based folder organization. Route-based code splitting via React.lazy(). Three role areas (player, manager, admin) with protected routes and role guards. Public pages are accessible without authentication.

### Folder Structure

```
src/
├── api/                        # API layer
│   ├── apiConfig.ts                # Axios instance + interceptors (auth token, 401 refresh)
│   └── endpoints/                # One file per feature endpoint
│       ├── auth.api.ts
│       ├── clubs.api.ts
│       ├── reservations.api.ts
│       ├── shop.api.ts
│       ├── campus.api.ts
│       ├── tournaments.api.ts
│       ├── notifications.api.ts
│       ├── dashboard.api.ts
│       ├── members.api.ts
│       └── admin.api.ts
│
├── components/                 # Shared UI components
│   ├── ui/                      # shadcn/ui components (button, card, dialog, table, etc.)
│   ├── layout/                  # Sidebar, Header, Footer, PageContainer, AppLayout
│   └── shared/                  # Domain components (KpiCard, ClubCard, ReservationCard, StatusBadge)
│
├── features/                   # Feature modules (core of the app)
│   ├── auth/                    # Authentication
│   │   ├── components/           # LoginForm, RegisterForm, MfaChallenge, ForgotPasswordForm
│   │   ├── hooks/                 # useLogin, useRegister, useLogout, useAuth
│   │   ├── pages/                 # LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage
│   │   ├── store.ts               # Zustand auth state (user, token, isAuthenticated)
│   │   └── types.ts               # LoginDTO, RegisterDTO, User
│   │
│   ├── clubs/                   # Club browsing and management
│   │   ├── components/           # ClubCard, ClubList, ClubProfile, CourseList
│   │   ├── hooks/                 # useClubs, useClub, useSearchClubs
│   │   ├── pages/                 # ClubsDirectoryPage, ClubProfilePage
│   │   └── types.ts               # ClubDTO, CourseDTO, ClubStatus
│   │
│   ├── reservations/            # Tee time booking and management
│   │   ├── components/           # ReservationCard, ReservationList, BookingFlow, SlotPicker
│   │   ├── hooks/                 # useReservations, useCreateReservation, useCancelReservation
│   │   ├── pages/                 # MyReservationsPage, SearchResultsPage, ReservationDetailPage
│   │   └── types.ts               # ReservationDTO, CreateReservationDTO, ReservationStatus
│   │
│   ├── shop/                    # Shop and orders
│   │   ├── components/           # ProductCard, ProductGrid, CartItem, CheckoutForm
│   │   ├── hooks/                 # useProducts, useCart, useOrders, useCreateOrder
│   │   ├── pages/                 # ShopPage, ProductDetailPage, CartPage, CheckoutPage, MyOrdersPage
│   │   └── types.ts               # ProductDTO, CartItemDTO, OrderDTO, CreateOrderDTO
│   │
│   ├── campus/                  # Campus packages and bookings
│   │   ├── components/           # PackageCard, PackageGrid, PackageCustomizer, BookingForm
│   │   ├── hooks/                 # usePackages, useCampusBookings, useCreateBooking
│   │   ├── pages/                 # CampusPage, PackageDetailPage, MyCampusBookingsPage
│   │   └── types.ts               # PackageDTO, CampusBookingDTO, CreateBookingDTO
│   │
│   ├── tournaments/              # Tournaments (announcement + slot blocking)
│   │   ├── components/           # TournamentCard, TournamentList, TournamentForm
│   │   ├── hooks/                 # useTournaments, useCreateTournament, useUpdateTournamentStatus
│   │   ├── pages/                 # TournamentsPage, TournamentDetailPage
│   │   └── types.ts               # TournamentDTO, TournamentStatus
│   │
│   ├── notifications/            # In-app notifications
│   │   ├── components/           # NotificationCard, NotificationList, NotificationDropdown
│   │   ├── hooks/                 # useNotifications, useMarkAsRead, useMarkAllAsRead
│   │   ├── pages/                 # NotificationsPage
│   │   └── types.ts               # NotificationDTO, NotificationType
│   │
│   ├── dashboard/                # Role-based dashboards
│   │   ├── components/           # KpiCard, PendingActionsQueue, ActivityFeed, ChartGrid
│   │   ├── hooks/                 # usePlayerDashboard, useManagerDashboard, useAdminDashboard
│   │   ├── pages/                 # PlayerDashboardPage, ManagerDashboardPage, AdminDashboardPage
│   │   └── types.ts               # DashboardStats, KpiCard, ChartData
│   │
│   ├── profile/                  # Profile and settings
│   │   ├── components/           # ProfileForm, SecurityTab, NotificationsTab, PrivacyTab, AccountTab
│   │   ├── hooks/                 # useProfile, useUpdateProfile, useChangePassword, useDeleteAccount
│   │   ├── pages/                 # ProfilePage
│   │   └── types.ts               # ProfileDTO, UpdateProfileDTO
│   │
│   ├── members/                  # Manager-only: member management
│   │   ├── components/           # MemberCard, MemberList, SuspendModal, MemberDetail
│   │   ├── hooks/                 # useMembers, useSuspendMember, useReinstateMember
│   │   ├── pages/                 # MembersPage
│   │   └── types.ts               # MemberDTO, SuspendDTO
│   │
│   ├── planning/                 # Manager-only: slot management
│   │   ├── components/           # TeeSheet, SlotRow, GenerateSlotsModal, SlotDetailPopover
│   │   ├── hooks/                 # useSlots, useGenerateSlots, useBlockSlot, useUnblockSlot
│   │   ├── pages/                 # PlanningPage
│   │   └── types.ts               # SlotDTO, GenerateSlotsDTO, SlotStatus
│   │
│   ├── admin/                    # Admin-only: platform management
│   │   ├── components/           # UserCard, ClubManagementCard, ClubPerformanceTable
│   │   ├── hooks/                 # useUsers, useClubs, useCreateManager, useAssignManager
│   │   ├── pages/                 # UsersPage, ClubsPage, ShopManagementPage
│   │   └── types.ts               # AdminUserDTO, AdminClubDTO, AssignManagerDTO
│   │
│   └── landing/                  # Public landing page
│       ├── components/           # Hero, SearchBar, PresentationBlocks, CTASection
│       ├── pages/                 # LandingPage
│       └── types.ts               # SearchDTO
│
├── hooks/                       # Global custom hooks
│   ├── useDebounce.ts            # Debounce any value
│   ├── useTheme.ts               # Light/dark mode toggle
│   └── useMediaQuery.ts          # Responsive breakpoint detection
│
├── lib/                         # Utilities
│   ├── utils.ts                  # cn() helper (clsx + tailwind-merge), formatDate, formatCurrency
│   ├── constants.ts              # API_URL, ROLES, STATUS_COLORS, STATUS_LABELS
│   └── validators.ts             # Zod schemas for forms (loginSchema, registerSchema)
│
├── routes/                      # Routing
│   ├── index.tsx                 # Router setup with all routes
│   ├── ProtectedRoute.tsx        # Auth guard (redirect to /login if not authenticated)
│   ├── RoleGuard.tsx             # Role guard (redirect to /403 if wrong role)
│   └── lazy.tsx                  # React.lazy() imports for code splitting
│
├── store/                       # Global state ONLY (used by 3+ features)
│   ├── theme.store.ts            # Light/dark mode (used everywhere)
│   ├── cart.store.ts             # Shopping cart (shop + navbar + checkout)
│   └── ui.store.ts               # Sidebar collapsed/expanded (layout + sidebar)
│
├── types/                       # Global types ONLY (used by 3+ features)
│   ├── user.types.ts             # User, Role, UserStatus
│   ├── club.types.ts             # Club, ClubStatus (used by clubs, reservations, dashboard, admin)
│   └── common.types.ts           # Pagination, ApiResponse, PaginatedResponse
│
├── App.tsx                      # Root component with providers (React Query, Router, Theme)
└── main.tsx                     # Entry point (ReactDOM render)
```

### The "3+ Features" Rule

- Feature-specific types/state → `src/features/<name>/types.ts` or `store.ts`
- Global types/state (used by 3+ features) → `src/types/` or `src/store/`
- Test: if only 1-2 features use it, keep it local. If 3+ need it, promote to global.

## Data Flow Pattern

```
Component → useQuery/useMutation (hook) → api function (Axios) → server
```

### Layer Responsibilities

1. **Types (DTOs)** — Define API request/response shapes in `features/<name>/types.ts`
2. **API functions** — In `features/<name>/api.ts` or `src/api/endpoints/`. Call Axios, return typed data.
3. **Hooks** — In `features/<name>/hooks/`. Wrap API calls with React Query (useQuery for reads, useMutation for writes).
4. **Components** — Only call hooks, never Axios directly. Handle loading/error/success states.

### Example

```typescript
// types.ts
export interface ReservationDTO { id: string; clubName: string; status: ReservationStatus; }

// api.ts
export const reservationsApi = {
  getMy: () => apiClient.get<ReservationDTO[]>('/reservations/my'),
  cancel: (id: string) => apiClient.patch(`/reservations/${id}/cancel`),
};

// hooks.ts
export function useMyReservations() {
  return useQuery({ queryKey: ['reservations', 'my'], queryFn: reservationsApi.getMy });
}

// component
function MyReservations() {
  const { data, isLoading } = useMyReservations();
  if (isLoading) return <Spinner />;
  return <ReservationList reservations={data} />;
}
```

## State Management

### Server State → React Query

- All data from the API (reservations, clubs, products, orders, notifications)
- React Query handles: caching, refetching, loading states, error states, optimistic updates
- Query keys: `['feature', 'action', params]` (e.g., `['reservations', 'my']`, `['clubs', 'search', filters]`)
- Never put server data in Zustand

### Client State → Zustand

- `auth.store.ts` (in features/auth): user, token, isAuthenticated, login(), logout()
- `theme.store.ts` (in store/): theme (light/dark), toggleTheme()
- `cart.store.ts` (in store/): cartItems, addToCart(), removeFromCart(), clearCart()
- `ui.store.ts` (in store/): sidebarCollapsed, toggleSidebar()
- Never put UI state in React Query

## Design System

### Colors

**Light Mode:**
- Primary: gold `#C9A84C` (accents, buttons, active states, star ratings, borders)
- Secondary: green `#2D6A4F` (dark sections, footer, CTAs, sidebar)
- Background: `#FAFAF8` (warm off-white, not pure white)
- Cards: `#FFFFFF` with subtle warm shadow
- Text: `#1A1A1A`
- Muted text: `#6C757D`
- Borders: `#E8E5E0` (warm gray)

**Dark Mode:**
- Primary: gold `#A8873C` (deeper gold)
- Secondary: green `#1B4332` (deep forest)
- Background: `#0F1410` (very dark green-tinted black, NOT pure black)
- Cards: `#1A2420` with subtle gold-tinted border
- Text: `#F0F0F0`
- Muted text: `#A0A0A0`
- Borders: `#2A302C`

### Color Rules

- Gold is an ACCENT — thin borders, small labels, button hovers, active states, star ratings, price highlights. Never flood large areas with gold.
- Green is the FOUNDATION — dark sections, footer, primary CTAs, sidebar. Green = the golf course.
- Lots of negative space. Let content breathe. Premium brands use space to signal confidence.

### Typography

- Font: Geist (via shadcn Nova preset)
- Headlines: large, bold, tight line-height
- Body: 16px base, line-height 1.6
- Eyebrow labels: small, uppercase, wide letter-spacing (0.15em), gold color
- Buttons: medium weight, slight letter-spacing

### shadcn/ui

- Components live in `src/components/ui/` — we own the code, not npm dependencies
- Customize freely by editing the files
- Add new components: `npx shadcn@latest add <component>`
- Base components used: button, card, dialog, sheet, dropdown-menu, table, tabs, avatar, badge, form, select, checkbox, switch, sonner, command, popover, tooltip, input, label, separator, skeleton

### Status Badges

| Status | Color | Label (FR) |
|---|---|---|
| CONFIRMED / ACTIVE / PUBLISHED | green | Confirmée / Actif / Publié |
| PENDING / DRAFT | gold | En attente / Brouillon |
| CANCELLED / REJECTED / SUSPENDED | red | Annulée / Refusée / Suspendu |
| EXPIRED / ARCHIVED | gray | Expiré / Archivé |
| COMPLETED | blue | Terminée |
| IN_PROGRESS | green (pulse) | En cours |

## Routes

### Public (no auth)

```
/                          → Landing page (hero + search bar + platform presentation)
/search                    → Search results (clubs + available slots)
/club/:clubId              → Club public profile
/campus                    → Campus packages listing
/campus/:packageId         → Package detail + customization
/shop                      → Shop product listing
/shop/:productId           → Product detail (modal)
/login                     → Login
/register                  → Player registration
/forgot-password           → Password reset request
/reset-password            → Password reset (via email link)
/verify-email              → Email verification
```

### Player (protected + role: PLAYER)

```
/player/dashboard          → KPIs, next tee time, recent reservations, clubs, invitations
/player/reservations       → My reservations (tabs: upcoming, past, cancelled)
/player/clubs              → My clubs (memberships)
/player/orders             → My shop orders
/player/campus-bookings    → My campus bookings
/player/notifications      → Notifications
/player/profile            → Profile & settings (tabs: profile, security, notifications, preferences, privacy, account)
```

### Manager (protected + role: MANAGER)

```
/manager/dashboard         → KPIs, charts, pending actions, tee sheet, activity feed
/manager/club              → My club (tabs: about, courses, contact, gallery, settings)
/manager/planning          → Tee sheet (day/week view), slot generation, block/unblock
/manager/requests          → Booking requests (approve/reject with alternative suggestions)
/manager/members           → Member list (suspend/reinstate)
/manager/tournaments       → Tournaments (create, announce, start, complete, cancel)
/manager/packages          → Campus packages (create, edit, archive)
/manager/notifications     → Notifications
/manager/profile           → Profile & settings (+ club settings tab)
```

### Admin (protected + role: ADMIN)

```
/admin/dashboard           → Platform KPIs, charts, pending actions, activity log, club performance table
/admin/users               → User management (CRUD, suspend, assign manager)
/admin/clubs               → Club management (CRUD, assign/reassign manager)
/admin/shop                → Shop management (tabs: products, orders, reviews)
/admin/notifications       → Notifications
/admin/profile             → Profile & settings
```

## Import Aliases

- `@/*` → `./src/*`
- Configured in `tsconfig.json`, `tsconfig.app.json`, and `vite.config.ts`
- Always use `@/` imports, never relative paths like `../../components/...`

## Commands

```
npm run dev        # Start dev server (Vite, port 5173)
npm run build      # Production build
npm run lint       # ESLint
npm run preview    # Preview production build
```

### shadcn/ui Commands

```
npx shadcn@latest add <component>   # Add component (copies to src/components/ui/)
npx shadcn@latest add button card dialog table tabs  # Add multiple
```

## Key Architectural Decisions

- **Single app, not monorepo** — solo developer, 2-month timeline. Can extract to monorepo later if team grows.
- **Feature-based folders, not type-based** — everything for a feature in one place. Don't hunt across 5 folders.
- **No DAO on frontend** — use DTOs (TypeScript interfaces) for API shapes. DAO is a backend pattern.
- **React Query + Axios together** — Axios fetches (the driver), React Query caches (the warehouse). Not competitors.
- **shadcn/ui over MUI** — Tailwind-native, we own the code, easy gold/green theming via CSS variables.
- **Route-based code splitting** — React.lazy() per route. Player doesn't download admin code.
- **ProtectedRoute + RoleGuard** — router prevents unauthorized access at the route level.
- **Zustand over Redux** — simple, no boilerplate, no providers. Perfect for this project size.
- **Tailwind CSS v4** — utility-first, fast, consistent. Paired with shadcn/ui for components.
- **TypeScript strict mode** — non-negotiable for a senior project. Type safety, autocomplete, fewer bugs.

## Environment Variables

```
VITE_API_URL=http://localhost:8080/api    # Backend API URL
```

Access in code: `import.meta.env.VITE_API_URL`

## Backend API (External)

- Java Spring Boot + PostgreSQL + MinIO
- JWT auth with http-only cookies (access token 15min, refresh token 7 days)
- REST API, all responses are JSON
- Base URL: `VITE_API_URL`
- Auth: http-only cookies (no manual token handling in Axios, but interceptor reads token for API calls that need header-based auth)
- Error format: `{ message: string, code: string, details?: object }`

## Current State

- Project scaffolded (Vite + React + TypeScript + SWC)
- ESLint configured
- Tailwind CSS v4 installed and configured
- shadcn/ui initialized (Nova preset, New York style)
- Path aliases configured (@/* → ./src/*)
- AGENTS.md created (this file)
- Folder structure created (features, api, components, routes, store, types, lib, hooks)
- Axios client + interceptors
- Router setup with protected routes and role guards
- Auth store (Zustand) — user, token, isAuthenticated
- Theme store (Zustand) — light/dark mode
- Layout components — collapsible sidebar, header, footer
- Auth feature — login, register, forgot password, reset password, email verify
- Landing page — hero, search bar, presentation blocks
- Player pages — dashboard, reservations, clubs, orders, campus bookings, notifications, profile
- Manager pages — dashboard, club, planning, requests, members, tournaments, packages, notifications, profile
- Admin pages — dashboard, users, clubs, shop management, notifications, profile

## Coding Conventions

- **Language:** French for all UI text, English for code (variables, functions, comments)
- **Naming:** camelCase for variables/functions, PascalCase for components/types/interfaces, kebab-case for file names (except components which are PascalCase)
- **Imports:** Always use @/ alias, never relative paths beyond parent
- **Exports:** Named exports for hooks/utils, default export for pages
- **Components:** Functional components with hooks, no class components
- **Types:** Always type props and return values. No any type.
- **Forms:** React Hook Form + Zod. Never use raw useState for form state.
- **API calls:** Always through hooks (React Query), never direct Axios calls in components
- **Styling:** Tailwind classes only. No CSS files except globals.css (Tailwind import + CSS variables)
- **Dark mode:** Use Tailwind dark: variant. Theme controlled by Zustand store + class on html element.
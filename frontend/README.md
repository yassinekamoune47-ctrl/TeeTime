#  TeeTime Frontend Documentation

> Part of the TeeTime Golf Club Management System. See the [Main README](../README.md) for project overview and [Backend Documentation](../backend/README.md) for the API reference.

<div align="center">
  
  ![React](https://img.shields.io/badge/React-19.2.7-blue.svg)
  ![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-blue.svg)
  ![Vite](https://img.shields.io/badge/Vite-8.1.1-purple.svg)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3.2-38B2AC.svg)
  
  **React + TypeScript frontend for TeeTime Golf Club Management System**

</div>

---

##  Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Features & Components](#features--components)
- [State Management](#state-management)
- [Routing](#routing)
- [API Integration](#api-integration)
- [Styling](#styling)
- [Internationalization](#internationalization)
- [Build & Deployment](#build--deployment)

---

##  Overview

The TeeTime frontend is a modern, responsive web application built with React and TypeScript. It provides intuitive interfaces for three different user roles: Admin, Manager, and Player.

### Key Features

-  **Modern UI/UX**: Clean, responsive design with Tailwind CSS
-  **Type Safety**: Full TypeScript support
-  **Fast Development**: Hot Module Replacement with Vite
-  **State Management**: Zustand for global state
-  **Real-time Updates**: WebSocket integration
-  **Form Validation**: React Hook Form + Zod
-  **Internationalization**: i18next (English & French)
-  **Component Library**: Shadcn/ui components
-  **Responsive Design**: Mobile-first approach
-  **Code Splitting**: Lazy loading for better performance

---

##  Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2.7 | UI framework |
| **TypeScript** | 6.0.2 | Type safety |
| **Vite** | 8.1.1 | Build tool |
| **Tailwind CSS** | 4.3.2 | Styling |
| **React Router** | 7.18.1 | Routing |
| **Zustand** | 5.0.14 | State management |
| **Axios** | 1.18.1 | HTTP client |
| **React Hook Form** | 7.81.0 | Form handling |
| **Zod** | 4.4.3 | Schema validation |
| **i18next** | 26.3.5 | Internationalization |
| **Lucide React** | 1.23.0 | Icons |
| **Recharts** | 3.9.2 | Charts & graphs |
| **Sonner** | 2.0.7 | Toast notifications |

---

##  Architecture

### Component Architecture

```

            App Component                    
  (Routing, Auth, Theme Provider)           

                   
        
                             
   
  Public Routes     Protected Routes
  - Login            - Dashboard    
  - Register         - Features     
   
                              
                 
                                         
           
            Admin      Manager   Player  
          Dashboard   Dashboard Dashboard
           
```

### Feature-Based Structure

Each feature (clubs, reservations, memberships, etc.) follows this pattern:

```
feature/
 components/       # Feature-specific components
 hooks/           # Custom hooks
 pages/           # Page components
 types.ts         # TypeScript types
 utils.ts         # Helper functions
```

---

##  Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see [Backend README](../backend/README.md))

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   VITE_API_URL=http://localhost:8081
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

---

##  Project Structure

```
frontend/
 public/
    teetime-logo.png          # Application logo
    ...                       # Static assets

 src/
    api/                      # API client & endpoints
       apiConfig.ts          # Axios configuration
       endpoints/            # API endpoint definitions
           auth.api.ts
           club.api.ts
           membership.api.ts
           reservation.api.ts
           ...
   
    components/               # Reusable components
       ui/                   # Shadcn/ui components
          button.tsx
          input.tsx
          dialog.tsx
          ...
       layout/               # Layout components
          Header.tsx
          Sidebar.tsx
          Footer.tsx
       ...                   # Shared components
   
    features/                 # Feature modules
       admin/                # Admin dashboard
          components/
          pages/
          types.ts
      
       manager/              # Manager dashboard
          components/
          pages/
             DashboardPage.tsx
             ClubsPage.tsx
             ReservationsPage.tsx
             ...
          types.ts
      
       player/               # Player dashboard
          components/
          pages/
             MyClubsPage.tsx
             MyReservationsPage.tsx
             MyCampusPage.tsx
             ...
          types.ts
      
       auth/                 # Authentication
          components/
             LoginForm.tsx
             RegisterForm.tsx
          pages/
          types.ts
      
       clubs/                # Club features
       memberships/          # Membership features
       reservations/         # Reservation features
       tournaments/          # Tournament features
       ...
   
    hooks/                    # Custom React hooks
       useAuth.ts
       useMediaQuery.ts
       useDebounce.ts
       ...
   
    store/                    # State management
       authStore.ts          # Auth state
       userStore.ts          # User state
       notificationStore.ts  # Notifications
       ...
   
    types/                    # Global TypeScript types
       user.types.ts
       api.types.ts
       ...
   
    utils/                    # Utility functions
       formatters.ts
       validators.ts
       ...
   
    locales/                  # i18n translations
       en/
          translation.json
       fr/
           translation.json
   
    App.tsx                   # Root component
    main.tsx                  # Entry point
    index.css                 # Global styles
    vite-env.d.ts            # Vite types

 .env                          # Environment variables
 .env.example                  # Environment template
 index.html                    # HTML template
 package.json                  # Dependencies
 tsconfig.json                 # TypeScript config
 vite.config.ts               # Vite config
 tailwind.config.js           # Tailwind config
 Dockerfile                    # Docker config
 README.md                     # This file
```

---

##  Features & Components

### Admin Dashboard

**Pages:**
- `DashboardPage.tsx` - Overview statistics
- `UsersPage.tsx` - User management
- `ClubsPage.tsx` - Club management
- `AnalyticsPage.tsx` - System analytics

**Key Features:**
- User CRUD operations
- Club assignment to managers
- System-wide statistics
- User role management

### Manager Dashboard

**Pages:**
- `DashboardPage.tsx` - Club overview
- `CoursesPage.tsx` - Course management
- `MembershipsPage.tsx` - Membership plans
- `ReservationsPage.tsx` - Reservation management
- `MembershipRequestsPage.tsx` - Membership requests
- `TournamentsPage.tsx` - Tournament management

**Key Features:**
- Club & course CRUD
- Membership plan creation
- Reservation approval/rejection
- Tournament organization
- Time slot management

### Player Dashboard

**Pages:**
- `MyClubsPage.tsx` - Clubs with active memberships
- `MyReservationsPage.tsx` - Reservation history
- `MyCampusPage.tsx` - Tournament registrations
- `MyOrdersPage.tsx` - Purchase history

**Key Features:**
- **Debounced search** (500ms delay)
- **Pagination** with load more
- **Real-time notifications**
- Club & reservation viewing
- Tournament registration

**Implementation Highlights:**

#### MyClubsPage
```typescript
// Debounced search implementation
useEffect(() => {
  const timeoutId = setTimeout(() => {
    fetchClubs(search, 0);
  }, 500);
  return () => clearTimeout(timeoutId);
}, [search, fetchClubs]);

// Pagination with load more
const loadMore = () => {
  if (!loading && hasMore) {
    fetchClubs(search, page + 1);
  }
};
```

#### MyReservationsPage
```typescript
// Real-time data fetching
const fetchReservations = useCallback(async (searchQuery, pageNum) => {
  const response = await reservationApi.searchPlayerReservations({
    search: searchQuery,
    status: null,
    page: pageNum,
    size: 10,
  });
  // Format and display data
}, []);
```

---

##  State Management

### Zustand Stores

#### Auth Store
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}
```

#### Notification Store
```typescript
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}
```

### Usage Example

```typescript
import { useAuthStore } from '@/store/authStore';

function Component() {
  const { user, isAuthenticated, logout } = useAuthStore();
  
  return (
    <div>
      {isAuthenticated && <p>Welcome, {user?.firstName}</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

##  Routing

### Route Structure

```typescript
<Routes>
  {/* Public Routes */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  
  {/* Protected Routes */}
  <Route element={<ProtectedRoute />}>
    {/* Admin Routes */}
    <Route path="/admin/*" element={<AdminLayout />}>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="clubs" element={<ClubsPage />} />
    </Route>
    
    {/* Manager Routes */}
    <Route path="/manager/*" element={<ManagerLayout />}>
      <Route path="dashboard" element={<ManagerDashboard />} />
      <Route path="courses" element={<CoursesPage />} />
      <Route path="memberships" element={<MembershipsPage />} />
    </Route>
    
    {/* Player Routes */}
    <Route path="/player/*" element={<PlayerLayout />}>
      <Route path="clubs" element={<MyClubsPage />} />
      <Route path="reservations" element={<MyReservationsPage />} />
    </Route>
  </Route>
</Routes>
```

### Protected Routes

```typescript
function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}
```

---

##  API Integration

### API Configuration

```typescript
// src/api/apiConfig.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add JWT token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);
```

### API Endpoints

```typescript
// src/api/endpoints/club.api.ts
export const clubApi = {
  searchClubs: (params: SearchClubsParams) =>
    api.post('/clubs/search', params),
  
  getClubById: (id: string) =>
    api.get(`/clubs/${id}`),
  
  createClub: (data: CreateClubData) =>
    api.post('/clubs/add', data),
};
```

### Usage in Components

```typescript
const fetchClubs = async () => {
  try {
    const response = await clubApi.searchClubs({
      name: '',
      city: '',
      page: 0,
      size: 10,
    });
    setClubs(response.data.data);
  } catch (error) {
    toast.error('Failed to fetch clubs');
  }
};
```

---

##  Styling

### Tailwind CSS

**Configuration:**
```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#10b981',
        secondary: '#1e3a8a',
        // ...
      },
    },
  },
  plugins: [],
};
```

**Usage:**
```typescript
<Button className="bg-primary text-white hover:bg-primary/90">
  Click Me
</Button>
```

### Component Library

Using **Shadcn/ui** components:
- Fully customizable
- Accessible by default
- Built with Radix UI primitives

**Example:**
```typescript
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
```

---

##  Internationalization

### i18next Configuration

```typescript
// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: require('./locales/en/translation.json') },
      fr: { translation: require('./locales/fr/translation.json') },
    },
    lng: 'fr',
    fallbackLng: 'en',
  });
```

### Usage

```typescript
import { useTranslation } from 'react-i18next';

function Component() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <button onClick={() => i18n.changeLanguage('fr')}>
        Franais
      </button>
    </div>
  );
}
```

---

##  Build & Deployment

### Development

```bash
npm run dev          # Start dev server
npm run lint         # Run ESLint
npm run build        # Build for production
npm run preview      # Preview production build
```

### Production Build

```bash
npm run build
```

Output in `dist/` directory.

### Docker

```bash
docker build -t teetime-frontend .
docker run -p 5173:5173 teetime-frontend
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8081` |

---

##  Testing

### Component Testing

```bash
npm run test
```

### E2E Testing

```bash
npm run test:e2e
```

---

##  Development Tools

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin
- Auto Rename Tag
- Path Intellisense

### Browser DevTools

- React Developer Tools
- Redux DevTools (for Zustand)

---

##  Troubleshooting

### Common Issues

**API Connection Error**
```
Solution: Check VITE_API_URL in .env and ensure backend is running
```

**Module Not Found**
```
Solution: Run npm install to install missing dependencies
```

**Port Already in Use**
```
Solution: Kill the process using port 5173 or change port in vite.config.ts
```

---

##  Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vite.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Router Documentation](https://reactrouter.com/)

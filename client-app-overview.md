# Client App Overview

## Tech Stack Overview

The client application is built with:
- **Next.js 13+** with App Router
- **React 18** for UI components
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Shadcn/ui** for consistent UI components
- **Tanstack Query** (React Query) for data fetching
- **Zustand** for state management
- **NextAuth.js** for authentication

## Application Structure

### Directory Structure

```
client/
├── app/                   # Next.js App Router structure
│   ├── (authenticated)/   # Layout for authenticated routes
│   │   ├── assignments/   # Assignment management
│   │   ├── cafeteria/     # Cafeteria and food ordering
│   │   ├── clubs/         # Club dashboard and details
│   │   ├── dashboard/     # Main user dashboard
│   │   ├── events/        # Event pages
│   │   ├── notifications/ # Notification center
│   │   ├── profile/       # User profile
│   │   ├── routine/       # Class schedule
│   │   └── settings/      # App settings
│   ├── (public)/          # Layout for public routes
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration
│   │   ├── reset-password/ # Password recovery
│   │   └── verify-email/  # Email verification
│   ├── api/               # API routes (for auth, etc.)
│   └── layout.tsx         # Root layout
├── components/            # Reusable React components
│   ├── ui/                # Shadcn UI components
│   ├── clubs/             # Club-related components
│   ├── events/            # Event-related components
│   ├── cafeteria/         # Cafeteria components
│   ├── dashboard/         # Dashboard widgets
│   ├── forms/             # Form components
│   ├── layout/            # Layout components
│   └── shared/            # Shared components
├── hooks/                 # Custom React hooks
│   ├── api/               # API-related hooks
│   └── state/             # State-related hooks
├── lib/                   # Utility functions and libraries
│   ├── api/               # API utility functions
│   ├── auth/              # Authentication utilities
│   └── utils/             # General utilities
├── providers/             # Context providers
├── public/                # Static assets
├── store/                 # Zustand state stores
│   ├── authStore.ts       # Authentication state
│   ├── cartStore.ts       # Shopping cart state
│   └── uiStore.ts         # UI/theme state
└── types/                 # TypeScript type definitions
```

## Authentication Flow

The app uses a secure authentication system:

1. **Login Page**: User enters credentials
2. **Token Management**: JWT tokens stored securely
3. **Route Protection**: Authenticated routes behind NextAuth protection
4. **Role-Based Access**: Different UIs for different user roles
5. **Session Management**: Auto-refresh of tokens

## Key Features by Module

### Dashboard

- **Personalized Overview**: Shows relevant user data 
- **Quick Access Cards**: Fast access to frequently used features
- **Activity Feed**: Recent notifications and updates
- **Statistics Widgets**: Visual metrics based on user role

### Clubs Module

- **Club Discovery**: Browse and search university clubs
- **Club Pages**: Detailed information about each club
- **Following System**: Follow clubs for updates
- **Event Integration**: See club events and activities
- **Management**: Club moderators have admin options
- **Analytics**: View engagement data for club administrators

### Events Module

- **Event Discovery**: Browse and search campus events
- **Event Details**: View event information and location
- **RSVP System**: Register interest in events
- **Calendar Integration**: Add events to personal calendar
- **Reminders**: Get notified about upcoming events

### Cafeteria Module

- **Menu Browsing**: View available meals
- **Cart Management**: Add items to cart
- **Order Processing**: Place and track food orders
- **Dietary Preferences**: Filter meals by preferences
- **Order History**: View past orders
- **Pre-ordering**: Schedule food pickup in advance

### Academic Modules

- **Routine**: Personal class schedule management
- **Assignments**: Track and submit assignments
- **Exams**: Exam schedule and preparation
- **Course Materials**: Access learning resources

## UI Design Patterns

The application uses:

1. **Responsive Design**: Works on all device sizes
2. **Dark/Light Mode**: Theme switching with system preference detection
3. **Component Composition**: Organized component hierarchy
4. **Shadcn UI**: Consistent styling based on Radix UI primitives
5. **Tailwind Utilities**: Custom styling with utility classes

## Data Fetching Strategy

The app uses a sophisticated data fetching strategy:

1. **React Query**: For data fetching, caching and synchronization
2. **SWR Pattern**: Stale-while-revalidate for fresh data
3. **Custom Hooks**: Encapsulated API calls in reusable hooks
4. **Loading States**: Skeleton loaders and loading indicators
5. **Error Handling**: Consistent error UI patterns

## State Management

State is managed through a combination of:

1. **Local Component State**: For UI-specific state
2. **Zustand Stores**: For shared application state
3. **React Query Cache**: For server state

## Routing

The application uses Next.js App Router with:

1. **Layout-Based Organization**: Shared layouts for related pages
2. **Route Groups**: Logical grouping of related routes
3. **Dynamic Routes**: Path parameters for specific entities
4. **Middleware**: For authentication checks
5. **Parallel Routes**: For complex page layouts

## Notable Custom Hooks

- **useAuth()**: Access authentication state and methods
- **useCart()**: Shopping cart functionality
- **useNotifications()**: Access notification functionality
- **useDebounce()**: Debounce inputs for search
- **useMealSearch()**: Search cafeteria meals
- **useClubData()**: Fetch and manage club data
- **useEventData()**: Fetch and manage event data

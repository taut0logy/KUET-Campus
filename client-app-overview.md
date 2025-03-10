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
│   │   ├── admin-dashboard/  # Admin dashboard
│   │   ├── admin-qr/      # Admin QR code management
│   │   ├── bus/           # Bus schedule and tracking
│   │   ├── cafe-dashboard/ # Cafe management dashboard
│   │   ├── cafe-meal-control/ # Meal management for cafe
│   │   ├── cafe-order-control/ # Order management for cafe
│   │   ├── cafe-user-dashboard/ # User dashboard for cafe
│   │   ├── cafeteria/     # Cafeteria and food ordering
│   │   ├── cart/          # Shopping cart
│   │   ├── chat/          # Chat functionality between atudents and faculty
│   │   ├── clubs/         # Club dashboard and details
│   │   ├── dashboard/     # Main user dashboard
│   │   ├── emergency/     # Emergency alerts and services
│   │   ├── events/        # Event pages
│   │   ├── faculty-dashboard/       # Faculty dashboard and details
│   │   ├── map/           # Campus map and navigation
│   │   ├── office-manager/ # Office management
│   │   ├── preorder/      # Food pre-ordering
│   │   ├── profile/       # User profile
│   │   ├── report/        # Reporting functionality
│   │   └── schedules/     # Class and event schedules
│   ├── (auth)/            # Layout for authentication routes
│   │   ├── forgot-password/ # Password recovery request
│   │   ├── login/         # Login page
│   │   ├── register/      # User registration
│   │   ├── resend-verification/ # Resend verification email
│   │   ├── reset-password/ # Password reset
│   │   └── verify-email/  # Email verification
│   │   └── layout.jsx     # Auth layout
│   ├── (guest)/           # Layout for guest/public routes
│   │   ├── cafeteria/     # Cafeteria and food ordering
│   │   ├── page.jsx       # Home page
│   │   └── layout.jsx     # Guest layout
│   ├── api/               # API routes (current not used)
│   └── layout.jsx         # Root layout
├── components/            # Reusable React components
│   ├── auth/              # Authentication components
│   ├── bus/               # Bus-related components
│   ├── chat/              # Chat components
│   ├── clubs/             # Club-related components
│   ├── dashboard/         # Dashboard widgets
│   ├── layout/            # Layout components
│   ├── notifications/     # Notification components
│   ├── providers/         # Context providers
│   │   ├── auth-provider.js
│   │   ├── socket-provider.jsx
│   │   ├── theme-provider.jsx
│   ├── schedules/         # Schedule components
│   ├── ui/                # Shadcn UI components
│   └── various feature components:
│       ├── AiAgent.js
│       ├── ARNavigationView.js
│       ├── ARWaypoints.js
│       ├── BarChart.js
│       ├── BusRoutes.jsx
│       ├── CampusMap.js
│       ├── DataTable.js
│       ├── emergency-alert.jsx
│       ├── FoodRecognition.js
│       ├── LineChart.js
│       ├── MealChatbot.js
│       ├── MilitaryIndoorNavigation.js
│       ├── ObjectRecognition.js
│       ├── PieChart.js
│       ├── QRScanner.js
│       └── theme-toggle.jsx
├── hooks/                 # Custom React hooks
│   ├── useChat.js         # Chat hook
│   ├── useNotificationChannel.js # Notification hook for socket.io custom channel
│   ├── useSocket.js       # Socket hook
│   └── use-debounce.js     # Debounce hook
├── lib/                   # Utility functions and libraries
│   ├── axios.js           # Axios instance, used for all api calls
│   ├── eventBus.js        # Event bus for communication between components
│   ├── supabase.js        # Supabase client instance, currently not used
│   └── utils.js           # Utility functions
├── public/                # Static assets
├── stores/                # Zustand state stores
│   ├── announcement-store.js      # Announcement state
│   ├── assignment-store.js      # Assignment state
│   ├── auth-store.js      # Authentication state
│   ├── bus-store.js      # Bus state
│   ├── cafeteria-store.js      # Cafe state
│   ├── cart-store.js      # Shopping cart state
│   ├── chat-store.js      # Chat state
│   ├── club-store.js      # Club state
│   ├── department-store.js      # Department state
│   ├── event-store.js      # Event state
│   ├── notification-store.js      # Notification state
│   ├── order-store.js      # Order state
│   ├── profile-store.js      # Profile state
│   ├── routine-store.js      # Routine state
│   └── user-store.js      # User state
└── middleware.ts          # Middleware for authentication checks

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

### Map and Navigation

- **Campus Map**: Interactive map of the campus
- **AR Navigation**: Augmented reality navigation
- **Indoor Navigation**: Military-grade indoor navigation
- **Object Recognition**: AI-powered object recognition
- **Waypoints**: Custom navigation waypoints

### Emergency Services

- **Alert System**: Emergency alerts and notifications
- **Reporting**: Incident reporting functionality
- **Emergency Contacts**: Quick access to emergency services

### Bus System

- **Bus Routes**: View and track bus routes
- **Schedule**: Bus schedule information
- **Real-time Tracking**: Live tracking of buses

### Academic Modules

- **Schedules**: Personal class schedule management
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

## Advanced Features

- **AI Agent**: Intelligent assistant for campus navigation and information
- **Food Recognition**: AI-powered food recognition for cafeteria
- **QR Scanner**: QR code scanning for various campus services
- **Real-time Chat**: Socket.io based real-time chat functionality
- **Data Visualization**: Charts and graphs for data representation

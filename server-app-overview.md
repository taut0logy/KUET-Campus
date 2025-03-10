# Server App Overview

## Tech Stack Overview

The server application is built with:
- **Express.js** for the web server framework
- **Prisma ORM** for database access and management
- **PostgreSQL** as the primary database
- **Socket.io** for real-time communication
- **JWT** for authentication and authorization
- **Supabase** for additional authentication and storage
- **Redis** for caching and pub/sub functionality
- **Google Generative AI** for AI-powered features
- **LangChain** for AI workflows and integrations

## Application Structure

### Directory Structure

```
server/
├── src/                   # Source code directory
│   ├── config/            # Configuration files
│   │   ├── supabase.js     # Supabase configuration
│   ├── controllers/       # Request handlers
│   │   ├── admin.controller.js
│   │   ├── ai-cafe-manager.controller.js
│   │   ├── assignment.controller.js
│   │   ├── auth.controller.js
│   │   ├── bus.controller.js
│   │   ├── cafeteria.controller.js
│   │   ├── cart.controller.js
│   │   ├── chat.controller.js
│   │   ├── club.controller.js
│   │   ├── department.controller.js
│   │   ├── emergency.controller.js
│   │   ├── event.controller.js
│   │   ├── order.controller.js
│   │   ├── report.controller.js
│   │   ├── route.controller.js
│   │   ├── routine.controller.js
│   │   └── user.controller.js
│   ├── data/              # Static data and fixtures
│   ├── middleware/        # Express middleware
│   │   ├── auth.middleware.js    # Authentication middleware
│   │   ├── bus.middleware.js     # Bus-related middleware
│   │   ├── error.middleware.js   # Error handling middleware
│   │   ├── rate-limit.middleware.js # Rate limiting
│   │   └── validators/           # Request validation middleware
│   ├── routes/            # API route definitions
│   │   ├── admin.routes.js
│   │   ├── ai-cafe-manager.routes.js
│   │   ├── assignment.routes.js
│   │   ├── auth.routes.js
│   │   ├── bus.routes.js
│   │   ├── cafeteria.routes.js
│   │   ├── cart.routes.js
│   │   ├── chat.routes.js
│   │   ├── club.routes.js
│   │   ├── department.routes.js
│   │   ├── emergency.routes.js
│   │   ├── event.routes.js
│   │   ├── index.js              # Route aggregator
│   │   ├── notification.routes.js
│   │   ├── order.routes.js
│   │   ├── report.routes.js
│   │   ├── routine.routes.js
│   │   ├── storage.routes.js
│   │   └── user.routes.js
│   ├── services/          # Business logic and data access
│   │   ├── admin.service.js
│   │   ├── assignment.service.js
│   │   ├── auth.service.js
│   │   ├── bus.service.js
│   │   ├── cafeteria.service.js
│   │   ├── cart.service.js
│   │   ├── chat.service.js
│   │   ├── club.service.js
│   │   ├── database.service.js   # Database connection service
│   │   ├── department.service.js
│   │   ├── email.service.js      # Email sending service
│   │   ├── event.service.js
│   │   ├── order.service.js
│   │   ├── realtime.service.js   # Socket.io service
│   │   ├── report.service.js
│   │   ├── routine.service.js
│   │   ├── storage.service.js    # File storage service
│   │   └── user.service.js
│   ├── utils/             # Utility functions
│   └── index.js           # Application entry point
├── prisma/                # Prisma ORM configuration
│   ├── migrations/        # Database migrations
│   ├── seeders/           # Database seed scripts
│   └── schema.prisma      # Database schema definition
└── logs/                  # Application logs
├── .env                   # Environment variables
```

## API Structure

The server provides a RESTful API with the following main endpoints:

### Authentication
- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - User login
- **POST /api/auth/refresh-token** - Refresh authentication token
- **POST /api/auth/forgot-password** - Request password reset
- **POST /api/auth/reset-password** - Reset password
- **POST /api/auth/verify-email** - Verify user email

### User Management
- **GET /api/users** - Get all users (admin only)
- **GET /api/users/:id** - Get user by ID
- **PUT /api/users/:id** - Update user
- **DELETE /api/users/:id** - Delete user (admin only)
- **GET /api/users/profile** - Get current user profile

### Cafeteria
- **GET /api/cafeteria/meals** - Get all meals
- **GET /api/cafeteria/meals/:id** - Get meal by ID
- **POST /api/cafeteria/meals** - Create new meal (cafe manager only)
- **PUT /api/cafeteria/meals/:id** - Update meal (cafe manager only)
- **DELETE /api/cafeteria/meals/:id** - Delete meal (cafe manager only)
- **GET /api/cafeteria/categories** - Get meal categories

### Cart
- **GET /api/cart** - Get user's cart
- **POST /api/cart/add** - Add item to cart
- **PUT /api/cart/update** - Update cart item
- **DELETE /api/cart/remove/:id** - Remove item from cart
- **POST /api/cart/clear** - Clear cart

### Orders
- **POST /api/orders** - Create new order
- **GET /api/orders** - Get user's orders
- **GET /api/orders/:id** - Get order by ID
- **PUT /api/orders/:id/status** - Update order status (cafe manager only)
- **GET /api/orders/cafe** - Get all cafe orders (cafe manager only)

### Clubs
- **GET /api/clubs** - Get all clubs
- **GET /api/clubs/:id** - Get club by ID
- **POST /api/clubs** - Create new club
- **PUT /api/clubs/:id** - Update club (club manager only)
- **DELETE /api/clubs/:id** - Delete club (admin only)
- **POST /api/clubs/:id/join** - Join a club
- **POST /api/clubs/:id/leave** - Leave a club
- **GET /api/clubs/:id/members** - Get club members
- **PUT /api/clubs/:id/members/:userId/role** - Update member role (club manager only)

### Events
- **GET /api/events** - Get all events
- **GET /api/events/:id** - Get event by ID
- **POST /api/events** - Create new event
- **PUT /api/events/:id** - Update event (event creator or admin only)
- **DELETE /api/events/:id** - Delete event (event creator or admin only)
- **POST /api/events/:id/register** - Register for an event
- **POST /api/events/:id/unregister** - Unregister from an event

### Bus
- **GET /api/bus/routes** - Get all bus routes
- **GET /api/bus/routes/:id** - Get bus route by ID
- **GET /api/bus/schedule** - Get bus schedule
- **GET /api/bus/live** - Get live bus locations

### Chat
- **GET /api/chat/conversations** - Get user's conversations
- **GET /api/chat/conversations/:id** - Get conversation by ID
- **POST /api/chat/conversations** - Create new conversation
- **GET /api/chat/conversations/:id/messages** - Get conversation messages
- **POST /api/chat/conversations/:id/messages** - Send message

### Emergency
- **POST /api/emergency/alert** - Create emergency alert
- **GET /api/emergency/alerts** - Get emergency alerts
- **POST /api/emergency/report** - Report emergency

## Authentication and Authorization

The server implements a robust authentication and authorization system:

1. **JWT-based Authentication**: JSON Web Tokens for secure authentication
2. **Role-based Access Control**: Different permissions for different user roles
3. **Middleware Protection**: Routes protected by authentication middleware
4. **Token Refresh**: Automatic token refresh mechanism
5. **Password Hashing**: Secure password storage with bcrypt

## Database Schema

The database schema is defined using Prisma and includes the following main models:

### User
- Basic user information (name, email, password)
- Role-based access control (admin, student, faculty, etc.)
- Profile information
- Relationships to other entities

### Cafeteria
- Meals and meal categories
- Pricing and availability
- Nutritional information
- Ordering system

### Club
- Club information and description
- Membership management
- Events and activities
- Club roles and permissions

### Event
- Event details and scheduling
- Registration and attendance
- Location information
- Organizer details

### Bus
- Bus routes and schedules
- Real-time tracking information
- Stop locations and times

### Chat
- Conversations and messages
- User participation
- Message status and timestamps

## Real-time Features

The server implements real-time features using Socket.io:

1. **Chat System**: Real-time messaging between users
2. **Notifications**: Instant notifications for various events
3. **Order Updates**: Real-time updates for cafeteria orders
4. **Emergency Alerts**: Immediate broadcasting of emergency information
5. **Bus Tracking**: Real-time location updates for campus buses

## AI Integration

The server integrates AI capabilities using Google's Generative AI and LangChain:

1. **AI Cafe Manager**: Intelligent food recommendation and management
2. **Chat Assistant**: AI-powered chat assistance for campus information
3. **Content Generation**: Automated content creation for events and clubs
4. **Data Analysis**: Intelligent analysis of usage patterns and trends

## Error Handling

The server implements a comprehensive error handling system:

1. **Centralized Error Middleware**: Consistent error responses
2. **Validation Errors**: Detailed validation error messages
3. **HTTP Status Codes**: Appropriate status codes for different errors
4. **Error Logging**: Detailed logging of errors for debugging
5. **Client-friendly Messages**: User-friendly error messages

## Security Features

The server implements various security features:

1. **Rate Limiting**: Protection against brute force attacks
2. **CORS Configuration**: Controlled cross-origin resource sharing
3. **Helmet**: HTTP header security
4. **Input Validation**: Thorough validation of all inputs
5. **Environment Variables**: Secure configuration management 
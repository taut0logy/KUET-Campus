# Comprehensive Project Analysis Prompt

I need Cursor to perform a complete analysis of my MIST Hackathon project to understand its full scope. Please analyze the following aspects of my project:

## 1. Project Structure and Tech Stack

### Client (Frontend)
- **Framework**: Next.js 13+ with App Router
- **UI**: React 18, Tailwind CSS, Shadcn/ui
- **State Management**: Zustand
- **Language**: JavaScript
- **Authentication**: JWT
- **Real-time**: Socket.io

### Server (Backend)
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT, Supabase
- **Real-time**: Socket.io, Redis
- **AI Integration**: Google Generative AI, LangChain

### Infrastructure
- **Containerization**: Docker
- **Environment**: Development and production configurations
- **Deployment**: Multi-container setup with separate services

## 2. Client Application Structure

Analyze the client directory structure focusing on:
- Next.js App Router organization with authenticated, auth, and guest route groups
- Component organization and reusability
- State management with Zustand stores
- Custom hooks for data fetching and state management
- UI components and design patterns
- Advanced features like AR navigation, AI agent, and real-time chat

Key modules to understand:
- Dashboard system
- Cafeteria and food ordering
- Club management
- Event system
- Campus map and navigation
- Emergency services
- Bus tracking system
- Chat functionality

## 3. Server Application Structure

Analyze the server directory structure focusing on:
- Express.js route organization
- Controller-Service-Repository pattern
- Authentication and authorization middleware
- Real-time communication with Socket.io
- Database schema and relationships with Prisma
- API endpoints and RESTful design
- Error handling and validation
- Security features and rate limiting

Key services to understand:
- User authentication and management
- Cafeteria and food ordering system
- Club and event management
- Real-time chat and notifications
- Emergency alert system
- Bus route tracking
- AI-powered features

## 4. Database Schema

Analyze the Prisma schema to understand:
- Entity relationships and cardinality
- Data models for users, clubs, events, cafeteria, etc.
- Enums and custom types
- Indexes and performance considerations
- Role-based access control implementation

## 5. Integration Points

Identify how different parts of the system work together:
- Client-server communication patterns
- Authentication flow between frontend and backend
- Real-time data synchronization
- File storage and retrieval
- AI service integration

## 6. Advanced Features

Understand the implementation of advanced features:
- AR navigation and campus mapping
- AI-powered chat and recommendations
- Real-time messaging and notifications
- QR code scanning and generation
- Food and object recognition
- Emergency alert system
- Data visualization and analytics

## 7. Development Workflow

Analyze the development workflow:
- Package management and dependencies
- Build and deployment process
- Environment configuration
- Docker containerization
- Testing approach

## 8. Documentation

Review existing documentation:
- README.md for project overview
- client-app-overview.md for frontend details
- server-app-overview.md for backend details
- Code comments and inline documentation

Please provide a comprehensive analysis of each of these aspects, including specific file paths and code snippets where relevant. This will help me understand the full context of the project when working with you on future tasks. 
# MentorConnect - Mentor-Student Platform

## Overview

MentorConnect is a comprehensive web application that connects students with mentors for educational guidance and support. The platform features user authentication, mentor discovery, session scheduling, and project management through a Kanban board interface. Built with modern web technologies, it provides a seamless experience for both mentors and students to collaborate and learn.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server for fast hot module replacement
- **Wouter** for lightweight client-side routing without React Router overhead
- **TailwindCSS** for utility-first styling with custom design system variables
- **Shadcn/ui** component library built on Radix UI primitives for accessible, customizable components
- **TanStack Query (React Query)** for server state management, caching, and API synchronization

### Backend Architecture
- **Express.js** server with TypeScript for REST API endpoints
- **In-memory storage** pattern with interface abstraction for easy database migration
- RESTful API design with structured error handling and request logging middleware
- Session-based architecture prepared for authentication token management

### Data Layer
- **Drizzle ORM** configured for PostgreSQL with type-safe database operations
- **Zod** schemas for runtime validation and type inference across client-server boundary
- Database schema includes users (mentors/students), sessions, and kanban items with proper relationships
- Migration system ready for production database deployment

### Authentication System
- JWT-ready authentication flow with user registration and login
- Role-based access control distinguishing between mentors and students
- Client-side auth state management with localStorage persistence
- Protected route components that redirect unauthorized users

### Component Architecture
- Modular page components for dashboard, mentors listing, scheduling, and kanban board
- Reusable UI components following atomic design principles
- Form handling with React Hook Form and Zod validation
- Toast notifications and loading states for enhanced user experience

### Development Environment
- TypeScript configuration with path mapping for clean imports
- ESBuild for production bundling with Node.js server compilation
- Hot reloading in development with production-ready build process
- Replit-specific plugins for enhanced development experience

## External Dependencies

### Database
- **Neon Database** (@neondatabase/serverless) for PostgreSQL hosting
- **Drizzle Kit** for database migrations and schema management
- **connect-pg-simple** for PostgreSQL session storage (configured but not actively used)

### UI and Styling
- **Radix UI** component primitives for accessibility-compliant interactive elements
- **Tailwind CSS** with PostCSS for utility-first styling approach
- **Lucide React** for consistent iconography throughout the application
- **Embla Carousel** for interactive carousel components

### Form Management
- **React Hook Form** for performant form handling with minimal re-renders
- **@hookform/resolvers** for Zod schema integration with form validation

### Utilities
- **clsx** and **tailwind-merge** for conditional CSS class management
- **class-variance-authority** for component variant styling patterns
- **date-fns** for date manipulation and formatting
- **cmdk** for command palette functionality

### Development Tools
- **Vite plugins** for runtime error overlays and development banners in Replit environment
- **Replit-specific tooling** for enhanced development workflow and debugging
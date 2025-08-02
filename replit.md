# Overview

This is a modern mobile calendar and planner application built for the Russian market, inspired by the InCharge App design aesthetic. The application combines goal setting, daily planning, calendar management, and wellbeing tracking in a single unified interface. It features a warm, minimalist design with beige and brown color tones, focusing on personal productivity and self-development.

The app includes four main screens: Goal Setter (task management with work/personal categories), Wellbeing Tracker (water intake, sleep tracking, mood logging), Daily Planner (today's events and schedule), and Calendar View (monthly calendar with event management). All content is localized for Russian users with appropriate date formats and language.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component development
- **Routing**: Wouter for lightweight client-side routing between the four main screens
- **State Management**: React hooks with custom localStorage hook for persistent data storage
- **UI Framework**: Radix UI components with shadcn/ui for accessible, customizable components
- **Styling**: Tailwind CSS with custom InCharge-inspired color scheme (warm beiges and browns)
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Server**: Express.js with TypeScript for API endpoints (minimal backend, primarily serving the SPA)
- **Data Validation**: Zod schemas for type-safe data validation across client and server
- **Development**: Hot module replacement and development middleware through Vite integration

## Data Storage Solutions
- **Primary Storage**: Browser localStorage for client-side data persistence
- **Database Ready**: Drizzle ORM configured with PostgreSQL schema definitions
- **Memory Storage**: In-memory storage implementation for development/testing
- **Data Models**: Tasks, Events, and WellbeingData with proper TypeScript interfaces

## Design System
- **Component Library**: shadcn/ui components built on Radix UI primitives
- **Color Scheme**: Custom CSS variables following InCharge aesthetic with warm, muted tones
- **Typography**: Inter font family with responsive text scaling
- **Layout**: Mobile-first responsive design with 8px grid system
- **Iconography**: Lucide React icons with custom geometric shapes for navigation

## External Dependencies

- **UI Components**: @radix-ui/* packages for accessible component primitives
- **Data Fetching**: TanStack React Query for server state management (prepared for future API integration)
- **Form Handling**: React Hook Form with Hookform Resolvers for form validation
- **Date Utilities**: date-fns library with Russian locale for date formatting and manipulation
- **Database**: @neondatabase/serverless for PostgreSQL connectivity
- **ORM**: Drizzle ORM with drizzle-kit for database schema management and migrations
- **Styling**: Tailwind CSS with PostCSS for utility-first styling
- **Development**: Various Replit-specific plugins for development environment integration
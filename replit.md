# Tabster - Guitar Tablature Management System

## Overview

Tabster is a full-stack web application for creating, managing, and sharing guitar tablatures. Built with React, Express, and PostgreSQL, it provides a comprehensive platform for guitarists to organize their tabs, create playlists, and share their work with the community.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme variables for consistent branding
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling
- **Session Management**: Express sessions with PostgreSQL store
- **Authentication**: Replit's OpenID Connect (OIDC) integration
- **File Structure**: Modular organization with separate routing, storage, and database layers

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database queries
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Session Storage**: PostgreSQL-backed session store for authentication persistence

## Key Components

### Authentication and Authorization
- **Provider**: Replit OIDC authentication with Google sign-in
- **Session Management**: Server-side sessions with PostgreSQL persistence
- **Authorization**: Route-level protection with user context
- **User Management**: Automatic user creation and profile management

### Database Schema
- **Users Table**: Profile information and authentication data
- **Tabs Table**: Guitar tablature content with metadata (difficulty, genre, tuning)
- **Playlists Table**: User-created collections of tabs
- **Playlist Items Table**: Join table for playlist-tab relationships with ordering
- **Favorites Table**: User bookmark system for tabs
- **Sessions Table**: Authentication session persistence

### Core Features
- **Tab Creation/Editing**: Rich text editor for tablature content with metadata
- **Playlist Management**: Drag-and-drop reordering and collection management
- **Search and Discovery**: Full-text search across tabs with filtering
- **PDF Export**: Client-side PDF generation using jsPDF
- **Favorites System**: Bookmark and organize preferred tabs
- **Public/Private Sharing**: Visibility controls for tab sharing

## Data Flow

### Authentication Flow
1. User initiates login via Replit OIDC
2. Server validates credentials and creates session
3. User profile is created/updated in PostgreSQL
4. Subsequent requests authenticated via session cookies

### Tab Management Flow
1. User creates/edits tab content through React forms
2. Client validates data using Zod schemas
3. API request sent to Express server
4. Server validates ownership and persists to PostgreSQL
5. Client cache updated via TanStack Query

### Playlist Operations
1. User organizes tabs into playlists
2. Drag-and-drop interface updates order client-side
3. Order changes batched and sent to server
4. Database relationships updated atomically

## External Dependencies

### Core Infrastructure
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database queries and migrations
- **@tanstack/react-query**: Server state management and caching

### UI and Styling
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Authentication and Security
- **openid-client**: OIDC authentication handling
- **passport**: Authentication middleware
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety and developer experience
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with HMR
- **Database**: Direct connection to Neon PostgreSQL
- **Authentication**: Replit OIDC with development callback URLs

### Production Build
- **Frontend**: Vite production build with code splitting
- **Backend**: ESBuild compilation to single bundle
- **Static Assets**: Served directly by Express in production
- **Environment**: Node.js runtime with PostgreSQL connection

### Database Management
- **Schema Updates**: Drizzle Kit migrations
- **Connection Pooling**: Neon serverless connection management
- **Session Cleanup**: Automatic session expiration handling

## Changelog

- **July 06, 2025** - Initial Tabster setup with complete authentication, tab management, and PDF export functionality
- **July 06, 2025** - Fixed dark theme styling issues by properly configuring Tailwind custom color variables and session configuration for development environment
- **July 06, 2025** - Fixed navigation routing issues by creating My Tabs and My Playlists pages, fixing HTML nesting in sidebar links, and adding all missing routes to App.tsx
- **July 06, 2025** - Removed private vs public tabs concept - all tabs are now public and shareable. Updated database schema, UI components, and storage layer accordingly. Added 12 sample guitar tabs with realistic content for testing and demonstration.
- **July 06, 2025** - Removed "Browse" link from header navigation for cleaner UI. Users can browse tabs through dashboard sections (Popular, Recent, Top Rated).
- **July 06, 2025** - Removed sidebar navigation completely. Application now uses full-width layout with header-only navigation for cleaner, more modern interface.
- **July 06, 2025** - Added header navigation to My Tabs and My Playlists pages for consistent navigation across all pages.
- **July 06, 2025** - Created admin-only Settings panel with role-based access control. Added isAdmin field to user schema, moved "Export All" and "Create Tab" buttons from Dashboard to Settings page for admin users only.
- **July 06, 2025** - Implemented complete "Add to Playlist" functionality with dialog selection, proper error handling, and success notifications. Added standardized toast utilities (toastSuccess, toastError, toastUnauthorized) for consistent messaging across all pages with green success styling and error handling.
- **July 06, 2025** - Fixed favorite button race condition issues by preventing multiple concurrent mutations and adding proper loading state management. Updated all toast messages to use standardized utilities for consistent UI feedback.

## User Preferences

Preferred communication style: Simple, everyday language.
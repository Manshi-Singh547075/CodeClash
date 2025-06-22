# OmniDimension - AI Agent Orchestration Platform

## Overview

OmniDimension is a full-stack AI agent orchestration platform that transforms natural language instructions into coordinated agent actions. The system enables users to command specialized agents to perform tasks like making phone calls, scheduling meetings, and sending follow-up communications through simple natural language commands.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Real-time Communication**: WebSocket client for live updates

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **AI Integration**: OpenAI GPT-4o for natural language processing
- **Real-time**: WebSocket server for agent status updates

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` for type-safe database definitions
- **Session Storage**: PostgreSQL-backed session store for authentication
- **Tables**:
  - `users` - User profiles from Replit Auth
  - `agents` - Agent definitions and status
  - `tasks` - User instructions and processing results
  - `sessions` - Authentication session storage

## Key Components

### Natural Language Processing Service
- **Purpose**: Processes user instructions into structured agent tasks
- **Implementation**: OpenAI GPT-4o integration for intent parsing
- **Output**: Structured task definitions with execution order and dependencies

### Agent Management System
- **Agent Types**: Communication (phone calls), Booking (scheduling), Follow-up (emails)
- **Status Tracking**: Real-time agent status (idle, active, busy, error)
- **Task Assignment**: Dynamic assignment based on agent type and availability
- **Performance Metrics**: Success rates and activity statistics

### Real-time Orchestration
- **WebSocket Server**: Live updates for agent status and task progress
- **Event Broadcasting**: Real-time notifications to connected clients
- **Connection Management**: Automatic cleanup and reconnection handling

### Authentication & Security
- **Provider**: Replit Auth with OIDC
- **Session Management**: PostgreSQL-backed session storage
- **Authorization**: Route-level authentication middleware
- **CSRF Protection**: Session-based security measures

## Data Flow

1. **User Input**: Natural language instruction submitted through command interface
2. **NLP Processing**: OpenAI API parses instruction into structured tasks
3. **Task Creation**: Main task record created with sub-tasks for agents
4. **Agent Assignment**: Tasks distributed to available agents by type
5. **Execution**: Agents process assigned tasks and report status
6. **Real-time Updates**: WebSocket broadcasts progress to connected clients
7. **Activity Logging**: All actions logged for audit and user feedback

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL for data persistence
- **AI Service**: OpenAI API for natural language processing
- **Authentication**: Replit Auth service for user management
- **UI Components**: Radix UI and Shadcn/ui for interface elements

### Development Dependencies
- **Build Tool**: Vite for frontend bundling and development
- **TypeScript**: Full type safety across frontend and backend
- **ESBuild**: Backend bundling for production deployment
- **Tailwind CSS**: Utility-first styling framework

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev`
- **Server**: TSX for TypeScript execution with hot reload
- **Frontend**: Vite dev server with HMR
- **Database**: Automatic migration with Drizzle Kit

### Production Build
- **Frontend**: Vite build to `dist/public`
- **Backend**: ESBuild bundle to `dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Process Manager**: Single Node.js process for simplicity

### Platform Configuration
- **Target**: Replit Autoscale deployment
- **Port**: 5000 (mapped to external port 80)
- **Database**: Neon PostgreSQL with connection pooling
- **Environment**: Production optimizations enabled

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 22, 2025. Initial setup
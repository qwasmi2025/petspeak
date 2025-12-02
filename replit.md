# PetSpeak - Animal Sound Recognition Application

## Production Domain
**Live URL:** https://pettokai.com

## Overview

PetSpeak is a mobile-first web application that uses AI to analyze and interpret animal vocalizations. Users can record their pet's sounds, receive instant AI-powered analysis of what their pet might be communicating. The application features a futuristic AI-style interface with animated green dots background, glassmorphism cards, and dark theme.

**Core Functionality:**
- Record pet vocalizations via browser microphone
- AI-powered sound analysis using OpenAI's GPT-4o API
- Visual feedback with waveform visualization during recording
- Detailed results including detected needs, confidence scores, and actionable tips
- Multi-language support for translations (10 languages)
- No authentication required - free unlimited use

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing (SPA architecture)

**State Management:**
- TanStack Query (React Query) for server state management, caching, and data fetching
- React Context API for global state (authentication, theme)
- Local component state with React hooks for UI interactions

**UI Component System:**
- Shadcn/ui component library (Radix UI primitives) for accessible, customizable components
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theming (light/dark mode support)
- Mobile-first responsive design with breakpoints at 768px

**Design System:**
- Primary font: Inter (body text, UI elements)
- Accent font: Outfit (headings, pet-related content)
- Spacing scale: Tailwind's 2, 4, 8, 12, 16 unit system
- Color system: Dark theme with green accent colors
- Animated background: Floating green dots with connecting lines (AI-style)
- Glassmorphism: Semi-transparent cards with backdrop blur
- Custom animations for recording states and transitions

**Audio Handling:**
- Browser MediaRecorder API for audio capture
- Web Audio API (AudioContext, AnalyserNode) for real-time waveform visualization
- Base64 encoding for audio data transmission to backend
- Custom hook (`useAudioRecorder`) encapsulates all audio recording logic

### Backend Architecture

**Server Framework:**
- Express.js as the HTTP server framework
- TypeScript for type safety across server code
- HTTP server creation for WebSocket support readiness

**API Design:**
- RESTful endpoints under `/api` namespace
- JSON request/response format
- Multer middleware for handling multipart form data (audio uploads)
- Custom request logging middleware with timestamp formatting

**Authentication & Sessions:**
- Firebase Authentication for user management
- User ID passed via `x-user-id` header for API authentication
- Firestore for user profile storage
- Session-based approach with Firebase tokens

**Data Layer:**
- Abstract storage interface (`IStorage`) for flexibility
- In-memory storage implementation (`MemStorage`) as default
- Designed for easy migration to database (Drizzle ORM ready)
- Schema definitions in shared directory for type consistency

**File Structure:**
- `/server` - Backend logic and API routes
- `/client` - Frontend React application
- `/shared` - Shared TypeScript schemas and types (used by both frontend and backend)

### External Dependencies

**AI & Machine Learning:**
- OpenAI API (GPT-4o model) for audio transcription and behavioral analysis
- Custom prompts tailored for different animal types (dogs, cats, birds, etc.)
- Audio analysis returns: transcription, detected need, confidence score, and care tips
- Multi-language translation support (English, Arabic, Chinese, Spanish, French, German, Japanese, Korean, Portuguese, Russian)

**Authentication & Database:**
- Firebase Authentication with Google Sign-in only
- Firebase Firestore for user profile and credits storage
- Credits system: 100 credits per new user, 1 credit per analysis

**Frontend Libraries:**
- Radix UI primitives (@radix-ui/*) for accessible component foundations
- React Hook Form with Zod validation for type-safe form handling
- Date-fns for date formatting and manipulation
- Recharts for admin dashboard data visualization
- Lucide React for consistent iconography

**Development & Build:**
- Drizzle ORM and Drizzle Kit configured for PostgreSQL (via @neondatabase/serverless)
- ESBuild for server bundling in production
- PostCSS with Tailwind CSS for styling pipeline
- TypeScript compiler for type checking

**Deployment Considerations:**
- Separate build processes for client (Vite) and server (ESBuild)
- Static file serving in production mode
- Environment variables required: `OPENAI_API_KEY`, `DATABASE_URL` (for future use)
- Firebase credentials embedded in client configuration

**Key Design Decisions:**
1. **Shared Schema**: Zod schemas in `/shared` directory ensure type consistency between frontend and backend
2. **Storage Abstraction**: Interface-based storage allows easy transition from in-memory to database persistence
3. **Firebase Integration**: Chosen for rapid authentication implementation and real-time capabilities
4. **Mobile-First**: All UI decisions prioritize mobile experience with progressive enhancement for desktop
5. **AI-Powered Analysis**: OpenAI integration provides sophisticated pet behavior interpretation with animal-specific prompting
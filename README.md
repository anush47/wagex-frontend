# WageX Frontend

Minimal Next.js frontend with Supabase authentication and NestJS backend integration.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Supabase** - Authentication
- **TanStack React Query** - Data fetching and caching
- **Zustand** - State management
- **Zod** - Runtime type validation
- **Tailwind CSS** - Styling
- **Bun** - Package manager

## Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/             # React components
│   └── auth/              # Authentication components
├── hooks/                  # Custom React hooks
├── lib/                    # Core libraries and utilities
│   ├── api/               # API client
│   ├── config/            # Configuration
│   ├── supabase/          # Supabase client
│   └── utils/             # Utility functions
├── providers/              # React context providers
├── services/               # Business logic services
├── stores/                 # Zustand stores
└── types/                  # TypeScript type definitions
    ├── api/               # API types
    ├── auth/              # Auth types
    └── database/          # Database types
```

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment Variables

Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3000/api/v1
```

### 3. Run Development Server

```bash
bun run dev
```

The app will be available at `http://localhost:3000`

## Features

### Authentication
- Supabase email/password authentication
- Zustand store for auth state management
- Automatic session persistence
- Token display for testing

### API Integration
- Centralized HTTP client with interceptors
- Automatic auth token injection
- Type-safe API calls with Zod validation
- React Query for data fetching and caching

### Type Safety
- Full TypeScript coverage
- Zod schemas for runtime validation
- Organized type definitions by domain

## Usage

### Login
1. Create a user in your Supabase project dashboard
2. Enter credentials in the login form
3. View the authentication tokens after successful login

### Backend Integration
The app is configured to work with a NestJS backend running at `http://localhost:3000/api/v1`.

Example backend registration endpoint:
```bash
curl -X 'POST' \
  'http://localhost:3000/api/v1/auth/register' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "nameWithInitials": "J. Doe",
  "fullName": "John Doe",
  "address": "123 Main St, Springfield",
  "phone": "+1 555 123 4567",
  "role": "EMPLOYER"
}'
```

### Using the Registration Hook

```typescript
import { useRegisterUser } from '@/hooks/useRegisterUser';
import { UserRole } from '@/types/api';

function MyComponent() {
  const { mutate: registerUser, isPending } = useRegisterUser();

  const handleRegister = () => {
    registerUser({
      nameWithInitials: "J. Doe",
      fullName: "John Doe",
      address: "123 Main St",
      phone: "+1234567890",
      role: UserRole.EMPLOYER,
    });
  };

  return <button onClick={handleRegister}>Register</button>;
}
```

## Architecture Principles

### Single Responsibility
- Each service handles one domain (auth, user, etc.)
- Components focus on presentation
- Hooks encapsulate reusable logic

### Loose Coupling
- Services don't depend on UI components
- API client is separate from business logic
- State management is decoupled from data fetching

### Type Safety
- Zod schemas validate data at runtime
- TypeScript ensures compile-time safety
- Organized types by domain for maintainability

## Development Tools

- **React Query Devtools** - Inspect queries and mutations
- **Zustand Devtools** - Debug state changes
- **TypeScript** - Catch errors at compile time
- **Zod** - Runtime validation

## Scripts

```bash
# Development
bun run dev

# Build
bun run build

# Start production server
bun run start

# Lint
bun run lint
```

## Next Steps

1. Fill in your Supabase credentials in `.env.local`
2. Ensure your NestJS backend is running on `http://localhost:3000`
3. Create a test user in Supabase dashboard
4. Run `bun run dev` and test the login flow
5. Check the console and React Query devtools for debugging

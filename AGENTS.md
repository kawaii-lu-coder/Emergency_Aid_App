# Campus First Aid Interactive Learning Platform - Agent Guide

## Project Overview

This is a **Campus First Aid Interactive Learning Platform** - a Next.js-based web application designed for primary, middle, and high school students to learn first-aid knowledge through interactive lessons, quizzes, and branching scenarios.

The project uses a **shared stage-aware architecture** where a single application adapts content, tone, and complexity for three educational stages (primary, middle, high) rather than maintaining separate apps.

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15.3+ (App Router) |
| Language | TypeScript 5.8+ |
| Styling | Tailwind CSS 3.4+ |
| UI Design | Apple Design System |
| Database | Supabase (PostgreSQL + Auth) |
| State Management | XState 5.18+ |
| Charts | ECharts 5.6+ |

## Project Structure

```
Emergency_Aid_App/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Homepage with stage selection
│   ├── layout.tsx                # Root layout with auth initialization
│   ├── template.tsx              # Page transition wrapper
│   ├── globals.css               # Global styles & CSS variables
│   ├── admin/                    # Admin dashboard
│   ├── api/                      # API routes
│   │   ├── admin/users/          # User management
│   │   ├── classes/              # Class management
│   │   ├── lesson-complete/      # Lesson completion tracking
│   │   ├── profile/stage/        # Stage assignment
│   │   ├── quiz-attempt/         # Quiz submission
│   │   └── scenario-attempt/     # Scenario tracking
│   ├── auth/callback/            # OAuth callback handler
│   ├── lesson/[lessonSlug]/      # Lesson viewer
│   ├── login/                    # Login page
│   ├── profile/                  # User profile
│   ├── quiz/[quizSlug]/          # Quiz interface
│   ├── register/                 # Registration page
│   ├── results/[stage]/          # Results/feedback page
│   ├── scenario/[scenarioSlug]/  # Branching scenario
│   ├── stage/                    # Stage selection & stage pages
│   │   ├── select/               # Stage selector for students
│   │   └── [stage]/              # Stage dashboard
│   └── teacher/                  # Teacher dashboard
│       ├── classes/              # Class management
│       └── students/             # Student progress
├── components/                   # React components
│   ├── ui/                       # UI primitives
│   ├── admin/                    # Admin components
│   ├── auth/                     # Auth components
│   ├── profile/                  # Profile components
│   ├── stage/                    # Stage components
│   ├── teacher/                  # Teacher components
│   ├── AppShell.tsx              # Main app shell with nav
│   ├── LessonView.tsx            # Lesson content renderer
│   ├── QuizView.tsx              # Quiz interface
│   ├── ResultsView.tsx           # Results display
│   ├── ScenarioView.tsx          # Scenario player
│   ├── SectionCard.tsx           # Card container
│   └── StageCard.tsx             # Stage preview card
├── lib/                          # Shared libraries
│   ├── auth/                     # Authentication utilities
│   │   └── roles.ts              # Role-based access control
│   ├── content/                  # Content definitions
│   │   ├── stages.ts             # Stage content registry
│   │   └── stage-data/           # Stage-specific content
│   │       ├── primary.ts        # Primary school content
│   │       ├── middle.ts         # Middle school content
│   │       └── high.ts           # High school content
│   ├── hooks/                    # Custom React hooks
│   ├── state/                    # State machines
│   │   └── scenarioMachine.ts    # XState scenario engine
│   ├── types/                    # TypeScript types
│   │   └── content.ts            # Content type definitions
│   ├── utils/                    # Utility functions
│   ├── supabase.ts               # Client-side Supabase
│   └── supabase-server.ts        # Server-side Supabase
├── supabase/                     # Database migrations
│   └── migrations/
│       ├── 001_identity_system.sql
│       ├── 002_fix_rls_recursion.sql
│       └── 003_fix_classes_rls.sql
├── middleware.ts                 # Route protection & redirects
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## Build and Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Type checking
npm run typecheck
```

## Runtime Modes

### Demo Mode (Default)
The application can run without Supabase credentials. In this mode:
- Authentication is bypassed
- Content is served from local data files
- Analytics use seeded demo data

### Supabase Mode
When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured:
- Full authentication flow is enabled
- User data persists to database
- Teacher/admin dashboards show real data

## Key Routes

| Route | Purpose | Access |
|-------|---------|--------|
| `/` | Homepage with stage cards | Public |
| `/login` | User login | Public |
| `/register` | User registration | Public |
| `/stage/select` | Stage selection (students) | Students only |
| `/stage/[primary\|middle\|high]` | Stage dashboard | Assigned stage only |
| `/lesson/[lessonSlug]` | Lesson content | By stage access |
| `/quiz/[quizSlug]` | Quiz interface | By stage access |
| `/scenario/[scenarioSlug]` | Branching scenario | By stage access |
| `/results/[stage]` | Results/feedback | By stage access |
| `/teacher` | Teacher dashboard | Teachers/Admin |
| `/teacher/classes` | Class management | Teachers/Admin |
| `/teacher/students` | Student progress | Teachers/Admin |
| `/admin` | Admin dashboard | Admin only |
| `/profile` | User profile | Authenticated |

## Content Model

### Stage Key
```typescript
type StageKey = 'primary' | 'middle' | 'high';
```

### Content Types
Each stage contains:
- **Lesson**: Educational content with sections and objectives
- **Quiz**: Multiple-choice questions with explanations
- **Scenario**: Branching narrative with XState state machine
- **Results**: Feedback copy and awareness bands

See `lib/types/content.ts` for complete type definitions.

## Authentication & Authorization

### User Roles
- `student`: Can access assigned stage content only
- `teacher`: Can manage classes and view student progress
- `admin`: Full system access

### Middleware Protection (`middleware.ts`)
- JWT validation via Supabase
- Role-based route protection
- Stage content access control
- Redirect logic for authenticated users

### Row Level Security (RLS)
Database tables have RLS policies enforcing:
- Users can only access their own profiles
- Teachers can access their class students
- Students can only access their assigned stage

## Code Style Guidelines

### TypeScript
- Strict mode enabled
- Explicit return types on exported functions
- Interface over type for object definitions

### Naming Conventions
- Components: PascalCase (e.g., `LessonView.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useScrollPosition.ts`)
- Utilities: camelCase (e.g., `classNames.ts`)
- Types: PascalCase (e.g., `StageContent`)

### Styling
- Tailwind classes preferred
- Apple Design System color palette (`apple-*` prefix)
- CSS custom properties in `globals.css`
- Animation utilities with `animate-*` classes

### Import Patterns
```typescript
// Absolute imports with @ alias
import { StageCard } from '@/components/StageCard';
import { getStageContent } from '@/lib/content/stages';
```

## State Management

### XState Scenario Machine
The branching scenario uses XState for state management:
```typescript
const machine = createScenarioMachine(scenarioDefinition);
```

Machine features:
- Tracks current node and path history
- Calculates readiness score based on choices
- Supports reset functionality

## Database Schema

### Tables
- `profiles`: User profiles extending Supabase Auth
- `classes`: Class/grade definitions
- `class_students`: Many-to-many student-class relationships
- `learning_records`: Student progress tracking

### Key Relationships
- Profile 1:1 with auth.users
- Class N:M Students via class_students
- Student 1:N Learning records

## Environment Variables

```bash
# Supabase Configuration (optional for demo mode)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Security Considerations

1. **RLS Policies**: All database tables have Row Level Security
2. **Middleware Protection**: Routes protected at edge
3. **Role Validation**: Server-side role checks on sensitive operations
4. **Service Role**: Only used for admin operations, never exposed client-side
5. **Demo Mode**: Falls back gracefully without credentials

## Testing Strategy

Currently the project relies on:
- TypeScript strict type checking
- ESLint for code quality
- Manual testing through the UI

## Deployment Notes

1. Build command: `npm run build`
2. Output: Static + Server-side rendering
3. Requires Node.js 18+
4. For production Supabase mode, set environment variables
5. Demo mode works without any database configuration

## Common Tasks

### Adding New Stage Content
1. Edit the corresponding file in `lib/content/stage-data/`
2. Update types in `lib/types/content.ts` if needed
3. Test through the stage route

### Adding New API Routes
1. Create route handler in `app/api/[route]/route.ts`
2. Follow existing pattern with proper error handling
3. Add role checks if needed

### Modifying Database Schema
1. Create new migration in `supabase/migrations/`
2. Apply via Supabase CLI or dashboard
3. Update types and API routes accordingly

## Troubleshooting

### Build Errors
- Run `npm run typecheck` to catch TypeScript errors
- Check `next.config.ts` for experimental features

### Supabase Connection Issues
- Verify environment variables
- Check if in demo mode via console output
- Review RLS policies if data not accessible

### Styling Issues
- Tailwind content paths configured in `tailwind.config.ts`
- CSS variables defined in `globals.css`

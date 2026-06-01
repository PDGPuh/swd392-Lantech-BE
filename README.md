# LanTech Backend API

A comprehensive language learning platform backend built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## Features

- **Authentication**: JWT-based auth with refresh tokens, registration, login, password change
- **Placement Test**: Adaptive placement test to determine CEFR level (A1-C2)
- **Learning Paths**: Auto-generated learning paths based on user level
- **Lessons & Exercises**: Structured lessons with multiple exercise types (multiple choice, fill blank, reorder, matching, listening, speaking)
- **Vocabulary**: Personal vocabulary bank with search and filtering
- **Flashcards / SRS**: Spaced repetition system using SM-2 algorithm
- **Pronunciation**: Pronunciation assessment with scoring
- **AI Integration**: AI-powered grammar correction, conversation practice, vocabulary suggestions
- **Gamification**: XP system, streaks, badges, achievements
- **Leaderboard**: Weekly/monthly/all-time leaderboards
- **Dashboard**: Personal statistics and progress tracking
- **Admin**: User management and system analytics

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Cache**: Redis
- **Auth**: JWT (jsonwebtoken + bcrypt)
- **Validation**: Zod
- **Docs**: Swagger (swagger-jsdoc + swagger-ui-express)
- **Testing**: Jest + Supertest

## Prerequisites

- Node.js >= 18
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

## Quick Start

### 1. Clone and install

```bash
cd lantech-backend
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Start infrastructure (Docker)

```bash
docker-compose up -d
```

This starts PostgreSQL and Redis containers.

### 4. Set up database

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Run development server

```bash
npm run dev
```

Server starts at `http://localhost:3000`

## API Documentation

Swagger UI available at: `http://localhost:3000/api-docs`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run lint` | Lint code |
| `npm run format` | Format code with Prettier |

## Project Structure

```
lantech-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── src/
│   ├── config/                # App configuration
│   │   ├── env.ts
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   └── swagger.ts
│   ├── common/
│   │   ├── errors/            # Custom error classes
│   │   ├── middlewares/       # Auth, validation, error handling
│   │   ├── utils/             # Response helpers, pagination, string utils
│   │   └── types/             # Shared TypeScript types
│   ├── modules/
│   │   ├── auth/              # Authentication & authorization
│   │   ├── users/             # User profile management
│   │   ├── languages/         # Supported languages
│   │   ├── placement/         # Placement test
│   │   ├── learning-paths/    # Learning path generation
│   │   ├── lessons/           # Lesson management
│   │   ├── exercises/         # Exercise submission & grading
│   │   ├── vocabulary/        # Vocabulary bank
│   │   ├── flashcards/        # SRS flashcard reviews
│   │   ├── pronunciation/     # Pronunciation assessment
│   │   ├── ai/                # AI-powered features
│   │   ├── gamification/      # XP, streaks, badges
│   │   ├── leaderboard/       # Rankings
│   │   ├── dashboard/         # User statistics
│   │   └── admin/             # Admin panel
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── jest.config.ts
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/change-password` - Change password

### Users
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update profile
- `GET /api/users/:id` - Get user by ID (admin)

### Languages
- `GET /api/languages` - List all supported languages

### Placement Test
- `GET /api/placement/questions` - Get placement test questions
- `POST /api/placement/submit` - Submit placement test

### Learning Paths
- `GET /api/learning-paths` - Get user's learning path
- `POST /api/learning-paths/generate` - Generate learning path

### Lessons
- `GET /api/lessons` - List lessons
- `GET /api/lessons/:id` - Get lesson details

### Exercises
- `GET /api/exercises/lesson/:lessonId` - Get exercises for a lesson
- `POST /api/exercises/:id/submit` - Submit exercise answer
- `POST /api/exercises/lesson/:lessonId/complete` - Complete a lesson

### Vocabulary
- `GET /api/vocabulary` - Get user's vocabulary
- `POST /api/vocabulary` - Add vocabulary item
- `DELETE /api/vocabulary/:id` - Remove vocabulary item

### Flashcards
- `GET /api/flashcards/due` - Get due flashcard reviews
- `POST /api/flashcards/:id/review` - Submit flashcard review
- `GET /api/flashcards/stats` - Get SRS statistics

### Pronunciation
- `POST /api/pronunciation/assess` - Assess pronunciation
- `GET /api/pronunciation/history` - Get pronunciation history

### AI
- `POST /api/ai/grammar-check` - Check grammar
- `POST /api/ai/conversation` - AI conversation
- `POST /api/ai/vocabulary-suggest` - Vocabulary suggestions

### Gamification
- `GET /api/gamification/profile` - Get gamification profile
- `GET /api/gamification/badges` - Get earned badges

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard

### Dashboard
- `GET /api/dashboard/stats` - Get user statistics
- `GET /api/dashboard/activity` - Get activity history

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/analytics` - System analytics

## Default Seed Users

| Email | Password | Role |
|-------|----------|------|
| admin@lantech.local | Admin@123456 | ADMIN |
| user@lantech.local | User@123456 | USER |

## License

ISC
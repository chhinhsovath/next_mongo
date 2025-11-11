# HRMIS - Human Resources Management Information System

A comprehensive web-based HR management system for Sangapac Company built with Next.js, React, Ant Design, and MongoDB.

## Features

- **Employee Management**: Manage employee records, personal information, and organizational assignments
- **Leave Management**: Submit, track, and approve leave requests with balance tracking
- **Attendance Tracking**: Record check-in/check-out times with GPS location verification
- **Payroll Processing**: Calculate and manage employee compensation with detailed breakdowns
- **Performance Evaluation**: Conduct and track employee performance reviews
- **Organizational Structure**: Manage departments, positions, and reporting hierarchies
- **Reporting**: Generate comprehensive HR reports with export capabilities
- **Bilingual Support**: English and Khmer language support

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, Ant Design 5, TypeScript
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB Atlas with Mongoose 8
- **Authentication**: NextAuth.js 4 with JWT
- **State Management**: React Context API + SWR
- **Validation**: Zod
- **Date Handling**: Day.js with timezone support
- **Charts**: Recharts

## Quick Start

Get started in 5 minutes! See [QUICKSTART.md](QUICKSTART.md) for a step-by-step guide.

```bash
npm install              # Install dependencies
npm run seed            # Seed database with test data
npm run dev             # Start development server
```

Login with: `admin` / `Admin@123`

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (connection string provided)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Copy `.env.example` to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

4. Seed the database:

```bash
npm run seed
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Seeding

Before using the application, seed the database with initial data:

```bash
npm run seed
```

This will create:
- Admin user account (username: `admin`, password: `Admin@123`)
- Sample departments with Khmer names
- Sample positions with Khmer names
- Sample employees with Khmer names
- Leave types with Khmer names
- Initial leave balances

See [Database Seeding Guide](docs/database-seeding-guide.md) for detailed information.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run seed` - Seed database with initial data
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities and configurations
├── models/                # Mongoose models
├── services/              # Business logic
├── types/                 # TypeScript types
└── contexts/              # React contexts
```

## Configuration

### Naming Convention

All database fields and API parameters use `snake_case` naming convention.

### Timezone

- All dates stored in UTC
- Display in Asia/Phnom_Penh timezone (UTC+7)
- Work dates stored as YYYY-MM-DD strings in Cambodia timezone

### Authentication

- JWT-based session management
- 30-minute session timeout
- Role-based access control (admin, hr_manager, manager, employee)

## Development Guidelines

1. Follow the snake_case naming convention for all database fields
2. Use TypeScript for type safety
3. Implement proper error handling with consistent error responses
4. Validate all inputs on both client and server side
5. Use Zod schemas for validation
6. Follow the established directory structure
7. Write clean, maintainable code with proper comments

## License

Private - Sangapac Company

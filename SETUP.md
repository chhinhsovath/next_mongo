# HRMIS Project Setup Documentation

## Completed Setup Tasks

### 1. Dependencies Installed

#### Production Dependencies
- `antd@^5` - Ant Design UI component library
- `next-auth@^4` - Authentication for Next.js
- `zod` - Schema validation
- `swr` - Data fetching and caching
- `dayjs` - Date manipulation with timezone support
- `recharts` - Charting library
- `bcryptjs` - Password hashing
- `mongoose@^8` - MongoDB ODM (already installed)

#### Development Dependencies
- `@types/bcryptjs` - TypeScript types for bcryptjs
- `prettier` - Code formatter
- `eslint-config-prettier` - ESLint config for Prettier

### 2. Environment Variables

Created `.env.local` with:
- MongoDB connection string (provided)
- Database name: `sangapac_hrmis`
- NextAuth configuration
- Timezone: Asia/Phnom_Penh

Created `.env.example` as template for deployment.

### 3. Configuration Files

#### Prettier Configuration (`.prettierrc`)
- Semi-colons enabled
- Single quotes
- 100 character line width
- 2 space indentation
- ES5 trailing commas

#### ESLint Configuration (`eslint.config.mjs`)
- Extended with Prettier config
- Next.js TypeScript rules
- Proper ignore patterns

#### TypeScript Configuration (`tsconfig.json`)
- Already configured with path aliases (@/*)
- Strict mode enabled

### 4. Directory Structure

Created complete directory structure as per design document:

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── employees/
│   │   ├── leave/
│   │   ├── attendance/
│   │   ├── payroll/
│   │   ├── performance/
│   │   ├── organization/
│   │   └── reports/
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── employees/
│       ├── leave/
│       ├── attendance/
│       ├── payroll/
│       ├── performance/
│       ├── departments/
│       ├── positions/
│       └── reports/
├── components/
│   ├── layout/
│   ├── employees/
│   ├── leave/
│   ├── attendance/
│   ├── payroll/
│   ├── performance/
│   ├── reports/
│   └── common/
├── lib/
├── models/
├── services/
├── types/
└── contexts/
```

### 5. Core Library Files

#### `lib/mongodb.ts`
- MongoDB connection with connection pooling
- Configured for `sangapac_hrmis` database
- Global caching for development hot reloads

#### `src/lib/utils.ts`
- Timezone conversion utilities (UTC ↔ Cambodia time)
- Date formatting functions
- Work hours calculation
- ID generation
- Currency formatting
- Input validation and sanitization

#### `src/lib/i18n.ts`
- Bilingual support (English and Khmer)
- Translation functions
- Common UI translations

#### `src/lib/auth.ts`
- NextAuth configuration
- Credentials provider
- JWT strategy
- 30-minute session timeout
- Role-based authentication

#### `src/lib/constants.ts`
- Application-wide constants
- Status values
- ID prefixes
- Error codes
- Date formats

#### `src/lib/apiError.ts`
- Centralized error handling
- Consistent error response format
- Common error creators
- HTTP status code mapping

### 6. TypeScript Types

Created comprehensive type definitions:

#### `src/types/index.ts`
- Common enums and types
- API response interfaces
- Paginated response types

#### `src/types/employee.ts`
- Employee interface
- Create/Update input types

#### `src/types/leave.ts`
- Leave request interface
- Leave type interface
- Input types for leave operations

#### `src/types/attendance.ts`
- Attendance interface
- Check-in/Check-out input types

#### `src/types/payroll.ts`
- Payroll interface
- Payroll input types

#### `src/types/next-auth.d.ts`
- NextAuth type extensions
- Custom user and session types

### 7. Models

#### `src/models/User.ts`
- User schema with snake_case fields
- Mongoose model with proper typing
- Indexes on key fields
- Timestamps support

### 8. Contexts

#### `src/contexts/AuthContext.tsx`
- React context for authentication state
- useAuth hook for consuming auth state
- Integration with NextAuth session

### 9. Middleware

#### `src/middleware.ts`
- Route protection for dashboard routes
- NextAuth integration
- Automatic redirect to login for unauthenticated users

### 10. Naming Convention

All database fields and API parameters configured to use **snake_case**:
- `employee_id` instead of `employeeId`
- `first_name` instead of `firstName`
- `created_at` instead of `createdAt`

### 11. Timezone Configuration

- Storage: All dates in UTC
- Display: Asia/Phnom_Penh (UTC+7)
- Work dates: YYYY-MM-DD strings in Cambodia timezone
- Day.js configured with timezone plugin

### 12. Bilingual Support

- English (default)
- Khmer (ភាសាខ្មែរ)
- Translation structure in place
- Database fields support both languages (e.g., `first_name_khmer`)

## Database Seeding

After completing all implementation tasks, seed the database with initial data:

```bash
npm run seed
```

This creates:
- **Admin user**: username `admin`, password `Admin@123`
- **5 Departments**: HR, IT, Finance, Operations, Sales & Marketing (with Khmer names)
- **14 Positions**: Various positions across departments (with Khmer names)
- **10 Employees**: Sample employees with complete information (with Khmer names)
- **10 User accounts**: One for each employee with role-based access
- **7 Leave types**: Annual, Sick, Personal, Maternity, Paternity, Unpaid, Compassionate (with Khmer names)
- **70 Leave balances**: Initial balances for all employees

See [Database Seeding Guide](docs/database-seeding-guide.md) for detailed information.

## Next Steps

The project foundation is now complete. You can proceed with:

1. **Task 2**: Implement database connection and core models ✅
2. **Task 3**: Set up authentication system ✅
3. **Task 4**: Build dashboard layout and navigation ✅
4. **Continue with remaining tasks** as per the implementation plan
5. **Seed the database** when ready to test the complete system

## Scripts Available

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run seed` - Seed database with initial data
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage

## Important Notes

1. **Environment Variables**: Ensure `.env.local` is never committed to version control
2. **NextAuth Secret**: Generate a secure secret for production using: `openssl rand -base64 32`
3. **MongoDB Connection**: Connection string is configured and ready to use
4. **TypeScript**: All files use strict TypeScript for type safety
5. **Code Style**: Use Prettier for consistent formatting across the codebase

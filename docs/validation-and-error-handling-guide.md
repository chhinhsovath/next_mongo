# Validation and Error Handling Guide

## Overview

The HRMIS system implements a comprehensive validation and error handling system that ensures data integrity, provides user-friendly error messages in both English and Khmer, and maintains consistent error responses across all API endpoints.

## Table of Contents

1. [Validation System](#validation-system)
2. [Error Handling](#error-handling)
3. [API Error Responses](#api-error-responses)
4. [Client-Side Error Handling](#client-side-error-handling)
5. [Logging](#logging)
6. [Best Practices](#best-practices)

## Validation System

### Zod Schemas

All data validation is performed using Zod schemas. Schemas are organized by domain:

- **commonSchemas.ts** - Reusable validation patterns (pagination, date ranges, GPS coordinates)
- **employeeSchemas.ts** - Employee-related validations
- **leaveSchemas.ts** - Leave request validations
- **attendanceSchemas.ts** - Attendance tracking validations
- **payrollSchemas.ts** - Payroll processing validations
- **performanceSchemas.ts** - Performance evaluation validations
- **departmentSchemas.ts** - Department management validations
- **positionSchemas.ts** - Position management validations
- **userSchemas.ts** - User authentication validations
- **reportSchemas.ts** - Report generation validations

### Using Validation in API Routes

```typescript
import { NextRequest } from 'next/server';
import { withApiHandler, createSuccessResponse } from '@/lib/apiMiddleware';
import { parseAndValidateBody, validateQuery } from '@/lib/validation/middleware';
import { createEmployeeSchema } from '@/lib/validation/employeeSchemas';

export const POST = withApiHandler(async (request: NextRequest) => {
  // Validate request body
  const validatedData = await parseAndValidateBody(request, createEmployeeSchema);
  
  // Process validated data
  const employee = await createEmployee(validatedData);
  
  return createSuccessResponse({ employee }, 'Employee created successfully', 201);
});

export const GET = withApiHandler(async (request: NextRequest) => {
  // Validate query parameters
  const queryParams = await validateQuery(employeeQuerySchema, request);
  
  // Use validated query params
  const employees = await getEmployees(queryParams);
  
  return createSuccessResponse({ employees });
});
```

### Common Validation Patterns

#### Pagination

```typescript
import { paginationSchema } from '@/lib/validation/commonSchemas';

const querySchema = z.object({
  search: z.string().optional(),
  ...paginationSchema.shape, // Adds page and limit
});
```

#### Date Ranges

```typescript
import { dateRangeSchema } from '@/lib/validation/commonSchemas';

const reportSchema = z.object({
  department_id: z.string().optional(),
  ...dateRangeSchema.shape, // Adds start_date and end_date with validation
});
```

#### GPS Coordinates

```typescript
import { optionalGpsCoordinatesSchema } from '@/lib/validation/commonSchemas';

const checkInSchema = z.object({
  employee_id: z.string(),
  check_in_time: z.date(),
  check_in_location_lat: z.number().min(-90).max(90).optional(),
  check_in_location_lng: z.number().min(-180).max(180).optional(),
});
```

### Custom Validation Rules

```typescript
const leaveRequestSchema = z.object({
  start_date: z.date(),
  end_date: z.date(),
  reason: z.string().min(1).max(500),
}).refine((data) => data.start_date <= data.end_date, {
  message: 'End date must be after or equal to start date',
  path: ['end_date'],
});
```

## Error Handling

### Error Types

The system handles several types of errors:

1. **Validation Errors** - Invalid input data (400)
2. **Authentication Errors** - Missing or invalid credentials (401)
3. **Authorization Errors** - Insufficient permissions (403)
4. **Not Found Errors** - Resource doesn't exist (404)
5. **Conflict Errors** - Duplicate resources (409)
6. **Database Errors** - Database operation failures (500)
7. **Server Errors** - Internal server errors (500)

### Error Codes

All errors include a standardized error code:

```typescript
export const ERROR_CODES = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',
  SERVER_ERROR: 'SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
};
```

### Creating Custom Errors

```typescript
import { apiErrors } from '@/lib/apiError';

// Throw a not found error
throw apiErrors.notFound('Employee');

// Throw a validation error with details
throw apiErrors.validation('Invalid employee data', {
  field: 'email',
  message: 'Email already exists',
});

// Throw a custom error
throw new ApiError('Custom error message', 400, 'CUSTOM_ERROR_CODE');
```

### Error Handler Middleware

All API routes should be wrapped with `withApiHandler`:

```typescript
import { withApiHandler } from '@/lib/apiMiddleware';

export const GET = withApiHandler(async (request: NextRequest) => {
  // Your route logic here
  // Errors are automatically caught and formatted
});
```

## API Error Responses

All error responses follow a consistent format:

```typescript
interface ApiErrorResponse {
  success: false;
  message: string;      // User-friendly message
  error: string;        // Technical error description
  details?: any;        // Additional error details (e.g., validation errors)
  code: string;         // Error code for client handling
}
```

### Example Error Responses

#### Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Invalid request data",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address",
      "code": "invalid_string"
    },
    {
      "field": "salary_amount",
      "message": "Salary must be positive",
      "code": "too_small"
    }
  ]
}
```

#### Not Found Error

```json
{
  "success": false,
  "message": "Employee not found",
  "error": "Employee not found",
  "code": "NOT_FOUND"
}
```

#### Conflict Error

```json
{
  "success": false,
  "message": "Email address already exists",
  "error": "Email address already exists",
  "code": "DUPLICATE_EMAIL"
}
```

## Client-Side Error Handling

### Using the useApiRequest Hook

```typescript
import { useApiRequest } from '@/hooks/useApiRequest';

function MyComponent() {
  const { loading, error, data, request } = useApiRequest();

  const handleSubmit = async (formData: any) => {
    const response = await request('/api/employees', {
      method: 'POST',
      body: formData,
      showSuccessMessage: true,
      successMessage: 'Employee created successfully',
      showErrorMessage: true,
      language: 'en', // or 'km' for Khmer
    });

    if (response.success) {
      // Handle success
    }
  };

  return (
    <div>
      {loading && <Spin />}
      {error && <Alert type="error" message={error} />}
      {/* Your component UI */}
    </div>
  );
}
```

### Manual Error Handling

```typescript
import { showApiError, showSuccess } from '@/lib/notifications';

try {
  const response = await fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    showApiError(result.code, result.message, 'en');
    return;
  }

  showSuccess('Success', 'Employee created successfully');
} catch (error) {
  showApiError(undefined, 'Network error occurred', 'en');
}
```

### Error Boundaries

Wrap components with ErrorBoundary to catch React errors:

```typescript
import ErrorBoundary from '@/components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

## Bilingual Error Messages

All error messages support both English and Khmer:

```typescript
import { getErrorMessage } from '@/lib/errorMessages';

// Get English message
const englishMessage = getErrorMessage('EMPLOYEE_NOT_FOUND', 'en');
// Returns: "Employee not found"

// Get Khmer message
const khmerMessage = getErrorMessage('EMPLOYEE_NOT_FOUND', 'km');
// Returns: "រកមិនឃើញបុគ្គលិក"
```

### Adding New Error Messages

Edit `src/lib/errorMessages.ts`:

```typescript
export const ERROR_MESSAGES: Record<string, ErrorMessage> = {
  // ... existing messages
  NEW_ERROR_CODE: {
    en: 'English error message',
    km: 'Khmer error message',
  },
};
```

## Logging

### Logger Usage

```typescript
import { logger } from '@/lib/logger';

// Log info
logger.info('Operation completed', { userId: '123' });

// Log error
logger.error('Operation failed', error, { userId: '123' });

// Log API request
logger.apiRequest('POST', '/api/employees', { body: data });

// Log database operation
logger.dbOperation('insert', 'employees', { employeeId: '123' });

// Log validation error
logger.validationError('Invalid email', { field: 'email', value: 'invalid' });
```

### Automatic Logging

The `withApiHandler` middleware automatically logs:
- All incoming API requests
- API responses with status codes
- API errors with stack traces
- Request duration

## Best Practices

### 1. Always Validate Input

```typescript
// ✅ Good
const validatedData = await parseAndValidateBody(request, schema);
const employee = await createEmployee(validatedData);

// ❌ Bad
const data = await request.json();
const employee = await createEmployee(data); // No validation
```

### 2. Use Specific Error Codes

```typescript
// ✅ Good
throw apiErrors.notFound('Employee');
throw apiErrors.validation('Invalid email', { field: 'email' });

// ❌ Bad
throw new Error('Not found');
throw new Error('Invalid data');
```

### 3. Provide Detailed Validation Errors

```typescript
// ✅ Good
const schema = z.object({
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'Must be at least 18 years old'),
});

// ❌ Bad
const schema = z.object({
  email: z.string(),
  age: z.number(),
});
```

### 4. Handle Errors at the Right Level

```typescript
// ✅ Good - Let middleware handle errors
export const POST = withApiHandler(async (request) => {
  const data = await parseAndValidateBody(request, schema);
  return createSuccessResponse(data);
});

// ❌ Bad - Manual error handling
export const POST = async (request) => {
  try {
    const data = await request.json();
    // ... logic
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
};
```

### 5. Use Retry Logic for Network Requests

```typescript
// ✅ Good - useApiRequest has built-in retry
const { request } = useApiRequest();
await request('/api/employees', {
  method: 'POST',
  body: data,
  retries: 2,
  retryDelay: 1000,
});

// ❌ Bad - No retry logic
await fetch('/api/employees', {
  method: 'POST',
  body: JSON.stringify(data),
});
```

### 6. Sanitize Errors in Production

```typescript
// ✅ Good - Errors are automatically sanitized
export const GET = withApiHandler(async (request) => {
  // Errors are sanitized based on NODE_ENV
  throw new Error('Internal error with sensitive data');
});

// In production: Generic error message
// In development: Full error details
```

### 7. Log All Errors

```typescript
// ✅ Good - Automatic logging with withApiHandler
export const POST = withApiHandler(async (request) => {
  // Errors are automatically logged
});

// ✅ Also good - Manual logging when needed
try {
  await riskyOperation();
} catch (error) {
  logger.error('Risky operation failed', error, { context: 'data' });
  throw error;
}
```

### 8. Use Type-Safe Schemas

```typescript
// ✅ Good - Export and use types
export const createEmployeeSchema = z.object({
  first_name: z.string(),
  email: z.string().email(),
});

export type CreateEmployeeSchema = z.infer<typeof createEmployeeSchema>;

// Use the type
function createEmployee(data: CreateEmployeeSchema) {
  // TypeScript knows the exact shape
}
```

## Testing Validation and Error Handling

### Testing Validation

```typescript
import { createEmployeeSchema } from '@/lib/validation/employeeSchemas';

describe('Employee Validation', () => {
  it('should validate correct employee data', () => {
    const validData = {
      employee_code: 'EMP001',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      // ... other required fields
    };

    const result = createEmployeeSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalidData = {
      // ... other fields
      email: 'invalid-email',
    };

    const result = createEmployeeSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email');
    }
  });
});
```

### Testing Error Handling

```typescript
import { handleApiError } from '@/lib/apiError';
import { apiErrors } from '@/lib/apiError';

describe('Error Handling', () => {
  it('should format validation errors correctly', () => {
    const error = apiErrors.validation('Invalid data', [
      { field: 'email', message: 'Invalid email' },
    ]);

    const response = handleApiError(error);
    const json = await response.json();

    expect(json.success).toBe(false);
    expect(json.code).toBe('VALIDATION_ERROR');
    expect(json.details).toHaveLength(1);
  });

  it('should handle not found errors', () => {
    const error = apiErrors.notFound('Employee');
    const response = handleApiError(error);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.code).toBe('NOT_FOUND');
  });
});
```

## Summary

The HRMIS validation and error handling system provides:

- ✅ Type-safe validation with Zod
- ✅ Consistent error response format
- ✅ Bilingual error messages (English and Khmer)
- ✅ Automatic error logging
- ✅ Client-side retry logic
- ✅ Error boundaries for React components
- ✅ Comprehensive error codes
- ✅ Production-safe error sanitization
- ✅ User-friendly error notifications

By following this guide, you can ensure robust data validation and error handling throughout the application.

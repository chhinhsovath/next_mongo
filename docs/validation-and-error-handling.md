# Validation and Error Handling Documentation

This document describes the comprehensive validation and error handling system implemented in the HRMIS application.

## Overview

The system provides:
- **Zod schemas** for all data models with snake_case field names
- **API middleware** for request validation and error handling
- **Consistent error response format** matching the specification
- **Error boundaries** in React components
- **User-friendly error messages** with Ant Design notifications
- **Retry logic** for failed API calls
- **Logging** for errors and API requests
- **Bilingual error messages** (English and Khmer)

## Validation Schemas

All validation schemas are located in `src/lib/validation/` and use Zod for type-safe validation.

### Available Schemas

- **employeeSchemas.ts** - Employee creation and updates
- **leaveSchemas.ts** - Leave requests and approvals
- **attendanceSchemas.ts** - Attendance check-in/check-out
- **payrollSchemas.ts** - Payroll generation and management
- **performanceSchemas.ts** - Performance evaluations
- **departmentSchemas.ts** - Department management
- **positionSchemas.ts** - Position management
- **userSchemas.ts** - User authentication and management

### Usage Example

```typescript
import { createEmployeeSchema } from '@/lib/validation/employeeSchemas';
import { parseAndValidateBody } from '@/lib/validation/middleware';

// In an API route
export const POST = withApiHandler(async (request: NextRequest) => {
  const validatedData = await parseAndValidateBody(request, createEmployeeSchema);
  // validatedData is now type-safe and validated
});
```

## API Error Handling

### Error Response Format

All API errors follow this consistent format:

```typescript
{
  success: false,
  message: string,      // Human-readable error description
  error: string,        // System error message
  details?: any,        // Additional error details (e.g., validation errors)
  code: string          // Error code (e.g., "VALIDATION_ERROR")
}
```

### Error Codes

Defined in `src/lib/constants.ts`:

- `AUTH_REQUIRED` (401) - Authentication required
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `VALIDATION_ERROR` (400) - Input validation failed
- `CONFLICT` (409) - Resource conflict
- `SERVER_ERROR` (500) - Internal server error
- `DATABASE_ERROR` (500) - Database operation failed

### Using API Middleware

Wrap your API route handlers with `withApiHandler` for automatic error handling and logging:

```typescript
import { withApiHandler, createSuccessResponse } from '@/lib/apiMiddleware';

export const GET = withApiHandler(async (request: NextRequest) => {
  // Your logic here
  const data = await fetchData();
  
  return createSuccessResponse(data, 'Success message');
});
```

### Creating API Errors

Use the `apiErrors` helper to create standardized errors:

```typescript
import { apiErrors } from '@/lib/apiError';

// Throw validation error
throw apiErrors.validation('Invalid input', { field: 'email', message: 'Invalid email' });

// Throw not found error
throw apiErrors.notFound('Employee');

// Throw unauthorized error
throw apiErrors.unauthorized();

// Throw forbidden error
throw apiErrors.forbidden();

// Throw conflict error
throw apiErrors.conflict('Email already exists');

// Throw database error
throw apiErrors.database('Failed to save record');
```

## Frontend Error Handling

### Error Boundary

The `ErrorBoundary` component catches React errors and displays a user-friendly fallback UI:

```typescript
import ErrorBoundary from '@/components/common/ErrorBoundary';

function MyComponent() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

The ErrorBoundary is already included in the root `Providers` component, so all pages are protected.

### API Request Hook

Use the `useApiRequest` hook for making API calls with automatic retry logic and error handling:

```typescript
import { useApiRequest } from '@/hooks/useApiRequest';

function MyComponent() {
  const { loading, error, data, request } = useApiRequest();

  const handleSubmit = async () => {
    const response = await request('/api/employees', {
      method: 'POST',
      body: formData,
      showSuccessMessage: true,
      successMessage: 'Employee created successfully',
      showErrorMessage: true,
      retries: 2,
      language: 'en', // or 'km' for Khmer
    });

    if (response.success) {
      // Handle success
    }
  };

  return (
    <div>
      {loading && <Spin />}
      {error && <Alert message={error} type="error" />}
      {/* Your UI */}
    </div>
  );
}
```

### Notifications

Use the notification utilities for displaying user-friendly messages:

```typescript
import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showApiError,
  showSuccessMessage,
  showErrorMessage,
} from '@/lib/notifications';

// Show success notification
showSuccess('Success', 'Employee created successfully');

// Show error notification
showError('Error', 'Failed to create employee');

// Show API error with localized message
showApiError('VALIDATION_ERROR', undefined, 'en');

// Show success toast message
showSuccessMessage('Saved!');

// Show error toast message
showErrorMessage('Failed to save');
```

## Bilingual Error Messages

Error messages are available in both English and Khmer. Use the `getErrorMessage` function:

```typescript
import { getErrorMessage } from '@/lib/errorMessages';

// Get English message
const messageEn = getErrorMessage('VALIDATION_ERROR', 'en');

// Get Khmer message
const messageKm = getErrorMessage('VALIDATION_ERROR', 'km');
```

### Available Error Messages

All error messages are defined in `src/lib/errorMessages.ts` with both English and Khmer translations:

- Authentication errors (AUTH_REQUIRED, INVALID_CREDENTIALS, etc.)
- Validation errors (VALIDATION_ERROR, REQUIRED_FIELD, etc.)
- Resource errors (NOT_FOUND, EMPLOYEE_NOT_FOUND, etc.)
- Conflict errors (DUPLICATE_EMAIL, LEAVE_OVERLAP, etc.)
- Business logic errors (INSUFFICIENT_LEAVE_BALANCE, etc.)
- Database errors (DATABASE_ERROR, CONNECTION_ERROR)
- Server errors (SERVER_ERROR, UNKNOWN_ERROR)
- Success messages (OPERATION_SUCCESS, CREATED_SUCCESS, etc.)

## Logging

The logging system provides structured logging for errors, API requests, and database operations.

### Using the Logger

```typescript
import { logger } from '@/lib/logger';

// Log info
logger.info('User logged in', { userId: '123' });

// Log error
logger.error('Failed to save employee', error, { employeeId: '456' });

// Log API request
logger.apiRequest('POST', '/api/employees', { body: data });

// Log API response
logger.apiResponse('POST', '/api/employees', 201, { duration: '150ms' });

// Log API error
logger.apiError('POST', '/api/employees', error, { body: data });

// Log database operation
logger.dbOperation('INSERT', 'employees', { employeeId: '789' });

// Log database error
logger.dbError('INSERT', 'employees', error, { employeeId: '789' });

// Log validation error
logger.validationError('Invalid email format', { field: 'email', value: 'invalid' });
```

### Convenience Functions

```typescript
import {
  logApiRequest,
  logApiResponse,
  logApiError,
  logDbOperation,
  logDbError,
  logValidationError,
} from '@/lib/logger';

// These are shortcuts to the logger methods
logApiRequest('GET', '/api/employees');
logApiResponse('GET', '/api/employees', 200);
logApiError('GET', '/api/employees', error);
```

## Validation Middleware

The validation middleware provides utilities for validating requests:

```typescript
import {
  validateRequest,
  validateQuery,
  parseAndValidateBody,
  validateParams,
} from '@/lib/validation/middleware';

// Validate request body
const validatedBody = await validateRequest(schema, data);

// Validate query parameters
const validatedQuery = await validateQuery(schema, request);

// Parse and validate JSON body
const validatedData = await parseAndValidateBody(request, schema);

// Validate route parameters
const validatedParams = await validateParams(schema, params);
```

## Best Practices

### 1. Always Use Validation Schemas

```typescript
// ✅ Good
const validatedData = await parseAndValidateBody(request, createEmployeeSchema);

// ❌ Bad
const body = await request.json(); // No validation
```

### 2. Use API Middleware Wrapper

```typescript
// ✅ Good
export const GET = withApiHandler(async (request) => {
  // Automatic error handling and logging
});

// ❌ Bad
export async function GET(request) {
  try {
    // Manual error handling
  } catch (error) {
    // Manual error response
  }
}
```

### 3. Use Standardized Response Creators

```typescript
// ✅ Good
return createSuccessResponse(data, 'Success message');
return createListResponse(items, total, page, limit);

// ❌ Bad
return NextResponse.json({ success: true, data }); // Inconsistent format
```

### 4. Show User-Friendly Error Messages

```typescript
// ✅ Good
showApiError(response.code, response.message, 'en');

// ❌ Bad
alert(error.message); // Not user-friendly
```

### 5. Log Important Operations

```typescript
// ✅ Good
logger.info('Employee created', { employeeId: employee._id });
logger.error('Failed to create employee', error, { data });

// ❌ Bad
console.log('Employee created'); // Not structured
```

### 6. Handle Errors Gracefully

```typescript
// ✅ Good
const { loading, error, request } = useApiRequest();
if (error) {
  showError('Error', error);
}

// ❌ Bad
// Letting errors crash the app
```

## Testing

When testing components or API routes with validation:

```typescript
import { createEmployeeSchema } from '@/lib/validation/employeeSchemas';

describe('Employee API', () => {
  it('should validate employee data', async () => {
    const validData = {
      employee_code: 'EMP001',
      first_name: 'John',
      last_name: 'Doe',
      // ... other required fields
    };

    const result = await createEmployeeSchema.parseAsync(validData);
    expect(result).toBeDefined();
  });

  it('should reject invalid employee data', async () => {
    const invalidData = {
      employee_code: '', // Invalid: empty string
    };

    await expect(
      createEmployeeSchema.parseAsync(invalidData)
    ).rejects.toThrow();
  });
});
```

## Summary

The validation and error handling system provides:

1. **Type-safe validation** with Zod schemas
2. **Consistent error responses** across all API endpoints
3. **Automatic error handling** with middleware
4. **User-friendly notifications** with bilingual support
5. **Retry logic** for failed API calls
6. **Structured logging** for debugging and monitoring
7. **Error boundaries** to prevent app crashes
8. **Comprehensive error messages** in English and Khmer

This ensures a robust, maintainable, and user-friendly application.

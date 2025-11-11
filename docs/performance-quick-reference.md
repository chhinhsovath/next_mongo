# Performance Optimizations - Quick Reference

## Quick Start Guide

### 1. Use Lazy-Loaded Components

```tsx
// Heavy components (charts, calendars, reports)
import AttendanceCalendarLazy from '@/components/attendance/AttendanceCalendarLazy';
import PerformanceChartLazy from '@/components/performance/PerformanceChartLazy';
import ReportGeneratorLazy from '@/components/reports/ReportGeneratorLazy';

// Use them directly
<AttendanceCalendarLazy employeeId={employeeId} />
```

### 2. Use Optimized Employee List

```tsx
import EmployeeListOptimized from '@/components/employees/EmployeeListOptimized';

<EmployeeListOptimized onEdit={handleEdit} />
```

### 3. Use Optimized Images

```tsx
import OptimizedImage from '@/components/common/OptimizedImage';

<OptimizedImage
  src={employee.profile_photo_url}
  alt={employee.first_name}
  width={100}
  height={100}
  shape="circle"
/>
```

### 4. Use Cache in Services

```typescript
import cache from '@/lib/cache';

// Check cache first
const cacheKey = 'departments:all:false';
const cached = cache.get<IDepartment[]>(cacheKey);
if (cached) return cached;

// Fetch and cache
const data = await fetchFromDatabase();
cache.set(cacheKey, data, 5 * 60 * 1000); // 5 minutes

// Invalidate on updates
cache.delete(cacheKey);
```

### 5. Use Query Optimizer

```typescript
import { optimizeQuery, FIELD_SELECTIONS } from '@/lib/queryOptimizer';

const employees = await optimizeQuery(
  Employee.find(query),
  FIELD_SELECTIONS.employee.list,
  {
    lean: true,
    skip: 0,
    limit: 10,
    sort: { created_at: -1 },
  }
);
```

### 6. Use Performance Utilities

```typescript
import { debounce, measureApiCall } from '@/lib/performance';

// Debounce search
const debouncedSearch = debounce((value: string) => {
  setSearch(value);
}, 300);

// Measure API calls
const data = await measureApiCall('getEmployees', () =>
  fetch('/api/employees').then(r => r.json())
);
```

## Available Utilities

### Cache (`src/lib/cache.ts`)
- `cache.get(key)` - Get cached value
- `cache.set(key, data, ttl)` - Set cached value
- `cache.delete(key)` - Delete cached value
- `cache.clear()` - Clear all cache

### Lazy Loading (`src/lib/lazyLoad.ts`)
- `lazyLoad(importFunc, options)` - Create lazy component
- `preloadComponent(importFunc)` - Preload component
- `lazyLoadWithRetry(importFunc, retries, interval)` - Lazy load with retry

### Performance (`src/lib/performance.ts`)
- `debounce(func, wait)` - Debounce function
- `throttle(func, limit)` - Throttle function
- `measureApiCall(name, apiCall)` - Measure API performance
- `measureRenderTime(name, callback)` - Measure render time
- `isSlowConnection()` - Check connection speed
- `getMemoryUsage()` - Get memory stats

### Query Optimizer (`src/lib/queryOptimizer.ts`)
- `buildPaginationQuery(page, limit)` - Build pagination
- `buildSearchQuery(term, fields)` - Build search query
- `buildDateRangeQuery(field, start, end)` - Build date range
- `optimizeQuery(query, fields, options)` - Optimize query
- `FIELD_SELECTIONS` - Predefined field selections

## Performance Checklist

- [ ] Use lazy loading for heavy components (charts, calendars)
- [ ] Use virtual scrolling for large lists (100+ items)
- [ ] Implement caching for frequently accessed data
- [ ] Use optimized queries with field selection
- [ ] Use optimized images with Next.js Image
- [ ] Debounce search inputs (300ms)
- [ ] Throttle scroll/resize handlers
- [ ] Add proper indexes to MongoDB models
- [ ] Use pagination for all list endpoints
- [ ] Memoize expensive computations

## Common Patterns

### Lazy Load a Component

```tsx
import { lazyLoad } from '@/lib/lazyLoad';

const HeavyComponent = lazyLoad(() => import('./HeavyComponent'));
```

### Optimize a List Query

```typescript
import { optimizeQuery, FIELD_SELECTIONS, buildPaginationQuery } from '@/lib/queryOptimizer';

const { skip, limit } = buildPaginationQuery(page, pageSize);

const items = await optimizeQuery(
  Model.find(query),
  FIELD_SELECTIONS.model.list,
  { lean: true, skip, limit, sort: { created_at: -1 } }
);
```

### Cache API Response

```typescript
import cache from '@/lib/cache';

export async function getData() {
  const cacheKey = 'data:key';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const data = await fetchData();
  cache.set(cacheKey, data, 5 * 60 * 1000);
  return data;
}
```

### Debounce Search

```tsx
import { debounce } from '@/lib/performance';
import { useState, useCallback } from 'react';

const [search, setSearch] = useState('');

const debouncedSearch = useCallback(
  debounce((value: string) => {
    setSearch(value);
  }, 300),
  []
);
```

## Monitoring

### Development
- Check console for slow operations
- Use React DevTools Profiler
- Monitor bundle sizes in build output

### Production
- Track Core Web Vitals
- Monitor API response times
- Track cache hit rates
- Monitor memory usage

## Need Help?

See full documentation: `docs/performance-optimizations.md`

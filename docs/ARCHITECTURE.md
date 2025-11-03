# Architecture Overview

## Clean Architecture

The application follows clean architecture principles with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│           API Layer                      │
│  (Routes, Middleware, Schemas)          │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│         Service Layer                   │
│  (Business Logic, Use Cases)            │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│      Infrastructure Layer                │
│  (Repositories, HTTP Clients, DB)      │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│         Domain Layer                    │
│  (Schemas, Types, Entities)            │
└─────────────────────────────────────────┘
```

## Key Components

### API Layer (`src/api/`)

- **Routes**: HTTP endpoint definitions using Hono OpenAPI
- **Middleware**: Authentication, validation, error handling
- **Schemas**: Zod schemas for request/response validation

### Service Layer (`src/services/`)

- **Use Cases**: Business logic operations
  - `CreateGroupOrderUseCase` - Create new group orders
  - `CreateUserOrderUseCase` - Add items to user orders
  - `SubmitGroupOrderUseCase` - Submit orders to backend
  - `ResourceService` - Stock management

### Infrastructure Layer (`src/infrastructure/`)

- **Repositories**: Data access layer (Prisma)
- **HTTP Clients**: External API integrations
  - `SessionApiClient` - Backend session management
  - `TacosApiClient` - Backend API wrapper

### Domain Layer (`src/schemas/`)

- **Zod Schemas**: Domain entities with validation
- **Branded Types**: Type-safe IDs (UserId, GroupOrderId, etc.)

## Design Patterns

### Dependency Injection

Using TSyringe for dependency injection:

```typescript
import { inject } from '@/shared/utils/inject.utils';

class MyService {
  private readonly repository = inject(Repository);
}
```

### Branded Types

Type-safe IDs prevent mixing different ID types:

```typescript
type UserId = Id<'User'>;
type GroupOrderId = Id<'GroupOrder'>;

// TypeScript will error if you mix them
function getUser(id: UserId) { ... }
getUser(groupOrderId); // ❌ Type error
```

### Direct Serialization

Routes serialize responses directly without mappers:

```typescript
return c.json({
  id: user.id,
  username: user.username,
  createdAt: user.createdAt?.toISOString(),
}, 200);
```

## Authentication

Two authentication methods supported:

1. **Bearer Token**: JWT-based authentication
2. **Username Header**: `x-username` header for development/testing

Both methods can be used simultaneously via pluggable middleware.

## Database

Prisma ORM with PostgreSQL:

- **Migrations**: `pnpm prisma:migrate`
- **Studio**: `pnpm prisma:studio`
- **Schema**: `prisma/schema.prisma`

## Testing

- **Framework**: Vitest
- **Location**: Co-located with source files (`__tests__/`)
- **Mocks**: Shared mock utilities in `src/shared/utils/__tests__/`

## Error Handling

Structured error classes:

- `ValidationError` - Input validation failures
- `NotFoundError` - Resource not found
- `UnauthorizedError` - Authentication failures
- `ApiError` - Generic API errors

All errors are caught by middleware and returned as JSON responses.


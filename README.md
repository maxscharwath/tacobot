# 🌮 Tacobot - Group Ordering API

A modern TypeScript REST API for managing group orders of tacos, built with Hono, Prisma, and Zod.

## ✨ Features

- 🔐 **Authentication** - Bearer token and username header authentication
- 👥 **Group Orders** - Create and manage group orders with multiple users
- 🛒 **User Orders** - Individual order management within group orders
- 📦 **Stock Management** - Real-time product availability tracking
- 📝 **OpenAPI Documentation** - Interactive Swagger UI at `/docs`
- 🎯 **Type Safety** - 100% TypeScript with branded ID types
- ✅ **Validation** - Zod schema validation
- 🧪 **Testing** - Comprehensive test suite with Vitest

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.0.0
- PostgreSQL (or SQLite for development)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate

# Start development server
pnpm dev
```

The API will be available at `http://localhost:3000` with Swagger UI at `http://localhost:3000/docs`.

## 📚 Documentation

- **[API Documentation](docs/API.md)** - Complete API reference
- **[Architecture](docs/ARCHITECTURE.md)** - System architecture and design patterns
- **[Backend Integration](docs/BACKEND_INTEGRATION.md)** - External backend integration details

### Interactive Documentation

- **Swagger UI**: `http://localhost:3000/docs` - Interactive API documentation
- **OpenAPI Spec**: `http://localhost:3000/openapi.json` - Full OpenAPI 3.1 specification

### API Endpoints

#### System
- `GET /health` - Health check endpoint
- `GET /docs` - Swagger UI documentation
- `GET /openapi.json` - OpenAPI specification

#### Authentication
- `POST /auth` - Login/Register and get bearer token

#### Group Orders (`/api/v1/orders`)
- `GET /api/v1/orders` - List all group orders
- `POST /api/v1/orders` - Create a new group order
- `GET /api/v1/orders/{id}` - Get group order details
- `POST /api/v1/orders/{id}/submit` - Submit group order to backend

#### User Orders (`/api/v1/orders/{id}/items`)
- `POST /api/v1/orders/{id}/items` - Add items to user order
- `GET /api/v1/orders/{id}/items/{itemId}` - Get user order details
- `DELETE /api/v1/orders/{id}/items/{itemId}` - Remove user order

#### Resources
- `GET /api/v1/stock` - Get stock availability

#### Users (`/api/v1/users`)
- `GET /api/v1/users/me` - Get current user profile
- `GET /api/v1/users/me/orders` - Get user's order history
- `GET /api/v1/users/me/group-orders` - Get user's group orders

## 🏗️ Project Structure

```
src/
├── api/                    # API layer
│   ├── app/                # Application setup
│   ├── middleware/         # Authentication, validation, error handling
│   ├── routes/             # API route definitions
│   └── schemas/            # Request/response schemas
├── infrastructure/          # External integrations
│   ├── api/                # HTTP clients (backend API, session management)
│   ├── database/           # Prisma service
│   └── repositories/       # Data access layer
├── schemas/                 # Domain schemas (Zod)
├── services/                # Business logic
│   ├── auth/               # Authentication services
│   ├── group-order/        # Group order management
│   ├── order/              # Backend order submission
│   ├── resource/           # Stock/resource management
│   ├── session/            # Session management
│   └── user-order/         # User order management
└── shared/                 # Shared utilities
    ├── config/              # Application configuration
    ├── types/               # Type definitions
    └── utils/               # Utility functions
```

## 🛠️ Development

### Available Scripts

```bash
pnpm dev              # Start development server with hot reload
pnpm build            # Build for production
pnpm check            # Type check without emitting
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
pnpm test:ui          # Run tests with UI
pnpm prisma:studio    # Open Prisma Studio
pnpm prisma:migrate   # Run database migrations
pnpm exec biome check --write  # Lint and format code
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tacobot"

# API
PORT=3000
NODE_ENV=development

# Backend API (external PHP backend)
BACKEND_API_URL="https://your-backend.com"

# Logging
LOG_LEVEL=info
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui
```

Tests are co-located with source files using the `__tests__` directory pattern.

## 🔧 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Hono 4.x
- **Database**: Prisma ORM with PostgreSQL
- **Validation**: Zod 4.x
- **Testing**: Vitest
- **Linting**: Biome
- **TypeScript**: 5.3 with strict mode

## 📖 Architecture

The application follows a clean architecture pattern:

- **API Layer**: Route handlers, middleware, request/response schemas
- **Service Layer**: Business logic and use cases
- **Infrastructure Layer**: External integrations (HTTP clients, database)
- **Domain Layer**: Core entities and schemas

### Key Design Decisions

- **Branded Types**: Type-safe IDs (e.g., `UserId`, `GroupOrderId`) prevent ID mixing
- **Zod Schemas**: Single source of truth for validation and types
- **Dependency Injection**: Using TSyringe for clean dependency management
- **Direct Serialization**: Routes serialize responses directly (no mappers)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `pnpm test`
4. Run linting: `pnpm exec biome check --write`
5. Run type check: `pnpm check`
6. Submit a pull request

## 📝 License

MIT

---

**Built with ❤️ using TypeScript, Hono, and modern best practices**


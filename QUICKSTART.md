# Quick Start Guide

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run in development:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Architecture Overview

### Layers

1. **Types Layer** (`src/types/`)
   - Type definitions for all data models
   - Configuration types
   - Custom error classes

2. **API Client Layer** (`src/api/`)
   - `client.ts` - Low-level HTTP client wrapping backend API
   - `web-server.ts` - Express REST API server

3. **Service Layer** (`src/services/`)
   - `tacos-api.service.ts` - High-level business logic

4. **Integration Layer** (`src/integrations/`)
   - `slack-bot.service.ts` - Slack bot integration

5. **Utils Layer** (`src/utils/`)
   - Configuration management
   - Logging setup

### Key Features

- **Type Safety**: Full TypeScript coverage with strict mode
- **Error Handling**: Custom error classes with proper HTTP status codes
- **CSRF Management**: Automatic token refresh every 30 minutes
- **Logging**: Winston-based logging with configurable levels
- **Modular**: Clean separation of concerns

## API Examples

### Add Taco to Cart

```typescript
import { getTacosApiService } from '@/services/tacos-api.service';

const service = getTacosApiService();

const taco = await service.addTacoToCart({
  size: 'tacos_XL',
  meats: [
    { slug: 'viande_hachee', name: 'Viande Hachée', quantity: 2 }
  ],
  sauces: [
    { slug: 'harissa', name: 'Harissa' },
    { slug: 'algérienne', name: 'Algérienne' }
  ],
  garnitures: [
    { slug: 'salade', name: 'Salade' },
    { slug: 'tomates', name: 'Tomates' }
  ],
  note: 'Pas trop épicé'
});
```

### Submit Order

```typescript
const order = await service.submitOrder(
  {
    name: 'John Doe',
    phone: '+41791234567'
  },
  {
    type: 'livraison',
    address: '123 Rue Example, 1000 Lausanne',
    requestedFor: '15:00'
  }
);
```

## Testing API Endpoints

### Using curl

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Get stock
curl http://localhost:3000/api/v1/resources/stock

# Get cart
curl http://localhost:3000/api/v1/cart
```

## Slack Bot Setup

1. Create a Slack app at https://api.slack.com/apps
2. Install the app to your workspace
3. Get the bot token, signing secret, and app token
4. Add them to your `.env` file
5. Restart the application

The bot will respond to:
- `/tacos` - Show help
- `/tacos-menu` - View menu
- `/tacos-cart` - View cart
- `/tacos-order` - Place order

## Troubleshooting

### CSRF Token Errors
- Ensure `BACKEND_API_BASE_URL` is correct
- Check that the backend API is accessible
- Token refreshes automatically every 30 minutes

### Slack Bot Not Working
- Verify Slack tokens are correct
- Check that socket mode is enabled if using app token
- Review logs for error messages

### Type Errors
- Run `npm run type-check` to identify issues
- Ensure all imports use `@/` path aliases
- Check that types are properly exported

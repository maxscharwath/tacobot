# Backend Integration

This document describes how the API integrates with the external PHP backend system.

## Overview

The application wraps a legacy PHP backend API, managing sessions, CSRF tokens, and cookies automatically.

## Key Components

### SessionApiClient

The `SessionApiClient` handles all communication with the backend:

- **Session Management**: Creates and manages sessions with CSRF tokens
- **Cookie Handling**: Automatically manages cookies per session
- **Request Formatting**: Converts requests to form-encoded format expected by backend
- **Response Parsing**: Parses HTML responses and extracts data

### Backend Order Submission

The `BackendOrderSubmissionService` handles submitting group orders:

1. Combines all user orders into a single order
2. Formats addresses and customer information
3. Submits to `/ajax/RocknRoll.php`
4. Parses response to extract order ID and transaction ID

## Backend Endpoints

### Stock Management

```
GET /office/stock_management.php?type=all
```

Returns stock availability for all product categories.

### Order Submission

```
POST /ajax/RocknRoll.php
Content-Type: application/x-www-form-urlencoded
```

Submits the final order to the backend system.

### CSRF Token Refresh

```
GET /ajax/refresh_token.php
```

Refreshes CSRF tokens for session management.

## Session Flow

1. **Create Session**: `SessionService.createSession()` creates a new session with UUID
2. **Get CSRF Token**: Session includes CSRF token from backend
3. **Make Requests**: All requests include CSRF token and session cookies
4. **Submit Order**: Final order submission uses session data
5. **Cleanup**: Sessions expire after 24 hours of inactivity

## Address Formatting

The backend expects addresses in a specific format. The `formatAddressForBackend` utility converts structured addresses:

```typescript
{
  road: "Rue de la Gare",
  house_number: "15",
  postcode: "1000",
  city: "Lausanne",
  state: "Vaud",
  country: "Switzerland"
}
```

To:

```
"Rue de la Gare 15, 1000 Lausanne, Vaud, Switzerland"
```

## Error Handling

Backend errors are caught and converted to structured error responses:

- **CSRF Errors**: Automatically retried with fresh token
- **Network Errors**: Retried with exponential backoff
- **Validation Errors**: Parsed and returned with details

## Mock Server

A mock backend server is available for testing (`pnpm mock:server`). This allows testing the full order flow without hitting the production backend.


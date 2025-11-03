# API Documentation

## Base URL

All API endpoints are prefixed with `/api/v1`.

## Authentication

The API supports two authentication methods:

### Bearer Token

Include the JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Get a token via `POST /api/v1/auth/login`.

### Username Header

For development/testing, use the `x-username` header:

```
x-username: your-username
```

## Endpoints

### Authentication

#### Login/Register
```http
POST /auth
Content-Type: application/json

{
  "username": "string"
}
```

Returns a user object and JWT token. If the user doesn't exist, it will be created automatically.

### Group Orders

#### List Group Orders
```http
GET /api/v1/orders
Authorization: Bearer <token>
```

#### Create Group Order
```http
POST /api/v1/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-01-02T00:00:00Z"
}
```

#### Get Group Order
```http
GET /api/v1/orders/{id}
Authorization: Bearer <token>
```

#### Submit Group Order
```http
POST /api/v1/orders/{id}/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "customer": {
    "name": "John Doe",
    "phone": "0799999999"
  },
  "delivery": {
    "type": "livraison",
    "address": {
      "road": "Rue de la Gare",
      "house_number": "15",
      "postcode": "1000",
      "city": "Lausanne",
      "state": "Vaud",
      "country": "Switzerland"
    },
    "requestedFor": "23:30"
  }
}
```

### User Orders

#### Add Items to User Order
```http
POST /api/v1/orders/{id}/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": {
    "tacos": [
      {
        "size": "tacos_XL",
        "meats": [{"id": "uuid", "quantity": 1}],
        "sauces": [{"id": "uuid"}],
        "garnitures": [{"id": "uuid"}],
        "note": "Optional note",
        "quantity": 1
      }
    ],
    "extras": [{"id": "uuid", "quantity": 1}],
    "drinks": [{"id": "uuid", "quantity": 1}],
    "desserts": [{"id": "uuid", "quantity": 1}]
  }
}
```

#### Get User Order
```http
GET /api/v1/orders/{id}/items/{itemId}
Authorization: Bearer <token>
```

#### Delete User Order
```http
DELETE /api/v1/orders/{id}/items/{itemId}
Authorization: Bearer <token>
```

### Resources

#### Get Stock Availability
```http
GET /api/v1/stock
Authorization: Bearer <token>
```

Returns stock status for all product categories:
- `meats` - Available meats
- `sauces` - Available sauces
- `garnishes` - Available garnitures
- `extras` - Available extras
- `drinks` - Available drinks
- `desserts` - Available desserts

### Users

#### Get Current User
```http
GET /api/v1/users/me
Authorization: Bearer <token>
```

#### Get User Order History
```http
GET /api/v1/users/me/orders
Authorization: Bearer <token>
```

#### Get User Group Orders
```http
GET /api/v1/users/me/group-orders
Authorization: Bearer <token>
```

### Health

#### Health Check
```http
GET /health
```

## Interactive Documentation

Swagger UI is available at `/docs` when the server is running. This provides:
- Interactive API testing
- Request/response examples
- Schema documentation
- Authentication testing

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `INTERNAL_ERROR` - Server error

## Rate Limiting

API endpoints may be rate-limited. Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1609459200
```


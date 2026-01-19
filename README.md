# Travel SuperApp Backend

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Database Services

Using Docker:
```bash
docker-compose up -d postgres redis
```

Or install PostgreSQL and Redis locally.

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Run Migrations

```bash
npm run migration:run
```

### 5. Start Development Server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## API Documentation

Swagger UI is available at `http://localhost:3000/api/docs`

## Project Structure

```
src/
├── common/              # Shared utilities
│   ├── dto/            # Common DTOs
│   ├── entities/       # Base entities
│   ├── filters/        # Exception filters
│   └── interceptors/   # Request interceptors
├── config/             # Configuration
├── database/           # Database setup
├── modules/            # Feature modules
│   ├── auth/          # Authentication
│   ├── users/         # User management
│   ├── flights/       # Flight services
│   ├── hotels/        # Hotel services
│   ├── visa/          # Visa services
│   ├── hajj/          # Hajj/Umrah packages
│   ├── cart/          # Shopping cart
│   ├── orders/        # Order management
│   ├── payments/      # Payment processing
│   └── notifications/ # Notifications
└── main.ts            # Application entry
```

## Available Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint

## API Endpoints

### Authentication
- `POST /api/v1/auth/otp/start` - Request OTP
- `POST /api/v1/auth/otp/verify` - Verify OTP
- `POST /api/v1/auth/register` - Complete registration
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Flights
- `POST /api/v1/flights/search` - Search flights
- `GET /api/v1/flights/offers/:id` - Get offer details
- `POST /api/v1/flights/offers/:id/hold` - Hold flight
- `GET /api/v1/flights/airports` - Search airports

### Hotels
- `POST /api/v1/hotels/search` - Search hotels
- `GET /api/v1/hotels/:id` - Get hotel details
- `GET /api/v1/hotels/destinations/search` - Search destinations

### Visa
- `GET /api/v1/visa/countries` - Get countries
- `GET /api/v1/visa/countries/:code/types` - Get visa types
- `GET /api/v1/visa/requirements` - Get requirements
- `POST /api/v1/visa/applications` - Create application

### Cart
- `GET /api/v1/cart` - Get cart
- `POST /api/v1/cart/items` - Add item
- `DELETE /api/v1/cart/items/:id` - Remove item
- `POST /api/v1/cart/promo` - Apply promo code
- `POST /api/v1/cart/checkout` - Checkout

### Orders
- `GET /api/v1/orders` - List orders
- `GET /api/v1/orders/:id` - Get order
- `POST /api/v1/orders/:id/cancel` - Cancel order

### Payments
- `GET /api/v1/payments/methods` - Get payment methods
- `POST /api/v1/payments/initiate` - Initiate payment
- `GET /api/v1/payments/:id/status` - Check status

## Environment Variables

See `.env.example` for all required environment variables.

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

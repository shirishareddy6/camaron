# Camaron — Smart Aquaculture Platform

Production-grade full-stack SaaS for shrimp feed manufacturers and farmers.

## Tech Stack

| Layer      | Technology                              |
|------------|----------------------------------------|
| Frontend   | React 18, Redux Toolkit, React Router  |
| Backend    | Node.js 20, Express 5, JWT             |
| Database   | PostgreSQL 16                          |
| Cache      | Redis 7                                |
| Reverse Proxy | Nginx                              |
| Deployment | Docker Compose on Oracle Cloud VM      |
| CI/CD      | GitHub Actions                         |

## Project Structure

```
camaron/
├── backend/          Express API
│   ├── src/
│   │   ├── config/       DB, Redis, env config
│   │   ├── controllers/  Route handlers
│   │   ├── middleware/   Auth, validation, error handling
│   │   ├── models/       Postgres query models
│   │   ├── routes/       Express routers
│   │   ├── services/     Business logic layer
│   │   ├── utils/        Helpers, mailer, SMS
│   │   └── validators/   Joi schemas
│   ├── migrations/   SQL migration files
│   └── scripts/      Seed data, utilities
├── frontend/         React SPA
│   ├── src/
│   │   ├── components/   Shared + domain components
│   │   ├── pages/        Route-level page components
│   │   ├── hooks/        Custom React hooks
│   │   ├── services/     Axios API clients
│   │   ├── store/        Redux slices
│   │   └── styles/       Global CSS variables
│   └── public/
├── nginx/            Nginx config
├── docker/           Dockerfiles
└── docker-compose.yml
```

## Quick Start (Local Development)

```bash
# 1. Clone and install
git clone https://github.com/your-org/camaron
cd camaron

# 2. Backend
cd backend && cp .env.example .env   # fill in values
npm install
npm run migrate
npm run seed
npm run dev

# 3. Frontend
cd ../frontend && cp .env.example .env
npm install
npm run dev
```

## Production Deployment (Oracle Cloud VM)

```bash
# On your VM
git clone https://github.com/your-org/camaron
cd camaron
cp backend/.env.example backend/.env   # fill secrets
cp frontend/.env.example frontend/.env

docker-compose up -d --build
```

## Environment Variables

See `backend/.env.example` and `frontend/.env.example`.

## API Documentation

Base URL: `https://yourdomain.com/api/v1`

### Auth
- `POST /auth/send-otp`
- `POST /auth/verify-otp`
- `POST /auth/refresh`

### Farmers
- `GET  /farmers/profile`
- `PUT  /farmers/profile`
- `GET  /farmers/ponds`
- `POST /farmers/ponds`

### Products
- `GET  /products`
- `GET  /products/:id`

### Vendors
- `GET  /vendors/inventory`
- `POST /vendors/inventory`
- `PUT  /vendors/inventory/:id`

### Admin
- `GET  /admin/analytics/overview`
- `GET  /admin/users`
- `GET  /admin/orders`

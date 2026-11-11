# GadgetHub — Full-stack electronics e-commerce website

A React + Express REST API application using **PostgreSQL** for relational account/cart/order data and **MongoDB** for the product catalogue and flexible specifications.

## Features
- Product catalogue, text search, category/brand/condition/price filters and sorting
- Product details, specifications, stock and warranty
- Customer/seller registration and JWT login
- Server-persisted cart, quantity changes and removal
- Checkout, order history and order details
- Seller dashboard: create/edit/archive own products, view order items, update order status and see sales totals
- Certified Refurbished catalogue items
- Responsive layout for desktop and mobile

## Requirements
- Node.js 20 LTS or newer
- npm
- Docker Desktop (recommended) or local MongoDB 7+ and PostgreSQL 16+

## 1. Start the databases
From the project root:

```bash
docker compose up -d
```

Wait until both containers are healthy.

## 2. Configure and start the backend
Open a terminal:

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

The API runs at `http://localhost:5000`. Health check: `http://localhost:5000/api/health`.

## 3. Configure and start the frontend
Open a second terminal from the project root:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

## Demo accounts
Seed data creates these accounts:

| Role | Email | Password |
|---|---|---|
| Seller | seller@gadgethub.demo | secret123 |
| Customer | customer@gadgethub.demo | secret123 |

Change demo credentials and `JWT_SECRET` before deploying anywhere public. The demo credentials are for local development only.

## API overview
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/products` (search/filter/sort), `GET /api/products/:id`
- `GET /api/products/seller/mine`, `POST /api/products`, `PATCH /api/products/:id`, `DELETE /api/products/:id`
- `GET /api/cart`, `POST /api/cart`, `PATCH /api/cart/:id`, `DELETE /api/cart/:id`
- `POST /api/orders`, `GET /api/orders/mine`, `GET /api/orders/:id`
- `GET /api/orders/seller`, `PATCH /api/orders/items/:id/status`

Protected endpoints require `Authorization: Bearer <token>`.

## Notes
- Checkout is a **demo Cash on Delivery flow**. No real payment gateway is connected.
- Product catalogue data is stored in MongoDB; user, cart, order and order-item data is stored in PostgreSQL.
- The backend currently uses Sequelize `sync()` for local development. For a production deployment, create and run versioned Sequelize migrations, configure HTTPS, rotate secrets, add backups and use a real payment provider if online payments are required.
- Seller product updates and deletion are restricted to the owning seller (admins can manage all products).
- Images in the sample seed data are remote Unsplash URLs; an internet connection is needed to display them.

## Production build
```bash
cd frontend && npm run build
```
The generated static website is in `frontend/dist`. Deploy the API separately and set `VITE_API_URL` to the deployed API base URL before building.

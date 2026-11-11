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

The API runs at `http://localhost:5001`. Health check: `http://localhost:5001/api/health`.

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
The generated static website is in `frontend/dist`. The Render deployment below builds it and serves it from the backend on the same origin.

## Free online deployment

The root `render.yaml` deploys the frontend and API together as one Render web service. The app uses the same public URL for both, so no separate frontend URL or CORS setting is needed. It uses Neon Free for PostgreSQL and MongoDB Atlas M0 for MongoDB; **do not create a paid database or service** for this setup.

Free services have limits: Render sleeps after 15 minutes without traffic and can take about a minute to wake up; Neon suspends idle compute and has free-tier quotas; Atlas M0 is limited to 512 MB. This setup is for demos and hobby use, not reliable production commerce. Render's free Postgres expires after 30 days, so this guide uses Neon instead.

1. **Create the free databases.**
   - Create a free project at [Neon](https://neon.tech/) and copy its PostgreSQL connection string. Keep `sslmode=require` in the URL.
   - Create an **M0 Free** cluster in [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Create a database user with a strong unique password. Since Render's free outbound IPs are not fixed, Atlas Network Access needs `0.0.0.0/0`; use a strong database password and never reuse it. Copy the Atlas connection string and replace its username/password placeholders.
2. **Deploy from GitHub on Render.** Open [Render Blueprints](https://dashboard.render.com/blueprints), connect `Sanjeev-Git99/GadgetHub_MERN`, and deploy the `render.yaml` blueprint. Choose **Free** if prompted. Set the secret environment variables `POSTGRES_URL` and `MONGO_URL` to the database URLs from step 1. Render generates `JWT_SECRET`; do not replace it with a public/demo value.
3. **Seed the catalogue once.** In `backend/.env` on your computer, set `NODE_ENV=production`, `POSTGRES_URL`, `POSTGRES_SSL=true`, and `MONGO_URL` to the same hosted database values. Then run:
   ```bash
   cd backend
   npm install
   npm run seed
   ```
   Production seeding adds sample products but does **not** create the public demo accounts and password shown above. Do not commit `.env` or paste database URLs into GitHub.
4. Open the Render service's `https://...onrender.com` URL. Check `https://...onrender.com/api/health`, then register a new account on the site.

For future updates, push commits to GitHub; Render will deploy them automatically. Keep an eye on the free-tier quotas and make database backups before changing providers.

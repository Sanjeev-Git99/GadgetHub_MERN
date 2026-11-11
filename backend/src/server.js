import dotenv from 'dotenv'; dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDatabases, sequelize } from './config/databases.js';
import './models/sql.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'GadgetHub API' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use((_req, res) => res.status(404).json({ message: 'API route not found.' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ message: 'That value is already in use.' });
  if (err.name === 'ValidationError' || err.name === 'SequelizeValidationError') return res.status(400).json({ message: err.message });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid identifier.' });
  res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Something went wrong.' : err.message });
});
const port = Number(process.env.PORT) || 5000;
try {
  await connectDatabases();
  await sequelize.sync();
  app.listen(port, () => console.log(`GadgetHub API running at http://localhost:${port}`));
} catch (error) { console.error('Could not start GadgetHub API:', error.message); process.exit(1); }

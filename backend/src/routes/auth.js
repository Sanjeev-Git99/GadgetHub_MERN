import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/sql.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router = Router();
const issue = (user) => jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const safe = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name?.trim() || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
  if (role && !['customer', 'seller'].includes(role)) return res.status(400).json({ message: 'Invalid account type.' });
  const normalized = email.trim().toLowerCase();
  if (await User.findOne({ where: { email: normalized } })) return res.status(409).json({ message: 'An account with this email already exists.' });
  const user = await User.create({ name: name.trim(), email: normalized, passwordHash: await bcrypt.hash(password, 12), role: role || 'customer' });
  res.status(201).json({ token: issue(user), user: safe(user) });
}));
router.post('/login', asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const user = email ? await User.findOne({ where: { email } }) : null;
  if (!user || !(await bcrypt.compare(req.body.password || '', user.passwordHash))) return res.status(401).json({ message: 'Incorrect email or password.' });
  res.json({ token: issue(user), user: safe(user) });
}));
router.get('/me', protect, (req, res) => res.json({ user: req.user }));
export default router;

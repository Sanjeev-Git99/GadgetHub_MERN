import jwt from 'jsonwebtoken';
import { User } from '../models/sql.js';

export async function protect(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Please log in to continue.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.id, { attributes: ['id', 'name', 'email', 'role'] });
    if (!user) return res.status(401).json({ message: 'Account not found.' });
    req.user = user;
    next();
  } catch { return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' }); }
}
export const allow = (...roles) => (req, res, next) => roles.includes(req.user.role)
  ? next() : res.status(403).json({ message: 'You do not have permission to do this.' });

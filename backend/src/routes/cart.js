import { Router } from 'express';
import { CartItem } from '../models/sql.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router = Router(); router.use(protect);
router.get('/', asyncHandler(async (req, res) => {
  const rows = await CartItem.findAll({ where: { UserId: req.user.id }, order: [['createdAt','DESC']] });
  const ids = rows.map((r) => r.productId);
  const products = await Product.find({ _id: { $in: ids }, active: true });
  const map = new Map(products.map((p) => [String(p._id), p]));
  res.json({ items: rows.map((r) => ({ id: r.id, quantity: r.quantity, product: map.get(r.productId) })).filter((r) => r.product) });
}));
router.post('/', asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body; const qty = Number(quantity);
  if (!productId || !Number.isInteger(qty) || qty < 1 || qty > 20) return res.status(400).json({ message: 'Choose a valid product and quantity (1–20).' });
  const product = await Product.findOne({ _id: productId, active: true });
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  if (product.condition === 'Certified Refurbished' && !req.user) return res.status(401).json({ message: 'Log in to buy refurbished products.' });
  const [row, created] = await CartItem.findOrCreate({ where: { UserId: req.user.id, productId }, defaults: { quantity: qty } });
  if (!created) { row.quantity = Math.min(20, row.quantity + qty); await row.save(); }
  res.status(201).json({ message: 'Added to cart.' });
}));
router.patch('/:id', asyncHandler(async (req, res) => {
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return res.status(400).json({ message: 'Quantity must be between 1 and 20.' });
  const row = await CartItem.findOne({ where: { id: req.params.id, UserId: req.user.id } });
  if (!row) return res.status(404).json({ message: 'Cart item not found.' });
  row.quantity = quantity; await row.save(); res.json({ message: 'Cart updated.' });
}));
router.delete('/:id', asyncHandler(async (req, res) => {
  const deleted = await CartItem.destroy({ where: { id: req.params.id, UserId: req.user.id } });
  if (!deleted) return res.status(404).json({ message: 'Cart item not found.' });
  res.json({ message: 'Removed from cart.' });
}));
export default router;

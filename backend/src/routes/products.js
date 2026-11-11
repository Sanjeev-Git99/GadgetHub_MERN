import { Router } from 'express';
import Product from '../models/Product.js';
import { protect, allow } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router = Router();
router.get('/', asyncHandler(async (req, res) => {
  const { search, category, brand, condition, minPrice, maxPrice, sort = 'newest', page = 1, limit = 12 } = req.query;
  const filter = { active: true };
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (condition) filter.condition = condition;
  if (minPrice || maxPrice) filter.price = { ...(minPrice ? { $gte: Number(minPrice) } : {}), ...(maxPrice ? { $lte: Number(maxPrice) } : {}) };
  if (search?.trim()) filter.$text = { $search: search.trim() };
  const sortMap = { price_asc: { price: 1 }, price_desc: { price: -1 }, rating: { rating: -1 }, newest: { createdAt: -1 } };
  const p = Math.max(1, Number(page) || 1), l = Math.min(48, Math.max(1, Number(limit) || 12));
  const [items, total] = await Promise.all([Product.find(filter).sort(sortMap[sort] || sortMap.newest).skip((p - 1) * l).limit(l), Product.countDocuments(filter)]);
  res.json({ items, total, page: p, pages: Math.ceil(total / l), filters: { categories: await Product.distinct('category', { active: true }), brands: await Product.distinct('brand', { active: true }) } });
}));
router.get('/seller/mine', protect, allow('seller', 'admin'), asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { sellerId: req.user.id };
  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json({ products });
}));
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, active: true });
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  res.json(product);
}));
router.post('/', protect, allow('seller', 'admin'), asyncHandler(async (req, res) => {
  const { name, category, brand, price } = req.body;
  if (!name || !category || !brand || Number(price) < 0 || price === undefined) return res.status(400).json({ message: 'Name, category, brand and a valid price are required.' });
  const product = await Product.create({ ...req.body, sellerId: req.user.id });
  res.status(201).json(product);
}));
router.patch('/:id', protect, allow('seller', 'admin'), asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  if (req.user.role !== 'admin' && product.sellerId !== req.user.id) return res.status(403).json({ message: 'You can only update your own products.' });
  const fields = ['name','description','category','brand','price','mrp','rating','image','condition','stock','warranty','specifications','active'];
  fields.forEach((key) => { if (req.body[key] !== undefined) product[key] = req.body[key]; });
  await product.save(); res.json(product);
}));
router.delete('/:id', protect, allow('seller', 'admin'), asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  if (req.user.role !== 'admin' && product.sellerId !== req.user.id) return res.status(403).json({ message: 'You can only remove your own products.' });
  product.active = false; await product.save(); res.json({ message: 'Product removed.' });
}));
export default router;

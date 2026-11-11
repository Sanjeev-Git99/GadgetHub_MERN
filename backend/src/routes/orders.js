import { Router } from 'express';
import { sequelize } from '../config/databases.js';
import { CartItem, Order, OrderItem } from '../models/sql.js';
import Product from '../models/Product.js';
import { protect, allow } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router = Router(); router.use(protect);
router.post('/', asyncHandler(async (req, res) => {
  const { shippingName, shippingAddress } = req.body;
  if (!shippingName?.trim() || !shippingAddress?.trim()) return res.status(400).json({ message: 'Shipping name and address are required.' });
  const cart = await CartItem.findAll({ where: { UserId: req.user.id } });
  if (!cart.length) return res.status(400).json({ message: 'Your cart is empty.' });
  const products = await Product.find({ _id: { $in: cart.map((c) => c.productId) }, active: true });
  const byId = new Map(products.map((p) => [String(p._id), p]));
  const lines = cart.map((c) => ({ row: c, product: byId.get(c.productId) })).filter((x) => x.product);
  if (lines.length !== cart.length) return res.status(409).json({ message: 'Some cart products are no longer available. Refresh your cart.' });
  for (const { row, product } of lines) if (product.stock < row.quantity) return res.status(409).json({ message: `${product.name} does not have enough stock.` });
  const total = lines.reduce((sum, x) => sum + x.product.price * x.row.quantity, 0);
  const order = await sequelize.transaction(async (transaction) => {
    const created = await Order.create({ UserId: req.user.id, total, shippingName: shippingName.trim(), shippingAddress: shippingAddress.trim() }, { transaction });
    await OrderItem.bulkCreate(lines.map(({ row, product }) => ({ OrderId: created.id, productId: String(product._id), productName: product.name, quantity: row.quantity, unitPrice: product.price, sellerId: product.sellerId })), { transaction });
    await CartItem.destroy({ where: { UserId: req.user.id }, transaction });
    return created;
  });
  await Promise.all(lines.map(({ row, product }) => Product.updateOne({ _id: product._id }, { $inc: { stock: -row.quantity } })));
  res.status(201).json({ order });
}));
router.get('/mine', asyncHandler(async (req, res) => {
  const orders = await Order.findAll({ where: { UserId: req.user.id }, include: [{ model: OrderItem }], order: [['createdAt','DESC']] });
  res.json({ orders });
}));
router.get('/seller', allow('seller','admin'), asyncHandler(async (req, res) => {
  const where = req.user.role === 'admin' ? {} : { sellerId: req.user.id };
  const items = await OrderItem.findAll({ where, include: [{ model: Order, include: [{ model: (await import('../models/sql.js')).User, attributes: ['name','email'] }] }], order: [['createdAt','DESC']] });
  res.json({ items });
}));
router.patch('/items/:id/status', allow('seller','admin'), asyncHandler(async (req, res) => {
  const valid = ['processing','shipped','delivered','cancelled'];
  if (!valid.includes(req.body.status)) return res.status(400).json({ message: 'Invalid order status.' });
  const item = await OrderItem.findByPk(req.params.id, { include: [{ model: Order }] });
  if (!item) return res.status(404).json({ message: 'Order item not found.' });
  if (req.user.role !== 'admin' && item.sellerId !== req.user.id) return res.status(403).json({ message: 'You cannot update this order.' });
  item.status = req.body.status; await item.save(); res.json({ message: 'Order item status updated.' });
}));
router.get('/:id', asyncHandler(async (req, res) => {
  const order = await Order.findOne({ where: { id: req.params.id, UserId: req.user.id }, include: [{ model: OrderItem }] });
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  res.json({ order });
}));
export default router;

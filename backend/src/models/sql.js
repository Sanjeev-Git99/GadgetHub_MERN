import { DataTypes } from 'sequelize';
import { sequelize } from '../config/databases.js';

export const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(160), allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('customer', 'seller', 'admin'), allowNull: false, defaultValue: 'customer' }
});

export const CartItem = sequelize.define('CartItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  productId: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, validate: { min: 1, max: 20 } }
});

export const Order = sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  status: { type: DataTypes.ENUM('placed', 'processing', 'shipped', 'delivered', 'cancelled'), defaultValue: 'placed' },
  shippingName: { type: DataTypes.STRING, allowNull: false },
  shippingAddress: { type: DataTypes.TEXT, allowNull: false },
  paymentMethod: { type: DataTypes.STRING, defaultValue: 'Cash on delivery' }
});

export const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  productId: { type: DataTypes.STRING, allowNull: false },
  productName: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  unitPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  sellerId: { type: DataTypes.UUID, allowNull: false },
  status: { type: DataTypes.ENUM('placed', 'processing', 'shipped', 'delivered', 'cancelled'), defaultValue: 'placed' }
});

User.hasMany(CartItem, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
CartItem.belongsTo(User);
User.hasMany(Order, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Order.belongsTo(User);
Order.hasMany(OrderItem, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
OrderItem.belongsTo(Order);

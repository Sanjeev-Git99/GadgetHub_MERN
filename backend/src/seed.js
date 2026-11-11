import dotenv from 'dotenv'; dotenv.config();
import bcrypt from 'bcryptjs';
import { connectDatabases, sequelize } from './config/databases.js';
import { User } from './models/sql.js';
import Product from './models/Product.js';

await connectDatabases(); await sequelize.sync();
const sellerEmail = 'seller@gadgethub.demo';
const customerEmail = 'customer@gadgethub.demo';
const [seller] = await User.findOrCreate({ where: { email: sellerEmail }, defaults: { name: 'Priya Seller', email: sellerEmail, passwordHash: await bcrypt.hash('secret123', 12), role: 'seller' } });
await User.findOrCreate({ where: { email: customerEmail }, defaults: { name: 'Arjun Customer', email: customerEmail, passwordHash: await bcrypt.hash('secret123', 12), role: 'customer' } });
const samples = [
  ['Apple iPhone 15','Smartphones','Apple',69999,79900,'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=900','New'],
  ['Samsung Galaxy S24','Smartphones','Samsung',62999,74999,'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=900','New'],
  ['Sony WH-1000XM5','Audio','Sony',24990,29990,'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=900','New'],
  ['MacBook Air M2','Laptops','Apple',74990,99900,'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900','Certified Refurbished'],
  ['iPad Air','Tablets','Apple',52900,59900,'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=900','New'],
  ['JBL Flip 6','Audio','JBL',8999,11999,'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900','New'],
  ['Canon EOS R50','Cameras','Canon',58999,67999,'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900','New'],
  ['Apple Watch Series 9','Wearables','Apple',32900,41900,'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=900','Certified Refurbished'],
  ['Dell XPS 13','Laptops','Dell',89990,109990,'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900','New'],
  ['OnePlus Buds Pro 2','Audio','OnePlus',9999,13999,'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=900','New'],
  ['Samsung Galaxy Tab S9','Tablets','Samsung',54999,65999,'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=900','New'],
  ['GoPro HERO12','Cameras','GoPro',33990,39990,'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=900','New']
];
for (const [name, category, brand, price, mrp, image, condition] of samples) {
  await Product.findOneAndUpdate({ name }, { $setOnInsert: { name, category, brand, price, mrp, image, condition, sellerId: seller.id, stock: 15, rating: 4.5, warranty: '1 year warranty', description: `${name} — carefully selected by GadgetHub. Explore features, specifications and reliable after-sales support.` } }, { upsert: true, new: true });
}
console.log('Seed complete. Demo accounts: seller@gadgethub.demo and customer@gadgethub.demo — password: secret123');
await sequelize.close(); process.exit(0);

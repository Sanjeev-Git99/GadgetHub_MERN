import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, required: true, index: true },
  brand: { type: String, required: true, index: true },
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, default: 0 },
  rating: { type: Number, default: 4.2, min: 0, max: 5 },
  image: { type: String, default: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=900' },
  condition: { type: String, enum: ['New', 'Certified Refurbished'], default: 'New' },
  stock: { type: Number, default: 10, min: 0 },
  warranty: { type: String, default: '1 year manufacturer warranty' },
  specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
  sellerId: { type: String, required: true, index: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
export default mongoose.model('Product', productSchema);

import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
export default function ProductCard({ product, refresh }) {
  const { user } = useAuth();
  const add = async () => { if (!user) return alert('Please sign in to add products to your cart.'); try { await api.post('/cart', { productId: product._id, quantity: 1 }); alert('Added to cart!'); refresh?.(); } catch (e) { alert(e.response?.data?.message || 'Could not add this product.'); } };
  return <article className="product-card"><Link to={`/product/${product._id}`} className="product-image"><img src={product.image} alt={product.name} loading="lazy"/><span className={product.condition === 'Certified Refurbished' ? 'tag refurb' : 'tag'}>{product.condition}</span></Link><div className="product-info"><div className="product-brand">{product.brand}</div><Link to={`/product/${product._id}`} className="product-name">{product.name}</Link><div className="rating"><Star size={14} fill="currentColor"/> {Number(product.rating || 0).toFixed(1)} <span>({product.stock} in stock)</span></div><div className="product-bottom"><div><strong>₹{Number(product.price).toLocaleString('en-IN')}</strong>{product.mrp > product.price && <del>₹{Number(product.mrp).toLocaleString('en-IN')}</del>}</div><button className="add-btn" onClick={add} aria-label="Add to cart"><ShoppingCart size={17}/></button></div></div></article>;
}

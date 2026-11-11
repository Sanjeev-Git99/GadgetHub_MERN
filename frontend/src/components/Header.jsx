import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, UserRound, LogOut, LayoutDashboard, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export default function Header({ onSearch }) {
  const { user, logout } = useAuth(); const navigate = useNavigate();
  return <header className="header"><div className="header-inner"><Link to="/" className="brand"><span className="brand-mark">G</span>Gadget<span>Hub</span></Link>
    <form className="header-search" onSubmit={(e) => { e.preventDefault(); onSearch(e.currentTarget.search.value); navigate('/'); }}><Search size={17}/><input name="search" placeholder="Search phones, laptops, audio..."/><button aria-label="Search">Search</button></form>
    <nav><NavLink to="/">Shop</NavLink>{user && <NavLink to="/orders">Orders</NavLink>}{user?.role === 'seller' || user?.role === 'admin' ? <NavLink to="/seller"><LayoutDashboard size={16}/> Seller</NavLink> : null}
    {user ? <><span className="welcome">Hi, {user.name.split(' ')[0]}</span><button className="icon-btn" title="Logout" onClick={() => { logout(); navigate('/'); }}><LogOut size={18}/></button></> : <Link className="login-link" to="/login"><UserRound size={17}/> Sign in</Link>}
    <Link className="cart-link" to="/cart"><ShoppingBag size={19}/><span>Cart</span></Link></nav></div></header>;
}

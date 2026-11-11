import { createContext, useContext, useMemo, useState } from 'react';
import api from '../api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('gadgethub_user')) || null; } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem('gadgethub_token'));
  const login = async (credentials) => { const { data } = await api.post('/auth/login', credentials); localStorage.setItem('gadgethub_token', data.token); localStorage.setItem('gadgethub_user', JSON.stringify(data.user)); setToken(data.token); setUser(data.user); return data.user; };
  const register = async (details) => { const { data } = await api.post('/auth/register', details); localStorage.setItem('gadgethub_token', data.token); localStorage.setItem('gadgethub_user', JSON.stringify(data.user)); setToken(data.token); setUser(data.user); return data.user; };
  const logout = () => { localStorage.removeItem('gadgethub_token'); localStorage.removeItem('gadgethub_user'); setToken(null); setUser(null); };
  const value = useMemo(() => ({ user, token, login, register, logout }), [user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);

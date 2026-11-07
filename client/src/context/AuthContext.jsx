import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { API_URL } from '../utils/records';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then((response) => response.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || '로그인에 실패했어요.');
    setUser(data.user);
    return data.user;
  }

  async function signup(username, nickname, password) {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, nickname, password }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || '회원가입에 실패했어요.');
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login, signup, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth는 AuthProvider 안에서 사용해야 합니다.');
  return context;
}

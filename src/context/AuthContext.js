import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../api';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import { clearToken, getToken, saveToken } from '../services/secureStorage';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    await clearToken();
  }, []);

  // Al abrir la app: recupera la sesión guardada
  useEffect(() => {
    setUnauthorizedHandler(logout);
    (async () => {
      const token = await getToken();
      if (token) {
        setAuthToken(token);
        try { setUser(await api.me()); } catch { await logout(); }
      }
      setLoading(false);
    })();
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const res = await api.login(email, password);
    setAuthToken(res.token);
    await saveToken(res.token);
    setUser(res.user);
  }, []);

  const value = useMemo(() => ({
    user, loading, login, logout,
    // El administrador puede todo; sin argumentos = solo administrador
    can: (...roles) => !!user && (user.rol === 'administrador' || roles.includes(user.rol)),
  }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

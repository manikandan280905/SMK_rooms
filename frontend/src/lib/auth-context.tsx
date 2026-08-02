'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from './api';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function loadAdmin() {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        if (pathname !== '/login' && pathname !== '/landing') {
          router.push('/landing');
        }
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setAdmin(res.data.data);
        }
      } catch (err) {
        localStorage.removeItem('accessToken');
        if (pathname !== '/login' && pathname !== '/landing') {
          router.push('/landing');
        }
      } finally {
        setLoading(false);
      }
    }

    loadAdmin();
  }, [pathname, router]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { admin: adminData, accessToken } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      setAdmin(adminData);
      router.push('/');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('accessToken');
      setAdmin(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

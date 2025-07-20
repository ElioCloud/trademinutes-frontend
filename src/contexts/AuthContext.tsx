"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  ID?: string;
  id?: string;
  Name?: string;
  name?: string;
  Email?: string;
  email?: string;
  Credits?: number;
  credits?: number;
  ProfilePictureURL?: string;
  profilePictureURL?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8084';
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const profile = await res.json();
        setUser(profile);
      } else {
        // Token might be invalid, clear it
        logout();
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      logout();
    }
  };

  const login = (authToken: string) => {
    localStorage.setItem("token", authToken);
    setToken(authToken);
    fetchUserProfile(authToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchUserProfile(token);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        await fetchUserProfile(storedToken);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
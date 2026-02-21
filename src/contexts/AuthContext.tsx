"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  username: string;
  isDM: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string) => boolean;
  logout: () => void;
  isFirstTime: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("westmarch_user");
    const hasRegistered = localStorage.getItem("westmarch_registered");

    if (!hasRegistered) {
      setIsFirstTime(true);
    } else if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const register = (username: string, password: string): boolean => {
    if (!username || !password) return false;

    const newUser: User = {
      id: Date.now().toString(),
      username,
      isDM: false,
    };

    localStorage.setItem("westmarch_user", JSON.stringify(newUser));
    localStorage.setItem("westmarch_password", password);
    localStorage.setItem("westmarch_registered", "true");

    setUser(newUser);
    setIsFirstTime(false);
    return true;
  };

  const login = (username: string, password: string): boolean => {
    const storedPassword = localStorage.getItem("westmarch_password");
    const storedUser = localStorage.getItem("westmarch_user");

    if (storedUser && storedPassword === password) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.username === username) {
        setUser(parsedUser);
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isFirstTime }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

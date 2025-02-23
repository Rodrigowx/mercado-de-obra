// app/components/AuthContext.tsx
"use client";

import React, { createContext, useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";

interface UserData {
  id: number;
  name: string;
  role: "CLIENT" | "PROFESSIONAL";
  rating?: number;
}

interface AuthContextProps {
  user: UserData | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const decodeToken = (token: string): UserData | null => {
    try {
      const decoded = jwtDecode<UserData>(token);
      if (!decoded || !decoded.id) return null;
      return {
        id: decoded.id,
        name: decoded.name,
        role: decoded.role,
      };
    } catch {
      return null;
    }
  };

  const login = (token: string) => {
    localStorage.setItem("accessToken", token);
    const decodedUser = decodeToken(token);
    if (decodedUser) {
      setUser(decodedUser);
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decodedUser = decodeToken(token);
      if (decodedUser) {
        setUser(decodedUser);
        setIsAuthenticated(true);
      } else {
        logout();
      }
    }
  }, []);


  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

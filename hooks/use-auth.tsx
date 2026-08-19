"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { User, AuthState } from "@/types/auth";

interface AuthContextType extends AuthState {
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  users: User[];
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Lista de usuários pré-definidos
const usuariosPredefinidos: User[] = [
  {
    id: "1",
    nome: "Maycon",
    email: "admin@poracred.com",
    senha: "admin123",
    role: "admin",
  },
  {
    id: "2",
    nome: "Beatriz",
    email: "beatriz@poracred.com",
    senha: "beatriz123",
    role: "user",
  },
  {
    id: "3",
    nome: "Camila",
    email: "camila@poracred.com",
    senha: "camila123",
    role: "user",
  },
  {
    id: "4",
    nome: "Fernanda",
    email: "fernanda@poracred.com",
    senha: "lais123",
    role: "user",
  },
  {
    id: "5",
    nome: "Ana",
    email: "ana@poracred.com",
    senha: "ana123",
    role: "user",
  },
  {
    id: "6",
    nome: "Patricia",
    email: "patricia@poracred.com",
    senha: "patricia123",
    role: "user",
  },
  {
    id: "7",
    nome: "Marcos",
    email: "marcos@poracred.com",
    senha: "marcos123",
    role: "admin",
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  const [users] = useState<User[]>(usuariosPredefinidos);
  const [loading, setLoading] = useState(true);

  // Inicialização única
  useEffect(() => {
    // Simular verificação inicial
    setTimeout(() => {
      setLoading(false);
    }, 100);
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      const user = users.find((u: User) => u.email === email && u.senha === senha);

      if (user) {
        // Atualizar estado
        const newAuthState = {
          user,
          isAuthenticated: true,
        };
        
        setAuthState(newAuthState);
        
        // Salvar no localStorage
        localStorage.setItem("auth", JSON.stringify(newAuthState));
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
    });
    localStorage.removeItem("auth");
    window.location.href = "/login";
  };

  // Carregar estado do localStorage apenas uma vez
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem("auth");
      if (savedAuth) {
        const parsedAuth = JSON.parse(savedAuth);
        setAuthState(parsedAuth);
      }
    } catch (error) {
      console.error("Erro ao carregar auth do localStorage:", error);
    }
  }, []);

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    users,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}

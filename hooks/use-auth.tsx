"use client";

import type React from "react";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    role: "admin", // ← ADMINISTRADOR
  },
  {
    id: "2",
    nome: "Amanda",
    email: "amanda@poracred.com",
    senha: "amanda123",
    role: "user", // ← VOLTOU PARA USER
  },
  {
    id: "3",
    nome: "Adriana",
    email: "adriana@poracred.com",
    senha: "adriana123",
    role: "user",
  },
  {
    id: "4",
    nome: "Lais",
    email: "lais@poracred.com",
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
    nome: "Mariele",
    email: "mariele@poracred.com",
    senha: "mariele123",
    role: "user",
  },
  {
    id: "7",
    nome: "Rodrigo",
    email: "rodrigo@poracred.com",
    senha: "rodrigo123",
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
  const router = useRouter();
  const [now, setNow] = useState<Date | null>(null);

  // Verificar se o usuário já está logado ao carregar a página
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Sincronizar papel do usuário salvo com a lista de usuários
        const userFromList = usuariosPredefinidos.find(u => u.email === user.email);
        if (!userFromList) {
          // Usuário não existe mais, forçar logout
          localStorage.removeItem("user");
          setAuthState({ user: null, isAuthenticated: false });
          if (typeof window !== "undefined") {
            router.push("/login");
          }
        } else if (userFromList.role !== user.role) {
          // Papel mudou, atualizar localStorage e estado
          setAuthState({ user: userFromList, isAuthenticated: true });
          localStorage.setItem("user", JSON.stringify(userFromList));
        } else {
          setAuthState({ user, isAuthenticated: true });
        }
      } catch (error) {
        localStorage.removeItem("user");
        setAuthState({ user: null, isAuthenticated: false });
        if (typeof window !== "undefined") {
          router.push("/login");
        }
      }
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000); // Atualizar a cada minuto

    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    // Simular um atraso de rede
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("Tentativa de login:", { email, senha });
    console.log("Usuários disponíveis:", users);

    const user = users.find((u) => u.email === email && u.senha === senha);

    console.log("Usuário encontrado:", user);

    if (user) {
      setAuthState({
        user,
        isAuthenticated: true,
      });
      localStorage.setItem("user", JSON.stringify(user));
      console.log("Login bem-sucedido para:", user.nome);
      return true;
    }

    console.log("Login falhou - usuário não encontrado");
    return false;
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
    });
    localStorage.removeItem("user");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        users,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}

"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export function ProtectedLayout({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    console.log("ProtectedLayout:", { loading, isAuthenticated, user, pathname });
    
    if (!loading) {
      if (!isAuthenticated && pathname !== "/login" && pathname !== "/login-simple" && pathname !== "/test-login") {
        console.log("Usuário não autenticado, redirecionando para /login");
        if (typeof window !== "undefined") {
          router.push("/login");
        }
        return;
      }
      
      if (isAuthenticated) {
        // Verificar se é uma página que requer admin
        if (adminOnly && user?.role !== "admin") {
          console.warn("Usuário sem permissão de admin tentou acessar:", pathname);
          if (typeof window !== "undefined") {
            router.push("/dashboard");
          }
          return;
        }
        
        setIsAuthorized(true);
      }
    }
  }, [isAuthenticated, user, adminOnly, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Permitir acesso a páginas de login mesmo sem autenticação
  if (pathname === "/login" || pathname === "/login-simple" || pathname === "/test-login") {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Redirecionando...</p>
        </div>
      </div>
    );
  }

  if (adminOnly && user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta página.</p>
          <button 
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

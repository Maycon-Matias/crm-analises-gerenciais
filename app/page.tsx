"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && pathname !== "/dashboard") {
        router.push("/dashboard");
      } else if (!isAuthenticated && pathname !== "/login") {
        router.push("/login");
      }
    }
  }, [isAuthenticated, loading, router, pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Porã Cred</h1>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}

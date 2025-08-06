"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

const pathMap: Record<string, string> = {
  dashboard: "Dashboard",
  clientes: "Clientes",
  novo: "Novo Cliente",
  editar: "Editar Cliente",
  admin: "Administração",
  analytics: "Analytics",
  metas: "Metas",
  comissoes: "Comissões",
  configuracoes: "Configurações",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      {/* Logo Porã Cred */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">PC</span>
        </div>
        <span className="text-sm font-medium text-foreground">Porã Cred</span>
      </div>
      
      {segments.length > 0 && (
        <>
          <ChevronRight className="h-4 w-4" />
          <Link
            href="/dashboard"
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
          
          {segments.map((segment: any, index: number) => {
            const isLast = index === segments.length - 1;
            const href = `/${segments.slice(0, index + 1).join("/")}`;
            const label = pathMap[segment] || segment;

            return (
              <div key={segment} className="flex items-center">
                <ChevronRight className="h-4 w-4 mx-1" />
                {isLast ? (
                  <span className="font-medium text-foreground">{label}</span>
                ) : (
                  <Link
                    href={href}
                    className="hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                )}
              </div>
            );
          })}
        </>
      )}
    </nav>
  );
} 
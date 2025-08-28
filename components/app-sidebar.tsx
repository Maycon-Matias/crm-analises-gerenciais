"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Users,
  BarChart3,
  Home,
  Target,
  DollarSign,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Bell,
  Activity,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useClientes } from "@/hooks/use-clientes";

// Menu base para todos os usuários
const baseMenuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    badge: null,
  },
  {
    title: "Novo Cliente",
    href: "/clientes/novo",
    icon: UserPlus,
    badge: null,
  },
];

// Menu específico para vendedores
const vendedorMenuItems = [
  {
    title: "Meus Clientes",
    href: "/clientes",
    icon: Users,
    badge: null,
  },
  {
    title: "Minhas Metas",
    href: "/minhas-metas",
    icon: Target,
    badge: null,
  },
];

// Menu específico para administradores
const adminMenuItems = [
  {
    title: "Todos os Clientes",
    href: "/admin/clientes",
    icon: Users,
    badge: null,
  },
  {
    title: "Previsões de Pagamento",
    href: "/previsoes-pagamento",
    icon: Calendar,
    badge: null,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    badge: null,
  },
  {
    title: "Gerenciar Metas",
    href: "/analytics/metas",
    icon: Target,
    badge: null,
  },
  {
    title: "Comissões",
    href: "/analytics/comissoes",
    icon: DollarSign,
    badge: null,
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    badge: null,
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { clientes } = useClientes();

  const clientesPendentes = clientes.filter(
    (c) => c.status === "pendente",
  ).length;

  const isAdmin = user?.role === "admin";

  const updatedMenuItems = useMemo(() => {
    if (isAdmin) {
      // Menu completo para administradores
      return [
        ...baseMenuItems,
        ...adminMenuItems,
      ];
    } else {
      // Menu para vendedores
      return [
        ...baseMenuItems,
        ...vendedorMenuItems,
      ];
    }
  }, [isAdmin]);

  return (
    <TooltipProvider>
      <div
        className={`flex flex-col h-full bg-background border-r transition-all duration-300 ease-in-out ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PC</span>
              </div>
              <span className="logo-text text-xl font-bold">CRM</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 hover:bg-primary/10"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 overflow-auto">
          <div className="space-y-1 py-4">
            {updatedMenuItems.map((item, index) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              const menuItem = (
                <Link href={item.href}>
                  <div
                    className={`w-full flex items-center justify-start h-10 rounded-md transition-all duration-200 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 border border-transparent relative group ${
                      isActive
                        ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                        : "hover:bg-accent hover:text-accent-foreground"
                    } ${collapsed ? "px-2 justify-center" : "px-3"}`}
                  >
                    <Icon
                      className={`h-4 w-4 transition-all duration-200 ${
                        collapsed ? "" : "mr-3"
                      } ${isActive ? "text-primary" : ""} group-hover:scale-110`}
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.title}</span>
                        {item.badge && item.badge > 0 && (
                          <Badge
                            variant="destructive"
                            className="ml-auto h-5 px-1.5 text-xs animate-pulse"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                    )}
                  </div>
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      {menuItem}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <div key={item.href}>
                  {menuItem}
                </div>
              );
            })}
            

          </div>
        </div>

        {/* Quick Stats */}
        {!collapsed && (
          <div className="p-4 border-t bg-muted/20">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Pendentes</span>
                <Badge variant="secondary" className="text-xs">
                  {clientesPendentes}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">{clientes.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t bg-background">
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={logout}
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}

"use client";

import type React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { NotificationSystem } from "./notification-system";
import { ThemeToggle } from "./theme-toggle";
import { Breadcrumb } from "./breadcrumb";
import { useAuth } from "@/hooks/use-auth";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb />
          </div>

          <div className="flex items-center gap-2">
            <NotificationSystem />
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {user.nome?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-medium">{user.nome}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.role === "admin" ? "Administrador" : "Vendedor"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

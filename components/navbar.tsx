"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isAdmin = user?.role === "admin";

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      name: "Cadastrar Cliente",
      href: "/clientes/novo",
      active: pathname === "/clientes/novo",
    },
  ];

  // Itens de navegação apenas para administradores
  const adminNavItems = [
    {
      name: "Todos os Clientes",
      href: "/admin/clientes",
      active: pathname === "/admin/clientes",
    },
    {
      name: "Analytics",
      href: "/analytics",
      active: pathname.startsWith("/analytics"),
    },
  ];

  return (
    <header className="border-b bg-white">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg">
            <span className="logo-text text-2xl">Porã Cred</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  item.active ? "text-primary" : "text-gray-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {isAdmin &&
              adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    item.active ? "text-primary" : "text-gray-600"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Olá, <span className="font-medium">{user?.nome}</span>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}

"use client";

import { CheckCircle, AlertTriangle } from "lucide-react";

interface SimpleStatusProps {
  clientes: any[];
  users: any[];
  isLoading?: boolean;
}

export function SimpleStatus({
  clientes,
  users,
  isLoading = false,
}: SimpleStatusProps) {
  const totalClientes = clientes.length;
  const totalUsers = users.length;

  // Determinar status
  const getStatus = () => {
    if (isLoading) return { icon: AlertTriangle, color: "text-orange-500", message: "Carregando..." };
    if (totalClientes === 0) return { icon: AlertTriangle, color: "text-red-500", message: "Sem clientes" };
    if (totalUsers === 0) return { icon: AlertTriangle, color: "text-red-500", message: "Sem usuários" };
    return { icon: CheckCircle, color: "text-green-500", message: "OK" };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-full bg-white shadow-lg border ${status.color}`}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{status.message}</span>
        <span className="text-xs opacity-75">({totalClientes} clientes, {totalUsers} users)</span>
      </div>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";

interface DebugPanelProps {
  clientes: any[];
  users: any[];
  metas: any[];
  regrasComissao: any[];
  isLoading?: boolean;
}

export function DebugPanel({
  clientes,
  users,
  metas,
  regrasComissao,
  isLoading = false,
}: DebugPanelProps) {
  const totalClientes = clientes.length;
  const clientesPagos = clientes.filter(c => c.status === "pago").length;
  const totalUsers = users.length;

  // Determinar status do sistema
  const getSystemStatus = () => {
    if (isLoading) return { status: "loading", message: "Carregando...", color: "text-orange-600" };
    if (totalClientes === 0) return { status: "error", message: "Nenhum cliente encontrado", color: "text-red-600" };
    if (totalUsers === 0) return { status: "error", message: "Nenhum usuário encontrado", color: "text-red-600" };
    return { status: "success", message: "Sistema funcionando", color: "text-green-600" };
  };

  const systemStatus = getSystemStatus();

  return (
    <Card className="border-gray-200 bg-gray-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Info className="h-4 w-4" />
          Status do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status Principal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {systemStatus.status === "loading" && <AlertTriangle className="h-4 w-4 text-orange-600" />}
            {systemStatus.status === "error" && <AlertTriangle className="h-4 w-4 text-red-600" />}
            {systemStatus.status === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
            <span className={`text-sm font-medium ${systemStatus.color}`}>
              {systemStatus.message}
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            {new Date().toLocaleTimeString("pt-BR")}
          </Badge>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{totalClientes}</div>
            <div className="text-xs text-gray-500">Clientes</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{clientesPagos}</div>
            <div className="text-xs text-gray-500">Pagos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{totalUsers}</div>
            <div className="text-xs text-gray-500">Usuários</div>
          </div>
        </div>

        {/* Informações Adicionais */}
        {systemStatus.status === "success" && (
          <div className="text-xs text-gray-500 pt-2 border-t">
            <div className="flex justify-between">
              <span>Metas: {metas.length}</span>
              <span>Regras: {regrasComissao.length}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

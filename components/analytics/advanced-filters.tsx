"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, RefreshCw, Calendar, User, Package, Tag } from "lucide-react";

interface AdvancedFiltersProps {
  periodo: string;
  mes: string;
  ano: number;
  vendedor: string;
  produto: string;
  status: string;
  onPeriodoChange: (value: string) => void;
  onMesChange: (value: string) => void;
  onAnoChange: (value: number) => void;
  onVendedorChange: (value: string) => void;
  onProdutoChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
  vendedores: string[];
  produtos: string[];
  statusOptions: string[];
  isLoading?: boolean;
}

export function AdvancedFilters({
  periodo,
  mes,
  ano,
  vendedor,
  produto,
  status,
  onPeriodoChange,
  onMesChange,
  onAnoChange,
  onVendedorChange,
  onProdutoChange,
  onStatusChange,
  onClearFilters,
  vendedores,
  produtos,
  statusOptions,
  isLoading = false,
}: AdvancedFiltersProps) {
  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const anos = [2023, 2024, 2025];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500"
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Limpar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Período
            </label>
            <Select
              value={periodo}
              onValueChange={onPeriodoChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="quinzenal">Quinzenal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Mês
            </label>
            <Select
              value={mes}
              onValueChange={onMesChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {meses.map((mesOption) => (
                  <SelectItem key={mesOption} value={mesOption}>
                    {mesOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Ano
            </label>
            <Select
              value={ano.toString()}
              onValueChange={(value) => onAnoChange(Number(value))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {anos.map((anoOption) => (
                  <SelectItem key={anoOption} value={anoOption.toString()}>
                    {anoOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-1">
              <User className="h-3 w-3" />
              Vendedor
            </label>
            <Select
              value={vendedor}
              onValueChange={onVendedorChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {vendedores.map((vendedorOption) => (
                  <SelectItem key={vendedorOption} value={vendedorOption}>
                    {vendedorOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-1">
              <Package className="h-3 w-3" />
              Produto
            </label>
            <Select
              value={produto}
              onValueChange={onProdutoChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {produtos.map((produtoOption) => (
                  <SelectItem key={produtoOption} value={produtoOption}>
                    {produtoOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Status
            </label>
            <Select
              value={status}
              onValueChange={onStatusChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {statusOptions.map((statusOption) => (
                  <SelectItem key={statusOption} value={statusOption}>
                    {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

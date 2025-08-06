"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

interface CSVImportWizardProps {
  onImport: (dados: any[]) => void;
  onCancel: () => void;
}

export function CSVImportWizard({ onImport, onCancel }: CSVImportWizardProps) {
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapeamento, setMapeamento] = useState<Record<string, string>>({});
  const [etapa, setEtapa] = useState<"upload" | "mapeamento" | "preview">(
    "upload",
  );

  // Campos do sistema (apenas essenciais nesta fase)
  const camposSistema = [
    { id: "cliente", nome: "Nome do Cliente", obrigatorio: true },
    { id: "produto", nome: "Produto", obrigatorio: true },
    { id: "banco", nome: "Banco", obrigatorio: true },
    { id: "fonte", nome: "Fonte", obrigatorio: true },
    { id: "valor", nome: "Valor", obrigatorio: true },
    { id: "data", nome: "Data", obrigatorio: true },
    { id: "mes", nome: "Mês", obrigatorio: false },
    { id: "usuarios", nome: "Usuário", obrigatorio: false },
    // Os campos abaixo são ignorados nesta fase, mas já previstos para futura expansão:
    // { id: "status_pagamento", nome: "Status do Pagamento", obrigatorio: false },
    // { id: "data_pagamento", nome: "Data de Pagamento", obrigatorio: false },
    // { id: "mes_pagamento", nome: "Mês de Pagamento", obrigatorio: false },
    // { id: "entrante", nome: "Entrante", obrigatorio: false },
  ];

  // Campos que devem ser ignorados (dados internos/administrativos)
  const camposIgnorados = [
    "id_interno",
    "codigo_sistema",
    "hash",
    "timestamp_criacao",
    "usuario_criacao",
    "ip_origem",
    "sessao_id",
    "log_alteracoes",
    "status_interno",
    "flag_processamento",
    "metadata",
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      reader.onload = (e) => {
        let parsedData: string[][] = [];
        if (fileExt === "xlsx") {
          // Leitura de XLSX
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        } else {
          // Leitura de CSV
          const csv = e.target?.result as string;
          const lines = csv.split("\n").filter((line) => line.trim());
          parsedData = lines.map((line) =>
            line.split(",").map((cell) => cell.trim().replace(/"/g, "")),
          );
        }
        if (parsedData.length > 0) {
          setHeaders(parsedData[0]);
          setCsvData(parsedData.slice(1));
          setEtapa("mapeamento");
        }
      };
      if (fileExt === "xlsx") {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  const handleMapeamento = (csvHeader: string, campoSistema: string) => {
    setMapeamento((prev) => ({
      ...prev,
      [csvHeader]: campoSistema,
    }));
  };

  const processarImportacao = () => {
    const dadosProcessados = csvData.map((row) => {
      const objeto: any = {};

      headers.forEach((header, index) => {
        const campoMapeado = mapeamento[header];
        if (campoMapeado && campoMapeado !== "ignorar") {
          objeto[campoMapeado] = row[index] || "";
        }
      });

      // Adicionar campos padrão
      objeto.id = crypto.randomUUID();
      objeto.status = "pendente";
      objeto.mes = new Date((objeto.data || Date.now()) + 'T00:00:00').toLocaleDateString(
        "pt-BR",
        { month: "long" },
      );

      return objeto;
    });

    onImport(dadosProcessados);
  };

  const getCampoStatus = (header: string) => {
    const mapeado = mapeamento[header];
    if (!mapeado) return "pendente";
    if (mapeado === "ignorar") return "ignorado";
    return "mapeado";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "mapeado":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "ignorado":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Assistente de Importação CSV</CardTitle>
        <CardDescription>
          Importe dados de clientes de forma inteligente, separando informações
          relevantes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {etapa === "upload" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <h3 className="font-medium mb-2">Selecione o arquivo CSV</h3>
              <p className="text-sm text-muted-foreground mb-4">
                O sistema irá identificar automaticamente os campos e sugerir
                mapeamentos
              </p>
              <Input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileUpload}
                className="max-w-xs mx-auto"
              />
            </div>
          </div>
        )}

        {etapa === "mapeamento" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-4">Mapeamento de Campos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Associe os campos do CSV aos campos do sistema. Campos
                administrativos serão automaticamente ignorados.
              </p>
            </div>

            <div className="grid gap-4">
              {headers.map((header, index) => {
                const isIgnorado = camposIgnorados.some((campo) =>
                  header.toLowerCase().includes(campo.toLowerCase()),
                );
                const status = getCampoStatus(header);

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(status)}
                      <div>
                        <p className="font-medium">{header}</p>
                        {isIgnorado && (
                          <Badge variant="secondary" className="mt-1">
                            Campo administrativo detectado
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="w-64">
                      <Select
                        value={
                          mapeamento[header] || (isIgnorado ? "ignorar" : "")
                        }
                        onValueChange={(value) =>
                          handleMapeamento(header, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o campo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ignorar">Ignorar campo</SelectItem>
                          <Separator />
                          {camposSistema.map((campo) => (
                            <SelectItem key={campo.id} value={campo.id}>
                              {campo.nome} {campo.obrigatorio && "*"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setEtapa("upload")}>
                Voltar
              </Button>
              <Button onClick={() => setEtapa("preview")}>
                Visualizar Importação
              </Button>
            </div>
          </div>
        )}

        {etapa === "preview" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Preview da Importação</h3>
              <p className="text-sm text-muted-foreground">
                {csvData.length} registros serão importados
              </p>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted p-4">
                <div className="grid grid-cols-4 gap-4 font-medium">
                  <div>Cliente</div>
                  <div>Produto</div>
                  <div>Banco</div>
                  <div>Valor</div>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {csvData.slice(0, 5).map((row, index) => (
                  <div
                    key={index}
                    className="p-4 border-b grid grid-cols-4 gap-4"
                  >
                    <div>
                      {row[
                        headers.findIndex((h) => mapeamento[h] === "cliente")
                      ] || "-"}
                    </div>
                    <div>
                      {row[
                        headers.findIndex((h) => mapeamento[h] === "produto")
                      ] || "-"}
                    </div>
                    <div>
                      {row[
                        headers.findIndex((h) => mapeamento[h] === "banco")
                      ] || "-"}
                    </div>
                    <div>
                      {row[
                        headers.findIndex((h) => mapeamento[h] === "valor")
                      ] || "-"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setEtapa("mapeamento")}>
                Voltar
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button onClick={processarImportacao}>
                  Importar {csvData.length} Registros
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

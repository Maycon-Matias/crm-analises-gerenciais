"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useClientes } from "@/hooks/use-clientes";
import { useAnalytics } from "@/hooks/use-analytics";
import { DebugPanel } from "@/components/analytics/debug-panel";

export default function TesteAnalyticsPage() {
  const { users } = useAuth();
  const { clientes } = useClientes();
  const { metas, regrasComissao } = useAnalytics();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Teste Analytics</h1>
      
      <DebugPanel 
        clientes={clientes}
        users={users}
        metas={metas}
        regrasComissao={regrasComissao}
        isLoading={isLoading}
      />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(clientes.slice(0, 3), null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(users, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metas</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(metas, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regras de Comissão</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(regrasComissao, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Button 
          onClick={() => {
            console.log("Clientes:", clientes);
            console.log("Users:", users);
            console.log("Metas:", metas);
            console.log("Regras:", regrasComissao);
          }}
        >
          Log no Console
        </Button>
      </div>
    </div>
  );
}

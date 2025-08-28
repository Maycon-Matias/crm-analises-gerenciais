"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export default function TesteRedirecionamentoPage() {
  const [result, setResult] = useState("");
  const { login, users, isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("🔄 TesteRedirecionamento - Estado mudou:", { isAuthenticated, user, loading });
  }, [isAuthenticated, user, loading]);

  const testarLoginVendedor = async () => {
    setResult("Testando login de vendedor...");
    
    try {
      const success = await login("amanda@poracred.com", "amanda123");
      
      if (success) {
        setResult("✅ Login bem-sucedido! Aguardando redirecionamento...");
        
        // Aguardar um pouco para o estado ser atualizado
        setTimeout(() => {
          console.log("🔄 Estado após login:", { isAuthenticated, user });
          
          if (isAuthenticated && user) {
            setResult("✅ Usuário autenticado! Tentando redirecionar...");
            
            // Tentar redirecionar usando router
            setTimeout(() => {
              console.log("🔄 Redirecionando com router...");
              router.push("/dashboard");
            }, 1000);
          } else {
            setResult("⚠️ Login bem-sucedido mas estado não foi atualizado");
          }
        }, 1000);
      } else {
        setResult("❌ Login falhou!");
      }
    } catch (error) {
      setResult(`❌ Erro: ${error}`);
    }
  };

  const testarRedirecionamentoDireto = () => {
    setResult("Testando redirecionamento direto...");
    
    setTimeout(() => {
      console.log("🔄 Redirecionamento direto para dashboard...");
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard";
      }
    }, 1000);
  };

  const testarRouter = () => {
    setResult("Testando router.push...");
    
    setTimeout(() => {
      console.log("🔄 Usando router.push para dashboard...");
      router.push("/dashboard");
    }, 1000);
  };

  const limparEstado = () => {
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Teste de Redirecionamento</h1>
          <p className="mt-2 text-gray-600">Verificando problemas de redirecionamento</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Estado Atual */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Estado Atual</h2>
            
            <div className="p-4 bg-blue-100 rounded">
              <strong>Autenticação:</strong>
              <div className="mt-2 space-y-1 text-sm">
                <div>Loading: {loading ? "Sim" : "Não"}</div>
                <div>Autenticado: {isAuthenticated ? "Sim" : "Não"}</div>
                <div>Usuário: {user ? user.nome : "Nenhum"}</div>
                <div>Role: {user ? user.role : "N/A"}</div>
              </div>
            </div>

            <div className="p-4 bg-yellow-100 rounded">
              <strong>localStorage:</strong>
              <div className="mt-2 text-sm">
                <pre className="whitespace-pre-wrap">
                  {typeof window !== 'undefined' ? localStorage.getItem('user') || 'null' : 'N/A'}
                </pre>
              </div>
            </div>
          </div>

          {/* Testes */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Testes</h2>
            
            <div className="space-y-2">
              <button
                onClick={testarLoginVendedor}
                className="w-full p-3 bg-green-500 text-white rounded hover:bg-green-600"
              >
                🔐 Testar Login Vendedor
              </button>
              
              <button
                onClick={testarRedirecionamentoDireto}
                className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                🚀 Redirecionamento Direto
              </button>
              
              <button
                onClick={testarRouter}
                className="w-full p-3 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                📍 Usar Router.push
              </button>
              
              <button
                onClick={limparEstado}
                className="w-full p-3 bg-red-500 text-white rounded hover:bg-red-600"
              >
                🗑️ Limpar Estado
              </button>
            </div>

            <div className="p-4 bg-gray-100 rounded">
              <strong>Resultado:</strong> {result}
            </div>
          </div>
        </div>

        {/* Usuários Disponíveis */}
        <div className="mt-8">
          <h3 className="font-semibold mb-4">Usuários Disponíveis:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <div key={user.id} className="p-4 bg-white border rounded">
                <div className="font-semibold">{user.nome}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
                <div className="text-xs text-gray-500">Role: {user.role}</div>
                <div className="text-xs text-gray-500">Senha: {user.senha}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Debug Console */}
        <div className="mt-8 text-center">
          <h3 className="font-semibold mb-4">Debug Console:</h3>
          <p className="text-sm text-gray-600">Abra o console do navegador (F12) para ver logs detalhados</p>
          <button
            onClick={() => {
              console.log("🔍 Estado completo:", { isAuthenticated, user, loading });
              console.log("🔍 localStorage:", localStorage.getItem('user'));
              console.log("🔍 Router:", router);
            }}
            className="mt-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Log Estado no Console
          </button>
        </div>
      </div>
    </div>
  );
}

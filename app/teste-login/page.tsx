"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function TesteLoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [result, setResult] = useState("");
  const { login, users, isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    console.log("🔄 Estado da autenticação mudou:", { isAuthenticated, user, loading });
  }, [isAuthenticated, user, loading]);

  const handleLogin = async () => {
    setResult("Testando login...");
    
    try {
      console.log("🔐 Tentativa de login iniciada");
      console.log("📧 Email:", email);
      console.log("🔑 Senha:", senha);
      
      const success = await login(email, senha);
      console.log("✅ Resultado do login:", success);
      
      if (success) {
        setResult("✅ Login bem-sucedido! Verificando redirecionamento...");
        
        // Aguardar um pouco para o estado ser atualizado
        setTimeout(() => {
          console.log("🔄 Verificando estado após login...");
          console.log("📍 Estado atual:", { isAuthenticated, user });
          
          if (isAuthenticated && user) {
            setResult("✅ Usuário autenticado com sucesso! Redirecionando...");
            
            // Tentar redirecionar
            setTimeout(() => {
              console.log("🔄 Tentando redirecionar para dashboard...");
              if (typeof window !== "undefined") {
                window.location.href = "/dashboard";
              }
            }, 1000);
          } else {
            setResult("⚠️ Login bem-sucedido mas estado não foi atualizado");
          }
        }, 1000);
      } else {
        setResult("❌ Login falhou! Verifique email e senha.");
      }
    } catch (error) {
      console.error("❌ Erro no login:", error);
      setResult(`❌ Erro: ${error}`);
    }
  };

  const testUser = (testEmail: string, testSenha: string) => {
    setEmail(testEmail);
    setSenha(testSenha);
    setResult("Usuário de teste preenchido. Clique em 'Entrar' para testar.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Teste de Login - Debug Completo</h1>
          <p className="mt-2 text-gray-600">Teste de autenticação com debug detalhado</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Login */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Formulário de Login</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Digite o email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Senha:</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Digite a senha"
              />
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Entrar
            </button>
            
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <strong>Resultado:</strong> {result}
            </div>
          </div>

          {/* Informações de Debug */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Estado da Autenticação</h2>
            
            <div className="p-4 bg-yellow-100 rounded">
              <strong>Estado Atual:</strong>
              <div className="mt-2 space-y-1 text-sm">
                <div>Loading: {loading ? "Sim" : "Não"}</div>
                <div>Autenticado: {isAuthenticated ? "Sim" : "Não"}</div>
                <div>Usuário: {user ? user.nome : "Nenhum"}</div>
                <div>Role: {user ? user.role : "N/A"}</div>
              </div>
            </div>

            <div className="p-4 bg-blue-100 rounded">
              <strong>localStorage:</strong>
              <div className="mt-2 text-sm">
                <pre className="whitespace-pre-wrap">
                  {typeof window !== 'undefined' ? localStorage.getItem('user') || 'null' : 'N/A'}
                </pre>
              </div>
            </div>

            <div className="p-4 bg-green-100 rounded">
              <strong>Console Logs:</strong>
              <p className="text-sm">Abra o console do navegador (F12) para ver logs detalhados</p>
            </div>
          </div>
        </div>

        {/* Usuários de Teste */}
        <div className="mt-8">
          <h3 className="font-semibold mb-4">Usuários de Teste (Clique para preencher):</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <div 
                key={user.id} 
                className="p-4 bg-white border rounded cursor-pointer hover:bg-gray-50"
                onClick={() => testUser(user.email, user.senha)}
              >
                <div className="font-semibold">{user.nome}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
                <div className="text-xs text-gray-500">Role: {user.role}</div>
                <div className="text-xs text-gray-500">Senha: {user.senha}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Botões de Teste */}
        <div className="mt-8 text-center">
          <h3 className="font-semibold mb-4">Testes Rápidos:</h3>
          <div className="space-x-4">
            <button
              onClick={() => testUser("admin@poracred.com", "admin123")}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Testar Admin
            </button>
            <button
              onClick={() => testUser("amanda@poracred.com", "amanda123")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Testar Vendedor
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('user');
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Limpar localStorage
            </button>
            <button
              onClick={() => {
                console.log("🔍 Estado atual completo:", { isAuthenticated, user, loading });
                console.log("🔍 localStorage:", localStorage.getItem('user'));
              }}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Log Estado
            </button>
          </div>
        </div>

        {/* Teste de Redirecionamento */}
        <div className="mt-8 text-center">
          <h3 className="font-semibold mb-4">Teste de Redirecionamento:</h3>
          <div className="space-x-4">
            <button
              onClick={() => {
                console.log("🔄 Testando redirecionamento para dashboard...");
                if (typeof window !== "undefined") {
                  window.location.href = "/dashboard";
                }
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Ir para Dashboard
            </button>
            <button
              onClick={() => {
                console.log("🔄 Testando redirecionamento para login...");
                if (typeof window !== "undefined") {
                  window.location.href = "/login";
                }
              }}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Ir para Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

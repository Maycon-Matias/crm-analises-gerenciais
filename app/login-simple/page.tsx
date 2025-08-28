"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function LoginSimplePage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [result, setResult] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const { login, users, isAuthenticated, user } = useAuth();

  // Debug: mostrar estado atual
  useEffect(() => {
    setDebugInfo(`
      Estado atual:
      - isAuthenticated: ${isAuthenticated}
      - user: ${user ? JSON.stringify(user) : 'null'}
      - localStorage user: ${typeof window !== 'undefined' ? localStorage.getItem('user') || 'null' : 'N/A'}
    `);
  }, [isAuthenticated, user]);

  const handleLogin = async () => {
    setResult("Testando login...");
    setDebugInfo("Iniciando processo de login...");
    
    try {
      console.log("🔐 Tentativa de login iniciada");
      console.log("📧 Email:", email);
      console.log("🔑 Senha:", senha);
      
      const success = await login(email, senha);
      console.log("✅ Resultado do login:", success);
      
      if (success) {
        setResult("✅ Login bem-sucedido! Redirecionando...");
        setDebugInfo("Login bem-sucedido, aguardando redirecionamento...");
        
        // Aguardar um pouco para o estado ser atualizado
        setTimeout(() => {
          console.log("🔄 Redirecionando para dashboard...");
          console.log("📍 Estado atual:", { isAuthenticated, user });
          
          if (typeof window !== "undefined") {
            window.location.href = "/dashboard";
          }
        }, 1500);
      } else {
        setResult("❌ Login falhou! Verifique email e senha.");
        setDebugInfo("Login falhou - usuário não encontrado ou credenciais incorretas");
      }
    } catch (error) {
      console.error("❌ Erro no login:", error);
      setResult(`❌ Erro: ${error}`);
      setDebugInfo(`Erro capturado: ${error}`);
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
          <h1 className="text-3xl font-bold">Login Simples - Debug</h1>
          <p className="mt-2 text-gray-600">Teste de autenticação com informações de debug</p>
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
            <h2 className="text-xl font-semibold">Informações de Debug</h2>
            
            <div className="p-4 bg-yellow-100 rounded">
              <strong>Estado da Autenticação:</strong>
              <pre className="mt-2 text-sm whitespace-pre-wrap">{debugInfo}</pre>
            </div>

            <div className="p-4 bg-blue-100 rounded">
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
          </div>
        </div>
      </div>
    </div>
  );
} 
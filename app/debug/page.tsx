"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useClientes } from "@/hooks/use-clientes";
import { useAnalytics } from "@/hooks/use-analytics";

export default function DebugPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [result, setResult] = useState("");
  const { login, users, user, isAuthenticated, loading } = useAuth();
  const { clientes } = useClientes();
  const { metas } = useAnalytics();

  const handleLogin = async () => {
    setResult("Testando login...");
    
    try {
      const success = await login(email, senha);
      if (success) {
        setResult("✅ Login bem-sucedido!");
      } else {
        setResult("❌ Login falhou!");
      }
    } catch (error) {
      setResult(`❌ Erro: ${error}`);
    }
  };

  const testarDashboard = () => {
    try {
      // Simular acesso ao dashboard
      const isAdmin = user?.role === "admin";
      const clientesFiltrados = isAdmin
        ? clientes
        : clientes.filter((c) => c.criadoPor === user?.id);
      
      setResult(`✅ Dashboard funcionando! Usuário: ${user?.nome}, Role: ${user?.role}, Clientes: ${clientesFiltrados.length}`);
    } catch (error) {
      setResult(`❌ Erro no dashboard: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug - Sistema CRM</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Seção de Login */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Teste de Login</h2>
            
            <div className="space-y-4">
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
                Testar Login
              </button>
              
              <button
                onClick={testarDashboard}
                className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
              >
                Testar Dashboard
              </button>
            </div>
            
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <strong>Resultado:</strong> {result}
            </div>
          </div>

          {/* Seção de Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Status do Sistema</h2>
            
            <div className="space-y-3 text-sm">
              <div>
                <strong>Loading:</strong> {loading ? "Sim" : "Não"}
              </div>
              <div>
                <strong>Autenticado:</strong> {isAuthenticated ? "Sim" : "Não"}
              </div>
              <div>
                <strong>Usuário:</strong> {user?.nome || "Nenhum"}
              </div>
              <div>
                <strong>Role:</strong> {user?.role || "Nenhum"}
              </div>
              <div>
                <strong>Total de Clientes:</strong> {clientes.length}
              </div>
              <div>
                <strong>Total de Metas:</strong> {metas.length}
              </div>
            </div>
          </div>

          {/* Lista de Usuários */}
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Usuários Disponíveis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <div key={user.id} className="p-4 border rounded">
                  <div className="font-semibold">{user.nome}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  <div className="text-sm text-gray-500">Role: {user.role}</div>
                  <div className="text-sm text-gray-500">Senha: {user.senha}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
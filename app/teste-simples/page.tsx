"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function TesteSimplesPage() {
  const [email, setEmail] = useState("amanda@poracred.com");
  const [senha, setSenha] = useState("amanda123");
  const [result, setResult] = useState("");
  const { login, users, isAuthenticated, user, loading } = useAuth();

  const handleLogin = async () => {
    setResult("🔄 Testando login...");
    
    try {
      console.log("=== TESTE SIMPLES DE LOGIN ===");
      console.log("Email:", email);
      console.log("Senha:", senha);
      console.log("Loading antes:", loading);
      console.log("isAuthenticated antes:", isAuthenticated);
      console.log("user antes:", user);
      
      const success = await login(email, senha);
      
      console.log("Resultado do login:", success);
      setResult(`✅ Login retornou: ${success}`);
      
      // Aguardar um pouco e verificar estado
      setTimeout(() => {
        console.log("=== ESTADO APÓS LOGIN ===");
        console.log("Loading depois:", loading);
        console.log("isAuthenticated depois:", isAuthenticated);
        console.log("user depois:", user);
        console.log("localStorage:", localStorage.getItem('user'));
        
        setResult(`Estado após login:
          Loading: ${loading}
          isAuthenticated: ${isAuthenticated}
          user: ${user ? user.nome : 'null'}
          localStorage: ${localStorage.getItem('user')}
        `);
      }, 1000);
      
    } catch (error) {
      console.error("Erro no login:", error);
      setResult(`❌ Erro: ${error}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">🧪 Teste Simples de Login</h1>
          <p className="mt-2 text-gray-600">Teste básico para verificar se o login funciona</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="Digite o email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Senha:</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="Digite a senha"
              />
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              🔐 Testar Login
            </button>
            
            <div className="p-4 bg-gray-100 rounded-lg">
              <strong>Resultado:</strong>
              <pre className="mt-2 text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="font-semibold mb-4">Estado Atual:</h3>
          <div className="space-y-2 text-sm">
            <div><strong>Loading:</strong> {loading ? "Sim" : "Não"}</div>
            <div><strong>Autenticado:</strong> {isAuthenticated ? "Sim" : "Não"}</div>
            <div><strong>Usuário:</strong> {user ? user.nome : "Nenhum"}</div>
            <div><strong>Role:</strong> {user ? user.role : "N/A"}</div>
            <div><strong>localStorage:</strong> {typeof window !== 'undefined' ? localStorage.getItem('user') || 'null' : 'N/A'}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="font-semibold mb-4">Usuários Disponíveis:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users?.map((user) => (
              <div key={user.id} className="p-3 bg-gray-50 rounded border">
                <div className="font-semibold">{user.nome}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
                <div className="text-xs text-gray-500">Role: {user.role}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">Abra o console do navegador (F12) para ver logs detalhados</p>
        </div>
      </div>
    </div>
  );
} 
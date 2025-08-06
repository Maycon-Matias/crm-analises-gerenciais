"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function LoginSimplePage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [result, setResult] = useState("");
  const { login, users } = useAuth();

  const handleLogin = async () => {
    setResult("Testando login...");
    
    try {
      const success = await login(email, senha);
      if (success) {
        setResult("✅ Login bem-sucedido! Redirecionando...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        setResult("❌ Login falhou! Verifique email e senha.");
      }
    } catch (error) {
      setResult(`❌ Erro: ${error}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Login Simples</h1>
          <p className="mt-2 text-gray-600">Teste de autenticação</p>
        </div>

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
            Entrar
          </button>
          
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <strong>Resultado:</strong> {result}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-semibold mb-2">Usuários disponíveis:</h3>
          <div className="space-y-1 text-sm">
            {users.map((user) => (
              <div key={user.id} className="p-2 bg-white border rounded">
                <strong>{user.nome}</strong> - {user.email} ({user.role})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
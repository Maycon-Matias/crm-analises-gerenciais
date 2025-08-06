"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function TestLoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [result, setResult] = useState("");
  const { login, users } = useAuth();

  const handleTest = async () => {
    setResult("Testando...");
    
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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Login</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Usuários disponíveis:</h2>
        <ul className="space-y-1">
          {users.map((user) => (
            <li key={user.id} className="text-sm">
              {user.nome} - {user.email} - {user.role}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="Digite o email"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Senha:</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="Digite a senha"
          />
        </div>
        
        <button
          onClick={handleTest}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Testar Login
        </button>
        
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <strong>Resultado:</strong> {result}
        </div>
      </div>
    </div>
  );
} 
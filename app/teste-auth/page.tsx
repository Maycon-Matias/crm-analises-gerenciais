"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function TesteAuthPage() {
  const [status, setStatus] = useState("Carregando...");
  const { user, isAuthenticated, loading, users } = useAuth();

  useEffect(() => {
    setStatus(`Loading: ${loading}, Auth: ${isAuthenticated}, User: ${user?.nome || 'Nenhum'}`);
  }, [loading, isAuthenticated, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Teste de Autenticação</h1>
        <div className="mb-4 p-4 bg-white rounded shadow">
          <p><strong>Status:</strong> {status}</p>
          <p><strong>Loading:</strong> {loading ? "Sim" : "Não"}</p>
          <p><strong>Autenticado:</strong> {isAuthenticated ? "Sim" : "Não"}</p>
          <p><strong>Usuário:</strong> {user?.nome || "Nenhum"}</p>
          <p><strong>Role:</strong> {user?.role || "Nenhum"}</p>
        </div>
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Usuários Disponíveis:</h2>
          <div className="text-left">
            {users.map((u) => (
              <div key={u.id} className="text-sm mb-1">
                {u.nome} - {u.email} ({u.role})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
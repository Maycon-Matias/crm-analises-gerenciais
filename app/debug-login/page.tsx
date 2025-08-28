"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function DebugLoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [result, setResult] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const { login, users, isAuthenticated, user, loading } = useAuth();

  // Debug: mostrar estado atual
  useEffect(() => {
    const info = `
      🔍 DEBUG INFO:
      
      Loading: ${loading}
      isAuthenticated: ${isAuthenticated}
      user: ${user ? JSON.stringify(user, null, 2) : 'null'}
      users.length: ${users?.length || 0}
      localStorage: ${typeof window !== 'undefined' ? localStorage.getItem('user') || 'null' : 'N/A'}
      
      📧 Email digitado: ${email}
      🔑 Senha digitada: ${senha}
    `;
    setDebugInfo(info);
  }, [loading, isAuthenticated, user, users, email, senha]);

  const handleLogin = async () => {
    setResult("🔄 Iniciando login...");
    
    try {
      // Log inicial
      console.log("=== INÍCIO DO LOGIN ===");
      console.log("Email:", email);
      console.log("Senha:", senha);
      console.log("Usuários disponíveis:", users);
      
      setResult("🔐 Chamando função login...");
      
      const success = await login(email, senha);
      
      console.log("Resultado do login:", success);
      setResult(`✅ Login retornou: ${success}`);
      
      // Aguardar um pouco e verificar estado
      setTimeout(() => {
        console.log("=== ESTADO APÓS LOGIN ===");
        console.log("isAuthenticated:", isAuthenticated);
        console.log("user:", user);
        console.log("localStorage:", localStorage.getItem('user'));
        
        setResult(`Estado após login:
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

  const testarCredenciais = () => {
    console.log("=== TESTANDO CREDENCIAIS ===");
    console.log("Email:", email);
    console.log("Senha:", senha);
    
    const userEncontrado = users.find(u => u.email === email && u.senha === senha);
    console.log("Usuário encontrado:", userEncontrado);
    
    if (userEncontrado) {
      setResult(`✅ Usuário encontrado: ${userEncontrado.nome} (${userEncontrado.role})`);
    } else {
      setResult("❌ Usuário não encontrado");
    }
  };

  const limparTudo = () => {
    localStorage.removeItem('user');
    setEmail("");
    setSenha("");
    setResult("");
    window.location.reload();
  };

  const preencherVendedor = () => {
    setEmail("amanda@poracred.com");
    setSenha("amanda123");
    setResult("✅ Credenciais de vendedor preenchidas");
  };

  const preencherAdmin = () => {
    setEmail("admin@poracred.com");
    setSenha("admin123");
    setResult("✅ Credenciais de admin preenchidas");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-6xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600">🚨 DEBUG LOGIN 🚨</h1>
          <p className="mt-2 text-gray-600">Página de debug para identificar problemas de login</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Formulário de Login</h2>
            
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
            
            <div className="space-y-2">
              <button
                onClick={handleLogin}
                className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                🔐 Tentar Login
              </button>
              
              <button
                onClick={testarCredenciais}
                className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                🔍 Testar Credenciais
              </button>
            </div>
            
            <div className="p-4 bg-gray-100 rounded-lg">
              <strong>Resultado:</strong>
              <pre className="mt-2 text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          </div>

          {/* Debug Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Informações de Debug</h2>
            
            <div className="p-4 bg-yellow-100 rounded-lg">
              <strong>Estado da Autenticação:</strong>
              <pre className="mt-2 text-sm whitespace-pre-wrap">{debugInfo}</pre>
            </div>

            <div className="p-4 bg-blue-100 rounded-lg">
              <strong>Console Logs:</strong>
              <p className="text-sm">Abra o console do navegador (F12) para ver logs detalhados</p>
            </div>
          </div>
        </div>

        {/* Botões de Teste */}
        <div className="text-center space-y-4">
          <h3 className="font-semibold">Testes Rápidos:</h3>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={preencherVendedor}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              👤 Preencher Vendedor (Amanda)
            </button>
            
            <button
              onClick={preencherAdmin}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              👑 Preencher Admin (Maycon)
            </button>
            
            <button
              onClick={limparTudo}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              🗑️ Limpar Tudo
            </button>
          </div>
        </div>

        {/* Usuários Disponíveis */}
        <div className="mt-8">
          <h3 className="font-semibold mb-4 text-center">Usuários Disponíveis no Sistema:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {users?.map((user) => (
              <div key={user.id} className="p-4 bg-white border rounded-lg text-center">
                <div className="font-semibold text-lg">{user.nome}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Role: <span className={`font-semibold ${user.role === 'admin' ? 'text-red-600' : 'text-blue-600'}`}>
                    {user.role}
                  </span>
                </div>
                <div className="text-xs text-gray-500">Senha: {user.senha}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Instruções */}
        <div className="mt-8 p-6 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-4 text-center">📋 Instruções para Debug:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Abra o console do navegador (F12 → Console)</li>
            <li>Clique em "Preencher Vendedor" para testar Amanda</li>
            <li>Clique em "Tentar Login"</li>
            <li>Observe os logs no console e na tela</li>
            <li>Me informe o que aparece para eu corrigir</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

export default function DebugBasicoPage() {
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    const info = `
      🔍 DEBUG BÁSICO:
      
      ✅ Página carregou
      ✅ React está funcionando
      ✅ useEffect executou
      
      🌐 Navegador: ${typeof window !== 'undefined' ? 'Disponível' : 'Não disponível'}
      📱 User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}
      
      💾 localStorage disponível: ${typeof localStorage !== 'undefined' ? 'Sim' : 'Não'}
      📝 localStorage user: ${typeof localStorage !== 'undefined' ? localStorage.getItem('user') || 'null' : 'N/A'}
      
      🕐 Timestamp: ${new Date().toISOString()}
    `;
    setDebugInfo(info);
    
    console.log("=== DEBUG BÁSICO ===");
    console.log("Página carregou com sucesso");
    console.log("localStorage disponível:", typeof localStorage !== 'undefined');
    console.log("localStorage user:", localStorage.getItem('user'));
  }, []);

  const testarLocalStorage = () => {
    try {
      localStorage.setItem('teste', 'funcionando');
      const valor = localStorage.getItem('teste');
      localStorage.removeItem('teste');
      
      setDebugInfo(prev => prev + `\n\n✅ localStorage funcionando: ${valor === 'funcionando'}`);
      console.log("localStorage funcionando:", valor === 'funcionando');
    } catch (error) {
      setDebugInfo(prev => prev + `\n\n❌ localStorage com erro: ${error}`);
      console.error("localStorage com erro:", error);
    }
  };

  const limparLocalStorage = () => {
    try {
      localStorage.removeItem('user');
      setDebugInfo(prev => prev + '\n\n🗑️ localStorage limpo');
      console.log("localStorage limpo");
    } catch (error) {
      setDebugInfo(prev => prev + `\n\n❌ Erro ao limpar: ${error}`);
      console.error("Erro ao limpar:", error);
    }
  };

  const testarJSON = () => {
    try {
      const teste = { nome: "Teste", valor: 123 };
      const json = JSON.stringify(teste);
      const parseado = JSON.parse(json);
      
      setDebugInfo(prev => prev + `\n\n✅ JSON funcionando: ${parseado.nome === "Teste"}`);
      console.log("JSON funcionando:", parseado);
    } catch (error) {
      setDebugInfo(prev => prev + `\n\n❌ JSON com erro: ${error}`);
      console.error("JSON com erro:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-4xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600">🔍 DEBUG BÁSICO</h1>
          <p className="mt-2 text-gray-600">Verificação básica do ambiente</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Informações de Debug:</h2>
          <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded">{debugInfo}</pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Testes:</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testarLocalStorage}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              🧪 Testar localStorage
            </button>
            
            <button
              onClick={limparLocalStorage}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              🗑️ Limpar localStorage
            </button>
            
            <button
              onClick={testarJSON}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              📝 Testar JSON
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              🔄 Recarregar Página
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Console:</h2>
          <p className="text-sm text-gray-600">Abra o console do navegador (F12) para ver logs detalhados</p>
          <p className="text-sm text-gray-600 mt-2">Se não aparecer nada no console, há um problema com o JavaScript</p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Se esta página carregar, o problema está na lógica de autenticação, não no React
          </p>
        </div>
      </div>
    </div>
  );
}


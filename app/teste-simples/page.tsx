"use client";

import { useState } from "react";

export default function TesteSimplesPage() {
  const [contador, setContador] = useState(0);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Teste Simples</h1>
        <p className="mb-4">Se você consegue ver esta página, o React está funcionando.</p>
        <button 
          onClick={() => setContador(contador + 1)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Clicou {contador} vezes
        </button>
      </div>
    </div>
  );
} 
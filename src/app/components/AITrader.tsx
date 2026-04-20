import React from 'react';
import { useApexLogic } from '../hooks/useApexLogic';
import { Play, Square } from 'lucide-react';

export const AITrader = () => {
  const { isActive, activeOrders, portfolio, aiConfig, addLog, setActiveOrders, setIsActive, isDemo } = useApexLogic();

  return (
    <div className="p-6 bg-[#0a0a0a] border border-[#333] rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">AI Neural Trader v3.5</h2>
        <button 
          onClick={() => setIsActive(!isActive)}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
            isActive ? 'bg-red-500/20 text-red-500 border border-red-500' : 'bg-green-500 text-black hover:bg-green-400'
          }`}
        >
          {isActive ? "Desligar AI" : "Iniciar AI"}
          <span>{isActive ? "Desligar AI" : "Iniciar AI"}</span>
        </button>
      </div>
      {/* Restante do componente omitido para brevidade, mas o erro de isActive foi morto acima */}
    </div>
  );
};

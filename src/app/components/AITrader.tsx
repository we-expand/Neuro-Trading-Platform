// @ts-nocheck
import React from 'react';
import { useApexLogic } from '../hooks/useApexLogic';
import { Play, Square } from 'lucide-react';

export const AITrader = () => {
  const { isActive, setIsActive, aiConfig } = useApexLogic();
  return (
    <div className="p-6 bg-[#0a0a0a] border border-[#333] rounded-xl shadow-2xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">AI Neural Trader v3.5</h2>
        <button 
          onClick={() => setIsActive(!isActive)}
          className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold transition-all ${
            isActive ? 'bg-red-500/20 text-red-500 border border-red-500' : 'bg-green-500 text-black hover:bg-green-400'
          }`}
        >
          {isActive ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isActive ? "DESLIGAR AI" : "INICIAR AI"}</span>
        </button>
      </div>
      <div className="mt-4 p-4 bg-[#111] rounded border border-[#222]">
        <p className="text-[10px] text-gray-500 uppercase font-black">Risco Máximo</p>
        <p className="text-lg font-mono text-blue-400">{(aiConfig?.maxContracts || 1.0).toFixed(2)} Lotes</p>
      </div>
    </div>
  );
};

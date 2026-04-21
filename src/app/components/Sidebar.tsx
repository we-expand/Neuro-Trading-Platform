// @ts-nocheck
import React from 'react';
import { LayoutDashboard, Wallet, BarChart2, Zap, Settings, Database, ShieldAlert } from 'lucide-react';

export const Sidebar = () => {
  return (
    <div className="w-64 bg-[#050505] border-r border-[#222] flex flex-col h-screen shrink-0">
      <div className="p-6 border-b border-[#222]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">N</div>
          <h1 className="text-lg font-black tracking-tighter text-white">NEURAL <span className="text-blue-500 text-[10px] block font-normal tracking-widest mt-[-4px]">DAY TRADER</span></h1>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <div className="flex items-center gap-3 p-3 text-blue-500 bg-blue-500/10 rounded-lg cursor-pointer"><LayoutDashboard size={20}/> <span className="font-bold text-sm">Dashboard</span></div>
        <div className="flex items-center gap-3 p-3 text-gray-500 hover:text-white cursor-pointer"><BarChart2 size={20}/> <span className="font-bold text-sm">Gráfico</span></div>
        <div className="flex items-center gap-3 p-3 text-gray-500 hover:text-white cursor-pointer"><Zap size={20}/> <span className="font-bold text-sm">AI Trader</span></div>
      </nav>
      <div className="p-4 border-t border-[#222]">
        <div className="flex items-center gap-3 p-3 text-gray-600"><ShieldAlert size={16}/> <span className="text-xs uppercase font-bold tracking-widest">System Online</span></div>
      </div>
    </div>
  );
};

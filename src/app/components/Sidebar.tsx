import React from 'react';
import { LayoutDashboard, Wallet, LineChart, Bot, TrendingUp, Settings, Sparkles, ShieldCheck, Compass, ShoppingBag, Users, Layers, BarChart3, Scale, Rocket, MessageSquare, Brain, Beaker, Mic, Zap } from 'lucide-react';
import { NeuralLogo } from './NeuralLogo';

type View = 'dashboard' | 'wallet' | 'funds' | 'assets' | 'chart' | 'ai-trader' | 'performance' | 'settings' | 'system' | 'dev-lab' | 'innovation' | 'strategy' | 'store' | 'partners' | 'prop-challenge' | 'social' | 'pyramiding' | 'competitive-analysis' | 'quantum-analysis' | 'ai-voice' | 'live-trading-test' | 'admin' | 'compliance-analysis' | 'launch-strategy' | 'trader-insights';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isAdmin?: boolean;
  onLogout?: () => void;
}

const menuItems = [
  { id: 'dashboard' as View, label: 'Dashboard',       icon: LayoutDashboard },
  { id: 'wallet'    as View, label: 'Carteira',         icon: Wallet },
  { id: 'chart'     as View, label: 'Gráfico',          icon: LineChart },
  { id: 'ai-trader' as View, label: 'AI Trader',        icon: Bot },
  { id: 'ai-voice'  as View, label: 'AI Trader Voice',  icon: Mic },
  { id: 'innovation'as View, label: 'IA Preditiva',     icon: Sparkles },
  { id: 'performance'as View,label: 'Performance',      icon: TrendingUp },
  { id: 'store'     as View, label: 'Marketplace',      icon: ShoppingBag },
  { id: 'partners'  as View, label: 'Parceiros',        icon: Users },
  { id: 'settings'  as View, label: 'Configurações',    icon: Settings },
];

const adminItems = [
  { id: 'dev-lab'              as View, label: 'DEV LAB',              icon: Beaker,       color: 'hover:text-indigo-400',  active: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { id: 'admin'                as View, label: 'Admin',                icon: ShieldCheck,  color: 'hover:text-purple-400',  active: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { id: 'strategy'             as View, label: 'Estratégia',           icon: Compass,      color: 'hover:text-cyan-300',    active: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  { id: 'pyramiding'           as View, label: 'Pyramiding',           icon: Layers,       color: 'hover:text-amber-400',   active: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { id: 'competitive-analysis' as View, label: 'Análise Competitiva',  icon: BarChart3,    color: 'hover:text-orange-400',  active: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { id: 'compliance-analysis'  as View, label: 'Compliance Legal',     icon: Scale,        color: 'hover:text-blue-400',    active: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { id: 'launch-strategy'      as View, label: 'Estratégia Lançamento',icon: Rocket,       color: 'hover:text-green-400',   active: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { id: 'trader-insights'      as View, label: 'Insights Traders',     icon: MessageSquare,color: 'hover:text-pink-400',    active: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  { id: 'quantum-analysis'     as View, label: 'Análise Quântica',     icon: Brain,        color: 'hover:text-gray-400',    active: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  { id: 'live-trading-test'    as View, label: 'Trading ao Vivo',      icon: Zap,          color: 'hover:text-red-400',     active: 'bg-red-500/10 text-red-400 border-red-500/20' },
];

export function Sidebar({ currentView, onViewChange, isAdmin }: SidebarProps) {
  return (
    <aside id="app-sidebar" className="w-16 bg-black border-r border-white/5 flex flex-col h-screen font-sans items-center">

      {/* Logo */}
      <div
        className="py-4 border-b border-white/5 w-full flex justify-center cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => onViewChange('dashboard')}
        title="Dashboard"
      >
        <NeuralLogo className="!w-9" />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 flex flex-col items-center gap-1 overflow-y-auto w-full px-2">
        {menuItems.map(({ id, label, icon: Icon }) => {
          const isActive = currentView === id;
          return (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              title={label}
              className={`w-full flex justify-center items-center p-3 rounded-xl transition-all duration-200 border border-transparent group ${
                isActive
                  ? 'bg-white/10 border-white/5 shadow-lg shadow-emerald-500/5'
                  : 'hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-colors ${
                isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-white'
              }`} />
            </button>
          );
        })}

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="w-8 border-t border-white/10 my-2" />
            {adminItems.map(({ id, label, icon: Icon, color, active }) => {
              const isActive = currentView === id;
              return (
                <button
                  key={id}
                  onClick={() => onViewChange(id)}
                  title={label}
                  className={`w-full flex justify-center items-center p-3 rounded-xl transition-all duration-200 border border-transparent group ${
                    isActive ? active : `text-slate-500 hover:bg-white/5 ${color}`
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0 transition-colors" />
                </button>
              );
            })}
          </>
        )}
      </nav>
    </aside>
  );
}

// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { init, dispose } from 'klinecharts';
import { useApexLogic } from '../hooks/useApexLogic';

// Exportação Nomeada para casar com o seu App.tsx
export const ChartView = () => {
  const chartContainerRef = useRef(null);
  const chartIdRef = useRef(`chart-${Math.random().toString(36).substr(2, 9)}`);
  const logic = useApexLogic();
  
  // Usamos o símbolo do seu hook, ou um padrão se ele falhar
  const symbol = logic?.selectedSymbol || 'BTCUSD';

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const chartId = chartIdRef.current;
    
    // Limpeza de segurança
    try { dispose(chartId); } catch (_) {}
    
    const chart = init(chartId);
    if (!chart) return;

    // Configuração Visual Premium (Padrão Figma)
    chart.setStyles({
      grid: { show: true, horizontal: { color: '#1a1a1a' }, vertical: { color: '#0d0d0d' } },
      candle: { 
        bar: { upColor: '#22c55e', downColor: '#ef4444' },
        priceMark: { last: { show: true, text: { color: '#fff' } } }
      }
    });

    // Mock de inicialização rápida para visibilidade imediata
    const mockData = [];
    let price = 85000;
    for (let i = 0; i < 100; i++) {
      const close = price + (Math.random() - 0.5) * 200;
      mockData.push({
        timestamp: Date.now() - (100 - i) * 60000,
        open: price, high: Math.max(price, close) + 20,
        low: Math.min(price, close) - 20, close: close, volume: Math.random() * 100
      });
      price = close;
    }
    chart.applyNewData(mockData);

    return () => dispose(chartId);
  }, [symbol]);

  return (
    <div className="w-full bg-[#050505] rounded-xl border border-[#222] overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-[#222] bg-black flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
            Neural Market Engine — {symbol}
          </span>
        </div>
      </div>
      {/* A DIV abaixo é o segredo: height FIXO em 700px para o Canvas aparecer */}
      <div 
        ref={chartContainerRef}
        id={chartIdRef.current}
        style={{ height: '700px', minHeight: '700px', width: '100%', display: 'block' }}
      />
    </div>
  );
};

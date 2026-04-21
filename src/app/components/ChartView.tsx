// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { init, dispose } from 'klinecharts';
import { useApexLogic } from '../hooks/useApexLogic';

export const ChartView = () => {
  const chartContainerRef = useRef(null);
  const chartIdRef = useRef(`chart-${Math.random().toString(36).substr(2, 9)}`);
  const { selectedSymbol } = useApexLogic() || { selectedSymbol: 'BTCUSD' };

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const chartId = chartIdRef.current;
    try { dispose(chartId); } catch (_) {}
    const chart = init(chartId);
    if (!chart) return;
    chart.setStyles({ 
      grid: { show: true, horizontal: { color: '#1a1a1a' } }, 
      candle: { bar: { upColor: '#22c55e', downColor: '#ef4444' } } 
    });
    const mockData = [];
    let price = 85000;
    for (let i = 0; i < 100; i++) {
      const close = price + (Math.random() - 0.5) * 150;
      mockData.push({ timestamp: Date.now() - (100 - i) * 60000, open: price, high: Math.max(price, close) + 20, low: Math.min(price, close) - 20, close, volume: Math.random() * 100 });
      price = close;
    }
    chart.applyNewData(mockData);
    return () => dispose(chartId);
  }, [selectedSymbol]);

  return (
    <div className="w-full bg-[#050505] rounded-xl border border-[#222] overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-[#222] bg-black">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Neural Market Engine: {selectedSymbol || 'BTCUSD'}</span>
      </div>
      <div ref={chartContainerRef} id={chartIdRef.current} style={{ height: '700px', minHeight: '700px', width: '100%', display: 'block' }} />
    </div>
  );
};

// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { init, dispose } from 'klinecharts';
import { useApexLogic } from '../hooks/useApexLogic';

export const ChartView = () => {
  const chartContainerRef = useRef(null);
  const chartIdRef = useRef(`chart-${Math.random().toString(36).substr(2, 9)}`);
  const logic = useApexLogic();
  const symbol = logic?.selectedSymbol || 'BTCUSD';

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const chartId = chartIdRef.current;
    try { dispose(chartId); } catch (_) {}
    const chart = init(chartId);
    if (!chart) return;

    chart.setStyles({
      grid: { show: true, horizontal: { color: '#1a1a1a' }, vertical: { color: '#0d0d0d' } },
      candle: { bar: { upColor: '#22c55e', downColor: '#ef4444' } }
    });

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
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Neural Engine: {symbol}</span>
      </div>
      <div 
        ref={chartContainerRef}
        id={chartIdRef.current}
        style={{ height: '700px', minHeight: '700px', width: '100%', display: 'block' }}
      />
    </div>
  );
};
